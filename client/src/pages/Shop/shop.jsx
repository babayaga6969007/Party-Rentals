import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";
import { api } from "../../utils/api";

// ====================
//  HELPER
// ====================
const today = new Date().toISOString().split("T")[0];

const CategoryPage = () => {
  const navigate = useNavigate();
  
  // ====================
  //  FILTER STATES
  // ====================
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
const [attributes, setAttributes] = useState([]);
const [tagAttribute, setTagAttribute] = useState(null);
useEffect(() => {
  const fetchAttributes = async () => {
    try {
      const res = await api("/admin/attributes");

      const allAttributes = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const tagsAttr = allAttributes.find((a) => a.slug === "tags");

      setAttributes(allAttributes);
      setTagAttribute(tagsAttr || null);
    } catch (err) {
      console.error("Failed to fetch attributes", err);
    }
  };

  fetchAttributes();
}, []);
const getCategoryNameById = (categoryId) => {
  if (!categoryId) return "--";

  const found = allCategories.find(
    (c) => String(c._id) === String(categoryId)
  );

  return found ? found.name : "--";
};


const PRICE_MIN = 0;
const PRICE_MAX = 5000;

const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  const [hoverPrice, setHoverPrice] = useState(null);
  // ====================
//  BACKEND DATA STATE
// ====================
const [products, setProducts] = useState([]);
const [allCategories, setAllCategories] = useState([]);
const [saleCategories, setSaleCategories] = useState([]);
const [loadingProducts, setLoadingProducts] = useState(true);


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
const handlePriceInput = (value, index) => {
  let v = Number(value);
  if (isNaN(v)) return;

  if (v > PRICE_MAX) {
    v = PRICE_MAX;
    setShowPriceTooltip(true);
    setTimeout(() => setShowPriceTooltip(false), 2000);
  }

  if (v < PRICE_MIN) v = PRICE_MIN;

  setPriceRange((prev) => {
    const next = [...prev];
    next[index] = v;

    // prevent crossover
    if (next[0] > next[1]) {
      next[index === 0 ? 1 : 0] = v;
    }
    return next;
  });
};

  const resetFilters = () => {
  setSelectedCategories([]);
  setSelectedTags([]);
setPriceRange([PRICE_MIN, PRICE_MAX]);
};
// ====================
//  FETCH PRODUCTS (SALE)
// ====================
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

const res = await api("/products?limit=1000");
      const allProducts = res?.products || [];

      // ✅ ONLY SALE PRODUCTS FOR SHOP PAGE
      const saleProducts = allProducts.filter(
        (p) => p.productType === "sale"
      );

      setProducts(saleProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  fetchProducts();
}, []);
// ====================
//  FETCH SALE CATEGORIES
// ====================
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api("/categories");
      const data = res?.data || res || [];

      setAllCategories(data);

      const saleOnly = data.filter((c) => c.type === "sale");
      setSaleCategories(saleOnly);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCategories();
}, []);

