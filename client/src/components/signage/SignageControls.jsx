import { memo } from "react";
import TextInputSection from "./TextInputSection";
import TextSizeSelector from "./TextSizeSelector";
import FontSelector from "./FontSelector";
import TextColorPicker from "./TextColorPicker";
import BackgroundOptions from "./BackgroundOptions";
import AddToCartButton from "./AddToCartButton";

const SignageControls = memo(({ isSharedView, onAddToCart, isAddingToCart, product, productId, navigate }) => {
  return (
    <div className="lg:col-span-1 relative flex flex-col max-h-[calc(100vh-280px)] min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-2">
        {!isSharedView && (
          <>
            <TextInputSection />
            <TextSizeSelector />
            <FontSelector />
            <TextColorPicker />
            <BackgroundOptions />
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
