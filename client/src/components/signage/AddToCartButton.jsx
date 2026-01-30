import { memo } from "react";

const AddToCartButton = memo(({ onClick, isLoading = false }) => {
  return (
    <div className="sticky bottom-0 bg-white p-5 rounded-xl shadow-lg border-t border-gray-200 mt-auto -mx-2">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
          isLoading
            ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding to Cart...
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
});

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;
