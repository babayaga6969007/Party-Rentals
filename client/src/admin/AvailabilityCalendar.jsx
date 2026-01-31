import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import io from "socket.io-client";
import { FiEye } from "react-icons/fi";
import toast from "react-hot-toast";


/* =========================
   SOCKET URL
========================= */
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

/* =========================
   DATE HELPERS
========================= */
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toYM = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// Sunday → Saturday grid
const getMonthGrid = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const days = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

export default function AvailabilityCalendar() {
  /* =========================
     STATE
  ========================= */
  const [viewDate, setViewDate] = useState(() => new Date());
  const [calendarMap, setCalendarMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const monthKey = useMemo(() => toYM(viewDate), [viewDate]);
  const gridDays = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  /* =========================
     FETCH CALENDAR DATA
  ========================= */
  const fetchCalendar = async () => {
    // 🔍 Open full order details (reuse Orders page logic)
const openOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem("admin_token");

    const res = await api(`/orders/admin/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSelectedOrder(res.order);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load order details");
  }
};


    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await api(
        `/orders/admin/rentals/calendar?month=${monthKey}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCalendarMap(res.days || {});
    } catch (err) {
      console.error("Calendar fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };
// 🔍 Open full order details (used by 👁 icon)
const openOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem("admin_token");

    const res = await api(`/orders/admin/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSelectedOrder(res.order);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load order details");
  }
};

  /* =========================
     INITIAL + MONTH CHANGE
  ========================= */
  useEffect(() => {
    fetchCalendar();
    setSelectedDay(null);
  }, [monthKey]);

  /* =========================
     REALTIME SOCKET SYNC
  ========================= */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("orders:changed", () => {
      fetchCalendar();
    });

    return () => {
      socket.disconnect();
    };
  }, [monthKey]);

  /* =========================
     HANDLERS
  ========================= */
  const goPrev = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const goNext = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectedBookings = selectedDay
    ? calendarMap[selectedDay] || []
    : [];

  /* =========================
     UI
  ========================= */
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Availability Calendar
          </h1>
          <p className="text-sm text-gray-600">
            Dates with dots indicate booked rental items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="px-3 py-1 border rounded"
          >
            ←
          </button>
          <span className="font-medium">{monthKey}</span>
          <button
            onClick={goNext}
            className="px-3 py-1 border rounded"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= CALENDAR ================= */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4">
          <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-500">Loading calendar...</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {gridDays.map((date) => {
                const ymd = toYMD(date);
                const inMonth = toYM(date) === monthKey;
                const bookings = calendarMap[ymd] || [];
                const isSelected = selectedDay === ymd;

                return (
                  <button
                    key={ymd}
                    onClick={() => setSelectedDay(ymd)}
                    className={`relative h-20 p-2 border rounded text-left
                      ${!inMonth ? "bg-gray-50 text-gray-400" : ""}
                      ${isSelected ? "ring-2 ring-blue-500" : ""}
                    `}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        {date.getDate()}
                      </span>

                      {bookings.length > 0 && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1" />
                      )}
                    </div>

                    {bookings.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {bookings.length} booking(s)
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= DETAILS ================= */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">
            {selectedDay
              ? `Bookings on ${selectedDay}`
              : "Select a date"}
          </h2>

          {!selectedDay ? (
            <p className="text-sm text-gray-600">
              Click a date to view booked items
            </p>
          ) : selectedBookings.length === 0 ? (
            <p className="text-sm text-gray-600">
              No bookings on this date
            </p>
          ) : (
            <div className="space-y-3">
           
             {selectedBookings.map((b, i) => (
  <div
    key={i}
    className="flex gap-3 border rounded p-2 items-start"
  >
    {/* Product image */}
    <img
      src={b.image}
      alt={b.name}
      className="w-12 h-12 object-cover rounded"
    />

    {/* Product info */}
    <div className="flex-1 text-sm">
      <div className="font-medium">{b.name}</div>
      <div className="text-gray-600">Qty: {b.qty}</div>
      <div className="text-xs text-gray-500">
        {b.startDate} → {b.endDate}
      </div>
      <div className="text-xs capitalize mt-1">
        Status: {b.status}
      </div>
    </div>

    {/* 👁 View full order */}
    <button
      onClick={() => openOrderDetails(b.orderId)}
      className="text-[#8B5C42] hover:text-[#704A36] transition mt-1"
      title="View full order"
    >
      <FiEye />
    </button>
  </div>
))}

            </div>
          )}
        </div>
      </div>
      {/* ================= ORDER DETAILS MODAL ================= */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-y-auto">
    <div className="bg-white w-full max-w-4xl my-8 rounded-xl shadow-xl">
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="font-semibold text-2xl text-[#2D2926]">
            Order Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Order ID: {selectedOrder._id}
          </p>
        </div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Customer Information</h3>
          <div className="text-sm space-y-1">
            <p><b>Name:</b> {selectedOrder.customer?.name || "—"}</p>
            <p><b>Email:</b> {selectedOrder.customer?.email || "—"}</p>
            <p><b>Phone:</b> {selectedOrder.customer?.phone || "—"}</p>
            <p><b>Address:</b> {selectedOrder.customer?.addressLine || "—"}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="font-semibold mb-3">
            Order Items ({selectedOrder.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {selectedOrder.items?.map((item, i) => (
              <div key={i} className="border rounded p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.qty} • {item.productType}
                </p>
                {item.startDate && item.endDate && (
                  <p className="text-sm text-blue-600">
                    {item.startDate} → {item.endDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <b>Status:</b>{" "}
            <span className="capitalize">{selectedOrder.orderStatus}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Created:{" "}
            {new Date(selectedOrder.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

    </AdminLayout>
  );
}
