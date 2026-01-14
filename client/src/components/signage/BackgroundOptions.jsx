import { memo } from "react";
import { useSignage, BACKGROUND_GRADIENTS } from "../../context/SignageContext";

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
  } = useSignage();

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
            className="w-4 h-4 text-[#8B5C42]"
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
            className="w-4 h-4 text-[#8B5C42]"
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
              {BACKGROUND_GRADIENTS.map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setBackgroundGradient(gradient.value);
                    setBackgroundColor(null);
                  }}
                  className={`w-full h-10 rounded-lg border-2 transition overflow-hidden ${
                    backgroundGradient === gradient.value
                      ? "border-[#8B5C42] ring-2 ring-[#8B5C42] ring-offset-1"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Background Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageUpload}
            className="w-full p-3 border rounded-lg"
          />
          {backgroundImageUrl && (
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
      )}
    </div>
  );
});

BackgroundOptions.displayName = "BackgroundOptions";

export default BackgroundOptions;
