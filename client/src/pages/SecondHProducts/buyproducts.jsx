import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { useCart } from "../../context/CartContext";


import {
  FiLock,
  FiHeadphones,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import lightsImg from "../../assets/addons/lights.png";
import flowersImg from "../../assets/addons/flowers.png";

// Product Images
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";



// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];


const ProductPage = () => {
    // ====================
  //  PRODUCT DATA (FROM BACKEND)
  // ====================
  const { id } = useParams();
  const location = useLocation();

  const [product, setProduct] = useState(null);

const [selectedOptionState, setSelectedOptionState] = useState({});


  const productImages = product?.images?.map((img) => img.url) || [];

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

const { addToCart, cartItems } = useCart();
const isAlreadyInCart = cartItems.some(
  (item) =>
    item.productType === "purchase" &&
    item.productId === product?._id
);



const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// Convert date to readable format
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Calculate number of days selected
const selectedDays =
  startDate && endDate
    ? Math.max(
        1,
        Math.ceil(
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        ) + 1
      )
    : startDate
    ? 1
    : 0;


  // ⭐ THIS IS WHERE THE HOOKS MUST GO
  const [activeImage, setActiveImage] = useState(0);

  const handleNext = () => {
  if (productImages.length <= 1) return;
  setActiveImage((prev) => (prev + 1) % productImages.length);
};


 const handlePrev = () => {
  if (productImages.length <= 1) return;
  setActiveImage((prev) =>
    prev === 0 ? productImages.length - 1 : prev - 1
  );
};




  // Quantity of main product
  const [productQty, setProductQty] = useState(1);
 const handleProductQtyChange = (inc) => {
  setProductQty((prev) => {
    const nextQty = prev + inc;

    // Minimum = 1
    if (nextQty < 1) return 1;

    // Maximum = available stock
    if (nextQty > maxStock) return maxStock;

    return nextQty;
  });
};


  // Days selection
  const [days, setDays] = useState(1);

  // Addon quantities
  const [addons, setAddons] = useState({
    lights: 0,
    flowers: 0,
  });

  const handleAddonChange = (type, inc) => {
    setAddons((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + inc),
    }));
  };

  // Date selection
  const [selectedDate, setSelectedDate] = useState("");
  

  // Add-on total calculation
  const isSalePage = location.pathname.startsWith("/buyproducts");
const regularPrice = Number(product?.pricePerDay || 0);
const salePrice = Number(product?.salePrice || 0);

// use salePrice if present, else fallback
const effectivePrice = salePrice || regularPrice;


  const addonsTotal = addons.lights * 10 + addons.flowers * 15;
  const maxStock = product?.availabilityCount ?? 1;


  // Final total price
// priority: use date range if selected, else manual days input
const totalRentalDays = selectedDays > 0 ? selectedDays : days;

const totalPrice = effectivePrice * productQty;



const fullDescription = product?.description || "No description available.";



const shortDescription = fullDescription.substring(0, 120) + "...";
  


const [showFullDesc, setShowFullDesc] = useState(false);
// ⭐ ADD POPUP STATE
const [showPopup, setShowPopup] = useState(false);

// Fake “added to cart” product info
const addedItem = {
  name: product?.title || "Product",
  price: effectivePrice,
  qty: productQty,
  image: productImages[activeImage] || hero1,
};

// When user confirms booking




const handleAddToCart = () => {
const unitPrice = effectivePrice;
  const lineTotal = unitPrice * productQty;

  addToCart({
    productId: product._id,
    name: product.title,
    productType: "purchase",

    qty: productQty,
    unitPrice,
    lineTotal,

    image: productImages[activeImage],
    maxStock: product?.availabilityCount ?? 1,
  });

  setShowPopup(true);
};

  // ====================
  //  FETCH SINGLE PRODUCT
  // ====================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        // ✅ expected endpoint (if your backend already has it)
        const res = await api(`/products/${id}`);
        const data = res?.product || res;

        setProduct(data);
        
        

      } catch (err) {
        console.error(err);
        setProductError("Failed to load product");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

// ====================
//  RESET ACTIVE IMAGE ON PRODUCT CHANGE
// ====================
useEffect(() => {
  setActiveImage(0);
}, [id]);

// ====================
//  SYNC QTY WITH STOCK
// ====================
useEffect(() => {
  if (product && productQty > maxStock) {
    setProductQty(maxStock);
  }
}, [product, maxStock]);
// ====================
// ATTRIBUTE GROUPS FOR UI (Unified Options UI)
// ====================
const attributeGroupsForUI =
  product?.attributes
    ?.filter((a) => a?.groupId && Array.isArray(a.groupId.options))
    .map((a) => ({
      groupId: String(a.groupId._id),
      name: a.groupId.name,
      options: (a.groupId.options || []).filter((opt) =>
        (a.optionIds || []).some(
          (oid) => String(oid) === String(opt._id)
        )
      ),
    })) || [];

// ====================
// AUTO-SELECT DEFAULT ATTRIBUTE OPTIONS (SALE PAGE)
// ====================
useEffect(() => {
  if (attributeGroupsForUI.length === 0) return;

  const defaults = {};

  attributeGroupsForUI.forEach((g) => {
    if (g.options?.length >= 1) {
      // if only one option → select it
      // if multiple options → select first
      defaults[g.groupId] = String(g.options[0]._id);
    }
  });

  // Apply defaults ONLY on first load
  setSelectedOptionState((prev) =>
    Object.keys(prev).length > 0 ? prev : defaults
  );
}, [product?._id, attributeGroupsForUI.length]);

if (loadingProduct) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">Loading...</div>;
}

