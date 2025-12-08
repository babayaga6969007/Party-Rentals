import { useEffect, useMemo, useState } from "react";
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";

// ====================
//  CATEGORY DATA
// ====================
const ALL_CATEGORIES = [
  "Backdrop",
  "Furniture",
  "Lights",
  "Props",
  "Florals",
  "Tables",
];
const COLORS = [
  { name: "White", value: "#ffffff", border: "#ccc" },
  { name: "Black", value: "#000000", border: "#000" },
  { name: "Gold", value: "#d4af37", border: "#b8972b" },
  { name: "Silver", value: "#c0c0c0", border: "#999" },
  { name: "Pink", value: "#f4a7c4", border: "#c2889e" },
  { name: "Red", value: "#e63946", border: "#a62834" },
  { name: "Blue", value: "#4a90e2", border: "#326fb8" },
  { name: "Green", value: "#6ab547", border: "#4c8a32" },
  { name: "Purple", value: "#9b59b6", border: "#7d3c98" },
  { name: "Yellow", value: "#f1c40f", border: "#d4a307" },
];


// ====================
//  MOCK PRODUCT DATA (Your existing dummy data)
// ====================
const PRODUCTS = [
  {
    id: 1,
    name: "White Wedding Arch",
    category: "Backdrop",
    pricePerDay: 120,
    tags: ["Outdoor", "Large"],
    image: hero1,
    color: "White",
  },
  {
    id: 2,
    name: "Vintage Sofa Set",
    category: "Furniture",
    pricePerDay: 200,
    tags: ["Indoor", "Compact"],
    image: hero2,
    color: "Gold",
  },
  {
    id: 3,
    name: "Fairy Light Curtain",
    category: "Lights",
    pricePerDay: 40,
    tags: ["Outdoor", "Pastel"],
    image: hero3,
    color: "Yellow",
  },
  {
    id: 4,
    name: "Neon Name Sign",
    category: "Lights",
    pricePerDay: 60,
    tags: ["Bold"],
    image: hero4,
    color: "Red",
  },
  {
    id: 5,
    name: "Flower Garland Set",
    category: "Florals",
    pricePerDay: 75,
    tags: ["Pastel", "Large"],
    image: hero1,
    color: "Pink",
  },

  // ⭐ NEW DEMO PRODUCT ADDED:
  {
    id: 6,
    name: "Rustic Wooden Table",
    category: "Tables",
    pricePerDay: 95,
    tags: ["Indoor", "Large"],
    image: hero2,
    color: "Brown", // new color (optional)
  },
];



// ====================
//  HELPER
// ====================
const today = new Date().toISOString().split("T")[0];

