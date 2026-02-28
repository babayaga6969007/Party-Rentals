import { memo } from "react";
import { FiHelpCircle } from "react-icons/fi";
import TextInputSection from "./TextInputSection";
import FontSelector from "./FontSelector";
import TextColorPicker from "./TextColorPicker";
import VerticalBoardSelector from "./VerticalBoardSelector";
import AddToCartButton from "./AddToCartButton";
import { useSignage } from "../../context/SignageContext";

const SignageControls = memo(({ isSharedView, onAddToCart, isAddingToCart, product, productId, navigate }) => {
  const { signageType, setSignageType, rushProduction, setRushProduction } = useSignage();

  const rushTooltip = "Check if you need the sign within 3–5 days. Rush production adds 30% to the initial price (excluding print file preparation).";

  return (
    <div className="lg:col-span-1 relative flex flex-col max-h-[calc(100vh-280px)] min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-2">
        {!isSharedView && (
          <>
            {/* Signage type: Acrylic | Vinyl — outline only on selected */}
            <div className="bg-white p-5 rounded-xl shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">Signage type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSignageType("acrylic")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition bg-transparent ${
                    signageType === "acrylic"
                      ? "border-2 border-black text-black"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Acrylic
                </button>
                <button
                  type="button"
                  onClick={() => setSignageType("vinyl")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition bg-transparent ${
                    signageType === "vinyl"
                      ? "border-2 border-black text-black"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Vinyl
                </button>
              </div>
            </div>

            <TextInputSection />
            <FontSelector />
            <TextColorPicker />
            <VerticalBoardSelector />

            {/* Rush production: last in section — sign within 3–5 days, +30% of initial (excl. print prep) */}
            <div className="bg-white p-5 rounded-xl shadow">
              <div className="flex items-start gap-3" title={rushTooltip}>
                <input
                  type="checkbox"
                  id="rush-production"
                  checked={rushProduction}
                  onChange={(e) => setRushProduction(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-black focus:ring-black focus:ring-offset-0"
                />
                <label htmlFor="rush-production" className="flex-1 cursor-pointer flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Rush production</span>
                  <FiHelpCircle className="w-4 h-4 text-gray-400 shrink-0 cursor-help" title={rushTooltip} aria-label={rushTooltip} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 ml-7" title={rushTooltip}>
                Need your sign within 3–5 days? Adds +30% to initial price (print file preparation not included).
              </p>
            </div>
          </>
        )}
        {isSharedView && (
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-600 text-center">
              This is a shared view. You can view it but cannot edit.
            </p>
            <button
              onClick={() => {
                if (product) {
                  navigate(`/product/${product._id || productId}`);
                } else {
                  navigate("/shop");
                }
              }}
              className="w-full mt-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              View Product
            </button>
          </div>
        )}
      </div>
      {!isSharedView && (
        <div className="shrink-0 pt-4">
          <AddToCartButton onClick={onAddToCart} isLoading={isAddingToCart} />
        </div>
      )}
    </div>
  );
});

SignageControls.displayName = "SignageControls";

export default SignageControls;
