import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";

const AdminShippingConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states for new distance range
  const [newRange, setNewRange] = useState({
    minDistance: "",
    maxDistance: "",
    label: "",
    price: "",
  });
  const [editingRange, setEditingRange] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null); // Store original config for cancel

  // Warehouse form states
  const [warehouse, setWarehouse] = useState({
    address: "",
    lat: "",
    lng: "",
  });

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

      const res = await api("/shipping-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.config) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setConfig(res.config);
      setOriginalConfig(JSON.parse(JSON.stringify(res.config))); // Deep copy for cancel
      setWarehouse({
        address: res.config.warehouse?.address || "",
        lat: res.config.warehouse?.lat || "",
        lng: res.config.warehouse?.lng || "",
      });
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

  // Add distance range
  const handleAddRange = async () => {
    if (!newRange.minDistance || !newRange.label || newRange.price === "") {
      toast.error("Please fill in min distance, label, and price");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/shipping-config/admin/distance-ranges", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          minDistance: Number(newRange.minDistance),
          maxDistance: newRange.maxDistance ? Number(newRange.maxDistance) : null,
          label: newRange.label,
          price: Number(newRange.price),
        }),
      });

      setConfig(res.config);
      setNewRange({
        minDistance: "",
        maxDistance: "",
        label: "",
        price: "",
      });
      toast.success("Distance range added successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add distance range");
    }
  };

  // Update distance range
  const handleUpdateRange = async (rangeId) => {
    const range = config.distanceRanges.find(
      (r) => String(r._id) === String(rangeId)
    );
    if (!range) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/shipping-config/admin/distance-ranges/${rangeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          minDistance: range.minDistance,
          maxDistance: range.maxDistance,
          label: range.label,
          price: range.price,
        }),
      });

      setConfig(res.config);
      setOriginalConfig(JSON.parse(JSON.stringify(res.config))); // Update original config
      setEditingRange(null);
      toast.success("Distance range updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update distance range");
    }
  };

  // Cancel editing - restore original config without API call
  const handleCancelEdit = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig))); // Restore original
    }
    setEditingRange(null);
  };

  // Remove distance range
  const handleRemoveRange = async (rangeId) => {
    if (!window.confirm("Remove this distance range?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/shipping-config/admin/distance-ranges/${rangeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfig(res.config);
      toast.success("Distance range removed successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to remove distance range");
    }
  };

  // Update warehouse location
  const handleUpdateWarehouse = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/shipping-config/admin/warehouse", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address: warehouse.address,
          lat: Number(warehouse.lat),
          lng: Number(warehouse.lng),
        }),
      });

      setConfig(res.config);
      toast.success("Warehouse location updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update warehouse location");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !config) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#2D2926] mb-6">
          Shipping Configuration
        </h1>

        {/* Warehouse Location */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Warehouse Location
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={warehouse.address}
                onChange={(e) =>
                  setWarehouse({ ...warehouse, address: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="2031 Via Burton Street, Suite A, USA"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={warehouse.lat}
                  onChange={(e) =>
                    setWarehouse({ ...warehouse, lat: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="34.0522"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={warehouse.lng}
                  onChange={(e) =>
                    setWarehouse({ ...warehouse, lng: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="-118.2437"
                />
              </div>
            </div>
            <button
              onClick={handleUpdateWarehouse}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[#222]"
            >
              Update Warehouse Location
            </button>
          </div>
        </div>

        {/* Distance Ranges */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Distance-Based Pricing
          </h2>

          {/* Add New Range */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-[#2D2926] mb-3">Add New Distance Range</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Distance (miles)</label>
                <input
                  type="number"
                  value={newRange.minDistance}
                  onChange={(e) =>
                    setNewRange({ ...newRange, minDistance: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Distance (miles)</label>
                <input
                  type="number"
                  value={newRange.maxDistance}
                  onChange={(e) =>
                    setNewRange({ ...newRange, maxDistance: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  placeholder="25 (leave empty for unlimited)"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <input
                  type="text"
                  value={newRange.label}
                  onChange={(e) =>
                    setNewRange({ ...newRange, label: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  placeholder="0-25 miles"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRange.price}
                  onChange={(e) =>
                    setNewRange({ ...newRange, price: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  placeholder="35.00"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddRange}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-[#222] text-sm flex items-center justify-center gap-2"
                >
                  <FiPlus /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Existing Ranges */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg text-sm">
              <thead className="bg-[#F5F7FF]">
                <tr>
                  <th className="px-4 py-3 text-left">Min Distance</th>
                  <th className="px-4 py-3 text-left">Max Distance</th>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {config?.distanceRanges
                  ?.sort((a, b) => a.minDistance - b.minDistance)
                  .map((range) => (
                    <tr key={range._id} className="border-t">
                      <td className="px-4 py-3">
                        {editingRange === range._id ? (
                          <input
                            type="number"
                            value={range.minDistance}
                            onChange={(e) => {
                              const updated = config.distanceRanges.map((r) =>
                                String(r._id) === String(range._id)
                                  ? { ...r, minDistance: Number(e.target.value) }
                                  : r
                              );
                              setConfig({ ...config, distanceRanges: updated });
                            }}
                            className="w-20 p-1 border rounded text-sm"
                          />
                        ) : (
                          range.minDistance
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingRange === range._id ? (
                          <input
                            type="number"
                            value={range.maxDistance || ""}
                            onChange={(e) => {
                              const updated = config.distanceRanges.map((r) =>
                                String(r._id) === String(range._id)
                                  ? {
                                      ...r,
                                      maxDistance: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    }
                                  : r
                              );
                              setConfig({ ...config, distanceRanges: updated });
                            }}
                            className="w-20 p-1 border rounded text-sm"
                            placeholder="Unlimited"
                          />
                        ) : (
                          range.maxDistance || "∞"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingRange === range._id ? (
                          <input
                            type="text"
                            value={range.label}
                            onChange={(e) => {
                              const updated = config.distanceRanges.map((r) =>
                                String(r._id) === String(range._id)
                                  ? { ...r, label: e.target.value }
                                  : r
                              );
                              setConfig({ ...config, distanceRanges: updated });
                            }}
                            className="w-full p-1 border rounded text-sm"
                          />
                        ) : (
                          range.label
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingRange === range._id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={range.price}
                            onChange={(e) => {
                              const updated = config.distanceRanges.map((r) =>
                                String(r._id) === String(range._id)
                                  ? { ...r, price: Number(e.target.value) }
                                  : r
                              );
                              setConfig({ ...config, distanceRanges: updated });
                            }}
                            className="w-24 p-1 border rounded text-sm"
                          />
                        ) : (
                          `$${range.price}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingRange === range._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateRange(range._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setOriginalConfig(JSON.parse(JSON.stringify(config))); // Store original before editing
                                setEditingRange(range._id);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleRemoveRange(range._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShippingConfig;
