import { useCart } from "../context/CartContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";
import { api } from "../utils/api";
import ShippingRatesModal from "../components/ShippingRatesModal";
import { FiAlertCircle } from "react-icons/fi";








export default function CartPage() {


const { cartItems, updateQty, removeItem, clearCart, cartSubtotal } = useCart();
const items = cartItems;
  const navigate = useNavigate();
const safeSubtotal = Number(cartSubtotal) || 0;

const [couponCode, setCouponCode] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [couponError, setCouponError] = useState("");
const discount = Number(appliedCoupon?.discount || 0);

// Shipping cost state
const [shippingCost, setShippingCost] = useState(0);
const [shippingAddress, setShippingAddress] = useState("");
const [openShippingModal, setOpenShippingModal] = useState(false);




const total = Math.max(
  safeSubtotal - discount + shippingCost,
  0
);



const handleApplyCoupon = async () => {
  try {
    const res = await api("/coupons/validate", {
      method: "POST",
     body: JSON.stringify({
  code: couponCode,
  cartSubtotal: safeSubtotal,
}),

    });

    setAppliedCoupon(res);
    setCouponError("");
  } catch (err) {
    setCouponError(err.message || "Invalid coupon");
  }
};



  
const [stockWarning, setStockWarning] = useState("");
const handleIncreaseQty = (item) => {
  if (item.qty >= item.maxStock) {
    setStockWarning(`No more stock available for "${item.name}".`);
setTimeout(() => setStockWarning(""), 5000);

    return;
  }

updateQty(item.cartKey, 1);
};


const handleProceed = () => {
  if (total < 1000) {
    alert("Minimum order limit is $1000. Please add more items to proceed.");
    return;
  }

  navigate("/checkout", {
    state: {
      pricing: {
        subtotal: cartSubtotal,
        discount,
        shipping: shippingCost,
        total,
      },
     coupon: appliedCoupon
  ? {
      code: appliedCoupon.code,
      discount,
      discountType: appliedCoupon.discountType,
      discountValue: appliedCoupon.discountValue,
    }
  : null,
     shipping: shippingCost > 0 ? {
       cost: shippingCost,
       address: shippingAddress,
     } : null,

    },
  });
};



  return (
    <div className="page-wrapper-checkoutt min-h-screen bg-[#FFFFFF]">
      <CheckoutSteps currentStep={1} />
{stockWarning && (
  <div className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 text-sm flex justify-between items-center">
    <span>{stockWarning}</span>
    <button
      onClick={() => setStockWarning("")}
      className="ml-4 font-semibold"
    >
      ✕
    </button>
  </div>
)}

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Cart items */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your cart</h2>
            <button
              type="button"
              className="text-xs sm:text-sm text-red-500 hover:text-red-600"
              onClick={clearCart}>
              Delete all
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">
              Your cart is empty. Add some items to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-300 rounded-xl px-3 py-3"
                >
                  <div className="flex items-center gap-4">

  {/* Product Image */}
  <img
    src={item.image}
    alt={item.name}
className="w-20 h-20 rounded-lg object-cover border border-gray-300"
  />

  {/* Product Details */}
  <div>
  <p className="text-sm font-semibold text-gray-900">
    {item.name}
  </p>

  {/* ✅ RENTAL METADATA — PUTS HERE */}
  {item.productType === "rental" && (
    <div className="mt-1 text-xs text-gray-500 space-y-0.5">
      <p>
        Dates: {item.startDate} → {item.endDate}
      </p>
      <p>
        Days: {item.days}
      </p>
    </div>
  )}

  {item.customTitle && item.customTitle.trim() && (
    <p className="mt-1 text-xs text-gray-600">Title: {item.customTitle}</p>
  )}

  <p className="mt-1 text-sm font-medium text-gray-900">
    ${item.lineTotal.toFixed(2)}
  </p>
</div>


</div>


                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border rounded-full px-2 py-1">
                      <button
                        type="button"
                        className="px-2 text-lg leading-none"
                        onClick={() => updateQty(item.cartKey, -1)}
                      >
                        −
                      </button>
                      <span className="px-2 text-sm">{item.qty}</span>
                      <button
  type="button"
  onClick={() => handleIncreaseQty(item)}
>
  +
</button>

                    </div>

                    <button
                      type="button"
                      className="text-xs text-red-500 hover:text-red-600"
onClick={() => removeItem(item.cartKey)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-4">Order Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
<span className="font-medium">${cartSubtotal.toFixed(2)}</span>
            </div>

            {/* SHIPPING */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Shipping</span>
                {shippingCost > 0 ? (
                  <span className="font-medium">${shippingCost.toFixed(2)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenShippingModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Calculate
                  </button>
                )}
              </div>
              {shippingAddress && (
                <p className="text-xs text-gray-500 mt-1">
                  {shippingAddress}
                </p>
              )}
              {shippingCost > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShippingCost(0);
                    setShippingAddress("");
                  }}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Remove shipping
                </button>
              )}
            </div>
            
          
            {/* COUPON CODE */}
<div className="mt-3">
  <label className="block text-xs font-medium text-gray-600 mb-1">
    Coupon Code
  </label>

  <div className="flex gap-2">
    <input
      type="text"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value)}
      placeholder="Enter coupon"
      className="flex-1 px-3 py-2 border rounded-lg text-sm"
    />

    <button
      type="button"
      onClick={handleApplyCoupon}
      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black"
    >
      Apply
    </button>
  </div>

  {couponError && (
    <p className="text-xs text-red-600 mt-1">
      {couponError}
    </p>
  )}

  {appliedCoupon && (
    <p className="text-xs text-green-600 mt-1">
      Coupon <strong>{appliedCoupon.code}</strong> applied
    </p>
  )}
</div>
{appliedCoupon && (
  <div className="flex justify-between text-green-600">
    <span>
      Discount ({appliedCoupon.discountType === "percent" ? "%" : "flat"})
    </span>
    <span>- ${discount.toFixed(2)}</span>
  </div>
)}

{shippingCost === 0 && (
  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
    <FiAlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
    <p className="text-xs text-orange-700">
      Shipping cost not included in total. Click "Calculate" above to add shipping.
    </p>
  </div>
)}

          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold">
              ${total.toFixed(2)}
            </span>
          </div>

         <button
  type="button"
  onClick={handleProceed}
  disabled={items.length === 0 || shippingCost === 0}
  className="mt-5 w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
  title={shippingCost === 0 ? "Calculate shipping first to proceed" : undefined}
>
  Go to Checkout
</button>
{shippingCost === 0 && items.length > 0 && (
  <p className="mt-2 text-xs text-gray-500 text-center">
    Calculate shipping above to enable checkout.
  </p>
)}


        </div>
      </div>

      {/* SHIPPING RATES MODAL */}
      <ShippingRatesModal
        isOpen={openShippingModal}
        onClose={() => setOpenShippingModal(false)}
        onShippingCalculated={(result) => {
          if (result && result.price !== null && result.price !== undefined) {
            setShippingCost(result.price);
            setShippingAddress(result.address || "");
            setOpenShippingModal(false);
          }
        }}
      />
    </div>
  );
}
