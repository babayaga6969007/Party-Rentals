import { memo } from "react";
import { useSignage } from "../../context/SignageContext";

const FontSelector = memo(() => {
  const { selectedFont, setSelectedFont, fonts, configLoading } = useSignage();

  if (configLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-[#2D2926] mb-4">Font</h3>
        <div className="text-gray-500">Loading fonts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
        Font
      </h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => setSelectedFont(font.value)}
              className={`shrink-0 px-4 py-3 rounded-lg border-2 transition ${
                selectedFont === font.value
                  ? "border-[#8B5C42] bg-[#FFF7F0]"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ fontFamily: font.value }}
            >
              <div className="text-lg font-semibold">Aa</div>
              <div className="text-xs mt-1 text-gray-600">{font.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

FontSelector.displayName = "FontSelector";

export default FontSelector;
