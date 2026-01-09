import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import AddToCartModal from "../../components/cart/AddToCartModal";
import { useCart } from "../../context/CartContext";


import {
  FiLock,
  FiHeadphones,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";



// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];


const ProductPage = () => {
    // ====================
  //  PRODUCT DATA (BACKEND)
  // ====================
  const { id } = useParams();

const [openPricingChart, setOpenPricingChart] = useState(false);
const [openShippingModal, setOpenShippingModal] = useState(false); // ✅ ADD THIS
const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
    const maxStock = product?.availabilityCount ?? 1;
const [signageText, setSignageText] = useState("");
const [signageError, setSignageError] = useState("");
// ===== VINYL WRAP STATES =====
const [vinylColor, setVinylColor] = useState(""); // e.g. "red" OR "custom"
const [vinylHex, setVinylHex] = useState("");     // only when custom
const [vinylError, setVinylError] = useState("");

const [selectedAddons, setSelectedAddons] = useState({}); 
// shape: { [optionId]: { name, price } }
const navigate = useNavigate();

const handleGoToCart = () => {
  setOpenModal(false);   // close modal
  navigate("/cart");    // or "/checkout" if that’s your route
};

  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [openModal, setOpenModal] = useState(false);
const [chosenProduct, setChosenProduct] = useState(null);
// ====================
//  PEOPLE ALSO BUY (RELATED PRODUCTS)
// ====================
const [relatedProducts, setRelatedProducts] = useState([]);

// ZIP based shipping detection
const [zipCode, setZipCode] = useState("");
const [detectedZone, setDetectedZone] = useState(null);
const [zipError, setZipError] = useState("");

// Convert date to readable format
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Calculate number of days selected
const selectedDays =
  startDate && endDate
    ? Math.max(
        1,
        Math.ceil(
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        ) + 1
      )
    : startDate
    ? 1
    : 0;


  // ⭐ THIS IS WHERE THE HOOKS MUST GO
    // Product images from backend
  const productImages = product?.images?.map((img) => img.url) || [];

  const [activeImage, setActiveImage] = useState(0);

const handleNext = () => {
  if (productImages.length <= 1) return;
  setActiveImage((prev) => (prev + 1) % productImages.length);
};

const handlePrev = () => {
  if (productImages.length <= 1) return;
  setActiveImage((prev) =>
    prev === 0 ? productImages.length - 1 : prev - 1
  );
};

// ====================
// ZIP → ZONE DETECTION
// ====================
const detectZoneFromZip = (zip) => {
  const z = Number(zip);

  if (z >= 90000 && z <= 93999) {
    return {
      zone: "Zone 1",
      area: "Same State (CA)",
      oneWay: 20,
      roundTrip: 35,
    };
  }

  if (z >= 94000 && z <= 96999) {
    return {
      zone: "Zone 2",
      area: "Nearby States",
      oneWay: 35,
      roundTrip: 60,
    };
  }

  if (z >= 97000 && z <= 98999) {
    return {
      zone: "Zone 3",
      area: "Regional",
      oneWay: 60,
      roundTrip: 100,
    };
  }

  if (z >= 99000 && z <= 99999) {
    return {
      zone: "Zone 4",
      area: "Extended",
      oneWay: 100,
      roundTrip: 170,
    };
  }

  return {
    zone: "Zone 5",
    area: "Outstation",
    oneWay: null,
    roundTrip: null,
    note: "Custom quote required",
  };
};


  // Quantity of main product
  const [productQty, setProductQty] = useState(1);
  // ====================
//  RELATED PRODUCT QUANTITIES
// ====================
const [relatedQty, setRelatedQty] = useState({});

 const handleProductQtyChange = (inc) => {
  setProductQty((prev) => {
    const nextQty = prev + inc;

    // Minimum = 1
    if (nextQty < 1) return 1;

    // Maximum = available stock
    if (nextQty > maxStock) return maxStock;

    return nextQty;
  });
};

const handleRelatedQtyChange = (productId, inc, maxStock) => {
  setRelatedQty((prev) => {
    const currentQty = prev[productId] || 0;
    const nextQty = currentQty + inc;

    if (nextQty < 0) return prev;
    if (nextQty > maxStock) return prev;

    return {
      ...prev,
      [productId]: nextQty,
    };
  });
};


  
const fullDescription =
  product?.description || "No description available.";



const shortDescription = fullDescription.substring(0, 120) + "...";

const [showFullDesc, setShowFullDesc] = useState(false);


  // Date selection
  const [selectedDate, setSelectedDate] = useState("");



  // Final total price
// priority: use date range if selected, else manual days input
const totalRentalDays = selectedDays;
// Use salePrice if available, else fallback to regular price
const effectivePricePerDay = Number(
  product?.salePrice ?? product?.pricePerDay ?? 0
);

// ====================
//  RELATED PRODUCTS TOTAL
// ====================
const relatedTotal = relatedProducts.reduce((sum, rp) => {
  const qty = relatedQty[rp._id] || 0;
  return sum + qty * (rp.pricePerDay || 0);
}, 0);


const selectedAddonTotal = Object.values(selectedAddons).reduce(
  (sum, a) => sum + (Number(a.price) || 0),
  0
);

// ====================
//  FINAL TOTAL PRICE
// ====================
const totalPrice =
  totalRentalDays *
  (effectivePricePerDay * productQty + relatedTotal + selectedAddonTotal);





    // ====================
  //  FETCH SINGLE RENTAL PRODUCT
  // ====================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const res = await api(`/products/${id}`);
        const data = res?.product || res;

        setProduct(data);
      } catch (err) {
        console.error(err);
        setProductError("Failed to load product");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

console.log("PRODUCT ADDONS:", product?.addons);

// ====================
// PRICING CHART LOGIC
// ====================

// discount based on days
const getDiscountRate = (days) => {
  if (days <= 3) return 0;
  if (days <= 7) return 0.05;
  if (days <= 15) return 0.1;
  if (days <= 30) return 0.15;
  if (days <= 60) return 0.2;
  return 0.25;
};

// days to show in table (10 rows)
const pricingDays = [1, 3, 5, 7, 10, 15, 30, 45, 60, 90];

const pricingTableData = pricingDays.map((days) => {
const basePrice = effectivePricePerDay * days;
  const discount = getDiscountRate(days);
  const finalPrice = Math.round(basePrice * (1 - discount));
  const approxPerDay = Math.round(finalPrice / days);

  return {
    days,
    finalPrice,
    approxPerDay,
  };
});

  // ====================
//  FETCH RELATED PRODUCTS (SAME CATEGORY, RENTAL, MAX 2)
// ====================
useEffect(() => {
  const fetchRelated = async () => {
    try {
      if (!product) return;

      // category could be ID or populated object
      const currentCategoryId =
        typeof product.category === "object"
          ? String(product.category?._id)
          : String(product.category);

      const res = await api("/products");
      const all = res?.products || [];

      // Filter: rental + same category + not same product
      const sameCategoryRental = all.filter((p) => {
        const pCategoryId =
          typeof p.category === "object" ? String(p.category?._id) : String(p.category);

        return (
          p.productType === "rental" &&
          pCategoryId === currentCategoryId &&
          String(p._id) !== String(product._id)
        );
      });

      // Randomize + cap to 2
      const shuffled = [...sameCategoryRental].sort(() => Math.random() - 0.5);
      setRelatedProducts(shuffled.slice(0, 2));
    } catch (err) {
      console.error(err);
      setRelatedProducts([]);
    }
  };

  fetchRelated();
}, [product]);


  // ====================
//  SYNC QTY WITH STOCK
// ====================
useEffect(() => {
  if (product && productQty > maxStock) {
    setProductQty(maxStock);
  }
}, [product, maxStock]);


const renderedAttributes = product?.attributes?.map((attr) => {
  if (!attr.groupId) return null;

  const selectedOptions =
    attr.groupId.options?.filter((opt) =>
      attr.optionIds?.some(
        (oid) => String(oid) === String(opt._id)
      )
    ) || [];

  if (selectedOptions.length === 0) return null;



  return {
    groupName: attr.groupId.name,
    values: selectedOptions.map((o) => o.label),
  };
});

// ====================
// ADD-ONS (safe even when product is null during loading)
// ====================
const renderedAddons =
  product?.addons
    ?.filter((a) => a.option)
    .map((a) => ({
      optionId: String(a.optionId),
      name: a.option.label,
      finalPrice:
        a.overridePrice !== null && a.overridePrice !== undefined
          ? a.overridePrice
          : a.option.priceDelta || 0,
    })) || [];

// helper: normalize strings for matching
const normalize = (s = "") => s.toLowerCase().trim();

// find signage addon from renderedAddons (if exists for this product)
const signageAddon = renderedAddons.find((a) => {
  const n = normalize(a.name);
  return n === "signage" || n === "sinage";
});

const signageOptionId = signageAddon?.optionId || null;

// true only when signage addon exists AND user selected it
const isSignageSelected = signageOptionId
  ? !!selectedAddons[signageOptionId]
  : false;

// clear signage text when deselected
useEffect(() => {
  if (!isSignageSelected) {
    setSignageText("");
    setSignageError("");
  }
}, [isSignageSelected]);

// ===== VINYL WRAP ADDON DETECTION =====
const vinylAddon = renderedAddons.find((a) => {
  const n = normalize(a.name);
  return n === "vinyl wrap" || n === "vinylwrap"; // support spacing variant
});

const vinylOptionId = vinylAddon?.optionId || null;

const isVinylSelected = vinylOptionId
  ? !!selectedAddons[vinylOptionId]
  : false;

// 7 basic vinyl colors
const vinylColors = [
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "yellow", label: "Yellow" },
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
  { id: "orange", label: "Orange" },
];

// Clear vinyl selections when vinyl wrap gets deselected
useEffect(() => {
  if (!isVinylSelected) {
    setVinylColor("");
    setVinylHex("");
    setVinylError("");
  }
}, [isVinylSelected]);


if (loadingProduct) {
  return <div className="max-w-7xl mx-auto px-6 py-20">Loading...</div>;
}

if (productError) {
  return <div className="max-w-7xl mx-auto px-6 py-20">{productError}</div>;
}

if (!product) {
  return <div className="max-w-7xl mx-auto px-6 py-20">Product not found</div>;
}
const toggleAddon = (addon) => {
  setSelectedAddons((prev) => {
    const next = { ...prev };

    if (next[addon.optionId]) {
      // unselect
      delete next[addon.optionId];

      // if this addon is signage, clear text too
      if (addon.optionId === signageOptionId) {
        setSignageText("");
        setSignageError("");
      }
    } else {
      // select
      next[addon.optionId] = {
        name: addon.name,
        price: addon.finalPrice,
      };
    }

    return next;
  });
};


  return (
    <>
      {/* MAIN PRODUCT GRID */}
      <div className="page-wrapper max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* LEFT COLUMN */}
        <div>
          {/* MAIN IMAGE WITH ARROWS */}
<div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow-lg">

  {/* Main Image */}
  <img
  src={productImages[activeImage] || ""}
  className="w-full h-full object-cover"
  alt={product?.title || "Product"}
/>

  {/* LEFT ARROW */}
  {productImages.length > 1 && (
  <button
    onClick={handlePrev}
    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❮
  </button>
)}

{productImages.length > 1 && (
  <button
    onClick={handleNext}
    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
  >
    ❯
  </button>
)}


</div>


          {/* THUMBNAILS */}
{productImages.length > 1 && (
  <div className="grid grid-cols-4 gap-3 mt-4">
    {productImages.map((img, i) => (
      <img
        key={i}
        src={img}
        onClick={() => setActiveImage(i)}
        className={`w-full h-20 object-cover rounded-xl shadow cursor-pointer transition border-2 ${
          i === activeImage ? "border-[#8B5C42]" : "border-transparent"
        }`}
      />
    ))}
  </div>
)}


{/* ⭐ PEOPLE ALSO BUY (SAME CATEGORY, RENTAL) */}
{relatedProducts.length > 0 && (
  <div className="mt-10">
    <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
      Customers Also Bought
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {relatedProducts.map((rp) => (
        <div
          key={rp._id}
          className="bg-white p-4 rounded-xl shadow-md"
        >
          {/* CLICKABLE AREA */}
          <Link to={`/product/${rp._id}`}>
            <div className="w-full h-28 rounded-lg overflow-hidden mb-3">
              <img
                src={rp.images?.[0]?.url || ""}
                alt={rp.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-medium text-[#2D2926] line-clamp-1">
              {rp.title}
            </p>
          </Link>

          <p className="text-[#8B5C42] font-semibold mt-1">
            $ {rp.pricePerDay} / day
          </p>

          {/* QUANTITY CONTROLS */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() =>
                handleRelatedQtyChange(
                  rp._id,
                  -1,
                  rp.availabilityCount ?? 0
                )
              }
              className="px-3 py-1 border rounded"
            >
              −
            </button>

            <span className="min-w-[20px] text-center">
              {relatedQty[rp._id] || 0}
            </span>

            <button
              onClick={() =>
                handleRelatedQtyChange(
                  rp._id,
                  1,
                  rp.availabilityCount ?? 0
                )
              }
              disabled={
                (relatedQty[rp._id] || 0) >= (rp.availabilityCount ?? 0)
              }
              className={`px-3 py-1 rounded border
                ${
                  (relatedQty[rp._id] || 0) >= (rp.availabilityCount ?? 0)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }
              `}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}



        </div>

        {/* RIGHT COLUMN */}
        <div>
          <h1 className="text-4xl font-semibold text-[#2D2926] mb-4">
{product?.title || "—"}
          </h1>

          {/* PRICE + STOCK (Responsive layout) */}
<div className="mt-2 flex flex-col md:flex-row md:items-center md:gap-6">

  {/* Price */}
  <div className="flex items-baseline gap-3">
  {product.salePrice ? (
    <>
      <span className="text-xl text-gray-500 line-through">
        $ {product.pricePerDay} / day
      </span>
      <span className="text-3xl font-semibold text-red-600">
        $ {product.salePrice} / day
      </span>
    </>
  ) : (
    <span className="text-3xl font-semibold text-[#8B5C42]">
      $ {product.pricePerDay} / day
    </span>
  )}
</div>


  {/* Stock — beside price on desktop, below on mobile */}
  <div className="mt-2 md:mt-0 bg-[#FFF7F0] border border-[#E5DED6] rounded-lg px-4 py-2 inline-block">
    <p className="text-sm font-medium text-[#2D2926]">
      Stock Availability: <span className="text-[#8B5C42] font-semibold">
  {product?.availabilityCount ?? 0}
</span>

    </p>
  </div>

</div>

          {/* ⭐ PRODUCT QUANTITY */}
          <div className="flex items-center gap-4 mt-4">
            <p className="font-medium text-lg">Quantity:</p>

            <button
              onClick={() => handleProductQtyChange(-1)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span className="text-xl">{productQty}</span>

           <button
  onClick={() => handleProductQtyChange(1)}
  disabled={productQty >= maxStock}
  className={`px-3 py-1 rounded text-white
    ${
      productQty >= maxStock
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#8B5C42] hover:bg-[#704A36]"
    }
  `}
>
  +
</button>

          </div>


{/* PRODUCT ATTRIBUTES */}

{/* ADD-ONS */}
{/* ADD-ONS */}
{renderedAddons?.length > 0 && (
  <div className="mt-8 bg-white p-5 rounded-xl shadow">
    <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
      Optional Add-ons (Click to select)
    </h3>

    <div className="space-y-3">
      {renderedAddons.map((addon) => {
        const selected = !!selectedAddons[addon.optionId];

        return (
          <button
            key={addon.optionId}
            type="button"
            onClick={() => toggleAddon(addon)}
            className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 transition
              ${selected ? "border-[#8B5C42] bg-[#FFF7F0]" : "hover:bg-gray-50"}
            `}
          >
            <div className="text-left">
              <div className="font-medium text-gray-700">{addon.name}</div>
              <div className="text-sm text-gray-500">
                + $ {addon.finalPrice}
              </div>
            </div>

            <div
              className={`text-sm font-semibold px-3 py-1 rounded-full
                ${selected ? "bg-[#8B5C42] text-white" : "bg-gray-200 text-gray-700"}
              `}
            >
              {selected ? "Selected" : "Add"}
            </div>
          </button>
        );
      })}
    </div>

    {/* Selected summary */}
    {Object.keys(selectedAddons).length > 0 && (
      <div className="mt-5 text-sm text-gray-700">
        <div className="font-semibold mb-2">Selected Add-ons:</div>
        <ul className="list-disc ml-5 space-y-1">
          {Object.entries(selectedAddons).map(([id, a]) => (
            <li key={id}>
              {a.name} (+ $ {a.price})
            </li>
          ))}
        </ul>

        <div className="mt-3 font-semibold text-[#2D2926]">
          Add-ons total per day: $ {selectedAddonTotal}
        </div>
        {/* Signage custom text field (only if this product has signage addon AND it's selected) */}
{signageOptionId && isSignageSelected && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Signage Text
    </label>

    <input
      type="text"
      value={signageText}
      onChange={(e) => {
        setSignageText(e.target.value);
        setSignageError("");
      }}
      placeholder="Enter what should be printed on the signage..."
      className="w-full p-3 border rounded-lg"
    />

    {signageError && (
      <p className="mt-1 text-sm text-red-600">{signageError}</p>
    )}
  </div>
)}
{/* ===== VINYL WRAP COLOR PICKER (only if vinyl addon exists AND selected) ===== */}
{vinylOptionId && isVinylSelected && (
  <div className="mt-5">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-gray-700">
        Vinyl Wrap Color (select one)
      </label>

      {vinylError && (
        <span className="text-sm text-red-600">{vinylError}</span>
      )}
    </div>

    {/* Color row */}
    <div className="mt-3 flex items-center gap-3 flex-wrap">
      {/* 7 circles */}
      {vinylColors.map((c) => {
        const selected = vinylColor === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setVinylColor(c.id);
              setVinylHex("");
              setVinylError("");
            }}
            title={c.label}
            className={`w-9 h-9 rounded-full transition border border-black
  ${selected ? "ring-2 ring-black" : ""}
`}
            style={{
              background:
                c.id === "white"
                  ? "#ffffff"
                  : c.id === "black"
                  ? "#000000"
                  : c.id, // red/blue/green/yellow/orange work as css colors
            }}
          />
        );
      })}

      {/* Custom box */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            setVinylColor("custom");
            setVinylError("");
          }}
          className={`h-9 px-3 rounded-lg border text-sm font-medium transition
            ${vinylColor === "custom" ? "border-black ring-2 ring-black" : "border-gray-300"}
          `}
        >
          Custom
        </button>

        {/* Tooltip on hover */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-11
                     opacity-0 group-hover:opacity-100 transition
                     bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap"
        >
          Choose color from https://htmlcolorcodes.com/
        </div>
      </div>
    </div>

    {/* HEX input only when custom is selected */}
    {vinylColor === "custom" && (
      <div className="mt-3">
        <input
          type="text"
          value={vinylHex}
          onChange={(e) => {
            setVinylHex(e.target.value);
            setVinylError("");
          }}
          placeholder="Put HEX code here"
          className="w-full p-3 border rounded-lg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Example: #FF5733
        </p>
      </div>
    )}
  </div>
)}


      </div>
      
    )}
  </div>
)}




{/* EVENT DATE SELECTION */}
<div className="mt-6 bg-[#FAF7F5] p-5 rounded-xl border border-[#E5DED6]">
  <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
    Event Date
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* START DATE */}
    <div>
      <label className="block mb-1 text-sm text-gray-600">
        Start Date
      </label>
      <input
        type="date"
        min={today}
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setEndDate("");
        }}
        className="w-full p-3 border rounded-lg"
      />
    </div>

    {/* END DATE */}
    <div>
      <label className="block mb-1 text-sm text-gray-600">
        End Date
      </label>
      <input
        type="date"
        min={startDate || today}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        disabled={!startDate}
        className="w-full p-3 border rounded-lg disabled:bg-gray-100"
      />
    </div>
  </div>

  {/* DATE SUMMARY */}
  <div className="mt-4 bg-white p-4 rounded-lg border text-sm text-[#2D2926]">
    {!startDate && <p>Please select an event start date.</p>}

    {startDate && !endDate && (
      <p>
        Event starts on <strong>{formatDate(startDate)}</strong>
      </p>
    )}

    {startDate && endDate && (
      <p>
        Event duration:{" "}
        <strong>
          {formatDate(startDate)} – {formatDate(endDate)}
        </strong>
        <br />
        Total Rental Days:{" "}
        <strong>{selectedDays} day{selectedDays > 1 ? "s" : ""}</strong>
      </p>
    )}
  </div>
</div>


          {/* TOTAL */}
         <div className="mt-8 text-2xl font-semibold text-[#2D2926]">
  Total ({totalRentalDays} {totalRentalDays === 1 ? "day" : "days"}): 
  ${totalPrice}
</div>

{Object.keys(relatedQty).length > 0 && (
  <div className="mt-3 text-sm text-gray-600">
    {relatedProducts.map((rp) => {
      const qty = relatedQty[rp._id] || 0;
      if (qty === 0) return null;

      return (
        <p key={rp._id}>
          {rp.title} × {qty}
        </p>
      );
    })}
  </div>
)}



          {/* BUTTON */}
          {/* CONFIRM BOOKING BUTTON */}
{/* CONFIRM BOOKING BUTTON */}
<button
  type="button"
  disabled={!startDate || !endDate}
  onClick={() => {
    if (!startDate || !endDate) return;
// validate signage text if signage is selected
if (isSignageSelected && !signageText.trim()) {
  setSignageError("Please enter the signage text.");
  return;
}
// ===== VINYL WRAP VALIDATION =====
if (isVinylSelected) {
  if (!vinylColor) {
    setVinylError("Please select a vinyl color.");
    return;
  }

  if (vinylColor === "custom") {
    const hex = vinylHex.trim();
    const isValidHex = /^#([0-9A-Fa-f]{6})$/.test(hex);

    if (!isValidHex) {
      setVinylError("Please enter a valid HEX code like #FF5733.");
      return;
    }
  }
}

const rentalCartItem = {
  // 🔑 cart-compatible payload
  productId: product._id,
  name: product.title,
  productType: "rental",

  qty: productQty,
unitPrice: effectivePricePerDay,
  days: totalRentalDays,
  startDate,
  endDate,

  addons: Object.entries(selectedAddons).map(([optionId, a]) => ({
    optionId,
    name: a.name,
    price: a.price,

    signageText:
      optionId === signageOptionId ? signageText : "",
    vinylColor:
      optionId === vinylOptionId ? vinylColor : "",
    vinylHex:
      optionId === vinylOptionId ? vinylHex : "",
  })),

  // 🔒 FINAL SNAPSHOT PRICE
  lineTotal: totalPrice,

  image: productImages[activeImage],
  maxStock: product.availabilityCount ?? 1,
};

// ✅ ADD TO CART IMMEDIATELY (THIS IS THE FIX)
addToCart(rentalCartItem);

// still needed for modal UI
setChosenProduct(rentalCartItem);

setOpenModal(true);

  }}
  className={`
    mt-8 w-full py-3 rounded-lg text-sm font-semibold transition-all
    ${
      !startDate || !endDate
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-[#222222]"
    }
  `}
>
  {!startDate || !endDate
    ? "Select Event Dates to Continue"
    : "Confirm Booking"}
</button>


{/* PRICING & SHIPPING BOXES */}
<div className="mt-4 flex flex-col md:flex-row gap-3">

  {/* PRICING CHART */}
  <button
    onClick={() => setOpenPricingChart(true)}
    className="
      flex items-center justify-center gap-2
      border border-black
      rounded-lg px-5 py-3
      text-sm font-medium text-[#2D2926]
      bg-white
      transition-all duration-200
      hover:bg-[#FFF7F0]
      hover:border-[#8B5C42]
      hover:text-[#8B5C42]
      hover:-translate-y-[1px]
      hover:shadow-md
    "
  >
    Pricing Chart
  </button>

  {/* SHIPPING RATES (DISABLED FOR NOW) */}
  <button
  type="button"
  onClick={() => setOpenShippingModal(true)}
  className="
    flex items-center justify-center gap-2
    border border-black
    rounded-lg px-5 py-3
    text-sm font-medium text-[#2D2926]
    bg-white
    transition-all duration-200
    hover:bg-[#F5F7FF]
    hover:border-[#4F46E5]
    hover:text-[#4F46E5]
    hover:-translate-y-[1px]
    hover:shadow-md
  "
>
  Shipping Rates
</button>

</div>




          <div className="mt-10 space-y-4">

{/* DIMENSIONS (ONLY IF EXISTS) */}
{product?.dimensions && (
  <div className="bg-white p-5 rounded-xl shadow mb-4">
    <h3 className="font-semibold text-lg text-[#2D2926]">
      Dimensions
    </h3>

    <p className="mt-2 text-gray-700">
      {product.dimensions}
    </p>
  </div>
)}

{/* DESCRIPTION */}
<div className="bg-white p-5 rounded-xl shadow">
  <h3 className="font-semibold text-lg text-[#2D2926]">Description</h3>

  <p className="mt-3 text-gray-700 leading-relaxed">
    {showFullDesc ? fullDescription : shortDescription}
  </p>


    <button
      onClick={() => setShowFullDesc(!showFullDesc)}
      className="mt-2 text-[#8B5C42] font-medium underline"
    >
      {showFullDesc ? "Read Less" : "Read More"}
    </button>
  </div>

  {/* TERMS & CONDITIONS */}
  <div className="bg-white p-5 rounded-xl shadow">
    <a
      href="/"
      className="font-semibold text-lg text-[#8B5C42] underline hover:text-[#704A36]"
    >
      Terms & Conditions
    </a>
  </div>

</div>

        </div>
      </div>

      
      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
<div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
  <div className="bg-[#FAF7F5] border border-[#E5DED6] rounded-2xl py-6 px-8 
                  flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

    {trustBadges.map((item, index) => {
      const Icon = item.icon;
      return (
        <div key={index} className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#8B5C42]/10">
            <Icon className="text-[#8B5C42]" size={26} />
          </div>
          <span className="text-[#2D2926] font-medium text-[16px]">
            {item.label}
          </span>
        </div>
      );
    })}
  </div>
</div>

{/* ⭐ MODAL — MUST BE OUTSIDE MAP & INSIDE RETURN */}
<AddToCartModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  product={chosenProduct}
  onGoToCart={handleGoToCart}
/>



{/* PRICING CHART MODAL */}
{openPricingChart && (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
    
    <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 relative">
      
      {/* CLOSE */}
      <button
        onClick={() => setOpenPricingChart(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-[#2D2926]">
        Pricing Chart
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        We provide flexible rental options ranging from <strong>1 day to 90 days</strong>.
        Longer rentals cost you less per day.
      </p>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-[#FAF7F5]">
            <tr>
              <th className="px-4 py-3 text-left">Rental Period</th>
              <th className="px-4 py-3 text-left">Rental Price</th>
              <th className="px-4 py-3 text-left">Price / Day (approx)</th>
            </tr>
          </thead>

          <tbody>
            {pricingTableData.map((row) => (
              <tr key={row.days} className="border-t">
                <td className="px-4 py-3">
                  {row.days} day{row.days > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 font-medium">
                  $ {row.finalPrice}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  $ {row.approxPerDay} / day
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
)}
{/* SHIPPING RATES MODAL */}
{openShippingModal && (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
    
    <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 relative">
      
      {/* CLOSE */}
      <button
        onClick={() => setOpenShippingModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-[#2D2926]">
        Shipping Rates
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        All deliveries are dispatched from our warehouse at:
        <br />
        <strong>2031 Via Burton Street, Suite A, USA</strong>
      </p>
{/* ZIP CODE CHECK */}
<div className="mt-5 bg-[#FAF7F5] p-4 rounded-lg border">
  <h4 className="font-semibold text-[#2D2926] mb-2">
    Check Delivery Availability by ZIP Code
  </h4>

  <div className="flex gap-3 flex-col sm:flex-row">
    <input
      type="text"
      value={zipCode}
      maxLength={5}
      placeholder="Enter ZIP code"
      className="flex-1 p-3 border rounded-lg"
      onChange={(e) => {
        setZipCode(e.target.value);
        setZipError("");
        setDetectedZone(null);
      }}
    />

    <button
      type="button"
      onClick={() => {
        if (!/^\d{5}$/.test(zipCode)) {
          setZipError("Please enter a valid 5-digit ZIP code");
          return;
        }

        const zone = detectZoneFromZip(zipCode);
        setDetectedZone(zone);
      }}
      className="px-5 py-3 rounded-lg bg-black text-white hover:bg-[#222]"
    >
      Check
    </button>
  </div>

  {zipError && (
    <p className="mt-2 text-sm text-red-600">{zipError}</p>
  )}

  {detectedZone && (
    <div className="mt-4 bg-white p-4 rounded-lg border text-sm">
      <p>
        <strong>Detected Zone:</strong> {detectedZone.zone}
      </p>
      <p>
        <strong>Coverage:</strong> {detectedZone.area}
      </p>

      {detectedZone.oneWay ? (
        <>
          <p className="mt-1">
            <strong>One-way:</strong> $ {detectedZone.oneWay}
          </p>
          <p>
            <strong>Round trip:</strong> $ {detectedZone.roundTrip}
          </p>
        </>
      ) : (
        <p className="mt-2 text-orange-600 font-medium">
          Custom shipping quote required
        </p>
      )}
    </div>
  )}
</div>

      {/* ZONE TABLE */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-[#F5F7FF]">
            <tr>
              <th className="px-4 py-3 text-left">Zone</th>
              <th className="px-4 py-3 text-left">Coverage</th>
              <th className="px-4 py-3 text-left">One-way</th>
              <th className="px-4 py-3 text-left">Round trip</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3 font-medium">Zone 1</td>
              <td className="px-4 py-3">Same State (CA)</td>
              <td className="px-4 py-3">$20</td>
              <td className="px-4 py-3">$35</td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3 font-medium">Zone 2</td>
              <td className="px-4 py-3">Nearby States</td>
              <td className="px-4 py-3">$35</td>
              <td className="px-4 py-3">$60</td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3 font-medium">Zone 3</td>
              <td className="px-4 py-3">Regional</td>
              <td className="px-4 py-3">$60</td>
              <td className="px-4 py-3">$100</td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3 font-medium">Zone 4</td>
              <td className="px-4 py-3">Extended</td>
              <td className="px-4 py-3">$100</td>
              <td className="px-4 py-3">$170</td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3 font-medium">Zone 5</td>
              <td className="px-4 py-3">100+ miles</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">Custom</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        * Shipping charges are indicative. Final cost may vary based on access,
        timing, and handling requirements.
      </p>

    </div>
  </div>
)}



    </>
  );
};

export default ProductPage;
