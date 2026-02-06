import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add category
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("rental");
  const [newImage, setNewImage] = useState(null);
const [preview, setPreview] = useState("");


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
if (!newImage) {
  alert("Category image is required");
  return;
}

    try {
      const token = localStorage.getItem("admin_token");

      const fd = new FormData();
fd.append("name", newName.trim());
fd.append("type", newType);
fd.append("image", newImage); // field name MUST match upload.single("image")

const res = await api("/categories", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: fd,
});

const created = res?.data ?? res;

if (!created || !created._id) {
  console.error("Invalid category response:", res);
  return;
}

setCategories((prev) => [created, ...prev]);


      setNewName("");
      setNewType("rental");
      setNewImage(null);
setPreview("");

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
        <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 3 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 3MB per image.");
      e.target.value = "";
      return;
    }
    setNewImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }}
  className="border border-gray-300 rounded-lg px-4 py-2"
/>


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
                <th className="p-4">Thumbnail</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
{categories
  .filter((cat) => cat && cat._id)
  .map((cat) => (
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
<td className="p-4">
  

  <img
  src={cat.image || "https://via.placeholder.com/48"}
  alt={cat.name}
  className="w-12 h-12 rounded-lg object-cover border"
/>

</td>

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
