import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const DEBOUNCE_MS = 600;

const AdminSignageConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pricePerSqInch, setPricePerSqInch] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [widthFt, setWidthFt] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [savingDimensions, setSavingDimensions] = useState(false);
  const initialLoadRef = useRef(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("admin_token");

      if (!token) {
        setError("Admin authentication required. Please log in again.");
        setLoading(false);
        toast.error("Please log in to access this page");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
        return;
      }

      const res = await api("/signage-config/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.config) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setConfig(res.config);
      setError("");
      setPricePerSqInch(
        res.config.pricePerSqInch != null && res.config.pricePerSqInch !== ""
          ? String(res.config.pricePerSqInch)
          : ""
      );
      setWidthFt(res.config.widthFt != null ? String(res.config.widthFt) : "4");
      setHeightFt(res.config.heightFt != null ? String(res.config.heightFt) : "8");
    } catch (err) {
      console.error("Config fetch error:", err);
      const raw = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? "Failed to load configuration";
      const errorMessage = typeof raw === "string" ? raw : JSON.stringify(raw);

      const isAuthError =
        err?.response?.status === 401 ||
        err?.response?.status === 400 ||
        (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("invalid token")) ||
        (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("no token"));
      if (isAuthError) {
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Redirecting to login...");
        localStorage.removeItem("admin_token");
        setTimeout(() => navigate("/admin/login"), 2000);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Debounced real-time save for signage dimensions
  useEffect(() => {
    if (!config) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    const w = Number(widthFt);
    const h = Number(heightFt);
    if (Number(config.widthFt) === w && Number(config.heightFt) === h) return;
    if (w < 0.5 || h < 0.5 || isNaN(w) || isNaN(h)) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const id = setTimeout(async () => {
      try {
        setSavingDimensions(true);
        const res = await api("/signage-config/admin", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ widthFt: w, heightFt: h }),
        });
        setConfig(res.config);
        toast.success("Signage size updated");
      } catch (err) {
        toast.error(err?.message || "Failed to update dimensions");
      } finally {
        setSavingDimensions(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [widthFt, heightFt, config]);

  const handleSavePricePerSqInch = async () => {
    const val = pricePerSqInch === "" ? 0 : Number(pricePerSqInch);
    if (val < 0 || isNaN(val)) {
      toast.error("Price must be 0 or a positive number");
      return;
    }
    try {
      setSavingPrice(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pricePerSqInch: val }),
      });
      setConfig(res.config);
      setPricePerSqInch(val === 0 ? "" : String(val));
      toast.success("Initial price saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save price");
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  if (error && !config) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Configuration</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchConfig}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Signage Configuration</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing (scale-based)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set the price per 1 inch × 1 inch. The customer&apos;s total is calculated as this rate × text area width (in) × text area height (in).
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Initial price — per 1&quot; × 1&quot; ($)</label>
              <input
                type="number"
                value={pricePerSqInch}
                onChange={(e) => setPricePerSqInch(e.target.value)}
                className="border rounded px-3 py-2 w-32"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <button
              type="button"
              onClick={handleSavePricePerSqInch}
              disabled={savingPrice}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              {savingPrice ? "Saving..." : "Save price"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Signage sizing</h2>
          <p className="text-sm text-gray-600 mb-4">
            Physical sign dimensions in feet. Used for aspect ratio and to convert text area to inches for pricing. Updates save automatically as you change values.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Width (ft)</label>
              <input
                type="number"
                value={widthFt}
                onChange={(e) => setWidthFt(e.target.value)}
                className="border rounded px-3 py-2 w-24"
                min="0.5"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (ft)</label>
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className="border rounded px-3 py-2 w-24"
                min="0.5"
                step="0.5"
              />
            </div>
            {savingDimensions && (
              <span className="text-sm text-gray-500">Saving…</span>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSignageConfig;
