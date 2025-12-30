import { FiShoppingCart } from "react-icons/fi";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";





const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchFeatured = async () => {
    try {
      const res = await api("/products");
      const all = res?.products || [];

      const featured = all
.filter((p) => p.productType === "rental" && p.featured === true)
        // newest featured first if you have featuredAt
        .sort((a, b) => new Date(b.featuredAt || b.updatedAt || 0) - new Date(a.featuredAt || a.updatedAt || 0))
        .slice(0, 8);

      setProducts(featured);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };

  fetchFeatured();
}, []);

  return (
    <section className="py-20 bg-white">
      {/* Heading */}
      <h2
        className="text-center text-3xl font-semibold text-[#2D2926]"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Featured Products
      </h2>

      {/* Description */}
      <p
        className="max-w-2xl mx-auto mt-4 text-center text-[#2D2926]/80  leading-relaxed"
        
      >
        Explore our curated selection of premium decor and rental props. Each piece is 
        chosen to elevate your celebrations with elegance, charm, and lasting impressions.
      </p>

      {/* Grid */}
      <div className="mt-14 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
        {products.map((item) => (
  <div
    key={item._id}
    className="group bg-white border border-black/10 rounded-xl overflow-hidden 
              transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl"
  >
    <Link to={`/product/${item._id}`}>
      <div className="h-60 overflow-hidden">
        <img
          src={item.images?.[0]?.url || ""}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </Link>

    <div className="p-4 relative">
      <span className="inline-block bg-green-600 text-white text-[12px] px-3 py-1 rounded-full mb-3">
        {item.availabilityCount ?? 0} available
      </span>

      <h3 className="font-semibold text-[#2D2926]">{item.title}</h3>
      <p className="text-sm text-[#2D2926]/70 mt-1">
        USD ${item.pricePerDay} / day
      </p>

      <Link to={`/product/${item._id}`}>
        <button
          className="mt-4 w-full py-2 rounded-full bg-[#8B5C42] text-white text-sm font-medium
                    opacity-100 lg:opacity-0 lg:group-hover:opacity-100
 transition-opacity duration-300 
                    hover:bg-[#704A36]"
        >
          View Product
        </button>
      </Link>
    </div>
  </div>
))}

      </div>
    </section>
  );
};

export default FeaturedProducts;
