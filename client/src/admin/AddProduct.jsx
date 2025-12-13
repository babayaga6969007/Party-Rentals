import { useState } from "react";
import AdminLayout from "./AdminLayout";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [availabilityCount, setAvailabilityCount] = useState(1);

  // ⭐ Store multiple images
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pricePerDay", pricePerDay);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("availabilityCount", availabilityCount);

    // ⭐ append all selected images
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch("http://localhost:5000/api/products/admin/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error adding product");
        return;
      }

      alert("Product added successfully!");
      window.location.href = "/admin/products";
    } catch (err) {
      alert("Error uploading product");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6">Add New Product</h1>

      <form className=" space-y-6 max-w-lg" onSubmit={handleSubmit}>
        
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
          <label>Price Per Day (Rs)</label>
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
            <option value="">Select...</option>
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
            placeholder="Product details, size, color, instructions etc."
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
          />
        </div>

        {/* Multiple Images */}
        <div>
          <label>Images (You can upload up to 8 images)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          {/* Preview section */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {previews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt="preview"
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button className="py-3 px-6 bg-[#8B5C42] text-white rounded-lg">
          Add Product
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddProduct;
