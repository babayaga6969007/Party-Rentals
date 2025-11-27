import { useState } from "react";
import DatePickerModule from "react-multi-date-picker";
const DatePicker = DatePickerModule.default;
import { FiLock, FiHeadphones, FiCheckCircle, FiRefreshCw } from "react-icons/fi";


import DateObject from "react-date-object";
import { FiX } from "react-icons/fi";

// gallery images (just reusing your hero images as sample product gallery)
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";

// add-on preview images 
import lightsImg from "../../assets/home2/hero1.png";
import flowersImg from "../../assets/home2/hero2.png";

const images = [hero1, hero2, hero3, hero4];

const pricePerDay = 40; // base rental per day
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];

const ProductPage = () => {
  const [selectedImg, setSelectedImg] = useState(images[0]);
  const [selectedDates, setSelectedDates] = useState([]);

  const [addons, setAddons] = useState({
    lights: 0,
    flowers: 0,
  });

  // Minimum date: tomorrow
  const today = new DateObject().add(1, "day");

  // --- ADDON HANDLER ---
  const handleAddonChange = (type, increment) => {
    setAddons((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment),
    }));
  };

  // --- CALCULATE TOTAL PRICE ---
  const days = selectedDates.length;
  const addonsTotal =
    addons.lights * 10 * days + addons.flowers * 15 * days;

  const totalPrice = days * pricePerDay + addonsTotal;

  return (
    <div className="w-full bg-[#FFF7F0] py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LEFT — GALLERY */}
        <div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-[420px] bg-white">
            <img
              src={selectedImg}
              className="w-full h-full object-cover"
              alt="product"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 mt-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImg(img)}
                className={`w-24 h-24 rounded-xl overflow-hidden border cursor-pointer ${
                  selectedImg === img
                    ? "border-[#8B5C42] border-4"
                    : "border-transparent"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — DETAILS */}
        <div>
          <h1
            className="text-4xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Elegant Golden Backdrop Stand
          </h1>

          <p className="text-gray-600 mt-2">
            Premium metal frame • 8ft x 6ft • Ideal for events and ceremonies.
          </p>

          <p className="text-3xl font-bold text-[#8B5C42] mt-6">
            ${pricePerDay}/day
          </p>

          {/* DATE SELECTION */}
          <div className="bg-white p-5 rounded-2xl shadow-md mt-6">
            <h3 className="text-xl font-semibold text-[#2D2926] mb-4">
              Select Rental Dates
            </h3>

            <div className="bg-[#FFF7F0] p-4 rounded-xl">
              <DatePicker
  multiple
  minDate={today}
  value={selectedDates}
  format="MMMM DD, YYYY"
  placeholder="Click Here For Choosing"
  inputClass="custom-date-input"   // ← ADD THIS LINE

  // ENFORCE CONSECUTIVE DATES
  onChange={(dates) => {
    if (!dates || dates.length === 0) {
      setSelectedDates([]);
      return;
    }

    if (dates.length === 1) {
      setSelectedDates(dates);
      return;
    }

    const sorted = [...dates].sort((a, b) => a - b);
    const fullRange = [];
    let curr = new DateObject(sorted[0]);
    const end = sorted[sorted.length - 1];

    while (curr <= end) {
      fullRange.push(new DateObject(curr));
      curr = curr.add(1, "day");
    }

    setSelectedDates(fullRange);
  }}

  style={{
    width: "100%",
    padding: "14px",  // wider
    borderRadius: "12px",
    fontSize: "16px",
    border: "1px solid #E6D5C3",
  }}
/>

            </div>

            {/* SHOW RANGE */}
            {selectedDates.length > 0 && (
              <div className="mt-4 bg-[#FFF7F0] p-4 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2D2926]">Selected Range:</h4>

                  <button
                    onClick={() => setSelectedDates([])}
                    className="text-[#8B5C42] flex items-center gap-1"
                  >
                    <FiX /> Clear
                  </button>
                </div>

                <p className="text-gray-700 mt-2">
                  {selectedDates[0].format("MMMM DD, YYYY")} →{" "}
                  {selectedDates[selectedDates.length - 1].format("MMMM DD, YYYY")}
                </p>

                <p className="mt-4 text-lg text-[#2D2926] font-semibold">
                   Total: ${totalPrice}
                </p>
              </div>
            )}
          </div>

          {/* ADD ONS */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
              Recommended Add-Ons
            </h3>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Lights */}
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

              {/* Flowers */}
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

          <button className="w-full mt-10 bg-[#8B5C42] text-white py-4 rounded-full text-lg shadow-lg hover:bg-[#704A36] transition">
            Add to Cart
          </button>
          
        </div>
        

      </div>
      {/* TRUST BADGES WITH ICONS */}
<div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
  {trustBadges.map(({ label, icon: Icon }, i) => (
    <div
      key={i}
      className="p-5 bg-white rounded-xl shadow hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex flex-col items-center gap-3"
    >
      <Icon className="text-[#8B5C42]" size={28} />
      <span className="text-sm font-medium text-[#2D2926]">{label}</span>
    </div>
  ))}
</div>
    </div>
  );
};

export default ProductPage;
