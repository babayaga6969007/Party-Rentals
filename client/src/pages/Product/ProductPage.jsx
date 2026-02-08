import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import AddToCartModal from "../../components/cart/AddToCartModal";
import ShippingRatesModal from "../../components/ShippingRatesModal";
import PricingChartModal from "../../components/PricingChartModal";
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
// ====================
// DIMENSION-BASED VARIATION (Rental Variable)
// ====================
const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
// which pedestal item (index) is chosen in dropdown
const [selectedPedestalIndex, setSelectedPedestalIndex] = useState("");

  const [openPricingChart, setOpenPricingChart] = useState(false);
  const [openShippingModal, setOpenShippingModal] = useState(false); // ✅ ADD THIS
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  // ====================
  // VARIATIONS (Rental Variable Products)
  // ====================
const isRental = product?.productType === "rental";

const isVariableRental =
  isRental && (product?.productSubType === "variable" || product?.variations?.length > 0);
// ====================
// DERIVED SELECTED VARIATION (FIX)
// ====================
const selectedVariation = useMemo(() => {
  if (!isVariableRental) return null;

  const vars = product?.variations || [];
  return vars[selectedVariationIndex] || null;
}, [isVariableRental, product?.variations, selectedVariationIndex]);


  // 🔑 Helper: get lowest priced variation (salePrice > price)
const getLowestPriceVariation = (variations = []) => {
  if (!variations.length) return null;

  return [...variations].sort((a, b) => {
    const aPrice = a.salePrice ?? a.pricePerDay ?? Infinity;
    const bPrice = b.salePrice ?? b.pricePerDay ?? Infinity;
    return aPrice - bPrice;
  })[0];
};

  const [selectedVarOptions, setSelectedVarOptions] = useState({});
  // shape: { [groupId]: optionId }


  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const maxStock = isVariableRental
    ? Number(selectedVariation?.stock ?? 0)
    : Number(product?.availabilityCount ?? 1);
  const [signageText, setSignageText] = useState("");
  const [signageError, setSignageError] = useState("");
  // ===== VINYL WRAP STATES =====
  const [vinylColor, setVinylColor] = useState(""); // e.g. "red" OR "custom"
  const [vinylHex, setVinylHex] = useState("");     // only when custom
  const [vinylError, setVinylError] = useState("");
  const [vinylImageFile, setVinylImageFile] = useState(null);
  const [vinylImagePreview, setVinylImagePreview] = useState("");
  const [vinylImageUrl, setVinylImageUrl] = useState(""); // Cloudinary URL after upload
  const [vinylImageUploading, setVinylImageUploading] = useState(false);

  const [selectedAddons, setSelectedAddons] = useState({});
  // shape: { [optionId]: { name, price } }
  // For shelving: { [optionId]: { name, price, shelvingData: { tier, size, quantity } } }
  const navigate = useNavigate();

  // Shelving state - MUST be before early returns (Rules of Hooks)
  // Get tier from the addon option itself (set by admin), default to "A" if not set
  // The tier is stored in the option data, we'll update it via useEffect when renderedAddons is available
  const [shelvingTier, setShelvingTier] = useState("A"); // Default to "A", will be updated from addon option
  const [shelvingSize, setShelvingSize] = useState(""); // For Tier A
  const [shelvingQuantity, setShelvingQuantity] = useState(1); // 1-8 for A/B, 1 for C
  const [shelvingError, setShelvingError] = useState("");
  const [customTitleText, setCustomTitleText] = useState(""); // e.g. telephone booth title
// ===== PAINT COLOR (ATTRIBUTE-LEVEL CUSTOM HEX) =====
const [paintCustomHex, setPaintCustomHex] = useState("");
const [paintCustomActive, setPaintCustomActive] = useState(false);

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



  // Product images from backend
// ====================
// PRODUCT IMAGES (FIXED FOR VARIATIONS)
// ====================
const productImages = isVariableRental
  ? (selectedVariation?.images || []).map((img) => img.url)
  : (product?.images || []).map((img) => img.url);

// Reset gallery when variation changes
useEffect(() => {
  setActiveImage(0);
}, [selectedVariationIndex]);

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



  // For variable rental, show selected variation's description when set, else product description
  const fullDescription =
    isVariableRental && selectedVariation?.description?.trim()
      ? selectedVariation.description.trim()
      : (product?.description || "No description available.");



  const shortDescription = fullDescription.substring(0, 120) + "...";

  const [showFullDesc, setShowFullDesc] = useState(false);


  // Date selection
  const [selectedDate, setSelectedDate] = useState("");



  // Final total price
  // priority: use date range if selected, else manual days input
  const totalRentalDays = selectedDays;
  // Use salePrice if available, else fallback to regular price
