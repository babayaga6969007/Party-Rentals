import { useRef, useState, useEffect, useLayoutEffect, forwardRef } from "react";
import {
  useSignage,
  getBoardBounds,
  clampTextCenterInBoard,
  normalizeHexColor,
  textBoxWidthPxToInches,
  textBoxHeightPxForAspectWidthPx,
  signageTextHeightInchesForWidthInches,
  SIGNAGE_TEXT_ASPECT_H_PER_W,
} from "../../context/SignageContext";

const SignagePreview = forwardRef(
  (
    {
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
      isTextClicked,
      onScaleChange,
      className = "",
    },
    ref
  ) => {
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
      canvasWidth,
      canvasHeight,
      textBoxWidth,
      textBoxHeight,
      setTextBoxWidth,
      setTextBoxHeight,
      setTextExtentInches,
      setContentMinSize,
      textWidthInches,
      verticalBoardImageUrl,
      boardClampRect,
      setVerticalBoardNaturalSize,
    } = useSignage();

    const textMeasureRef = useRef(null);
    const visibleTextRef = useRef(null);
    const [baseBoxHeightState, setBaseBoxHeightState] = useState(
      (textSize?.height ?? 60) * (userTextScale ?? 1)
    );
    const [capScaleFactor, setCapScaleFactor] = useState(1);

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

    const scale =
      containerSize.width > 0 && containerSize.height > 0
        ? Math.max(containerSize.width / cw, containerSize.height / ch)
        : 1;

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  useEffect(() => {
    setVerticalBoardNaturalSize(null);
  }, [verticalBoardImageUrl, setVerticalBoardNaturalSize]);

    useEffect(
      () => () => {
        setTextExtentInches(null, null);
      },
      [setTextExtentInches]
    );

    const isDragging = propIsDragging;
    void isTextClicked;
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
        ? liveDragPosition || localDragPosition
        : textPosition;

    const displayText = (textContent?.trim() || "Hello").replace(/\n/g, " ").trim() || "Hello";

    const containerBackgroundStyle =
      backgroundType === "color" && backgroundGradient
        ? { background: backgroundGradient }
        : backgroundType === "color"
          ? { backgroundColor: backgroundColor || "#F8F9FA" }
          : { backgroundColor: "#e5e7eb" };

    const b = getBoardBounds(cw, ch);
    const hasSize = containerSize.width > 0 && containerSize.height > 0;
    const rawCenterX = displayPosition.x != null ? displayPosition.x : b.left + b.width / 2;
    const rawCenterY = displayPosition.y != null ? displayPosition.y : b.top + b.height * 0.72;
    const { x: centerX, y: centerY } = clampTextCenterInBoard(
      boardClampRect,
      rawCenterX,
      rawCenterY,
      textBoxWidth,
      textBoxHeight,
      ch,
      cw
    );
    const canvasTop = hasSize ? containerSize.height - ch * scale : 0;
    const canvasLeft = hasSize ? containerSize.width / 2 - (cw * scale) / 2 : 0;
    const textLeftPx = hasSize ? canvasLeft + centerX * scale : null;
    const textTopPx = hasSize ? canvasTop + centerY * scale : null;
    const textBoxWidthPx = hasSize ? (effectiveTextSize?.width ?? 250) * scale : 0;
    const textBoxHeightPx = hasSize ? (effectiveTextSize?.height ?? 60) * scale : 0;

    const boundaryW = boardClampRect.width > 0 ? boardClampRect.width : null;
    const boxWidthInches =
      boundaryW != null ? textBoxWidthPxToInches(textBoxWidth, boundaryW) : null;
    const boxHeightInches =
      boxWidthInches != null ? signageTextHeightInchesForWidthInches(boxWidthInches) : null;
    const formatInches = (v) => (v != null ? `${Number(v).toFixed(2)} in` : "—");

    const baseBoxHeight = baseBoxHeightState;
    const fontScaleFromBox = baseBoxHeight > 0 ? textBoxHeight / baseBoxHeight : 1;
    const scaledFontSize = hasSize
      ? effectiveFontSize * fontScaleFromBox * scale * capScaleFactor
      : effectiveFontSize;

    // Measured text width → box height from 90×26″ rule; cap to painted board.
    useLayoutEffect(() => {
      if (!scale || scale <= 0 || !textMeasureRef.current) return;
      const el = textMeasureRef.current;
      const rect = el.getBoundingClientRect();
      const measuredW = rect.width / scale;
      const tightW = Math.max(1, Math.ceil(measuredW));
      const bw = Math.max(1, boardClampRect.width || 1);
      const bh = Math.max(1, boardClampRect.height || 1);
      const maxWpx = bw;
      const maxHpx = bh;
      const k = (bh / bw) * SIGNAGE_TEXT_ASPECT_H_PER_W;
      let cap = 1;
      if (tightW > maxWpx) cap = Math.min(cap, maxWpx / tightW);
      let newW = Math.max(1, Math.ceil(tightW * cap));
      let newH = Math.max(1, Math.ceil(textBoxHeightPxForAspectWidthPx(newW, bw, bh)));
      if (newH > maxHpx) {
        newH = maxHpx;
        newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
      }
      if (newW > maxWpx) {
        newW = maxWpx;
        newH = Math.max(1, Math.ceil(textBoxHeightPxForAspectWidthPx(newW, bw, bh)));
        if (newH > maxHpx) {
          newH = maxHpx;
          newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
        }
      }
      if (maxWpx > 0 && newW >= maxWpx - 1.5) {
        newW = maxWpx;
        newH = Math.max(1, Math.ceil(textBoxHeightPxForAspectWidthPx(newW, bw, bh)));
        if (newH > maxHpx) {
          newH = maxHpx;
          newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
        }
      }
      setCapScaleFactor(cap < 1 ? cap : 1);
      setBaseBoxHeightState(newH);
      setTextBoxWidth(newW);
      setTextBoxHeight(newH);
      setContentMinSize(newW, newH);
    }, [
      displayText,
      selectedFont,
      effectiveFontSize,
      scale,
      setTextBoxWidth,
      setTextBoxHeight,
      setContentMinSize,
      cw,
      boardClampRect.width,
      boardClampRect.height,
    ]);

    // Illustrator-style glyph bounds from the same pixels users see (scaled font).
    useLayoutEffect(() => {
      const el = visibleTextRef.current;
      if (!el || !scale || scale <= 0) {
        setTextExtentInches(null, null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) {
        setTextExtentInches(null, null);
        return;
      }
      const wCanvas = r.width / scale;
      const bw = boardClampRect.width;
      const wIn = bw > 0 ? textBoxWidthPxToInches(wCanvas, bw) : null;
      const hIn = wIn != null ? signageTextHeightInchesForWidthInches(wIn) : null;
      setTextExtentInches(wIn, hIn);
    }, [
      displayText,
      selectedFont,
      scaledFontSize,
      textBoxWidth,
      textBoxHeight,
      capScaleFactor,
      scale,
      boardClampRect.width,
      setTextExtentInches,
    ]);

    const setContainerRef = (el) => {
      containerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const s = hasSize ? scale : 1;

    const labelWidthIn = textWidthInches ?? boxWidthInches;
    const labelHeightIn =
      labelWidthIn != null ? signageTextHeightInchesForWidthInches(labelWidthIn) : boxHeightInches;

    return (
      <div
        ref={setContainerRef}
        className={`flex-1 flex relative min-h-[520px] overflow-hidden ${className}`}
        style={containerBackgroundStyle}
      >
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
            whiteSpace: "nowrap",
            display: "inline-block",
            lineHeight: 0.85,
          }}
        >
          {displayText}
        </div>
        {backgroundType === "image" && backgroundImageUrl && (
          <img
            src={backgroundImageUrl}
            alt=""
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ zIndex: 0 }}
          />
        )}
        <div
          ref={actualRef}
          className="absolute overflow-hidden"
          style={{
            left: "50%",
            bottom: 0,
            width: cw * s,
            height: ch * s,
            marginLeft: -(cw * s) / 2,
            zIndex: 1,
            backgroundColor: "transparent",
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              left: b.left * s,
              top: b.top * s,
              width: b.width * s,
              height: b.height * s,
              zIndex: 2,
            }}
          >
            <img
              src={verticalBoardImageUrl || "/signage/vertical-board.png"}
              alt="Board"
              crossOrigin="anonymous"
              className="w-full h-full object-contain object-bottom"
              onLoad={(e) => {
                const el = e.currentTarget;
                setVerticalBoardNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
              }}
            />
          </div>
        </div>
        <div
          className="absolute overflow-visible"
          style={{
            left: hasSize ? canvasLeft : "50%",
            top: hasSize ? canvasTop : "65%",
            width: hasSize ? cw * scale : "40%",
            height: hasSize ? ch * scale : "55%",
            transform: hasSize ? undefined : "translate(-50%, -50%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            data-text-id="text-0"
            data-text-content={displayText}
            onMouseDown={onTextMouseDown}
            onTouchStart={onTouchStart}
            className="absolute touch-none"
            style={{
              display: "grid",
              placeItems: "center",
              cursor: isEditable ? (isDragging ? "grabbing" : "grab") : "default",
              left: hasSize && textLeftPx != null ? textLeftPx - canvasLeft : "50%",
              top: hasSize && textTopPx != null ? textTopPx - canvasTop : "50%",
              transform: "translate(-50%, -50%)",
              width: textBoxWidthPx > 0 ? textBoxWidthPx : undefined,
              height: textBoxHeightPx > 0 ? textBoxHeightPx : undefined,
              minWidth: textBoxWidthPx > 0 ? textBoxWidthPx : undefined,
              minHeight: textBoxHeightPx > 0 ? textBoxHeightPx : undefined,
              boxSizing: "border-box",
              padding: 0,
              margin: 0,
              outline: "1px dotted rgba(0,0,0,0.55)",
              outlineOffset: 0,
              fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
              fontSize: scaledFontSize,
              fontWeight: "bold",
              color:
                selectedTextColor && selectedTextColor !== "transparent"
                  ? normalizeHexColor(selectedTextColor)
                  : "#1a1a1a",
              textShadow: "0 0 8px #fff, 2px 2px 4px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
              textAlign: "center",
              pointerEvents: isEditable ? "auto" : "none",
            }}
          >
            <span
              ref={visibleTextRef}
              style={{
                display: "inline-block",
                lineHeight: 0.85,
                padding: 0,
                margin: 0,
                verticalAlign: "middle",
                maxWidth: "100%",
              }}
            >
              {displayText}
            </span>
            <div
              className="absolute left-1/2 bottom-0 font-normal tabular-nums text-gray-700 bg-white -translate-x-1/2 translate-y-1/2 border border-gray-400 rounded shadow-sm"
              style={{
                pointerEvents: "none",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: Math.max(10, 10 * scale),
                padding: `${2 * scale}px ${4 * scale}px`,
              }}
            >
              {labelWidthIn != null ? formatInches(labelWidthIn) : "—"}
            </div>
            <div
              className="absolute right-0 top-1/2 font-normal tabular-nums text-gray-700 bg-white -translate-y-1/2 translate-x-1/2 border border-gray-400 rounded shadow-sm whitespace-nowrap"
              style={{
                pointerEvents: "none",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: Math.max(10, 10 * scale),
                padding: `${2 * scale}px ${4 * scale}px`,
              }}
            >
              {labelHeightIn != null ? formatInches(labelHeightIn) : "—"}
            </div>
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
                  <path
                    d="M0 0 L12 12 M4 0 L12 8 M8 0 L12 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SignagePreview.displayName = "SignagePreview";
export default SignagePreview;
