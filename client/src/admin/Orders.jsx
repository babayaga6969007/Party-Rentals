import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { FiEye } from "react-icons/fi";

// ✅ adjust this import path to wherever your api util is
// Example possibilities:
// import { api } from "../utils/api";
// import { api } from "./utils/api";
import { api } from "../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filters (basic)
  const [typeFilter, setTypeFilter] = useState("all"); // all | rental | purchase
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | confirmed | dispatched | completed | cancelled
  const [dateFilter, setDateFilter] = useState(""); // yyyy-mm-dd

  // ✅ IMPORTANT: token function (you must match what your admin login stores)
  const getAdminToken = () => {
  return localStorage.getItem("admin_token") || "";
};


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErr("");

      const token = getAdminToken();

      // Backend exists: GET /api/orders/admin/all :contentReference[oaicite:3]{index=3}
      const res = await api(`/orders/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const serverOrders = res?.orders || [];
      setOrders(serverOrders);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Helpers for row rendering
  const getOrderType = (order) => {
    const hasRental = (order?.items || []).some(
      (it) => String(it?.productType || "").toLowerCase() === "rental"
    );
    const hasSale = (order?.items || []).some(
      (it) => String(it?.productType || "").toLowerCase() === "sale"
    );

    if (hasRental && hasSale) return "Mixed";
    if (hasRental) return "Rental";
    if (hasSale) return "Purchase";
    return "—";
  };

  const getRentalPeriod = (order) => {
    const rentalItem = (order?.items || []).find(
      (it) => String(it?.productType || "").toLowerCase() === "rental"
    );
    if (!rentalItem?.startDate || !rentalItem?.endDate) return "—";
    return `${rentalItem.startDate} → ${rentalItem.endDate}`;
  };

  const getItemsCount = (order) => {
    return (order?.items || []).reduce((sum, it) => sum + (Number(it?.qty) || 0), 0);
  };

  const getTotal = (order) => {
    const total = order?.pricing?.total;
    return typeof total === "number" ? total : 0;
  };

  // Apply filters on client side
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const type = getOrderType(o).toLowerCase(); // rental | purchase | mixed
      const status = String(o?.orderStatus || "").toLowerCase(); // pending/confirmed/...
      const createdAt = o?.createdAt ? new Date(o.createdAt) : null;

      // type filter
      if (typeFilter === "rental" && type !== "rental" && type !== "mixed") return false;
      if (typeFilter === "purchase" && type !== "purchase" && type !== "mixed") return false;

      // status filter
      if (statusFilter !== "all" && status !== statusFilter) return false;

      // date filter (matches createdAt date)
      if (dateFilter && createdAt) {
        const yyyy = createdAt.getFullYear();
        const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
        const dd = String(createdAt.getDate()).padStart(2, "0");
        const asDate = `${yyyy}-${mm}-${dd}`;
        if (asDate !== dateFilter) return false;
      }

      return true;
    });
  }, [orders, typeFilter, statusFilter, dateFilter]);

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2D2926]">Orders</h1>
        <p className="text-gray-600 mt-1">View and manage rental and purchase orders</p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Order Types</option>
          <option value="rental">Rental</option>
          <option value="purchase">Purchase</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          onClick={fetchOrders}
          className="ml-auto bg-[#8B5C42] text-white px-5 py-2 rounded-lg hover:bg-[#704A36] transition"
        >
          Refresh
        </button>
      </div>

      {/* STATES */}
      {loading && (
        <div className="bg-white p-6 rounded-xl border">Loading orders…</div>
      )}

      {!loading && err && (
        <div className="bg-white p-6 rounded-xl border text-red-600">
          {err}
        </div>
      )}

      {/* ORDERS TABLE */}
      {!loading && !err && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F5] border-b">
              <tr className="text-left">
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
              {filteredOrders.map((order) => {
                const id = order?._id || "—";
                const customerName =
                  order?.customer?.name ||
                  order?.customer?.fullName ||
                  order?.customer?.email ||
                  "—";

                const type = getOrderType(order);
                const itemsCount = getItemsCount(order);
                const rentalPeriod = getRentalPeriod(order);
                const total = getTotal(order);
                const status = String(order?.orderStatus || "pending");

                return (
                  <tr
                    key={id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-[#2D2926]">
                      {id}
                    </td>

                    <td className="px-6 py-4">{customerName}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          type === "Rental" || type === "Mixed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {type}
                      </span>
                    </td>

                    <td className="px-6 py-4">{itemsCount}</td>

                    <td className="px-6 py-4">{rentalPeriod}</td>

                    <td className="px-6 py-4 font-semibold">
                      ${Number(total).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === "confirmed" || status === "dispatched"
                            ? "bg-blue-100 text-blue-700"
                            : status === "completed"
                            ? "bg-green-100 text-green-700"
                            : status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-[#8B5C42] hover:opacity-70"
                        title="View Order"
                        onClick={() => {
                          // TODO: if you have a details page, route here:
                          // navigate(`/admin/orders/${id}`)
                          console.log("View order:", id);
                        }}
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-gray-500" colSpan={8}>
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOT NOTE */}
      <p className="text-sm text-gray-500 mt-6">
        Rental orders include date ranges to manage product availability and scheduling.
      </p>
    </AdminLayout>
  );
};

export default Orders;
