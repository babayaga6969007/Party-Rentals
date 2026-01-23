import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { FiEye } from "react-icons/fi";
import ConfirmDeleteModal from "../components/admin/ConfirmDeleteModal";


import { api } from "../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusDraft, setStatusDraft] = useState({});

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, orderId: null });

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await api(`/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // 🔑 IMPORTANT: backend returns { order }
      const updatedOrder = res.order;

      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };


  const handleDeleteClick = (orderId) => {
    setDeleteConfirm({ isOpen: true, orderId });
  };

  const handleDeleteConfirm = async () => {
    const orderId = deleteConfirm.orderId;
    if (!orderId) return;

    try {
      const token = localStorage.getItem("admin_token");

      await api(`/orders/admin/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setDeleteConfirm({ isOpen: false, orderId: null });
      toast.success("Order deleted successfully");
    } catch (err) {
      console.error(err);
      setDeleteConfirm({ isOpen: false, orderId: null });
      toast.error("Failed to delete order");
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await api(`/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedOrder(res.order);
    } catch {
      toast.error("Failed to load order details");
    }
  };


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

      const initialStatus = {};
      serverOrders.forEach((o) => {
        initialStatus[o._id] = o.orderStatus || "pending";
      });
      setStatusDraft(initialStatus);
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
    const items = order?.items || [];
    const hasRental = items.some(
      (it) => String(it?.productType || "").toLowerCase() === "rental"
    );
    const hasPurchase = items.some(
      (it) => String(it?.productType || "").toLowerCase() === "purchase"
    );
    const hasSignage = items.some(
      (it) => String(it?.productType || "").toLowerCase() === "signage"
    );

    // Count how many types are present
    const typeCount = [hasRental, hasPurchase, hasSignage].filter(Boolean).length;

    // If more than one type, it's Mixed
    if (typeCount > 1) return "Mixed";
    if (hasRental) return "Rental";
    if (hasPurchase) return "Purchase";
    if (hasSignage) return "Signage";
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

  const getOrderAmounts = (order) => {
    return {
      total: order?.pricing?.total ?? 0,
      paid: order?.amountPaid ?? 0,
      due: order?.amountDue ?? 0,
      paymentType: order?.paymentType ?? "FULL",
    };
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
      if (typeFilter === "signage" && type !== "signage" && type !== "mixed") return false;

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
          <option value="signage">Signage</option>
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
                <th className="px-6 py-4">Item Types</th>
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
                const { total, paid, due, paymentType } = getOrderAmounts(order);

                // Get item types for display
                const itemTypes = (order?.items || []).map(item => {
                  const pt = String(item?.productType || "").toLowerCase();
                  if (pt === "rental") return "Rental";
                  if (pt === "purchase") return "Purchase";
                  if (pt === "signage") return "Signage";
                  return pt;
                });
                const uniqueItemTypes = [...new Set(itemTypes)];

                return (
                  <tr
                    key={id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-[#2D2926]">
                      <span
                        className="underline decoration-dotted"
                        title={id}
                      >
                        {id.substring(0, 3)}...
                      </span>
                    </td>

                    <td className="px-6 py-4">{customerName}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${type === "Rental" || type === "Mixed"
                          ? "bg-blue-100 text-blue-700"
                          : type === "Signage"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>{itemsCount}</div>
                      {/* Show addons count if any (excluding shelvings) */}
                      {(() => {
                        const addonsCount = (order?.items || []).reduce((sum, item) => {
                          if (item.addons && Array.isArray(item.addons)) {
                            // Exclude shelvings from count
                            const nonShelvingAddons = item.addons.filter(a => 
                              !a.name?.toLowerCase().includes("shelving") && 
                              !a.name?.toLowerCase().includes("shelf")
                            );
                            return sum + nonShelvingAddons.length;
                          }
                          return sum;
                        }, 0);
                        if (addonsCount > 0) {
                          return (
                            <div className="text-xs text-gray-500 mt-1">
                              <span>+{addonsCount} addon{addonsCount > 1 ? 's' : ''}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {uniqueItemTypes.map((itemType, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-xs ${itemType === "Rental"
                              ? "bg-blue-100 text-blue-700"
                              : itemType === "Signage"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                              }`}
                          >
                            {itemType}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">{rentalPeriod}</td>

                    <td className="px-6 py-4 font-semibold">
                      <div>${Number(total).toFixed(2)}</div>

                      {paymentType === "PARTIAL_60" && (
                        <div className="text-xs text-gray-500">
                          Paid: <span className="text-green-600">${paid.toFixed(2)}</span><br />
                          Due: <span className="text-red-600">${due.toFixed(2)}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        className="border rounded-lg px-3 py-1 text-xs"
                        value={statusDraft[order._id] || "pending"}
                        onChange={(e) => {
                          const newStatus = e.target.value;

                          setStatusDraft((prev) => ({
                            ...prev,
                            [order._id]: newStatus,
                          }));

                          updateStatus(order._id, newStatus);
                        }}
                      >


                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>


                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openOrderDetails(id)}
                          className="text-[#8B5C42] hover:text-[#704A36] transition"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(id)}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-gray-500" colSpan={9}>
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
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl my-8 rounded-xl shadow-xl">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-semibold text-2xl text-[#2D2926]">Order Details</h2>
                <p className="text-sm text-gray-500 mt-1">Order ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedOrder.customer?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedOrder.customer?.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{selectedOrder.customer?.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 font-medium">{selectedOrder.customer?.addressLine || "—"}</span>
                  </div>
                  {selectedOrder.customer?.city && (
                    <div>
                      <span className="text-gray-600">City:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customer.city}</span>
                    </div>
                  )}
                  {selectedOrder.customer?.state && (
                    <div>
                      <span className="text-gray-600">State:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customer.state}</span>
                    </div>
                  )}
                  {selectedOrder.customer?.postalCode && (
                    <div>
                      <span className="text-gray-600">Postal Code:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customer.postalCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              {selectedOrder.delivery && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {selectedOrder.delivery.deliveryDate && (
                      <div>
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="ml-2 font-medium">{selectedOrder.delivery.deliveryDate}</span>
                        {selectedOrder.delivery.deliveryTime && (
                          <span className="ml-2 text-gray-500">({selectedOrder.delivery.deliveryTime})</span>
                        )}
                      </div>
                    )}
                    {selectedOrder.delivery.pickupDate && (
                      <div>
                        <span className="text-gray-600">Pickup Date:</span>
                        <span className="ml-2 font-medium">{selectedOrder.delivery.pickupDate}</span>
                        {selectedOrder.delivery.pickupTime && (
                          <span className="ml-2 text-gray-500">({selectedOrder.delivery.pickupTime})</span>
                        )}
                      </div>
                    )}
                    {selectedOrder.delivery.services && (
                      <>
                        {selectedOrder.delivery.services.stairs && (
                          <div>
                            <span className="text-gray-600">Stairs Service:</span>
                            <span className="ml-2 font-medium text-green-600">Yes</span>
                          </div>
                        )}
                        {selectedOrder.delivery.services.setup && (
                          <div>
                            <span className="text-gray-600">Setup Service:</span>
                            <span className="ml-2 font-medium text-green-600">Yes</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Order Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">{item.name}</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.productType === "rental"
                              ? "bg-blue-100 text-blue-700"
                              : item.productType === "signage"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                              }`}>
                              {item.productType?.toUpperCase() || "PURCHASE"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Quantity: {item.qty}</p>
                            <p>Unit Price: ${item.unitPrice?.toFixed(2) || "0.00"}</p>
                            {item.productType === "rental" && item.days && (
                              <p>Days: {item.days}</p>
                            )}
                            {item.productType === "rental" && item.startDate && item.endDate && (
                              <p className="text-blue-600">
                                Period: {item.startDate} → {item.endDate}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-[#2D2926]">${item.lineTotal?.toFixed(2) || "0.00"}</p>
                        </div>
                      </div>

                      {/* Signage Details */}
                      {item.productType === "signage" && item.signageData && (
                        <div className="mt-3 pt-3 border-t bg-purple-50 p-3 rounded">
                          <p className="font-medium text-sm mb-3 text-purple-900">Signage Details:</p>

                          {/* Preview Image */}
                          {item.image && (
                            <div className="mb-3">
                              <p className="font-medium text-xs mb-2 text-purple-900">Preview:</p>
                              <img
                                src={item.image}
                                alt="Signage preview"
                                className="max-w-full max-h-64 rounded-lg border-2 border-purple-200 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Text Content */}
                          <div>
                            <p className="text-xs font-semibold text-purple-800 mb-2">Text Content:</p>
                            <div className="text-sm text-gray-700 bg-white p-3 rounded">
                              {(() => {
                                const textContent = item.signageData.textContent;
                                const texts = item.signageData.texts;
                                
                                // Try to extract text from various formats
                                let textLines = [];
                                
                                if (textContent && textContent.trim()) {
                                  // If textContent exists, split by newlines
                                  textLines = textContent.split('\n').filter(line => line.trim());
                                } else if (texts && Array.isArray(texts) && texts.length > 0) {
                                  // Handle array of strings or objects
                                  textLines = texts
                                    .map(t => {
                                      if (typeof t === 'string') return t.trim();
                                      if (typeof t === 'object' && t !== null) {
                                        return (t.content || t.text || t.value || '').trim();
                                      }
                                      return String(t || '').trim();
                                    })
                                    .filter(Boolean);
                                }
                                
                                if (textLines.length > 0) {
                                  return (
                                    <div className="space-y-1">
                                      {textLines.map((line, idx) => (
                                        <p key={idx} className="pl-2 border-l-2 border-purple-300">{line}</p>
                                      ))}
                                    </div>
                                  );
                                } else {
                                  return <p className="text-gray-500 italic">No text content provided</p>;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Add-ons Details */}
                      {(() => {
                        // Try multiple ways to access addons
                        const addons = item.addons || [];
                        const addonsArray = Array.isArray(addons) ? addons : [];
                        
                        if (addonsArray.length > 0) {
                          return (
                            <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                              <p className="font-medium text-sm mb-3 text-blue-900">Add-ons ({addonsArray.length})</p>
                              <div className="space-y-3">
                                {addonsArray.map((addon, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border border-blue-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-semibold text-sm text-blue-900">{addon.name || "Unnamed Add-on"}</p>
                                        <p className="text-xs text-gray-600">Price: ${addon.price?.toFixed(2) || "0.00"}</p>
                                      </div>
                                    </div>

                                    {/* Signage Text */}
                                    {addon.signageText && (
                                      <div className="mt-2 text-xs">
                                        <span className="font-medium text-gray-700">Signage Text:</span>
                                        <p className="text-gray-600 mt-1">{addon.signageText}</p>
                                      </div>
                                    )}

                                    {/* Vinyl Wrap */}
                                    {(addon.vinylColor || addon.vinylHex) && (
                                      <div className="mt-2 text-xs">
                                        <span className="font-medium text-gray-700">Vinyl Color:</span>
                                        <div className="flex items-center gap-2 mt-1">
                                          {addon.vinylHex && (
                                            <span
                                              className="inline-block w-5 h-5 rounded border border-gray-400"
                                              style={{ backgroundColor: addon.vinylHex }}
                                            ></span>
                                          )}
                                          <span className="text-gray-600">
                                            {addon.vinylColor === "custom" ? `Custom (${addon.vinylHex})` : addon.vinylColor}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Shelving Data */}
                                    {addon.shelvingData && (
                                      <div className="mt-2 text-xs">
                                        <span className="font-medium text-gray-700">Shelving Configuration:</span>
                                        <div className="text-gray-600 mt-1 space-y-1">
                                          <p><span className="font-medium">Tier:</span> {addon.shelvingData.tier || "—"}</p>
                                          {addon.shelvingData.size && (
                                            <p><span className="font-medium">Size:</span> {addon.shelvingData.size}</p>
                                          )}
                                          {addon.shelvingData.quantity > 0 && (
                                            <p><span className="font-medium">Quantity:</span> {addon.shelvingData.quantity} shelf(s)</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Show message if no addons but item is rental (for debugging) */}
                      {item.productType === "rental" && (!item.addons || !Array.isArray(item.addons) || item.addons.length === 0) && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-400 italic">
                          No add-ons selected for this rental item
                        </div>
                      )}

                      {/* Item Image */}
                      {item.image && item.productType !== "signage" && (
                        <div className="mt-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-w-32 max-h-32 rounded border object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              {selectedOrder.pricing && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Pricing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${selectedOrder.pricing.subtotal?.toFixed(2) || "0.00"}</span>
                    </div>
                    {selectedOrder.pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${selectedOrder.pricing.discount?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}
                    {selectedOrder.pricing.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-medium">${selectedOrder.pricing.deliveryFee?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}
                    {selectedOrder.pricing.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">${selectedOrder.pricing.tax?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}
                    {selectedOrder.pricing.extraFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extra Fees:</span>
                        <span className="font-medium">${selectedOrder.pricing.extraFees?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-[#8B5C42]">${selectedOrder.pricing.finalTotal?.toFixed(2) || selectedOrder.pricing.total?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {selectedOrder.stripePayment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Payment Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-600">Method:</span> <span className="font-medium ml-2">{selectedOrder.paymentMethod || "Stripe"}</span></p>
                    {selectedOrder.stripePayment.paymentIntentId && (
                      <p><span className="text-gray-600">Payment Intent ID:</span> <span className="font-medium ml-2 font-mono text-xs">{selectedOrder.stripePayment.paymentIntentId}</span></p>
                    )}
                    <p>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${selectedOrder.stripePayment.status === "succeeded"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.stripePayment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {selectedOrder.stripePayment.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Order Status & Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-[#2D2926]">Order Status</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${selectedOrder.orderStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : selectedOrder.orderStatus === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : selectedOrder.orderStatus === "dispatched"
                          ? "bg-purple-100 text-purple-700"
                          : selectedOrder.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {selectedOrder.orderStatus?.toUpperCase() || "PENDING"}
                    </span>
                  </p>
                  {selectedOrder.notes && (
                    <div>
                      <span className="text-gray-600">Notes:</span>
                      <p className="mt-1 text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                  {selectedOrder.createdAt && (
                    <p>
                      <span className="text-gray-600">Order Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, orderId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone and all order data will be permanently removed."
      />
    </AdminLayout>
  );
};

export default Orders;