import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";





const AddProduct = () => {
  /* =====================
     ROUTE PARAMS
  ===================== */
  const { id } = useParams();
  const isEditMode = Boolean(id);
const fileInputRef = useRef(null);

  /* =====================
     STATE — MUST COME FIRST
  ===================== */

  // Images
  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Product core
  const [productType, setProductType] = useState("rental");
  // NEW: Simple vs Variable (WooCommerce style)
const [productSubType, setProductSubType] = useState("simple"); // "simple" | "variable"

// NEW: which attribute groups are used to create variations
const [variationAttrGroupIds, setVariationAttrGroupIds] = useState([]); // array of groupId strings

// NEW: generated variations list
const [variations, setVariations] = useState([]); 

  // Featured (only for rental)
const [isFeatured, setIsFeatured] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dimensions, setDimensions] = useState("");

  const [availabilityCount, setAvailabilityCount] = useState(1);

  // Pricing
  const [pricePerDay, setPricePerDay] = useState("");
  const [salePrice, setSalePrice] = useState("");

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);


  // Attributes
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [attrLoading, setAttrLoading] = useState(true);

  // Selections
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

// groupId → optionId → { selected, overridePrice }
const [loadedAddons, setLoadedAddons] = useState([]);
const MAX_IMAGES = 8;

const totalImageCount = existingImages.length + previews.length;

// Remove newly added image
const removePreviewImage = (index) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
  setPreviews((prev) => prev.filter((_, i) => i !== index));
};

// Remove existing image (edit mode)
const removeExistingImage = (index) => {
  setExistingImages((prev) => prev.filter((_, i) => i !== index));
};

  /* =====================
     DERIVED DATA
  ===================== */

  const filteredCategories = categories.filter(
    (cat) => cat.type === productType
  );

const getImgSrc = (img) =>
  img?.url || img?.secure_url || img?.path || img;
// Quick lookup maps for labels
const optionLabelById = useMemo(() => {
  const map = new Map();
  attributeGroups.forEach((g) => {
    (g.options || []).forEach((o) => {
      map.set(String(o._id), o.label);
    });
  });
  return map;
}, [attributeGroups]);

const groupNameById = useMemo(() => {
  const map = new Map();
  attributeGroups.forEach((g) => map.set(String(g._id), g.name));
  return map;
}, [attributeGroups]);

