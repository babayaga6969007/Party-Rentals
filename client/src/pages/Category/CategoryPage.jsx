import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";
const CategoryLandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

return (
  <section className="page-wrapper py-24 px-6 bg-[#faf9f7]">
    
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