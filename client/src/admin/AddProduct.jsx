import { useState } from "react";
import AdminLayout from "./AdminLayout";

const COLOR_OPTIONS = [
  "White",
  "Black",
  "Gold",
  "Silver",
  "Pink",
  "Blue",
  "Green",
  "Red",
  "Brown",
];

const AddProduct = () => {
  const [productType, setProductType] = useState("rental"); // rental | sale

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [pricePerDay, setPricePerDay] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const [availabilityCount, setAvailabilityCount] = useState(1);
  const [colors, setColors] = useState([]);
  const SIZE_OPTIONS = ["Small", "Medium", "Large", "Extra Large"];

  const [size, setSize] = useState("");


  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const toggleColor = (color) => {
    setColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };
  const toggleSize = (size) => {
  setSizes((prev) =>
    prev.includes(size)
      ? prev.filter((s) => s !== size)
      : [...prev, size]
  );
};


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Upload at least one image");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("productType", productType);
    formData.append("availabilityCount", availabilityCount);
    formData.append("colors", JSON.stringify(colors));
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("size", size);


    if (productType === "rental") {
      formData.append("pricePerDay", pricePerDay);
    } else {
      formData.append("salePrice", salePrice);
    }
    

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(
        "http://localhost:5000/api/products/admin/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error adding product");
        return;
      }

      alert("Product added successfully!");
      window.location.href = "/admin/products";
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-8">Add New Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 shadow max-w-5xl space-y-8"
      >
        {/* PRODUCT TYPE */}
        <div>
          <label className="font-medium">Product Type</label>
          <div className="flex gap-4 mt-2">
            {["rental", "sale"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setProductType(type)}
                className={`px-6 py-2 rounded-full border border-gray-400 transition
                  ${
                    productType === type
                      ? "bg-[#8B5C42] text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
              >
                {type === "rental" ? "Rental Product" : "Selling Product"}
              </button>
            ))}
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>Product Title</label>
            <input
              className="w-full p-3 border border-gray-400 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Category</label>
            <select
              className="w-full p-3 border border-gray-400 rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option>Backdrops</option>
              <option>Tables</option>
              <option>Furniture</option>
              <option>Lights</option>
              <option>Photo Props</option>
            </select>
          </div>
        </div>

        {/* PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productType === "rental" ? (
            <div>
              <label>Price Per Day</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-400 rounded-lg"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label>Selling Price</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-400 rounded-lg"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label>Stock / Availability</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-400 rounded-lg"
              value={availabilityCount}
              onChange={(e) => setAvailabilityCount(e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* COLORS */}
        <div>
         {/* COLORS */}
<div>
  <label className="font-medium">Available Colors</label>

  <div className="flex flex-wrap gap-4 mt-3">
    {COLOR_OPTIONS.map((color) => (
      <button
        type="button"
        key={color}
        onClick={() => toggleColor(color)}
        className={`
          flex flex-col items-center gap-2 px-4 py-3 rounded-xl border border-gray-400
          transition-all duration-200
          ${
            colors.includes(color)
              ? "bg-[#8B5C42] text-white scale-105 border border-gray-400"
              : "bg-white hover:bg-gray-100 hover:scale-105"
          }
        `}
      >
        {/* COLOR CIRCLE */}
        <span
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: color.toLowerCase() }}
        />

        {/* COLOR NAME */}
        <span
          className={`
            text-sm font-medium transition-transform
            ${
              colors.includes(color)
                ? "text-white"
                : "text-[#2D2926] group-hover:scale-105"
            }
          `}
        >
          {color}
        </span>
      </button>
    ))}
  </div>
</div>

          {/* SIZES */}
{/* SIZES */}
<div>
  <label className="font-medium">Available Size</label>

  <div className="flex flex-wrap gap-3 mt-3">
    {SIZE_OPTIONS.map((s) => (
      <button
        type="button"
        key={s}
        onClick={() => setSize(s)}
        className={`
          px-5 py-3 rounded-xl border border-gray-400 text-sm font-medium
          transition-all duration-200
          ${
            size === s
              ? "bg-[#8B5C42] text-white scale-105 border-[#8B5C42]"
              : "bg-white hover:bg-gray-100 hover:scale-105"
          }
        `}
      >
        {s}
      </button>
    ))}
  </div>
</div>


        </div>

        {/* DESCRIPTION */}
        <div>
          <label>Description</label>
          <textarea
            rows="4"
            className="w-full p-3  border border-gray-400 rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Size, usage instructions, notes..."
          />
        </div>

        {/* IMAGES */}
        <div>
          <label>Product Images (max 8)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                className="w-full h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button className="w-full py-4 bg-[#8B5C42] text-white rounded-xl text-lg font-medium hover:bg-[#704A36] transition">
          Add Product
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddProduct;
