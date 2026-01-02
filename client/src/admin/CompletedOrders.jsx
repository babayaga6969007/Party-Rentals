import AdminLayout from "./AdminLayout";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

const CompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await api("/orders/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = res.orders || [];
      const completed = [];

      orders.forEach((order) => {
        // ✅ ONLY completed orders
        if (order.orderStatus !== "completed") return;

        
       order.items.forEach((item) => {
  completed.push({
    orderId: order._id,
    product: item.name,
    image: item.image,
    customer: order.customer?.name || "—",
    startDate: item.productType === "rental" ? item.startDate : "—",
    endDate: item.productType === "rental" ? item.endDate : "—",
    qty: item.qty,
    total: item.lineTotal,
    type: item.productType, // 👈 optional but useful
  });
});

      });

      setCompletedOrders(completed);
    } catch (err) {
      console.error("Failed to fetch completed orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

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

      {/* TABLE / LOADING */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading completed orders...
          </div>
        ) : (
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
                  key={order.orderId}
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
                          Order ID: {order.orderId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CUSTOMER */}
                  <td className="px-6 py-4">
                    {order.customer}
                  </td>

                  {/* RENTAL PERIOD */}
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

              {completedOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No completed rental orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default CompletedOrders;
