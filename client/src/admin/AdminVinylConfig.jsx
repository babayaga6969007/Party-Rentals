import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AdminVinylConfig = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sizes, setSizes] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newWidth, setNewWidth] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [addingSize, setAddingSize] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editWidth, setEditWidth] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api("/vinyl-config");
      if (res?.config) {
        setSizes(Array.isArray(res.config.sizes) ? res.config.sizes : []);
      }
    } catch (err) {
      console.error("Vinyl config fetch error:", err);
      setError(err?.message || "Failed to load vinyl configuration");
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  const handleAddSize = async () => {
    const key = newKey.trim();
    const label = newLabel.trim();
    const w = Number(newWidth);
    const h = Number(newHeight);
    const p = newPrice === "" ? NaN : Number(newPrice);
    if (!key || !label || !Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      toast.error("Please fill key, label, width and height (positive numbers).");
      return;
    }
    if (!Number.isFinite(p) || p < 0) {
      toast.error("Please enter a valid price (0 or greater).");
      return;
    }
    try {
      setAddingSize(true);
      await api("/vinyl-config/admin/sizes", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, label, widthInches: w, heightInches: h, price: p }),
      });
      setNewKey("");
      setNewLabel("");
      setNewWidth("");
      setNewHeight("");
      setNewPrice("");
      toast.success("Size added.");
      fetchConfig();
    } catch (err) {
      toast.error(err?.message || "Failed to add size");
    } finally {
      setAddingSize(false);
    }
  };

  const handleUpdateSize = async (sizeId) => {
    const w = Number(editWidth);
    const h = Number(editHeight);
    const p = editPrice === "" ? null : Number(editPrice);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      toast.error("Width and height must be positive numbers.");
      return;
    }
    if (p !== null && (!Number.isFinite(p) || p < 0)) {
      toast.error("Price must be 0 or greater.");
      return;
    }
    try {
      const body = { label: editLabel.trim(), widthInches: w, heightInches: h };
      if (p !== null) body.price = p;
      await api(`/vinyl-config/admin/sizes/${sizeId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      toast.success("Size updated.");
      setEditingId(null);
      fetchConfig();
    } catch (err) {
      toast.error(err?.message || "Failed to update size");
    }
  };

  const handleRemoveSize = async (sizeId) => {
    if (!window.confirm("Remove this size? It will no longer appear in the vinyl addon dropdown.")) return;
    try {
      await api(`/vinyl-config/admin/sizes/${sizeId}`, { method: "DELETE", headers: getAuthHeaders() });
      toast.success("Size removed.");
      fetchConfig();
    } catch (err) {
      toast.error(err?.message || "Failed to remove size");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold text-[#2D2926] mb-2">Vinyl Wrap Config</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage size options for the vinyl wrap addon. Each size has a fixed price; customers choose a size from a dropdown on the product page.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2D2926] mb-3">Vinyl addon sizes</h2>
          <p className="text-sm text-gray-600 mb-4">
            These sizes appear in the dropdown when a customer adds the vinyl wrap addon. Each size has its own price ($).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key (e.g. 2x2)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={"Label (e.g. 2' x 2')"}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={newWidth}
              onChange={(e) => setNewWidth(e.target.value)}
              placeholder="Width (in)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={newHeight}
              onChange={(e) => setNewHeight(e.target.value)}
              placeholder="Height (in)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price ($)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAddSize}
            disabled={addingSize}
            className="mb-6 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {addingSize ? "Adding..." : "Add size"}
          </button>

          {sizes.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Key</th>
                  <th className="text-left py-2 font-medium text-gray-700">Label</th>
                  <th className="text-left py-2 font-medium text-gray-700">Width (in)</th>
                  <th className="text-left py-2 font-medium text-gray-700">Height (in)</th>
                  <th className="text-left py-2 font-medium text-gray-700">Price ($)</th>
                  <th className="text-right py-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">{s.key}</td>
                    <td className="py-2">
                      {editingId === s._id ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full max-w-[100px] border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        s.label
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === s._id ? (
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={editWidth}
                          onChange={(e) => setEditWidth(e.target.value)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        s.widthInches
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === s._id ? (
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        s.heightInches
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === s._id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        `$${Number(s.price ?? 0).toFixed(2)}`
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {editingId === s._id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateSize(s._id)}
                            className="text-black font-medium mr-2 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(s._id);
                              setEditLabel(s.label);
                              setEditWidth(String(s.widthInches));
                              setEditHeight(String(s.heightInches));
                              setEditPrice(String(s.price ?? ""));
                            }}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(s._id)}
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No sizes yet. Add one above to show in the vinyl addon dropdown.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVinylConfig;
