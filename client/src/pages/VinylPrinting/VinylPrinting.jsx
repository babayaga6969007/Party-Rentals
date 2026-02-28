import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMaximize2, FiUploadCloud, FiShoppingCart, FiInfo, FiChevronLeft } from "react-icons/fi";
import { api } from "../../utils/api";
import ImageGalleryPopup from "../../components/ImageGalleryPopup";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const DEFAULT_SIZE_OPTIONS = [
  { key: "2x2", label: "2' x 2'", price: 95, minimum: true },
  { key: "2x3", label: "2' x 3'", price: 95, minimum: true },
  { key: "3x4", label: "3' x 4'", price: 144, minimum: false },
  { key: "4x4", label: "4' x 4'", price: 192, minimum: false },
  { key: "4x6", label: "4' x 6'", price: 288, minimum: false },
  { key: "4x8", label: "4' x 8'", price: 384, minimum: false },
];

const VinylPrinting = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [sizeOptions, setSizeOptions] = useState(DEFAULT_SIZE_OPTIONS);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rushProduction, setRushProduction] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [vinylWraps, setVinylWraps] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [galleryPopupOpen, setGalleryPopupOpen] = useState(false);
  const [galleryPopupIndex, setGalleryPopupIndex] = useState(0);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const res = await api("/vinyl-printing-config");
        const sizes = res?.config?.sizes;
        if (Array.isArray(sizes) && sizes.length > 0) {
          setSizeOptions(sizes.map((s) => ({
            key: s.key,
            label: s.label,
            price: Number(s.price) || 0,
            minimum: !!s.minimum,
          })));
        }
      } catch (err) {
        console.error("Failed to load vinyl printing sizes:", err);
      } finally {
        setLoadingSizes(false);
      }
    };
    fetchSizes();
  }, []);

  useEffect(() => {
    const fetchVinylWraps = async () => {
      try {
        const res = await api("/gallery?category=vinyl-wraps");
        setVinylWraps(res?.images || []);
      } catch (err) {
        console.error("Failed to load vinyl wraps:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchVinylWraps();
  }, []);

  const basePrice = selectedSize ? selectedSize.price : 0;
  const rushFee = rushProduction && selectedSize ? Math.round(selectedSize.price * 0.3 * 100) / 100 : 0;
  const lineTotal = basePrice + rushFee;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (!file && !fileUrl) {
      toast.error("Please upload your file.");
      return;
    }

    setAddingToCart(true);
    let resolvedFileUrl = fileUrl;

    if (file) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await api("/upload/vinyl-printing-file", {
          method: "POST",
          body: formData,
        });
        resolvedFileUrl = res?.url || "";
        if (!resolvedFileUrl) throw new Error("Upload did not return URL");
      } catch (err) {
        toast.error(err?.message || "Failed to upload file. Please try again.");
        setAddingToCart(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    addToCart({
      productId: "vinyl-printing",
      name: `Vinyl Printing — ${selectedSize.label}`,
      productType: "vinyl-printing",
      qty: 1,
      unitPrice: lineTotal,
      lineTotal,
      image: "",
      vinylPrintingData: {
        sizeLabel: selectedSize.label,
        sizeKey: selectedSize.key,
        price: basePrice,
        fileUrl: resolvedFileUrl,
        rushProduction,
      },
    });

    toast.success("Added to cart!");
    setAddingToCart(false);
  };

  const allowedTypes = [".ai", ".svg", ".png", ".jpg", ".jpeg", ".pdf"];
  const validateFile = (f) => {
    const ext = "." + (f.name?.split(".").pop() || "").toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error("Please upload an image file (AI, SVG, PNG, JPG, or PDF).");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-6 pt-36">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black mb-8 transition mt-4"
        >
          <FiChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D2926] mb-2" style={{ fontFamily: "'Public Sans', sans-serif" }}>
            Vinyl Printing
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Choose a size, upload your artwork, and add to cart. Need a custom size? Email or message us.
          </p>
        </div>

        {/* Size options — squared cards, icon, centered, outline when selected */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/5">
              <FiMaximize2 className="w-5 h-5 text-[#2D2926]" />
            </span>
            <h2 className="text-lg font-semibold text-gray-800">Select size</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(loadingSizes ? DEFAULT_SIZE_OPTIONS : sizeOptions).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedSize(opt)}
                className={`relative aspect-square min-h-[110px] p-4 rounded-2xl transition flex flex-col items-center justify-center bg-white overflow-hidden ${
                  selectedSize?.key === opt.key
                    ? "border-2 border-black text-black shadow-md ring-2 ring-black/5"
                    : "border border-gray-200 text-gray-800 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full transition ${
                  selectedSize?.key === opt.key ? "bg-black/5" : "bg-gray-100"
                }`} />
                <div className="relative font-semibold text-center">{opt.label}</div>
                <div className="relative text-sm mt-1 text-center opacity-90">
                  ${opt.price}
                  {opt.minimum && <span className="text-xs opacity-75"> (min.)</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File upload — card with icon, centered, no support text */}
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gray-100/80 -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-black/5 mb-4">
              <FiUploadCloud className="w-7 h-7 text-[#2D2926]" />
            </span>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Upload file</h2>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              Your image will fit the size you choose. We’ll review before approval.
            </p>
            <label className="w-full max-w-xs mx-auto cursor-pointer">
              <input
                type="file"
                accept=".ai,.svg,.png,.jpg,.jpeg,.pdf,image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf,application/postscript,application/illustrator"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && !validateFile(f)) {
                    e.target.value = "";
                    return;
                  }
                  if (f) {
                    setFile(f);
                    setFileUrl("");
                  }
                }}
              />
              <span className="block w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-600 hover:text-gray-800 transition text-center">
                {file ? file.name : "Choose file"}
              </span>
            </label>
            {file && (
              <button
                type="button"
                onClick={() => { setFile(null); setFileUrl(""); }}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Rush production — card, centered */}
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-amber-50 -translate-x-1/2 translate-y-1/2" />
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <label htmlFor="vinyl-rush" className="cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <span className="font-semibold text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="checkbox"
                    id="vinyl-rush"
                    checked={rushProduction}
                    onChange={(e) => setRushProduction(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                  />
                  Rush Production — +30% (3–5 days)
                </span>
                <span className="text-sm text-gray-500">
                  Need it sooner? 30% added to total.
                </span>
              </label>
              {rushProduction && selectedSize && (
                <p className="text-sm text-gray-600">
                  +${(selectedSize.price * 0.3).toFixed(2)} → Total ${lineTotal.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price summary + Add to cart — centered */}
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-black/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col items-center text-center">
            {selectedSize && (
              <div className="mb-4 text-sm text-gray-600">
                {selectedSize.label}: ${selectedSize.price.toFixed(2)}
                {rushProduction && (
                  <> + Rush (${rushFee.toFixed(2)}) = <strong className="text-gray-900">${lineTotal.toFixed(2)}</strong></>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize || (!file && !fileUrl) || uploading || addingToCart}
              className="inline-flex items-center justify-center gap-2 w-full max-w-sm py-3.5 px-6 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-black/10"
            >
              <FiShoppingCart className="w-5 h-5" />
              {uploading ? "Uploading…" : addingToCart ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </div>

        {/* Note — icon, centered list, no support text */}
        <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full bg-gray-100/60 -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-start gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 shrink-0">
              <FiInfo className="w-5 h-5 text-gray-600" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Note</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Minimum $95 per acrylic or vinyl order.</li>
                <li>All sign and vinyl orders have a 7 day lead time.</li>
                <li>All vinyl print orders must be picked up at our location in Anaheim.</li>
                <li>Any acrylic sign or vinyl orders added to current rental orders will be delivered with rental items.</li>
                <li>Questions? Message us on our <button type="button" onClick={() => navigate("/contact")} className="text-black underline hover:no-underline">contact page</button>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Featured — Vinyl Wraps (same API as Gallery / visual showcase) */}
        <section className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D2926] mb-2" style={{ fontFamily: "'Public Sans', sans-serif" }}>
              Vinyl Wraps
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
              See what&apos;s possible with custom vinyl printing
            </p>
          </div>

          {loadingFeatured ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-black" />
            </div>
          ) : vinylWraps.length > 0 ? (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                {vinylWraps.map((img, index) => (
                  <div
                    key={img._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setGalleryPopupIndex(index);
                      setGalleryPopupOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setGalleryPopupIndex(index);
                        setGalleryPopupOpen(true);
                      }
                    }}
                    className="break-inside-avoid mb-5 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={img.image?.url}
                        alt={img.title || "Vinyl wrap"}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-semibold text-lg">{img.title}</h3>
                        {img.subtitle && (
                          <p className="text-sm text-white/90 mt-0.5">{img.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ImageGalleryPopup
                isOpen={galleryPopupOpen}
                images={vinylWraps}
                initialIndex={galleryPopupIndex}
                onClose={() => setGalleryPopupOpen(false)}
              />
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default VinylPrinting;
