import { useEffect, useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";

const Products = () => {
  const [items, setItems] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await api("/products");
      setItems(res.products);
    } catch {
      alert("Error loading products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  
  const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const token = localStorage.getItem("admin_token");

    await api(`/products/admin/delete/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
    alert("Product deleted successfully!");
    loadProducts(); // refresh list
  } catch (err) {
    console.error(err);
    alert(err.message || "Error deleting product");
  }
};


  return (
    <AdminLayout>
      <h1 className=" text-3xl font-semibold mb-6">All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow">
            <img
              src={p.images[0]?.url}
              className="w-full h-40 object-cover rounded"
              alt={p.title}
            />

           <h3 className="font-semibold mt-3">{p.title}</h3>

{/* PRODUCT TYPE BADGE */}
<p className="mt-1 text-sm font-medium">
  Type:{" "}
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-semibold
      ${
        p.productType === "rental"
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }
    `}
  >
    {p.productType === "rental" ? "Rental" : "Sale"}
  </span>
</p>

{/* PRICE */}
<p className="text-gray-600 mt-1">
  {p.productType === "rental" ? (
    <>$ {p.pricePerDay} / day</>
  ) : (
    <>$ {p.salePrice}</>
  )}
</p>

            <div className="mt-3 flex justify-between">
              <a
                href={`/admin/products/edit/${p._id}`}
                className="text-blue-600"
              >
                Edit
              </a>

              <button
                className="text-red-500"
                onClick={() => handleDelete(p._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Products;
