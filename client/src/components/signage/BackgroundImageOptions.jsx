import { memo } from "react";
import { useSignage } from "../../context/SignageContext";

const BackgroundImageOptions = memo(({ cartItems }) => {
  const {
    backgroundImageUrl,
    setBackgroundImageUrl,
    setBackgroundImage,
    setBackgroundType,
  } = useSignage();

  // Get unique images from cart items (filter out signage items and items without images)
  const cartImages = cartItems
    .filter((item) => item.image && item.productType !== "signage")
    .map((item, index) => ({
      id: item.cartKey || `cart-${index}`,
      imageUrl: item.image,
      name: item.name,
    }));

  // Remove duplicates based on image URL
  const uniqueImages = cartImages.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.imageUrl === item.imageUrl)
  );

  const handleImageSelect = (imageUrl) => {
    setBackgroundImageUrl(imageUrl);
    setBackgroundImage(null); // Clear uploaded image
    setBackgroundType("image");
  };

  const hasCartImages = uniqueImages.length > 0;

  // Don't show anything if no cart images
  if (!hasCartImages) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Cart Item Images */}
      {hasCartImages && (
        <>
          <h4 className="text-xs font-semibold text-[#2D2926] mb-3">
            Select Background from Cart Items
          </h4>
          <div className="flex flex-wrap gap-3">
            {uniqueImages.map((item) => {
              const isSelected = backgroundImageUrl === item.imageUrl;
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleImageSelect(item.imageUrl)}
                  className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    isSelected
                      ? "border-black ring-2 ring-black ring-offset-1 scale-110"
                      : "border-gray-300 hover:border-black hover:scale-105"
                  }`}
                  title={item.name}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-black text-white rounded-full p-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
      
      {backgroundImageUrl && (
        <button
          type="button"
          onClick={() => {
            setBackgroundImageUrl(null);
            setBackgroundImage(null);
            setBackgroundType("color");
          }}
          className="mt-3 text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Remove Background Image
        </button>
      )}
    </div>
  );
});

BackgroundImageOptions.displayName = "BackgroundImageOptions";

export default BackgroundImageOptions;
