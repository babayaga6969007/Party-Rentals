
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import { useState, useEffect, useMemo } from "react";




const AddProduct = () => {
  
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

      // IMPORTANT: api() may already return parsed JSON
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


  const [productType, setProductType] = useState("rental"); // rental | sale

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [description, setDescription] = useState("");

  const [pricePerDay, setPricePerDay] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const [availabilityCount, setAvailabilityCount] = useState(1);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [attrLoading, setAttrLoading] = useState(true);
  const filteredCategories = categories.filter(
  (cat) => cat.type === productType
);
useEffect(() => {
  setCategory("");
}, [productType]);


  // selections:
  // { [groupId]: string[] of optionIds } for select/multi/color
  const [selectedAttrs, setSelectedAttrs] = useState({});

  // addons selections with per-product override price
  // { [optionId]: { selected: boolean, overridePrice: string } }
  const [selectedAddons, setSelectedAddons] = useState({});
 


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  // Validate required groups (except addons)
const requiredGroups = attributeGroups.filter((g) => g.required && g.type !== "addon");

for (const g of requiredGroups) {
  const sel = selectedAttrs[g._id] || [];
  if (sel.length === 0) {
    alert(`Please select at least one option for: ${g.name}`);
    return;
  }
}
const attributesPayload = Object.entries(selectedAttrs).map(([groupId, optionIds]) => ({
  groupId,
  optionIds,
}));

const addonsPayload = Object.entries(selectedAddons)
  .filter(([, v]) => v?.selected)
  .map(([optionId, v]) => ({
    optionId,
overridePrice:
  v.overridePrice === "" || v.overridePrice === null
    ? null
    : Number(v.overridePrice),
  }));


  if (images.length === 0) {
    alert("Upload at least one image");
    return;
  }

  const formData = new FormData();

  formData.append("title", title);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("productType", productType);
  formData.append("availabilityCount", availabilityCount);
  formData.append("attributes", JSON.stringify(attributesPayload));
  formData.append("addons", JSON.stringify(addonsPayload));

 

  if (productType === "rental") {
    formData.append("pricePerDay", pricePerDay);
  } else {
    formData.append("salePrice", salePrice);
  }

  images.forEach((img) => {
    formData.append("images", img);
  });

  try {
    const token = localStorage.getItem("admin_token");

    await api("/products/admin/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    alert("Product added successfully!");
    window.location.href = "/admin/products";
  } catch (err) {
    console.error(err);
    alert(err.message || "Error adding product");
  }
};


  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-8">Add New Product</h1>

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
                onClick={() => setProductType(type)}
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
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />
            </div>
          )}

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
      const isSingle = g.type === "select"; // single-select
      const isColor = g.type === "color";
      const required = !!g.required;

      // current selection for normal groups
      const current = selectedAttrs[g._id] || [];

      // helper: toggle option
      const toggleOption = (optionId) => {
        setSelectedAttrs((prev) => {
          const prevList = prev[g._id] || [];
          let nextList = prevList;

          if (isSingle) {
            nextList = prevList.includes(optionId) ? [] : [optionId];
          } else {
            nextList = prevList.includes(optionId)
              ? prevList.filter((id) => id !== optionId)
              : [...prevList, optionId];
          }

          return { ...prev, [g._id]: nextList };
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
                const isSelected = !!selectedAddons[o._id]?.selected;
                const overridePrice = selectedAddons[o._id]?.overridePrice ?? "";

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
                          setSelectedAddons((prev) => ({
                            ...prev,
                            [o._id]: {
                              selected: checked,
                              // default override empty; base price shown from attribute option
                              overridePrice: prev?.[o._id]?.overridePrice ?? "",
                            },
                          }));
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
                          setSelectedAddons((prev) => ({
                            ...prev,
                            [o._id]: {
                              selected: true,
                              overridePrice: e.target.value,
                            },
                          }));
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
                const active = current.includes(o._id);

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

        {/* DESCRIPTION */}
        <div>
          <label>Description</label>
          <textarea
            rows="4"
            className="w-full p-3  border border-gray-400 rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Size, usage instructions, notes..."
          />
        </div>

        {/* IMAGES */}
        <div>
          <label>Product Images (max 8)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                className="w-full h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button className="w-full py-4 bg-[#8B5C42] text-white rounded-xl text-lg font-medium hover:bg-[#704A36] transition">
          Add Product
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddProduct;
