import { FiX } from "react-icons/fi";
import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";

export default function AddToCartModal({ open, onClose, product, addons, onGoToCart, onAddRecommended }) {
  if (!open) return null;

  const recommended = [
    { id: 101, name: "Pastel Balloon Garland", price: 55, image: hero1 },
    { id: 102, name: "Event Fairy Light Stand", price: 75, image: hero2 },
  ];

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
            <p className="text-sm text-gray-700 mt-1">${product.totalPrice}</p>
          </div>
        </div>
{/* Addons Section */}
{product?.selectedAddons?.length > 0 && (
  <div className="mb-4">
    <p className="font-medium mb-2">Selected Add-Ons:</p>

    {product.selectedAddons.map((a, i) => (
      <div
        key={i}
        className="flex justify-between text-sm text-gray-700"
      >
        <span>{a.name}</span>
        <span>+ Rs {Number(a.price) || 0}</span>
      </div>
    ))}
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

        {/* Recommended products */}
        <h3 className="text-xl font-semibold mt-8 mb-3">
          Customers Also Bought
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {recommended.map((rec) => (
            <div key={rec.id} className="border rounded-xl p-3 hover:shadow cursor-pointer">

              <img src={rec.image} className="w-full h-28 object-cover rounded-lg" />

              <p className="font-medium mt-2">{rec.name}</p>
              <p className="text-red-600 font-semibold">${rec.price}</p>

              <button
                className="mt-2 w-full bg-[#8B5C42] text-white py-1 rounded hover:bg-[#704A36]"
                onClick={() => onAddRecommended(rec)}
              >
                Add
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
