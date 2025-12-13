import AdminLayout from "./AdminLayout";
import {
  FiBox,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";

const stats = [
  {
    title: "Total Revenue",
    value: "$24,500",
    icon: <FiDollarSign />,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Active Rentals",
    value: "12",
    icon: <FiCalendar />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Products",
    value: "86",
    icon: <FiBox />,
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Orders Today",
    value: "5",
    icon: <FiShoppingBag />,
    color: "bg-orange-100 text-orange-700",
  },
];

const upcomingRentals = [
  {
    product: "Backdrop Arch",
    customer: "Emily Watson",
    dates: "Dec 20 – Dec 22",
    status: "Confirmed",
  },
  {
    product: "LED Fairy Lights",
    customer: "John Smith",
    dates: "Dec 24 – Dec 25",
    status: "Pending",
  },
];

const lowStock = [
  { name: "Gold Chiavari Chairs", stock: 2 },
  { name: "White Sofa Set", stock: 1 },
];

const Dashboard = () => {
  return (
    <AdminLayout>

      {/* PAGE TITLE */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of your rental & sales activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full text-xl ${stat.color}`}
            >
              {stat.icon}
            </div>

            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-[#2D2926]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* UPCOMING RENTALS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Upcoming Rentals
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Product</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Dates</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {upcomingRentals.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3 font-medium text-[#2D2926]">
                    {item.product}
                  </td>
                  <td className="py-3">{item.customer}</td>
                  <td className="py-3">{item.dates}</td>
                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          item.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ALERTS / LOW STOCK */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4 flex items-center gap-2">
            <FiAlertCircle />
            Attention Needed
          </h2>

          {lowStock.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-[#2D2926]">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  Low stock warning
                </p>
              </div>

              <span className="text-red-600 font-semibold">
                {item.stock} left
              </span>
            </div>
          ))}
        </div>

      </div>

    </AdminLayout>
  );
};

export default Dashboard;
