import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";

const AdminShelvingConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states for Tier A
  const [newTierASize, setNewTierASize] = useState({
    size: "",
    dimensions: "",
    price: "",
  });
  const [editingTierASize, setEditingTierASize] = useState(null);

  // Form states for Tier B
  const [tierBDimensions, setTierBDimensions] = useState("");
  const [tierBPrice, setTierBPrice] = useState("");

  // Form states for Tier C
  const [tierCDimensions, setTierCDimensions] = useState("");
  const [tierCPrice, setTierCPrice] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("admin_token");

      if (!token) {
        setError("Admin authentication required. Please log in again.");
        setLoading(false);
        toast.error("Please log in to access this page");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
        return;
      }

      const res = await api("/shelving-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.config) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setConfig(res.config);
      setTierBDimensions(res.config.tierB?.dimensions || "");
      setTierBPrice(res.config.tierB?.price || "");
      setTierCDimensions(res.config.tierC?.dimensions || "");
      setTierCPrice(res.config.tierC?.price || "");
      setError("");
    } catch (err) {
      console.error("Config fetch error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load configuration";

      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("no token") ||
        err?.response?.status === 401 ||
        err?.response?.status === 400
      ) {
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Redirecting to login...");
        localStorage.removeItem("admin_token");
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Tier A: Add size
  const handleAddTierASize = async () => {
    if (!newTierASize.size || !newTierASize.dimensions || !newTierASize.price) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/shelving-config/admin/tier-a/sizes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTierASize),
      });

      setConfig(res.config);
      setNewTierASize({ size: "", dimensions: "", price: "" });
      toast.success("Tier A size added successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add size");
    }
  };

  // Tier A: Update size
  const handleUpdateTierASize = async (sizeId) => {
    const size = config.tierA.sizes.find((s) => String(s._id) === String(sizeId));
    if (!size) return;

    const updatedSize = {
      size: size.size,
      dimensions: size.dimensions,
      price: size.price,
    };

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/shelving-config/admin/tier-a/sizes/${sizeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedSize),
      });

      setConfig(res.config);
      setEditingTierASize(null);
      toast.success("Size updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update size");
    }
  };

  // Tier A: Remove size
  const handleRemoveTierASize = async (sizeId) => {
    if (!window.confirm("Remove this size?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/shelving-config/admin/tier-a/sizes/${sizeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfig(res.config);
      toast.success("Size removed successfully");
    } catch (err) {
      toast.error("Failed to remove size");
    }
  };

  // Tier B: Update
  const handleUpdateTierB = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/shelving-config/admin/tier-b", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dimensions: tierBDimensions,
          price: tierBPrice,
        }),
      });

      setConfig(res.config);
      toast.success("Tier B updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update Tier B");
    }
  };

  // Tier C: Update
  const handleUpdateTierC = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/shelving-config/admin/tier-c", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dimensions: tierCDimensions,
          price: tierCPrice,
        }),
      });

      setConfig(res.config);
      toast.success("Tier C updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update Tier C");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p>Loading shelving configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !config) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">Error Loading Configuration</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={fetchConfig}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2D2926]">Shelving Configuration</h1>
          <button
            onClick={fetchConfig}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Tier A */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tier A - Multiple Size Options</h2>

          {/* Add new size */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Add New Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder='Size (e.g., 24")'
                value={newTierASize.size}
                onChange={(e) =>
                  setNewTierASize({ ...newTierASize, size: e.target.value })
                }
                className="p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dimensions"
                value={newTierASize.dimensions}
                onChange={(e) =>
                  setNewTierASize({ ...newTierASize, dimensions: e.target.value })
                }
                className="p-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={newTierASize.price}
                onChange={(e) =>
                  setNewTierASize({ ...newTierASize, price: e.target.value })
                }
                className="p-2 border rounded-lg"
                min="0"
                step="1"
              />
              <button
                onClick={handleAddTierASize}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>

          {/* Existing sizes */}
          <div className="space-y-3">
            <h3 className="font-medium mb-3">Existing Sizes</h3>
            {config?.tierA?.sizes?.length === 0 ? (
              <p className="text-gray-500">No sizes configured yet.</p>
            ) : (
              config?.tierA?.sizes?.map((size) => (
                <div
                  key={size._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  {editingTierASize === size._id ? (
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => {
                          const updated = config.tierA.sizes.map((s) =>
                            String(s._id) === String(size._id)
                              ? { ...s, size: e.target.value }
                              : s
                          );
                          setConfig({ ...config, tierA: { sizes: updated } });
                        }}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={size.dimensions}
                        onChange={(e) => {
                          const updated = config.tierA.sizes.map((s) =>
                            String(s._id) === String(size._id)
                              ? { ...s, dimensions: e.target.value }
                              : s
                          );
                          setConfig({ ...config, tierA: { sizes: updated } });
                        }}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) => {
                          const updated = config.tierA.sizes.map((s) =>
                            String(s._id) === String(size._id)
                              ? { ...s, price: Number(e.target.value) }
                              : s
                          );
                          setConfig({ ...config, tierA: { sizes: updated } });
                        }}
                        className="p-2 border rounded-lg"
                        min="0"
                        step="1"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="font-medium">{size.size}</div>
                      <div className="text-sm text-gray-600">{size.dimensions}</div>
                      <div className="text-sm font-semibold text-black">
                        ${size.price}/shelf
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {editingTierASize === size._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateTierASize(size._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTierASize(null);
                            fetchConfig();
                          }}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingTierASize(size._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleRemoveTierASize(size._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tier B */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tier B - Single Option</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dimensions</label>
              <input
                type="text"
                value={tierBDimensions}
                onChange={(e) => setTierBDimensions(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder='43" wide x 11.5" deep x 1.5" thick (including height of front lip)'
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per Shelf ($)</label>
              <input
                type="number"
                value={tierBPrice}
                onChange={(e) => setTierBPrice(e.target.value)}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="1"
              />
            </div>
            <button
              onClick={handleUpdateTierB}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Update Tier B
            </button>
          </div>
        </div>

        {/* Tier C */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tier C - Single Option (Max 1 Shelf)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dimensions</label>
              <input
                type="text"
                value={tierCDimensions}
                onChange={(e) => setTierCDimensions(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder='75" wide x 25" deep x 1.5" thick (including height of front lip)'
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per Shelf ($)</label>
              <input
                type="number"
                value={tierCPrice}
                onChange={(e) => setTierCPrice(e.target.value)}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="1"
              />
            </div>
            <button
              onClick={handleUpdateTierC}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Update Tier C
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShelvingConfig;
