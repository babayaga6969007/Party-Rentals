import { useMemo, useState } from "react";
import { api } from "../../utils/api";

export default function AdminCreateCoupon({ onCreated }) {
  const [form, setForm] = useState({
    code: "",
    discountType: "percent", // "percent" | "flat"
    discountValue: 10,
    minCartValue: 0,
    usageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const canSubmit = useMemo(() => {
    const codeOk = form.code.trim().length >= 3;
    const valueOk = Number(form.discountValue) > 0;
    const minOk = Number(form.minCartValue) >= 0;
    const usageOk = form.usageLimit === "" || Number(form.usageLimit) > 0;
    return codeOk && valueOk && minOk && usageOk && !saving;
  }, [form, saving]);

  const submit = async () => {
    try {
      setMsg({ type: "", text: "" });
      setSaving(true);

      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Admin token missing. Please login again.");

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minCartValue: Number(form.minCartValue),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        expiryDate: form.expiryDate === "" ? null : form.expiryDate,
      };

      await api("/admin/coupons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setMsg({ type: "success", text: "Coupon created successfully." });

      setForm({
        code: "",
        discountType: "percent",
        discountValue: 10,
        minCartValue: 0,
        usageLimit: "",
        expiryDate: "",
        isActive: true,
      });

      onCreated?.();
    } catch (err) {
      console.error("Failed to create coupon:", err);
      setMsg({ type: "error", text: err.message || "Failed to create coupon" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Create Coupon</h2>
        <span className="text-xs text-gray-500">Codes are stored uppercase</span>
      </div>

      {msg.text && (
        <div
          className={`mb-4 text-sm rounded-xl px-3 py-2 border ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code</label>
          <input
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="e.g. SAVE10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Min 3 characters. No spaces recommended.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
          <select
            className="w-full px-3 py-2 border rounded-xl text-sm"
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          >
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat Amount</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Discount Value {form.discountType === "percent" ? "(%)" : ""}
          </label>
          <input
            className="w-full px-3 py-2 border rounded-xl text-sm"
            type="number"
            min="1"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
          />
          {form.discountType === "percent" && (
            <p className="mt-1 text-xs text-gray-500">Tip: keep between 1–90 to avoid weird totals.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min Cart Value</label>
          <input
            className="w-full px-3 py-2 border rounded-xl text-sm"
            type="number"
            min="0"
            value={form.minCartValue}
            onChange={(e) => setForm({ ...form, minCartValue: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Usage Limit (optional)</label>
          <input
            className="w-full px-3 py-2 border rounded-xl text-sm"
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date (optional)</label>
          <input
            className="w-full px-3 py-2 border rounded-xl text-sm"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="mt-4 w-full md:w-auto px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Creating..." : "Create Coupon"}
      </button>
    </div>
  );
}
