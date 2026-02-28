import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminVinylPrintingConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newMinimum, setNewMinimum] = useState(false);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editKey, setEditKey] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editMinimum, setEditMinimum] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setError("Admin authentication required.");
        setLoading(false);
        toast.error("Please log in to access this page");
        setTimeout(() => navigate("/admin/login"), 1500);
        return;
      }
      const res = await api("/vinyl-printing-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res?.config) {
        setError("Invalid response from server.");
        setLoading(false);
        return;
      }
      setConfig(res.config);
    } catch (err) {
      console.error("Config fetch error:", err);
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to load configuration";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      if (err?.response?.status === 401) {
        localStorage.removeItem("admin_token");
        setTimeout(() => navigate("/admin/login"), 2000);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim() || newPrice === "" || isNaN(Number(newPrice))) {
      toast.error("Key, label, and a valid price are required.");
      return;
    }
    try {
      setAdding(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/vinyl-printing-config/admin/sizes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: newKey.trim(),
          label: newLabel.trim(),
          price: Number(newPrice),
          minimum: newMinimum,
        }),
      });
      setConfig(res.config);
      setNewKey("");
      setNewLabel("");
      setNewPrice("");
      setNewMinimum(false);
      toast.success("Size added.");
    } catch (err) {
      toast.error(err?.response?.data?.error ?? err?.message ?? "Failed to add size");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (size) => {
    setEditingId(size._id);
    setEditKey(size.key);
    setEditLabel(size.label);
    setEditPrice(String(size.price));
    setEditMinimum(!!size.minimum);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateSize = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      const res = await api(`/vinyl-printing-config/admin/sizes/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: editKey.trim(),
          label: editLabel.trim(),
          price: Number(editPrice),
          minimum: editMinimum,
        }),
      });
      setConfig(res.config);
      setEditingId(null);
      toast.success("Size updated.");
    } catch (err) {
      toast.error(err?.response?.data?.error ?? err?.message ?? "Failed to update size");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSize = async (sizeId) => {
    if (!window.confirm("Remove this size? It will no longer appear on the vinyl printing page.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api(`/vinyl-printing-config/admin/sizes/${sizeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.config);
      toast.success("Size removed.");
    } catch (err) {
      toast.error(err?.response?.data?.error ?? err?.message ?? "Failed to remove size");
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
            <p className="text-red-600 mb-2">{error}</p>
            <button onClick={fetchConfig} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const sizes = config?.sizes ?? [];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Vinyl Printing Configuration</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage sizes and prices shown on the Vinyl Printing page. Customers choose a size, upload a file, and add to cart. Orders are stored with this data.
        </p>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add size</h2>
          <form onSubmit={handleAddSize} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key (e.g. 2x2)</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="2x2"
                className="border rounded px-3 py-2 w-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label (e.g. 2&apos; x 2&apos;)</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="2' x 2'"
                className="border rounded px-3 py-2 w-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="95"
                className="border rounded px-3 py-2 w-24"
              />
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={newMinimum}
                onChange={(e) => setNewMinimum(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Minimum applies</span>
            </label>
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60"
            >
              <FiPlus className="w-4 h-4" />
              {adding ? "Adding…" : "Add size"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sizes & prices</h2>
          {sizes.length === 0 ? (
            <p className="text-gray-500">No sizes yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-4">Key</th>
                    <th className="pb-2 pr-4">Label</th>
                    <th className="pb-2 pr-4">Price</th>
                    <th className="pb-2 pr-4">Minimum</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size._id} className="border-b border-gray-100">
                      {editingId === size._id ? (
                        <>
                          <td className="py-2 pr-4">
                            <input
                              value={editKey}
                              onChange={(e) => setEditKey(e.target.value)}
                              className="border rounded px-2 py-1 w-20"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="border rounded px-2 py-1 w-28"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              min="0"
                              step="0.01"
                              className="border rounded px-2 py-1 w-20"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="checkbox"
                              checked={editMinimum}
                              onChange={(e) => setEditMinimum(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={handleUpdateSize}
                              disabled={saving}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Save
                            </button>
                            <button type="button" onClick={cancelEdit} className="text-gray-600 hover:underline">
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 pr-4 font-mono">{size.key}</td>
                          <td className="py-2 pr-4">{size.label}</td>
                          <td className="py-2 pr-4">${size.price}</td>
                          <td className="py-2 pr-4">{size.minimum ? "Yes" : "—"}</td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={() => startEdit(size)}
                              className="text-gray-600 hover:text-black mr-2"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4 inline" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size._id)}
                              className="text-red-600 hover:text-red-700"
                              title="Remove"
                            >
                              <FiTrash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVinylPrintingConfig;
