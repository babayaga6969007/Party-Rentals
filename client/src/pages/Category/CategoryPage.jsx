import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";
const CategoryLandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
// SEARCH STATES
const [searchTerm, setSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [searching, setSearching] = useState(false);
const [noResult, setNoResult] = useState(false);
  // =========================
  // FETCH RENTAL CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api("/categories");

        const allCategories = res?.data || res || [];

        // Only rental categories (same as your existing logic)
        const rentalCategories = allCategories.filter(
          (c) => c.type === "rental"
        );

        setCategories(rentalCategories);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
useEffect(() => {
  if (searchTerm.length < 2) {
    setSearchResults([]);
    setNoResult(false);
    return;
  }

  const delay = setTimeout(() => {
    const keyword = searchTerm.toLowerCase().trim();

// CATEGORY MATCH (word-level match)
const matchedCategories = categories.filter((cat) => {
  const words = cat.name.toLowerCase().split(" ");
  return words.some((word) => word.includes(keyword));
});

// PRODUCT MATCH (word-level match)
const matchedProducts = products.filter((product) => {
  const words = product.title.toLowerCase().split(" ");
  return words.some((word) => word.includes(keyword));
});
    const combined = [
      ...matchedCategories.map((c) => ({ ...c, type: "category" })),
      ...matchedProducts.map((p) => ({ ...p, type: "product" })),
    ];

    setSearchResults(combined);
    setNoResult(combined.length === 0);
  }, 300);

  return () => clearTimeout(delay);
}, [searchTerm, categories, products]);
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await api("/products?limit=500");
      setProducts(res?.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProducts();
}, []);
return (
  <section className="page-wrapper py-24 px-6 bg-white">
    
    {/* ========================= */}
    {/* PAGE HEADING */}
    {/* ========================= */}
    <div className="max-w-5xl mx-auto text-center mb-16">
      <h1
        className="text-5xl md:text-6xl font-semibold text-[#2D2926] tracking-tight"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Browse Our Collection
      </h1>

      <div className="w-20 h-[2px] bg-[#2D2926] mx-auto mt-6 mb-6 opacity-40" />

      <p
        className="text-[#2D2926]/70 text-lg leading-relaxed max-w-2xl mx-auto"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Explore our curated rental categories and discover the perfect pieces for your event.
      </p>
    </div>
{/* SEARCH SECTION */}
<div className="max-w-xl mx-auto mb-14 relative">
  <input
    type="text"
    placeholder="Search categories..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
    className="w-full px-6 py-4 rounded-full border border-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D2926]/20 text-lg"
  />

  {/* DROPDOWN RESULTS */}
  {searchTerm.length > 2 && (
    <div className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-[#e5e2dd] z-50 max-h-72 overflow-y-auto">
      
      {searching && (
        <div className="p-4 text-gray-400 text-center">Searching...</div>
      )}

      {noResult && (
        <div className="p-4 text-red-500 text-center">
          No category/product found with that name.
        </div>
      )}

    {searchResults.map((item) => {
  const image =
    item.type === "category"
      ? item.image
      : item.images?.[0]?.url;

  const name =
    item.type === "category"
      ? item.name
      : item.title;

  const link =
    item.type === "category"
      ? `/category/${item._id}`
      : `/product/${item._id}`;

  return (
    <Link
      key={`${item.type}-${item._id}`}
      to={link}
      className="flex items-center gap-4 px-6 py-3 hover:bg-[#f5f3ef] transition"
    >
      {/* THUMBNAIL */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={image || "/placeholder-product.png"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* NAME */}
      <div className="flex-1">
        <p className="text-[#2D2926] font-medium">
          {name}
        </p>
      </div>

      {/* TYPE */}
      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 capitalize">
  {item.type}
</span>
    </Link>
  );
})}
    </div>
  )}
</div>
    {/* ========================= */}
    {/* CATEGORY GRID */}
    {/* ========================= */}
    <div className="max-w-7xl mx-auto">

      {loading && (
        <div className="text-center text-gray-400 text-lg">
          Loading categories...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">

          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat._id}`}
             className="
  group relative overflow-hidden
  rounded-2xl
  bg-white
  border border-[#e8e4df]
  shadow-sm
  transition-all duration-500
  hover:shadow-xl
  hover:-translate-y-2
  hover:border-[#2D2926]
"
            >
              {/* IMAGE */}
              <div className="h-64 overflow-hidden">
                <img
                  src={cat.image || "/placeholder-category.png"}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Subtle dark gradient overlay */}
<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />              </div>

              {/* CONTENT */}
              <div className="p-8 text-center">
                <h3
                  className="
                    text-2xl font-medium text-[#2D2926]
                    transition-colors duration-300
                    group-hover:text-black
                  "
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  {cat.name}
                </h3>

                <div className="w-12 h-[1px] bg-[#2D2926]/30 mx-auto mt-4 group-hover:w-20 transition-all duration-500" />
              </div>
            </Link>
          ))}

        </div>
      )}
    </div>
  </section>
);
};

export default CategoryLandingPage;