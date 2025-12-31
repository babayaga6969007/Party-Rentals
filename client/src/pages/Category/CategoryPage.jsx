import { useEffect, useMemo, useState } from "react";

import { api } from "../../utils/api";


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

  const [priceRange, setPriceRange] = useState([0, 500]);
  const [hoverPrice, setHoverPrice] = useState(null);
    // ====================
  //  BACKEND PRODUCTS STATE
  // ====================
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");


  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
const [tagAttribute, setTagAttribute] = useState(null);

    // ====================
  //  CATEGORY CHIPS (FROM BACKEND)
  // ====================
const categoryChips = categories.map((c) => ({
  label: c.name,
  value: String(c._id),
  img: c.image, // ✅ backend image URL
}));




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
  setPriceRange([0, 500]);
};
  // ====================
  //  FETCH PRODUCTS FROM BACKEND
  // ====================
   // ====================
  //  FETCH PRODUCTS FROM BACKEND
  // ====================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");

        const res = await api("/products");
        setProducts(res?.products || []);
      } catch (err) {
        console.error(err);
        setProductsError("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);
  // ====================
  //  FETCH CATEGORIES FROM BACKEND
  // ====================
 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api("/categories");

      const allCategories = res?.data || res || [];


      // ✅ ONLY RENTAL CATEGORIES FOR RENTAL PAGE
const rentalCategories = allCategories.filter(
  (c) => c.type === "rental"
);


      setCategories(rentalCategories);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCategories();
}, []);

useEffect(() => {
  const fetchAttributes = async () => {
    try {
      const res = await api("/admin/attributes");

      console.log("RAW ATTRIBUTES RESPONSE:", res);

      const allAttributes = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const tagsAttr = allAttributes.find(
        (a) => a.slug === "tags"
      );

      setAttributes(allAttributes);
      setTagAttribute(tagsAttr || null);
    } catch (err) {
      console.error("Failed to fetch attributes", err);
    }
  };

  fetchAttributes();
}, []);


// ====================
//  AUTO-SELECT ALL CATEGORIES ON LOAD
// ====================
useEffect(() => {
  if (categories.length > 0) {
    const allCategoryIds = categories.map((c) => String(c._id));
    setSelectedCategories(allCategoryIds);
  }
}, [categories]);



const tagOptionLabelById = useMemo(() => {
  if (!tagAttribute) return {};

  return tagAttribute.options.reduce((acc, opt) => {
    acc[String(opt._id)] = opt.label.toLowerCase();
    return acc;
  }, {});
}, [tagAttribute]);
// turns anything into an id string safely
const getId = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") {
    if (x._id) return String(x._id);
    if (x.id) return String(x.id);
  }
  return String(x);
};

  // ====================
  //  FILTERED PRODUCTS
  // ====================
  const filteredProducts = useMemo(() => {
return products.filter((p) => {
      //  EXCLUDE SALE PRODUCTS ON RENTAL PAGE
    if (p.productType !== "rental") return false;

    const productCategoryId =
  typeof p.category === "object" ? p.category?._id : p.category;

const inCategory =
  selectedCategories.length === 0 ||
  selectedCategories.includes(String(productCategoryId));


    const price = Number(p.pricePerDay ?? p.salePrice ?? 0);

const inPrice = price >= priceRange[0] && price <= priceRange[1];

// Find the Tags attribute selection for this product
// ✅ TAGS FILTER (FROM PRODUCT.attributes, using safe ID extraction)
const tagsGroupId = getId(tagAttribute); // <-- handles tagAttribute._id

const tagAttrSelection = Array.isArray(p.attributes)
  ? p.attributes.find((a) => getId(a.groupId) === tagsGroupId)
  : null;

// build lookup from optionId -> label (from tagAttribute.options)
const optionLabelById = (tagAttribute?.options || []).reduce((acc, opt) => {
  acc[getId(opt)] = (opt.label || "").toLowerCase();
  return acc;
}, {});

// product selected optionIds -> labels
const productTagLabels = tagAttrSelection
  ? (tagAttrSelection.optionIds || [])
      .map((oid) => optionLabelById[getId(oid)])
      .filter(Boolean)
  : [];

const selected = selectedTags.map((t) => t.toLowerCase());

const inTags =
  selected.length === 0 ||
  selected.every((t) => productTagLabels.includes(t));






    // ⬅️ Make sure to include AND inColor here
return inCategory && inPrice && inTags;
  });
}, [products, selectedCategories, selectedTags, priceRange]);


  // ====================
  //  RENDER
  // ====================
  return (
    <section className="py-20 px-6 bg-white">

      {/* PAGE HEADING */}
      <div className="page-wrapper max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Browse Our Collection
        </h1>

        <p
          className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Filter by date, category, style, and budget to find props that match your event perfectly.
        </p>
      </div>
      
      {/* BROWSE BY CATEGORY – ROUND ICONS */}
<div className="max-w-7xl mx-auto px-6 mt-2 mb-10 md:pl-20">
        

        <div className="flex flex-wrap justify-center gap-8">
{categoryChips.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() =>
                setSelectedCategories((prev) =>
                  prev.includes(cat.value)
                    ? prev.filter((c) => c !== cat.value) // click again = clear
                    : [...prev, cat.value]
                )
              }
              className="flex flex-col items-center group focus:outline-none"
            >
              <div
                className={`
                  w-20 h-20 rounded-full overflow-hidden shadow-md border-2
                  transition-all duration-300
                  ${
                    selectedCategories.includes(cat.value)
                      ? "border-[#8B5C42] scale-110"
                      : "border-transparent group-hover:border-gray-300"
                  }
                `}
              >
                <img
  src={cat.img || "/placeholder-category.png"}
  alt={cat.label}
  className="w-full h-full object-cover"
/>

              </div>

              <span className="mt-2 text-xs text-[#2D2926] group-hover:text-[#8B5C42]">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
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


           {/* ===== TAGS (FROM ATTRIBUTES) ===== */}
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
        );
      })}
    </div>
  </div>
)}


          


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
  <a key={product._id} href={`/product/${product._id}`}
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
  src={product.images?.[0]?.url || hero1}
  alt={product.title}
  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
/>

        </div>

        {/* CONTENT */}
        <div className="p-5">

          {/* NAME */}
          <h3 className="font-bold text-lg text-[#2D2926]">
            {product.title}
          </h3>

          {/* PRICE SECTION */}
          <div className="mt-1 flex items-center gap-2">
           <span className="text-black line-through text-sm">
  $ {product.pricePerDay} / day
</span>


<span className="text-red-600 font-bold text-lg">
  $ {Math.round((product.pricePerDay ?? 0) * 0.95)}/day
</span>


          </div>

          {/* CATEGORY */}
          <p className="text-sm text-gray-600 mt-1">
  Category: {
    categories.find(
      (c) => String(c._id) === String(product.category)
    )?.name || "—"
  }
</p>


          {/* BUTTON */}
<div className="mt-4 
     opacity-100 md:opacity-0 
     md:group-hover:opacity-100 
     transition-opacity duration-300">
            <button className="w-full bg-black text-white px-6 py-2 rounded-lg text-sm shadow-md hover:bg-[#222222] transition">
              Rent Now
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
