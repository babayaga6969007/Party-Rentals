import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "signage", "vinyl-wraps"

  // Add image
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCategory, setNewCategory] = useState("signage");
  const [newImage, setNewImage] = useState(null);
  const [newPreview, setNewPreview] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Edit image
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSubtitle, setEditingSubtitle] = useState("");
  const [editingCategory, setEditingCategory] = useState("signage");
  const [editingImage, setEditingImage] = useState(null);
  const [editingPreview, setEditingPreview] = useState("");
  const [editingOrder, setEditingOrder] = useState(0);
  const [editingIsActive, setEditingIsActive] = useState(true);

  /* =========================
     FETCH IMAGES
  ========================= */
  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const url = filter === "all" 
        ? "/gallery/admin"
        : `/gallery/admin?category=${filter}`;

      const res = await api(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res?.images ?? [];
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLE IMAGE PREVIEW
  ========================= */
  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Maximum size is 3MB per image.");
      e.target.value = "";
      return;
    }
    if (isEdit) {
      setEditingImage(file);
      setEditingPreview(URL.createObjectURL(file));
    } else {
      setNewImage(file);
      setNewPreview(URL.createObjectURL(file));
    }
  };

  /* =========================
     ADD IMAGE
  ========================= */
  const addImage = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!newImage) {
      toast.error("Image is required");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("admin_token");

      const fd = new FormData();
      fd.append("title", newTitle.trim());
      fd.append("subtitle", newSubtitle.trim());
      fd.append("category", newCategory);
      fd.append("order", String(newOrder));
      fd.append("image", newImage);

      const res = await api("/gallery/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      toast.success("Image uploaded successfully");
      setShowAddModal(false);
      resetAddForm();
      fetchImages();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     EDIT IMAGE
  ========================= */
  const startEdit = (image) => {
    setEditingId(image._id);
    setEditingTitle(image.title);
    setEditingSubtitle(image.subtitle || "");
    setEditingCategory(image.category);
    setEditingOrder(image.order || 0);
    setEditingIsActive(image.isActive !== false);
    setEditingImage(null);
    setEditingPreview(image.image?.url || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEditForm();
  };

  const updateImage = async () => {
    if (!editingTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("admin_token");

      const fd = new FormData();
      fd.append("title", editingTitle.trim());
      fd.append("subtitle", editingSubtitle.trim());
      fd.append("category", editingCategory);
      fd.append("order", String(editingOrder));
      fd.append("isActive", String(editingIsActive));

      if (editingImage) {
        fd.append("image", editingImage);
      }

      const res = await api(`/gallery/admin/${editingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      toast.success("Image updated successfully");
      setEditingId(null);
      resetEditForm();
      fetchImages();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update image");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     DELETE IMAGE
  ========================= */
  const deleteImage = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem("admin_token");

      await api(`/gallery/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Image deleted successfully");
      fetchImages();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete image");
    }
  };

  /* =========================
     RESET FORMS
  ========================= */
  const resetAddForm = () => {
    setNewTitle("");
    setNewSubtitle("");
    setNewCategory("signage");
    setNewImage(null);
    setNewPreview("");
    setNewOrder(0);
  };

  const resetEditForm = () => {
    setEditingTitle("");
    setEditingSubtitle("");
    setEditingCategory("signage");
    setEditingImage(null);
    setEditingPreview("");
    setEditingOrder(0);
    setEditingIsActive(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Visual Showcase Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            <FiPlus /> Add Image
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["all", "signage", "vinyl-wraps"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${
                  filter === f
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              {f === "all"
                ? "All"
                : f === "signage"
                ? "Signage"
                : "Vinyl Wraps"}
            </button>
          ))}
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img._id}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={img.image?.url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                  {!img.isActive && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                      Inactive
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{img.title}</h3>
                  {img.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{img.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          img.category === "signage"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }
                      `}
                    >
                      {img.category === "signage" ? "Signage" : "Vinyl Wraps"}
                    </span>
                    <span className="text-xs text-gray-500">Order: {img.order}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEdit(img)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => deleteImage(img._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add New Image</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <FiX />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter subtitle (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="signage">Signage</option>
                    <option value="vinyl-wraps">Vinyl Wraps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {newPreview && (
                    <img
                      src={newPreview}
                      alt="Preview"
                      className="mt-4 w-full max-h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addImage}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Image</h2>
                <button
                  onClick={cancelEdit}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <FiX />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={editingSubtitle}
                    onChange={(e) => setEditingSubtitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="signage">Signage</option>
                    <option value="vinyl-wraps">Vinyl Wraps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={editingOrder}
                    onChange={(e) => setEditingOrder(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingIsActive}
                      onChange={(e) => setEditingIsActive(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image (leave empty to keep current)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {editingPreview && (
                    <img
                      src={editingPreview}
                      alt="Preview"
                      className="mt-4 w-full max-h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateImage}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {uploading ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Gallery;
