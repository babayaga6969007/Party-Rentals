import { useState } from "react";
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

// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];

const ProductPage = () => {
  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

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
    setActiveImage((prev) => (prev + 1) % productImages.length);
  };

  const handlePrev = () => {
    setActiveImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  // Base product price
  const pricePerDay = 40;

  // Quantity of main product
  const [productQty, setProductQty] = useState(1);
  const handleProductQtyChange = (inc) => {
    setProductQty((prev) => Math.max(1, prev + inc));
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
  const addonsTotal = addons.lights * 10 + addons.flowers * 15;

  // Final total price
// priority: use date range if selected, else manual days input
const totalRentalDays = selectedDays > 0 ? selectedDays : days;

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
    src={productImages[activeImage]}
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
  {productImages.map((img, i) => (
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
            Wedding Golden Arch Backdrop
          </h1>

          {/* Price */}
          <p className="text-3xl font-semibold text-[#8B5C42]">
            ${pricePerDay}
          </p>

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

        


          {/* TOTAL */}
         <div className="mt-8 text-2xl font-semibold text-[#2D2926]">
  Total : 
  ${totalPrice}
</div>


          {/* BUTTON */}
          <button className="mt-8 w-full bg-[#8B5C42] text-white py-3 rounded-lg">
            Add to cart
          </button>

          {/* ⭐ ACCORDIONS BELOW BUTTON */}
          <div className="mt-10 space-y-4">

            {/* DESCRIPTION */}
            <details open className="bg-white p-5 rounded-xl shadow">
              <summary className="font-semibold text-lg cursor-pointer text-[#2D2926]">
                Description
              </summary>
              <p className="mt-3 text-gray-700">
                High-quality decorative arch backdrop perfect for events.
                Durable, elegant, and customizable with add-ons.
              </p>
            </details>

            {/* STOCK */}
            <details className="bg-white p-5 rounded-xl shadow">
              <summary className="font-semibold text-lg cursor-pointer text-[#2D2926]">
                Stock Availability
              </summary>
              <p className="mt-3 text-gray-700">
                Available stock: <strong>5 units</strong>.
              </p>
            </details>

            {/* TERMS */}
            <details className="bg-white p-5 rounded-xl shadow">
              <summary className="font-semibold text-lg cursor-pointer text-[#2D2926]">
                Terms & Conditions
              </summary>
              <p className="mt-3 text-gray-700">
                • Payment required before dispatch. <br />
                • Damages may incur additional charges. <br />
                • Cancellation allowed up to 48 hours before event.
              </p>
            </details>

          </div>
        </div>
      </div>

      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="bg-[#FAF7F5] border border-[#E5DED6] rounded-2xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

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
    </>
  );
};

export default ProductPage;
