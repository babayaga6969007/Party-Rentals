import { useEffect, useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";

const Products = () => {
  const [items, setItems] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await api("/api/products");
      setItems(res.products);
    } catch {
      alert("Error loading products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6">All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow">
            <img src={p.images[0]} className="w-full h-40 object-cover rounded" />

            <h3 className="font-semibold mt-3">{p.title}</h3>
            <p className="text-gray-600">{p.pricePerDay}/day</p>

            <div className="mt-3 flex justify-between">
              <a
                href={`/admin/products/edit/${p._id}`}
                className="text-blue-600"
              >
                Edit
              </a>

              <button className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Products;