const effectivePricePerDay = Number(
  isVariableRental
    ? (selectedVariation?.salePrice ?? selectedVariation?.pricePerDay ?? 0)
    : (product?.salePrice ?? product?.pricePerDay ?? 0)
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
  // Calculate rental price using formula: Day 1 = 1x, each additional day = 0.5x
  const calculateRentalPrice = (numDays, basePrice) => {
    if (numDays <= 0) return 0;
    if (numDays === 1) return basePrice;
    // First day: 1x, each additional day: 0.5x
    return basePrice + (numDays - 1) * (basePrice * 0.5);
  };

  // Base price for main product (per unit)
  const baseProductPrice = effectivePricePerDay * productQty;
  
  // Calculate rental price for main product using the formula
  const mainProductRentalPrice = calculateRentalPrice(totalRentalDays, baseProductPrice);
  
  // Related products are still calculated per day (they follow their own pricing)
  const relatedProductsPrice = totalRentalDays * relatedTotal;
  
  // Addons are one-time fees, not per day
  const totalPrice = mainProductRentalPrice + relatedProductsPrice + selectedAddonTotal;





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
  // Auto-select first options for each group (only for variable rental)
useEffect(() => {
  if (!isVariableRental || !product?.variations?.length) return;

  const lowest = getLowestPriceVariation(product.variations);
  const index = product.variations.findIndex(
    (v) => String(v._id) === String(lowest?._id)
  );

  setSelectedVariationIndex(index >= 0 ? index : 0);
}, [isVariableRental, product?._id]);



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
// Groups available on this product (based on selected attributes)
const attributeGroupsForUI =
  product?.attributes
    ?.filter((a) => a?.groupId && Array.isArray(a.groupId.options))
    .map((a) => ({
      groupId: String(a.groupId._id),
      name: a.groupId.name,
      type: a.groupId.type,
      options: (a.groupId.options || []).filter((opt) =>
        (a.optionIds || []).some((oid) => String(oid) === String(opt._id))
      ),
    })) || [];

  // Auto-select first options for each group (only for variable rental)
 useEffect(() => {

  if (!isRental) {
    setSelectedVarOptions({});
    return;
  }

  // ✅ Rental (single OR variable): build default selections
  const defaults = {};

  attributeGroupsForUI.forEach((g) => {
    if (g.options?.length >= 1) {
      // if only 1 option → select it
      // if multiple options → select first one
      defaults[g.groupId] = String(g.options[0]._id);
    }
  });

  // ✅ Apply defaults ONLY ON FIRST LOAD
  setSelectedVarOptions((prev) =>
    Object.keys(prev).length > 0 ? prev : defaults
  );

}, [isRental, isVariableRental, product?._id, attributeGroupsForUI.length]);

 // re-run when product changes

  // ====================
  //  SYNC QTY WITH STOCK
  // ====================
  useEffect(() => {
    if (product && productQty > maxStock) {
      setProductQty(maxStock);
    }
  }, [product, maxStock, productQty]);

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

const [allAttributes, setAllAttributes] = useState([]);
useEffect(() => {
  const fetchAttributes = async () => {
    try {
     const res = await api("/admin/attributes");
const data = res?.data ?? res; 
setAllAttributes(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Failed to load attributes", err);
    }
  };

  fetchAttributes();
}, []);
const addonOptionMap = useMemo(() => {
  const map = {};

allAttributes.forEach((group) => {
  (group?.options || []).forEach((opt) => {
    map[String(opt._id)] = opt;
  });
});


  return map;
}, [allAttributes]);




  // ====================
  // ADD-ONS (safe even when product is null during loading)
const renderedAddons =
  product?.addons
    ?.map((a) => {
const normalizedOptionId =
  typeof a.optionId === "string"
    ? a.optionId
    : a.optionId?._id
    ? String(a.optionId._id)
    : null;

if (!normalizedOptionId) return null;

const opt = addonOptionMap[normalizedOptionId];
if (!opt) return null;
      if (!opt) return null;

      return {
  optionId: normalizedOptionId,
        name: opt.label,
        finalPrice:
          a.overridePrice !== null && a.overridePrice !== undefined
            ? a.overridePrice
            : opt.priceDelta || 0,
        tier: opt.tier,
      };
    })
    .filter(Boolean) || [];

  // helper: normalize strings for matching
  const normalize = (s = "") => s.toLowerCase().trim();

  // Client-facing: only one shelving addon (one tier). If product has multiple shelving options, show only the first.
  const isShelvingLike = (a) => {
    const n = normalize(a.name);
    return n === "shelving" || n.includes("shelving");
  };
  const addonsForDisplay =
    renderedAddons?.filter((a, i, arr) => {
      if (!isShelvingLike(a)) return true;
      const firstShelvingIndex = arr.findIndex(isShelvingLike);
      return i === firstShelvingIndex;
    }) ?? [];

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

  // ===== SHELVING ADDON DETECTION =====
  // Find "Shelving" addon (single addon, not tier-specific)
  const shelvingAddon = renderedAddons.find((a) => {
    const n = normalize(a.name);
    return n === "shelving" || (n.includes("shelving") && !n.includes("tier"));
  });

  const shelvingOptionId = shelvingAddon?.optionId || null;
  const isShelvingSelected = shelvingOptionId
    ? !!selectedAddons[shelvingOptionId]
    : false;



// ===== PEDESTALS ADDON DETECTION =====
const pedestalAddon = renderedAddons.find((a) => {
  const n = normalize(a.name);
  return n === "pedestals" || n === "pedestal";
});

const pedestalOptionId = pedestalAddon?.optionId || null;

const isPedestalSelected = pedestalOptionId
  ? !!selectedAddons[pedestalOptionId]
  : false;
const pedestalItems =
  pedestalOptionId && Array.isArray(product?.addons)
    ? (product.addons.find((a) => {
        const oid =
          typeof a.optionId === "string"
            ? a.optionId
            : a.optionId?._id
            ? String(a.optionId._id)
            : "";
        return oid === String(pedestalOptionId);
      })?.pedestals || [])
    : [];


  // Shelving config state
  const [shelvingConfig, setShelvingConfig] = useState(null);

  // Fetch shelving config
  useEffect(() => {
    const fetchShelvingConfig = async () => {
      try {
        const res = await api("/shelving-config");
        setShelvingConfig(res.config);
      } catch (err) {
        console.error("Failed to load shelving config:", err);
        // Use defaults if fetch fails
        setShelvingConfig({
          tierA: {
            sizes: [
              { size: "24\"", dimensions: "24\" long x 5.5\" deep x 0.75\" thick", price: 20 },
              { size: "34\"", dimensions: "34\" long x 5.5\" deep x 0.75\" thick", price: 25 },
              { size: "46\"", dimensions: "46\" long x 5.5\" deep x 0.75\" thick", price: 25 },
              { size: "70\"", dimensions: "70\" long x 5.5\" deep x 0.75\" thick", price: 32 },
              { size: "83\"", dimensions: "83\" long x 5.5\" deep x 0.75\" thick", price: 38 },
              { size: "94\"", dimensions: "94\" long x 5.5\" deep x 0.75\" thick", price: 43 },
            ],
          },
          tierB: { price: 29 },
          tierC: { price: 50 },
        });
      }
    };

    fetchShelvingConfig();
  }, []);

  // Shelving Tier A options (from config or defaults)
  const shelvingTierAOptions = shelvingConfig?.tierA?.sizes || [
    { size: "24\"", dimensions: "24\" long x 5.5\" deep x 0.75\" thick", price: 20 },
    { size: "34\"", dimensions: "34\" long x 5.5\" deep x 0.75\" thick", price: 25 },
    { size: "46\"", dimensions: "46\" long x 5.5\" deep x 0.75\" thick", price: 25 },
    { size: "70\"", dimensions: "70\" long x 5.5\" deep x 0.75\" thick", price: 32 },
    { size: "83\"", dimensions: "83\" long x 5.5\" deep x 0.75\" thick", price: 38 },
    { size: "94\"", dimensions: "94\" long x 5.5\" deep x 0.75\" thick", price: 43 },
  ];

  // Calculate shelving price based on tier, size, and quantity
  const calculateShelvingPrice = (tier, size, quantity, isSelected) => {
    if (!isSelected) return 0;

    if (tier === "A") {
      if (!size) return 0;
      const option = shelvingTierAOptions.find(opt => opt.size === size);
      if (!option) return 0;
      return option.price * quantity;
    } else if (tier === "B") {
      if (size !== "yes") return 0;
      const tierBPrice = shelvingConfig?.tierB?.price || 29;
      return tierBPrice * quantity;
    } else if (tier === "C") {
      if (size !== "yes") return 0;
      const tierCPrice = shelvingConfig?.tierC?.price || 50;
      return tierCPrice * quantity;
    }
    return 0;
  };

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
      setVinylImageFile(null);
      setVinylImagePreview("");
      setVinylImageUrl("");
    }
  }, [isVinylSelected]);

  // Update tier when shelving addon option changes or when product loads
  useEffect(() => {
    if (shelvingOptionId && renderedAddons.length > 0) {
      const newTier = renderedAddons.find(a => a.optionId === shelvingOptionId)?.tier || "A";
      setShelvingTier(newTier);
      if (newTier !== "A") {
        setShelvingSize("yes");
        setShelvingQuantity(1);
      }
    }
  }, [shelvingOptionId, renderedAddons]);

  // Default Tier A size when shelving selected so price displays (Tier A needs a size)
  useEffect(() => {
    if (isShelvingSelected && shelvingTier === "A" && !shelvingSize && shelvingTierAOptions?.[0]?.size) {
      setShelvingSize(shelvingTierAOptions[0].size);
      setShelvingQuantity(1);
    }
  }, [isShelvingSelected, shelvingTier, shelvingSize, shelvingTierAOptions]);

  // Clear shelving selections when shelving addon gets deselected
  useEffect(() => {
    if (shelvingOptionId && !isShelvingSelected) {
      const newTier = renderedAddons.find(a => a.optionId === shelvingOptionId)?.tier || "A";
      setShelvingTier(newTier);
      setShelvingSize("");
      setShelvingQuantity(1);
      setShelvingError("");
    }
  }, [isShelvingSelected, shelvingOptionId, renderedAddons]);

  // Update shelving addon price when tier/size/quantity changes
  useEffect(() => {
    if (!shelvingOptionId || !isShelvingSelected) return;

    const price = calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true);

    setSelectedAddons((prev) => {
      if (!prev[shelvingOptionId]) return prev;

      const currentPrice = prev[shelvingOptionId].price || 0;
      const currentData = prev[shelvingOptionId].shelvingData;
      const newData = {
        tier: shelvingTier,
        size: shelvingSize,
        quantity: shelvingQuantity,
      };

      // Check if anything actually changed to avoid unnecessary updates
      if (
        currentPrice === price &&
        currentData?.tier === newData.tier &&
        currentData?.size === newData.size &&
        currentData?.quantity === newData.quantity
      ) {
        return prev; // No change, return same object
      }

      return {
        ...prev,
        [shelvingOptionId]: {
          ...prev[shelvingOptionId],
          price: price,
          shelvingData: newData,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelvingTier, shelvingSize, shelvingQuantity, shelvingOptionId]);

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

        // if this addon is shelving, clear shelving data
        if (addon.optionId === shelvingOptionId) {
          setShelvingTier("A");
          setShelvingSize("");
          setShelvingQuantity(1);
          setShelvingError("");
        }
        // if this addon is pedestals, clear pedestal selection
if (addon.optionId === pedestalOptionId) {
  setSelectedPedestalIndex("");
}

      } else {
        next[addon.optionId] = {
          name: addon.name,
          price: addon.optionId === pedestalOptionId ? 0 : addon.finalPrice,
          realOptionId: addon.realOptionId ?? addon.optionId,
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
                  className={`w-full h-20 object-cover rounded-xl shadow cursor-pointer transition border-2 ${i === activeImage ? "border-black" : "border-transparent"
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

                    <p className="text-black font-semibold mt-1">
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
                ${(relatedQty[rp._id] || 0) >= (rp.availabilityCount ?? 0)
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
          <h1 className="text-4xl font-semibold text-[#2D2926] mb-2">
            {product?.title || "—"}
          </h1>

         {/* 📐 Dimension Selection (Variable Rental) */}
{isVariableRental && product?.variations?.length > 0 && (
  <div className="mt-4">
    <p className="text-sm font-medium text-gray-700 mb-2">
      Choose Dimension
    </p>

    <div className="flex flex-wrap gap-2">
      {product.variations.map((v, i) => {
        const selected = i === selectedVariationIndex;

        return (
          <button
            key={v._id || i}
            type="button"
            onClick={() => setSelectedVariationIndex(i)}
            className={`px-4 py-2 rounded-lg border text-sm transition
              ${
                selected
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            {v.dimension}
          </button>
        );
      })}
    </div>
  </div>
)}


          {/* PRICE + STOCK (Responsive layout) */}
          <div className="mt-2 flex flex-col md:flex-row md:items-center md:gap-6">

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {isVariableRental ? (
                selectedVariation?.salePrice ? (
                  <>
                    <span className="text-xl text-gray-500 line-through">
  $ {selectedVariation?.pricePerDay} / day
</span>

                    <span className="text-3xl font-semibold text-red-600">
                      $ {selectedVariation?.salePrice} / day
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-black">
  $ {selectedVariation?.pricePerDay ?? 0} / day
</span>

                )
              ) : product.salePrice ? (
                <>
                 <span className="text-xl text-gray-500 line-through">
  $ {selectedVariation?.pricePerDay} / day
</span>
<span className="text-3xl font-semibold text-red-600">
  $ {selectedVariation?.salePrice} / day
</span>

                </>
              ) : (
                <span className="text-3xl font-semibold text-black">
                  $ {product.pricePerDay} / day
                </span>
              )}
            </div>



            {/* Stock — beside price on desktop, below on mobile */}
            <div className="mt-2 md:mt-0 bg-gray-100 border border-[#E5DED6] rounded-lg px-4 py-2 inline-block">
              <p className="text-sm font-medium text-[#2D2926]">
                Stock Availability: <span className="text-black font-semibold">
                  {maxStock}
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
    ${productQty >= maxStock
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

          {/* PRODUCT ATTRIBUTES */}

          {/* VARIATIONS (only for rental variable products) */}
{attributeGroupsForUI.length > 0 && (
            <div className="mt-6 bg-white p-5 rounded-xl shadow">
             <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
  {isVariableRental ? "Choose Options" : "Available Options"}
</h3>


              {attributeGroupsForUI.map((g) => {
const isPaint =
  g.type === "paint" ||
  g.name?.toLowerCase() === "paint color";
                return (
                <div key={g.groupId} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {g.name}
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {g.options.map((opt) => {
                      const selected = selectedVarOptions[g.groupId] === String(opt._id);
                      const paintSrc = opt.imageUrl || (opt.value ? `/paint/${opt.value}` : null);

                      return (
                        <button
                          key={String(opt._id)}
                          type="button"
                          disabled={!isRental}
                         onClick={() => {
  if (!isRental) return;

  setSelectedVarOptions((prev) => ({
    ...prev,
    [g.groupId]: String(opt._id),
  }));

  // reset custom paint input when color changes
  if (isPaint) {
    setPaintCustomActive(false);
    setPaintCustomHex("");
  }
}}

                          className={`rounded-xl border text-sm transition
                            ${selected
                              ? "border-black bg-black text-white ring-2 ring-black ring-offset-1"
                              : "border-gray-300 bg-white hover:bg-gray-50"
                            }
                            ${!isRental ? "cursor-not-allowed opacity-60" : ""}
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
                  {/* 🎨 Custom Paint Color (only for Paint Color attribute) */}
{isPaint && selectedVarOptions[g.groupId] && (
  <div className="mt-3 ml-1">
    <button
      type="button"
      onClick={() => {
        setPaintCustomActive(true);
        
      }}
      className="text-sm font-medium text-black underline hover:text-gray-700"
    >
      Custom
    </button>

    {paintCustomActive && (
      <div className="mt-2">
        <input
          type="text"
          value={paintCustomHex}
          onChange={(e) => setPaintCustomHex(e.target.value)}
          placeholder="Enter HEX code (e.g. #FF5733)"
          className="w-full max-w-xs p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
  Visit{" "}
  <a
    href="https://www.behr.com/consumer"
    target="_blank"
    rel="noopener noreferrer"
    className="text-black underline hover:text-gray-700"
  >
    here
  </a>{" "}
  for reference.
</p>

      </div>
    )}
  </div>
)}

                </div>
              );
              })}

             {isVariableRental && !selectedVariation && (
              <p className="text-sm text-red-600">
                This combination is not available.
              </p>
            )}

              {selectedVariation && (
                <p className="text-sm text-gray-600 mt-2">
                  Stock for selected option:{" "}
                  <span className="font-semibold">{maxStock}</span>
                </p>
              )}
            </div>
          )}

          {/* ADD-ONS */}
          {/* ADD-ONS */}
          {renderedAddons?.length > 0 && (
            <div className="mt-8 bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-lg text-[#2D2926] mb-4">
                Optional Add-ons (Click to select)
              </h3>

              <div className="space-y-3">


                {addonsForDisplay.map((addon) => {
                  const selected = !!selectedAddons[addon.optionId];
                  const isSignage = addon.optionId === signageOptionId;
                  const isShelving = addon.optionId === shelvingOptionId;
                  const isSelectedShelving = isShelving && selected;

                  // Special design for signage addon with redirect
                  if (isSignage) {
                    return (
                      <button
                        key={addon.optionId}
                        type="button"
                        onClick={() => navigate("/signage")}
                        className="w-full flex items-center justify-between border-2 border-black rounded-lg px-4 py-3 transition bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-100 hover:shadow-md"
                      >
                        <div className="text-left flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{addon.name}</div>
                            <div className="text-sm text-gray-500">
                              + $ {addon.finalPrice}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-semibold px-3 py-1 rounded-full bg-black text-white flex items-center gap-1">
                          <span>Design</span>
                          <span>→</span>
                        </div>
                      </button>
                    );
                  }

                  // Regular addon design (including shelving - will show config below)
                  return (
                    <button
                      key={addon.optionId}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 transition
              ${selected ? "border-black bg-gray-100" : "hover:bg-gray-50"}
            `}
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-700">{addon.name}</div>
                        <div className="text-sm text-gray-500">
  {addon.optionId === pedestalOptionId
    ? "+ Select pedestal to see price"
    : isSelectedShelving
    ? `+ $ ${calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, isShelvingSelected)}`
    : `+ $ ${addon.finalPrice}`}
</div>

                      </div>

                      <div
                        className={`text-sm font-semibold px-3 py-1 rounded-full
                ${selected ? "bg-black text-white" : "bg-gray-200 text-gray-700"}
              `}
                      >
                        {selected ? "Selected" : "Add"}
                      </div>
                    </button>
                  );
                })}
              </div>
                {/* ====================
    PEDESTALS DROPDOWN
==================== */}
{pedestalOptionId && isPedestalSelected && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <h4 className="font-semibold text-[#2D2926] mb-3">Pedestals</h4>

    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select a pedestal (dimension + price)
    </label>

    <select
      className="w-full p-2 border rounded-lg bg-white"
      value={selectedPedestalIndex}
      onChange={(e) => {
        const idxStr = e.target.value;
        setSelectedPedestalIndex(idxStr);

        // if user chose "Select..."
        if (idxStr === "") {
          setSelectedAddons((prev) => ({
            ...prev,
            [pedestalOptionId]: {
              ...prev[pedestalOptionId],
              price: 0,
              pedestalData: null,
            },
          }));
          return;
        }

        const idx = Number(idxStr);
        const chosen = pedestalItems[idx];

        setSelectedAddons((prev) => ({
          ...prev,
          [pedestalOptionId]: {
            ...prev[pedestalOptionId],
            price: Number(chosen?.price) || 0,
            pedestalData: chosen ? { dimension: chosen.dimension, price: Number(chosen.price) || 0 } : null,
          },
        }));
      }}
    >
      <option value="">— Select pedestal —</option>

      {pedestalItems.map((p, idx) => (
        <option key={idx} value={String(idx)}>
          {p.dimension} (+ $ {Number(p.price || 0)})
        </option>
      ))}
    </select>

    {selectedAddons[pedestalOptionId]?.pedestalData && (
      <div className="mt-3 text-sm text-gray-700">
        Selected:{" "}
        <span className="font-semibold">
          {selectedAddons[pedestalOptionId].pedestalData.dimension}
        </span>{" "}
        (+ $ {selectedAddons[pedestalOptionId].pedestalData.price})
      </div>
    )}

    {pedestalItems.length === 0 && (
      <div className="mt-3 text-sm text-red-600">
        No pedestal options found for this product.
      </div>
    )}
  </div>
)}
              {/* Shelving: single tier from product addon (no tier selector on client) */}
              {shelvingOptionId && isShelvingSelected && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#2D2926] mb-3">
                    Shelving{shelvingTier ? ` (Tier ${shelvingTier})` : ""}
                  </h4>

                  {/* Tier A: size dropdown when sizes available */}
                  {shelvingTier === "A" && shelvingTierAOptions.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <select
                        value={shelvingSize || ""}
                        onChange={(e) => {
                          setShelvingSize(e.target.value);
                          setShelvingError("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="">Select a size</option>
                        {shelvingTierAOptions.map((opt) => (
                          <option key={opt.size} value={opt.size}>
                            {opt.size} — {opt.dimensions} (${opt.price}/shelf)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Quantity: Tier A (1–8), Tier B (1–8), Tier C fixed at 1 */}
                  {shelvingTier && (shelvingTier === "C" || (shelvingTier === "A" && shelvingSize) || (shelvingTier === "B" && shelvingSize === "yes")) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity {shelvingTier === "C" ? "(max 1)" : "(max 8)"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={shelvingTier === "C" ? 1 : 8}
                        value={shelvingQuantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value, 10) || 1;
                          const max = shelvingTier === "C" ? 1 : 8;
                          setShelvingQuantity(Math.min(Math.max(1, qty), max));
                          setShelvingError("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Info for selected tier */}
                  {shelvingTier && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                      {shelvingTier === "A" && shelvingSize && (
                        <>Selected: {shelvingTierAOptions.find(o => o.size === shelvingSize)?.dimensions ?? shelvingSize} — ${shelvingTierAOptions.find(o => o.size === shelvingSize)?.price ?? 0}/shelf</>
                      )}
                      {shelvingTier === "B" && (
                        <>{shelvingConfig?.tierB?.dimensions || "43\" wide x 11.5\" deep x 1.5\" thick"} — ${shelvingConfig?.tierB?.price ?? 29}/shelf</>
                      )}
                      {shelvingTier === "C" && (
                        <>{shelvingConfig?.tierC?.dimensions || "75\" wide x 25\" deep x 1.5\" thick"} — ${shelvingConfig?.tierC?.price ?? 50}/shelf (max 1)</>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {shelvingTier && calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true) > 0 && (
                    <div className="p-3 bg-white rounded-lg border border-black">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Shelving</span>
                        <span className="text-lg font-bold text-black">
                          $ {calculateShelvingPrice(shelvingTier, shelvingSize, shelvingQuantity, true)}
                        </span>
                      </div>
                    </div>
                  )}

                  {shelvingError && (
                    <p className="text-sm text-red-600 mt-2">{shelvingError}</p>
                  )}
                </div>
              )}

              {/* Selected summary */}
              {Object.keys(selectedAddons).length > 0 && (
                <div className="mt-5 text-sm text-gray-700">
                  <div className="font-semibold mb-2">Selected Add-ons:</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {Object.entries(selectedAddons).map(([id, a]) => {
                      const isShelving = id === shelvingOptionId;
                      return (
                        <li key={id}>
                          {a.name} (+ $ {a.price})
                          {isShelving && a.shelvingData && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Tier {a.shelvingData.tier}
                              {a.shelvingData.size && `, ${a.shelvingData.size}`}
                              {a.shelvingData.quantity > 0 && `, Qty: ${a.shelvingData.quantity}`})
                            </span>
                          )}
                        </li>
                      );
                    })}
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
                                setVinylImageFile(null);
                                setVinylImagePreview("");
                                setVinylImageUrl("");
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
                              setVinylImageFile(null);
                              setVinylImagePreview("");
                              setVinylImageUrl("");
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

                      {/* Or upload your own image */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Or upload your own design
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 3 * 1024 * 1024) {
                                toast.error("Image is too large. Maximum size is 3MB per image.");
                                e.target.value = "";
                                return;
                              }
                              setVinylImageFile(file);
                              setVinylImagePreview(URL.createObjectURL(file));
                              setVinylImageUrl("");
                              setVinylColor("");
                              setVinylHex("");
                              setVinylError("");
                            } else {
                              setVinylImageFile(null);
                              setVinylImagePreview("");
                              setVinylImageUrl("");
                            }
                          }}
                        />
                        {vinylImagePreview && (
                          <div className="mt-3 flex items-center gap-3">
                            <img
                              src={vinylImagePreview}
                              alt="Vinyl design preview"
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setVinylImageFile(null);
                                setVinylImagePreview("");
                                setVinylImageUrl("");
                              }}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove image
                            </button>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Image is stored securely and used for your vinyl wrap only.
                        </p>
                      </div>
                    </div>
                  )}


                </div>

              )}
            </div>
          )}




          {/* EVENT DATE SELECTION */}
          <div className="mt-6 bg-gray-100 p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
              Event Date
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* START DATE */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              {/* END DATE */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!startDate}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* DATE SUMMARY */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 text-sm text-[#2D2926]">
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
            disabled={!startDate || !endDate || vinylImageUploading}
            onClick={async () => {
              if (!startDate || !endDate) return;
              // 🚫 Variable rental must have a valid variation selected
              if (isVariableRental && !selectedVariation) {
                alert("Please select a valid option combination.");
                return;
              }

              // validate signage text if signage is selected
              if (isSignageSelected && !signageText.trim()) {
                setSignageError("Please enter the signage text.");
                return;
              }
              // ===== VINYL WRAP VALIDATION =====
              if (isVinylSelected) {
                const hasColor = vinylColor && (vinylColor !== "custom" || /^#([0-9A-Fa-f]{6})$/.test(vinylHex.trim()));
                const hasImage = vinylImageFile || vinylImageUrl;
                if (!hasColor && !hasImage) {
                  setVinylError("Please select a vinyl color or upload your own design.");
                  return;
                }
                if (vinylColor === "custom") {
                  const hex = vinylHex.trim();
                  const isValidHex = /^#([0-9A-Fa-f]{6})$/.test(hex);
                  if (vinylColor && !isValidHex) {
                    setVinylError("Please enter a valid HEX code like #FF5733.");
                    return;
                  }
                }
              }

              // ===== UPLOAD VINYL IMAGE IF SELECTED =====
              let resolvedVinylImageUrl = vinylImageUrl;
              if (isVinylSelected && vinylImageFile) {
                try {
                  setVinylImageUploading(true);
                  setVinylError("");
                  const formData = new FormData();
                  formData.append("image", vinylImageFile);
                  const res = await api("/upload/vinyl-image", {
                    method: "POST",
                    body: formData,
                  });
                  resolvedVinylImageUrl = res?.url || "";
                  if (!resolvedVinylImageUrl) throw new Error("Upload did not return URL");
                } catch (err) {
                  setVinylError(err.message || "Failed to upload image. Please try again.");
                  setVinylImageUploading(false);
                  return;
                } finally {
                  setVinylImageUploading(false);
                }
              }

              // ===== SHELVING VALIDATION =====
              if (isShelvingSelected) {
                if (shelvingTier === "A") {
                  if (!shelvingSize) {
                    setShelvingError("Please select a shelving size for Tier A.");
                    return;
                  }
                  if (shelvingQuantity < 1 || shelvingQuantity > 8) {
                    setShelvingError("Quantity must be between 1 and 8 for Tier A.");
                    return;
                  }
                } else if (shelvingTier === "B") {
                  if (!shelvingSize || shelvingSize === "") {
                    setShelvingError("Please select Yes or No for Tier B shelving.");
                    return;
                  }
                  if (shelvingSize === "yes" && (shelvingQuantity < 1 || shelvingQuantity > 8)) {
                    setShelvingError("Quantity must be between 1 and 8 for Tier B.");
                    return;
                  }
                  if (shelvingSize === "no") {
                    // Remove shelving from selected addons if No is selected
                    setSelectedAddons((prev) => {
                      const next = { ...prev };
                      delete next[shelvingOptionId];
                      return next;
                    });
                    return;
                  }
                } else if (shelvingTier === "C") {
                  if (!shelvingSize || shelvingSize === "") {
                    setShelvingError("Please select Yes or No for Tier C shelving.");
                    return;
                  }
                  if (shelvingSize === "no") {
                    // Remove shelving from selected addons if No is selected
                    setSelectedAddons((prev) => {
                      const next = { ...prev };
                      delete next[shelvingOptionId];
                      return next;
                    });
                    return;
                  }
                  if (shelvingSize === "yes" && shelvingQuantity !== 1) {
                    setShelvingError("Tier C allows only 1 shelf.");
                    return;
                  }
                }
              }

              const rentalCartItem = {
                //  cart-compatible payload
                productId: product._id,
                name: product.title,
                productType: "rental",

                qty: productQty,
                unitPrice: effectivePricePerDay,
                days: totalRentalDays,
                startDate,
                endDate,
                paintCustomHex:
                  paintCustomActive && paintCustomHex
                    ? paintCustomHex.trim()
                    : "",
                customTitle: product.allowCustomTitle ? (customTitleText || "").trim() : "",

                addons: Object.entries(selectedAddons).map(([optionId, a]) => ({
  optionId: a.realOptionId ?? optionId,
  name: a.name,
  price: a.price,

  pedestalData:
    optionId === pedestalOptionId ? a.pedestalData || null : null,

  signageText:
    optionId === signageOptionId ? signageText : "",

  vinylColor:
    optionId === vinylOptionId ? vinylColor : "",

  vinylHex:
    optionId === vinylOptionId ? vinylHex : "",

  vinylImageUrl:
    optionId === vinylOptionId
      ? (resolvedVinylImageUrl || vinylImageUrl || "")
      : "",

  shelvingData:
    optionId === shelvingOptionId && a.shelvingData
      ? a.shelvingData
      : null,
})),


                // 🔒 FINAL SNAPSHOT PRICE
                lineTotal: totalPrice,

                image: productImages[activeImage],
                maxStock,
              };

              // ✅ ADD TO CART IMMEDIATELY (THIS IS THE FIX)
              addToCart(rentalCartItem);

              // still needed for modal UI
              setChosenProduct(rentalCartItem);

              setOpenModal(true);

            }}
            className={`
    mt-8 w-full py-3 rounded-lg text-sm font-semibold transition-all
    ${!startDate || !endDate
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-[#222222]"
              }
  `}
          >
            {vinylImageUploading
              ? "Uploading image..."
              : !startDate || !endDate
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
      hover:bg-gray-100
      hover:border-black
      hover:text-black
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
              Delivery Rates
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

              <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
  {showFullDesc ? fullDescription : shortDescription}
</p>


              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-2 text-black font-medium underline"
              >
                {showFullDesc ? "Read Less" : "Read More"}
              </button>
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="bg-white p-5 rounded-xl shadow">
              <a
                href="/contract"
                target="_blank"
                rel="noopener noreferrer"
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
        <div className="bg-gray-100 border border-gray-200 rounded-2xl py-6 px-8 
                  flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

          {trustBadges.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/10">
                  <Icon className="text-black" size={26} />
                </div>
                <span className="text-gray-900 font-medium text-[16px]">
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



      {/* SHIPPING RATES MODAL */}
      <ShippingRatesModal
        isOpen={openShippingModal}
        onClose={() => setOpenShippingModal(false)}
      />

      {/* PRICING CHART MODAL */}
      <PricingChartModal
        isOpen={openPricingChart}
        onClose={() => setOpenPricingChart(false)}
basePrice={
  isVariableRental
    ? selectedVariation?.pricePerDay || 100
    : product?.pricePerDay || 100
}
      />



    </>
  );
};

export default ProductPage;