if (productError) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">{productError}</div>;
}

if (!product) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">Product not found</div>;
}


  return (
    <>
      {/* MAIN PRODUCT GRID */}
      <div className="page-wrapper max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* LEFT COLUMN */}
        <div>
          {/* MAIN IMAGE WITH ARROWS */}
<div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow-lg">

  {/* Main Image */}
  <img
  src={productImages[activeImage] || hero1}
  className="w-full h-full object-cover"
  alt="Product"
/>


  {/* LEFT ARROW */}
  {productImages.length > 1 && (
  <button
    onClick={handlePrev}
    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❮
  </button>
)}

{productImages.length > 1 && (
  <button
    onClick={handleNext}
    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❯
  </button>
)}


</div>


          {/* THUMBNAILS */}
{productImages.length > 1 && (
  <div className="grid grid-cols-4 gap-3 mt-4">
    {productImages.map((img, i) => (
      <img
        key={i}
        src={img}
        onClick={() => setActiveImage(i)}
        className={`w-full h-20 object-cover rounded-xl shadow cursor-pointer transition border-2 ${
          i === activeImage ? "border-black" : "border-transparent"
        }`}
        alt="Thumbnail"
      />
    ))}
  </div>
)}



          {/* ⭐ RECOMMENDED ADDONS UNDER IMAGE */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
              You May Also Like
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {/* Lights Add-on */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img
                  src={lightsImg}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                />
                <p className="font-medium">Warm LED Lights</p>
                

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleAddonChange("lights", -1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{addons.lights}</span>
                  <button
                    onClick={() => handleAddonChange("lights", 1)}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Flowers Add-on */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img
                  src={flowersImg}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                />
                <p className="font-medium">Flower Garland Set</p>
                

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleAddonChange("flowers", -1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{addons.flowers}</span>
                  <button
                    onClick={() => handleAddonChange("flowers", 1)}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
         <h1 className="text-4xl font-semibold text-[#2D2926] mb-4">
  {product?.title || "—"}
</h1>

         {/* PRICE + STOCK (Responsive layout) */}
<div className="mt-2 flex flex-col md:flex-row md:items-center md:gap-6">

  {/* Price */}
<div className="flex items-baseline gap-3">
  {salePrice ? (
    <>
      <span className="text-xl text-gray-500 line-through">
        $ {regularPrice}
      </span>
      <span className="text-3xl font-semibold text-red-600">
        $ {salePrice}
      </span>
    </>
  ) : (
    <span className="text-3xl font-semibold text-black">
      $ {regularPrice}
    </span>
  )}
</div>



  {/* Stock — beside price on desktop, below on mobile */}
  <div className="mt-2 md:mt-0 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 inline-block">
    <p className="text-sm font-medium text-[#2D2926]">
     Stock Availability:{" "}
<span className="text-black font-semibold">
  {product?.availabilityCount ?? 0}
</span>


    </p>
  </div>

</div>

          {/* ⭐ PRODUCT QUANTITY */}
          <div className="flex items-center gap-4 mt-4">
            <p className="font-medium text-lg">Quantity:</p>
            

            
            <button
              onClick={() => handleProductQtyChange(-1)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span className="text-xl">{productQty}</span>

            <button
  onClick={() => handleProductQtyChange(1)}
  disabled={productQty >= maxStock}
  className={`px-3 py-1 rounded text-white
    ${
      productQty >= maxStock
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black hover:bg-gray-800"
    }
  `}
>
  +
</button>

          </div>

        


          {/* TOTAL */}
         <div className="mt-8 text-2xl font-semibold text-[#2D2926]">
  Total : 
  ${totalPrice}
</div>


          {/* BUTTON */}
 <button
  onClick={handleAddToCart}
  disabled={
    (product?.availabilityCount ?? 0) === 0 || isAlreadyInCart
  }
  className={`mt-8 w-full py-3 rounded-lg text-white
    ${
      isAlreadyInCart || (product?.availabilityCount ?? 0) === 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black hover:bg-[#222222]"
    }`}
>
  {isAlreadyInCart
    ? "Product already in cart"
    : (product?.availabilityCount ?? 0) === 0
    ? "Out of Stock"
    : "Add to Cart"}
</button>







          <div className="mt-10 space-y-4">
        
{/* OPTIONS (Unified Attribute UI) */}
{attributeGroupsForUI.length > 0 && (
  <div className="bg-white p-5 rounded-xl shadow mb-4">
    <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
      Available Options
    </h3>

    {attributeGroupsForUI.map((g) => (
      <div key={g.groupId} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {g.name}
        </label>

        <div className="flex flex-wrap gap-2">
          {g.options.map((opt) => (
            <button
  key={String(opt._id)}
  type="button"
  onClick={() => {
    // UI-only selection for sale products
    setSelectedOptionState((prev) => ({
      ...prev,
      [g.groupId]: String(opt._id),
    }));
  }}
  className={`px-4 py-2 rounded-lg border text-sm transition
    ${
      selectedOptionState?.[g.groupId] === String(opt._id)
        ? "border-black bg-black text-white"
        : "border-gray-300 bg-white hover:bg-gray-50"
    }
  `}
>
  {opt.label}
</button>

          ))}
        </div>
      </div>
    ))}
  </div>
)}

{/* DIMENSIONS (ONLY IF EXISTS) */}
{product?.dimensions && (
  <div className="bg-white p-5 rounded-xl shadow">
    <h3 className="font-semibold text-lg text-[#2D2926]">
      Dimensions
    </h3>

    <p className="mt-2 text-gray-700">
      {product.dimensions}
    </p>
  </div>
)}

  {/* DESCRIPTION */}
  <div className="bg-white p-5 rounded-xl shadow">
    <h3 className="font-semibold text-lg text-[#2D2926]">Description</h3>

    <p className="mt-3 text-gray-700 leading-relaxed">
      {showFullDesc ? fullDescription : shortDescription}
    </p>

    <button
      onClick={() => setShowFullDesc(!showFullDesc)}
      className="mt-2 text-black font-medium underline hover:text-gray-800"
    >
      {showFullDesc ? "Read Less" : "Read More"}
    </button>
  </div>

  {/* TERMS & CONDITIONS */}
  <div className="bg-white p-5 rounded-xl shadow">
    <a
      href="/contract"
      className="font-semibold text-lg text-black underline hover:text-gray-800"
    >
      Terms & Conditions
    </a>
  </div>

</div>

        </div>
      </div>

      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

          {trustBadges.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/10">
                  <Icon className="text-black" size={26} />
                </div>
                <span className="text-[#2D2926] font-medium text-[16px]">
                  {item.label}
                </span>
              </div>
            );
          })}

        </div>
      </div>
      {/* ============================
    ADD-TO-CART POPUP
=============================== */}
{showPopup && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-xl p-6 relative">

      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-3 right-3 text-xl"
      >
        ✖
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[#2D2926] mb-4">
        Just Added to Your Bag
      </h2>

      {/* PRODUCT ROW */}
      <div className="flex items-center gap-4 border-b pb-4">
        <img
          src={addedItem.image}
          className="w-20 h-20 rounded-lg object-cover"
        />

        <div>
          <p className="font-semibold text-[#2D2926]">{addedItem.name}</p>
          <p className="text-sm text-gray-600">Qty: {addedItem.qty}</p>
<p className="font-semibold mt-1">
  $ {addedItem.price} {!isSalePage && "/ day"}
</p>
        </div>
      </div>

      {/* SUBTOTAL */}
      <div className="flex justify-between mt-4 text-lg font-semibold">
        <span>Subtotal</span>
        <span>${addedItem.price * addedItem.qty}</span>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex gap-4">
        <button
          className="flex-1 border border-gray-400 py-3 rounded-full hover:bg-gray-100"
          onClick={() => setShowPopup(false)}
        >
          Continue Shopping
        </button>
<Link to="/cart" className="flex-1">

          <button className="w-full py-3 rounded-full bg-black text-white hover:bg-gray-800">
            Bag & Checkout →
          </button>
        </Link>
      </div>

      {/* ALSO BOUGHT */}
      <div className="mt-8">
  <h3 className="text-lg font-semibold mb-3">Customers Also Bought</h3>

  <div className="grid grid-cols-2 gap-4">
    
    {/* Example item 1 */}
    <div className="border rounded-lg p-3 text-center hover:shadow-md transition">
      <img
        src={lightsImg}
        className="h-20 w-full object-cover rounded mb-2"
        alt="Warm LED Lights"
      />
      <p className="text-sm">Warm LED Lights</p>
      <p className="font-semibold mb-2">$10</p>

      <button
        type="button"
        className="w-full py-1.5 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition"
        onClick={() => {
          // future: add to cart / addons
          console.log("Add Warm LED Lights");
        }}
      >
        Add
      </button>
    </div>

    {/* Example item 2 */}
    <div className="border rounded-lg p-3 text-center hover:shadow-md transition">
      <img
        src={flowersImg}
        className="h-20 w-full object-cover rounded mb-2"
        alt="Flower Garland Set"
      />
      <p className="text-sm">Flower Garland Set</p>
      <p className="font-semibold mb-2">$15</p>

      <button
        type="button"
        className="w-full py-1.5 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition"
        onClick={() => {
          // future: add to cart / addons
          console.log("Add Flower Garland Set");
        }}
      >
        Add
      </button>
    </div>

  </div>
</div>

    </div>
  </div>
)}

    </>
  );
};

export default ProductPage;
