import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";

const AdminSignageConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [newFont, setNewFont] = useState({ name: "", value: "" });
  const [newSize, setNewSize] = useState({
    key: "",
    label: "",
    width: "",
    height: "",
    fontSize: "",
  });
  const [basePrice, setBasePrice] = useState(0);
  const [editingSize, setEditingSize] = useState(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      setBasePrice(res.config.basePrice || 0);
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

  const handleAddFont = async (e) => {
    e.preventDefault();
    if (!newFont.name || !newFont.value) {
      alert("Please fill in both font name and value");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin/fonts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFont),
      });
      setConfig(res.config);
      setNewFont({ name: "", value: "" });
      alert("Font added successfully");
    } catch (err) {
      alert("Failed to add font");
      console.error(err);
    }
  };

  const handleRemoveFont = async (fontId) => {
    if (!window.confirm("Remove this font?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/signage-config/admin/fonts/${fontId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      alert("Font removed successfully");
    } catch (err) {
      alert("Failed to remove font");
      console.error(err);
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSize.key || !newSize.label || !newSize.width || !newSize.height || !newSize.fontSize) {
      alert("Please fill in all size fields");
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
        }),
      });
      setConfig(res.config);
      setNewSize({ key: "", label: "", width: "", height: "", fontSize: "" });
      alert("Size added successfully");
    } catch (err) {
      alert(err.message || "Failed to add size");
      console.error(err);
    }
  };

  const handleUpdateSize = async (sizeId) => {
    if (!editingSize) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/signage-config/admin/sizes/${sizeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editingSize,
          width: Number(editingSize.width),
          height: Number(editingSize.height),
          fontSize: Number(editingSize.fontSize),
        }),
      });
      setConfig(res.config);
      setEditingSize(null);
      alert("Size updated successfully");
    } catch (err) {
      alert("Failed to update size");
      console.error(err);
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
      alert("Size removed successfully");
    } catch (err) {
      alert("Failed to remove size");
      console.error(err);
    }
  };

  const handleUpdatePrice = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin/price", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ basePrice: Number(basePrice) }),
      });
      setConfig(res.config);
      alert("Price updated successfully");
    } catch (err) {
      alert("Failed to update price");
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

        {/* Base Price */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Base Price</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="border rounded px-3 py-2 w-32"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handleUpdatePrice}
              className="bg-[#8B5C42] text-white px-4 py-2 rounded-lg hover:bg-[#704A36] transition"
            >
              Update Price
            </button>
          </div>
        </div>

        {/* Fonts Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Fonts</h2>

          {/* Add Font Form */}
          <form onSubmit={handleAddFont} className="mb-6 pb-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Font Name</label>
                <input
                  type="text"
                  value={newFont.name}
                  onChange={(e) => setNewFont({ ...newFont, name: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., Dancing Script"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Value (CSS)</label>
                <input
                  type="text"
                  value={newFont.value}
                  onChange={(e) => setNewFont({ ...newFont, value: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., 'Dancing Script', cursive"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-[#8B5C42] text-white px-4 py-2 rounded-lg hover:bg-[#704A36] transition"
            >
              Add Font
            </button>
          </form>

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
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSize({ ...size })}
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
