export default function ProductTypeSection({
  productType,
  setProductType,
  rentalSubType,
  setRentalSubType,
  setCategory,
  setVariationCount,
  setVariations,
  isEditMode,
}) {
  return (
    <>
      <div>
        <label className="font-medium">Product Type</label>
        <div className="flex gap-4 mt-2">
          {["rental", "sale"].map((type) => (
            <button
              type="button"
              key={type}
              disabled={isEditMode}
              onClick={() => {
                if (isEditMode) return;
                setProductType(type);
                setCategory("");
              }}
              className={`px-6 py-2 rounded-full border border-gray-400 transition
                ${productType === type ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
            >
              {type === "rental" ? "Rental Product" : "Selling Product"}
            </button>
          ))}
        </div>
      </div>
      {productType === "rental" && (
        <div>
          <label className="font-medium">Rental Type</label>
          <div className="flex gap-4 mt-2">
            {["simple", "variable"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (isEditMode) return;
                  setRentalSubType(type);
                  setVariationCount(0);
                  setVariations([]);
                }}
                className={`px-6 py-2 rounded-full border ${
                  rentalSubType === type ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                {type === "simple" ? "Simple Rental" : "Variable Rental"}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
