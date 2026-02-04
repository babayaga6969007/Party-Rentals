import { useRef, useState, useEffect, useLayoutEffect, useImperativeHandle, forwardRef } from "react";
import { useSignage } from "../../context/SignageContext";

const ZOOM_STAGE_PADDING = 4000;

const SignagePreview = forwardRef(({
  isEditable = true,
  onTextMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  canvasRef,
  dragPositionRef,
  isDragging: propIsDragging,
  isTextClicked, // passed by parent for future use
  zoom = 1,
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
    fontSize,
    getTextLines,
    canvasWidth,
    canvasHeight,
  } = useSignage();

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

  const fitScale =
    containerSize.width > 0 && containerSize.height > 0
      ? Math.min(1, containerSize.width / cw, containerSize.height / ch)
      : 1;
  const scale = fitScale * (zoom || 1);
  const prevScaleRef = useRef(scale);
  const prevZoomRef = useRef(zoom ?? 1);

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  useImperativeHandle(ref, () => ({
    recenter() {
      const el = containerRef.current;
      if (!el) return;
      const isZoomed = (zoom ?? 1) > 1;
      if (!isZoomed) return;
      const contentW = cw * scale;
      const contentH = ch * scale;
      const clientW = el.clientWidth;
      const clientH = el.clientHeight;
      // Center content in viewport; allow negative offset when content is smaller than viewport
      const targetLeft = ZOOM_STAGE_PADDING + (contentW - clientW) / 2;
      const targetTop = ZOOM_STAGE_PADDING + (contentH - clientH) / 2;
      el.scrollLeft = Math.max(0, Math.min(el.scrollWidth - clientW, targetLeft));
      el.scrollTop = Math.max(0, Math.min(el.scrollHeight - clientH, targetTop));
    },
  }), [zoom, scale, cw, ch]);

  // When zoomed: scroll so viewport is centered on the content (content sits at PADDING, PADDING in the stage)
  useLayoutEffect(() => {
    const el = containerRef.current;
    const currentZoom = zoom ?? 1;
    const wasZoomed = prevZoomRef.current > 1;
    const isZoomed = currentZoom > 1;

    if (!el || !isZoomed) {
      prevScaleRef.current = scale;
      prevZoomRef.current = currentZoom;
      return;
    }

    const contentW = cw * scale;
    const contentH = ch * scale;
    const clientW = el.clientWidth;
    const clientH = el.clientHeight;

    const justEnteredZoom = !wasZoomed;
    if (justEnteredZoom) {
      const targetScrollLeft = Math.max(0, Math.min(el.scrollWidth - clientW, ZOOM_STAGE_PADDING + (contentW - clientW) / 2));
      const targetScrollTop = Math.max(0, Math.min(el.scrollHeight - clientH, ZOOM_STAGE_PADDING + (contentH - clientH) / 2));
      el.scrollLeft = targetScrollLeft;
      el.scrollTop = targetScrollTop;
      // Apply again next frame so we win over any default scroll (0,0) after layout
      const raf = requestAnimationFrame(() => {
        if (containerRef.current === el) {
          el.scrollLeft = targetScrollLeft;
          el.scrollTop = targetScrollTop;
        }
      });
      prevScaleRef.current = scale;
      prevZoomRef.current = currentZoom;
      return () => cancelAnimationFrame(raf);
    }

    const prevScale = prevScaleRef.current;
    if (prevScale > 0 && Math.abs(scale - prevScale) > 0.001) {
      const viewCenterX = el.scrollLeft + clientW / 2;
      const viewCenterY = el.scrollTop + clientH / 2;
      const contentX = viewCenterX - ZOOM_STAGE_PADDING;
      const contentY = viewCenterY - ZOOM_STAGE_PADDING;
      const canvasX = contentX / prevScale;
      const canvasY = contentY / prevScale;
      el.scrollLeft = Math.max(0, ZOOM_STAGE_PADDING + canvasX * scale - clientW / 2);
      el.scrollTop = Math.max(0, ZOOM_STAGE_PADDING + canvasY * scale - clientH / 2);
    }
    prevScaleRef.current = scale;
    prevZoomRef.current = currentZoom;
  }, [scale, zoom, cw, ch]);

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
    isDragging && localDragPosition ? localDragPosition : textPosition;

  let lines = getTextLines();
  if (lines.length === 0 && textContent?.trim()) lines = [textContent.trim()];
  if (lines.length === 0) lines = ["Hello"];

  const isZoomed = (zoom || 1) > 1;
  const scaleFromCenter = !isZoomed;
  const transform = scaleFromCenter
    ? `translate(${-(cw * (1 - scale)) / 2}px, ${-(ch * (1 - scale)) / 2}px) scale(${scale})`
    : `scale(${scale})`;
  const transformOrigin = scaleFromCenter ? "center center" : "top left";

  const stageW = 2 * ZOOM_STAGE_PADDING + cw * scale;
  const stageH = 2 * ZOOM_STAGE_PADDING + ch * scale;

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex relative min-h-0 p-4 ${className} ${
        isZoomed ? "overflow-auto" : "overflow-hidden"
      } ${isZoomed ? "items-start justify-start" : "items-center justify-center"}`}
    >
      <div
        className="relative shrink-0"
        style={
          isZoomed
            ? { width: stageW, height: stageH }
            : { width: cw * scale, height: ch * scale, maxWidth: "100%", maxHeight: "100%" }
        }
      >
        <div
          className="shrink-0"
          style={
            isZoomed
              ? {
                  position: "absolute",
                  left: ZOOM_STAGE_PADDING,
                  top: ZOOM_STAGE_PADDING,
                  width: cw * scale,
                  height: ch * scale,
                }
              : {
                  width: cw * scale,
                  height: ch * scale,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }
          }
        >
        <div
          ref={actualRef}
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${cw}px`,
            height: `${ch}px`,
            transform,
            transformOrigin,
            backgroundColor:
              backgroundType === "color" && !backgroundGradient
                ? backgroundColor || "#F8F9FA"
                : backgroundType === "image"
                ? "#f8f9fa"
                : "transparent",
            background:
              backgroundType === "color" && backgroundGradient
                ? backgroundGradient
                : "none",
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {backgroundType === "image" && backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 1 }}
            />
          )}
          {lines.map((line, index) => {
            const lineHeightCalc = fontSize * 1.4;
            const totalHeight = (lines.length - 1) * lineHeightCalc;
            const startY = displayPosition.y - totalHeight / 2;
            const canvasW = canvasWidth || 600;
            const canvasH = canvasHeight || 1200;
            const textSizeW = textSize.width || 250;
            const textSizeH = textSize.height || 60;
            let clampedX = displayPosition.x;
            let clampedY = startY + index * lineHeightCalc;
            if (
              displayPosition.x == null ||
              displayPosition.y == null ||
              displayPosition.x < 0 ||
              displayPosition.y < 0 ||
              displayPosition.x > canvasW ||
              displayPosition.y > canvasH
            ) {
              clampedX = textSizeW / 2 + 20;
              clampedY = textSizeH / 2 + 50 + index * lineHeightCalc;
            } else {
              clampedX = Math.max(
                textSizeW / 2,
                Math.min(displayPosition.x, canvasW - textSizeW / 2)
              );
              clampedY = Math.max(
                textSizeH / 2,
                Math.min(
                  startY + index * lineHeightCalc,
                  canvasH - textSizeH / 2
                )
              );
            }
            return (
              <div
                key={`text-line-${index}-${selectedFont}`}
                data-text-id={`text-${index}`}
                data-text-content={line || textContent || "Hello"}
                onMouseDown={onTextMouseDown}
                onTouchStart={onTouchStart}
                className={`absolute ${isEditable ? "cursor-move touch-none" : ""}`}
                style={{
                  left: `${clampedX}px`,
                  top: `${clampedY}px`,
                  fontSize: `${fontSize}px`,
                  fontFamily: selectedFont || "'Farmhouse', cursive",
                  color: selectedTextColor || "#000000",
                  textShadow: `
                    1px 1px 2px rgba(0, 0, 0, 0.5),
                    0 0 8px rgba(255, 255, 255, 0.6)
                  `,
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  transform: "translate(-50%, -50%)",
                  WebkitUserSelect: "none",
                  zIndex: 15,
                  pointerEvents: "auto",
                  fontWeight: "bold",
                }}
              >
                {line || textContent || "Hello"}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
});

SignagePreview.displayName = "SignagePreview";
export default SignagePreview;
