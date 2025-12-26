import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add category
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("rental");

  // Edit category
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  /* =========================
     FETCH CATEGORIES
  ========================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await api("/categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res?.data ?? res;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ADD CATEGORY
  ========================= */
  const addCategory = async () => {
    if (!newName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");

      const res = await api("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
        }),
      });

      const created = res?.data ?? res;
      setCategories((prev) => [created, ...prev]);
      setNewName("");
      setNewType("rental");
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  /* =========================
     UPDATE CATEGORY
  ========================= */
  const updateCategory = async (id) => {
    if (!editingName.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");

      const res = await api(`/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingName.trim(),
        }),
      });

      const updated = res?.data ?? res;

      setCategories((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );

      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    }
  };

  /* =========================
     DELETE CATEGORY
  ========================= */
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const token = localStorage.getItem("admin_token");

      await api(`/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-8">Categories</h1>

      {/* ADD CATEGORY */}
      <div className="flex gap-4 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          className="border border-gray-300 rounded-lg px-4 py-2 w-64"
        />

        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="rental">Rental</option>
          <option value="sale">Purchase</option>
        </select>

        <button
          onClick={addCategory}
          className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FiPlus />
          Add Category
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border">
        {loading ? (
          <p className="p-6 text-gray-600">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-gray-600">No categories found</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b last:border-none">
                  <td className="p-4">
                    {editingId === cat._id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>

                  <td className="p-4 capitalize">{cat.type}</td>

                  <td className="p-4 text-right flex justify-end gap-4">
                    <button
                      onClick={() => {
                        if (editingId === cat._id) {
                          updateCategory(cat._id);
                        } else {
                          setEditingId(cat._id);
                          setEditingName(cat.name);
                        }
                      }}
                      className="text-black hover:opacity-70"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="text-red-600 hover:opacity-70"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default Categories;
