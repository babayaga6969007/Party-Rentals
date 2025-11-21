

import { useState } from "react";
import DatePickerModule from "react-multi-date-picker";
const DatePicker = DatePickerModule.default;

import DateObject from "react-date-object";
import { FiCalendar, FiX } from "react-icons/fi";
console.log("DatePicker type:", typeof DatePicker);

import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";

const images = [hero1, hero2, hero3, hero4];

const pricePerDay = 40; //Set your price/day

const ProductPage = () => {
  const [selectedImg, setSelectedImg] = useState(images[0]);
  const [selectedDates, setSelectedDates] = useState([]);

  // ❌ Block past dates + same day
  const today = new DateObject().add(1, "day"); // Minimum tomorrow

  // 💰 TOTAL PRICE CALCULATION
  const totalPrice = selectedDates.length * pricePerDay;

  return (
    <div className="w-full bg-[#FFF7F0] py-16 px-6">

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* LEFT — IMAGE GALLERY */}
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
                  selectedImg === img ? "border-[#8B5C42] border-4" : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="thumb"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — PRODUCT INFO */}
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
                minDate={today}    // Block past + same day
                value={selectedDates}
                onChange={setSelectedDates}
                format="MMMM DD, YYYY"
                placeholder="Select one or multiple dates"
                className="w-full"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  border: "1px solid #E6D5C3",
                }}
              />
            </div>

            {/* SHOW SELECTED DATES */}
            {selectedDates.length > 0 && (
              <div className="mt-4 bg-[#FFF7F0] p-4 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2D2926]">Selected Dates:</h4>

                  {/* CLEAR DATES BUTTON */}
                  <button
                    onClick={() => setSelectedDates([])}
                    className="text-[#8B5C42] flex items-center gap-1"
                  >
                    <FiX /> Clear
                  </button>
                </div>

                <ul className="text-gray-700 space-y-1 mt-2">
                  {selectedDates.map((date, i) => (
                    <li key={i}>• {date.format("MMMM DD, YYYY")}</li>
                  ))}
                </ul>

                <p className="mt-4 text-lg text-[#2D2926] font-semibold">
                  Total: ${totalPrice}
                </p>
              </div>
            )}
          </div>

          {/* ADD-ONS */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
              Recommended Add-Ons
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <p className="font-medium">Warm LED Lights</p>
                <p className="text-[#8B5C42] font-semibold">$10/day</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md">
                <p className="font-medium">Flower Garland Set</p>
                <p className="text-[#8B5C42] font-semibold">$15/day</p>
              </div>
            </div>
          </div>

          {/* POLICIES */}
          <div className="mt-10 text-gray-700 leading-relaxed">
            <h3 className="text-xl font-semibold text-[#2D2926] mb-3">
              Policies & Information
            </h3>
            <ul className="space-y-2">
              <li>• Delivery & pickup window depends on location.</li>
              <li>• Rush fees apply for last-minute bookings.</li>
              <li>• Damage deposit required for some items.</li>
              <li>• Free cancellation up to 24 hours before delivery.</li>
            </ul>
          </div>

          {/* CTA */}
          <button className="w-full mt-10 bg-[#8B5C42] text-white py-4 rounded-full text-lg shadow-lg hover:bg-[#704A36] transition">
            Add to Cart
          </button>
        </div>
      </div>


      {/* TRUST BADGES WITH HOVER ANIMATION */}
      <div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {["Secure Payments", "Fast Customer Support", "Verified Quality", "Hassle-Free Rentals"].map(
          (label, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl shadow hover:shadow-xl hover:scale-105 transform transition-all duration-300"
            >
              {label}
            </div>
          )
        )}
      </div>

    </div>
  );
};

export default ProductPage;
