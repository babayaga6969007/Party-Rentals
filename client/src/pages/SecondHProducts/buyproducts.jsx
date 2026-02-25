import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { useCart } from "../../context/CartContext";


import {
  FiLock,
  FiHeadphones,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import lightsImg from "../../assets/addons/lights.png";
import flowersImg from "../../assets/addons/flowers.png";

// Product Images
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";



// Trust Badges
const trustBadges = [
  { label: "Secure Payments", icon: FiLock },
  { label: "Fast Customer Support", icon: FiHeadphones },
  { label: "Verified Quality", icon: FiCheckCircle },
  { label: "Hassle-Free Rentals", icon: FiRefreshCw },
];


const ProductPage = () => {
    // ====================
  //  PRODUCT DATA (FROM BACKEND)
  // ====================
  const { id } = useParams();
  const location = useLocation();

  const [product, setProduct] = useState(null);

const [selectedOptionState, setSelectedOptionState] = useState({});


  const productImages = product?.images?.map((img) => img.url) || [];

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  // DATE RANGE SELECTION
const today = new Date().toISOString().split("T")[0]; // disable past dates

const { addToCart, cartItems } = useCart();
const [customTitleText, setCustomTitleText] = useState("");
const isAlreadyInCart = cartItems.some(
  (item) =>
    item.productType === "purchase" &&
    item.productId === product?._id &&
    (item.customTitle || "").trim() === (product?.allowCustomTitle ? (customTitleText || "").trim() : "")
);



const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

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




  // Quantity of main product
  const [productQty, setProductQty] = useState(1);
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


  // Days selection
  const [days, setDays] = useState(1);

  // Addon quantities (legacy lights/flowers)
  const [addons, setAddons] = useState({
    lights: 0,
    flowers: 0,
  });

  const handleAddonChange = (type, inc) => {
    setAddons((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + inc),
    }));
  };

  // Product addons from API (shelving, etc.) — selection state
  const [selectedAddons, setSelectedAddons] = useState({});
  const [shelvingConfig, setShelvingConfig] = useState(null);
  const [shelvingTier, setShelvingTier] = useState("A");
  const [shelvingSize, setShelvingSize] = useState("");
  const [shelvingQuantity, setShelvingQuantity] = useState(1);

  // Date selection
  const [selectedDate, setSelectedDate] = useState("");
  

  // Add-on total calculation
  const isSalePage = location.pathname.startsWith("/buyproducts");
const regularPrice = Number(product?.pricePerDay || 0);
const salePrice = Number(product?.salePrice || 0);

// use salePrice if present, else fallback
const effectivePrice = salePrice || regularPrice;


  const addonsTotal = addons.lights * 10 + addons.flowers * 15;
  const maxStock = product?.availabilityCount ?? 1;


  // Final total price (base + product addons from API)
const totalRentalDays = selectedDays > 0 ? selectedDays : days;
const addonsTotalFromProduct = Object.values(selectedAddons).reduce((sum, a) => sum + (Number(a?.price) || 0), 0);
const totalPrice = effectivePrice * productQty + addonsTotalFromProduct;



const fullDescription = product?.description || "No description available.";



const shortDescription = fullDescription.substring(0, 120) + "...";
  


const [showFullDesc, setShowFullDesc] = useState(false);
// ⭐ ADD POPUP STATE
const [showPopup, setShowPopup] = useState(false);

// Fake “added to cart” product info
const addedItem = {
  name: product?.title || "Product",
  price: effectivePrice,
  qty: productQty,
  image: productImages[activeImage] || hero1,
};

// When user confirms booking




const handleAddToCart = () => {
  const unitPrice = effectivePrice;
  const addonsLine = Object.entries(selectedAddons).map(([optionId, a]) => ({
    optionId: a.realOptionId ?? optionId,
    name: a.name,
    price: a.price ?? 0,
    shelvingData: a.shelvingData ?? null,
  }));
  const addonsTotalForCart = addonsLine.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const lineTotal = unitPrice * productQty + addonsTotalForCart;

  addToCart({
    productId: product._id,
    name: product.title,
    productType: "purchase",
    qty: productQty,
    unitPrice,
    lineTotal,
    customTitle: product.allowCustomTitle ? (customTitleText || "").trim() : "",
    addons: addonsLine,
    image: productImages[activeImage],
    maxStock: product?.availabilityCount ?? 1,
  });

  setShowPopup(true);
};

  // ====================
  //  FETCH SINGLE PRODUCT
  // ====================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const res = await api(`/products/${id}`);
        const data = res?.product ?? res;
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

