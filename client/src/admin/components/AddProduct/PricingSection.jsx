export default function PricingSection({
  productType,
  rentalSubType,
  pricePerDay,
  setPricePerDay,
  salePrice,
  setSalePrice,
  availabilityCount,
  setAvailabilityCount,
  featured,
  setFeatured,
  allowCustomTitle,
  setAllowCustomTitle,
}) {
  const isVariableRental = productType === "rental" && rentalSubType === "variable";
  if (isVariableRental) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label>Price Per Day</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-400 rounded-lg"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Sale Price</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-400 rounded-lg"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          placeholder="Optional discounted price"
          min="0"
        />
      </div>
      <div>
        <label>Stock / Availability</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-400 rounded-lg"
          value={availabilityCount}
          onChange={(e) => setAvailabilityCount(e.target.value)}
          min="1"
        />
      </div>
      {productType === "rental" && (
        <div className="flex items-center gap-3">
          <label className="font-medium">Show on homepage (featured)</label>
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => setFeatured((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              featured ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
                featured ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="font-medium">Allow custom title</label>
        <button
          type="button"
          role="switch"
          aria-checked={allowCustomTitle}
          onClick={() => setAllowCustomTitle((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
            allowCustomTitle ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
              allowCustomTitle ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
