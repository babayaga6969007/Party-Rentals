import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";


// ====================
//  HELPER
// ====================
const today = new Date().toISOString().split("T")[0];

// 🔑 Get lowest priced variation (salePrice preferred)
// 🔑 Get lowest priced variation (salePrice preferred, then pricePerDay)
const getLowestVariation = (product) => {
  if (
    product?.productType === "rental" &&
    product?.productSubType === "variable" &&
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    return [...product.variations].sort((a, b) => {
      const aPrice = a.salePrice ?? a.pricePerDay ?? Infinity;
      const bPrice = b.salePrice ?? b.pricePerDay ?? Infinity;
      return aPrice - bPrice;
    })[0];
  }
  return null;
};


// 🖼️ Get correct image for product card
// 🖼️ Get correct image for product card
const getProductCardImage = (product) => {
  // Variable rental → first image of lowest priced variation
  if (
    product?.productType === "rental" &&
    product?.productSubType === "variable" &&
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    const lowestVar = getLowestVariation(product);
    return (
      lowestVar?.images?.[0]?.url ||
      "/placeholder-product.png"
    );
  }

  // Simple rental → base product image
  return (
    product?.images?.[0]?.url ||
    "/placeholder-product.png"
  );
};



//  Get correct price for product card
const getProductCardPrice = (product) => {
  const lowestVar = getLowestVariation(product);

  // Variable rental
  if (lowestVar) {
    return {
      price: lowestVar.pricePerDay,
      salePrice: lowestVar.salePrice,
    };
  }

  // Simple rental
  return {
    price: product.pricePerDay,
    salePrice: product.salePrice,
  };
};



const CategoryPageInside = () => {  const { id } = useParams(); // category id from URL
  // ====================
  //  FILTER STATES
  // ====================
  const [selectedTags, setSelectedTags] = useState([]);
  const PRICE_MIN = 0;

const PRICE_MAX = 5000;
const [showPriceTooltip, setShowPriceTooltip] = useState(false);

  const [priceRange, setPriceRange] = useState([0, PRICE_MAX]);
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
  setSelectedTags([]);
  setPriceRange([0, PRICE_MAX]);
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

const res = await api(`/products?category=${id}`);
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

const inCategory = String(productCategoryId) === String(id);


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
}, [products, selectedTags, priceRange, id]);
const currentCategory = categories.find(
  (c) => String(c._id) === String(id)
);
  // ====================
  //  RENDER
  // ====================
  return (
    <section className="py-20 px-6 bg-white">

      {/* PAGE HEADING */}
      <div className="page-wrapper max-w-4xl mx-auto text-center mb-10">
       <h1 className="text-4xl md:text-5xl font-semibold text-[#2D2926]"           style={{ fontFamily: '"Cormorant Garamond", serif' }}
>
        
  {currentCategory?.name || "Collection"}
</h1>

        <p
          className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Filter by date, category, style, and budget to find props that match your event perfectly.
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
      max={5000}
      step="1"
      onChange={(e) => handlePriceInput(e.target.value, 0)}

      className="w-full p-2 border border-gray-300 rounded-md text-center"
    />

    <span className="text-gray-600">-</span>

    <input
      type="number"
      value={priceRange[1]}
      min={0}
      max={5000}
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
{showPriceTooltip && (
  <div className="mt-2 text-xs text-red-600">
    Maximum allowed price is ${PRICE_MAX}
  </div>
)}

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
              px-3 py-1.5 rounded-full text-sm font-medium transition
              ${
                selectedTags.includes(tag)
                  ? "bg-black text-white border-2 border-black ring-2 ring-black ring-offset-1"
                  : "bg-white text-[#2D2926] border-2 border-gray-300 hover:border-gray-400"
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
  src={getProductCardImage(product)}
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
          {/* PRICE SECTION */}
{(() => {
  const { price, salePrice } = getProductCardPrice(product);

  return (
    <div className="mt-1 flex items-center gap-2">
      {salePrice && Number(salePrice) < Number(price) ? (
        <>
          <span className="text-gray-500 line-through text-sm">
            $ {price} / day
          </span>
          <span className="text-red-600 font-bold text-lg">
            $ {salePrice} / day
          </span>
        </>
      ) : (
        <span className="text-black font-semibold text-lg">
          $ {price} / day
        </span>
      )}
    </div>
  );
})()}



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

export default CategoryPageInside;