import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { FiPlus, FiTrash2 } from "react-icons/fi";

/* ---------------- DEMO DATA ---------------- */

const initialColors = [
  { id: 1, name: "White", hex: "#FFFFFF" },
  { id: 2, name: "Black", hex: "#000000" },
  { id: 3, name: "Gold", hex: "#D4AF37" },
  { id: 4, name: "Rose Gold", hex: "#B76E79" },
  { id: 5, name: "Pastel Pink", hex: "#F6C1CC" },
];

const initialTags = [
  "Indoor",
  "Outdoor",
  "Premium",
  "Budget",
  "Wedding",
  "Birthday",
  "Corporate",
];

const initialSizes = [
  "Small",
  "Medium",
  "Large",
  "Extra Large",
];

/* ---------------- PAGE ---------------- */

const Attributes = () => {
  const [colors, setColors] = useState(initialColors);
  const [tags, setTags] = useState(initialTags);
  const [sizes, setSizes] = useState(initialSizes);

  return (
    <AdminLayout>

      {/* PAGE HEADER */}
      <div className=" mb-10">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Attributes
        </h1>
        <p className="text-gray-600 mt-1">
          Manage global attributes used across all products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ---------------- COLORS ---------------- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2D2926]">
              Colors
            </h2>
            <button className="text-[#8B5C42] hover:opacity-70">
              <FiPlus />
            </button>
          </div>

          <div className="space-y-3">
            {colors.map((color) => (
              <div
                key={color.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <span className="font-medium text-[#2D2926]">
                    {color.name}
                  </span>
                </div>

                <button className="text-red-500 hover:opacity-70">
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- TAGS ---------------- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2D2926]">
              Tags
            </h2>
            <button className="text-[#8B5C42] hover:opacity-70">
              <FiPlus />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F5] text-sm text-[#2D2926]"
              >
                {tag}
                <button className="text-red-500 hover:opacity-70">
                  <FiTrash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- SIZES ---------------- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2D2926]">
              Sizes
            </h2>
            <button className="text-[#8B5C42] hover:opacity-70">
              <FiPlus />
            </button>
          </div>

          <ul className="space-y-3">
            {sizes.map((size, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <span className="font-medium text-[#2D2926]">
                  {size}
                </span>
                <button className="text-red-500 hover:opacity-70">
                  <FiTrash2 />
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* FOOT NOTE */}
      <p className="text-sm text-gray-500 mt-8">
        Attributes are shared across all products. Changes here affect
        product filtering, display, and availability logic.
      </p>

    </AdminLayout>
  );
};

export default Attributes;