// ====================
//  RESET ACTIVE IMAGE ON PRODUCT CHANGE
// ====================
useEffect(() => {
  setActiveImage(0);
}, [id]);

// ====================
//  SYNC QTY WITH STOCK
// ====================
useEffect(() => {
  if (product && productQty > maxStock) {
    setProductQty(maxStock);
  }
}, [product, maxStock]);
// ====================
// ATTRIBUTE GROUPS FOR UI (Unified Options UI)
// ====================
const attributeGroupsForUI =
  product?.attributes
    ?.filter((a) => a?.groupId && Array.isArray(a.groupId.options))
    .map((a) => ({
      groupId: String(a.groupId._id),
      name: a.groupId.name,
      type: a.groupId.type,
      options: (a.groupId.options || []).filter((opt) =>
        (a.optionIds || []).some(
          (oid) => String(oid) === String(opt._id)
        )
      ),
    })) || [];

// ====================
// ADD-ONS FROM PRODUCT — same shape as ProductPage.jsx
// ====================
const normalize = (s = "") => String(s).toLowerCase().trim();
const renderedAddons =
  (product?.addons && Array.isArray(product.addons)
    ? product.addons
        .filter((a) => a && a.option)
        .map((a, index) => {
          const rawId = a.optionId != null ? String(a.optionId) : null;
          return {
            optionId: `${rawId ?? "addon"}-${index}`,
            realOptionId: rawId,
            name: a.option?.label ?? "Add-on",
            finalPrice:
              a.overridePrice !== null && a.overridePrice !== undefined
                ? a.overridePrice
                : (a.option?.priceDelta ?? 0),
            tier: a.shelvingTier ?? a.option?.tier,
            shelvingSize: a.shelvingSize,
            shelvingQuantity: a.shelvingQuantity,
          };
        })
    : []) || [];

const isShelvingLike = (a) => {
  const n = normalize(a?.name ?? "");
  return n === "shelving" || n.includes("shelving");
};
const addonsForDisplay = renderedAddons.filter((a, i, arr) => {
  if (!isShelvingLike(a)) return true;
  const firstShelvingIndex = arr.findIndex(isShelvingLike);
  return i === firstShelvingIndex;
});
// If API returned addons but our transform produced none (e.g. missing option), show raw addons
const hasProductAddons = Array.isArray(product?.addons) && product.addons.length > 0;
const addonsListToShow =
  addonsForDisplay.length > 0
    ? addonsForDisplay
    : hasProductAddons
      ? product.addons
          .filter((a) => a && (a.option || a.optionId))
          .map((a, i) => ({
            optionId: `${a.optionId ?? "addon"}-${i}`,
            realOptionId: a.optionId != null ? String(a.optionId) : null,
            name: a.option?.label ?? a.option?.name ?? "Add-on",
            finalPrice: a.overridePrice ?? a.option?.priceDelta ?? 0,
            tier: a.shelvingTier ?? a.option?.tier,
            shelvingSize: a.shelvingSize,
            shelvingQuantity: a.shelvingQuantity,
          }))
      : [];

const shelvingAddon = renderedAddons.find((a) => {
  const n = normalize(a.name);
  return n === "shelving" || (n.includes("shelving") && !n.includes("tier"));
});
const shelvingOptionIdFromRendered = shelvingAddon?.optionId ?? null;
const shelvingOptionId = shelvingOptionIdFromRendered ?? addonsListToShow.find(isShelvingLike)?.optionId ?? null;
const isShelvingSelected = shelvingOptionId ? !!selectedAddons[shelvingOptionId] : false;

