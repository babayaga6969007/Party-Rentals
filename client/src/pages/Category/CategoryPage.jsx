import { useMemo, useState } from "react";

// Re-use existing images from your assets
import img6 from "../../assets/featured/6.png";
import img7 from "../../assets/featured/7.png";
import img8 from "../../assets/featured/8.png";
import img9 from "../../assets/featured/9.png";
import img10 from "../../assets/featured/10.png";
import img11 from "../../assets/featured/11.png";
import img12 from "../../assets/featured/12.png";
import img13 from "../../assets/featured/13.png";

const ALL_CATEGORIES = [
  "Backdrops",
  "Tables",
  "Balloon Stands",
  "Photo Props",
  "Furniture",
  "Lights",
];

const TAGS = ["Indoor", "Outdoor", "Pastel", "Bold", "Large", "Compact"];

const PRODUCTS = [
  {
    id: 6,
    title: "Golden Arch Backdrop",
    category: "Backdrops",
    pricePerDay: 220,
    img: img6,
    tags: ["Indoor", "Pastel", "Large"],
    unavailableRanges: [
      { start: "2025-12-10", end: "2025-12-12" },
      { start: "2025-12-24", end: "2025-12-25" },
    ],
  },
  {
    id: 7,
    title: "Rustic Wooden Table Set",
    category: "Tables",
    pricePerDay: 150,
    img: img7,
    tags: ["Indoor", "Outdoor", "Large"],
    unavailableRanges: [{ start: "2025-12-05", end: "2025-12-06" }],
  },
  {
    id: 8,
    title: "Pastel Balloon Stand",
    category: "Balloon Stands",
    pricePerDay: 110,
    img: img8,
    tags: ["Indoor", "Pastel", "Compact"],
    unavailableRanges: [],
  },
  {
    id: 9,
    title: "Photo Booth Frame",
    category: "Photo Props",
    pricePerDay: 95,
    img: img9,
    tags: ["Indoor", "Bold", "Compact"],
    unavailableRanges: [{ start: "2025-12-18", end: "2025-12-19" }],
  },
  {
    id: 10,
    title: "Velvet Sofa Seating",
    category: "Furniture",
    pricePerDay: 260,
    img: img10,
    tags: ["Indoor", "Large"],
    unavailableRanges: [],
  },
  {
    id: 11,
    title: "Boho Rattan Chairs",
    category: "Furniture",
    pricePerDay: 180,
    img: img11,
    tags: ["Indoor", "Outdoor", "Compact"],
    unavailableRanges: [{ start: "2025-12-31", end: "2026-01-01" }],
  },
  {
    id: 12,
    title: "Warm Fairy Light Set",
    category: "Lights",
    pricePerDay: 70,
    img: img12,
    tags: ["Indoor", "Outdoor", "Pastel"],
    unavailableRanges: [],
  },
  {
    id: 13,
    title: "Neon Event Signage",
    category: "Lights",
    pricePerDay: 130,
    img: img13,
    tags: ["Indoor", "Bold"],
    unavailableRanges: [],
  },
];


// helper: check if product is available for selected range
const isAvailableForRange = (product, startDate, endDate) => {
  if (!startDate || !endDate) return true; // no filter applied yet

  const start = new Date(startDate);
  const end = new Date(endDate);

  // If any unavailable range overlaps, then NOT available
  return !product.unavailableRanges.some((range) => {
    const rStart = new Date(range.start);
    const rEnd = new Date(range.end);
    return start <= rEnd && end >= rStart; // overlap
  });
};

const CategoryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);

      const matchesPrice =
        p.pricePerDay >= minPrice && p.pricePerDay <= maxPrice;

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => p.tags.includes(tag));

      const available = isAvailableForRange(p, startDate, endDate);

      if (!showUnavailable && !available) return false; // hide unavailable

      return matchesCategory && matchesPrice && matchesTags;
    });
  }, [startDate, endDate, showUnavailable, selectedCategories, selectedTags, minPrice, maxPrice]);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowUnavailable(false);
    setSelectedCategories([]);
    setSelectedTags([]);
    setMinPrice(0);
    setMaxPrice(300);
  };

  return (
    <section className="bg-[#FFF7F0] py-16">
      <div className="page-wrapper max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="mb-10">
          <h1
            className="text-4xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Browse Our Collection
          </h1>
          <p className="mt-2 text-[#2D2926]/70 max-w-2xl">
            Filter by date, category, style, and budget to find props that match
            your event mood perfectly. Availability is live so you can plan
            with confidence.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-10">
          {/* FILTERS PANEL */}
          <aside className="bg-white rounded-2xl shadow-sm border border-[#EAD9C7] p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#2D2926]">
                Filters
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm text-[#8B5C42] underline"
              >
                Clear all
              </button>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Date range availability
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 border border-[#EAD9C7] rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 border border-[#EAD9C7] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-[#2D2926]">
                <input
                  type="checkbox"
                  checked={showUnavailable}
                  onChange={(e) => setShowUnavailable(e.target.checked)}
                  className="rounded border-[#EAD9C7]"
                />
                Show unavailable items for planning ahead
              </label>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      selectedCategories.includes(cat)
                        ? "bg-[#8B5C42] text-white border-[#8B5C42]"
                        : "bg-white text-[#2D2926] border-[#EAD9C7] hover:bg-[#F4E5D9]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Price / day (AUD)
              </p>
              <div className="flex items-center justify-between text-xs text-[#2D2926]/70 mb-1">
                <span>Min: ${minPrice}</span>
                <span>Max: ${maxPrice}</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(Math.min(Number(e.target.value), maxPrice))
                  }
                  className="w-1/2"
                />
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(Math.max(Number(e.target.value), minPrice))
                  }
                  className="w-1/2"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Tags & specs
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {TAGS.map((tag) => (
                  <label key={tag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="rounded border-[#EAD9C7]"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCTS GRID */}
          <main>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#2D2926]/70">
                Showing{" "}
                <span className="font-semibold text-[#2D2926]">
                  {filteredProducts.length}
                </span>{" "}
                items
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-[#2D2926]/70">
                No items match your filters. Try adjusting the dates, price
                range, or tags.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((item) => {
                  const available = isAvailableForRange(item, startDate, endDate);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col"
                    >
                      <div className="h-52 overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium uppercase tracking-wide text-[#8B5C42]">
                            {item.category}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {available ? "Available" : "Booked"}
                          </span>
                        </div>

                        <h3 className="font-semibold text-[#2D2926]">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#2D2926]/70 mt-1">
                          AUD ${item.pricePerDay}/day
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-[#2D2926]/70">
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-1 rounded-full bg-[#F4E5D9]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <button
                          className="mt-4 w-full py-2 rounded-full bg-[#8B5C42] text-white text-sm font-medium hover:bg-[#704A36] transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
