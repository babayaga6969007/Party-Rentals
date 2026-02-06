import { useRef, useState, useEffect, useLayoutEffect, useImperativeHandle, forwardRef } from "react";
import { useSignage, getBoardBounds } from "../../context/SignageContext";

const PADDING_X = 12;
const PADDING_Y = 8;
const MIN_BOX_WIDTH = 48;
const MIN_BOX_HEIGHT = 28;

const SignagePreview = forwardRef(({
  isEditable = true,
  onTextMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onResizeHandleMouseDown,
  onResizeHandleTouchStart,
  canvasRef,
  dragPositionRef,
  liveDragPosition,
  isDragging: propIsDragging,
  isTextClicked, // passed by parent for future use
  onScaleChange,
  className = "",
}, ref) => {
  const internalCanvasRef = useRef(null);
  const actualRef = canvasRef || internalCanvasRef;
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [localDragPosition, setLocalDragPosition] = useState(null);

  const {
    textContent,
    selectedFont,
    selectedTextColor,
    textPosition,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImageUrl,
    textSize,
    userTextScale,
    effectiveFontSize,
    effectiveTextSize,
    getTextLines,
    canvasWidth,
    canvasHeight,
    widthFt,
    heightFt,
    textBoxWidth,
    textBoxHeight,
    setTextBoxWidth,
    setTextBoxHeight,
    verticalBoardImageUrl,
  } = useSignage();
  const textMeasureRef = useRef(null);
  const lastMeasuredHeightRef = useRef(null);

  const cw = canvasWidth || 600;
  const ch = canvasHeight || 1200;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};
      if (width > 0 && height > 0) setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Canvas layer is full-bleed (100% container). Scale to cover so board is large and visible; pin bottom.
  const scale =
    containerSize.width > 0 && containerSize.height > 0
      ? Math.max(containerSize.width / cw, containerSize.height / ch)
      : 1;

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  useImperativeHandle(ref, () => ({}), []);

  const isDragging = propIsDragging;
  void isTextClicked; // reserved for future use
  const isDraggingRef = useRef(isDragging);
  const rafRef = useRef(null);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!isDragging) {
      queueMicrotask(() => setLocalDragPosition(null));
      return;
    }
    if (dragPositionRef?.current) {
      setLocalDragPosition({ ...dragPositionRef.current });
    }
    const updatePosition = () => {
      if (isDraggingRef.current && dragPositionRef?.current) {
        setLocalDragPosition({ ...dragPositionRef.current });
        rafRef.current = requestAnimationFrame(updatePosition);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(updatePosition);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging, dragPositionRef]);

  const displayPosition =
    isDragging && (liveDragPosition || localDragPosition)
      ? (liveDragPosition || localDragPosition)
      : textPosition;

  let lines = getTextLines();
  if (lines.length === 0 && textContent?.trim()) lines = [textContent.trim()];
  if (lines.length === 0) lines = ["Hello"];

  // Background and fallback color so something is always visible.
  const containerBackgroundStyle =
    backgroundType === "color" && backgroundGradient
      ? { background: backgroundGradient }
      : backgroundType === "color"
        ? { backgroundColor: backgroundColor || "#F8F9FA" }
        : { backgroundColor: "#e5e7eb" };

  const displayText = (textContent?.trim() || lines.join(' ') || "Hello").trim() || "Hello";
  const b = getBoardBounds(cw, ch);
  const hasSize = containerSize.width > 0 && containerSize.height > 0;
  const rawCenterX = displayPosition.x != null ? displayPosition.x : b.left + b.width / 2;
  const rawCenterY = displayPosition.y != null ? displayPosition.y : b.top + b.height * 0.72;
  const centerX = Math.max(b.left, Math.min(b.left + b.width, rawCenterX));
  const centerY = Math.max(b.top, Math.min(b.top + b.height, rawCenterY));
  const canvasTop = hasSize ? containerSize.height - ch * scale : 0;
  const canvasLeft = hasSize ? containerSize.width / 2 - (cw * scale) / 2 : 0;
  const textLeftPx = hasSize ? canvasLeft + centerX * scale : null;
  const textTopPx = hasSize ? canvasTop + centerY * scale : null;
  const boardLeft = hasSize ? canvasLeft + b.left * scale : 0;
  const boardTop = hasSize ? canvasTop + b.top * scale : 0;
  const boardWidth = hasSize ? b.width * scale : 0;
  const boardHeight = hasSize ? b.height * scale : 0;
  const textBoxWidthPx = hasSize ? (effectiveTextSize?.width ?? 250) * scale : 0;
  const textBoxHeightPx = hasSize ? (effectiveTextSize?.height ?? 60) * scale : 0;
  // Map canvas pixels to inches (sign physical size: widthFt x heightFt feet, canvas is canvasWidth x canvasHeight px)
  const wFt = widthFt ?? 4;
  const hFt = heightFt ?? 8;
  const widthInches = cw > 0 ? (textBoxWidth * wFt * 12) / cw : null;
  const heightInches = ch > 0 ? (textBoxHeight * hFt * 12) / ch : null;
  const formatInches = (v) => (v != null ? `${Number(v).toFixed(2)} in` : "—");
  // Base box height: use last measured height so auto-fit box has scale 1; when user resizes, font scales with box
  const baseBoxHeight = lastMeasuredHeightRef.current ?? (textSize?.height ?? 60) * (userTextScale ?? 1);
  const fontScaleFromBox = baseBoxHeight > 0 ? textBoxHeight / baseBoxHeight : 1;
  const scaledFontSize = hasSize ? effectiveFontSize * fontScaleFromBox * scale : effectiveFontSize;

  // Size the container to fit the text (align dimensions to text); measure at base font size
  useLayoutEffect(() => {
    if (!scale || scale <= 0 || !textMeasureRef.current) return;
    const el = textMeasureRef.current;
    const rect = el.getBoundingClientRect();
    const w = rect.width / scale + PADDING_X;
    const h = rect.height / scale + PADDING_Y;
    const newW = Math.max(MIN_BOX_WIDTH, Math.ceil(w));
    const newH = Math.max(MIN_BOX_HEIGHT, Math.ceil(h));
    lastMeasuredHeightRef.current = newH;
    setTextBoxWidth(newW);
    setTextBoxHeight(newH);
  }, [displayText, selectedFont, effectiveFontSize, scale, setTextBoxWidth, setTextBoxHeight]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex relative min-h-[520px] ${className}`}
      style={{ ...containerBackgroundStyle, overflow: "hidden" }}
    >
      {/* Hidden element to measure text size so container can align to text */}
      <div
        ref={textMeasureRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
          fontSize: (effectiveFontSize || 0) * (scale || 1),
          fontWeight: "bold",
          whiteSpace: "pre-line",
          display: "inline-block",
          lineHeight: 1.2,
        }}
      >
        {displayText}
      </div>
      {/* Background image: full-bleed so it always spans container */}
      {backgroundType === "image" && backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />
      )}
      <div
        className="relative flex items-center justify-center"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", minWidth: 0, minHeight: 0, zIndex: 1 }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
        <div
          ref={actualRef}
          className="relative overflow-hidden"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            width: `${cw}px`,
            height: `${ch}px`,
            marginLeft: -cw / 2,
            transform: `scale(${scale})`,
            transformOrigin: "center bottom",
            backgroundColor: "transparent",
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Board only - text is rendered above as direct child of container */}
          {(() => {
            const b = getBoardBounds(cw, ch);
            return (
              <div
                className="absolute overflow-hidden"
                style={{
                  left: b.left,
                  top: b.top,
                  width: b.width,
                  height: b.height,
                  zIndex: 2,
                }}
              >
                <img
                  src={verticalBoardImageUrl || "/signage/vertical-board.png"}
                  alt="Board"
                  className="w-full h-full object-contain object-bottom"
                />
              </div>
            );
          })()}
        </div>
        </div>
      </div>
      {/* Clip to board: text can be moved all over the board; anything outside is clipped. */}
      <div
        className="absolute"
        style={{
          left: hasSize ? boardLeft : "50%",
          top: hasSize ? boardTop : "65%",
          width: hasSize ? boardWidth : "40%",
          height: hasSize ? boardHeight : "55%",
          transform: hasSize ? undefined : "translate(-50%, -50%)",
          overflow: "hidden",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          data-text-id="text-0"
          data-text-content={displayText}
          onMouseDown={onTextMouseDown}
          onTouchStart={onTouchStart}
          className="absolute flex flex-col items-center justify-center touch-none"
          style={{
            cursor: isEditable ? (isDragging ? "grabbing" : "grab") : "default",
            left: hasSize && textLeftPx != null ? textLeftPx - boardLeft : "50%",
            top: hasSize && textTopPx != null ? textTopPx - boardTop : "50%",
            transform: "translate(-50%, -50%)",
            width: textBoxWidthPx > 0 ? textBoxWidthPx : undefined,
            height: textBoxHeightPx > 0 ? textBoxHeightPx : undefined,
            minWidth: textBoxWidthPx > 0 ? textBoxWidthPx : undefined,
            minHeight: textBoxHeightPx > 0 ? textBoxHeightPx : undefined,
            border: "1px dotted rgba(0,0,0,0.5)",
            boxSizing: "border-box",
            fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
            fontSize: scaledFontSize,
            fontWeight: "bold",
            color: selectedTextColor && selectedTextColor !== "transparent" ? selectedTextColor : "#1a1a1a",
            textShadow: "0 0 8px #fff, 2px 2px 4px rgba(0,0,0,0.9)",
            WebkitTextStroke: "1px rgba(0,0,0,0.8)",
            whiteSpace: "pre-line",
            textAlign: "center",
            pointerEvents: isEditable ? "auto" : "none",
          }}
        >
          <span className="flex-1 flex items-center justify-center px-1" style={{ minHeight: 0 }}>
            {displayText}
          </span>
          {/* Width on horizontal (bottom) border (inches) */}
          <div
                className="absolute left-1/2 bottom-0 font-normal tabular-nums text-gray-700 bg-white -translate-x-1/2 translate-y-1/2 border border-gray-400 rounded shadow-sm"
                style={{ pointerEvents: "none", fontSize: Math.max(10, 10 * scale), padding: `${2 * scale}px ${4 * scale}px` }}
              >
                {widthInches != null ? formatInches(widthInches) : Math.round(textBoxWidth) + " px"}
              </div>
              {/* Height on vertical (right) border (inches) */}
              <div
                className="absolute right-0 top-1/2 font-normal tabular-nums text-gray-700 bg-white -translate-y-1/2 translate-x-1/2 border border-gray-400 rounded shadow-sm whitespace-nowrap"
                style={{ pointerEvents: "none", fontSize: Math.max(10, 10 * scale), padding: `${2 * scale}px ${4 * scale}px` }}
              >
                {heightInches != null ? formatInches(heightInches) : Math.round(textBoxHeight) + " px"}
              </div>
          {/* Resize handle at bottom-right */}
          {isEditable && textBoxWidthPx > 0 && textBoxHeightPx > 0 && (
            <div
              role="button"
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResizeHandleMouseDown?.(e);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                onResizeHandleTouchStart?.(e);
              }}
              className="absolute right-0 bottom-0 w-4 h-4 touch-none flex items-center justify-center rounded-tl bg-gray-100 border border-gray-400 hover:bg-gray-200"
              style={{ pointerEvents: "auto", cursor: "nwse-resize" }}
              title="Resize"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-gray-600 shrink-0">
                <path d="M0 0 L12 12 M4 0 L12 8 M8 0 L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SignagePreview.displayName = "SignagePreview";
export default SignagePreview;
