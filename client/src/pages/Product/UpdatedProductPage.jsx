import { useState } from "react";
import { Link } from "react-router-dom";
import AddToCartModal from "../../components/cart/AddToCartModal";

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

const productImages = [hero1, hero2, hero3, hero4];
// ✅ VARIATIONS (table size variants)
const VARIANTS = [
  { key: "10x10", label: "10×10", title: "Wedding Golden Arch Backdrop (10×10)", pricePerDay: 85, images: [hero1, hero2, hero3, hero4] },
  { key: "10x8",  label: "10×8",  title: "Wedding Golden Arch Backdrop (10×8)",  pricePerDay: 75, images: [hero2, hero3, hero4, hero1] },
  { key: "8x8",   label: "8×8",   title: "Wedding Golden Arch Backdrop (8×8)",   pricePerDay: 65, images: [hero3, hero4, hero1, hero2] },
  { key: "6x7",   label: "6×7",   title: "Wedding Golden Arch Backdrop (6×7)",   pricePerDay: 55, images: [hero4, hero1, hero2, hero3] },
  { key: "4x8",   label: "4×8",   title: "Wedding Golden Arch Backdrop (4×8)",   pricePerDay: 50, images: [hero1, hero3, hero2, hero4] },
  { key: "4x7",   label: "4×7",   title: "Wedding Golden Arch Backdrop (4×7)",   pricePerDay: 45, images: [hero2, hero4, hero3, hero1] },
  { key: "3x7",   label: "3×7",   title: "Wedding Golden Arch Backdrop (3×7)",   pricePerDay: 40, images: [hero3, hero1, hero4, hero2] },
];


// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];

const BASIC_COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Rose", hex: "#E8A0A8" },
  { name: "Navy", hex: "#0B1F3A" },
];


