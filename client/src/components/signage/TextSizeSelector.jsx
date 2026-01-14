import { memo, useState } from "react";
import { useSignage } from "../../context/SignageContext";

const TextSizeSelector = memo(() => {
  const { 
    selectedSize, 
    setSelectedSize, 
    textSizes, 
    configLoading,
    useCustomSize,
    setUseCustomSize,
    customSize,
    setCustomSize,
  } = useSignage();

  // Generate sizes from textSizes object
  const sizes = Object.keys(textSizes).map((key) => {
    const labelMap = {
      small: "S",
      medium: "MD",
      large: "LG",
      extralarge: "XL",
    };
    return {
      key,
      label: labelMap[key] || key.toUpperCase(),
    };
  });

  if (configLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Text Size</h3>
        <div className="text-gray-500">Loading sizes...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
        Text Size
      </h3>
      
      {/* Predefined Sizes */}
      <div className="flex gap-2 mb-4">
        {sizes.map((size) => (
          <button
            key={size.key}
            onClick={() => {
              setSelectedSize(size.key);
              setUseCustomSize(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg border-2 transition text-sm ${
              !useCustomSize && selectedSize === size.key
                ? "border-[#8B5C42] bg-[#FFF7F0] text-[#8B5C42] font-semibold"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>

      {/* Custom Size Toggle */}
      <div className="mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useCustomSize}
            onChange={(e) => setUseCustomSize(e.target.checked)}
            className="w-4 h-4 text-[#8B5C42]"
          />
          <span className="text-sm text-gray-700">Use Custom Size</span>
        </label>
      </div>

      {/* Custom Size Inputs */}
      {useCustomSize && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
            <input
              type="number"
              value={customSize.width}
              onChange={(e) => setCustomSize({ ...customSize, width: Number(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border rounded text-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
            <input
              type="number"
              value={customSize.height}
              onChange={(e) => setCustomSize({ ...customSize, height: Number(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border rounded text-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Size (px)</label>
            <input
              type="number"
              value={customSize.fontSize}
              onChange={(e) => setCustomSize({ ...customSize, fontSize: Number(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 border rounded text-sm"
              min="1"
            />
          </div>
        </div>
      )}
    </div>
  );
});

TextSizeSelector.displayName = "TextSizeSelector";

export default TextSizeSelector;
