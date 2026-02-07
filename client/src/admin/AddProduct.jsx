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

  // Show on homepage (featured) — rental only
  const [featured, setFeatured] = useState(false);
  // Allow custom title — client can enter title text
  const [allowCustomTitle, setAllowCustomTitle] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);


  // Attributes
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [attrLoading, setAttrLoading] = useState(true);

  // Submit loading (create/update product)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Variable rental: queue upload progress { total, completed }
  const [variationUploadProgress, setVariationUploadProgress] = useState(null);

  // Selections
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

// groupId → optionId → {
//   selected,
//   overridePrice,
//   shelvingTier,
//   shelvingSize,
//   shelvingQuantity,
//   pedestalCount,
//   pedestals: [{ dimension, price }]
// }
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
  const MAX_VARIATION_IMAGES = 5;
  const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB per image

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
      const rawOptionId = a.optionId?._id ?? a.optionId;
      const labelFromApi = a.option?.label;

      // API may return optionId as Attribute _id (after normalize). Find addon group by Attribute id or by option id.
      let addonGroup = attributeGroups.find(
        (g) => g.type === "addon" && (g.options || []).some((o) => String(o._id) === String(rawOptionId))
      );
      if (!addonGroup) {
        addonGroup = attributeGroups.find(
          (g) => g.type === "addon" && String(g._id) === String(rawOptionId)
        );
      }
      if (!addonGroup) return;

      const groupKey = String(addonGroup._id);
      if (!grouped[groupKey]) grouped[groupKey] = {};

      // Resolve which option: by option _id match, or by label, or first option
      let option = addonGroup.options.find((o) => String(o._id) === String(rawOptionId));
      if (!option && labelFromApi) {
        option = addonGroup.options.find((o) => (o.label || "").toLowerCase() === (labelFromApi || "").toLowerCase());
      }
      if (!option) option = addonGroup.options[0];
      if (!option) return;

      const optionId = String(option._id);
      const shelvingData = a.shelvingData || {};
      const tierFromOption = option?.tier || "A";

      grouped[groupKey][optionId] = {
        selected: true,
        overridePrice: a.overridePrice ?? "",
        shelvingTier: shelvingData.tier || (a.shelvingTier || tierFromOption),
        shelvingSize: shelvingData.size || (a.shelvingSize || ""),
        shelvingQuantity: shelvingData.quantity || (a.shelvingQuantity || 1),
        pedestalCount: Array.isArray(a.pedestals) ? a.pedestals.length : 0,
        pedestals: Array.isArray(a.pedestals) ? a.pedestals : [],
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
setRentalSubType(data.productSubType || "simple");




        setPricePerDay(data.pricePerDay || "");
        setSalePrice(data.salePrice || "");
        setFeatured(!!data.featured);
        setAllowCustomTitle(!!data.allowCustomTitle);

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

// 🔄 Restore variations (EDIT MODE)
if (data.productType === "rental" && data.productSubType === "variable") {
  const restored = (data.variations || []).map((v, i) => ({
  id: i,
  dimension: v.dimension || "",
  pricePerDay: v.pricePerDay || "",
  salePrice: v.salePrice || "",
  stock: v.stock || 1,
  description: v.description != null ? String(v.description) : "",

  // IMPORTANT: existing images stay ONLY here
  existingImages: Array.isArray(v.images) ? v.images : [],

  // new uploads only (empty on load)
  images: [],
  previews: [],
}));


  setVariations(restored);
  setVariationCount(restored.length);
}




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
    const tooLarge = files.filter((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge.length > 0) {
      toast.error(`Some images are over 3MB and were skipped. Max size per image: 3MB.`);
    }
    const withinSize = files.filter((f) => f.size <= MAX_IMAGE_SIZE_BYTES);

    const remainingSlots = MAX_IMAGES - totalImageCount;
    if (remainingSlots <= 0) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const acceptedFiles = withinSize.slice(0, remainingSlots);

    setImages((prev) => [...prev, ...acceptedFiles]);
    setPreviews((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
    const formData = new FormData();


    const isVariableRental = productType === "rental" && rentalSubType === "variable";
    const variationsWithNewImages = isVariableRental
      ? variations
          .map((v, i) => ({ index: i, files: v.images || [] }))
          .filter((x) => x.files.length > 0)
      : [];
    const useVariationQueue = isVariableRental && variationsWithNewImages.length > 0;

    if (isVariableRental) {
      formData.append(
        "variations",
        JSON.stringify(
          variations.map((v) => ({
            dimension: v.dimension,
            pricePerDay: v.pricePerDay,
            salePrice: v.salePrice || null,
            stock: v.stock,
            description: (v.description && String(v.description).trim()) ? String(v.description).trim() : "",
            existingImages: (v.existingImages || []).map((img) => ({
              public_id: img.public_id,
              url: img.url,
            })),
          }))
        )
      );
      // Queue mode: do NOT append variation images here; upload one variation at a time after create/edit
      if (!useVariationQueue) {
        variations.forEach((v, i) => {
          (v.images || []).forEach((img) => {
            formData.append(`variationImages_${i}`, img);
          });
        });
      }
    }

    formData.append("productSubType", rentalSubType);

    if (productType === "rental") {
      formData.append("featured", featured);
    }
    formData.append("allowCustomTitle", allowCustomTitle);

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

    // Always include shelving configuration for shelving addons (so it's saved)
    if (isShelving) {
      addonData.shelvingTier = v.shelvingTier || option?.tier || "A";
      addonData.shelvingSize = v.shelvingSize ?? "";
      addonData.shelvingQuantity = Math.max(0, Number(v.shelvingQuantity) || 1);
    }

if (v.pedestalCount && v.pedestalCount > 0) {
  addonData.pedestals = v.pedestals || [];
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
    //  Always send addons (even empty array) so edit can clear them
formData.append("addons", JSON.stringify(addonsPayload));




// ===============================
// PRICING SUBMISSION (STORE BOTH)
// ===============================

// Always send pricePerDay if filled (works for rental + sale)
if (pricePerDay !== "" && pricePerDay !== null && pricePerDay !== undefined) {
  formData.append("pricePerDay", pricePerDay);
}

// Always send salePrice if filled (works for rental + sale)
if (salePrice !== "" && salePrice !== null && salePrice !== undefined) {
  formData.append("salePrice", salePrice);
}

// Sale products also need "price" (your backend uses req.body.price for sale)
if (productType === "sale") {
  // Your UI currently uses the same input (pricePerDay) as the main selling price.
  // So we mirror it into "price" to keep your current UI unchanged.
  if (pricePerDay !== "" && pricePerDay !== null && pricePerDay !== undefined) {
    formData.append("price", pricePerDay);
  }
}



// 🔒 IMAGE VALIDATION & EXISTING IMAGES HANDLING
if (isEditMode) {
  formData.append("existingImages", JSON.stringify(existingImages));
} else {
  // CREATE MODE
  if (productType === "rental" && rentalSubType === "variable" && !useVariationQueue) {
    // When not using queue, each variation must have its own image in this request
    const missingImage = variations.some(
      (v) =>
        (!v.images || v.images.length === 0) &&
        (!v.existingImages || v.existingImages.length === 0)
    );
    if (missingImage) {
      alert("Each variation must have an image");
      return;
    }
  }
  if (productType === "rental" && rentalSubType === "variable" && useVariationQueue) {
    const missingImage = variations.some(
      (v) =>
        (!v.images || v.images.length === 0) &&
        (!v.existingImages || v.existingImages.length === 0)
    );
    if (missingImage) {
      toast.error("Each variation must have at least one image");
      return;
    }
  }
  if (productType !== "rental" || rentalSubType !== "variable") {
    // Simple rental or sale → base images required
    if (images.length === 0) {
      alert("Upload at least one image");
      return;
    }
  }
}

    // Variable rental: max 5 images per variation (existing + new)
    if (isVariableRental) {
      const overIndex = variations.findIndex(
        (v) => (v.existingImages?.length || 0) + (v.images?.length || 0) > MAX_VARIATION_IMAGES
      );
      if (overIndex !== -1) {
        toast.error(`Variation ${overIndex + 1} has more than ${MAX_VARIATION_IMAGES} images. Maximum ${MAX_VARIATION_IMAGES} per variation.`);
        return;
      }
    }

    images.forEach((img) => formData.append("images", img));

    const endpoint = isEditMode
      ? `/products/admin/edit/${id}`
      : "/products/admin/add";
    const token = localStorage.getItem("admin_token");

    try {
      // 5️⃣ First request: create or update product (no variation images when using queue)
      const res = await api(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const productId = isEditMode ? id : res?.product?._id;
      if (!productId) {
        toast.error("Could not get product id");
        return;
      }

      // 6️⃣ Queue: upload variation images one by one
      if (useVariationQueue && variationsWithNewImages.length > 0) {
        setVariationUploadProgress({ total: variationsWithNewImages.length, completed: 0 });
        for (let i = 0; i < variationsWithNewImages.length; i++) {
          const { index: varIndex, files: varFiles } = variationsWithNewImages[i];
          const fd = new FormData();
          varFiles.forEach((file) => fd.append("images", file));
          await api(
            `/products/admin/edit/${productId}/variations/${varIndex}/images`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            }
          );
          setVariationUploadProgress((prev) => ({
            ...prev,
            completed: (prev?.completed ?? 0) + 1,
          }));
        }
        setVariationUploadProgress(null);
      }

      if (isEditMode) {
        sessionStorage.setItem("productEdited", "true");
      } else {
        toast.success("Product added successfully!");
      }
      window.location.href = "/admin/products";
    } catch (err) {
      console.error("Product save failed:", err);
      toast.error(err?.message || "Failed to save product. Please try again.");
      setVariationUploadProgress(null);
    }
    } finally {
      setIsSubmitting(false);
    }
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
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                  }`}
              >
                {type === "rental" ? "Rental Product" : "Selling Product"}
              </button>
            ))}
          </div>
        </div>
{productType === "rental" && (
  <div>
    <label className="font-medium">Rental Type</label>
    <div className="flex gap-4 mt-2">
      {["simple", "variable"].map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
  if (isEditMode) return;
  setRentalSubType(type);
  setVariationCount(0);
  setVariations([]);
}}

          className={`px-6 py-2 rounded-full border ${
            rentalSubType === type
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {type === "simple" ? "Simple Rental" : "Variable Rental"}
        </button>
      ))}
    </div>
  </div>
)}

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
          {productType === "rental" && rentalSubType === "variable" && (
  <div className="bg-gray-100 p-6 rounded-xl border space-y-4">
    {/* Title */}
    <div>
      <label className="block text-lg font-semibold text-[#2D2926]">
        Number of Variations
      </label>
      <p className="text-sm text-gray-600 mt-1">
        Variations represent different sizes, dimensions, or configurations
        of the same rental product.
      </p>
    </div>

    {/* Stepper Input */}
    <div className="flex items-center gap-4">
  {/* − Button */}
  <button
    type="button"
    disabled={variationCount <= 1}
    onClick={() => {
      if (variationCount <= variations.length) {
        const ok = window.confirm(
          "Reducing variations will permanently remove the last variation. Continue?"
        );
        if (!ok) return;
      }

      const n = Math.max(1, variationCount - 1);
      setVariationCount(n);
      setVariations((prev) => prev.slice(0, n));
    }}
  >
    −
  </button>

  {/* ✅ NUMBER INPUT (THIS WAS MISSING) */}
  <input
    type="number"
    min={1}
    max={20}
    value={variationCount}
    onChange={(e) => {
      const count = Math.max(1, Math.min(20, Number(e.target.value) || 1));

      if (count < variations.length) {
        const ok = window.confirm(
          "Reducing variations will permanently remove variation data. Continue?"
        );
        if (!ok) return;
      }

      setVariationCount(count);

      setVariations((prev) => {
        if (count > prev.length) {
          return [
            ...prev,
            ...Array.from({ length: count - prev.length }, (_, i) => ({
              id: prev.length + i,
              dimension: "",
              pricePerDay: "",
              salePrice: "",
              stock: 1,
              description: "",
              images: [],
              previews: [],
              existingImages: [],
            })),
          ];
        }
        return prev.slice(0, count);
      });
    }}
    className="w-20 text-center border rounded-lg p-2"
  />

  {/* + Button */}
  <button
    type="button"
    disabled={variationCount >= 20}
    onClick={() => {
      const n = Math.min(20, variationCount + 1);
      setVariationCount(n);

      setVariations((prev) => [
        ...prev,
        {
          id: prev.length,
          dimension: "",
          pricePerDay: "",
          salePrice: "",
          stock: 1,
          description: "",
          images: [],
          previews: [],
          existingImages: [],
        },
      ]);
    }}
  >
    +
  </button>
</div>


    {/* Helper Note */}
    <p className="text-xs text-gray-500">
      Example: 10×10, 10×15, and 10×20 would be 3 variations.
    </p>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          placeholder="e.g. Perfect for small gatherings, includes setup."
          className="w-full p-3 border border-gray-400 rounded-lg min-h-[80px] resize-y"
          value={v.description ?? ""}
          onChange={(e) => {
            const copy = [...variations];
            copy[index].description = e.target.value;
            setVariations(copy);
          }}
          maxLength={2000}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-0.5">Shown on product page when this variation is selected. Max 2000 characters.</p>
      </div>

    <label className="block text-sm font-medium text-gray-700 mt-2">
      Images <span className="text-gray-500 font-normal">(max {MAX_VARIATION_IMAGES} per variation)</span>
      {(v.existingImages?.length || 0) + (v.images?.length || 0) > 0 && (
        <span className="ml-1 text-gray-500">
          — {(v.existingImages?.length || 0) + (v.images?.length || 0)}/{MAX_VARIATION_IMAGES}
        </span>
      )}
    </label>
<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    const tooLarge = files.filter((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge.length > 0) {
      toast.error(`Some images are over 3MB and were skipped. Max size per image: 3MB.`);
    }
    const withinSize = files.filter((f) => f.size <= MAX_IMAGE_SIZE_BYTES);
    const copy = [...variations];
    const existingCount = (copy[index].existingImages?.length || 0) + (copy[index].images?.length || 0);
    if (existingCount >= MAX_VARIATION_IMAGES) {
      toast.error(`Maximum ${MAX_VARIATION_IMAGES} images per variation. Remove some to add more.`);
      e.target.value = "";
      return;
    }
    const existingKeys = new Set(
      (copy[index].images || []).map((f) => `${f.name}_${f.size}`)
    );
    const filtered = withinSize.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
    const remaining = MAX_VARIATION_IMAGES - existingCount;
    const accepted = filtered.slice(0, remaining);
    if (filtered.length > remaining) {
      toast.error(`Only ${remaining} more image(s) allowed for this variation (max ${MAX_VARIATION_IMAGES}).`);
    }
    copy[index].images = [...(copy[index].images || []), ...accepted];
    copy[index].previews = [
      ...(copy[index].previews || []),
      ...accepted.map((f) => URL.createObjectURL(f)),
    ];
    setVariations(copy);
    e.target.value = "";
  }}
/>


{/* Preview (existing + new) */}
{(v.existingImages?.length > 0 || v.previews?.length > 0) && (
  <div className="flex gap-2 flex-wrap mt-2">
    {/* Existing images (edit mode) */}
    {(v.existingImages || []).map((img, i) => (
      <div key={`existing-${i}`} className="relative">
        <img
          src={img.url || img}
          className="w-24 h-24 object-cover rounded border"
          alt=""
        />
        <button
          type="button"
          onClick={() => {
            const copy = [...variations];
            copy[index].existingImages = [...(copy[index].existingImages || [])];
            copy[index].existingImages.splice(i, 1);
            setVariations(copy);
          }}
          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
        >
          ×
        </button>
      </div>
    ))}

    {/* Newly added previews */}
    {(v.previews || []).map((src, i) => (
      <div key={`new-${i}`} className="relative">
        <img
          src={src}
          className="w-24 h-24 object-cover rounded border"
          alt=""
        />
        <button
          type="button"
          onClick={() => {
            const copy = [...variations];

            copy[index].images = [...(copy[index].images || [])];
            copy[index].previews = [...(copy[index].previews || [])];

            copy[index].images.splice(i, 1);
            copy[index].previews.splice(i, 1);

            setVariations(copy);
          }}
          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}


   
        </div>
  ))
}

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

    {productType === "rental" && (
      <div className="flex items-center gap-3">
        <label className="font-medium">Show on homepage (featured)</label>
        <button
          type="button"
          role="switch"
          aria-checked={featured}
          onClick={() => setFeatured((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
            featured ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
              featured ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    )}
    <div className="flex items-center gap-3">
      <label className="font-medium">Allow custom title</label>
      <button
        type="button"
        role="switch"
        aria-checked={allowCustomTitle}
        onClick={() => setAllowCustomTitle((v) => !v)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          allowCustomTitle ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
            allowCustomTitle ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
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
      const isPaint = g.type === "paint";
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
              {g.type === "paint" && "Paint"}
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
                   const isPedestal = o.label?.toLowerCase().includes("pedestal");

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

  // Shelving
  shelvingTier: prev[groupKey]?.[oid]?.shelvingTier || (o.tier || "A"),
  shelvingSize: prev[groupKey]?.[oid]?.shelvingSize || "",
  shelvingQuantity: prev[groupKey]?.[oid]?.shelvingQuantity || 1,

  // Pedestals
  pedestalCount: prev[groupKey]?.[oid]?.pedestalCount || 0,
  pedestals: prev[groupKey]?.[oid]?.pedestals || [],
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
{/* Pedestal Configuration UI */}
{isPedestal && isSelected && (
  <div className="mt-3 pt-3 border-t border-gray-300 space-y-4">
    <h4 className="font-semibold text-sm text-gray-700">
      Pedestal Configuration
    </h4>

    {/* Pedestal Count */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        How many pedestals would you require?
      </label>
      <input
        type="number"
        min="0"
        max="10"
        value={selectedAddons[groupKey]?.[oid]?.pedestalCount || 0}
        onChange={(e) => {
          const count = Number(e.target.value) || 0;

          setSelectedAddons((prev) => {
            const groupData = prev[groupKey] || {};
            const existing = groupData[oid] || {};

            return {
              ...prev,
              [groupKey]: {
                ...groupData,
                [oid]: {
                  ...existing,
                  selected: true,
                  pedestalCount: count,
                  pedestals: Array.from({ length: count }, (_, i) =>
                    existing.pedestals?.[i] || { dimension: "", price: "" }
                  ),
                },
              },
            };
          });
        }}
        className="w-32 p-2 border rounded-lg"
      />
    </div>

    {/* Pedestal Fields */}
    {(selectedAddons[groupKey]?.[oid]?.pedestals || []).map((p, idx) => (
      <div
        key={idx}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg"
      >
        <input
          type="text"
          placeholder={`Pedestal ${idx + 1} Dimension`}
          value={p.dimension}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedAddons((prev) => {
              const copy = [...prev[groupKey][oid].pedestals];
              copy[idx] = { ...copy[idx], dimension: value };
              return {
                ...prev,
                [groupKey]: {
                  ...prev[groupKey],
                  [oid]: {
                    ...prev[groupKey][oid],
                    pedestals: copy,
                  },
                },
              };
            });
          }}
          className="p-2 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Price"
          value={p.price}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedAddons((prev) => {
              const copy = [...prev[groupKey][oid].pedestals];
              copy[idx] = { ...copy[idx], price: value };
              return {
                ...prev,
                [groupKey]: {
                  ...prev[groupKey],
                  [oid]: {
                    ...prev[groupKey][oid],
                    pedestals: copy,
                  },
                },
              };
            });
          }}
          className="p-2 border rounded-lg"
        />
      </div>
    ))}
  </div>
)}

                    {/* Shelving: Tier A/B/C only; info below is read-only */}
                    {isShelving && isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Shelving — select tier</h4>
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
                                        shelvingQuantity: 1,
                                      },
                                    },
                                  };
                                });
                              }}
                              className={`px-4 py-2 rounded-lg border-2 transition ${
                                shelvingTier === tier
                                  ? "border-black bg-gray-50 text-black font-semibold"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              Tier {tier}
                            </button>
                          ))}
                        </div>
                        {/* Info only (no dropdowns / inputs) */}
                        {shelvingTier && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {shelvingTier === "A" && (
                              <>Tier A: multiple sizes available. {shelvingTierAOptions.length ? `${shelvingTierAOptions.map(o => o.size).join(", ")} — see Shelving Config for dimensions & pricing.` : "Configure in Admin → Shelving Config."}</>
                            )}
                            {shelvingTier === "B" && (
                              <>{shelvingConfig?.tierB?.dimensions || "43\" wide x 11.5\" deep x 1.5\" thick"} — ${shelvingConfig?.tierB?.price ?? 29}/shelf (info only)</>
                            )}
                            {shelvingTier === "C" && (
                              <>{shelvingConfig?.tierC?.dimensions || "75\" wide x 25\" deep x 1.5\" thick"} — ${shelvingConfig?.tierC?.price ?? 50}/shelf, max 1 (info only)</>
                            )}
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
                    className={`rounded-xl border transition
                      ${active ? "bg-black text-white border-black ring-2 ring-black ring-offset-1" : "bg-white border-gray-300 hover:bg-gray-100"}
                      ${isPaint ? "flex flex-col items-center gap-1.5 p-2" : "inline-flex items-center gap-2 px-4 py-2"}
                    `}
                    title={o.label}
                  >
                    {isPaint && (o.imageUrl || o.value) ? (
                      <>
                        <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex shrink-0">
                          <img
                            src={o.imageUrl || `/paint/${o.value}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </span>
                        <span className="text-xs font-medium text-center">{o.label}</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {isColor && (
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: o.hex || "#000" }}
                          />
                        )}
                        {o.label}
                      </span>
                    )}
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
                : "border-gray-300 cursor-pointer hover:border-black hover:bg-black/5"
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



        {/* Variation upload progress (variable rental queue) */}
        {variationUploadProgress != null && variationUploadProgress.total > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploading variation images… {variationUploadProgress.completed} of {variationUploadProgress.total} completed
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{
                  width: `${(variationUploadProgress.completed / variationUploadProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white rounded-xl text-lg font-medium hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {variationUploadProgress != null
                ? `Uploading variations… ${variationUploadProgress.completed}/${variationUploadProgress.total}`
                : isEditMode
                  ? "Updating…"
                  : "Creating…"}
            </>
          ) : (
            isEditMode ? "Update Product" : "Add Product"
          )}
        </button>

      </form>
    </AdminLayout>
  );
};

export default AddProduct;
