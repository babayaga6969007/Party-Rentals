import { useEffect, useState } from "react";
import { api } from "../utils/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../components/admin/ConfirmDeleteModal";

/**
 * ADMIN – ALL PRODUCTS
 * Fully cleaned & stable version
 */
const Products = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productFilter, setProductFilter] = useState("all"); // all | rental | sale
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    productId: null,
  });

  /* ======================
     LOADERS
  ====================== */

  const loadProducts = async () => {
    try {
      const res = await api("/products?limit=1000&admin=true");
      setItems(res.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Error loading products");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api("/categories");
      setCategories(res?.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();

    // Success toast after edit redirect
    const productEdited = sessionStorage.getItem("productEdited");
    if (productEdited === "true") {
      toast.success("Product updated successfully!");
      sessionStorage.removeItem("productEdited");
    }
  }, []);

  /* ======================
     HELPERS – VARIATIONS
  ====================== */

const getLowestVariation = (product) => {
  if (
    product?.productType === "rental" &&
    product?.productSubType === "variable" &&
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    return [...product.variations].sort((a, b) => {
      const aPrice = a.salePrice ?? a.pricePerDay ?? Infinity;
      const bPrice = b.salePrice ?? b.pricePerDay ?? Infinity;
      return aPrice - bPrice;
    })[0];
  }
  return null;
};

const getAdminProductImage = (product) => {
  // Variable rental → first image of lowest-priced variation
  if (
    product?.productType === "rental" &&
    product?.productSubType === "variable" &&
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    const lowestVar = getLowestVariation(product);
    return (
      lowestVar?.images?.[0]?.url ||
      "/placeholder-product.png"
    );
  }

  // Simple rental / sale → base product image
  return (
    product?.images?.[0]?.url ||
    "/placeholder-product.png"
  );
};

const getAdminProductPrice = (product) => {
  if (product.productType !== "rental") {
    return product.salePrice;
  }

  const lowestVar = getLowestVariation(product);
  if (lowestVar) {
    return lowestVar.salePrice ?? lowestVar.pricePerDay;
  }

  return product.pricePerDay;
};

  const getCategoryName = (category) => {
    const categoryId =
      typeof category === "object" ? category?._id : category;

    return (
      categories.find((c) => String(c._id) === String(categoryId))?.name || "—"
    );
  };

  /* ======================
     DELETE HANDLERS
  ====================== */

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };
  const handleTogglePublish = async (id) => {
  try {
    const token = localStorage.getItem("admin_token");

    await api(`/products/admin/toggle-publish/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Status updated");

    loadProducts(); // refresh list
  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  }
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
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting product");
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  /* ======================
     FILTERED LIST
  ====================== */

  const filteredItems =
    productFilter === "all"
      ? items
      : items.filter((p) => p.productType === productFilter);

  /* ======================
     RENDER
  ====================== */

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <h1 className="text-3xl font-semibold">All Products</h1>

        {/* FILTER */}
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
                }`}
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

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow">
            <img
              src={getAdminProductImage(p)}
              className="w-full h-40 object-cover rounded"
              alt={p.title}
            />

            <h3 className="font-semibold mt-3">{p.title}</h3>

            {/* TYPE + CATEGORY */}
            <p className="mt-1 text-sm font-medium flex items-center gap-2 flex-wrap">
              <span>
                Type:
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      p.productType === "rental"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
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
                <>$ {getAdminProductPrice(p)} / day</>
              ) : (
                <>$ {p.salePrice}</>
              )}
            </p>

            {/* ACTIONS */}
          <div className="mt-3 flex justify-between items-center">

  {/* EDIT */}
  <a
    href={`/admin/products/edit/${p._id}`}
    className="text-blue-600"
  >
    Edit
  </a>

  {/* TOGGLE */}
  <label className="flex items-center gap-2 cursor-pointer">
    <span className="text-xs">
      {p.isPublished ? "Published" : "Unpublished"}
    </span>

    <input
      type="checkbox"
      checked={p.isPublished}
      onChange={() => handleTogglePublish(p._id)}
      className="hidden"
    />

    <div
      className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
        p.isPublished ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
          p.isPublished ? "translate-x-5" : ""
        }`}
      />
    </div>
  </label>

  {/* DELETE */}
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

      {/* DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, productId: null })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and all product data will be permanently removed."
      />
    </AdminLayout>
  );
};

export default Products;
