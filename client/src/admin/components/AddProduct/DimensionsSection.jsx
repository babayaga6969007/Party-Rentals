export default function DimensionsSection({
  productType,
  rentalSubType,
  dimensions,
  setDimensions,
}) {
  const isVariableRental = productType === "rental" && rentalSubType === "variable";
  if (isVariableRental) return null;

  return (
    <div>
      <label className="font-medium">Dimensions (optional)</label>
      <input
        className="w-full p-3 border border-gray-400 rounded-lg mt-2"
        value={dimensions}
        onChange={(e) => setDimensions(e.target.value)}
        placeholder="e.g. 10×10 ft"
      />
    </div>
  );
}
