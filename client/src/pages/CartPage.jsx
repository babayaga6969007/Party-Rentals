
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/cart/CheckoutSteps";
import hero1 from "../assets/home2/hero1.png";
import hero2 from "../assets/home2/hero2.png";
import hero3 from "../assets/home2/hero3.png";


const DEMO_ITEMS = [
  {
    id: 1,
    name: "Party Balloon Pump",
    description: "Medium size, electric pump",
    price: 45,
    qty: 2,
    image: hero1
  },
  {
    id: 2,
    name: "LED Fairy Lights",
    description: "5m, warm white",
    price: 25,
    qty: 3,
    image: hero2
  },
  {
    id: 3,
    name: "Birthday Banner Set",
    description: "Multicolor banner pack",
    price: 18,
    qty: 1,
    image: hero3
  },
];
const RECOMMENDED_ITEMS = [
  {
    id: 101,
    name: "Pastel Balloon Garland",
    price: 55,
    image: hero1,
  },
  {
    id: 102,
    name: "Event Fairy Light Stand",
    price: 75,
    image: hero2,
  },
];



export default function CartPage() {
  const [items, setItems] = useState(DEMO_ITEMS);
  const navigate = useNavigate();

  const { subtotal, discount, deliveryFee, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const disc = sub * 0.1; // demo: 10% off
    const delivery = 10;
    return {
      subtotal: sub,
      discount: disc,
      deliveryFee: delivery,
      total: sub - disc + delivery,
    };
  }, [items]);

  const handleQtyChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddRecommended = (item) => {
  setItems((prev) => {
    const exists = prev.find((p) => p.id === item.id);

    if (exists) {
      // Increase quantity if item already exists
      return prev.map((p) =>
        p.id === item.id ? { ...p, qty: p.qty + 1 } : p
      );
    }

    // Otherwise add as new item
    return [...prev, { ...item, qty: 1 }];
  });
};


 const handleProceed = () => {
  if (total < 1000) {
    alert("Minimum order limit is $1000. Please add more items to proceed.");
    return;
  }

  navigate("/checkout"); // or your actual checkout page
};


  return (
    <div className="page-wrapper-checkout min-h-screen bg-gray-50">
      <CheckoutSteps currentStep={1} />

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Cart items */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your cart</h2>
            <button
              type="button"
              className="text-xs sm:text-sm text-red-500 hover:text-red-600"
              onClick={() => setItems([])}
            >
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
    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
    <p className="text-xs text-gray-500">{item.description}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">${item.price}</p>
  </div>

</div>


                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border rounded-full px-2 py-1">
                      <button
                        type="button"
                        className="px-2 text-lg leading-none"
                        onClick={() => handleQtyChange(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="px-2 text-sm">{item.qty}</span>
                      <button
                        type="button"
                        className="px-2 text-lg leading-none"
                        onClick={() => handleQtyChange(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="text-xs text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(item.id)}
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
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discount (10%)</span>
              <span className="font-medium text-red-500">
                -${discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
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
  disabled={items.length === 0}
  className="mt-5 w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Go to Checkout
</button>


        </div>
      </div>
    </div>
  );
}
