import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

const ShopPage = () => {
  const [saleCategories, setSaleCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError("");

        const res = await api("/categories");
        const allCategoriesRaw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        const saleOnly = allCategoriesRaw.filter((c) => c.type === "sale");
        setSaleCategories([...saleOnly].reverse());
      } catch (err) {
        console.error(err);
        setCategoriesError("Failed to load categories");
        setSaleCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-20 px-6 bg-white">

      <div className="page-wrapper max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          One Stop Shop
        </h1>

        <p
          className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Browse our collection and unique finds.
        </p>
      </div>

      <div className="max-w-7xl mx-auto pb-12">
        {loadingCategories && (
          <p className="text-center text-gray-400 text-lg">Loading categories…</p>
        )}
        {categoriesError && (
          <p className="text-center text-red-500">{categoriesError}</p>
        )}
        {!loadingCategories && !categoriesError && saleCategories.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            No sale categories yet. Add categories with type &quot;sale&quot; in admin.
          </p>
        )}
        {!loadingCategories && !categoriesError && saleCategories.length > 0 && (
          <>
            <h2
              className="text-2xl md:text-3xl font-semibold text-[#2D2926] text-center mb-8"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Shop by category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {saleCategories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop/category/${cat._id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-[#e8e4df] shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-[#2D2926] text-left w-full block"
                >
                  <div className="h-56 md:h-64 overflow-hidden">
                    <img
                      src={cat.image || "/placeholder-category.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                  </div>
                  <div className="p-6 md:p-8 text-center">
                    <h3
                      className="text-xl md:text-2xl font-medium text-[#2D2926] transition-colors duration-300 group-hover:text-black"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {cat.name}
                    </h3>
                    <div className="w-12 h-[1px] bg-[#2D2926]/30 mx-auto mt-4 group-hover:w-20 transition-all duration-500" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopPage;
