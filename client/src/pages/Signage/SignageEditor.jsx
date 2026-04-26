import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import { useCart } from "../../context/CartContext";
import {
  SignageProvider,
  useSignage,
  getBoardBounds,
  clampTextCenterInBoard,
  computeTextDragClampDimensionsPx,
  shrinkSignageResizeToDragClamp,
  signageResizeClampTopLeft,
  DEFAULT_SIGNAGE_FONT,
  signageResizeBoxWithAspect,
  SIGNAGE_RESIZE_MIN_CANVAS_PX,
} from "../../context/SignageContext";
import SignagePreview from "../../components/signage/SignagePreview";
import SignageHeader from "../../components/signage/SignageHeader";
import SignageControls from "../../components/signage/SignageControls";
import { capturePreviewSnapshot } from "../../utils/signageCart";
import { waitForFonts, preloadFontsWithFontFace } from "../../utils/fontLoader";

/** Pointer-box lerp during resize drag (higher = snappier, lower = smoother). */
const SIGNAGE_RESIZE_SMOOTH_ALPHA = 0.58;
/** Re-schedule rAF until smoothed size is within this of the live pointer. */
const SIGNAGE_RESIZE_SMOOTH_EPS = 0.4;

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
    setDisableInitialPrintedBoxSizing,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    backgroundImageUrl,
    textSize,
    fontSize,
    effectiveTextSize,
    effectiveFontSize,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textSizes,
    getTextsFromContent,
    loadSignage,
    currentPrice,
    canvasWidth,
    canvasHeight,
    widthInches,
    heightInches,
    textWidthInches,
    textHeightInches,
    configLoading,
    verticalBoardImageUrl,
    boardClampRect,
    textDragClampBox,
    contentMinSizeRef,
    signageType,
    setSignageType,
    setRushProduction,
    printFilePrepFee,
    rushProduction,
    basePrice,
    rushFee,
  } = useSignage();

  const location = useLocation();
  const editItemFromCart = location.state?.editItem;

  // Track if we've initialized the position for this session
  const positionInitializedRef = useRef(false);
  const editFromCartLoadedRef = useRef(false);

  // Load signage data when arriving from cart "Edit" (editItemFromCart)
  useEffect(() => {
    if (
      editItemFromCart?.productType === "signage" &&
      editItemFromCart?.signageData &&
      !token &&
      !loading &&
      !configLoading &&
      !editFromCartLoadedRef.current
    ) {
      editFromCartLoadedRef.current = true;
      setDisableInitialPrintedBoxSizing(true);
      const sd = editItemFromCart.signageData;
      const payload = {
        ...sd,
        backgroundImage: sd.backgroundImageUrl ? { url: sd.backgroundImageUrl } : undefined,
      };
      loadSignage(payload);
      if (sd.textWidth != null) setTextBoxWidth(sd.textWidth);
      if (sd.textHeight != null) setTextBoxHeight(sd.textHeight);
      setSignageType(sd.signageType === "vinyl" ? "vinyl" : "acrylic");
      setRushProduction(!!sd.rushProduction);
    }
  }, [
    editItemFromCart,
    token,
    loading,
    configLoading,
    loadSignage,
    setTextBoxWidth,
    setTextBoxHeight,
    setDisableInitialPrintedBoxSizing,
    setSignageType,
    setRushProduction,
  ]);

  // Ensure text is centered in banner on initial load (for all new signages, not shared ones; skip when loading from cart edit)
  useEffect(() => {
    if (
      !token &&
      !loading &&
      !isSharedView &&
      !configLoading &&
      !positionInitializedRef.current &&
      !editItemFromCart?.signageData &&
      canvasWidth &&
      canvasHeight
    ) {
      const outer = getBoardBounds(canvasWidth, canvasHeight);
      const cx = outer.left + outer.width / 2;
      const cy = outer.top + outer.height * 0.72;
      setTextPosition(
        clampTextCenterInBoard(
          boardClampRect,
          cx,
          cy,
          textDragClampBox.width,
          textDragClampBox.height,
          canvasHeight,
          canvasWidth
        )
      );
      positionInitializedRef.current = true;
    }
  }, [
    token,
    loading,
    isSharedView,
    configLoading,
    editItemFromCart,
    canvasWidth,
    canvasHeight,
    textBoxWidth,
    textBoxHeight,
    textDragClampBox.width,
    textDragClampBox.height,
    boardClampRect,
    setTextPosition,
  ]);

  // After glyph metrics load (or box changes), keep center inside board/canvas vs *visible* text, not just logical box.
  useEffect(() => {
    if (isDragging) return;
    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    setTextPosition((prev) => {
      const next = clampTextCenterInBoard(
        boardClampRect,
        prev.x,
        prev.y,
        textDragClampBox.width,
        textDragClampBox.height,
        ch,
        cw
      );
      if (next.x === prev.x && next.y === prev.y) return prev;
      return next;
    });
  }, [
    textDragClampBox.width,
    textDragClampBox.height,
    boardClampRect,
    canvasWidth,
    canvasHeight,
    isDragging,
    setTextPosition,
  ]);

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
  const isResizingRef = useRef(false);
  const resizeAnchorRef = useRef(null);
  const resizeListenersRef = useRef(null);
  const resizeRafRef = useRef(null);
  const resizePendingRef = useRef(null);
  const resizeSmoothRef = useRef(null);

  const removeDragListeners = () => {
    const cleanup = dragListenersCleanupRef.current;
    if (cleanup) {
      dragListenersCleanupRef.current = null;
      cleanup();
    }
  };

  const removeResizeListeners = () => {
    const ref = resizeListenersRef.current;
    if (ref?.cleanup) {
      resizeListenersRef.current = null;
      ref.cleanup();
    }
  };

  const applyResizeFromCanvasPoint = useCallback(
    (canvasX, canvasY, options = {}) => {
      const { snap = false } = options;
      const {
        anchorX,
        anchorY,
        startWidth: sw,
        startHeight: sh,
        startPointerX: spx,
        startPointerY: spy,
      } = resizeAnchorRef.current || {};
      if (spx == null || spy == null) return false;
      const targetW = Math.max(SIGNAGE_RESIZE_MIN_CANVAS_PX, sw + (canvasX - spx));
      const targetH = Math.max(SIGNAGE_RESIZE_MIN_CANVAS_PX, sh + (canvasY - spy));
      let smooth = resizeSmoothRef.current;
      if (!smooth || smooth.w == null || smooth.h == null) {
        smooth = { w: sw, h: sh };
      }
      const a = SIGNAGE_RESIZE_SMOOTH_ALPHA;
      let pointerW = snap ? targetW : smooth.w + (targetW - smooth.w) * a;
      let pointerH = snap ? targetH : smooth.h + (targetH - smooth.h) * a;
      resizeSmoothRef.current = { w: pointerW, h: pointerH };
      const cw = canvasWidth || 600;
      const ch = canvasHeight || 1200;
      const b = boardClampRect;
      const cm = contentMinSizeRef.current;
      const contentMinW = Number(cm?.w) || 0;
      const contentMinH = Number(cm?.h) || 0;
      const { w: rawW, h: rawH } = signageResizeBoxWithAspect({
        startWidth: sw,
        startHeight: sh,
        pointerWidth: pointerW,
        pointerHeight: pointerH,
        anchorX,
        anchorY,
        board: b,
        contentMinW,
        contentMinH,
      });
      const { w: clampedW, h: clampedH } = shrinkSignageResizeToDragClamp({
        w: rawW,
        h: rawH,
        anchorX,
        anchorY,
        board: b,
        canvasWidth: cw,
        canvasHeight: ch,
        extentWIn: textWidthInches,
        extentHIn: textHeightInches,
        contentMinW,
        contentMinH,
      });
      const { tlX, tlY } = signageResizeClampTopLeft(anchorX, anchorY, clampedW, clampedH, b);
      const centerX = tlX + clampedW / 2;
      const centerY = tlY + clampedH / 2;
      const drag = computeTextDragClampDimensionsPx(
        clampedW,
        clampedH,
        b.width,
        b.height,
        textWidthInches,
        textHeightInches
      );
      setTextBoxWidth(clampedW);
      setTextBoxHeight(clampedH);
      setTextPosition(clampTextCenterInBoard(b, centerX, centerY, drag.width, drag.height, ch, cw));
      if (!snap) {
        const dw = Math.abs(targetW - pointerW);
        const dh = Math.abs(targetH - pointerH);
        return dw > SIGNAGE_RESIZE_SMOOTH_EPS || dh > SIGNAGE_RESIZE_SMOOTH_EPS;
      }
      return false;
    },
    [
      boardClampRect,
      canvasWidth,
      canvasHeight,
      contentMinSizeRef,
      textWidthInches,
      textHeightInches,
      setTextBoxWidth,
      setTextBoxHeight,
      setTextPosition,
    ]
  );

  const scheduleResizeApply = useCallback(
    (canvasX, canvasY) => {
      resizePendingRef.current = { canvasX, canvasY };
      const runFrame = () => {
        resizeRafRef.current = null;
        if (!isResizingRef.current) return;
        const p = resizePendingRef.current;
        if (!p) return;
        const needsAnother = applyResizeFromCanvasPoint(p.canvasX, p.canvasY, { snap: false });
        if (needsAnother && isResizingRef.current) {
          resizeRafRef.current = requestAnimationFrame(runFrame);
        }
      };
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(runFrame);
    },
    [applyResizeFromCanvasPoint]
  );

  const endResize = () => {
    if (resizeRafRef.current != null) {
      cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = null;
    }
    const p = resizePendingRef.current;
    resizePendingRef.current = null;
    if (p) applyResizeFromCanvasPoint(p.canvasX, p.canvasY, { snap: true });
    resizeSmoothRef.current = null;
    isResizingRef.current = false;
    removeResizeListeners();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const offset = dragOffsetRef.current;
    const newX = (e.clientX - rect.left) / s - offset.x;
    const newY = (e.clientY - rect.top) / s - offset.y;

    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const pos = clampTextCenterInBoard(
      boardClampRect,
      newX,
      newY,
      textDragClampBox.width,
      textDragClampBox.height,
      ch,
      cw
    );
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

    const cw = canvasWidth || 600;
    const ch = canvasHeight || 1200;
    const pos = clampTextCenterInBoard(
      boardClampRect,
      newX,
      newY,
      textDragClampBox.width,
      textDragClampBox.height,
      ch,
      cw
    );
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
      const cw = canvasWidth || 600;
      const ch = canvasHeight || 1200;
      setTextPosition(
        clampTextCenterInBoard(
          boardClampRect,
          finalPosition.x,
          finalPosition.y,
          textDragClampBox.width,
          textDragClampBox.height,
          ch,
          cw
        )
      );
    }
    setIsDragging(false);
    setTimeout(() => setIsTextClicked(false), 200);
  };

  const handleResizeHandleMouseDown = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const s = previewScale || 1;
    const anchorX = textPosition.x - textBoxWidth / 2;
    const anchorY = textPosition.y - textBoxHeight / 2;
    const startWidth = textBoxWidth;
    const startHeight = textBoxHeight;
    const startPointerX = (e.clientX - rect.left) / s;
    const startPointerY = (e.clientY - rect.top) / s;
    resizeAnchorRef.current = {
      anchorX,
      anchorY,
      startWidth,
      startHeight,
      startPointerX,
      startPointerY,
    };
    resizeSmoothRef.current = { w: startWidth, h: startHeight };
    isResizingRef.current = true;

    const onMove = (ev) => {
      const canvasX = (ev.clientX - rect.left) / s;
      const canvasY = (ev.clientY - rect.top) / s;
      scheduleResizeApply(canvasX, canvasY);
    };
    const onUp = () => {
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
    const startWidth = textBoxWidth;
    const startHeight = textBoxHeight;
    const t0 = e.touches[0];
    const startPointerX = (t0.clientX - rect.left) / s;
    const startPointerY = (t0.clientY - rect.top) / s;
    resizeAnchorRef.current = {
      anchorX,
      anchorY,
      startWidth,
      startHeight,
      startPointerX,
      startPointerY,
    };
    resizeSmoothRef.current = { w: startWidth, h: startHeight };
    isResizingRef.current = true;

    const onMove = (ev) => {
      const touch = ev.touches[0];
      if (!touch) return;
      const canvasX = (touch.clientX - rect.left) / s;
      const canvasY = (touch.clientY - rect.top) / s;
      scheduleResizeApply(canvasX, canvasY);
    };
    const onEnd = () => {
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
      const fontFamilies = [...new Set(texts.map((t) => t.fontFamily || DEFAULT_SIGNAGE_FONT))];
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
              widthInches:
                textWidthInches != null
                  ? Math.round(textWidthInches * 100) / 100
                  : widthInches != null
                    ? Math.round(widthInches * 100) / 100
                    : null,
              heightInches:
                textHeightInches != null
                  ? Math.round(textHeightInches * 100) / 100
                  : heightInches != null
                    ? Math.round(heightInches * 100) / 100
                    : null,
              size: selectedSize,
              signageType: signageType === "vinyl" ? "vinyl" : "acrylic",
              rushProduction: !!rushProduction,
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

  const previewTextWidthIn = textWidthInches ?? widthInches;
  const previewTextHeightIn = textHeightInches ?? heightInches;

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
                className="text-2xl md:text-3xl font-bold text-[#2D2926]"
                style={{ fontFamily: "'Public Sans', sans-serif" }}
              >
                Acrylic and Vinyl Signage
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
                {(Number(printFilePrepFee) > 0 || rushProduction) ? (
                  <>
                    <div className="text-sm text-black">
                      Initial: ${Number(basePrice ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {Number(printFilePrepFee) > 0 && (
                        <> + Print file preparation (${Number(printFilePrepFee).toFixed(2)})</>
                      )}
                      {rushProduction && Number(rushFee) > 0 && (
                        <> + Rush production +30% (${Number(rushFee).toFixed(2)})</>
                      )}
                    </div>
                    <div className="text-xl font-bold text-black mt-0.5">
                      ${Number(currentPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </>
                ) : (
                  <div className="text-xl font-bold text-black">
                    ${Number(currentPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
                <div
                  className="text-sm text-gray-600 mt-0.5"
                  title="Printed text size (glyph bounds), aligned with design apps like Illustrator"
                >
                  {previewTextWidthIn != null &&
                  previewTextHeightIn != null &&
                  (previewTextWidthIn > 0 || previewTextHeightIn > 0)
                    ? `${Number(previewTextWidthIn).toFixed(2)} in × ${Number(previewTextHeightIn).toFixed(2)} in`
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

            {/* RIGHT SIDE - Preview + Note (sticky together) */}
            <div className="lg:col-span-2 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white p-5 rounded-xl shadow flex flex-col min-h-[400px]">
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
                    Drag the corner handle on the text to resize. Drag the text to move it.
                  </p>
                )}
              </div>

              {/* Note section below preview */}
              {!isSharedView && (
                <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Note:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>All Acrylic comes in 1/8&quot; thickness.</li>
                    <li>All sign and vinyl orders have a 7 day lead time.</li>
                    <li>All acrylic and vinyl sign orders must be picked up at our location in Anaheim.</li>
                    <li>Any acrylic sign or vinyl orders added to current rental orders will be delivered with rental items.</li>
                    <li>
                      If a thicker acrylic or color is preferred, please feel free to{" "}
                      <Link
                        to="/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2D2926] underline font-medium hover:opacity-80"
                      >
                        contact us
                      </Link>
                      .
                    </li>
                  </ul>
                </div>
              )}
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