// Fetch shelving config for price calculation
useEffect(() => {
  const fetchConfig = async () => {
    try {
      const res = await api("/shelving-config");
      setShelvingConfig(res?.config ?? null);
    } catch {
      setShelvingConfig(null);
    }
  };
  fetchConfig();
}, []);

const productShelvingAddon = product?.addons?.find((a) => {
  const n = normalize(a.option?.label || a.name || "");
  return n === "shelving" || (n.includes("shelving") && !n.includes("tier"));
});
const shelvingOverrides = productShelvingAddon?.shelvingPriceOverrides;

const shelvingTierAOptions = (shelvingOverrides?.tierA?.sizes?.length > 0
  ? shelvingOverrides.tierA.sizes
  : shelvingConfig?.tierA?.sizes
) || [
  { size: "24\"", dimensions: "24\" long x 5.5\" deep x 0.75\" thick", price: 20 },
  { size: "34\"", dimensions: "34\" long x 5.5\" deep x 0.75\" thick", price: 25 },
  { size: "46\"", dimensions: "46\" long x 5.5\" deep x 0.75\" thick", price: 25 },
  { size: "70\"", dimensions: "70\" long x 5.5\" deep x 0.75\" thick", price: 32 },
  { size: "83\"", dimensions: "83\" long x 5.5\" deep x 0.75\" thick", price: 38 },
  { size: "94\"", dimensions: "94\" long x 5.5\" deep x 0.75\" thick", price: 43 },
];
const shelvingTierBPrice = (shelvingOverrides?.tierB != null && Number(shelvingOverrides.tierB?.price) >= 0)
  ? Number(shelvingOverrides.tierB.price)
  : (shelvingConfig?.tierB?.price ?? 29);
const shelvingTierCPrice = (shelvingOverrides?.tierC != null && Number(shelvingOverrides.tierC?.price) >= 0)
  ? Number(shelvingOverrides.tierC.price)
  : (shelvingConfig?.tierC?.price ?? 50);

const calculateShelvingPrice = (tier, size, quantity, selected) => {
  if (!selected) return 0;
  if (tier === "A") {
    if (!size) return 0;
    const opt = shelvingTierAOptions.find((o) => o.size === size);
    return (opt?.price ?? 0) * quantity;
  }
  if (tier === "B" && size === "yes") return shelvingTierBPrice * quantity;
  if (tier === "C" && size === "yes") return shelvingTierCPrice * quantity;
  return 0;
};

// Init shelving tier/size/quantity from product addon
useEffect(() => {
  if (!shelvingOptionId || !renderedAddons?.length) return;
  const addon = renderedAddons.find((a) => a.optionId === shelvingOptionId);
  const newTier = addon?.tier || "A";
  setShelvingTier(newTier);
  if (newTier !== "A") {
    setShelvingSize("yes");
    setShelvingQuantity(addon?.shelvingQuantity != null ? Number(addon.shelvingQuantity) : 1);
  } else if (addon?.shelvingSize) {
    setShelvingSize(addon.shelvingSize);
    setShelvingQuantity(addon?.shelvingQuantity != null ? Number(addon.shelvingQuantity) : 1);
  }
}, [shelvingOptionId, product?._id]);

useEffect(() => {
  if (isShelvingSelected && shelvingTier === "A" && !shelvingSize && shelvingTierAOptions?.[0]?.size) {
    setShelvingSize(shelvingTierAOptions[0].size);
    setShelvingQuantity(1);
  }
}, [isShelvingSelected, shelvingTier, shelvingSize, shelvingTierAOptions]);

// Sync selectedAddons price when shelving tier/size/quantity changes
useEffect(() => {
  if (!shelvingOptionId || !isShelvingSelected) return;
  const price = calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true);
  setSelectedAddons((prev) => {
    if (!prev[shelvingOptionId]) return prev;
    return {
      ...prev,
      [shelvingOptionId]: {
        ...prev[shelvingOptionId],
        price,
        shelvingData: { tier: shelvingTier, size: shelvingSize, quantity: shelvingQuantity },
      },
    };
  });
}, [shelvingTier, shelvingSize, shelvingQuantity, shelvingOptionId, isShelvingSelected]);

