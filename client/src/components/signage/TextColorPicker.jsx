import { memo } from "react";
import { useSignage } from "../../context/SignageContext";

const PRESET_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Gold", value: "#FFD700" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#00FF00" },
  { name: "Purple", value: "#800080" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Orange", value: "#FFA500" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Brown", value: "#8B5C42" },
];

const TextColorPicker = memo(() => {
  const { selectedTextColor, setSelectedTextColor } = useSignage();

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
        Text Color
      </h3>
      
      {/* Preset Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preset Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedTextColor(color.value)}
              className={`w-full h-10 rounded-lg border-2 transition ${
                selectedTextColor.toUpperCase() === color.value.toUpperCase()
                  ? "border-[#8B5C42] ring-2 ring-[#8B5C42] ring-offset-1"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedTextColor}
            onChange={(e) => setSelectedTextColor(e.target.value)}
            className="w-12 h-10 cursor-pointer"
            style={{ 
              border: "none",
              outline: "none",
              padding: 0,
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              background: "none",
            }}
          />
          <div className="flex-1 text-sm text-gray-600">
            {selectedTextColor.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
});

TextColorPicker.displayName = "TextColorPicker";

export default TextColorPicker;
