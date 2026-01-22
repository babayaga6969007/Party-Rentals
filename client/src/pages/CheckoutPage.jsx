import { useLocation, useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const STAIRS_COST = 250;
const SETUP_COST = 300; // 150 × 2 hours
// ====================
// DATE HELPERS
// ====================
const todayISO = new Date().toISOString().split("T")[0];

const addDays = (dateStr, days) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export default function CheckoutPage({ paymentMode, setPaymentMode }) {
  const location = useLocation();
  const appliedCoupon = location.state?.coupon || null;

  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");


  // ✅ Delivery & Pickup state (MUST be declared before using stairsFee/setupFee)
  const [deliveryDate, setDeliveryDate] = useState("");
  const [pickupDate, setPickupDate] = useState("");
// 🔒 Ensure pickup date is always at least 2 days after delivery
useEffect(() => {
  if (!deliveryDate) {
    setPickupDate("");
    return;
  }

  const minPickup = addDays(deliveryDate, 2);

  if (!pickupDate || pickupDate < minPickup) {
    setPickupDate("");
  }
}, [deliveryDate]);

  const [deliveryTime, setDeliveryTime] = useState("7:00am-11:00am");
  const [pickupTime, setPickupTime] = useState("7:00am-11:00am");

  const [stairsFee, setStairsFee] = useState(false);
  const [setupFee, setSetupFee] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Fallback demo data if user opens this page directly


  const { cartItems, clearCart } = useCart();
  const items = cartItems;

  // ✅ Base pricing (memo to avoid recalculating every render)
  const pricing = useMemo(() => {
    if (location.state?.pricing) {
      const p = location.state.pricing;
      const subtotal = Number(p.subtotal || 0);
      const laborCharge = subtotal * 0.14;
      const total = subtotal + laborCharge;
      return { subtotal, laborCharge, total };
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.lineTotal || 0),
      0
    );


    const laborCharge = subtotal * 0.14;
    const total = subtotal + laborCharge;

    return { subtotal, laborCharge, total };

  }, [location.state?.pricing, items]);


  // ✅ Extra fees (now stairsFee/setupFee exist)
  const extraFees = (stairsFee ? STAIRS_COST : 0) + (setupFee ? SETUP_COST : 0);
  const finalTotal = pricing.total + extraFees;

  const handlePlaceOrder = async (mode = "FULL") => {
    if (
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.addressLine
    ) {
      setPaymentError("Please fill all required contact details.");
      return;
    }
    setPaymentError("");

    // Basic validation
    if (!deliveryDate || !pickupDate) {
      setPaymentError("Please select delivery and pickup dates.");
      return;
    }

    if (!stripe || !elements) {
      setPaymentError("Stripe is still loading. Please try again in a moment.");
      return;
    }


    try {
      setIsPaying(true);
      setPaymentMode(mode);

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Stripe will redirect here if needed
          return_url: window.location.origin + "/order-complete",
        },
        redirect: "if_required",
      });

      if (result.error) {
        setPaymentError(result.error.message || "Payment failed.");
        setIsPaying(false);
        return;
      }



      try {
        await api("/orders", {
          method: "POST",
          body: JSON.stringify({
            customer,
            items,
            pricing: {
              ...pricing,
              extraFees,
              finalTotal,
              discount: appliedCoupon?.discount || 0,
            },
            coupon: appliedCoupon
              ? {
                code: appliedCoupon.code,
                discount: appliedCoupon.discount,
              }
              : null,
            delivery: {
              deliveryDate,
              pickupDate,
              deliveryTime,
              pickupTime,
              services: {
                stairs: stairsFee,
                setup: setupFee,
              },
            },
            paymentMethod: "Stripe",
            paymentType: mode === "PARTIAL" ? "PARTIAL_60" : "FULL",
            amountPaid: mode === "PARTIAL" ? finalTotal * 0.6 : finalTotal,
            amountDue: mode === "PARTIAL" ? finalTotal * 0.4 : 0,

            stripePayment: {
              paymentIntentId: result.paymentIntent?.id,
              status: result.paymentIntent?.status,
            },
          }),
        });


      } catch (err) {
        console.error("Failed to save order:", err);
        // optional: show toast / alert
      }


      // ✅ Payment success — NOW it is safe to clear cart
      clearCart();

      navigate("/order-complete", {
        state: {
          customer,
          items,
          pricing: {
            ...pricing,
            extraFees,
            orderTotal: finalTotal,
            amountPaid: mode === "PARTIAL" ? finalTotal * 0.6 : finalTotal,
            amountDue: mode === "PARTIAL" ? finalTotal * 0.4 : 0,
            paymentType: mode === "PARTIAL" ? "PARTIAL_60" : "FULL",
          },
          delivery: {
            deliveryDate,
            pickupDate,
            deliveryTime,
            pickupTime,
            services: {
              stairs: stairsFee,
              setup: setupFee,
            },
          },
        },
      });


      setIsPaying(false);
    } catch (err) {
      setPaymentError("Something went wrong during payment.");
      setIsPaying(false);
    }
  };



  return (
    <div className="page-wrapper-checkoutt min-h-screen bg-[#FFFFFF]">
      <CheckoutSteps currentStep={2} />

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Billing & shipping */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Checkout details
          </h2>

          {/* Billing details */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
              Contact details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Full name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

              </div>
              <div>
                <label className="block text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />


              </div>
              <div>
                <label className="block text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  placeholder="+1 234 567 890"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="mb-6">


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-gray-500 mb-1">Street address</label>
                <input
                  type="text"
                  value={customer.addressLine}
                  onChange={(e) =>
                    setCustomer({ ...customer, addressLine: e.target.value })
                  }
                  placeholder="Street address"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) =>
                    setCustomer({ ...customer, city: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">State</label>
                <input
                  type="text"
                  value={customer.state}
                  onChange={(e) =>
                    setCustomer({ ...customer, state: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={customer.postalCode}
                  onChange={(e) =>
                    setCustomer({ ...customer, postalCode: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

            </div>
          </section>

          {/* DELIVERY & PICKUP */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-1 text-gray-900">
              Delivery & Pickup
            </h3>

            <p className="text-xs text-gray-500 mb-4">
              Maximum 2 days rental (Contact us if you need more than 2 days)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Delivery Date</label>
                <input
  type="date"
  min={todayISO}
  value={deliveryDate}
  onChange={(e) => setDeliveryDate(e.target.value)}
  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
/>

              </div>

              <div>
                <label className="block text-gray-500 mb-1">Delivery Time</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option>7:00am-11:00am</option>
                  <option>11:00am-3:00pm</option>
                  <option>3:00pm-7:00pm</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Pickup Date</label>
                <input
  type="date"
  min={deliveryDate ? addDays(deliveryDate, 2) : ""}
  value={pickupDate}
  onChange={(e) => setPickupDate(e.target.value)}
  disabled={!deliveryDate}
  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
/>

              </div>

              <div>
                <label className="block text-gray-500 mb-1">Pickup Time</label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option>7:00am-11:00am</option>
                  <option>11:00am-3:00pm</option>
                  <option>3:00pm-7:00pm</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={stairsFee}
                  onChange={() => setStairsFee((v) => !v)}
                />
                Stairs / Elevator (+$250)
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={setupFee}
                  onChange={() => setSetupFee((v) => !v)}
                />
                Set Up & Tear Down (+$150/hour, 2 hours minimum)
              </label>
            </div>
          </section>

          {/* Payment */}
          {/* Payment */}
          <section>
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
              Payment method
            </h3>

            <div className="border rounded-xl p-3">
              <PaymentElement />
            </div>


            {paymentError && (
              <p className="mt-2 text-sm text-red-600">{paymentError}</p>
            )}
          </section>


        </div>

        {/* Order summary */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3">Order Summary</h3>

          <div className="mb-3 max-h-40 overflow-auto space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-600">
                  {item.name} × {item.qty}
                </span>
                <span className="font-medium">
                  ${Number(item.lineTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                ${pricing.subtotal.toFixed(2)}
              </span>
            </div>


            <div className="flex justify-between">
              <span className="text-gray-500">Labor Charge (14%)</span>
              <span className="font-medium">
                ${pricing.laborCharge.toFixed(2)}
              </span>
            </div>

            {stairsFee && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stairs / Elevator</span>
                <span className="font-medium">$250.00</span>
              </div>
            )}

            {setupFee && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Setup & Tear Down</span>
                <span className="font-medium">$300.00</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold">
              ${finalTotal.toFixed(2)}
            </span>
          </div>

          {/* TERMS AGREEMENT CHECKBOX */}
          <div className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              id="agree"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 border-gray-400 rounded"
            />
            <label htmlFor="agree" className="text-gray-700 leading-tight">
              By clicking this box, you agree to our{" "}
              <a
                href="/"
                className="text-[#8B5C42] font-medium underline hover:text-[#704A36]"
              >
                Terms and Conditions
              </a>
              .
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2">

            <button
              type="button"
              onClick={() => handlePlaceOrder("FULL")}
              disabled={!stripe || !elements || isPaying || !agreeToTerms}
              className={`w-full py-3 rounded-full text-sm font-semibold ${!stripe || !elements || isPaying || !agreeToTerms
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
                }`}
            >
              {isPaying ? "Processing..." : "Place Order (Pay 100%)"}
            </button>

            <button
              type="button"
              onClick={() => handlePlaceOrder("PARTIAL")}
              disabled={!stripe || !elements || isPaying}
              className={`w-full py-3 rounded-full text-sm font-semibold border ${!stripe || !elements || isPaying
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-black text-black hover:bg-gray-100"
                }`}
            >
              Place Order (Pay 60% Now)
            </button>



            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="w-full py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
