import { useState } from "react";

const PricingChartModal = ({ isOpen, onClose, basePrice = 100 }) => {
  const [activeTab, setActiveTab] = useState("table");
  const [days, setDays] = useState(1);

  // Discount based on days (same as ProductPage)
  const getDiscountRate = (days) => {
    if (days <= 3) return 0;
    if (days <= 7) return 0.05;   // 5% discount
    if (days <= 15) return 0.1;   // 10% discount
    if (days <= 30) return 0.15;  // 15% discount
    if (days <= 60) return 0.2;   // 20% discount
    return 0.25;                  // 25% discount
  };

  // Calculate price based on formula:
  // Day 1: 1x (base price)
  // Day 2: 1x + 0.5x = 1.5x
  // Day 3: 1x + 0.5x + 0.5x = 2x
  // Day n: 1x + (n-1) * 0.5x
  // Then apply discount based on rental period
  const calculatePrice = (numDays) => {
    if (numDays <= 0) return 0;
    if (numDays === 1) return basePrice;
    
    // First day: 1x, each additional day: 0.5x
    const baseRentalPrice = basePrice + (numDays - 1) * (basePrice * 0.5);
    
    // Apply discount based on rental period
    const discount = getDiscountRate(numDays);
    const discountedPrice = baseRentalPrice * (1 - discount);
    
    return discountedPrice;
  };

  // Generate pricing table for days 1-10
  const generatePricingTable = () => {
    const tableData = [];
    for (let day = 1; day <= 10; day++) {
      tableData.push({
        days: day,
        price: calculatePrice(day),
      });
    }
    return tableData;
  };

  if (!isOpen) return null;

  const calculatedPrice = calculatePrice(days);
  const pricingTable = generatePricingTable();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white max-w-3xl w-full rounded-xl shadow-lg relative my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* STICKY HEADER */}
        <div className="sticky top-0 bg-white rounded-t-xl z-10 p-6 pb-4 border-b border-gray-200">
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          {/* HEADER */}
          <h2 className="text-2xl font-semibold text-[#2D2926] pr-8">
            Pricing Chart
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Base price: <strong>${basePrice}</strong> per day
          </p>

          {/* TABS */}
          <div className="mt-4 flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab("table");
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "table"
                  ? "text-[#2D2926] border-b-2 border-[#2D2926]"
                  : "text-gray-500 hover:text-[#2D2926]"
              }`}
            >
              Pricing Table
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab("calculator");
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "calculator"
                  ? "text-[#2D2926] border-b-2 border-[#2D2926]"
                  : "text-gray-500 hover:text-[#2D2926]"
              }`}
            >
              Calculator
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 pt-4">
          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-[#F5F7FF]">
                  <tr>
                    <th className="px-4 py-3 text-left">Days</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Price per Day</th>
                  </tr>
                </thead>

                <tbody>
                  {pricingTable.map((row) => (
                    <tr key={row.days} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.days}</td>
                      <td className="px-4 py-3 font-semibold">
                        ${row.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        ${(row.price / row.days).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-xs text-gray-500">
                * Prices are calculated based on the formula: Day 1 = full price, 
                each additional day = 50% of base price. Discounts apply: 4-7 days (5%), 
                8-15 days (10%), 16-30 days (15%), 31-60 days (20%), 61+ days (25%)
              </p>
            </div>
          )}

          {activeTab === "calculator" && (
            <div className="bg-[#FAF7F5] p-6 rounded-lg border">
              <h4 className="font-semibold text-[#2D2926] mb-4">
                Calculate Rental Price
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-2">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={days}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setDays(Math.max(1, Math.min(365, value)));
                    }}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D2926]"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Base Price (Day 1):</span>
                    <span className="font-semibold">${basePrice.toFixed(2)}</span>
                  </div>
                  {days > 1 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          Additional Days ({days - 1} × ${(basePrice * 0.5).toFixed(2)}):
                        </span>
                        <span className="font-semibold">
                          ${((days - 1) * basePrice * 0.5).toFixed(2)}
                        </span>
                      </div>
                      {getDiscountRate(days) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Subtotal:
                          </span>
                          <span className="font-semibold">
                            ${(basePrice + (days - 1) * basePrice * 0.5).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {getDiscountRate(days) > 0 && (
                        <div className="flex justify-between items-center mb-2 text-green-600">
                          <span className="text-sm">
                            Discount ({Math.round(getDiscountRate(days) * 100)}%):
                          </span>
                          <span className="font-semibold">
                            -${((basePrice + (days - 1) * basePrice * 0.5) * getDiscountRate(days)).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#2D2926]">Total Price:</span>
                    <span className="text-2xl font-bold text-[#8B5C42]">
                      ${calculatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  <p>
                    <strong>Formula:</strong> Day 1 = ${basePrice.toFixed(2)} (full price), 
                    each additional day = ${(basePrice * 0.5).toFixed(2)} (50% of base price)
                  </p>
                  {days > 3 && (
                    <p className="mt-1">
                      <strong>Discount:</strong> {Math.round(getDiscountRate(days) * 100)}% off for {days} day{days > 1 ? 's' : ''} rental
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingChartModal;
