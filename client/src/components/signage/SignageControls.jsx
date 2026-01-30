import { memo } from "react";
import TextInputSection from "./TextInputSection";
import TextSizeSelector from "./TextSizeSelector";
import FontSelector from "./FontSelector";
import TextColorPicker from "./TextColorPicker";
import BackgroundOptions from "./BackgroundOptions";
import AddToCartButton from "./AddToCartButton";

const SignageControls = memo(({ isSharedView, onAddToCart, isAddingToCart, product, productId, navigate }) => {
  return (
    <div className="lg:col-span-1 relative">
      {/* Sticky Signage Heading */}
      <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-4">
        <h2 
          className="text-4xl font-bold"
          style={{
            fontFamily: "'Sloop Script Three', cursive",
            color: "black",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            letterSpacing: "0.05em",
          }}
        >
          Signage
        </h2>
      </div>
      
      <div className="space-y-6 overflow-y-auto h-[calc(100vh-250px)] pr-2 flex flex-col">
        {!isSharedView && (
          <>
            <TextInputSection />
            <TextSizeSelector />
            <FontSelector />
            <TextColorPicker />
            <BackgroundOptions />
            <AddToCartButton onClick={onAddToCart} isLoading={isAddingToCart} />
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
    </div>
  );
});

SignageControls.displayName = "SignageControls";

export default SignageControls;
