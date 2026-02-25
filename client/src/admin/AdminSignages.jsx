import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { api } from "../utils/api";
import { FiTrash2, FiEye, FiShare2, FiX } from "react-icons/fi";
import { SignageProvider, useSignage } from "../context/SignageContext";
import SignagePreview from "../components/signage/SignagePreview";

const AdminSignagesContent = () => {
  const [signages, setSignages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignage, setSelectedSignage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { loadSignage } = useSignage();

  useEffect(() => {
    fetchSignages();
  }, []);

  const fetchSignages = async () => {
    try {
      setLoading(true);
      const data = await api("/signage");
      setSignages(data.signages || []);
    } catch (error) {
      console.error("Failed to fetch signages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this signage?")) return;

    try {
      await api(`/signage/admin/${id}`, { method: "DELETE" });
      fetchSignages();
      alert("Signage deleted successfully");
    } catch (error) {
      console.error("Failed to delete signage:", error);
      alert("Failed to delete signage");
    }
  };

  const handleView = async (id) => {
    try {
      const data = await api(`/signage/${id}`);
      setSelectedSignage(data.signage);
      // Load signage data into context for preview
      loadSignage(data.signage);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to fetch signage:", error);
      alert("Failed to load signage");
    }
  };

  const handleGenerateShare = async (id) => {
    try {
      const data = await api(`/signage/admin/${id}/share`, { method: "POST" });
      const fullUrl = `${window.location.origin}/signage/share/${data.shareToken}`;
      setShareUrl(fullUrl);
      
      // Copy to clipboard
      navigator.clipboard.writeText(fullUrl);
      alert("Share link copied to clipboard!");
    } catch (error) {
      console.error("Failed to generate share token:", error);
      alert("Failed to generate share link");
    }
  };

  const handleDisableShare = async (id) => {
    try {
      await api(`/signage/admin/${id}/unshare`, { method: "POST" });
      fetchSignages();
      alert("Sharing disabled");
    } catch (error) {
      console.error("Failed to disable sharing:", error);
      alert("Failed to disable sharing");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Loading signages...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Import Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#2D2926]">
            Manage Signages
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all custom signages created by users
          </p>
        </div>

        {/* Signages Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Text Elements
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Background
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Shareable
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2926]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {signages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No signages found
                  </td>
                </tr>
              ) : (
                signages.map((signage) => (
                  <tr key={signage._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#2D2926] text-sm">
                        {signage._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {signage.productId?.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {signage.texts?.length || 0} text(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 capitalize">
                        {signage.backgroundType}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(signage.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {signage.metadata?.shareable ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Yes ({signage.metadata.viewCount || 0} views)
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(signage._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View"
                        >
                          <FiEye />
                        </button>
                        {signage.metadata?.shareable ? (
                          <button
                            onClick={() => handleDisableShare(signage._id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Disable Sharing"
                          >
                            <FiX />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateShare(signage._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Generate Share Link"
                          >
                            <FiShare2 />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(signage._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Preview Modal */}
        {showPreview && selectedSignage && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
            <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedSignage(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
              >
                ✕
              </button>

              <h2 className="text-2xl font-semibold text-[#2D2926] mb-4">
                {selectedSignage.name || `Signage ${selectedSignage._id.slice(-8)}`}
              </h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Product: {selectedSignage.productId?.title || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(selectedSignage.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Preview Canvas */}
              <div className="bg-white p-5 rounded-xl shadow mb-4">
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
                  Preview
                </h3>
                <div className="flex items-center justify-center min-h-[400px]">
                  <SignagePreview isEditable={false} />
                </div>
              </div>

              {/* Metadata */}
              {selectedSignage.metadata?.shareable && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm font-medium text-[#2D2926] mb-2">
                    Sharing Information
                  </p>
                  <p className="text-sm text-gray-600">
                    Share Token: {selectedSignage.metadata.shareToken}
                  </p>
                  <p className="text-sm text-gray-600">
                    Views: {selectedSignage.metadata.viewCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Shared At:{" "}
                    {selectedSignage.metadata.sharedAt
                      ? new Date(selectedSignage.metadata.sharedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const AdminSignages = () => {
  return (
    <SignageProvider>
      <AdminSignagesContent />
    </SignageProvider>
  );
};

export default AdminSignages;
