import { memo, useEffect } from "react";
import {
  useSignage,
  normalizeHexColor,
  ACRYLIC_TEXT_COLORS,
} from "../../context/SignageContext";

const TextColorPicker = memo(() => {
  const { selectedTextColor, setSelectedTextColor, signageType } = useSignage();

  const isAcrylic = signageType === "acrylic";

  useEffect(() => {
    if (!isAcrylic) return;
    const allowed = new Set(
      ACRYLIC_TEXT_COLORS.map((c) => normalizeHexColor(c.value).toUpperCase())
    );
    const current = normalizeHexColor(selectedTextColor).toUpperCase();
    if (!allowed.has(current)) {
      setSelectedTextColor(normalizeHexColor(ACRYLIC_TEXT_COLORS[0].value));
    }
  }, [isAcrylic, selectedTextColor, setSelectedTextColor]);

  if (!isAcrylic) {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
        Text Color
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preset Colors
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACRYLIC_TEXT_COLORS.map((color) => {
            const normalized = normalizeHexColor(color.value);
            const selected =
              normalizeHexColor(selectedTextColor).toUpperCase() ===
              normalized.toUpperCase();
            const swatchStyle = color.swatch
              ? { background: color.swatch }
              : { backgroundColor: color.value };

            return (
              <button
                key={`${color.name}-${color.value}`}
                type="button"
                onClick={() => setSelectedTextColor(normalized)}
                className={`w-full h-10 rounded-lg border-2 transition ${
                  selected
                    ? "border-black ring-2 ring-black ring-offset-1"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={swatchStyle}
                title={color.name}
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mirrored gold and silver are approximated in the preview; finished signs use mirrored acrylic.
        </p>
      </div>
    </div>
  );
});

TextColorPicker.displayName = "TextColorPicker";

export default TextColorPicker;
