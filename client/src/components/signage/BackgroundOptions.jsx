import { memo } from "react";
import toast from "react-hot-toast";
import { useSignage, BACKGROUND_GRADIENTS as DEFAULT_GRADIENTS } from "../../context/SignageContext";

// Default images from public/signage folder
const DEFAULT_SIGNAGE_IMAGES = [
  { name: "6x8 Wooden Fluted Wall", path: "/signage/6x8WOODENFLUTEDWALL.jpeg" },
  { name: "8x8 Wall Black", path: "/signage/8X8WALLBLACK.jpeg" },
  { name: "8x8 Wall Blue", path: "/signage/8X8WALLBLUE.jpeg" },
  { name: "8x8 Wall Pink", path: "/signage/8X8WALLPINK.jpeg" },
];

const BackgroundOptions = memo(({ onImageUpload }) => {
  const {
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    backgroundGradient,
    setBackgroundGradient,
    backgroundImageUrl,
    setBackgroundImageUrl,
    setBackgroundImage,
    customBackgroundColor,
    setCustomBackgroundColor,
    backgroundGradients,
  } = useSignage();
  
  // Use gradients from config if available, otherwise use defaults
  const GRADIENTS = backgroundGradients.length > 0 ? backgroundGradients : DEFAULT_GRADIENTS;

  const handleDefaultImageSelect = (imagePath) => {
    setBackgroundImageUrl(imagePath);
    setBackgroundImage(null); // Clear uploaded image
    setBackgroundType("image");
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 3MB per image.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImageUrl(event.target.result);
        setBackgroundImage(file);
        setBackgroundType("image");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-2">
        Background
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Choose a color gradient or upload a custom background image
      </p>

      {/* Background Type Radio Buttons */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="backgroundType"
            value="color"
            checked={backgroundType === "color"}
            onChange={() => setBackgroundType("color")}
            className="w-4 h-4 text-black"
          />
          <span className="text-sm text-gray-700">Color</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="backgroundType"
            value="image"
            checked={backgroundType === "image"}
            onChange={() => setBackgroundType("image")}
            className="w-4 h-4 text-black"
          />
          <span className="text-sm text-gray-700">Image</span>
        </label>
      </div>

      {/* Color Background */}
      {backgroundType === "color" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors
          </label>
          
          {/* Gradients */}
          <div className="mb-3">
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setBackgroundGradient(gradient.value);
                    setBackgroundColor(null);
                  }}
                  className={`w-full h-10 rounded-lg border-2 transition overflow-hidden ${
                    backgroundGradient === gradient.value
                      ? "border-black ring-2 ring-black ring-offset-1"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ background: gradient.value }}
                  title={gradient.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customBackgroundColor}
              onChange={(e) => {
                setCustomBackgroundColor(e.target.value);
                setBackgroundColor(e.target.value);
                setBackgroundGradient(null);
              }}
              className="w-12 h-12 cursor-pointer"
              style={{ 
                border: "none",
                outline: "none",
                padding: 0,
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                background: "none",
              }}
            />
            <div className="flex-1 text-sm text-gray-600">
              {backgroundGradient ? "Custom Background" : backgroundColor.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Image Background */}
      {backgroundType === "image" && (
        <div>
          {/* Default Images */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Images
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_SIGNAGE_IMAGES.map((img) => {
                const isSelected = backgroundImageUrl === img.path;
                return (
                  <button
                    key={img.path}
                    type="button"
                    onClick={() => handleDefaultImageSelect(img.path)}
                    className={`relative w-full h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-black ring-2 ring-black ring-offset-1"
                        : "border-gray-300 hover:border-black"
                    }`}
                    title={img.name}
                  >
                    <img
                      src={img.path}
                      alt={img.name}
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
          </div>

          {/* Upload Custom Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Custom Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageUpload}
              className="w-full p-3 border rounded-lg"
            />
            {backgroundImageUrl && !DEFAULT_SIGNAGE_IMAGES.some(img => img.path === backgroundImageUrl) && (
              <div className="mt-3">
                <img
                  src={backgroundImageUrl}
                  alt="Background"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setBackgroundImageUrl(null);
                    setBackgroundImage(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

BackgroundOptions.displayName = "BackgroundOptions";

export default BackgroundOptions;
