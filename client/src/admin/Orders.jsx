import AdminLayout from "./AdminLayout";
import { FiEye } from "react-icons/fi";

/* ---------------- DEMO DATA ---------------- */

const orders = [
  {
    id: "ORD-1001",
    customer: "Emily Watson",
    type: "Rental",
    items: 3,
    rentalPeriod: "Dec 20 – Dec 22",
    total: 1200,
    status: "Confirmed",
    createdAt: "Dec 10, 2025",
  },
  {
    id: "ORD-1002",
    customer: "John Smith",
    type: "Rental",
    items: 1,
    rentalPeriod: "Dec 24 – Dec 25",
    total: 450,
    status: "Pending",
    createdAt: "Dec 11, 2025",
  },
  {
    id: "ORD-1003",
    customer: "Sarah Lee",
    type: "Purchase",
    items: 5,
    rentalPeriod: "—",
    total: 980,
    status: "Completed",
    createdAt: "Dec 9, 2025",
  },
];

/* ---------------- PAGE ---------------- */

const Orders = () => {
  return (
    <AdminLayout>

      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Orders
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage rental and purchase orders
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>All Order Types</option>
          <option>Rental</option>
          <option>Purchase</option>
        </select>

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>All Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <button className="ml-auto bg-[#8B5C42] text-white px-5 py-2 rounded-lg hover:bg-[#704A36] transition">
          Apply Filters
        </button>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F5] border-b">
            <tr className="text-left text-[#2D2926]">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Rental Period</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-[#2D2926]">
                  {order.id}
                </td>

                <td className="px-6 py-4">
                  {order.customer}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        order.type === "Rental"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {order.type}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {order.items}
                </td>

                <td className="px-6 py-4">
                  {order.rentalPeriod}
                </td>

                <td className="px-6 py-4 font-semibold">
                  ${order.total}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        order.status === "Confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    className="text-[#8B5C42] hover:opacity-70"
                    title="View Order"
                  >
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOT NOTE */}
      <p className="text-sm text-gray-500 mt-6">
        Rental orders include date ranges to manage product availability
        and scheduling conflicts.
      </p>

    </AdminLayout>
  );
};

export default Orders;
