import { useLocation, Link } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";

export default function OrderCompletePage() {
  const location = useLocation();
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
  const orderId = location.state?.orderId || "RSN-20482";

  return (
    <div className=" page-wrapper-checkout min-h-screen bg-gray-50">
      <CheckoutSteps currentStep={3} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Thank you! Your order is confirmed.
          </h2>
          <p className="text-sm text-gray-600 mb-1">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <p className="text-sm text-gray-600 mb-6">
            A confirmation email has been sent to{" "}
            <span className="font-medium">john.doe@email.com</span>.
          </p>

          <div className="border rounded-xl p-4 text-left text-sm mb-6">
            <h3 className="font-semibold mb-2">Order summary</h3>
            <div className="space-y-1 max-h-32 overflow-auto">
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

            <div className="mt-3 pt-3 border-t space-y-1 text-xs">
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
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-gray-800">Total paid</span>
                <span className="font-semibold">
                  ${pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Estimated delivery: <span className="font-medium">Dec 12 – Dec 14</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
            >
              Return to Home
            </Link>
           
          </div>
        </div>
      </div>
    </div>
  );
}
