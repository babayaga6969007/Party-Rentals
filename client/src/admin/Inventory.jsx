import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";
import { FiAlertTriangle, FiEdit } from "react-icons/fi";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const loadProducts = async () => {
    try {
      const res = await api("/products");
      setProducts(res.products || []);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ---------------- SUMMARY ---------------- */
  const totalSKUs = products.length;
  const rentalCount = products.filter(
    (p) => p.productType === "rental"
  ).length;
  const purchaseCount = products.filter(
    (p) => p.productType === "sale"
  ).length;
const lowStockCount = products.filter((p) => {
  const stock = p.availabilityCount ?? 0;

  if (p.productType === "rental") {
    return stock <= 1;
  }
  return stock <= 5; // sale
}).length;

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-1">
          Live stock availability & product health
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Total SKUs" value={totalSKUs} />
        <SummaryCard title="Rental Items" value={rentalCount} />
        <SummaryCard title="Purchase Items" value={purchaseCount} />
<SummaryCard title="Low Stock Alerts" value={lowStockCount} />
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search product by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading inventory...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Available Stock</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => {
                const stock = p.availabilityCount ?? 0;

                const lowStock =
                  p.productType === "rental"
                    ? stock <= 1
                    : stock <= 5;

                return (
                  <tr
                    key={p._id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    {/* PRODUCT */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url}
                          alt={p.title}
                          className="w-10 h-10 rounded-md object-cover border"
                        />
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-gray-500">
                            ID: {p._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.productType === "rental"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.productType === "rental"
                          ? "Rental"
                          : "Purchase"}
                      </span>
                    </td>

                    {/* STOCK */}
                    <td className="px-5 py-4 font-semibold">
                      {stock}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {lowStock ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <FiAlertTriangle />
                          Low
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-right">
                      <button
                        title="Edit Product"
                        className="text-black"
                        onClick={() =>
                          (window.location.href =
                            `/admin/products/edit/${p._id}`)
                        }
                      >
                        <FiEdit />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default Inventory;

/* ---------------- SUMMARY CARD ---------------- */

const SummaryCard = ({ title, value }) => (
  <div className="bg-white border rounded-2xl shadow-sm p-5">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-2xl font-semibold mt-1 text-[#2D2926]">
      {value}
    </p>
  </div>
);
