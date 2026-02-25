import { memo } from "react";
import { useSignage, VERTICAL_BOARD_OPTIONS } from "../../context/SignageContext";

const VerticalBoardSelector = memo(() => {
  const { verticalBoardImageUrl, setVerticalBoardImageUrl } = useSignage();

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-2">
        Board style
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Choose the vertical board image (background stays fixed)
      </p>
      <div className="grid grid-cols-2 gap-2">
        {VERTICAL_BOARD_OPTIONS.map((opt) => (
          <button
            key={opt.path}
            type="button"
            onClick={() => setVerticalBoardImageUrl(opt.path)}
            className={`rounded-lg border-2 overflow-hidden transition ${
              verticalBoardImageUrl === opt.path
                ? "border-black ring-2 ring-black ring-offset-1"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <img
              src={opt.path}
              alt={opt.label}
              className="w-full h-20 object-contain object-bottom bg-gray-100"
            />
            <span className="block text-xs font-medium text-gray-700 py-1.5">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

VerticalBoardSelector.displayName = "VerticalBoardSelector";
export default VerticalBoardSelector;
