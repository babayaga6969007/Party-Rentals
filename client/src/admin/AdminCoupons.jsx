import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api"; // ✅ adjust if your path differs
import AdminCreateCoupon from "./components/AdminCreateCoupon";

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString();
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  const dt = new Date(expiryDate);
  if (Number.isNaN(dt.getTime())) return false;
  // expire end-of-day local-ish
  const now = new Date();
  return dt.getTime() < now.getTime();
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState({ open: false, coupon: null });

  const token = localStorage.getItem("admin_token");

  const fetchCoupons = async () => {
    try {
      setError("");
      setLoading(true);

      if (!token) throw new Error("Admin token missing. Please login again.");

      const res = await api("/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // supports either {coupons:[...]} or [...]
      const list = Array.isArray(res) ? res : res?.coupons || [];
      setCoupons(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase();
    if (!query) return coupons;

    return coupons.filter((c) => {
      const code = (c.code || "").toUpperCase();
      return code.includes(query);
    });
  }, [q, coupons]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert(`Copied: ${code}`);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const toggleActive = async (c) => {
    try {
      setBusyId(c._id);

      await api(`/admin/coupons/${c._id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCoupons();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to toggle coupon");
    } finally {
      setBusyId(null);
    }
  };

  const deleteCoupon = async (c) => {
    try {
      setBusyId(c._id);

      await api(`/admin/coupons/${c._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfirm({ open: false, coupon: null });
      await fetchCoupons();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete coupon");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">
            Create, search, enable/disable, and delete coupons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code (e.g. SAVE)"
            className="w-full md:w-72 px-3 py-2 border rounded-xl text-sm"
          />
          <button
            onClick={fetchCoupons}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Create */}
      <AdminCreateCoupon onCreated={fetchCoupons} />

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Existing Coupons
          </h2>
          <span className="text-xs text-gray-500">
            Showing {filtered.length} / {coupons.length}
          </span>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-gray-500">Loading coupons...</div>
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600">No coupons found.</p>
            <p className="text-xs text-gray-500 mt-1">
              Create one above, or clear your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Code</th>
                  <th className="text-left px-5 py-3 font-medium">Discount</th>
                  <th className="text-left px-5 py-3 font-medium">Min Cart</th>
                  <th className="text-left px-5 py-3 font-medium">Usage</th>
                  <th className="text-left px-5 py-3 font-medium">Expiry</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((c) => {
                  const expired = isExpired(c.expiryDate);
                  const used = c.usedCount ?? 0;
                  const limit = c.usageLimit ?? null;

                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tracking-wide">
                            {(c.code || "").toUpperCase()}
                          </span>
                          <button
                            className="text-xs px-2 py-1 rounded-lg border hover:bg-white"
                            onClick={() => copyCode((c.code || "").toUpperCase())}
                            type="button"
                          >
                            Copy
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {c.discountType === "percent"
                          ? `${c.discountValue}%`
                          : `$${c.discountValue}`}
                      </td>

                      <td className="px-5 py-3">
                        {c.minCartValue ? `$${c.minCartValue}` : "—"}
                      </td>

                      <td className="px-5 py-3">
                        {limit ? `${used} / ${limit}` : `${used} / ∞`}
                      </td>

                      <td className="px-5 py-3">{formatDate(c.expiryDate)}</td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                            expired
                              ? "bg-red-50 border-red-200 text-red-700"
                              : c.isActive
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-gray-100 border-gray-200 text-gray-700"
                          }`}
                        >
                          {expired ? "Expired" : c.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleActive(c)}
                            disabled={busyId === c._id}
                            className="px-3 py-2 rounded-xl border text-xs hover:bg-gray-50 disabled:opacity-60"
                          >
                            {c.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirm({ open: true, coupon: c })}
                            disabled={busyId === c._id}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs hover:bg-red-50 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirm.open && confirm.coupon && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Delete coupon?</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will permanently delete{" "}
              <span className="font-semibold">{confirm.coupon.code}</span>.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm({ open: false, coupon: null })}
                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deleteCoupon(confirm.coupon)}
                disabled={busyId === confirm.coupon._id}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {busyId === confirm.coupon._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
