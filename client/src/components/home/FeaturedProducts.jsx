import { FiShoppingCart } from "react-icons/fi";

import img6 from "../../assets/featured/6.png";
import img7 from "../../assets/featured/7.png";
import img8 from "../../assets/featured/8.png";
import img9 from "../../assets/featured/9.png";
import img10 from "../../assets/featured/10.png";
import img11 from "../../assets/featured/11.png";
import img12 from "../../assets/featured/12.png";
import img13 from "../../assets/featured/13.png";

const products = [
  { id: 6, img: img6, title: "Product Name 1", price: "AUD $500", availability: 2 },
  { id: 7, img: img7, title: "Product Name 2", price: "AUD $600", availability: 1 },
  { id: 8, img: img8, title: "Product Name 3", price: "AUD $300", availability: 4 },
  { id: 9, img: img9, title: "Product Name 4", price: "AUD $450", availability: 2 },
  { id: 10, img: img10, title: "Product Name 5", price: "AUD $550", availability: 3 },
  { id: 11, img: img11, title: "Product Name 6", price: "AUD $350", availability: 2 },
  { id: 12, img: img12, title: "Product Name 7", price: "AUD $650", availability: 1 },
  { id: 13, img: img13, title: "Product Name 8", price: "AUD $400", availability: 2 },
];

const FeaturedProducts = () => {
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
        className="max-w-3xl mx-auto mt-4 text-center text-[#2D2926]/80 text-[18px] leading-relaxed"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Explore our curated selection of premium décor and rental props. Each piece is 
        chosen to elevate your celebrations with elegance, charm, and lasting impressions.
      </p>

      {/* Grid */}
      <div className="mt-14 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
        {products.map((item) => (
          <div
        key={item.id}
        className="group bg-white border border-black/10 rounded-xl overflow-hidden 
                  transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl"
      >
        {/* Image */}
        <div className="h-60 overflow-hidden">
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Details */}
        <div className="p-4 relative">
          <span className="inline-block bg-green-600 text-white text-[12px] px-3 py-1 rounded-full mb-3">
            {item.availability} available
          </span>

          <h3 className="font-semibold text-[#2D2926]">{item.title}</h3>
          <p className="text-sm text-[#2D2926]/70 mt-1">{item.price}</p>

          {/* Add To Cart Button - Appears on Hover */}
          <button
            className="mt-4 w-full py-2 rounded-full bg-[#8B5C42] text-white text-sm font-medium
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      hover:bg-[#704A36]"
          >
            Add to Cart
          </button>
        </div>
      </div>

        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
