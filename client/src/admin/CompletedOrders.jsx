import AdminLayout from "./AdminLayout";

/* Demo Images */
import hero1 from "../assets/home2/hero1.png";
import hero2 from "../assets/home2/hero2.png";
import hero3 from "../assets/home2/hero3.png";
import hero4 from "../assets/home2/hero4.png";

/* ---------------- DEMO DATA ---------------- */

const completedOrders = [
  {
    id: "CO-3001",
    product: "Backdrop Arch",
    image: hero1,
    customer: "Emily Watson",
    startDate: "Dec 10, 2025",
    endDate: "Dec 12, 2025",
    qty: 1,
    total: 1200,
  },
  {
    id: "CO-3002",
    product: "LED Fairy Lights",
    image: hero2,
    customer: "John Smith",
    startDate: "Dec 08, 2025",
    endDate: "Dec 11, 2025",
    qty: 3,
    total: 900,
  },
  {
    id: "CO-3003",
    product: "Birthday Banner Set",
    image: hero3,
    customer: "Sophia Lee",
    startDate: "Dec 05, 2025",
    endDate: "Dec 06, 2025",
    qty: 2,
    total: 450,
  },
  {
    id: "CO-3004",
    product: "Luxury Sofa Set",
    image: hero4,
    customer: "Daniel Brown",
    startDate: "Dec 01, 2025",
    endDate: "Dec 03, 2025",
    qty: 1,
    total: 1800,
  },
  {
    id: "CO-3005",
    product: "Wedding Floral Stand",
    image: hero1,
    customer: "Isabella Turner",
    startDate: "Nov 28, 2025",
    endDate: "Nov 30, 2025",
    qty: 2,
    total: 1600,
  },
  {
    id: "CO-3006",
    product: "Cocktail Table Set",
    image: hero2,
    customer: "Michael Adams",
    startDate: "Nov 25, 2025",
    endDate: "Nov 26, 2025",
    qty: 4,
    total: 1100,
  },
];

/* ---------------- PAGE ---------------- */

const CompletedOrders = () => {
  return (
    <AdminLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Completed Orders
        </h1>
        <p className="text-gray-600 mt-1">
          Rentals that have been returned and closed
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F5] border-b">
            <tr className="text-left">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Rental Period</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {completedOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                {/* PRODUCT */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={order.image}
                      alt={order.product}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-medium text-[#2D2926]">
                        {order.product}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order ID: {order.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CUSTOMER */}
                <td className="px-6 py-4">
                  {order.customer}
                </td>

                {/* DATES */}
                <td className="px-6 py-4">
                  <p className="font-medium">{order.startDate}</p>
                  <p className="text-xs text-gray-500">
                    to {order.endDate}
                  </p>
                </td>

                {/* QTY */}
                <td className="px-6 py-4">
                  {order.qty}
                </td>

                {/* TOTAL */}
                <td className="px-6 py-4 font-semibold">
                  ${order.total}
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
};

export default CompletedOrders;
