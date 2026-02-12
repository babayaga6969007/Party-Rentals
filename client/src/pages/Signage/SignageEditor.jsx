import { useState, useRef, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import { useCart } from "../../context/CartContext";
import { SignageProvider, useSignage, getBoardBounds } from "../../context/SignageContext";
import SignagePreview from "../../components/signage/SignagePreview";
import SignageHeader from "../../components/signage/SignageHeader";
import SignageControls from "../../components/signage/SignageControls";
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
  const [liveDragPosition, setLiveDragPosition] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTextClicked, setIsTextClicked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const {
    textContent,
    textPosition,
    setTextPosition,
    textBoxWidth,
    textBoxHeight,
    setTextBoxWidth,
    setTextBoxHeight,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    backgroundImageUrl,
    textSize,
    fontSize,
    effectiveTextSize,
    effectiveFontSize,
    userTextScale,
    setUserTextScale,
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
    widthInches,
    heightInches,
    configLoading,
    verticalBoardImageUrl,
  } = useSignage();

  // Track if we've initialized the position for this session
  const positionInitializedRef = useRef(false);

  // Ensure text is centered in banner on initial load (for all new signages, not shared ones)
  useEffect(() => {
    if (!token && !loading && !isSharedView && !configLoading && !positionInitializedRef.current && canvasWidth && canvasHeight) {
      const bounds = getBoardBounds(canvasWidth, canvasHeight);
      const centeredPosition = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height * 0.72,
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
    removeDragListeners();
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const offset = {
      x: (e.clientX - rect.left) / s - textPosition.x,
      y: (e.clientY - rect.top) / s - textPosition.y,
    };
    dragOffsetRef.current = offset;
    setDragOffset(offset);
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsTextClicked(true);
    const onMove = (ev) => {
      ev.preventDefault();
      handleMouseMove(ev);
    };
    const onUp = () => {
      removeDragListeners();
      handleMouseUp();
    };
    const cleanup = () => {
      document.removeEventListener("mousemove", onMove, { capture: true });
      document.removeEventListener("mouseup", onUp, { capture: true });
    };
    dragListenersCleanupRef.current = cleanup;
    document.addEventListener("mousemove", onMove, { capture: true });
    document.addEventListener("mouseup", onUp, { capture: true });
  };

  const handleTextTouchStart = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    removeDragListeners();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const s = previewScale || 1;
    const offset = {
      x: (touch.clientX - rect.left) / s - textPosition.x,
      y: (touch.clientY - rect.top) / s - textPosition.y,
    };
    dragOffsetRef.current = offset;
    setDragOffset(offset);
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsTextClicked(true);
    const onTouchMove = (ev) => {
      ev.preventDefault();
      handleTouchMove(ev);
    };
    const onTouchEnd = () => {
      removeDragListeners();
      handleMouseUp();
    };
    const cleanup = () => {
      document.removeEventListener("touchmove", onTouchMove, { capture: true, passive: false });
      document.removeEventListener("touchend", onTouchEnd, { capture: true });
      document.removeEventListener("touchcancel", onTouchEnd, { capture: true });
    };
    dragListenersCleanupRef.current = cleanup;
    document.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    document.addEventListener("touchend", onTouchEnd, { capture: true });
    document.addEventListener("touchcancel", onTouchEnd, { capture: true });
  };

  // Use ref for drag position to prevent rerenders - only update context on drag end
  const dragPositionRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragListenersCleanupRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const removeDragListeners = () => {
    const cleanup = dragListenersCleanupRef.current;
    if (cleanup) {
      dragListenersCleanupRef.current = null;
      cleanup();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const offset = dragOffsetRef.current;
    const newX = (e.clientX - rect.left) / s - offset.x;
    const newY = (e.clientY - rect.top) / s - offset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = effectiveFontSize * 1.4;
    const dynamicHeight = Math.max(
      effectiveTextSize.height,
      (lines.length - 1) * lineHeight + effectiveFontSize
    );
    const halfH = dynamicHeight / 2;
    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const b = getBoardBounds(cw, ch);
    // Upper limit: top of text must not go above this Y, relative to board bottom (450px above bottom)
    const boardBottom = b.top + b.height;
    const upperLimitY = boardBottom - 450;
    const minY = Math.max(b.top + halfH, upperLimitY + halfH);
    const maxY = b.top + b.height - halfH;
    // No left/right clamp — text can go full left/right and is clipped by the board overflow
    const clampedY = Math.max(minY, Math.min(newY, maxY));
    const pos = { x: newX, y: clampedY };
    dragPositionRef.current = pos;
    setLiveDragPosition(pos);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const s = previewScale || 1;
    const offset = dragOffsetRef.current;
    const newX = (touch.clientX - rect.left) / s - offset.x;
    const newY = (touch.clientY - rect.top) / s - offset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = effectiveFontSize * 1.4;
    const dynamicHeight = Math.max(
      effectiveTextSize.height,
      (lines.length - 1) * lineHeight + effectiveFontSize
    );
    const halfH = dynamicHeight / 2;
    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const b = getBoardBounds(cw, ch);
    const boardBottom = b.top + b.height;
    const upperLimitY = boardBottom - 450;
    const minY = Math.max(b.top + halfH, upperLimitY + halfH);
    const maxY = b.top + b.height - halfH;
    const clampedY = Math.max(minY, Math.min(newY, maxY));
    const pos = { x: newX, y: clampedY };
    dragPositionRef.current = pos;
    setLiveDragPosition(pos);
  };

  // Handle mouse/touch up — idempotent so double-firing (e.g. touch + synthetic mouse) doesn't break state
  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    removeDragListeners();
    const finalPosition = dragPositionRef.current;
    dragPositionRef.current = null;
    setLiveDragPosition(null);
    if (finalPosition) {
      setTextPosition(finalPosition);
    }
    setIsDragging(false);
    setTimeout(() => setIsTextClicked(false), 200);
  };

  useEffect(() => {
    const onBlur = () => {
      if (isDraggingRef.current) handleMouseUp();
      if (isResizingRef.current) endResize();
    };
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      removeDragListeners();
      removeResizeListeners();
    };
  }, []);

  // Resize from bottom-right handle (anchor = top-left of box)
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const resizeAnchorRef = useRef(null);
  const resizeListenersRef = useRef(null);

  const removeResizeListeners = () => {
    const ref = resizeListenersRef.current;
    if (ref?.cleanup) {
      resizeListenersRef.current = null;
      ref.cleanup();
    }
  };

  const endResize = () => {
    isResizingRef.current = false;
    setIsResizing(false);
    removeResizeListeners();
  };

  const handleResizeHandleMouseDown = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const anchorX = textPosition.x - textBoxWidth / 2;
    const anchorY = textPosition.y - textBoxHeight / 2;
    resizeAnchorRef.current = { anchorX, anchorY };
    isResizingRef.current = true;
    setIsResizing(true);

    const onMove = (ev) => {
      const canvasX = (ev.clientX - rect.left) / s;
      const canvasY = (ev.clientY - rect.top) / s;
      const newWidth = Math.max(40, canvasX - anchorX);
      const newHeight = Math.max(24, canvasY - anchorY);
      const cw = canvasWidth || 600;
      const ch = canvasHeight || 1200;
      const b = getBoardBounds(cw, ch);
      const clampedW = Math.min(b.width, newWidth);
      const clampedH = Math.min(b.height, newHeight);
      const centerX = anchorX + clampedW / 2;
      const centerY = anchorY + clampedH / 2;
      setTextBoxWidth(clampedW);
      setTextBoxHeight(clampedH);
      setTextPosition({ x: centerX, y: centerY });
    };
    const onUp = () => {
      removeResizeListeners();
      endResize();
    };
    const cleanup = () => {
      document.removeEventListener("mousemove", onMove, { capture: true });
      document.removeEventListener("mouseup", onUp, { capture: true });
    };
    resizeListenersRef.current = { cleanup };
    document.addEventListener("mousemove", onMove, { capture: true });
    document.addEventListener("mouseup", onUp, { capture: true });
  };

  const handleResizeHandleTouchStart = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const anchorX = textPosition.x - textBoxWidth / 2;
    const anchorY = textPosition.y - textBoxHeight / 2;
    resizeAnchorRef.current = { anchorX, anchorY };
    isResizingRef.current = true;
    setIsResizing(true);

    const onMove = (ev) => {
      const touch = ev.touches[0];
      const canvasX = (touch.clientX - rect.left) / s;
      const canvasY = (touch.clientY - rect.top) / s;
      const newWidth = Math.max(40, canvasX - anchorX);
      const newHeight = Math.max(24, canvasY - anchorY);
      const cw = canvasWidth || 600;
      const ch = canvasHeight || 1200;
      const b = getBoardBounds(cw, ch);
      const clampedW = Math.min(b.width, newWidth);
      const clampedH = Math.min(b.height, newHeight);
      const centerX = anchorX + clampedW / 2;
      const centerY = anchorY + clampedH / 2;
      setTextBoxWidth(clampedW);
      setTextBoxHeight(clampedH);
      setTextPosition({ x: centerX, y: centerY });
    };
    const onEnd = () => {
      removeResizeListeners();
      endResize();
    };
    const cleanup = () => {
      document.removeEventListener("touchmove", onMove, { capture: true, passive: false });
      document.removeEventListener("touchend", onEnd, { capture: true });
      document.removeEventListener("touchcancel", onEnd, { capture: true });
    };
    resizeListenersRef.current = { cleanup };
    document.addEventListener("touchmove", onMove, { capture: true, passive: false });
    document.addEventListener("touchend", onEnd, { capture: true });
    document.addEventListener("touchcancel", onEnd, { capture: true });
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
      
      // Capture from the parent container so export matches what's on screen (size and framing)
      const containerElement = previewRef?.current;
      if (!containerElement) {
        console.error("Preview container not found. previewRef:", previewRef);
        toast.error("Preview not found. Please try again.");
        setIsAddingToCart(false);
        return;
      }
      const containerWidth = containerElement.offsetWidth || Math.round(containerElement.getBoundingClientRect().width);
      const containerHeight = containerElement.offsetHeight || Math.round(containerElement.getBoundingClientRect().height);
      
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

      // Capture from parent container so export matches on-screen size and framing
      capturePreviewSnapshot(
        containerElement,
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
              fontSize: effectiveFontSize,
              textColor: selectedTextColor,
              textWidth: effectiveTextSize.width,
              textHeight: effectiveTextSize.height,
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
          verticalBoardImageUrl,
          canvasWidth,
          canvasHeight,
          containerWidth,
          containerHeight
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
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-xl font-bold text-black">
                  ${Number(currentPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600 mt-0.5" title="Text area size (updates with scale)">
                  {widthInches != null && heightInches != null && (widthInches > 0 || heightInches > 0)
                    ? `${Number(widthInches).toFixed(2)} in × ${Number(heightInches).toFixed(2)} in`
                    : ""}
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
            <div className="lg:col-span-2 flex flex-col max-h-[calc(100vh-200px)] min-h-[560px]">
              <div className="bg-white p-5 rounded-xl shadow flex-1 min-h-0 flex flex-col overflow-hidden">
                <SignagePreview
                  ref={previewRef}
                  isEditable={!isSharedView}
                  canvasRef={canvasRef}
                  dragPositionRef={dragPositionRef}
                  liveDragPosition={liveDragPosition}
                  isDragging={isDragging}
                  isTextClicked={isTextClicked}
                  onScaleChange={setPreviewScale}
                  onTextMouseDown={handleTextMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTextTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  onResizeHandleMouseDown={handleResizeHandleMouseDown}
                  onResizeHandleTouchStart={handleResizeHandleTouchStart}
                />
                {!isSharedView && (
                  <p className="text-sm text-gray-500 mt-4 text-center shrink-0">
                    Click and drag text to reposition
                  </p>
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
