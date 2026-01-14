import { memo } from "react";

const AddToCartButton = memo(({ onClick }) => {
  return (
    <div className="sticky bottom-0 bg-white p-5 rounded-xl shadow-lg border-t border-gray-200 mt-auto -mx-2">
      <button
        onClick={onClick}
        className="w-full px-4 py-3 bg-[#8B5C42] text-white rounded-lg hover:bg-[#704A36] font-semibold"
      >
        Add to Cart
      </button>
    </div>
  );
});

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;
