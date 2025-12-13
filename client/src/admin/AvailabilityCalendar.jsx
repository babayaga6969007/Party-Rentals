import { useState } from "react";
import AdminLayout from "./AdminLayout";

/* Demo Products */
const PRODUCTS = [
  {
    id: 1,
    name: "Backdrop Arch",
    blockedDates: ["2025-12-20", "2025-12-21"],
  },
  {
    id: 2,
    name: "LED Fairy Lights",
    blockedDates: ["2025-12-18"],
  },
  {
    id: 3,
    name: "Luxury Sofa Set",
    blockedDates: [],
  },
  {
    id: 4,
    name: "Wedding Floral Stand",
    blockedDates: ["2025-12-25", "2025-12-26"],
  },
];

/* Helper */
const today = new Date().toISOString().split("T")[0];

const AvailabilityCalendar = () => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [blockDate, setBlockDate] = useState("");

  const handleBlockDate = () => {
    if (!blockDate) return;

    if (!selectedProduct.blockedDates.includes(blockDate)) {
      selectedProduct.blockedDates.push(blockDate);
    }

    setBlockDate("");
    alert("Date blocked successfully (demo)");
  };

  return (
    <AdminLayout>

      {/* HEADER */}
      <div className=" mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Availability Calendar
        </h1>
        <p className="text-gray-600 mt-1">
          Manage rental availability & block dates per product
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — PRODUCT LIST */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Rental Products
          </h2>

          <div className="space-y-3">
            {PRODUCTS.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition
                  ${
                    selectedProduct.id === product.id
                      ? "border-[#8B5C42] bg-[#FFF7F0]"
                      : "border-gray-200 hover:border-gray-400"
                  }
                `}
              >
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">
                  Blocked days: {product.blockedDates.length}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — CALENDAR & BLOCKING */}
        <div className="lg:col-span-2 space-y-6">

          {/* SELECTED PRODUCT */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-2">
              {selectedProduct.name}
            </h2>
            <p className="text-sm text-gray-600">
              Select dates to block for maintenance or internal use
            </p>
          </div>

          {/* DATE BLOCKING */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Block a Date</h3>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="date"
                min={today}
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="border rounded-lg px-4 py-2 w-60"
              />

              <button
                onClick={handleBlockDate}
                className="px-6 py-2 rounded-lg bg-[#8B5C42] text-white hover:bg-[#704A36] transition"
              >
                Block Date
              </button>
            </div>
          </div>

          {/* BLOCKED DATES LIST */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4">
              Blocked Dates
            </h3>

            {selectedProduct.blockedDates.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No blocked dates. Product is fully available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {selectedProduct.blockedDates.map((date) => (
                  <span
                    key={date}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
                  >
                    {date}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </AdminLayout>
  );
};

export default AvailabilityCalendar;
