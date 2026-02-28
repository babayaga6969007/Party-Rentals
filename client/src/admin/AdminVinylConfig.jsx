import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AdminVinylConfig = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pricePerSqInch, setPricePerSqInch] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api("/vinyl-config");
      if (res?.config) {
        setPricePerSqInch(
          res.config.pricePerSqInch != null && res.config.pricePerSqInch !== ""
            ? String(res.config.pricePerSqInch)
            : ""
        );
      }
    } catch (err) {
      console.error("Vinyl config fetch error:", err);
      setError(err?.message || "Failed to load vinyl configuration");
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    const val = pricePerSqInch === "" ? 0 : Number(pricePerSqInch);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid price (0 or greater).");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Please log in to save.");
        navigate("/admin/login");
        return;
      }
      await api("/vinyl-config/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pricePerSqInch: val }),
      });
      setPricePerSqInch(val === 0 ? "" : String(val));
      toast.success("Vinyl configuration saved.");
    } catch (err) {
      console.error("Vinyl config save error:", err);
      toast.error(err?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-[#2D2926] mb-2">Vinyl Wrap Config</h1>
        <p className="text-sm text-gray-600 mb-6">
          Set the price per square inch for vinyl wrap. Customers will enter the size (width × height in inches) on the product page; the addon price is calculated as <strong>price per sq in × width × height</strong>.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per square inch ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pricePerSqInch}
            onChange={(e) => setPricePerSqInch(e.target.value)}
            placeholder="e.g. 0.50"
            className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 text-[#2D2926] focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-500">
            Example: $0.50 per sq in with 12″ × 24″ = 288 sq in → $144.00 for the vinyl addon.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVinylConfig;
