import { useLocation, Link } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";
import demoImg1 from "../assets/home2/hero1.png";
import demoImg2 from "../assets/home2/hero2.png";


export default function OrderCompletePage() {
  const location = useLocation();

  // ✅ Backend-ready (safe fallbacks)
  const order = location.state?.order || {
    id: "RSN-20482",
    date: "02 May 2023",
    paymentMethod: "Mastercard",
    customer: {
      name: "Jane Smith",
      address: "456 Oak St #3b, San Francisco, CA 94102, United States",
      phone: "+1 (415) 555-1234",
      email: "jane.smith@email.com",
    },
    items: [
  {
    id: 1,
    name: "Backdrop Arch Rental",
    pack: "Standard",
    qty: 1,
    price: 500,
    image: demoImg1,
  },
  {
    id: 2,
    name: "LED Fairy Lights",
    pack: "Premium",
    qty: 2,
    price: 250,
    image: demoImg2,
  },
],

  };

  const subtotal = order.items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );
  const shipping = 2;
  const tax = 5;
  const total = subtotal + shipping + tax;

  return (
    <div className="page-wrapper-checkout min-h-screen bg-[#F6EFE7]">
      <CheckoutSteps currentStep={3} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

          {/* LEFT — THANK YOU */}
          <div className="p-8 lg:p-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2926] mb-4">
              Thank you for your purchase!
            </h1>

            <p className="text-gray-600 text-sm mb-8 max-w-md">
              Your order will be processed within 24 working hours. We’ll notify
              you by email once your order has been shipped.
            </p>

            <h3 className="font-semibold text-[#2D2926] mb-3">
              Billing address
            </h3>

            <div className="text-sm text-gray-700 space-y-1 mb-8">
              <p><span className="font-medium">Name:</span> {order.customer.name}</p>
              <p><span className="font-medium">Address:</span> {order.customer.address}</p>
              <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
              <p><span className="font-medium">Email:</span> {order.customer.email}</p>
            </div>

            <Link
              to="/"
              className="inline-block px-8 py-3 rounded-full bg-[#F46A5E] text-white text-sm font-semibold hover:bg-[#e75c51] transition"
            >
              Track Your Order
            </Link>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="bg-[#FAFAFA] p-8 lg:p-12 relative">
            <div className="absolute -top-6 left-0 right-0 h-6 bg-[#FAFAFA] rounded-t-xl" />

            <h3 className="text-lg font-semibold text-[#2D2926] mb-6">
              Order Summary
            </h3>

            {/* META */}
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-6">
              <div>
                <p className="font-medium text-gray-800">Date</p>
                <p>{order.date}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Order Number</p>
                <p>{order.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Payment</p>
                <p>{order.paymentMethod}</p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pack: {item.pack} · Qty: {item.qty}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-medium">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="border-t pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-3 font-semibold text-base">
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
