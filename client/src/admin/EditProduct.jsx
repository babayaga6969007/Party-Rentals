import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const EditProduct = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [availabilityCount, setAvailabilityCount] = useState(1);

  // Existing images (from DB)
  const [existingImages, setExistingImages] = useState([]);

  // New images
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Load product details
useEffect(() => {
  const loadProduct = async () => {
    try {
      const data = await api(`/products/${id}`);

      setProduct(data);

      setTitle(data.title);
      setPricePerDay(data.pricePerDay);
      setCategory(data.category);
      setDescription(data.description || "");
      setAvailabilityCount(data.availabilityCount || 1);

      setExistingImages(data.images || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load product");
    }
  };

  loadProduct();
}, [id]);


  // Handle new image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  // Remove single existing image
  const removeImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);
    formData.append("pricePerDay", pricePerDay);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("availabilityCount", availabilityCount);

    // Keep remaining existing images
    formData.append("existingImages", JSON.stringify(existingImages));

    // Add new images
    newImages.forEach((img) => {
      formData.append("images", img);
    });

    const token = localStorage.getItem("admin_token");

    await api(`/products/admin/edit/${id}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});


    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Update failed");
      return;
    }

    alert("Product updated successfully!");
    window.location.href = "/admin/products";
  };

  if (!product) {
    return (
      <AdminLayout>
        <p>Loading product...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6">Edit Product</h1>

      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        
        {/* Title */}
        <div>
          <label>Title</label>
          <input
            className="w-full p-3 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Price */}
        <div>
          <label>Price Per Day</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label>Category</label>
          <select
            className="w-full p-3 border rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option>Backdrops</option>
            <option>Tables</option>
            <option>Balloon Stands</option>
            <option>Photo Props</option>
            <option>Furniture</option>
            <option>Lights</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product details, size, color, materials, instructions..."
          />
        </div>

        {/* Stock */}
        <div>
          <label>Stock / Availability Count</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg"
            value={availabilityCount}
            onChange={(e) => setAvailabilityCount(e.target.value)}
            min="1"
            required
          />
        </div>

        {/* Existing Images */}
        <div>
          <label>Current Images</label>

          <div className="grid grid-cols-3 gap-3 mt-2">
            {existingImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.url}
                  alt="existing"
                  className="w-24 h-24 object-cover rounded"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                >
                  ✕
                </button>
              </div>
            ))}

            {existingImages.length === 0 && (
              <p className="text-gray-500">No images remaining.</p>
            )}
          </div>
        </div>

        {/* New Images */}
        <div>
          <label>Upload New Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />

          {newPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {newPreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button className="py-3 px-6 bg-[#8B5C42] text-white rounded-lg">
          Save Changes
        </button>
      </form>
    </AdminLayout>
  );
};

export default EditProduct;