const toggleAddon = (addon) => {
  setSelectedAddons((prev) => {
    const next = { ...prev };
    if (next[addon.optionId]) {
      delete next[addon.optionId];
      if (addon.optionId === shelvingOptionId) {
        setShelvingTier("A");
        setShelvingSize("");
        setShelvingQuantity(1);
      }
    } else {
      next[addon.optionId] = {
        name: addon.name,
        price: addon.optionId === shelvingOptionId ? 0 : addon.finalPrice,
        realOptionId: addon.realOptionId ?? addon.optionId,
      };
      if (addon.optionId === shelvingOptionId) {
        next[addon.optionId].shelvingData = { tier: shelvingTier, size: shelvingSize, quantity: shelvingQuantity };
        next[addon.optionId].price = calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true);
      }
    }
    return next;
  });
};

// ====================
// AUTO-SELECT DEFAULT ATTRIBUTE OPTIONS (SALE PAGE)
// ====================
useEffect(() => {
  if (attributeGroupsForUI.length === 0) return;

  const defaults = {};

  attributeGroupsForUI.forEach((g) => {
    if (g.options?.length >= 1) {
      // if only one option → select it
      // if multiple options → select first
      defaults[g.groupId] = String(g.options[0]._id);
    }
  });

  // Apply defaults ONLY on first load
  setSelectedOptionState((prev) =>
    Object.keys(prev).length > 0 ? prev : defaults
  );
}, [product?._id, attributeGroupsForUI.length]);

if (loadingProduct) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">Loading...</div>;
}

if (productError) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">{productError}</div>;
}

if (!product) {
  return <div className="page-wrapper max-w-7xl mx-auto px-6 py-20">Product not found</div>;
}


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
  src={productImages[activeImage] || hero1}
  className="w-full h-full object-cover"
  alt="Product"
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
          i === activeImage ? "border-black" : "border-transparent"
        }`}
        alt="Thumbnail"
      />
    ))}
  </div>
)}



          {/* ⭐ RECOMMENDED ADDONS UNDER IMAGE */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-[#2D2926] mb-4">
              You May Also Like
            </h3>

            <div className="grid grid-cols-2 gap-4">

              {/* Lights Add-on */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img
                  src={lightsImg}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                />
                <p className="font-medium">Warm LED Lights</p>
                

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleAddonChange("lights", -1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{addons.lights}</span>
                  <button
                    onClick={() => handleAddonChange("lights", 1)}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Flowers Add-on */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img
                  src={flowersImg}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                />
                <p className="font-medium">Flower Garland Set</p>
                

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleAddonChange("flowers", -1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{addons.flowers}</span>
                  <button
                    onClick={() => handleAddonChange("flowers", 1)}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>
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
  {salePrice ? (
    <>
      <span className="text-xl text-gray-500 line-through">
        $ {regularPrice}
      </span>
      <span className="text-3xl font-semibold text-red-600">
        $ {salePrice}
      </span>
    </>
  ) : (
    <span className="text-3xl font-semibold text-black">
      $ {regularPrice}
    </span>
  )}
</div>



  {/* Stock — beside price on desktop, below on mobile */}
  <div className="mt-2 md:mt-0 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 inline-block">
    <p className="text-sm font-medium text-[#2D2926]">
     Stock Availability:{" "}
<span className="text-black font-semibold">
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
        : "bg-black hover:bg-gray-800"
    }
  `}
>
  +
