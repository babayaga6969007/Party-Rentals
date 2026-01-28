import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  FiBox,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";

// ✅ IMPORTANT: use the same api util pattern as your other pages
// In Inventory you used: import { api } from "../utils/api";
import { api } from "../utils/api";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---------- helpers ----------
  const getAdminToken = () => localStorage.getItem("admin_token") || "";

  const isSameLocalDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const formatMoney = (n) => {
    const val = safeNum(n);
    return val.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  // ---------- fetchers ----------
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErr("");

      // 1) products (public)
      const productsRes = await api("/products");
      const serverProducts = productsRes?.products || [];

      // 2) orders (admin-protected)
      const token = getAdminToken();
      const ordersRes = await api("/orders/admin/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const serverOrders = ordersRes?.orders || [];

      setProducts(serverProducts);
      setOrders(serverOrders);
    } catch (e) {
      console.error("Dashboard load failed:", e);
      setErr(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  // ---------- computed: low stock (same logic as Inventory page) ----------
  const lowStockList = useMemo(() => {
    const low = (products || [])
      .map((p) => {
        const stock = p?.availabilityCount ?? 0;
        const isLow =
          p?.productType === "rental" ? stock <= 1 : stock <= 5; // sale
        return isLow ? { name: p?.title || "—", stock } : null;
      })
      .filter(Boolean)
      .slice(0, 6); // show only first 6

    return low;
  }, [products]);

  // ---------- computed: upcoming rentals from orders ----------
  const upcomingRentals = useMemo(() => {
    const today = new Date();

    const rentals = (orders || [])
      .map((o) => {
        const items = o?.items || [];
        const rentalItem = items.find(
          (it) => String(it?.productType || "").toLowerCase() === "rental"
        );

        if (!rentalItem?.startDate || !rentalItem?.endDate) return null;

        // Parse yyyy-mm-dd safely into a Date
        const start = new Date(`${rentalItem.startDate}T00:00:00`);
        const end = new Date(`${rentalItem.endDate}T00:00:00`);

        // Keep future or ongoing rentals
        if (end < today) return null;

        return {
          orderId: o?._id || "",
          product: rentalItem?.name || "—",
          customer:
            o?.customer?.name ||
            o?.customer?.fullName ||
            o?.customer?.email ||
            "—",
          startDate: rentalItem.startDate,
          endDate: rentalItem.endDate,
          status: (o?.orderStatus || "pending").toLowerCase(),
          startObj: start,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.startObj - b.startObj)
      .slice(0, 8);

    // Convert dates string like "2026-01-28" → "2026-01-28 – 2026-01-30"
    return rentals.map((r) => ({
      ...r,
      dates: `${r.startDate} – ${r.endDate}`,
    }));
  }, [orders]);

  // ---------- computed: stats ----------
  const stats = useMemo(() => {
    const today = new Date();

    // Total Revenue (sum pricing.total for all orders except cancelled)
    const totalRevenue = (orders || [])
      .filter((o) => String(o?.orderStatus || "").toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + safeNum(o?.pricing?.total), 0);

    // Products count
const productsCount = (products || []).filter((p) => {
  return Number(p?.availabilityCount || 0) > 0;
}).length;

    // Orders Today (by createdAt date)
    const ordersToday = (orders || []).filter((o) => {
      if (!o?.createdAt) return false;
      const created = new Date(o.createdAt);
      return isSameLocalDay(created, today);
    }).length;

    // Active Rentals:
    // - order has at least one rental item with an endDate >= today
    // - status confirmed OR dispatched
    const activeRentals = (orders || []).filter((o) => {
      const status = String(o?.orderStatus || "").toLowerCase();
      if (!["confirmed", "dispatched"].includes(status)) return false;

      const rentalItem = (o?.items || []).find(
        (it) => String(it?.productType || "").toLowerCase() === "rental"
      );
      if (!rentalItem?.endDate) return false;

      const end = new Date(`${rentalItem.endDate}T00:00:00`);
      return end >= today;
    }).length;

    return [
      {
        title: "Total Revenue",
        value: formatMoney(totalRevenue),
        icon: <FiDollarSign />,
        color: "bg-green-100 text-green-700",
      },
      {
        title: "Active Rentals",
        value: String(activeRentals),
        icon: <FiCalendar />,
        color: "bg-blue-100 text-blue-700",
      },
      {
        title: "Products",
        value: String(productsCount),
        icon: <FiBox />,
        color: "bg-purple-100 text-purple-700",
      },
      {
        title: "Orders Today",
        value: String(ordersToday),
        icon: <FiShoppingBag />,
        color: "bg-orange-100 text-orange-700",
      },
    ];
  }, [orders, products]);

  // ---------- UI ----------
  return (
    <AdminLayout>
      {/* PAGE TITLE */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#2D2926]">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Overview of your rental & sales activity
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="bg-[#8B5C42] text-white px-5 py-2 rounded-lg hover:bg-[#704A36] transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* STATES */}
      {loading && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-gray-600">
          Loading dashboard…
        </div>
      )}

      {!loading && err && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-red-600">
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
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

              {upcomingRentals.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No upcoming/active rentals found.
                </div>
              ) : (
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
                      <tr key={item.orderId || index} className="border-b last:border-0">
                        <td className="py-3 font-medium text-[#2D2926]">
                          {item.product}
                        </td>
                        <td className="py-3">{item.customer}</td>
                        <td className="py-3">{item.dates}</td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "confirmed" ||
                              item.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "dispatched"
                                ? "bg-blue-100 text-blue-700"
                                : item.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ALERTS / LOW STOCK */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-semibold text-[#2D2926] mb-4 flex items-center gap-2">
                <FiAlertCircle />
                Attention Needed
              </h2>

              {lowStockList.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No low stock alerts right now.
                </div>
              ) : (
                lowStockList.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex justify-between items-center py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#2D2926]">{item.name}</p>
                      <p className="text-sm text-gray-500">Low stock warning</p>
                    </div>

                    <span className="text-red-600 font-semibold">
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
