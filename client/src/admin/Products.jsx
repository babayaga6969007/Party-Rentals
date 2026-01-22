import { useEffect, useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../components/admin/ConfirmDeleteModal";

const Products = () => {
  const [items, setItems] = useState([]);
  const [productFilter, setProductFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null });
 
// "all" | "rental" | "sale"


  const loadProducts = async () => {
    try {
     const res = await api("/products?limit=1000");
      setItems(res.products);
    } catch {
      alert("Error loading products");
    }
  };

 useEffect(() => {
  loadProducts();
  loadCategories();
  
  // Check for success message from edit redirect (using sessionStorage)
  const productEdited = sessionStorage.getItem("productEdited");
  if (productEdited === "true") {
    toast.success("Product updated successfully!");
    sessionStorage.removeItem("productEdited");
  }
}, []);


  const loadCategories = async () => {
  try {
    const res = await api("/categories");
    const data = res?.data || res || [];
    setCategories(data);
  } catch (err) {
    console.error("Error loading categories", err);
  }
};


  
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const handleDeleteConfirm = async () => {
    const productId = deleteConfirm.productId;
    if (!productId) return;

    try {
      const token = localStorage.getItem("admin_token");

      await api(`/products/admin/delete/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success("Product deleted successfully!");
      setDeleteConfirm({ isOpen: false, productId: null });
      loadProducts(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting product");
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };


// ====================
//  FILTERED PRODUCTS (ADMIN)
// ====================
const filteredItems =
  productFilter === "all"
    ? items
    : items.filter((p) => p.productType === productFilter);

    const getCategoryName = (category) => {
  const categoryId =
    typeof category === "object" ? category?._id : category;

  return (
    categories.find((c) => String(c._id) === String(categoryId))?.name ||
    "—"
  );
};

  return (
    <AdminLayout>
<div className="flex items-center gap-6 mb-6">
  <h1 className="text-3xl font-semibold">All Products</h1>

  {/* PRODUCT TYPE FILTER */}
  <div className="flex gap-2">
    {["all", "rental", "sale"].map((type) => (
      <button
        key={type}
        onClick={() => setProductFilter(type)}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition
          ${
            productFilter === type
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
      >
        {type === "all"
          ? "All"
          : type === "rental"
          ? "Rental"
          : "Sale"}
      </button>
    ))}
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{filteredItems.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow">
            <img
              src={p.images[0]?.url}
              className="w-full h-40 object-cover rounded"
              alt={p.title}
            />

           <h3 className="font-semibold mt-3">{p.title}</h3>

{/* PRODUCT TYPE BADGE */}
<p className="mt-1 text-sm font-medium flex items-center gap-2 flex-wrap">
  <span>
    Type:
    <span
      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
        ${
          p.productType === "rental"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }
      `}
    >
      {p.productType === "rental" ? "Rental" : "Sale"}
    </span>
  </span>

  <span>
    Category:
    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
      {getCategoryName(p.category)}
    </span>
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
                onClick={() => handleDeleteClick(p._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and all product data will be permanently removed."
      />
    </AdminLayout>
  );
};

export default Products;
