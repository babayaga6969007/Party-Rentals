import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import AddToCartModal from "../../components/cart/AddToCartModal";

import {
  FiLock,
  FiHeadphones,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import lightsImg from "../../assets/addons/lights.png";
import flowersImg from "../../assets/addons/flowers.png";


// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];


const ProductPage = () => {
    // ====================
  //  PRODUCT DATA (BACKEND)
  // ====================
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [openModal, setOpenModal] = useState(false);
const [chosenProduct, setChosenProduct] = useState(null);
const [chosenAddons, setChosenAddons] = useState([]);

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
    // Product images from backend
  const productImages = product?.images?.map((img) => img.url) || [];

  const [activeImage, setActiveImage] = useState(0);

  const handleNext = () => {
    setActiveImage((prev) => (prev + 1) % productImages.length);
  };

  const handlePrev = () => {
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
const fullDescription =
  product?.description || "No description available.";



const shortDescription = fullDescription.substring(0, 120) + "...";

const [showFullDesc, setShowFullDesc] = useState(false);


  // Date selection
  const [selectedDate, setSelectedDate] = useState("");

  // Add-on total calculation
  const addonsTotal = addons.lights * 10 + addons.flowers * 15;

  // Final total price
// priority: use date range if selected, else manual days input
const totalRentalDays = selectedDays;
const pricePerDay = Number(product?.pricePerDay || 0);

const totalPrice =
  totalRentalDays * pricePerDay * productQty + addonsTotal;

  const maxStock = product?.availabilityCount ?? 1;

    // ====================
  //  FETCH SINGLE RENTAL PRODUCT
  // ====================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

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
//  SYNC QTY WITH STOCK
// ====================
useEffect(() => {
  if (product && productQty > maxStock) {
    setProductQty(maxStock);
  }
}, [product, maxStock]);


if (loadingProduct) {
  return <div className="max-w-7xl mx-auto px-6 py-20">Loading...</div>;
}

if (productError) {
  return <div className="max-w-7xl mx-auto px-6 py-20">{productError}</div>;
}

if (!product) {
  return <div className="max-w-7xl mx-auto px-6 py-20">Product not found</div>;
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
  src={productImages[activeImage] || ""}
  className="w-full h-full object-cover"
  alt={product?.title || "Product"}
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
          i === activeImage ? "border-[#8B5C42]" : "border-transparent"
        }`}
      />
    ))}
  </div>
)}



          {/* ⭐ RECOMMENDED ADDONS UNDER IMAGE */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
              Recommended Add-Ons
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {/* Lights Add-on */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img
                  src={lightsImg}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                />
                <p className="font-medium">Warm LED Lights</p>
                <p className="text-[#8B5C42] font-semibold">$10/day</p>

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
                    className="px-3 py-1 bg-[#8B5C42] text-white rounded"
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
                <p className="text-[#8B5C42] font-semibold">$15/day</p>

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
                    className="px-3 py-1 bg-[#8B5C42] text-white rounded"
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
  <p className="text-3xl font-semibold text-[#8B5C42]">
$ {pricePerDay} / day
  </p>

  {/* Stock — beside price on desktop, below on mobile */}
  <div className="mt-2 md:mt-0 bg-[#FFF7F0] border border-[#E5DED6] rounded-lg px-4 py-2 inline-block">
    <p className="text-sm font-medium text-[#2D2926]">
      Stock Availability: <span className="text-[#8B5C42] font-semibold">
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
        : "bg-[#8B5C42] hover:bg-[#704A36]"
    }
  `}
>
  +
</button>

          </div>




{/* EVENT DATE SELECTION */}
<div className="mt-6 bg-[#FAF7F5] p-5 rounded-xl border border-[#E5DED6]">
  <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
    Event Date
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* START DATE */}
    <div>
      <label className="block mb-1 text-sm text-gray-600">
        Start Date
      </label>
      <input
        type="date"
        min={today}
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setEndDate("");
        }}
        className="w-full p-3 border rounded-lg"
      />
    </div>

    {/* END DATE */}
    <div>
      <label className="block mb-1 text-sm text-gray-600">
        End Date
      </label>
      <input
        type="date"
        min={startDate || today}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        disabled={!startDate}
        className="w-full p-3 border rounded-lg disabled:bg-gray-100"
      />
    </div>
  </div>

  {/* DATE SUMMARY */}
  <div className="mt-4 bg-white p-4 rounded-lg border text-sm text-[#2D2926]">
    {!startDate && <p>Please select an event start date.</p>}

    {startDate && !endDate && (
      <p>
        Event starts on <strong>{formatDate(startDate)}</strong>
      </p>
    )}

    {startDate && endDate && (
      <p>
        Event duration:{" "}
        <strong>
          {formatDate(startDate)} – {formatDate(endDate)}
        </strong>
        <br />
        Total Rental Days:{" "}
        <strong>{selectedDays} day{selectedDays > 1 ? "s" : ""}</strong>
      </p>
    )}
  </div>
