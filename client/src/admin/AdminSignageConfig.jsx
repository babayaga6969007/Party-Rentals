import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { DEFAULT_FONTS, DEFAULT_TEXT_SIZES } from "../context/SignageContext";

const AdminSignageConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [newSize, setNewSize] = useState({
    key: "",
    label: "",
    fontSize: "",
    price: "",
  });
  const [editingSize, setEditingSize] = useState(null);
  const [backgroundSize, setBackgroundSize] = useState({ widthFt: 4, heightFt: 8 });
  const [savingBackground, setSavingBackground] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
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
      
      const res = await api("/signage-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res || !res.config) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }
      
      setConfig(res.config);
      setError(""); // Clear error on success
      setBackgroundSize({
        widthFt: res.config.widthFt ?? 4,
        heightFt: res.config.heightFt ?? 8,
      });
    } catch (err) {
      console.error("Config fetch error:", err);
      const raw = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? "Failed to load configuration";
      const errorMessage = typeof raw === "string" ? raw : JSON.stringify(raw);
      
      // If token is invalid or expired, redirect to login
      const isAuthError =
        err?.response?.status === 401 ||
        err?.response?.status === 400 ||
        (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("invalid token")) ||
        (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("no token"));
      if (isAuthError) {
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Redirecting to login...");
        localStorage.removeItem("admin_token");
        setTimeout(() => navigate("/admin/login"), 2000);
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

  // Debug: Log config changes, especially sizes with prices
  useEffect(() => {
    if (config && config.sizes) {
      console.log("=== CONFIG UPDATED ===");
      console.log("All sizes:", config.sizes);
      config.sizes.forEach(size => {
        console.log(`Size ${size.key} (${size.label}): price = ${size.price} (type: ${typeof size.price})`);
      });
    }
  }, [config]);

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSize.key || !newSize.label || !newSize.fontSize || !newSize.price) {
      toast.error("Please fill in all size fields including price");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin/sizes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSize,
          fontSize: Number(newSize.fontSize),
          price: Number(newSize.price),
        }),
      });
      setConfig(res.config);
      setNewSize({ key: "", label: "", fontSize: "", price: "" });
      toast.success("Size added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add size");
      console.error(err);
    }
  };

  const handleUpdateSize = async (sizeId) => {
    if (!editingSize) return;

    try {
      const token = localStorage.getItem("admin_token");
      
      // Validate required fields first
      if (!editingSize.key || !editingSize.label || !editingSize.fontSize) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Parse price - handle string, number, empty string, null, undefined
      let priceValue = 0;
      if (editingSize.price !== undefined && editingSize.price !== null && editingSize.price !== "") {
        priceValue = Number(editingSize.price);
        if (isNaN(priceValue)) {
          toast.error("Price must be a valid number");
          return;
        }
      }
      
      // Build update data matching the format used in handleAddSize
      const updateData = {
        key: editingSize.key,
        label: editingSize.label,
        fontSize: Number(editingSize.fontSize),
        price: priceValue,
      };
      
      // Validate numeric fields
      if (isNaN(updateData.fontSize)) {
        toast.error("Font size must be a valid number");
        return;
      }
      
      console.log("=== UPDATE SIZE DEBUG ===");
      console.log("editingSize object:", editingSize);
      console.log("editingSize.price raw value:", editingSize.price, "Type:", typeof editingSize.price);
      console.log("Price value after parsing:", priceValue);
      console.log("Full updateData:", updateData);
      console.log("JSON.stringify(updateData):", JSON.stringify(updateData));
      
      const res = await api(`/signage-config/admin/sizes/${sizeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      console.log("=== UPDATE RESPONSE ===");
      console.log("Full response:", res);
      console.log("Response config:", res.config);
      if (res.config && res.config.sizes) {
        const updatedSize = res.config.sizes.find(s => s._id === sizeId);
        console.log("Updated size from response:", updatedSize);
        console.log("Price in updated size:", updatedSize?.price);
      }
      
      // Update local config first
      setConfig(res.config);
      
      // Refresh config to get updated data from server
      await fetchConfig();
      
      // Check the updated config after a brief delay to ensure state has updated
      setTimeout(() => {
        console.log("=== AFTER REFRESH (checking state) ===");
        // This will log in next render cycle
      }, 100);
      
      setEditingSize(null);
      toast.success("Size updated successfully");
    } catch (err) {
      console.error("Update error:", err); // Debug log
      toast.error(err.message || "Failed to update size");
    }
  };

  const handleSaveBackgroundSize = async () => {
    const w = Number(backgroundSize.widthFt);
    const h = Number(backgroundSize.heightFt);
    if (w < 0.5 || h < 0.5 || isNaN(w) || isNaN(h)) {
      toast.error("Width and height must be at least 0.5 ft");
      return;
    }
    try {
      setSavingBackground(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ widthFt: w, heightFt: h }),
      });
      setConfig(res.config);
      setBackgroundSize({ widthFt: w, heightFt: h });
      toast.success("Background size saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save background size");
    } finally {
      setSavingBackground(false);
    }
  };

  const handleRemoveSize = async (sizeId) => {
    if (!window.confirm("Remove this size?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/signage-config/admin/sizes/${sizeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      toast.success("Size removed successfully");
    } catch (err) {
      toast.error("Failed to remove size");
      console.error(err);
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  if (error && !config) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Configuration</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchConfig}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
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
        <h1 className="text-2xl font-bold mb-6">Signage Configuration</h1>

        {/* Background size (physical dimensions in ft) */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Background size (physical)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set the sign dimensions in feet. The preview will use this aspect ratio and text will scale relative to the sign size.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Width (ft)</label>
              <input
                type="number"
                value={backgroundSize.widthFt}
                onChange={(e) => setBackgroundSize((s) => ({ ...s, widthFt: e.target.value }))}
                className="border rounded px-3 py-2 w-24"
                min="0.5"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (ft)</label>
              <input
                type="number"
                value={backgroundSize.heightFt}
                onChange={(e) => setBackgroundSize((s) => ({ ...s, heightFt: e.target.value }))}
                className="border rounded px-3 py-2 w-24"
                min="0.5"
                step="0.5"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveBackgroundSize}
              disabled={savingBackground}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              {savingBackground ? "Saving..." : "Save background size"}
            </button>
          </div>
        </div>

        {/* Sizes Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Text sizes</h2>

          {/* Add Size Form */}
          <form onSubmit={handleAddSize} className="mb-6 pb-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key</label>
                <input
                  type="text"
                  value={newSize.key}
                  onChange={(e) => setNewSize({ ...newSize, key: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., small, medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={newSize.label}
                  onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., Small, Medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Size (px)</label>
                <input
                  type="number"
                  value={newSize.fontSize}
                  onChange={(e) => setNewSize({ ...newSize, fontSize: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input
                  type="number"
                  value={newSize.price}
                  onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Add Size
            </button>
          </form>

          {/* Sizes List */}
          <div className="space-y-2">
            {config?.sizes?.map((size) => (
              <div
                key={size._id}
                className="p-3 border rounded"
              >
                {editingSize?._id === size._id ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Key</label>
                      <input
                        type="text"
                        value={editingSize.key}
                        onChange={(e) => setEditingSize({ ...editingSize, key: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Label</label>
                      <input
                        type="text"
                        value={editingSize.label}
                        onChange={(e) => setEditingSize({ ...editingSize, label: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size</label>
                      <input
                        type="number"
                        value={editingSize.fontSize}
                        onChange={(e) => setEditingSize({ ...editingSize, fontSize: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <input
                        type="number"
                        value={editingSize.price || ""}
                        onChange={(e) => setEditingSize({ ...editingSize, price: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => handleUpdateSize(size._id)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSize(null)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{size.label}</span>
                      <span className="text-gray-500 ml-2">({size.key})</span>
                      <span className="text-gray-500 ml-4">
                        {size.fontSize}px font
                      </span>
                      <span className="text-black font-semibold ml-4">
                        ${size.price || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const editData = { 
                            ...size, 
                            fontSize: String(size.fontSize || ""),
                            price: size.price !== undefined && size.price !== null ? String(size.price) : "",
                          };
                          console.log("Setting editingSize with price:", editData.price, "from size.price:", size.price);
                          setEditingSize(editData);
                        }}
                        className="text-black hover:text-gray-800 text-sm px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveSize(size._id)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSignageConfig;
