import AdminLayout from "./AdminLayout";
import { useEffect, useState } from "react";
import { api } from "../utils/api";




/* ---------------- PAGE ---------------- */

const ActiveRentals = () => {
  const [rentals, setRentals] = useState([]);
const [loading, setLoading] = useState(true);
const fetchActiveRentals = async () => {
  try {
    const token = localStorage.getItem("admin_token");

    const res = await api("/orders/admin/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const orders = res.orders || [];

    // ✅ FILTER LOGIC
    const active = [];

    orders.forEach((order) => {
      // only allowed statuses
      if (!["pending", "confirmed", "dispatched"].includes(order.orderStatus)) {
        return;
      }

      order.items.forEach((item) => {
        if (item.productType === "rental") {
          active.push({
            orderId: order._id,
            product: item.name,
            image: item.image,
            customer: order.customer.name,
            startDate: item.startDate,
            endDate: item.endDate,
            qty: item.qty,
            status: order.orderStatus,
          });
        }
      });
    });

    setRentals(active);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchActiveRentals();
}, []);

  return (
    <AdminLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">
          Active Rentals
        </h1>
        <p className="text-gray-600 mt-1">
          Rentals currently in use by customers
        </p>
      </div>

      {/* ACTIVE RENTALS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F5] border-b">
            <tr className="text-left">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Rental Period</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
{rentals.map((rental, index) => (
              <tr
key={index}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                {/* PRODUCT */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={rental.image}
                      alt={rental.product}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-medium text-[#2D2926]">
                        {rental.product}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rental ID: {rental.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CUSTOMER */}
                <td className="px-6 py-4">
                  {rental.customer}
                </td>

                {/* RENTAL DATES */}
                <td className="px-6 py-4">
                  <p className="font-medium">
                    {rental.startDate}
                  </p>
                  <p className="text-xs text-gray-500">
                    to {rental.endDate}
                  </p>
                </td>

                {/* QTY */}
                <td className="px-6 py-4">
                  {rental.qty}
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
  {rental.status}
</span>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTE */}
      <p className="text-sm text-gray-500 mt-6">
        These items are currently unavailable for new bookings until returned.
      </p>

    </AdminLayout>
  );
};

export default ActiveRentals;