</div>


          {/* TOTAL */}
         <div className="mt-8 text-2xl font-semibold text-[#2D2926]">
  Total ({totalRentalDays} {totalRentalDays === 1 ? "day" : "days"}): 
  ${totalPrice}
</div>


          {/* BUTTON */}
          {/* CONFIRM BOOKING BUTTON */}
{/* CONFIRM BOOKING BUTTON */}
<button
  type="button"
  disabled={!startDate || !endDate}
  onClick={() => {
    if (!startDate || !endDate) return;

    const selectedAddons = [];

    if (addons.lights > 0) {
      selectedAddons.push({
        name: "Warm LED Lights",
        qty: addons.lights,
        price: 10,
      });
    }

    if (addons.flowers > 0) {
      selectedAddons.push({
        name: "Flower Garland Set",
        qty: addons.flowers,
        price: 15,
      });
    }

  setChosenProduct({
  name: product?.title || "Product",
  qty: productQty,
  pricePerDay,
  image: productImages[0],
  startDate,
  endDate,
  totalPrice,
});


    setChosenAddons(selectedAddons);
    setOpenModal(true);
  }}
  className={`
    mt-8 w-full py-3 rounded-lg text-sm font-semibold transition-all
    ${
      !startDate || !endDate
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-[#8B5C42] text-white hover:bg-[#704A36]"
    }
  `}
>
  {!startDate || !endDate
    ? "Select Event Dates to Continue"
    : "Confirm Booking"}
</button>




          <div className="mt-10 space-y-4">

  {/* DESCRIPTION */}
  <div className="bg-white p-5 rounded-xl shadow">
    <h3 className="font-semibold text-lg text-[#2D2926]">Description</h3>

    <p className="mt-3 text-gray-700 leading-relaxed">
      {showFullDesc ? fullDescription : shortDescription}
    </p>

    <button
      onClick={() => setShowFullDesc(!showFullDesc)}
      className="mt-2 text-[#8B5C42] font-medium underline"
    >
      {showFullDesc ? "Read Less" : "Read More"}
    </button>
  </div>

  {/* TERMS & CONDITIONS */}
  <div className="bg-white p-5 rounded-xl shadow">
    <a
      href="/"
      className="font-semibold text-lg text-[#8B5C42] underline hover:text-[#704A36]"
    >
      Terms & Conditions
    </a>
  </div>

</div>

        </div>
      </div>

      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
<div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
  <div className="bg-[#FAF7F5] border border-[#E5DED6] rounded-2xl py-6 px-8 
                  flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

    {trustBadges.map((item, index) => {
      const Icon = item.icon;
      return (
        <div key={index} className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#8B5C42]/10">
            <Icon className="text-[#8B5C42]" size={26} />
          </div>
          <span className="text-[#2D2926] font-medium text-[16px]">
            {item.label}
          </span>
        </div>
      );
    })}
  </div>
</div>

{/* ⭐ MODAL — MUST BE OUTSIDE MAP & INSIDE RETURN */}
<AddToCartModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  product={chosenProduct}
  addons={chosenAddons}
  onGoToCart={() => {
    setOpenModal(false);
    window.location.href = "/cart";
  }}
  onAddRecommended={(item) => {
    console.log("User added:", item);
  }}
/>

    </>
  );
};

export default ProductPage;
