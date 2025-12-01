import { useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert("Upload image!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pricePerDay", price);
    formData.append("category", category);
    formData.append("image", image);

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
      if (!res.ok) throw data;

      alert("Product added!");
      window.location.href = "/admin/products";
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6">Add New Product</h1>

      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            className="w-full p-3 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Price per day</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label>Category</label>
          <select
            className="w-full p-3 border rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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

        <div>
          <label>Image</label>
          <input
            type="file"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />

          {preview && (
            <img
              src={preview}
              className="w-40 h-40 mt-4 object-cover rounded"
            />
          )}
        </div>

        <button className="py-3 px-6 bg-[#8B5C42] text-white rounded-lg">
          Add Product
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddProduct;
