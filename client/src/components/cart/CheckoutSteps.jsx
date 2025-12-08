import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Shopping cart", path: "/cart" },
  { id: 2, label: "Checkout details", path: "/checkout" },
  { id: 3, label: "Order complete", path: "/order-complete" },
];

export default function CheckoutSteps({ currentStep }) {
  return (
    <div className="w-full border-b border-gray-200 mb-6">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center sm:text-left">
          Your Shopping Cart
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <Link
                key={step.id}
                to={step.path}
                className={`flex items-center gap-2 cursor-pointer transition ${
                  isActive
                    ? "text-black"
                    : isCompleted
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-semibold 
                  ${
                    isActive
                      ? "border-black bg-black text-white"
                      : isCompleted
                      ? "border-gray-700 text-gray-700"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {step.id}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