const ProductPage = () => {
  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [openModal, setOpenModal] = useState(false);
const [chosenProduct, setChosenProduct] = useState(null);
const [chosenAddons, setChosenAddons] = useState([]);
const [selectedColor, setSelectedColor] = useState(BASIC_COLORS[0].name);
const [useCustomColor, setUseCustomColor] = useState(false);
const [customHex, setCustomHex] = useState("");


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
  // ✅ Selected variant
const [selectedVariantKey, setSelectedVariantKey] = useState("10x10");
const selectedVariant = VARIANTS.find(v => v.key === selectedVariantKey) || VARIANTS[0];

// ✅ Use variant images instead of fixed productImages
const variantImages = selectedVariant.images;


 const handleNext = () => {
  setActiveImage((prev) => (prev + 1) % variantImages.length);
};

const handlePrev = () => {
  setActiveImage((prev) => (prev === 0 ? variantImages.length - 1 : prev - 1));
};


  // Base product price
const pricePerDay = selectedVariant.pricePerDay;

  // Quantity of main product
  const [productQty, setProductQty] = useState(1);
  const handleProductQtyChange = (inc) => {
    setProductQty((prev) => Math.max(1, prev + inc));
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
  "High-quality decorative arch backdrop perfect for events. Durable, elegant, and customizable with add-ons. This stunning backdrop enhances weddings, birthdays, parties, photoshoots, and corporate events. Built with premium material for stability and available in multiple colors and custom add-ons.";

const shortDescription = fullDescription.substring(0, 120) + "...";

const [showFullDesc, setShowFullDesc] = useState(false);


  // Date selection
  const [selectedDate, setSelectedDate] = useState("");

  // Add-on total calculation
  const addonsTotal = addons.lights * 10 + addons.flowers * 15;

  // Final total price
// priority: use date range if selected, else manual days input
const totalRentalDays = selectedDays;

const totalPrice =
  totalRentalDays * pricePerDay * productQty + addonsTotal;

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
src={variantImages[activeImage]}
    className="w-full h-full object-cover"
    alt="Product"
  />

  {/* LEFT ARROW */}
  <button
    onClick={handlePrev}
    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❮
  </button>

  {/* RIGHT ARROW */}
  <button
    onClick={handleNext}
    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❯
  </button>

</div>


          {/* THUMBNAILS */}
<div className="grid grid-cols-4 gap-3 mt-4">
{variantImages.map((img, i) => (
    <img
      key={i}
      src={img}
      onClick={() => setActiveImage(i)}
      className={`
        w-full h-20 object-cover rounded-xl shadow cursor-pointer 
        transition border-2 
        ${i === activeImage ? "border-[#8B5C42]" : "border-transparent"}
      `}
    />
  ))}
</div>


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
{selectedVariant.title}
          </h1>

          {/* PRICE + STOCK (Responsive layout) */}
<div className="mt-2 flex flex-col md:flex-row md:items-center md:gap-6">

  {/* Price */}
  <p className="text-3xl font-semibold text-[#8B5C42]">
    ${pricePerDay}/Day
  </p>

  {/* Stock — beside price on desktop, below on mobile */}
  <div className="mt-2 md:mt-0 bg-[#FFF7F0] border border-[#E5DED6] rounded-lg px-4 py-2 inline-block">
    <p className="text-sm font-medium text-[#2D2926]">
      Stock Availability: <span className="text-[#8B5C42] font-semibold">5</span>
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
              className="px-3 py-1 bg-[#8B5C42] text-white rounded"
            >
              +
            </button>
          </div>


{/* ✅ SIZE / VARIANT DROPDOWN */}
<div className="mt-6">
  <label className="block mb-2 text-[#2D2926] font-medium">
    Size (Select Variant)
  </label>

  <select
    value={selectedVariantKey}
    onChange={(e) => {
      setSelectedVariantKey(e.target.value);
      setActiveImage(0); // reset gallery to first image when variant changes
    }}
    className="w-full p-3 rounded-lg border border-[#E5DED6] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
  >
    {VARIANTS.map((v) => (
      <option key={v.key} value={v.key}>
        {v.label}
      </option>
    ))}
  </select>
</div>

{/* ✅ COLOR SELECTION */}
<div className="mt-6 bg-[#FAF7F5] p-5 rounded-xl border border-[#E5DED6]">
  <h3 className="text-lg font-semibold text-[#2D2926] mb-3">
    Choose Color
  </h3>

  <div className="flex flex-wrap items-center gap-3">
    {BASIC_COLORS.map((c) => (
      <button
        key={c.name}
        type="button"
        onClick={() => {
          setSelectedColor(c.name);
          setUseCustomColor(false);
          setCustomHex("");
        }}
        className={`
          px-3 py-2 rounded-xl border text-sm font-medium transition
          ${!useCustomColor && selectedColor === c.name
            ? "border-[#8B5C42] bg-white"
            : "border-[#E5DED6] bg-white hover:border-gray-400"}
        `}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-[#2D2926]">{c.name}</span>
        </div>
      </button>
    ))}

    {/* Custom color button */}
    <button
      type="button"
      onClick={() => {
        window.open("https://www.behr.com/consumer#", "_blank", "noopener,noreferrer");
        setUseCustomColor(true);
        setSelectedColor("Custom");
      }}
      className={`
        px-4 py-2 rounded-xl border text-sm font-semibold transition
        ${useCustomColor
          ? "border-[#8B5C42] bg-[#8B5C42] text-white"
          : "border-[#E5DED6] bg-white hover:border-gray-400"}
      `}
    >
      Custom color
    </button>
  </div>

  {/* Show HEX input only if custom */}
  {useCustomColor && (
    <div className="mt-4">
      <label className="block mb-2 text-sm text-gray-600">
        Custom Color HEX
      </label>
      <input
        type="text"
        value={customHex}
        onChange={(e) => setCustomHex(e.target.value)}
        placeholder="Put the color code in HEX here"
        className="w-full p-3 rounded-lg border border-[#E5DED6] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
      />
    </div>
  )}
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
name: selectedVariant.title,
color: useCustomColor ? customHex || "Custom" : selectedColor,
variant: selectedVariantKey,
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
      href="/contract"
      target="_blank"
      rel="noopener noreferrer"
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
