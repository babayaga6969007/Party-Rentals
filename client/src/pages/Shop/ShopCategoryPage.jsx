import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import hero1 from "../../assets/home2/hero1.png";
import { api } from "../../utils/api";

function findVinylPrintsSignShopCategory(categories) {
  if (!Array.isArray(categories)) return null;
  return (
    categories.find((c) => {
      const n = (c.name || "").toLowerCase();
      return n.includes("vinyl") && n.includes("print") && n.includes("sign");
    }) || null
  );
}

const ShopCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      setProducts([]);

      try {
        const catRes = await api("/categories");
        const allCats = Array.isArray(catRes)
          ? catRes
          : Array.isArray(catRes?.data)
            ? catRes.data
            : [];

        const cat = allCats.find((c) => String(c._id) === String(id));

        if (!cat) {
          setError("Category not found.");
          setCategory(null);
          return;
        }
        if (cat.type !== "sale") {
          setError("This category is not available in the shop.");
          setCategory(null);
          return;
        }

        setCategory(cat);
      } catch (e) {
        console.error(e);
        setError("Failed to load category.");
        setCategory(null);
        setLoading(false);
        return;
      }

      try {
        const prodRes = await api(`/products?category=${id}&limit=500`);
        const list = prodRes?.products || [];
        const saleList = list.filter((p) => p.productType === "sale");
        setProducts([...saleList].reverse());
      } catch (e) {
        console.error(e);
        setError("Failed to load products for this category.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const showSignageAndVinylCards = useMemo(() => {
    if (!category || !id) return false;
    const match = findVinylPrintsSignShopCategory([category]);
    return match && String(match._id) === String(id);
  }, [category, id]);

  const getCategoryLabel = (product) => {
    if (typeof product.category === "object" && product.category?.name) {
      return product.category.name;
    }
    return category?.name || "--";
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[#2D2926] font-medium hover:opacity-80"
          >
            <span aria-hidden>←</span> Back to shop
          </Link>
        </div>

        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1
            className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {category?.name || "Shop"}
          </h1>
          <p
            className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Sale items in this category.
          </p>
        </div>

        {error && (
          <p className="text-center text-red-600 mb-8">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[260px] items-start">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16 min-h-[200px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4" />
                <p className="text-gray-600">Loading…</p>
              </div>
            </div>
          ) : (
            <>
              {showSignageAndVinylCards && (
                <>
                  <div
                    className="flex flex-col h-full border-2 border-black rounded-xl shadow-lg
                      transition-all duration-300 group hover:shadow-xl hover:scale-[1.02]
                      bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="h-40 shrink-0 rounded-t-xl overflow-hidden bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                        <p className="text-xs font-semibold">Acrylic & Vinyl</p>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 min-h-0">
                      <h3 className="font-bold text-base text-[#2D2926]">
                        Acrylic and Vinyl Signage
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        Create personalized acrylic and vinyl signage with custom text, fonts, colors, and backgrounds for your events.
                      </p>
                      <div className="mt-auto pt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => navigate("/signage")}
                          className="w-full bg-black text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-gray-800 transition"
                        >
                          Create Signage
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex flex-col h-full border-2 border-black rounded-xl shadow-lg
                      transition-all duration-300 group hover:shadow-xl hover:scale-[1.02]
                      bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="h-40 shrink-0 rounded-t-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 4h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zm-6-8H7v2h2V7zm0 4H7v2h2v-2zm0 4H7v2h2v-2z" />
                        </svg>
                        <p className="text-xs font-semibold">Vinyl Printing</p>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 min-h-0">
                      <h3 className="font-bold text-base text-[#2D2926]">
                        Vinyl Printing
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        Choose a size, upload your artwork, and add to cart. Pickup in Anaheim. Minimum $95.
                      </p>
                      <div className="mt-auto pt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => navigate("/vinyl-printing")}
                          className="w-full bg-black text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-gray-800 transition"
                        >
                          Get started
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {products.map((product) => (
                <a
                  key={product._id}
                  href={`/buyproducts/${product._id}`}
                  className="flex flex-col h-full border border-gray-300 hover:border-gray-500
                    rounded-xl shadow transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="h-40 shrink-0 rounded-t-xl overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || hero1}
                      alt={product.title || ""}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 min-h-0">
                    <h3 className="font-bold text-base text-[#2D2926] line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-gray-500 line-through text-xs">$ {product.pricePerDay}</span>
                          <span className="text-red-600 font-bold text-base">$ {product.salePrice}</span>
                        </>
                      ) : (
                        <span className="text-black font-semibold text-base">$ {product.pricePerDay}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Category: {getCategoryLabel(product)}
                    </p>
                    <div className="mt-auto pt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <span className="block w-full text-center bg-black text-white px-4 py-2 rounded-lg text-sm shadow-md">
                        View Product
                      </span>
                    </div>
                  </div>
                </a>
              ))}

              {!loading && category && products.length === 0 && !showSignageAndVinylCards && (
                <p className="col-span-full text-center text-gray-600 py-12">
                  No products in this category yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopCategoryPage;
