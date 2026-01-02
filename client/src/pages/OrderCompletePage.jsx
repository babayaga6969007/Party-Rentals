import { useLocation, Link } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";
import demoImg1 from "../assets/home2/hero1.png";
import demoImg2 from "../assets/home2/hero2.png";


export default function OrderCompletePage() {
  const location = useLocation();

  const order = location.state?.order;

if (!order) {
  return (
    <div className="page-wrapper-checkoutt min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          No order found
        </h1>
        <p className="text-gray-600 mb-6">
          This page needs order data from checkout. Please place an order again.
        </p>
        <Link
          to="/cart"
          className="inline-block px-6 py-3 rounded-full bg-black text-white font-semibold"
        >
          Go to Cart
        </Link>
      </div>
    </div>
  );
}


  const subtotal = order.pricing?.subtotal ?? 0;
const discount = order.pricing?.discount ?? 0;
const deliveryFee = order.pricing?.deliveryFee ?? 0;
const extraFees = order.pricing?.extraFees ?? 0;
const total = order.pricing?.finalTotal ?? 0;

  return (
    <div className="page-wrapper-checkoutt min-h-screen bg-[#FFFFFF]">
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
            {/* ITEMS */}
<div className="space-y-4 mb-6">
  {order.items.map((item) => (
    <div
      key={item.id}
      className="flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        {/* Image or placeholder */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-800">
            {item.name}
          </p>
           {/* ✅ RENTAL METADATA GOES HERE */}
  {item.productType === "rental" && (
    <p className="text-xs text-gray-500">
      {item.startDate} → {item.endDate} ({item.days} days)
    </p>
  )}
          <p className="text-xs text-gray-500">
            Qty: {item.qty}
          </p>
        </div>
      </div>

      {/* Price × Qty */}
     <p className="text-sm font-medium">
  ${Number(item.lineTotal || 0).toFixed(2)}
</p>

    </div>
  ))}
</div>


            {/* TOTALS */}
            <div className="flex justify-between">
  <span className="text-gray-600">Sub Total</span>
  <span>${subtotal.toFixed(2)}</span>
</div>

<div className="flex justify-between">
  <span className="text-gray-600">Discount</span>
  <span className="text-red-500">-${discount.toFixed(2)}</span>
</div>

<div className="flex justify-between">
  <span className="text-gray-600">Delivery Fee</span>
  <span>${deliveryFee.toFixed(2)}</span>
</div>

{extraFees > 0 && (
  <div className="flex justify-between">
    <span className="text-gray-600">Extra Fees</span>
    <span>${extraFees.toFixed(2)}</span>
  </div>
)}

<div className="flex justify-between pt-3 font-semibold text-base">
  <span>Order Total</span>
  <span>${total.toFixed(2)}</span>
</div>

          </div>

        </div>
      </div>
    </div>
  );
}
