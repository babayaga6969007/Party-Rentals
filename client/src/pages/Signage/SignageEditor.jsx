import { useState, useRef, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import { useCart } from "../../context/CartContext";
import { SignageProvider, useSignage } from "../../context/SignageContext";
import SignagePreview from "../../components/signage/SignagePreview";
import SignageHeader from "../../components/signage/SignageHeader";
import SignageControls from "../../components/signage/SignageControls";
import BackgroundImageOptions from "../../components/signage/BackgroundImageOptions";
import { capturePreviewSnapshot } from "../../utils/signageCart";
import { waitForFonts, preloadFontsWithFontFace } from "../../utils/fontLoader";

const SignageEditorContent = () => {
  const { id: productId, token } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedSignage, setSharedSignage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTextClicked, setIsTextClicked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 2;
  const ZOOM_STEP = 0.25;

  const {
    textContent,
    textPosition,
    setTextPosition,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    backgroundImageUrl,
    textSize,
    fontSize,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textSizes,
    getTextsFromContent,
    loadSignage,
    currentPrice,
    canvasWidth,
    canvasHeight,
    widthFt,
    heightFt,
    configLoading,
  } = useSignage();

  // Track if we've initialized the position for this session
  const positionInitializedRef = useRef(false);

  // Ensure text is horizontally centered on initial load (for all new signages, not shared ones)
  useEffect(() => {
    if (!token && !loading && !isSharedView && !configLoading && !positionInitializedRef.current && canvasWidth && canvasHeight) {
      // Position horizontally centered, a bit below top
      const centeredPosition = { 
        x: canvasWidth / 2, // Horizontally centered
        y: 520, // A bit below top
      };
      
      setTextPosition(centeredPosition);
      positionInitializedRef.current = true;
    }
  }, [token, loading, isSharedView, configLoading, canvasWidth, canvasHeight, setTextPosition]);

  // Fetch product data or shared signage (productId is optional)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (token) {
          setIsSharedView(true);
          // Note: Sharing functionality removed, but keeping for backward compatibility
          try {
            const signageData = await api(`/signage/share/${token}`);
            setSharedSignage(signageData.signage);
            if (signageData.signage.productId) {
              const productData = await api(`/products/${signageData.signage.productId._id || signageData.signage.productId}`);
              setProduct(productData);
            }
            loadSignage(signageData.signage);
          } catch {
            // If sharing fails, just show empty editor
            setLoading(false);
          }
        } else if (productId && productId !== "signage") {
          // Only fetch product if productId is provided and not the placeholder
          const data = await api(`/products/${productId}`);
          setProduct(data);
        } else {
          // No productId - standalone signage creation
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        // Don't navigate away if it's a standalone signage page
        if (productId && productId !== "signage") {
          alert("Failed to load product.");
          navigate(-1);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, token, navigate, loadSignage]);

  const handleTextMouseDown = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    setDragOffset({
      x: (e.clientX - rect.left) / s - textPosition.x,
      y: (e.clientY - rect.top) / s - textPosition.y,
    });
    setIsDragging(true);
    setIsTextClicked(true);
  };

  const handleTextTouchStart = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const s = previewScale || 1;
    setDragOffset({
      x: (touch.clientX - rect.left) / s - textPosition.x,
      y: (touch.clientY - rect.top) / s - textPosition.y,
    });
    setIsDragging(true);
    setIsTextClicked(true);
  };

  // Use ref for drag position to prevent rerenders - only update context on drag end
  const dragPositionRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const newX = (e.clientX - rect.left) / s - dragOffset.x;
    const newY = (e.clientY - rect.top) / s - dragOffset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.4;
    const dynamicHeight = Math.max(
      textSize.height,
      (lines.length - 1) * lineHeight + fontSize
    );
    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const clampedX = Math.max(textSize.width / 2, Math.min(newX, cw - textSize.width / 2));
    const clampedY = Math.max(dynamicHeight / 2, Math.min(newY, ch - dynamicHeight / 2));
    dragPositionRef.current = { x: clampedX, y: clampedY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const s = previewScale || 1;
    const newX = (touch.clientX - rect.left) / s - dragOffset.x;
    const newY = (touch.clientY - rect.top) / s - dragOffset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.4;
    const dynamicHeight = Math.max(
      textSize.height,
      (lines.length - 1) * lineHeight + fontSize
    );
    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const clampedX = Math.max(textSize.width / 2, Math.min(newX, cw - textSize.width / 2));
    const clampedY = Math.max(dynamicHeight / 2, Math.min(newY, ch - dynamicHeight / 2));
    dragPositionRef.current = { x: clampedX, y: clampedY };
  };

  // Handle mouse/touch up
  const handleMouseUp = () => {
    // Finalize position update from ref
    const finalPosition = dragPositionRef.current;
    if (finalPosition) {
      dragPositionRef.current = null;
      // Batch all updates together - React 18 automatically batches these
      setTextPosition(finalPosition);
      setIsDragging(false);
      setTimeout(() => setIsTextClicked(false), 200);
    } else {
      // No position change, just clear drag state
      setIsDragging(false);
      setTimeout(() => setIsTextClicked(false), 200);
    }
  };

  // Add to cart (saves signage metadata directly in cart, no separate entity)
  const handleAddToCart = async () => {
    try {
      const texts = getTextsFromContent();
      if (texts.length === 0) {
        toast.error("Please enter some text");
        return;
      }

      setIsAddingToCart(true);
      
      // Get the preview element (the div with the preview content)
      // The canvasRef points to the inner preview div that contains the background and text
      // This is the div with border-2 and specific width/height (600x1200)
      const previewElement = canvasRef?.current;
      if (!previewElement) {
        console.error("Preview element not found. canvasRef:", canvasRef);
        toast.error("Preview element not found. Please try again.");
        setIsAddingToCart(false);
        return;
      }
      
      // Get the exact dimensions from the element's style (not computed, to avoid padding)
      const elementStyle = window.getComputedStyle(previewElement);
      const elementWidth = parseInt(elementStyle.width) || previewElement.offsetWidth;
      const elementHeight = parseInt(elementStyle.height) || previewElement.offsetHeight;
      
      console.log("Preview element found:", previewElement);
      console.log("Preview element dimensions:", {
        styleWidth: elementStyle.width,
        styleHeight: elementStyle.height,
        offsetWidth: previewElement.offsetWidth,
        offsetHeight: previewElement.offsetHeight,
        clientWidth: previewElement.clientWidth,
        clientHeight: previewElement.clientHeight,
        padding: elementStyle.padding,
        margin: elementStyle.margin,
        border: elementStyle.borderWidth
      });
      
      // Store exact dimensions for html2canvas
      previewElement.dataset.captureWidth = elementWidth.toString();
      previewElement.dataset.captureHeight = elementHeight.toString();
      
      // Check if text elements are present in the preview
      const textElements = previewElement.querySelectorAll('[style*="absolute"]');
      console.log("Text elements found in preview:", textElements.length);
      textElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const parentRect = previewElement.getBoundingClientRect();
        console.log(`Text element ${idx}:`, {
          text: el.textContent,
          left: el.style.left,
          top: el.style.top,
          relativeLeft: rect.left - parentRect.left,
          relativeTop: rect.top - parentRect.top,
          fontSize: el.style.fontSize,
          color: el.style.color
        });
      });
      
    // Wait for fonts to load and ensure everything is rendered
    // Use FontFace API for more reliable font loading in production
    if (texts && texts.length > 0) {
      const fontFamilies = [...new Set(texts.map(t => t.fontFamily || "'Farmhouse', cursive"))];
      console.log("Waiting for fonts:", fontFamilies);
      
      // Preload all fonts using FontFace API first
      await preloadFontsWithFontFace();
      
      // Then wait for specific fonts used in the text
      await waitForFonts(fontFamilies, 10000);
    } else {
      // Preload all fonts even if no text (for fallback)
      await preloadFontsWithFontFace();
    }
    
    // Additional wait to ensure fonts are fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

      // DEBUG: Log text elements before capture
      const textElementsDebug = previewElement.querySelectorAll('div[data-text-id]');
      console.log("=== DEBUG: Text elements in preview ===");
      textElementsDebug.forEach((el, idx) => {
        const style = window.getComputedStyle(el);
        console.log(`Text ${idx}:`, {
          content: el.textContent,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          color: style.color,
          visibility: style.visibility,
          display: style.display,
          opacity: style.opacity,
          zIndex: style.zIndex,
          position: style.position,
          left: style.left,
          top: style.top,
          transform: style.transform
        });
      });
      
      // Capture snapshot of the actual preview element
      // Use the ACTUAL visible dimensions of the preview element, not context dimensions
      // Provide fallback data in case html2canvas isn't available
      capturePreviewSnapshot(
        previewElement,
        (previewUrl) => {
          if (!previewUrl) {
            toast.error("Failed to capture preview. Please try again.");
            setIsAddingToCart(false);
            return;
          }

          const cartItem = {
            productId: productId || "signage", // Use "signage" as placeholder if no product
            name: `${product?.title || "Custom"} - Custom Signage`,
            productType: "signage",
            qty: 1,
            unitPrice: currentPrice || product?.pricePerDay || 0,
            days: 1,
            image: previewUrl,
            lineTotal: currentPrice || product?.pricePerDay || 0,
            // Store all signage metadata directly in cart item (no separate signage entity)
            signageData: {
              texts,
              backgroundType,
              backgroundColor,
              backgroundGradient,
              backgroundImageUrl,
              textContent,
              fontFamily: selectedFont,
              fontSize: fontSize,
              textColor: selectedTextColor,
              textWidth: textSize.width,
              textHeight: textSize.height,
              size: selectedSize,
            },
          };

          addToCart(cartItem);
          toast.success("Added to cart successfully!");
          setIsAddingToCart(false);
          // Don't navigate - just show the toast
        },
        {
          backgroundType,
          backgroundColor,
          backgroundGradient,
          backgroundImageUrl,
          getTextsFromContent,
          // Use ACTUAL visible dimensions from the preview element, not context dimensions
          // The visible preview is 600x600, not the context canvasWidth/canvasHeight
          canvasWidth: elementWidth,  // Use the actual element width (600)
          canvasHeight: elementHeight  // Use the actual element height (600)
        }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't block rendering if config is loading - use defaults
  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="max-w-7xl mx-auto px-6 pt-32">
          <SignageHeader
            isSharedView={isSharedView}
            sharedSignage={sharedSignage}
            onBack={() => navigate(-1)}
          />

          {/* Same-line header: Signage (centered) | Preview + Price */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center mb-4 bg-gray-50 -mx-6 px-6 py-4 rounded-lg">
            <div className="flex justify-center order-2 lg:order-1">
              <h2
                className="text-4xl font-bold text-[#2D2926]"
                style={{ fontFamily: "'Public Sans', sans-serif" }}
              >
                Signage
              </h2>
            </div>
            <div className="lg:col-span-2 flex items-center justify-between order-1 lg:order-2 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-[#2D2926]">
                  Preview
                </h3>
                <span className="text-sm text-gray-600" title="Physical sign size (set in admin)">
                  {widthFt != null && heightFt != null ? `${Number(widthFt)} ft × ${Number(heightFt)} ft` : ""}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-xl font-bold text-black">
                  ${currentPrice || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout: Controls Left, Canvas Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <SignageControls
              isSharedView={isSharedView}
              onAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart}
              onViewProduct={() => {
                if (product) {
                  navigate(`/product/${product._id || productId}`);
                } else {
                  navigate("/shop");
                }
              }}
              product={product}
              productId={productId}
              navigate={navigate}
            />

            {/* RIGHT SIDE - CANVAS */}
            <div className="lg:col-span-2 flex flex-col max-h-[calc(100vh-280px)] min-h-0">
              <div className="bg-white p-5 rounded-xl shadow flex-1 min-h-0 flex flex-col overflow-hidden">
                {!isSharedView && (
                  <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                    <span className="text-sm text-gray-600">Zoom</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCanvasZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                        disabled={canvasZoom <= ZOOM_MIN}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-lg"
                        title="Zoom out"
                      >
                        −
                      </button>
                      <span className="min-w-16 text-center text-sm font-medium text-gray-700">
                        {Math.round(canvasZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setCanvasZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                        disabled={canvasZoom >= ZOOM_MAX}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-lg"
                        title="Zoom in"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanvasZoom(1)}
                        className="px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        title="Fit to view"
                      >
                        Fit
                      </button>
                      <button
                        type="button"
                        onClick={() => previewRef.current?.recenter?.()}
                        disabled={canvasZoom <= 1}
                        className="px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Recenter image"
                      >
                        Recenter
                      </button>
                    </div>
                  </div>
                )}
                <SignagePreview
                  ref={previewRef}
                  isEditable={!isSharedView}
                  canvasRef={canvasRef}
                  dragPositionRef={dragPositionRef}
                  isDragging={isDragging}
                  isTextClicked={isTextClicked}
                  zoom={canvasZoom}
                  onScaleChange={setPreviewScale}
                  onTextMouseDown={handleTextMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTextTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                />
                {!isSharedView && (
                  <p className="text-sm text-gray-500 mt-4 text-center shrink-0">
                    Click and drag text to reposition
                  </p>
                )}
                
                {/* Background Image Options - Show cart images if available */}
                {!isSharedView && (
                  <div className="mt-4 shrink-0">
                    <BackgroundImageOptions cartItems={cartItems} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SignageEditor = () => {
  return (
    <SignageProvider>
      <SignageEditorContent />
    </SignageProvider>
  );
};

export default SignageEditor;
