import { memo } from "react";
import { useSignage } from "../../context/SignageContext";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const STEP = 0.1;

const TextScaleControl = memo(() => {
  const { userTextScale, setUserTextScale } = useSignage();

  const handleChange = (e) => {
    const v = parseFloat(e.target.value);
    if (!Number.isNaN(v)) setUserTextScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, v)));
  };

  const setScale = (v) => {
    setUserTextScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, v)));
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-3">Text Scale</h3>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setScale(userTextScale - STEP)}
          disabled={userTextScale <= MIN_SCALE}
          className="w-9 h-9 rounded-lg border border-gray-300 bg-white font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          −
        </button>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={STEP}
            value={userTextScale}
            onChange={handleChange}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-black"
          />
          <span className="text-sm font-medium text-[#2D2926] w-12">
            {Math.round(userTextScale * 100)}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => setScale(userTextScale + STEP)}
          disabled={userTextScale >= MAX_SCALE}
          className="w-9 h-9 rounded-lg border border-gray-300 bg-white font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
});

TextScaleControl.displayName = "TextScaleControl";
export default TextScaleControl;
