import { memo, useState } from "react";
import { useSignage } from "../../context/SignageContext";

const TextSizeSelector = memo(() => {
  const { 
    selectedSize, 
    setSelectedSize, 
    textSizes, 
    textSizesConfig,
    configLoading,
  } = useSignage();

  // Generate sizes from textSizes object, using label from config if available
  const sizes = Object.keys(textSizes).map((key) => {
    // Try to find label from config
    const configSize = textSizesConfig?.find(s => s.key === key);
    const label = configSize?.label || key.toUpperCase();
    const price = textSizes[key]?.price || 0;
    
    return {
      key,
      label,
      price,
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
      <div className="flex gap-2">
        {sizes.map((size) => (
          <button
            key={size.key}
            onClick={() => setSelectedSize(size.key)}
            className={`flex-1 px-3 py-2 rounded-lg border-2 transition text-sm ${
              selectedSize === size.key
                ? "border-[#8B5C42] bg-[#FFF7F0] text-[#8B5C42] font-semibold"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex flex-col items-center">
              <span>{size.label}</span>
              <span className={`text-xs mt-0.5 ${
                selectedSize === size.key
                  ? "text-[#8B5C42]"
                  : "text-gray-500"
              }`}>
                ${size.price || 0}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

TextSizeSelector.displayName = "TextSizeSelector";

export default TextSizeSelector;