// ====================
//  AUTO SELECT ALL CATEGORIES
// ====================
useEffect(() => {
  if (saleCategories.length > 0) {
    setSelectedCategories(saleCategories.map((c) => String(c._id)));
  }
}, [saleCategories]);



  // ====================
  //  FILTERED PRODUCTS
  // ====================
  const filteredProducts = useMemo(() => {
return products.filter((p) => {
  const productCategoryId =
  typeof p.category === "object" ? p.category._id : p.category;

    const inCategory =
  selectedCategories.length === 0 ||
  selectedCategories.includes(String(productCategoryId));

    const price = Number(p.salePrice ?? 0);
const inPrice = price >= priceRange[0] && price <= priceRange[1];


    const getId = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") {
    if (x._id) return String(x._id);
    if (x.id) return String(x.id);
  }
  return String(x);
};

const tagsGroupId = getId(tagAttribute);

const tagAttrSelection = Array.isArray(p.attributes)
  ? p.attributes.find((a) => getId(a.groupId) === tagsGroupId)
  : null;

const optionLabelById = (tagAttribute?.options || []).reduce((acc, opt) => {
  acc[getId(opt)] = (opt.label || "").toLowerCase();
  return acc;
}, {});

const productTagLabels = tagAttrSelection
  ? (tagAttrSelection.optionIds || [])
      .map((oid) => optionLabelById[getId(oid)])
      .filter(Boolean)
  : [];

const selected = selectedTags.map((t) => t.toLowerCase());

const inTags =
  selected.length === 0 ||
  selected.every((t) => productTagLabels.includes(t));

   

    return inCategory && inPrice && inTags;
  });
}, [products, selectedCategories, selectedTags, priceRange, tagAttribute]);


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
               {saleCategories.map((cat) => (
  <button
    key={cat._id}
    onClick={() =>
      setSelectedCategories((prev) =>
        prev.includes(String(cat._id))
          ? prev.filter((id) => id !== String(cat._id))
          : [...prev, String(cat._id)]
      )
    }
    className={`
      px-3 py-1 rounded-full border text-sm transition
      ${
        selectedCategories.includes(String(cat._id))
          ? "bg-[#8B5C42] text-white border-[#8B5C42]"
          : "bg-white text-[#2D2926] border-gray-300"
      }
    `}
  >
    {cat.name}
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
  min={PRICE_MIN}
  max={PRICE_MAX}
  step="1"
  onChange={(e) => handlePriceInput(e.target.value, 0)}
  className="w-full p-2 border border-gray-300 rounded-md text-center"
/>


    <span className="text-gray-600">-</span>

    <input
  type="number"
  value={priceRange[1]}
  min={PRICE_MIN}
  max={PRICE_MAX}
  step="1"
  onChange={(e) => handlePriceInput(e.target.value, 1)}
  className="w-full p-2 border border-gray-300 rounded-md text-center"
/>

  </div>

  {/* SLIDER TRACK */}
  <div className="relative h-2 bg-gray-300 rounded-md mb-6">
    {/* selected range */}
    <div
      className="absolute h-2 bg-black rounded-md"
      style={{
        left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
width: `${((priceRange[1] - priceRange[0]) / PRICE_MAX) * 100}%`,

      }}
    ></div>
  </div>

  {/* SLIDER HANDLES */}
<div className="relative range-input" style={{ marginTop: "-10px" }}>
    <input
  type="range"
  min={PRICE_MIN}
  max={PRICE_MAX}
  value={priceRange[0]}
  onChange={(e) => handleRangeChange(e, 0)}
  className="absolute w-full cursor-pointer pointer-events-auto"
  style={{ top: "-25px" }}  
/>

<input
  type="range"
  min={PRICE_MIN}
  max={PRICE_MAX}
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
  <span>1250</span>
  <span>2500</span>
  <span>3750</span>
  <span>5000</span>
</div>
{/* PRICE LIMIT TOOLTIP */}
{showPriceTooltip && (
  <div className="mt-2 text-xs text-red-600">
    Maximum allowed price is ${PRICE_MAX}
  </div>
)}

</div>

            {/* ===== TAGS & STYLE ===== */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#2D2926] mb-2">
                Tags & Style
              </p>

              <div className="flex flex-wrap gap-2">
                {tagAttribute && tagAttribute.options?.length > 0 && (
  <div className="mb-6">
    <p className="text-sm font-semibold text-[#2D2926] mb-2">
      {tagAttribute.name}
    </p>

    <div className="flex flex-wrap gap-2">
      {tagAttribute.options.map((opt) => {
        const tag = opt.label;

        return (
          <button
            key={opt._id}
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
        );
      })}
    </div>
  </div>
)}
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
    {/* Custom Signage Design Card - First Position */}
    <div
      className="
        block border-2 border-[#8B5C42] 
        rounded-xl shadow-lg
        transition-all duration-300 
        group hover:shadow-xl hover:scale-[1.02]
        bg-gradient-to-br from-[#FFF7F0] to-[#FFE5D9]
      "
    >
      {/* IMAGE */}
      <div className="h-32 rounded-t-xl overflow-hidden bg-gradient-to-br from-[#8B5C42] to-[#704A36] flex items-center justify-center">
        <div className="text-center text-white">
          <svg 
            className="w-10 h-10 mx-auto mb-1" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <p className="text-[10px] font-semibold">Custom Signage</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3">
        {/* NAME */}
        <h3 className="font-bold text-sm text-[#2D2926]">
          Custom Signage Design
        </h3>

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          Create personalized signage with custom text, fonts, colors, and backgrounds for your events.
        </p>

        {/* BUTTON */}
        <div className="mt-2 
             opacity-100 md:opacity-0 
             md:group-hover:opacity-100 
             transition-opacity duration-300">
          <button 
            onClick={() => navigate("/signage")}
            className="w-full bg-[#8B5C42] text-white px-3 py-1.5 rounded-lg text-xs shadow-md hover:bg-[#704A36] transition"
          >
            Create Signage
          </button>
        </div>
      </div>
    </div>

    {/* Loading State */}
    {loadingProducts ? (
      <div className="col-span-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5C42] mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    ) : (
      <>
        {filteredProducts.map((product) => (
      <a
href={`/buyproducts/${product._id}`}
        className="
          block border border-gray-300 hover:border-gray-500
          rounded-xl shadow 
          transition-all duration-300 
          group hover:shadow-lg hover:scale-[1.02]
        "
      >

        {/* IMAGE — NOW FULL WIDTH, NO PADDING */}
        <div className="h-32 rounded-t-xl overflow-hidden">
          <img
src={product.images?.[0]?.url || hero1}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="p-3">

          {/* NAME */}
          <h3 className="font-bold text-sm text-[#2D2926] line-clamp-2">
            {product.title}
          </h3>

          {/* PRICE SECTION */}
<div className="mt-1 flex items-center gap-2">
  {product.salePrice ? (
    <>
      {/* Original price */}
      <span className="text-gray-500 line-through text-xs">
        $ {product.pricePerDay}
      </span>

      {/* Sale price */}
      <span className="text-red-600 font-bold text-sm">
        $ {product.salePrice}
      </span>
    </>
  ) : (
    <span className="text-black font-semibold text-sm">
      $ {product.pricePerDay}
    </span>
  )}
</div>


          {/* CATEGORY */}
          <p className="text-[10px] text-gray-600 mt-0.5">
  Category: {getCategoryNameById(product.category)}
</p>



          {/* BUTTON */}
<div className="mt-2 
     opacity-100 md:opacity-0 
     md:group-hover:opacity-100 
     transition-opacity duration-300">
            <button className="w-full bg-black text-white px-3 py-1 rounded-lg text-xs shadow-md hover:bg-[#222222] transition">
              View Product
            </button>
          </div>

        </div>
      </a>
    ))}
      </>
    )}

  </div>
</main>

        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
