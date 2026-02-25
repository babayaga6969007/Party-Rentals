import toast from "react-hot-toast";

const MAX_VARIATION_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

export default function VariationsSection({
  productType,
  rentalSubType,
  variationCount,
  setVariationCount,
  variations,
  setVariations,
  isEditMode,
}) {
  const isVariableRental = productType === "rental" && rentalSubType === "variable";
  if (!isVariableRental) return null;

  const handleVariationImageChange = (e, index) => {
    const files = Array.from(e.target.files || []);
    const tooLarge = files.filter((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge.length > 0) {
      toast.error("Some images are over 3MB and were skipped. Max size per image: 3MB.");
    }
    const withinSize = files.filter((f) => f.size <= MAX_IMAGE_SIZE_BYTES);
    const copy = [...variations];
    const existingCount =
      (copy[index].existingImages?.length || 0) + (copy[index].images?.length || 0);
    if (existingCount >= MAX_VARIATION_IMAGES) {
      toast.error(`Maximum ${MAX_VARIATION_IMAGES} images per variation. Remove some to add more.`);
      e.target.value = "";
      return;
    }
    const existingKeys = new Set(
      (copy[index].images || []).map((f) => `${f.name}_${f.size}`)
    );
    const filtered = withinSize.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
    const remaining = MAX_VARIATION_IMAGES - existingCount;
    const accepted = filtered.slice(0, remaining);
    if (filtered.length > remaining) {
      toast.error(
        `Only ${remaining} more image(s) allowed for this variation (max ${MAX_VARIATION_IMAGES}).`
      );
    }
    copy[index].images = [...(copy[index].images || []), ...accepted];
    copy[index].previews = [
      ...(copy[index].previews || []),
      ...accepted.map((f) => URL.createObjectURL(f)),
    ];
    setVariations(copy);
    e.target.value = "";
  };

  return (
    <>
      <div className="bg-gray-100 p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-lg font-semibold text-[#2D2926]">
            Number of Variations
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Variations represent different sizes, dimensions, or configurations of the same rental
            product.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={variationCount <= 1}
            onClick={() => {
              if (variationCount <= variations.length) {
                const ok = window.confirm(
                  "Reducing variations will permanently remove the last variation. Continue?"
                );
                if (!ok) return;
              }
              const n = Math.max(1, variationCount - 1);
              setVariationCount(n);
              setVariations((prev) => prev.slice(0, n));
            }}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={20}
            value={variationCount}
            onChange={(e) => {
              const count = Math.max(1, Math.min(20, Number(e.target.value) || 1));
              if (count < variations.length) {
                const ok = window.confirm(
                  "Reducing variations will permanently remove variation data. Continue?"
                );
                if (!ok) return;
              }
              setVariationCount(count);
              setVariations((prev) => {
                if (count > prev.length) {
                  return [
                    ...prev,
                    ...Array.from({ length: count - prev.length }, (_, i) => ({
                      id: prev.length + i,
                      dimension: "",
                      pricePerDay: "",
                      salePrice: "",
                      stock: 1,
                      description: "",
                      images: [],
                      previews: [],
                      existingImages: [],
                    })),
                  ];
                }
                return prev.slice(0, count);
              });
            }}
            className="w-20 text-center border rounded-lg p-2"
          />
          <button
            type="button"
            disabled={variationCount >= 20}
            onClick={() => {
              const n = Math.min(20, variationCount + 1);
              setVariationCount(n);
              setVariations((prev) => [
                ...prev,
                {
                  id: prev.length,
                  dimension: "",
                  pricePerDay: "",
                  salePrice: "",
                  stock: 1,
                  description: "",
                  images: [],
                  previews: [],
                  existingImages: [],
                },
              ]);
            }}
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Example: 10×10, 10×15, and 10×20 would be 3 variations.
        </p>
      </div>

      {variations.map((v, index) => (
        <div key={index} className="border rounded-xl p-6 bg-white space-y-4">
          <h3 className="font-semibold text-lg">Variation {index + 1}</h3>
          <input
            placeholder="Dimension (e.g. 10×10)"
            className="w-full p-3 border rounded-lg"
            value={v.dimension}
            onChange={(e) => {
              const copy = [...variations];
              copy[index].dimension = e.target.value;
              setVariations(copy);
            }}
          />
          <input
            type="number"
            placeholder="Price per day"
            className="w-full p-3 border rounded-lg"
            value={v.pricePerDay}
            onChange={(e) => {
              const copy = [...variations];
              copy[index].pricePerDay = e.target.value;
              setVariations(copy);
            }}
          />
          <input
            type="number"
            placeholder="Sale price (optional)"
            className="w-full p-3 border rounded-lg"
            value={v.salePrice}
            onChange={(e) => {
              const copy = [...variations];
              copy[index].salePrice = e.target.value;
              setVariations(copy);
            }}
          />
          <input
            type="number"
            placeholder="Stock"
            className="w-full p-3 border rounded-lg"
            value={v.stock}
            onChange={(e) => {
              const copy = [...variations];
              copy[index].stock = e.target.value;
              setVariations(copy);
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              placeholder="e.g. Perfect for small gatherings, includes setup."
              className="w-full p-3 border border-gray-400 rounded-lg min-h-[80px] resize-y"
              value={v.description ?? ""}
              onChange={(e) => {
                const copy = [...variations];
                copy[index].description = e.target.value;
                setVariations(copy);
              }}
              maxLength={2000}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-0.5">
              Shown on product page when this variation is selected. Max 2000 characters.
            </p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mt-2">
            Images{" "}
            <span className="text-gray-500 font-normal">
              (max {MAX_VARIATION_IMAGES} per variation)
            </span>
            {(v.existingImages?.length || 0) + (v.images?.length || 0) > 0 && (
              <span className="ml-1 text-gray-500">
                — {(v.existingImages?.length || 0) + (v.images?.length || 0)}/{MAX_VARIATION_IMAGES}
              </span>
            )}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleVariationImageChange(e, index)}
          />
          {(v.existingImages?.length > 0 || v.previews?.length > 0) && (
            <div className="flex gap-2 flex-wrap mt-2">
              {(v.existingImages || []).map((img, i) => (
                <div key={`existing-${i}`} className="relative">
                  <img
                    src={img.url || img}
                    className="w-24 h-24 object-cover rounded border"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...variations];
                      copy[index].existingImages = [...(copy[index].existingImages || [])];
                      copy[index].existingImages.splice(i, 1);
                      setVariations(copy);
                    }}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(v.previews || []).map((src, i) => (
                <div key={`new-${i}`} className="relative">
                  <img
                    src={src}
                    className="w-24 h-24 object-cover rounded border"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...variations];
                      copy[index].images = [...(copy[index].images || [])];
                      copy[index].previews = [...(copy[index].previews || [])];
                      copy[index].images.splice(i, 1);
                      copy[index].previews.splice(i, 1);
                      setVariations(copy);
                    }}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
