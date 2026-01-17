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
import { createCanvasPreview } from "../../utils/signageCart";

const SignageEditorContent = () => {
  const { id: productId, token } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const canvasRef = useRef(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedSignage, setSharedSignage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Move drag state to local component to prevent context rerenders
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTextClicked, setIsTextClicked] = useState(false);

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
    getTextsFromContent,
    loadSignage,
    currentPrice,
    canvasWidth,
    canvasHeight,
  } = useSignage();

  // Track if we've initialized the position for this session
  const positionInitializedRef = useRef(false);

  // Ensure text is centered on initial load (for all new signages, not shared ones)
  useEffect(() => {
    if (!token && !loading && !isSharedView && !positionInitializedRef.current) {
      // Calculate center position accounting for text block dimensions
      // Since we use translate(-50%, -50%), the position should be the center of the canvas
      // The translate will handle moving it by half width/height
      const centerPosition = { 
        x: (canvasWidth || 800) / 2, 
        y: (canvasHeight || 500) / 2 
      };
      
      setTextPosition(centerPosition);
      positionInitializedRef.current = true;
    }
  }, [token, loading, isSharedView, setTextPosition]);

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

  // Handle mouse down on text
  const handleTextMouseDown = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    // Update drag offset first (no rerender needed)
    setDragOffset({
      x: e.clientX - rect.left - textPosition.x,
      y: e.clientY - rect.top - textPosition.y,
    });
    // Use flushSync to batch updates, or better - use a single state update
    setIsDragging(true);
    setIsTextClicked(true);
  };

  // Handle touch start
  const handleTextTouchStart = (e) => {
    if (isSharedView) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    // Update drag offset first (no rerender needed)
    setDragOffset({
      x: touch.clientX - rect.left - textPosition.x,
      y: touch.clientY - rect.top - textPosition.y,
    });
    // Single state update
    setIsDragging(true);
    setIsTextClicked(true);
  };

  // Use ref for drag position to prevent rerenders - only update context on drag end
  const dragPositionRef = useRef(null);

  // Handle mouse move - update ref only, no state updates during drag
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.4;
    const dynamicHeight = Math.max(
      textSize.height,
      (lines.length - 1) * lineHeight + fontSize
    );
    
    const clampedX = Math.max(textSize.width / 2, Math.min(newX, (canvasWidth || 800) - textSize.width / 2));
    const clampedY = Math.max(dynamicHeight / 2, Math.min(newY, (canvasHeight || 500) - dynamicHeight / 2));

    // Store in ref - no rerender triggered, preview component reads from ref
    dragPositionRef.current = { x: clampedX, y: clampedY };
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const newX = touch.clientX - rect.left - dragOffset.x;
    const newY = touch.clientY - rect.top - dragOffset.y;

    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.4;
    const dynamicHeight = Math.max(
      textSize.height,
      (lines.length - 1) * lineHeight + fontSize
    );
    
    const clampedX = Math.max(textSize.width / 2, Math.min(newX, (canvasWidth || 800) - textSize.width / 2));
    const clampedY = Math.max(dynamicHeight / 2, Math.min(newY, (canvasHeight || 500) - dynamicHeight / 2));

    // Store in ref - no rerender triggered, preview component reads from ref
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
    const texts = getTextsFromContent();
    if (texts.length === 0) {
      toast.error("Please enter some text");
      return;
    }

    // Create preview and add to cart (metadata stored in order, no separate signage entity)
    createCanvasPreview(
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundImageUrl,
      getTextsFromContent,
      (previewUrl) => {
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
        // Don't navigate - just show the toast
      },
      canvasWidth,
      canvasHeight
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Import Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Great+Vibes&family=Satisfy&family=Allura&family=Lobster&family=Playball&family=Tangerine:wght@400&family=Cookie&family=Amatic+SC:wght@400;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="max-w-7xl mx-auto px-6 pt-32">
          <SignageHeader
            isSharedView={isSharedView}
            sharedSignage={sharedSignage}
            onBack={() => navigate(-1)}
          />

          {/* Main Layout: Controls Left, Canvas Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <SignageControls
              isSharedView={isSharedView}
              onAddToCart={handleAddToCart}
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

            {/* RIGHT SIDE - CANVAS (Sticky) */}
            <div className="lg:col-span-2 h-[calc(100vh-200px)]">
              <div className="bg-white p-5 rounded-xl shadow h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold text-[#2D2926]">
                    Preview
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-xl font-bold text-[#8B5C42]">
                      ${currentPrice || 0}
                    </div>
                  </div>
                </div>
                <SignagePreview
                  isEditable={!isSharedView}
                  canvasRef={canvasRef}
                  dragPositionRef={dragPositionRef}
                  isDragging={isDragging}
                  isTextClicked={isTextClicked}
                  onTextMouseDown={handleTextMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTextTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                />
                {!isSharedView && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Click and drag text to reposition
                  </p>
                )}
                
                {/* Background Image Options - Only show if cart has items */}
                {!isSharedView && cartItems.length > 0 && (
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
