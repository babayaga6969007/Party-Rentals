export default function ImagesSection({
  productType,
  rentalSubType,
  totalImageCount,
  MAX_IMAGES,
  fileInputRef,
  handleImageChange,
  existingImages,
  removeExistingImage,
  previews,
  removePreviewImage,
}) {
  const isVariableRental = productType === "rental" && rentalSubType === "variable";
  if (isVariableRental) return null;

  return (
    <div>
      <label className="font-medium mb-2 block">
        Product Images <span className="text-sm text-gray-500">(max {MAX_IMAGES})</span>
      </label>
      <div
        onClick={() => {
          if (totalImageCount < MAX_IMAGES) {
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition
          ${
            totalImageCount >= MAX_IMAGES
              ? "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400"
              : "border-gray-300 cursor-pointer hover:border-black hover:bg-black/5"
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl">📸</div>
          <p className="font-medium text-gray-700">Click to upload product images</p>
          <p className="text-sm text-gray-500">JPG, PNG • Up to {MAX_IMAGES} images</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      {existingImages.length > 0 && (
        <>
          <p className="text-sm font-medium mt-4">Existing Images</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
            {existingImages.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.url || img}
                  className="w-full h-24 object-cover rounded border"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {previews.length > 0 && (
        <>
          <p className="text-sm font-medium mt-4">New Uploads</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} className="w-full h-24 object-cover rounded border" alt="" />
                <button
                  type="button"
                  onClick={() => removePreviewImage(i)}
                  className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
