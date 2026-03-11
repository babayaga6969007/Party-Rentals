import { FiX } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroSignage from "../../assets/home2/hero2.png";
import heroPedestal from "../../assets/home2/hero4.png";
export default function AddToCartModal({
  open,
  onClose,
  product,
  onGoToCart,
}) {
const { addToCart, replaceCartItem } = useCart();  const navigate = useNavigate();


  if (!open) return null;

  /* ============================
     PRICE CALCULATION
  ============================ */

  const existingAddonTotal = (product?.addons || []).reduce(
    (sum, a) => sum + (Number(a.price) || 0),
    0
  );


  const baseProductTotal =
    Number(product?.lineTotal || 0) - existingAddonTotal;

  const computedTotal =
    baseProductTotal + existingAddonTotal;

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
      <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-xl p-6 relative animate-fadeIn">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Just Added to Your Bag
        </h2>

        {/* MAIN PRODUCT */}
        <div className="flex gap-4 border-b pb-4 mb-4">
          <img
            src={product?.image}
            className="w-24 h-24 rounded-lg object-cover"
            alt=""
          />

          <div className="flex-1">
            <p className="font-semibold">{product?.name}</p>
            <p className="text-sm text-gray-500">
              Qty: {product?.qty}
            </p>

            <p className="text-sm text-gray-700 mt-1">
              ${computedTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* EXISTING ADDONS */}
        {product?.addons?.length > 0 && (
          <div className="mb-4 border-t pt-3">
            <p className="font-medium mb-2 text-sm text-gray-800">
              Selected Add-Ons:
            </p>

            <div className="space-y-1 text-sm text-gray-600">
              {product.addons.map((a, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{a.name}</span>
                  <span>
                    + ${Number(a.price || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* BUTTONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
          >
            Continue Shopping
          </button>

          <button
onClick={() => {


  const updatedItem = {
    ...product,
    lineTotal: computedTotal,
  };

  // IMPORTANT: replace cart item properly
  // using original cartKey
  replaceCartItem(product.cartKey, updatedItem);

  onGoToCart();
}}            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Checkout
          </button>
        </div>

       {/* PEDESTAL / SIGNAGE SECTION */}
{product?.hasSignage && (
  <div className="mt-5 border-t pt-4">

    <h3 className="font-semibold mb-4 text-sm text-gray-800">
      Additional Options
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* PEDESTAL */}
      <div
  onClick={() => {
    onClose(); // close modal
    navigate("/product/698a8795db89f542c7adf6a0");
  }}
        className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-md transition"
      >
        <img
          src={heroPedestal}
          alt="Pedestal"
          className="w-full h-32 object-cover"
        />

        <div className="p-3 flex justify-between items-center">
          <span className="font-medium text-gray-800">
            Pedestal
          </span>

          <span className="text-sm text-gray-500">
            View →
          </span>
        </div>
      </div>

      {/* SIGNAGE */}
      <div
onClick={() => {
  onClose();
  navigate("/signage");
}}        className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-md transition"
      >
        <img
          src={heroSignage}
          alt="Signage"
          className="w-full h-32 object-cover"
        />

        <div className="p-3 flex justify-between items-center">
          <span className="font-medium text-gray-800">
            Add Signage
          </span>

          <span className="text-sm text-gray-500">
            + ${product?.signagePrice || 0}
          </span>
        </div>
      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}