</button>

          </div>

          {/* Custom title — when product allows it */}
          {product?.allowCustomTitle && (
            <div className="mt-4">
              <label className="block font-medium text-lg mb-2 text-[#2D2926]">
                Custom title
              </label>
              <input
                type="text"
                value={customTitleText}
                onChange={(e) => setCustomTitleText(e.target.value)}
                placeholder="e.g. Mr & Mrs, Smith Wedding"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-[#2D2926] focus:ring-2 focus:ring-black focus:border-transparent"
                maxLength={80}
              />
            </div>
          )}

          {/* Optional Add-ons (from product.addons — same as /product page) */}
          {addonsListToShow.length > 0 && (
            <div className="mt-6 bg-white p-5 rounded-xl shadow border border-gray-200">
              <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
                Optional Add-ons (Click to select)
              </h3>
              <div className="space-y-3">
                {addonsListToShow.map((addon) => {
                  const selected = !!selectedAddons[addon.optionId];
                  const isShelving = addon.optionId === shelvingOptionId || isShelvingLike(addon);
                  const isSelectedShelving = isShelving && selected;
                  const displayPrice = isSelectedShelving
                    ? calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true)
                    : addon.finalPrice;
                  return (
                    <div key={addon.optionId}>
                      <button
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 transition text-left
                          ${selected ? "border-black bg-gray-100" : "hover:bg-gray-50 border-gray-300"}
                        `}
                      >
                        <div>
                          <div className="font-medium text-gray-700">{addon.name}</div>
                          <div className="text-sm text-gray-500">
                            + $ {isSelectedShelving ? displayPrice : addon.finalPrice}
                          </div>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selected ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
                          {selected ? "Selected" : "Add"}
                        </span>
                      </button>
                      {/* Shelving: tier/size/quantity when selected */}
                      {isSelectedShelving && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          {shelvingTier === "A" && shelvingTierAOptions?.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                              <select
                                value={shelvingSize || ""}
                                onChange={(e) => setShelvingSize(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                              >
                                {shelvingTierAOptions.map((opt) => (
                                  <option key={opt.size} value={opt.size}>
                                    {opt.size} — ${opt.price ?? 0}/shelf
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                min={1}
                                max={shelvingTier === "C" ? 1 : 8}
                                value={shelvingQuantity}
                                onChange={(e) => setShelvingQuantity(Math.max(1, Math.min(shelvingTier === "C" ? 1 : 8, Number(e.target.value) || 1)))}
                                className="w-24 p-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div className="text-sm text-gray-600 pt-6">
                              Shelving total: $ {calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TOTAL */}
         <div className="mt-8 text-2xl font-semibold text-[#2D2926]">
  Total : 
  ${totalPrice}
</div>


          {/* BUTTON */}
 <button
  onClick={handleAddToCart}
  disabled={
    (product?.availabilityCount ?? 0) === 0 || isAlreadyInCart
  }
  className={`mt-8 w-full py-3 rounded-lg text-white
    ${
      isAlreadyInCart || (product?.availabilityCount ?? 0) === 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black hover:bg-[#222222]"
    }`}
>
  {isAlreadyInCart
    ? "Product already in cart"
    : (product?.availabilityCount ?? 0) === 0
    ? "Out of Stock"
    : "Add to Cart"}
</button>







          <div className="mt-10 space-y-4">
        
{/* OPTIONS (Unified Attribute UI) */}
{attributeGroupsForUI.length > 0 && (
  <div className="bg-white p-5 rounded-xl shadow mb-4">
    <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
      Available Options
    </h3>

    {attributeGroupsForUI.map((g) => {
      const isPaint = g.type === "paint";
      return (
      <div key={g.groupId} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {g.name}
        </label>

        <div className="flex flex-wrap gap-2">
          {g.options.map((opt) => {
            const paintSrc = opt.imageUrl || (opt.value ? `/paint/${opt.value}` : null);
            return (
            <button
              key={String(opt._id)}
              type="button"
              onClick={() => {
                setSelectedOptionState((prev) => ({
                  ...prev,
                  [g.groupId]: String(opt._id),
                }));
              }}
              className={`rounded-xl border text-sm transition
                ${selectedOptionState?.[g.groupId] === String(opt._id)
                  ? "border-black bg-black text-white ring-2 ring-black ring-offset-1"
                  : "border-gray-300 bg-white hover:bg-gray-50"
                }
                ${isPaint ? "flex flex-col items-center gap-1.5 p-2" : "flex items-center gap-2 px-4 py-2"}
              `}
              title={opt.label}
            >
              {isPaint && paintSrc ? (
                <>
                  <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex shrink-0">
                    <img src={paintSrc} alt="" className="w-full h-full object-cover" />
                  </span>
                  <span className="text-xs font-medium text-center">{opt.label}</span>
                </>
              ) : (
                opt.label
              )}
            </button>
          );
          })}
        </div>
      </div>
    );
    })}
  </div>
)}

{/* DIMENSIONS (ONLY IF EXISTS) */}
{product?.dimensions && (
  <div className="bg-white p-5 rounded-xl shadow">
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
      className="mt-2 text-black font-medium underline hover:text-gray-800"
    >
      {showFullDesc ? "Read Less" : "Read More"}
    </button>
  </div>

  {/* TERMS & CONDITIONS */}
  <div className="bg-white p-5 rounded-xl shadow">
    <a
      href="/contract"
      className="font-semibold text-lg text-black underline hover:text-gray-800"
    >
      Terms & Conditions
    </a>
  </div>

</div>

        </div>
      </div>

      {/* ⭐ TRUST BADGE STRIP — FULL WIDTH, ABOVE FOOTER */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

          {trustBadges.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/10">
                  <Icon className="text-black" size={26} />
                </div>
                <span className="text-[#2D2926] font-medium text-[16px]">
                  {item.label}
                </span>
              </div>
            );
          })}

        </div>
      </div>
      {/* ============================
    ADD-TO-CART POPUP
=============================== */}
{showPopup && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-xl p-6 relative">

      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-3 right-3 text-xl"
      >
        ✖
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[#2D2926] mb-4">
        Just Added to Your Bag
      </h2>

      {/* PRODUCT ROW */}
      <div className="flex items-center gap-4 border-b pb-4">
        <img
          src={addedItem.image}
          className="w-20 h-20 rounded-lg object-cover"
        />

        <div>
          <p className="font-semibold text-[#2D2926]">{addedItem.name}</p>
          <p className="text-sm text-gray-600">Qty: {addedItem.qty}</p>
<p className="font-semibold mt-1">
  $ {addedItem.price} {!isSalePage && "/ day"}
</p>
        </div>
      </div>

      {/* SUBTOTAL */}
      <div className="flex justify-between mt-4 text-lg font-semibold">
        <span>Subtotal</span>
        <span>${addedItem.price * addedItem.qty}</span>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex gap-4">
        <button
          className="flex-1 border border-gray-400 py-3 rounded-full hover:bg-gray-100"
          onClick={() => setShowPopup(false)}
        >
          Continue Shopping
        </button>
<Link to="/cart" className="flex-1">

          <button className="w-full py-3 rounded-full bg-black text-white hover:bg-gray-800">
            Bag & Checkout →
          </button>
        </Link>
      </div>

      {/* ALSO BOUGHT */}
      <div className="mt-8">
  <h3 className="text-lg font-semibold mb-3">Customers Also Bought</h3>

  <div className="grid grid-cols-2 gap-4">
    
    {/* Example item 1 */}
    <div className="border rounded-lg p-3 text-center hover:shadow-md transition">
      <img
        src={lightsImg}
        className="h-20 w-full object-cover rounded mb-2"
        alt="Warm LED Lights"
      />
      <p className="text-sm">Warm LED Lights</p>
      <p className="font-semibold mb-2">$10</p>

      <button
        type="button"
        className="w-full py-1.5 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition"
        onClick={() => {
          // future: add to cart / addons
          console.log("Add Warm LED Lights");
        }}
      >
        Add
      </button>
    </div>

    {/* Example item 2 */}
    <div className="border rounded-lg p-3 text-center hover:shadow-md transition">
      <img
        src={flowersImg}
        className="h-20 w-full object-cover rounded mb-2"
        alt="Flower Garland Set"
      />
      <p className="text-sm">Flower Garland Set</p>
      <p className="font-semibold mb-2">$15</p>

      <button
        type="button"
        className="w-full py-1.5 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition"
        onClick={() => {
          // future: add to cart / addons
          console.log("Add Flower Garland Set");
        }}
      >
        Add
      </button>
    </div>

  </div>
</div>

    </div>
  </div>
)}

    </>
  );
};

export default ProductPage;
