import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { DEFAULT_FONTS, DEFAULT_TEXT_SIZES } from "../context/SignageContext";

const AdminSignageConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [newSize, setNewSize] = useState({
    key: "",
    label: "",
    width: "",
    height: "",
    fontSize: "",
    price: "",
  });
  const [editingSize, setEditingSize] = useState(null);
  
  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(500);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      setCanvasWidth(res.config.canvasWidth || 800);
      setCanvasHeight(res.config.canvasHeight || 500);
    } catch (err) {
      setError("Failed to load configuration");
      console.error(err);
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

  const handleRemoveFont = async (fontId) => {
    if (!window.confirm("Remove this font?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/signage-config/admin/fonts/${fontId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      toast.success("Font removed successfully");
    } catch (err) {
      toast.error("Failed to remove font");
      console.error(err);
    }
  };
  
  const handleUpdateCanvas = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin/canvas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          canvasWidth: Number(canvasWidth),
          canvasHeight: Number(canvasHeight),
        }),
      });
      setConfig(res.config);
      toast.success("Canvas dimensions updated successfully");
    } catch (err) {
      toast.error("Failed to update canvas dimensions");
      console.error(err);
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSize.key || !newSize.label || !newSize.width || !newSize.height || !newSize.fontSize || !newSize.price) {
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
          width: Number(newSize.width),
          height: Number(newSize.height),
          fontSize: Number(newSize.fontSize),
          price: Number(newSize.price),
        }),
      });
      setConfig(res.config);
      setNewSize({ key: "", label: "", width: "", height: "", fontSize: "", price: "" });
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
      if (!editingSize.key || !editingSize.label || !editingSize.width || !editingSize.height || !editingSize.fontSize) {
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
        width: Number(editingSize.width),
        height: Number(editingSize.height),
        fontSize: Number(editingSize.fontSize),
        price: priceValue,
      };
      
      // Validate numeric fields
      if (isNaN(updateData.width) || isNaN(updateData.height) || isNaN(updateData.fontSize)) {
        toast.error("Width, height, and font size must be valid numbers");
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

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Signage Configuration</h1>

        {/* Canvas Dimensions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Canvas Dimensions</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Width (px)</label>
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                min="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (px)</label>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                min="100"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateCanvas}
            className="bg-[#8B5C42] text-white px-4 py-2 rounded-lg hover:bg-[#704A36] transition"
          >
            Update Canvas Dimensions
          </button>
        </div>

        {/* Fonts Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Fonts</h2>
          <p className="text-sm text-gray-500 mb-4">Fonts are managed by the system. You can only remove existing fonts.</p>

          {/* Fonts List */}
          <div className="space-y-2">
            {config?.fonts?.map((font) => (
              <div
                key={font._id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <span className="font-medium">{font.name}</span>
                  <span className="text-gray-500 ml-2">({font.value})</span>
                </div>
                <button
                  onClick={() => handleRemoveFont(font._id)}
                  className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>

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
                <label className="block text-sm font-medium mb-2">Width (px)</label>
                <input
                  type="number"
                  value={newSize.width}
                  onChange={(e) => setNewSize({ ...newSize, width: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (px)</label>
                <input
                  type="number"
                  value={newSize.height}
                  onChange={(e) => setNewSize({ ...newSize, height: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  min="1"
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
              className="mt-4 bg-[#8B5C42] text-white px-4 py-2 rounded-lg hover:bg-[#704A36] transition"
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
                      <label className="block text-sm font-medium mb-2">Width</label>
                      <input
                        type="number"
                        value={editingSize.width}
                        onChange={(e) => setEditingSize({ ...editingSize, width: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Height</label>
                      <input
                        type="number"
                        value={editingSize.height}
                        onChange={(e) => setEditingSize({ ...editingSize, height: e.target.value })}
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
                        className="bg-[#8B5C42] text-white px-4 py-2 rounded-lg hover:bg-[#704A36] transition"
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
                        {size.width} × {size.height}px, {size.fontSize}px font
                      </span>
                      <span className="text-[#8B5C42] font-semibold ml-4">
                        ${size.price || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const editData = { 
                            ...size, 
                            width: String(size.width || ""),
                            height: String(size.height || ""),
                            fontSize: String(size.fontSize || ""),
                            price: size.price !== undefined && size.price !== null ? String(size.price) : "",
                          };
                          console.log("Setting editingSize with price:", editData.price, "from size.price:", size.price);
                          setEditingSize(editData);
                        }}
                        className="text-[#8B5C42] hover:text-[#704A36] text-sm px-3 py-1 rounded-lg hover:bg-[#FFF7F0] transition"
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
