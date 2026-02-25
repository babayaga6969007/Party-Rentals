import { FiX } from "react-icons/fi";

import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function AddToCartModal({ open, onClose, product, addons, onGoToCart, onAddRecommended }) {
  const { addToCart } = useCart();
const navigate = useNavigate();

  if (!open) return null;

 

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
  ${product.lineTotal}
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
  Bag & Checkout
</button>

        </div>

        <div className="mt-6 border-t pt-4 text-center">
  <button
    onClick={() => {
      onClose();
      navigate("/category");
    }}
  className="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-200 hover:text-black text-sm font-semibold transition"
  >
    View More Rental Products
  </button>
</div>


      </div>
    </div>
  );
}
