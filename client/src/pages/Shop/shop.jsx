import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiGift, FiGrid, FiPackage, FiShoppingBag, FiTag } from "react-icons/fi";
import { api } from "../../utils/api";

const CATEGORY_ICONS = [FiShoppingBag, FiPackage, FiGift, FiTag, FiGrid];

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
    <section className="bg-[#faf9f7] px-6 py-20">

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

      <div className="mx-auto max-w-7xl pb-16">
        {loadingCategories && (
          <p className="text-center text-lg text-gray-400">Loading categories…</p>
        )}
        {categoriesError && (
          <p className="text-center text-red-500">{categoriesError}</p>
        )}
        {!loadingCategories && !categoriesError && saleCategories.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No sale categories yet. Add categories with type &quot;sale&quot; in admin.
          </p>
        )}
        {!loadingCategories && !categoriesError && saleCategories.length > 0 && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {saleCategories.map((cat, index) => {
              const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
              return (
                <Link
                  key={cat._id}
                  to={`/shop/category/${cat._id}`}
                  className="group relative block w-full overflow-hidden rounded-3xl border border-[#e8e3dc] bg-white shadow-[0_2px_20px_-4px_rgba(45,41,38,0.07)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#d4cdc3] hover:bg-[#faf9f7] hover:shadow-[0_24px_48px_-12px_rgba(45,41,38,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D2926]"
                >
                  <div className="relative flex flex-col items-center px-7 py-11 text-center md:px-9 md:py-12">
                    <div
                      className="mb-7 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-[1.35rem] bg-[#ede8e0] text-[#2D2926] ring-1 ring-[#e0d9cf] transition-all duration-500 group-hover:scale-[1.06] group-hover:bg-[#2D2926] group-hover:text-[#faf9f7] group-hover:shadow-[0_12px_28px_-8px_rgba(45,41,38,0.3)] group-hover:ring-[#2D2926] md:h-[5.75rem] md:w-[5.75rem]"
                      aria-hidden
                    >
                      <Icon
                        className="h-[2.125rem] w-[2.125rem] md:h-10 md:w-10"
                        strokeWidth={1.15}
                      />
                    </div>
                    <h3
                      className="max-w-[14rem] text-[1.35rem] font-medium leading-snug tracking-tight text-[#2D2926] transition-colors duration-300 group-hover:text-[#1a1816] md:text-2xl md:max-w-[16rem]"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {cat.name}
                    </h3>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2D2926] transition-all duration-300 group-hover:gap-2.5 group-hover:text-[#1a1816]">
                      Explore
                      <FiArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        strokeWidth={2.25}
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopPage;
