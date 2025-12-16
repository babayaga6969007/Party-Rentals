import { useLocation, useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Fallback demo data if user opens this page directly
  const items = location.state?.items || [
    { id: 1, name: "Party Balloon Pump", price: 45, qty: 2 },
    { id: 2, name: "LED Fairy Lights", price: 25, qty: 3 },
  ];
  const pricing =
    location.state?.pricing || (() => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
      const discount = subtotal * 0.1;
      const deliveryFee = 10;
      const total = subtotal - discount + deliveryFee;
      return { subtotal, discount, deliveryFee, total };
    })();

  const handlePlaceOrder = () => {
    navigate("/order-complete", {
      state: {
        items,
        pricing,
        orderId: "RSN-20482",
      },
    });
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
                  defaultValue="John Doe"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="john.doe@email.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1-202-555-0147"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
              Shipping address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-gray-500 mb-1">
                  Street address
                </label>
                <input
                  type="text"
                  defaultValue="124 Crescent Avenue"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  defaultValue="San Diego"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">
                  State / Province / Region
                </label>
                <input
                  type="text"
                  defaultValue="California"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  defaultValue="92101"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
              Payment method
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              {/* Apple Pay */}
              <label className="flex items-center gap-3 border rounded-xl px-3 py-2 cursor-pointer hover:border-black transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  defaultChecked
                  className="accent-black"
                />
                <div>
                  <p className="font-semibold">Apple Pay</p>
                  <p className="text-xs text-gray-500">
                    Fast, secure checkout using your saved cards.
                  </p>
                </div>
              </label>

              {/* Google Pay */}
              <label className="flex items-center gap-3 border rounded-xl px-3 py-2 cursor-pointer hover:border-black transition">
                <input type="radio" name="paymentMethod" className="accent-black" />
                <div>
                  <p className="font-semibold">Google Pay</p>
                  <p className="text-xs text-gray-500">
                    Pay quickly with your Google account.
                  </p>
                </div>
              </label>

              {/* Card */}
              <label className="flex flex-col gap-2 border rounded-xl px-3 py-2 cursor-pointer hover:border-black transition">
                <div className="flex items-center gap-3">
                  <input type="radio" name="paymentMethod" className="accent-black" />
                  <div>
                    <p className="font-semibold">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">
                      Visa, Mastercard, RuPay and more.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 ml-7">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black sm:col-span-3"
                  />
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </label>

              
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3">Order Summary</h3>

          <div className="mb-3 max-h-40 overflow-auto space-y-2 text-sm">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-gray-600">
                  {item.name} × {item.qty}
                </span>
                <span className="font-medium">
                  ${(item.price * item.qty).toFixed(2)}
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
              <span className="text-gray-500">Discount</span>
              <span className="font-medium text-red-500">
                -${pricing.discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-medium">
                ${pricing.deliveryFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold">
              ${pricing.total.toFixed(2)}
            </span>
          </div>

          {/* TERMS AGREEMENT CHECKBOX */}
<div className="mt-4 flex items-start gap-2 text-sm">
  <input
    type="checkbox"
    id="agree"
    className="mt-1 w-4 h-4 border-gray-400 rounded"
  />
  
  <label htmlFor="agree" className="text-gray-700 leading-tight">
    By clicking this box, you agree to our{" "}
    <a href="/" className="text-[#8B5C42] font-medium underline hover:text-[#704A36]">
      Terms and Conditions
    </a>.
  </label>
</div>


          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
            >
              Place Order
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
