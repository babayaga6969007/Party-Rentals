import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";





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
const [rentalSubType, setRentalSubType] = useState("simple"); 
// "simple" | "variable"

const [variationCount, setVariationCount] = useState(0);
const [variations, setVariations] = useState([]);

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

  // groupId → optionId → { selected, overridePrice, shelvingTier, shelvingSize, shelvingQuantity }
  const [loadedAddons, setLoadedAddons] = useState([]);

  // Shelving config for admin
  const [shelvingConfig, setShelvingConfig] = useState(null);
  
  // Fetch shelving config
  useEffect(() => {
    const fetchShelvingConfig = async () => {
      try {
        const res = await api("/shelving-config");
        setShelvingConfig(res.config);
      } catch (err) {
        console.error("Failed to load shelving config:", err);
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
        toast.error("Failed to load attributes");
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

    // Load shelving data if it exists
    const shelvingData = a.shelvingData || {};
    // Get tier from option if available, or from shelvingData, or default to "A"
    const option = addonGroup.options.find(o => String(o._id) === optionId);
    const tierFromOption = option?.tier || "A";
    
    grouped[groupKey][optionId] = {
      selected: true,
      overridePrice: a.overridePrice ?? "",
      shelvingTier: shelvingData.tier || (a.shelvingTier || tierFromOption),
      shelvingSize: shelvingData.size || (a.shelvingSize || ""),
      shelvingQuantity: shelvingData.quantity || (a.shelvingQuantity || 1),
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
        toast.error("Failed to load categories");
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




        setPricePerDay(data.pricePerDay || "");
        setSalePrice(data.salePrice || "");


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
      } catch {
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
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
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
console.log("✅ SUBMIT CLICKED");
    const formData = new FormData();


    if (productType === "rental" && rentalSubType === "variable") {
  formData.append("variations", JSON.stringify(
    variations.map(v => ({
      dimension: v.dimension,
      pricePerDay: v.pricePerDay,
      salePrice: v.salePrice || null,
      stock: v.stock,
    }))
  ));

  variations.forEach((v, i) => {
    if (v.image) {
      formData.append(`variationImages_${i}`, v.image);
    }
  });
}
console.log("📦 VARIATIONS APPENDED:", variations.length);

formData.append("productSubType", rentalSubType);

   

    const requiredGroups = attributeGroups.filter(
      (g) => g.required && g.type !== "addon"
    );
  

    for (const g of requiredGroups) {
      const sel = selectedAttrs[String(g._id)] || [];
      if (sel.length === 0) {
        toast.error(`Please select at least one option for: ${g.name}`);
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

    // Find the option to check if it's a shelving addon
    const addonGroup = attributeGroups.find(g => String(g._id) === groupId);
    const option = addonGroup?.options?.find(o => String(o._id) === optionId);
    const isShelving = option?.label?.toLowerCase().includes("shelving") || 
                       option?.label?.toLowerCase().includes("shelf");

    const addonData = {
      optionId,
      overridePrice:
        v.overridePrice === "" || v.overridePrice === null
          ? null
          : Number(v.overridePrice),
    };

    // Add shelving configuration if it's a shelving addon
    if (isShelving && v.shelvingTier) {
      addonData.shelvingTier = v.shelvingTier;
      addonData.shelvingSize = v.shelvingSize || "";
      addonData.shelvingQuantity = v.shelvingQuantity || 1;
    }

    addonsPayload.push(addonData);
  });
});




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

    formData.append("availabilityCount", availabilityCount);

    formData.append("attributes", JSON.stringify(attributesPayload));
    if (addonsPayload.length > 0) {
      formData.append("addons", JSON.stringify(addonsPayload));
    }

    // Regular price
    // ===============================
// PRICING SUBMISSION
    // ===============================

if (productType === "rental" && rentalSubType === "simple") {
  formData.append("pricePerDay", pricePerDay);
}

if (productType === "sale") {
  formData.append("price", pricePerDay); 

  if (salePrice !== "" && salePrice !== null) {
    formData.append("salePrice", salePrice);
  }
}



// 🔒 IMAGE VALIDATION & EXISTING IMAGES HANDLING
if (isEditMode) {
  formData.append("existingImages", JSON.stringify(existingImages));
} else {
  // CREATE MODE
  if (productType === "rental" && rentalSubType === "variable") {
    // Each variation must have its own image
    const missingImage = variations.some(v => !v.image);

    if (missingImage) {
      alert("Each variation must have an image");
      return;
    }
  } else {
    // Simple rental or sale → base images required
    if (images.length === 0) {
      alert("Upload at least one image");
      return;
    }
  }
}


    images.forEach((img) => formData.append("images", img));

    // 4️⃣ Decide endpoint
    const endpoint = isEditMode
      ? `/products/admin/edit/${id}`
      : "/products/admin/add";

    const token = localStorage.getItem("admin_token");
console.log("🚀 SENDING API REQUEST TO:", endpoint);

    // 5️⃣ Submit
    await api(endpoint, {
      method: isEditMode ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    console.log("✅ API RESPONSE RECEIVED");


    if (isEditMode) {
      // Store success message in sessionStorage for Products page to show toast
      sessionStorage.setItem("productEdited", "true");
    } else {
      toast.success("Product added successfully!");
    }
    // Redirect to products page
    window.location.href = "/admin/products";
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
        {/* RENTAL SUB TYPE */}
{productType === "rental" && (
  <div>
    <label className="font-medium">Rental Type</label>
    <div className="flex gap-4 mt-2">
      {["simple", "variable"].map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            setRentalSubType(type);
            setVariationCount(0);
            setVariations([]);
          }}
          className={`px-6 py-2 rounded-full border ${
            rentalSubType === type
              ? "bg-[#8B5C42] text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {type === "simple" ? "Simple Rental" : "Variable Rental"}
        </button>
      ))}
    </div>
  </div>
)}

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

                
                }}



                className={`px-6 py-2 rounded-full border border-gray-400 transition
                  ${productType === type
                    ? "bg-[#8B5C42] text-white"
                    : "bg-white hover:bg-gray-100"
                  }`}
              >
                {type === "rental" ? "Rental Product" : "Selling Product"}
              </button>
            ))}
          </div>
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
          {productType === "rental" && rentalSubType === "variable" && (
  <div className="bg-[#FAF7F5] p-6 rounded-xl border">
    <label className="font-medium">
      How many variations do you want?
    </label>
    <input
      type="number"
      min="1"
      max="20"
      className="mt-2 w-40 p-3 border rounded-lg"
      value={variationCount}
      onChange={(e) => {
        const count = Number(e.target.value);
        setVariationCount(count);

        setVariations(
          Array.from({ length: count }, (_, i) => ({
            id: i,
            dimension: "",
            pricePerDay: "",
            salePrice: "",
            stock: 1,
            image: null,
            preview: null,
          }))
        );
      }}
    />
  </div>
  
)}
{productType === "rental" &&
  rentalSubType === "variable" &&
  variations.map((v, index) => (
    <div
      key={index}
      className="border rounded-xl p-6 bg-white space-y-4"
    >
      <h3 className="font-semibold text-lg">
        Variation {index + 1}
      </h3>

      <input
        placeholder="Dimension (e.g. 10×10)"
        className="w-full p-3 border rounded-lg"
        value={v.dimension}
        onChange={(e) => {
          const copy = [...variations];
          copy[index].dimension = e.target.value;
          setVariations(copy);
        }}
      />

      <input
        type="number"
        placeholder="Price per day"
        className="w-full p-3 border rounded-lg"
        value={v.pricePerDay}
        onChange={(e) => {
          const copy = [...variations];
          copy[index].pricePerDay = e.target.value;
          setVariations(copy);
        }}
      />

      <input
        type="number"
        placeholder="Sale price (optional)"
        className="w-full p-3 border rounded-lg"
        value={v.salePrice}
        onChange={(e) => {
          const copy = [...variations];
          copy[index].salePrice = e.target.value;
          setVariations(copy);
        }}
      />

      <input
        type="number"
        placeholder="Stock"
        className="w-full p-3 border rounded-lg"
        value={v.stock}
        onChange={(e) => {
          const copy = [...variations];
          copy[index].stock = e.target.value;
          setVariations(copy);
        }}
      />

      {/* Single Image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          const copy = [...variations];
          copy[index].image = file;
          copy[index].preview = URL.createObjectURL(file);
          setVariations(copy);
        }}
      />

      {v.preview && (
        <img
          src={v.preview}
          className="w-32 h-32 object-cover rounded-lg"
        />
      )}
    </div>
  ))}

        </div>

        {/* PRICING — hidden for variable rentals */}
{!(productType === "rental" && rentalSubType === "variable") && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

    <div>
      <label>Sale Price</label>
      <input
        type="number"
        className="w-full p-3 border border-gray-400 rounded-lg"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
        placeholder="Optional discounted price"
        min="0"
      />
    </div>

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
  </div>
)}


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
if (isSingle) {
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
const shelvingTier = selectedAddons[groupKey]?.[oid]?.shelvingTier || (o.tier || "A");
const shelvingSize = selectedAddons[groupKey]?.[oid]?.shelvingSize || "";
const shelvingQuantity = selectedAddons[groupKey]?.[oid]?.shelvingQuantity || 1;

// Check if this is a shelving addon
const isShelving = o.label?.toLowerCase().includes("shelving") || 
                   o.label?.toLowerCase().includes("shelf");
const shelvingTierAOptions = shelvingConfig?.tierA?.sizes || [];



                return (
                  <div
                    key={o._id}
                    className={`flex flex-col gap-3 p-3 rounded-lg border
                      ${isSelected ? "border-black bg-gray-50" : "border-gray-300"}
                    `}
                  >
                    <div className="flex items-center justify-between">
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
        shelvingTier: prev[groupKey]?.[oid]?.shelvingTier || (o.tier || "A"),
        shelvingSize: prev[groupKey]?.[oid]?.shelvingSize || "",
        shelvingQuantity: prev[groupKey]?.[oid]?.shelvingQuantity || 1,
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
                          {o.tier && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              Tier {o.tier}
                            </span>
                          )}
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
        ...prev[groupKey]?.[oid],
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

                    {/* Shelving Configuration UI (only when shelving addon is selected) */}
                    {isShelving && isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Shelving Configuration</h4>
                        
                        {/* Tier Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Tier
                          </label>
                          <div className="flex gap-3">
                            {["A", "B", "C"].map((tier) => (
                              <button
                                key={tier}
                                type="button"
                                onClick={() => {
                                  setSelectedAddons((prev) => {
                                    const groupKey = String(g._id);
                                    return {
                                      ...prev,
                                      [groupKey]: {
                                        ...(prev[groupKey] || {}),
                                        [oid]: {
                                          ...prev[groupKey]?.[oid],
                                          selected: true,
                                          shelvingTier: tier,
                                          shelvingSize: tier === "A" ? "" : "yes",
                                          shelvingQuantity: tier === "C" ? 1 : 1,
                                        },
                                      },
                                    };
                                  });
                                }}
                                className={`px-4 py-2 rounded-lg border-2 transition ${
                                  shelvingTier === tier
                                    ? "border-[#8B5C42] bg-[#FFF7F0] text-[#8B5C42] font-semibold"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                Tier {tier}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tier A: Size Selection */}
                        {shelvingTier === "A" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Size
                            </label>
                            <select
                              value={shelvingSize}
                              onChange={(e) => {
                                setSelectedAddons((prev) => {
                                  const groupKey = String(g._id);
                                  return {
                                    ...prev,
                                    [groupKey]: {
                                      ...(prev[groupKey] || {}),
                                      [oid]: {
                                        ...prev[groupKey]?.[oid],
                                        selected: true,
                                        shelvingSize: e.target.value,
                                      },
                                    },
                                  };
                                });
                              }}
                              className="w-full p-2 border rounded-lg"
                            >
                              <option value="">Select a size</option>
                              {shelvingTierAOptions.map((opt) => (
                                <option key={opt.size} value={opt.size}>
                                  {opt.size} - {opt.dimensions} (${opt.price}/shelf)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Tier B & C: Yes/No Selection */}
                        {(shelvingTier === "B" || shelvingTier === "C") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Add Shelving?
                            </label>
                            <select
                              value={shelvingSize || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedAddons((prev) => {
                                  const groupKey = String(g._id);
                                  return {
                                    ...prev,
                                    [groupKey]: {
                                      ...(prev[groupKey] || {}),
                                      [oid]: {
                                        ...prev[groupKey]?.[oid],
                                        selected: true,
                                        shelvingSize: value,
                                        shelvingQuantity: value === "yes" ? (shelvingTier === "C" ? 1 : 1) : 0,
                                      },
                                    },
                                  };
                                });
                              }}
                              className="w-full p-2 border rounded-lg"
                            >
                              <option value="">Select</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                            {shelvingSize === "yes" && (
                              <p className="text-xs text-gray-500 mt-1">
                                {shelvingTier === "B" 
                                  ? `${shelvingConfig?.tierB?.dimensions || "43\" wide x 11.5\" deep x 1.5\" thick"} ($${shelvingConfig?.tierB?.price || 29}/shelf)`
                                  : `${shelvingConfig?.tierC?.dimensions || "75\" wide x 25\" deep x 1.5\" thick"} ($${shelvingConfig?.tierC?.price || 50}/shelf) - Max 1 shelf`
                                }
                              </p>
                            )}
                          </div>
                        )}

                        {/* Quantity Selection */}
                        {((shelvingTier === "A" && shelvingSize) || 
                          (shelvingTier === "B" && shelvingSize === "yes") ||
                          (shelvingTier === "C" && shelvingSize === "yes")) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity {shelvingTier === "C" ? "(Max 1)" : `(Max ${shelvingTier === "A" ? 8 : 8})`}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={shelvingTier === "C" ? 1 : shelvingTier === "A" ? 8 : 8}
                              value={shelvingQuantity}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 1;
                                const max = shelvingTier === "C" ? 1 : shelvingTier === "A" ? 8 : 8;
                                setSelectedAddons((prev) => {
                                  const groupKey = String(g._id);
                                  return {
                                    ...prev,
                                    [groupKey]: {
                                      ...(prev[groupKey] || {}),
                                      [oid]: {
                                        ...prev[groupKey]?.[oid],
                                        selected: true,
                                        shelvingQuantity: Math.min(Math.max(1, qty), max),
                                      },
                                    },
                                  };
                                });
                              }}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
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

      
      

       {/* DIMENSIONS — hidden for variable rentals */}
{!(productType === "rental" && rentalSubType === "variable") && (
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
)}

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
        {!(productType === "rental" && rentalSubType === "variable") && (

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
    ${totalImageCount >= MAX_IMAGES
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
)}



        {/* SUBMIT */}
        <button className="w-full py-4 bg-[#8B5C42] text-white rounded-xl text-lg font-medium hover:bg-[#704A36] transition">
          {isEditMode ? "Update Product" : "Add Product"}
        </button>

      </form>
    </AdminLayout>
  );
};

export default AddProduct;
