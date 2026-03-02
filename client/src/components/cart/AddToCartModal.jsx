import { FiX } from "react-icons/fi";

import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function AddToCartModal({ open, onClose, product, addons, onGoToCart, onAddRecommended }) {
const { addToCart, replaceCartItem } = useCart();
const navigate = useNavigate();
const [selectedPedestalIndex, setSelectedPedestalIndex] = useState("");

if (!open) return null;
const baseAddonTotal = (product.addons || []).reduce(
  (sum, a) => sum + (Number(a.price) || 0),
  0
);

const baseProductTotal =
  Number(product.lineTotal || 0) - baseAddonTotal;

const computedTotal =
  baseProductTotal +
  (product.addons || []).reduce(
    (sum, a) => sum + (Number(a.price) || 0),
    0
  );
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50">

      <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-xl p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <FiX size={24} />
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold mb-4">Just Added to Your Bag</h2>

        {/* Main Product */}
        <div className="flex gap-4 border-b pb-4 mb-4">
          <img src={product.image} className="w-24 h-24 rounded-lg object-cover" />

          <div className="flex-1">
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-gray-500">Qty: {product.qty}</p>
<p className="text-sm text-gray-700 mt-1">
${computedTotal.toFixed(2)}
</p>
          </div>
        </div>
{/* Addons Section */}
{product?.addons?.length > 0 && (
  <div className="mb-4 border-t pt-3">
    <p className="font-medium mb-2 text-sm text-gray-800">
      Selected Add-Ons:
    </p>

    <div className="space-y-1 text-sm text-gray-600">
      {product.addons.map((a, idx) => (
        <div key={idx} className="flex justify-between">
          <span>{a.name}</span>
          <span>+ ${Number(a.price || 0).toFixed(2)}</span>
        </div>
      ))}
    </div>
  </div>
)}


        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
          >
            Continue Shopping
          </button>

          <button
  onClick={onGoToCart}

  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
>
  Checkout
</button>

        </div>

       {/* Pedestal / Signage Options (Moved from product page) */}
{(product?.hasPedestal || product?.hasSignage) && (
  <div className="mt-5 border-t pt-4">

    <h3 className="font-semibold mb-3 text-sm text-gray-800">
      Additional Options
    </h3>

    {/* Pedestal */}
    {product.hasPedestal && product.pedestalItems?.length > 0 && (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">
      Select Pedestal
    </label>

    <select
      className="w-full p-2 border rounded-lg"
      value={selectedPedestalIndex}
      onChange={(e) => {
        const idx = e.target.value;
        setSelectedPedestalIndex(idx);

        if (idx === "") return;

const chosen = product?.pedestalItems?.[idx];
if (!chosen) return;
        const pedestalPrice = Number(chosen.price) || 0;

// remove old pedestal if exists
const filteredAddons = (product.addons || []).filter(
  (a) => a.name !== "Pedestals"
);

const updatedAddons = [
  ...filteredAddons,
  {
    optionId: "pedestal",
    name: "Pedestals",
    price: pedestalPrice,
    pedestalData: {
      dimension: chosen.dimension,
      price: pedestalPrice,
    },
  },
];

// calculate new total
const addonsTotal = updatedAddons.reduce(
  (sum, a) => sum + (Number(a.price) || 0),
  0
);

const baseWithoutAddons =
  Number(product.lineTotal || 0) -
  (product.addons || []).reduce(
    (sum, a) => sum + (Number(a.price) || 0),
    0
  );

const updatedItem = {
  ...product,
  addons: updatedAddons,
  lineTotal: baseWithoutAddons + addonsTotal,
};

replaceCartItem(updatedItem);
      }}
    >
      <option value="">Select pedestal</option>
      {product.pedestalItems.map((p, idx) => (
        <option key={idx} value={idx}>
          {p.dimension} (+ ${p.price})
        </option>
      ))}
    </select>
  </div>
)}
    {/* Signage */}
    {product.hasSignage && (
      <div className="mb-4">
        <button
          onClick={() => navigate("/signage")}
          className="w-full border rounded-lg px-4 py-3 flex justify-between items-center hover:bg-gray-50"
        >
          <span>Add Signage</span>
          <span>+ ${product.signagePrice}</span>
        </button>
      </div>
    )}
  </div>
)}


      </div>
    </div>
  );
}