const CategoryPage = () => {
  // ====================
  //  FILTER STATES
  // ====================
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);


  const [priceRange, setPriceRange] = useState([0, 500]);
  const [hoverPrice, setHoverPrice] = useState(null);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRangeChange = (e, index) => {
    const value = Number(e.target.value);
    setPriceRange((prev) => {
      const updated = [...prev];
      updated[index] = value;

      // Prevent cross-over
      if (updated[0] > updated[1]) {
        updated[index === 0 ? 1 : 0] = value;
      }
      return updated;
    });
  };

  const resetFilters = () => {
  setSelectedCategories([]);
  setSelectedTags([]);
  setSelectedColors([]);   // <-- ADD THIS
  setPriceRange([0, 500]);
};


  // ====================
  //  FILTERED PRODUCTS
  // ====================
  const filteredProducts = useMemo(() => {
  return PRODUCTS.filter((p) => {
    const inCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);

    const inPrice =
      p.pricePerDay >= priceRange[0] &&
      p.pricePerDay <= priceRange[1];

    const inTags =
      selectedTags.length === 0 ||
      selectedTags.every((t) => p.tags.includes(t));

    // ✅ NEW COLOR FILTER
    const inColor =
      selectedColors.length === 0 ||
      selectedColors.includes(p.color);

    // ⬅️ Make sure to include AND inColor here
    return inCategory && inPrice && inTags && inColor;
  });
}, [selectedCategories, selectedTags, selectedColors, priceRange]);


  // ====================
  //  RENDER
  // ====================
  return (
    <section className="py-20 px-6 bg-white">

      {/* PAGE HEADING */}
      <div className="page-wrapper max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Browse Our Shop
        </h1>

        <p
          className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Here you get to buy used products for your use at a reasonable pricing.
        </p>
      </div>

      {/* MAIN CONTENT AREA (SIDEBAR + PRODUCTS) */}
      <div className="max-w-7xl mx-auto">

        {/* MOBILE FILTER TOGGLE */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="w-full py-3 bg-[#8B5C42] text-white rounded-lg font-medium"
          >
            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* GRID STRUCTURE */}
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 items-start">

          {/* ====================== */}
          {/* SIDEBAR — STICKY ON DESKTOP / SLIDE ON MOBILE */}
          {/* ====================== */}

          <aside
            className={`
              bg-white rounded-2xl shadow-sm border border-[#EAD9C7] p-6
              transition-all duration-300 overflow-hidden
              ${mobileFiltersOpen ? "max-h-[1400px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"}
              md:max-h-none md:opacity-100 md:overflow-visible md:mb-0 md:sticky md:top-28
            `}
          >

            {/* ===== Availability (CAN EXPAND LATER IF NEEDED) ===== */}

            {/* ===== CATEGORY FILTERS ===== */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Categories
              </p>

              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat)
                          ? prev.filter((c) => c !== cat)
                          : [...prev, cat]
                      )
                    }
                    className={`
                      px-3 py-1 rounded-full border text-sm transition
                      ${
                        selectedCategories.includes(cat)
                          ? "bg-[#8B5C42] text-white border-[#8B5C42]"
                          : "bg-white text-[#2D2926] border-gray-300"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            
            {/* ===== PRICE SLIDER ===== */}
<div className="mb-6">
  <p className="text-sm font-semibold text-[#2D2926] mb-3">
    Price
  </p>

  {/* TOP INPUT BOXES */}
  <div className="flex items-center gap-3 mb-4">
    <input
      type="number"
      value={priceRange[0]}
      min={0}
      max={500}
      step="1"
      onChange={(e) =>
        setPriceRange([Number(e.target.value), priceRange[1]])
      }
      className="w-full p-2 border border-gray-300 rounded-md text-center"
    />

    <span className="text-gray-600">-</span>

    <input
      type="number"
      value={priceRange[1]}
      min={0}
      max={500}
      step="1"
      onChange={(e) =>
        setPriceRange([priceRange[0], Number(e.target.value)])
      }
      className="w-full p-2 border border-gray-300 rounded-md text-center"
    />
  </div>

  {/* SLIDER TRACK */}
  <div className="relative h-2 bg-gray-300 rounded-md mb-6">
    {/* selected range */}
    <div
      className="absolute h-2 bg-black rounded-md"
      style={{
        left: `${(priceRange[0] / 500) * 100}%`,
        width: `${((priceRange[1] - priceRange[0]) / 500) * 100}%`,
      }}
    ></div>
  </div>

  {/* SLIDER HANDLES */}
<div className="relative range-input" style={{ marginTop: "-10px" }}>
    <input
  type="range"
  min="0"
  max="500"
  value={priceRange[0]}
  onChange={(e) => handleRangeChange(e, 0)}
  className="absolute w-full cursor-pointer pointer-events-auto"
  style={{ top: "-25px" }}  
/>

<input
  type="range"
  min="0"
  max="500"
  value={priceRange[1]}
  onChange={(e) => handleRangeChange(e, 1)}
  className="absolute w-full cursor-pointer pointer-events-auto"
  style={{ top: "-25px" }}  
/>

  </div>

  {/* BOTTOM LABELS */}
  <div
  className="flex justify-between text-xs text-gray-600"
  style={{ marginTop: "-4px" }}   // ★ lift labels up
>
  <span>0</span>
  <span>125</span>
  <span>250</span>
  <span>375</span>
  <span>500</span>
</div>

</div>

            {/* ===== TAGS & STYLE ===== */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Tags & Style
              </p>

              <div className="flex flex-wrap gap-2">
                {["Indoor", "Outdoor", "Pastel", "Bold", "Large", "Compact"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`
                        px-3 py-1 rounded-full border text-sm transition
                        ${
                          selectedTags.includes(tag)
                            ? "bg-[#8B5C42] text-white border-[#8B5C42]"
                            : "bg-white text-[#2D2926] border-gray-300"
                        }
                      `}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
            {/* ===== COLOR FILTER ===== */}
<div className="mb-6">
  <p className="text-sm font-semibold text-[#2D2926] mb-2">Colors</p>

  <div className="flex flex-wrap gap-3">
    {COLORS.map((c) => (
      <button
        key={c.name}
        onClick={() =>
          setSelectedColors((prev) =>
            prev.includes(c.name)
              ? prev.filter((x) => x !== c.name)
              : [...prev, c.name]
          )
        }
        className={`
          w-6 h-6 rounded-full border-2 transition
          ${selectedColors.includes(c.name)
            ? "ring-2 ring-[#8B5C42]"
            : ""}
        `}
        style={{
          backgroundColor: c.value,
          borderColor: c.border,
        }}
        title={c.name}
      ></button>
    ))}
  </div>
</div>


            {/* ===== CLEAR ALL ===== */}
            <button
              onClick={resetFilters}
              className="w-full py-2 mt-3 rounded-lg bg-gray-200 text-[#2D2926] font-medium hover:bg-gray-300"
            >
              Clear All
            </button>

          </aside>

          {/* ====================== */}
          {/* PRODUCT GRID */}
          {/* ====================== */}

         <main>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

    {filteredProducts.map((product) => (
      <a
        href={`/buyproducts`}
        className="
          block border border-gray-300 hover:border-gray-500
          rounded-xl shadow 
          transition-all duration-300 
          group hover:shadow-lg hover:scale-[1.02]
        "
      >

        {/* IMAGE — NOW FULL WIDTH, NO PADDING */}
        <div className="h-48 rounded-t-xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="p-5">

          {/* NAME */}
          <h3 className="font-bold text-lg text-[#2D2926]">
            {product.name}
          </h3>

          {/* PRICE SECTION */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-black line-through text-sm">
              ${product.pricePerDay}
            </span>

            <span className="text-red-600 font-bold text-lg">
              ${product.salePrice || Math.round(product.pricePerDay * 0.85)}
            </span>
          </div>

          {/* CATEGORY */}
          <p className="text-sm text-gray-600 mt-1">
            Category: {product.category}
          </p>

          {/* BUTTON */}
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-full bg-[#8B5C42] text-white px-6 py-2 rounded-lg text-sm shadow-md hover:bg-[#704A36] transition">
              View Product
            </button>
          </div>

        </div>
      </a>
    ))}

  </div>
</main>

        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
