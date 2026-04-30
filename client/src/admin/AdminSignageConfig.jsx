import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AdminSignageConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pricePerWidthInchAcrylic, setPricePerWidthInchAcrylic] = useState("");
  const [pricePerWidthInchVinyl, setPricePerWidthInchVinyl] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [printFilePrepFee, setPrintFilePrepFee] = useState("");
  const [savingPrepFee, setSavingPrepFee] = useState(false);
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
      setPricePerWidthInchAcrylic(
        res.config.pricePerWidthInchAcrylic != null && res.config.pricePerWidthInchAcrylic !== ""
          ? String(res.config.pricePerWidthInchAcrylic)
          : ""
      );
      setPricePerWidthInchVinyl(
        res.config.pricePerWidthInchVinyl != null && res.config.pricePerWidthInchVinyl !== ""
          ? String(res.config.pricePerWidthInchVinyl)
          : ""
      );
      setPrintFilePrepFee(
        res.config.printFilePrepFee != null && res.config.printFilePrepFee !== ""
          ? String(res.config.printFilePrepFee)
          : "25"
      );
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

  const handleSavePricePerWidthInch = async () => {
    const acrylic = pricePerWidthInchAcrylic === "" ? 0 : Number(pricePerWidthInchAcrylic);
    const vinyl = pricePerWidthInchVinyl === "" ? 0 : Number(pricePerWidthInchVinyl);
    if (acrylic < 0 || isNaN(acrylic) || vinyl < 0 || isNaN(vinyl)) {
      toast.error("Prices must be 0 or positive numbers");
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
        body: JSON.stringify({
          pricePerWidthInchAcrylic: acrylic,
          pricePerWidthInchVinyl: vinyl,
        }),
      });
      setConfig(res.config);
      setPricePerWidthInchAcrylic(acrylic === 0 ? "" : String(acrylic));
      setPricePerWidthInchVinyl(vinyl === 0 ? "" : String(vinyl));
      toast.success("Acrylic and vinyl prices saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save price");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleSavePrintFilePrepFee = async () => {
    const val = printFilePrepFee === "" ? 25 : Number(printFilePrepFee);
    if (val < 0 || isNaN(val)) {
      toast.error("Print file prep fee must be 0 or a positive number");
      return;
    }
    try {
      setSavingPrepFee(true);
      const token = localStorage.getItem("admin_token");
      const res = await api("/signage-config/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ printFilePrepFee: val }),
      });
      setConfig(res.config);
      setPrintFilePrepFee(String(val));
      toast.success("Print file prep fee saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save print file prep fee");
    } finally {
      setSavingPrepFee(false);
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
        <h1 className="text-2xl font-bold mb-6">Acrylic Vinyl Signage Configuration</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing (per width inch)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set the price per horizontal inch of printed text separately for acrylic and vinyl. The
            customer&apos;s initial price is this rate × text area width (in), based on the signage type
            they choose. Height does not multiply the rate.
          </p>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Acrylic — price per width inch ($)</label>
              <input
                type="number"
                value={pricePerWidthInchAcrylic}
                onChange={(e) => setPricePerWidthInchAcrylic(e.target.value)}
                className="border rounded px-3 py-2 w-32"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vinyl — price per width inch ($)</label>
              <input
                type="number"
                value={pricePerWidthInchVinyl}
                onChange={(e) => setPricePerWidthInchVinyl(e.target.value)}
                className="border rounded px-3 py-2 w-32"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <button
              type="button"
              onClick={handleSavePricePerWidthInch}
              disabled={savingPrice}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              {savingPrice ? "Saving..." : "Save pricing"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              This fee is added to every acrylic or vinyl sign order (in addition to the width-based price).
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Print file preparation fee ($)</label>
                <input
                  type="number"
                  value={printFilePrepFee}
                  onChange={(e) => setPrintFilePrepFee(e.target.value)}
                  className="border rounded px-3 py-2 w-32"
                  min="0"
                  step="0.01"
                  placeholder="25"
                />
              </div>
              <button
                type="button"
                onClick={handleSavePrintFilePrepFee}
                disabled={savingPrepFee}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
              >
                {savingPrepFee ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSignageConfig;
