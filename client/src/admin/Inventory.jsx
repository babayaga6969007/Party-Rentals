import AdminLayout from "./AdminLayout";
import { FiAlertTriangle, FiCalendar, FiEdit } from "react-icons/fi";
import hero1 from "../assets/home2/hero1.png";
import hero2 from "../assets/home2/hero2.png";
import hero3 from "../assets/home2/hero3.png";
import hero4 from "../assets/home2/hero4.png";


const inventoryData = [
  {
    id: 1,
    name: "Backdrop Arch",
    image: hero1,
    type: "Rental",
    totalStock: 10,
    booked: 4,
    maintenance: 1,
    attributes: ["Gold", "Large", "Indoor"],
  },
  {
    id: 2,
    name: "LED Fairy Lights",
    image: hero2,
    type: "Purchase",
    totalStock: 50,
    booked: 0,
    maintenance: 0,
    attributes: ["Warm White"],
  },
  {
    id: 3,
    name: "Luxury Sofa Set",
    image: hero3,
    type: "Rental",
    totalStock: 4,
    booked: 3,
    maintenance: 0,
    attributes: ["Beige", "Premium"],
  },
  {
    id: 4,
    name: "Balloon Stand Kit",
    image: hero4,
    type: "Purchase",
    totalStock: 20,
    booked: 0,
    maintenance: 2,
    attributes: ["Pastel"],
  },
];

const Inventory = () => {
  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="page-wrapper-checkout mb-6">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-1">
          Live stock, rental utilization, availability & maintenance tracking
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Total SKUs" value="24" />
        <SummaryCard title="Rental Items" value="14" />
        <SummaryCard title="Purchase Items" value="10" />
        <SummaryCard title="Low Stock Alerts" value="3" danger />
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F5] border-b">
            <tr className="text-left">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Available</th>
              <th className="px-5 py-4">Utilization</th>
              <th className="px-5 py-4">Attributes</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {inventoryData.map((item) => {
              const available =
                item.totalStock - item.booked - item.maintenance;

              const utilization =
                item.type === "Rental"
                  ? Math.round((item.booked / item.totalStock) * 100)
                  : null;

              const lowStock =
                item.type === "Rental"
                  ? available <= 1
                  : item.totalStock <= 5;

              return (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  {/* PRODUCT */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
  <img
    src={item.image}
    alt={item.name}
    className="w-10 h-10 rounded-md object-cover border border-gray-200"
  />
  <div className="leading-tight">
    <p className="text-sm font-medium text-[#2D2926]">
      {item.name}
    </p>
    <p className="text-xs text-gray-500">
      Total: {item.totalStock} • Booked: {item.booked}
    </p>
  </div>
</div>

                  </td>

                  {/* TYPE */}
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        item.type === "Rental"
                          ? "bg-[#FFF7F0] text-[#8B5C42]"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* AVAILABLE */}
                  <td className="px-5 py-4 font-semibold">
                    {available}
                  </td>

                  {/* UTILIZATION */}
                  <td className="px-5 py-4">
                    {item.type === "Rental" ? (
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{utilization}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              utilization > 70
                                ? "bg-red-500"
                                : utilization > 40
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* ATTRIBUTES */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.attributes.map((a, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#FAF7F5] border rounded-full px-2 py-0.5"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    {lowStock ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <FiAlertTriangle />
                        Low
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">
                        Healthy
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-3 text-[#8B5C42]">
                      <button title="View Calendar">
                        <FiCalendar />
                      </button>
                      <button title="Edit Stock">
                        <FiEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Inventory;

/* ---------- Small UI helpers ---------- */

const SummaryCard = ({ title, value, danger }) => (
  <div
    className={`bg-white border rounded-2xl shadow-sm p-5 ${
      danger ? "border-red-300" : ""
    }`}
  >
    <p className="text-xs text-gray-500">{title}</p>
    <p
      className={`text-2xl font-semibold mt-1 ${
        danger ? "text-red-600" : "text-[#2D2926]"
      }`}
    >
      {value}
    </p>
  </div>
);