const getOptionLabel = (optionId) => optionLabelById.get(String(optionId)) || "—";
const getGroupName = (groupId) => groupNameById.get(String(groupId)) || "—";

  // Fetch attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setAttrLoading(true);
        const token = localStorage.getItem("admin_token");

        const res = await api("/admin/attributes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res?.data ?? res;
        setAttributeGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load attributes");
      } finally {
        setAttrLoading(false);
      }
    };

    fetchAttributes();
  }, []);
  useEffect(() => {
  // Only needed when editing and when attribute groups are loaded
  if (!isEditMode) return;
  if (!loadedAddons || loadedAddons.length === 0) {
    setSelectedAddons({});
    return;
  }
  if (!attributeGroups || attributeGroups.length === 0) return;

  const grouped = {};

  loadedAddons.forEach((a) => {
    const optionId = String(a.optionId?._id || a.optionId);

    // Find the addon group that contains this optionId
    const addonGroup = attributeGroups.find(
      (g) =>
        g.type === "addon" &&
        (g.options || []).some((o) => String(o._id) === optionId)
    );

    if (!addonGroup) return;

    const groupKey = String(addonGroup._id);
    if (!grouped[groupKey]) grouped[groupKey] = {};

    grouped[groupKey][optionId] = {
      selected: true,
      overridePrice: a.overridePrice ?? "",
    };
  });

  setSelectedAddons(grouped);
}, [isEditMode, loadedAddons, attributeGroups]);


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const token = localStorage.getItem("admin_token");

        const res = await api("/categories", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res?.data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load categories");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load product (EDIT MODE)
  useEffect(() => {
    if (!isEditMode) return;
    if (categories.length === 0 || attributeGroups.length === 0) return;

    const loadProduct = async () => {
      try {
        const res = await api(`/products/${id}`);
        const data = res.product || res;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || "");
        setDimensions(data.dimensions || "");

        setAvailabilityCount(data.availabilityCount || 1);
       setProductType(data.productType);
setProductSubType(data.productSubType || "simple");

// ✅ FIX: use data.productSubType (NOT state)
if (data.productType === "rental" && data.productSubType === "variable") {
  // Normalize variations for edit UI
  const normalizedVariations = (data.variations || []).map((v) => ({
    attributes: (v.attributes || []).map((a) => ({
      groupId: String(a.groupId?._id || a.groupId),
      optionId: String(a.optionId?._id || a.optionId),
    })),
    price: v.price ?? "",
    salePrice: v.salePrice ?? "",
    stock: v.stock ?? "",
    dimension: v.dimension ?? "",
    image: v.image?.url || v.image || null,
  }));

  setVariations(normalizedVariations);

  // Infer which attribute groups are used for variations
  const groupSet = new Set();
  normalizedVariations.forEach((v) => {
    v.attributes.forEach((a) => {
      groupSet.add(String(a.groupId));
    });
  });
  setVariationAttrGroupIds([...groupSet]);

  // Pre-select options in UI
  const nextSelected = {};
  normalizedVariations.forEach((v) => {
    v.attributes.forEach((a) => {
      if (!nextSelected[a.groupId]) nextSelected[a.groupId] = [];
      if (!nextSelected[a.groupId].includes(a.optionId)) {
        nextSelected[a.groupId].push(a.optionId);
      }
    });
  });
  setSelectedAttrs(nextSelected);
}


        setPricePerDay(data.pricePerDay || "");
        setSalePrice(data.salePrice || "");
setIsFeatured(!!data.featured);


        const attrSelections = {};
data.attributes?.forEach((a) => {
  if (!a.groupId) return; 

  const groupKey = String(a.groupId._id || a.groupId);
  if (!groupKey || groupKey === "null" || groupKey === "undefined") return;

  const optionIds = (a.optionIds || []).map((x) => String(x));
  attrSelections[groupKey] = optionIds;
});

setSelectedAttrs(attrSelections);


 setLoadedAddons(data.addons || []);





        setExistingImages(data.images || []);
      } catch (err) {
        console.error("Product load deferred, retrying…");
      }
    };

    loadProduct();
  }, [id, isEditMode, categories, attributeGroups]);

  /* =====================
     HANDLERS
  ===================== */

 const handleImageChange = (e) => {
  const files = Array.from(e.target.files);

  const remainingSlots = MAX_IMAGES - totalImageCount;
  if (remainingSlots <= 0) {
    alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
    return;
  }

  const acceptedFiles = files.slice(0, remainingSlots);

  setImages((prev) => [...prev, ...acceptedFiles]);
  setPreviews((prev) => [
    ...prev,
    ...acceptedFiles.map((file) => URL.createObjectURL(file)),
  ]);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredGroups = attributeGroups.filter(
      (g) => g.required && g.type !== "addon"
    );
// 🚫 Selling products cannot have variations (hard guard)
if (productType === "sale" && productSubType === "variable") {
  alert("Selling products cannot have variations.");
  return;
}

    for (const g of requiredGroups) {
const sel = selectedAttrs[String(g._id)] || [];
      if (sel.length === 0) {
        alert(`Please select at least one option for: ${g.name}`);
        return;
      }
    }

   const attributesPayload = Object.entries(selectedAttrs)
  .filter(([groupId, optionIds]) =>
    groupId &&
    groupId !== "null" &&
    groupId !== "undefined" &&
    optionIds.length > 0
  )
  .map(([groupId, optionIds]) => ({ groupId, optionIds }));


   const addonsPayload = [];

Object.entries(selectedAddons).forEach(([groupId, options]) => {
  Object.entries(options).forEach(([optionId, v]) => {
    if (!v?.selected) return;

    addonsPayload.push({
      optionId,
      overridePrice:
        v.overridePrice === "" || v.overridePrice === null
          ? null
          : Number(v.overridePrice),
    });
  });
});




    const formData = new FormData();
// ✅ REQUIRED: identify product for update
if (isEditMode) {
  formData.append("_id", id);
}
formData.append("isEditMode", String(isEditMode));

    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    if (dimensions && dimensions.trim() !== "") {
  formData.append("dimensions", dimensions);
}

    formData.append("productType", productType);
    formData.append("productSubType", productSubType);

    formData.append("availabilityCount", availabilityCount);
formData.append("featured", productType === "rental" ? String(isFeatured) : "false");

    formData.append("attributes", JSON.stringify(attributesPayload));
if (addonsPayload.length > 0) {
  formData.append("addons", JSON.stringify(addonsPayload));
}

// Regular price
// ===============================
// PRICING SUBMISSION (SIMPLE vs VARIABLE)
// ===============================

if (productSubType === "simple") {
  // ✅ SIMPLE PRODUCT (your existing behavior)

  formData.append("pricePerDay", pricePerDay);

  if (salePrice !== "" && salePrice !== null) {
    formData.append("salePrice", salePrice);
  }

} else {
  // ✅ VARIABLE PRODUCT (WooCommerce style)

  if (!variations || variations.length === 0) {
    alert("Please generate variations and set pricing before submitting.");
    return;
  }

  // Validate each variation
  for (const v of variations) {
    if (v.price === "" || v.price === null) {
      alert("Each variation must have a price.");
      return;
    }
  }

formData.append(
  "variations",
  JSON.stringify(
    variations.map((v) => ({
      attributes: v.attributes,
      price: Number(v.price),
      salePrice: v.salePrice === "" ? null : Number(v.salePrice),
      stock: v.stock === "" ? 0 : Number(v.stock),
      dimension: v.dimension || "",
image:
  typeof v.image === "string"
    ? v.image
    : v.image?.url
    ? v.image
    : null,
    }))
  )
);

// append variation images separately
variations.forEach((v, idx) => {
  if (v.image instanceof File) {
    formData.append(`variationImages_${idx}`, v.image);
  }
});

}


  if (isEditMode) {
    formData.append("existingImages", JSON.stringify(existingImages));
 } else if (productSubType === "simple" && images.length === 0) {
  alert("Upload at least one image");
  return;
}


  images.forEach((img) => formData.append("images", img));

  // 4️⃣ Decide endpoint
  const endpoint = isEditMode
    ? `/products/admin/edit/${id}`
    : "/products/admin/add";

  const token = localStorage.getItem("admin_token");

  // 5️⃣ Submit
  await api(endpoint, {
    method: isEditMode ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  alert(isEditMode ? "Product updated!" : "Product added!");
  window.location.href = "/admin/products";
};

const buildVariationKey = (attrs) =>
  attrs
    .map((a) => `${String(a.groupId)}:${String(a.optionId)}`)
    .sort()
    .join("|");

const cartesian = (arrays) =>
  arrays.reduce(
    (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
    [[]]
  );

const generateVariations = () => {
  // Only groups marked for variations
  const groups = variationAttrGroupIds;

  // Each group must have selections
  for (const gid of groups) {
    const sel = selectedAttrs[gid] || [];
    if (sel.length === 0) {
      alert(`Select at least one option for variation group: ${getGroupName(gid)}`);
      return;
    }
  }

  const sources = groups.map((gid) =>
    (selectedAttrs[gid] || []).map((oid) => ({ groupId: gid, optionId: oid }))
  );

  const combos = cartesian(sources);

  // Reuse existing variation values when regenerating
  const existingMap = new Map(
    variations.map((v) => [buildVariationKey(v.attributes), v])
  );

  const next = combos.map((combo) => {
    const attrs = combo.map((x) => ({
      groupId: String(x.groupId),
      optionId: String(x.optionId),
    }));

    const key = buildVariationKey(attrs);
    const old = existingMap.get(key);
return {
  attributes: attrs,
  price: old?.price ?? "",
  salePrice: old?.salePrice ?? "",
  stock: old?.stock ?? "",
  dimension: old?.dimension ?? "",
  image: old?.image ?? null,
};

  });

  setVariations(next);
};


  return (
    <AdminLayout>
<h1 className="text-3xl font-semibold mb-8">
  {isEditMode ? "Edit Product" : "Add New Product"}
</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 shadow max-w-5xl space-y-8"
      >
        {/* PRODUCT TYPE */}
        <div>
          <label className="font-medium">Product Type</label>
          <div className="flex gap-4 mt-2">
            {["rental", "sale"].map((type) => (
              <button
              type="button"
              key={type}
              disabled={isEditMode}
onClick={() => {
  if (isEditMode) return;

 setProductType(type);
setCategory("");
setIsFeatured(false);

// 🚫 Selling products cannot have variations
if (type === "sale") {
  setProductSubType("simple");
  setVariationAttrGroupIds([]);
  setVariations([]);
}

}}

              

                className={`px-6 py-2 rounded-full border border-gray-400 transition
                  ${
                    productType === type
                      ? "bg-[#8B5C42] text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
              >
                {type === "rental" ? "Rental Product" : "Selling Product"}
              </button>
            ))}
          </div>
        </div>
{/* PRODUCT STRUCTURE (Simple / Variable) */}
<div>
  <label className="font-medium">Product Structure</label>
  <div className="flex gap-4 mt-2">
{["simple", "variable"]
  .filter((t) => productType !== "sale" || t === "simple")
  .map((t) => (
      <button
        type="button"
        key={t}
        onClick={() => {
          if (isEditMode) return;

          setProductSubType(t);

          // when switching modes, reset variation-only state
          if (t === "simple") {
            setVariationAttrGroupIds([]);
            setVariations([]);
          }
        }}
        className={`px-6 py-2 rounded-full border border-gray-400 transition
          ${productSubType === t ? "bg-black text-white" : "bg-white hover:bg-gray-100"}
        `}
      >
        {t === "simple" ? "Simple Product" : "Variable Product"}
      </button>
    ))}
  </div>

  <p className="text-xs text-gray-500 mt-2">
    Simple = one price/stock. Variable = price/stock differs by size/color like WooCommerce.
  </p>
</div>

        {/* BASIC INFO */}
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

       {/* PRICING */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* SIMPLE PRODUCT PRICING */}
  {productSubType === "simple" && (
    <>
      {productType === "rental" ? (
        <div>
          <label>Price Per Day</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-400 rounded-lg"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
      ) : (
        <div>
          <label>Selling Price</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-400 rounded-lg"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
      )}

      <div>
        <label className="flex items-center gap-2">
          Sale Price
          <span className="text-xs text-gray-500">(optional)</span>
        </label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          placeholder="Leave empty if no discount"
        />
      </div>
    </>
  )}

  {/* VARIABLE PRODUCT NOTICE */}
  {productSubType === "variable" && (
    <div className="md:col-span-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="font-medium">Variable product pricing is set per-variation.</div>
      <div className="text-sm text-gray-600 mt-1">
        Select attributes → generate variations → set price/stock for each variation below.
      </div>
    </div>
  )}

  {/* Availability still shown (we can later decide how to use it for variable) */}
  <div>
    <label>Stock / Availability</label>
    <input
      type="number"
      className="w-full p-3 border border-gray-400 rounded-lg"
      value={availabilityCount}
      onChange={(e) => setAvailabilityCount(e.target.value)}
      min="1"
    />
  </div>

          {productType === "rental" && (
  <div className="mt-2">
    <label className="font-medium">Show on Homepage Featured?</label>
    <div className="flex items-center gap-3 mt-2">
      <button
        type="button"
        onClick={() => setIsFeatured(true)}
        className={`px-4 py-2 rounded-lg border ${
          isFeatured ? "bg-[#8B5C42] text-white border-[#8B5C42]" : "bg-white border-gray-300"
        }`}
      >
        Yes
      </button>

      <button
        type="button"
        onClick={() => setIsFeatured(false)}
        className={`px-4 py-2 rounded-lg border ${
          !isFeatured ? "bg-black text-white border-black" : "bg-white border-gray-300"
        }`}
      >
        No
      </button>
    </div>
    <p className="text-xs text-gray-500 mt-2">
      Note: Only rental products can be featured. Max 8 items are shown on homepage.
    </p>
  </div>
)}

        </div>

{/* DYNAMIC ATTRIBUTES */}
<div className="space-y-6">
  <h2 className="text-xl font-semibold">Attributes</h2>

  {attrLoading ? (
    <p className="text-gray-600">Loading attributes...</p>
  ) : attributeGroups.length === 0 ? (
    <p className="text-gray-600">No attributes found. Create them in Admin → Attributes.</p>
  ) : (
    attributeGroups.map((g) => {
      const options = (g.options || []).filter((o) => o.isActive !== false);
      const isAddon = g.type === "addon";
      const groupIdStr = String(g._id);

const isVariationGroup =
  productType === "rental" && productSubType === "variable" &&
  !isAddon &&
  variationAttrGroupIds.includes(groupIdStr);

      const isSingle = g.type === "select"; // single-select
      const isColor = g.type === "color";
      const required = !!g.required;

      // current selection for normal groups
const current = selectedAttrs[String(g._id)] || [];

      // helper: toggle option
      const toggleOption = (optionId) => {
        setSelectedAttrs((prev) => {
const key = String(g._id);
const prevList = prev[key] || [];
          let nextList = prevList;
const forceMultiForVariations = isVariationGroup; // <--- NEW

if (isSingle && !forceMultiForVariations) {
  nextList = prevList.includes(optionId) ? [] : [optionId];
} else {
  nextList = prevList.includes(optionId)
    ? prevList.filter((id) => id !== optionId)
    : [...prevList, optionId];
}


return { ...prev, [key]: nextList };
        });
      };

      return (
        <div key={g._id} className="border border-gray-300 rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-3">
            <label className="font-medium">
              {g.name} {required && <span className="text-red-600">*</span>}
            </label>
            {productType === "rental" && productSubType === "variable" && !isAddon && (
  <label className="flex items-center gap-2 text-sm mt-2">
    <input
      type="checkbox"
      checked={variationAttrGroupIds.includes(groupIdStr)}
      onChange={(e) => {
        setVariationAttrGroupIds((prev) =>
          e.target.checked
            ? [...prev, groupIdStr]
            : prev.filter((x) => x !== groupIdStr)
        );
      }}
    />
    Used for variations
  </label>
)}

            <span className="text-xs text-gray-500">
              {g.type === "multi" && "Multi-select"}
              {g.type === "select" && "Single-select"}
              {g.type === "color" && "Color"}
              {g.type === "addon" && "Add-on"}
            </span>
          </div>

          {/* Add-ons: special UI with pricing override */}
          {isAddon ? (
            <div className="space-y-3">
              {options.map((o) => {
const oid = String(o._id || o.optionId || o);
const groupKey = String(g._id);
const isSelected = !!selectedAddons[groupKey]?.[oid]?.selected;
const overridePrice = selectedAddons[groupKey]?.[oid]?.overridePrice ?? "";



                return (
                  <div
                    key={o._id}
                    className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg border
                      ${isSelected ? "border-black" : "border-gray-300"}
                    `}
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                         setSelectedAddons((prev) => {
  const groupKey = String(g._id);

  return {
    ...prev,
    [groupKey]: {
      ...(prev[groupKey] || {}),
      [oid]: {
        selected: checked,
        overridePrice: prev[groupKey]?.[oid]?.overridePrice ?? "",
      },
    },
  };
});



                        }}
                      />
                      <div>
                        <div className="font-medium">{o.label}</div>
                        <div className="text-sm text-gray-600">
                          Base: ${Number(o.priceDelta || 0).toFixed(2)}
                        </div>
                      </div>
                    </label>

                    {/* Only allow override when selected */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Override price</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        disabled={!isSelected}
                        value={overridePrice}
                        onChange={(e) => {
  if (!oid || oid === "null") return;

  const value = e.target.value;

  setSelectedAddons((prev) => {
  const groupKey = String(g._id);

  return {
    ...prev,
    [groupKey]: {
      ...(prev[groupKey] || {}),
      [oid]: {
        selected: true,
        overridePrice: value === "" ? "" : Number(value),
      },
    },
  };
});

}}



                        className="w-36 p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        placeholder={`${Number(o.priceDelta || 0).toFixed(0)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Normal groups: buttons/toggles */
            <div className="flex flex-wrap gap-3 mt-2">
              {options.map((o) => {
  const oid = String(o._id);
  const active = current.includes(oid);


                return (
                  <button
                    type="button"
                    key={o._id}
                    onClick={() => toggleOption(o._id)}
                    className={`px-4 py-2 rounded-lg border transition
                      ${active ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:bg-gray-100"}
                    `}
                  >
                    <span className="inline-flex items-center gap-2">
                      {isColor && (
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: o.hex || "#000" }}
                        />
                      )}
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* helper note */}
          {required && !isAddon && (
            <p className="text-xs text-gray-500 mt-3">
              Required: select at least one option.
            </p>
          )}
        </div>
      );
    })
  )}
</div>
{/* VARIABLE PRODUCT: VARIATIONS */}
{productSubType === "variable" && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Variations</h2>

    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={generateVariations}
        className="px-4 py-2 rounded-lg bg-black text-white"
      >
        Generate Variations
      </button>

      <button
        type="button"
        onClick={() => setVariations([])}
        className="px-4 py-2 rounded-lg border border-gray-300"
      >
        Clear
      </button>

      <div className="text-sm text-gray-600 flex items-center">
        Total: <span className="font-medium ml-1">{variations.length}</span>
      </div>
    </div>

    {variations.length > 0 && (
      <div className="overflow-x-auto border border-gray-300 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
  <tr>
    <th className="text-left p-3 border-b">Variation</th>
    <th className="text-left p-3 border-b">
      {productType === "rental" ? "Price / Day" : "Price"}
    </th>
    <th className="text-left p-3 border-b">Sale</th>
    <th className="text-left p-3 border-b">Stock</th>
    <th className="text-left p-3 border-b">Dimension</th>
    <th className="text-left p-3 border-b">Image</th>
  </tr>
</thead>


          <tbody>
            {variations.map((v, idx) => {
              const label = v.attributes
                .map((a) => `${getGroupName(a.groupId)}: ${getOptionLabel(a.optionId)}`)
                .join(" / ");

              const update = (field, value) => {
                setVariations((prev) => {
                  const next = [...prev];
                  next[idx] = { ...next[idx], [field]: value };
                  return next;
                });
              };

              return (
                <tr key={buildVariationKey(v.attributes)} className="border-b">
                  <td className="p-3">{label}</td>

                  <td className="p-3">
                    <input
                      type="number"
                      className="w-32 p-2 border border-gray-300 rounded-lg"
                      value={v.price}
                      onChange={(e) => update("price", e.target.value)}
                      required
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      className="w-32 p-2 border border-gray-300 rounded-lg"
                      value={v.salePrice}
                      onChange={(e) => update("salePrice", e.target.value)}
                      placeholder="optional"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      className="w-24 p-2 border border-gray-300 rounded-lg"
                      value={v.stock}
                      onChange={(e) => update("stock", e.target.value)}
                      placeholder="0"
                    />
                  </td>

                <td className="p-3">
  <input
    type="text"
    className="w-40 p-2 border border-gray-300 rounded-lg"
    value={v.dimension || ""}
    onChange={(e) => update("dimension", e.target.value)}
    placeholder="e.g. 6ft x 3ft"
  />
</td>
<td className="p-3">
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      update("image", file);
    }}
  />

  {v.image && typeof v.image === "string" && (
    <img
      src={v.image}
      alt="preview"
      className="mt-2 w-16 h-16 object-cover rounded border"
    />
  )}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

        {/* DIMENSIONS (OPTIONAL) */}
<div>
  <label className="flex items-center gap-2">
    Dimensions
    <span className="text-xs text-gray-500">(optional)</span>
  </label>

  <input
    type="text"
    className="w-full p-3 border border-gray-300 rounded-lg"
    value={dimensions}
    onChange={(e) => setDimensions(e.target.value)}
    placeholder="e.g. 6ft (H) × 4ft (W) × 2ft (D)"
  />
</div>

{/* DESCRIPTION */}
<div>
  <label>Description</label>
  <textarea
    rows="4"
    className="w-full p-3 border border-gray-400 rounded-lg"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Usage instructions, notes, details..."
  />
</div>


        {/* IMAGES */}
       {/* IMAGES */}
{/* IMAGES */}
<div>
  <label className="font-medium mb-2 block">
    Product Images <span className="text-sm text-gray-500">(max 8)</span>
  </label>

  {/* Upload Box */}
  <div
  onClick={() => {
    if (totalImageCount < MAX_IMAGES) {
      fileInputRef.current?.click();
    }
  }}
  className={`
    border-2 border-dashed rounded-xl p-8 text-center transition
    ${
      totalImageCount >= MAX_IMAGES
        ? "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400"
        : "border-gray-300 cursor-pointer hover:border-[#8B5C42] hover:bg-[#8B5C42]/5"
    }
  `}
>

    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl">📸</div>
      <p className="font-medium text-gray-700">
        Click to upload product images
      </p>
      <p className="text-sm text-gray-500">
        JPG, PNG • Up to 8 images
      </p>
    </div>
  </div>

  {/* Hidden Input */}
  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageChange}
    className="hidden"
  />

  {/* Existing images (edit mode) */}
  {existingImages.length > 0 && (
    <>
      <p className="text-sm font-medium mt-4">Existing Images</p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
       {existingImages.map((img, i) => (
  <div key={i} className="relative group">
    <img
      src={img.url || img}
      className="w-full h-24 object-cover rounded border"
    />

    <button
      type="button"
      onClick={() => removeExistingImage(i)}
      className="
        absolute top-1 right-1
        bg-black text-white rounded-full w-6 h-6
        text-xs opacity-0 group-hover:opacity-100
        transition
      "
    >
      ×
    </button>
  </div>
))}

      </div>
    </>
  )}

  {/* New previews */}
  {previews.length > 0 && (
    <>
      <p className="text-sm font-medium mt-4">New Uploads</p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
        {previews.map((src, i) => (
  <div key={i} className="relative group">
    <img
      src={src}
      className="w-full h-24 object-cover rounded border"
    />

    <button
      type="button"
      onClick={() => removePreviewImage(i)}
      className="
        absolute top-1 right-1
        bg-black text-white rounded-full w-6 h-6
        text-xs opacity-0 group-hover:opacity-100
        transition
      "
    >
      ×
    </button>
  </div>
))}

      </div>
    </>
  )}
</div>



        {/* SUBMIT */}
        <button className="w-full py-4 bg-[#8B5C42] text-white rounded-xl text-lg font-medium hover:bg-[#704A36] transition">
  {isEditMode ? "Update Product" : "Add Product"}
</button>

      </form>
    </AdminLayout>
  );
};

export default AddProduct;
