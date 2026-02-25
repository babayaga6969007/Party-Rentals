export default function BasicInfoSection({
  title,
  setTitle,
  category,
  setCategory,
  categories,
  categoryLoading,
  productType,
}) {
  const filteredCategories = categories.filter((cat) => cat.type === productType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label>Product Title</label>
        <input
          className="w-full p-3 border border-gray-400 rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          disabled={categoryLoading}
        >
          <option value="">
            {categoryLoading ? "Loading categories..." : "Select category"}
          </option>
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
