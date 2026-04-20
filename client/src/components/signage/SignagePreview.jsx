import { useRef, useState, useEffect, forwardRef } from "react";
import { useSignage, getBoardBounds } from "../../context/SignageContext";
import SignagePreviewText from "./SignagePreviewText";

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
      textPosition,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundImageUrl,
      canvasWidth,
      canvasHeight,
      setTextExtentInches,
      verticalBoardImageUrl,
      setVerticalBoardNaturalSize,
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

    // Cover: fill the preview flex area so the board stays large; one axis may extend past the
    // wrapper and clip (overflow:hidden). Math.min() would show the whole canvas but shrinks the
    // preview — users read that as “the container shrunk.”
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

    const containerBackgroundStyle =
      backgroundType === "color" && backgroundGradient
        ? { background: backgroundGradient }
        : backgroundType === "color"
          ? { backgroundColor: backgroundColor || "#F8F9FA" }
          : { backgroundColor: "#e5e7eb" };

    const b = getBoardBounds(cw, ch);
    const hasSize = containerSize.width > 0 && containerSize.height > 0;
    const canvasTop = hasSize ? containerSize.height - ch * scale : 0;
    const canvasLeft = hasSize ? containerSize.width / 2 - (cw * scale) / 2 : 0;

    const setContainerRef = (el) => {
      containerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const s = hasSize ? scale : 1;

    return (
      <div
        ref={setContainerRef}
        className={`flex-1 flex relative min-h-[520px] overflow-hidden ${className}`}
        style={containerBackgroundStyle}
      >
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
        <SignagePreviewText
          displayPosition={displayPosition}
          scale={scale}
          hasSize={hasSize}
          canvasLeft={canvasLeft}
          canvasTop={canvasTop}
          cw={cw}
          ch={ch}
          isEditable={isEditable}
          isDragging={isDragging}
          onTextMouseDown={onTextMouseDown}
          onTouchStart={onTouchStart}
          onResizeHandleMouseDown={onResizeHandleMouseDown}
          onResizeHandleTouchStart={onResizeHandleTouchStart}
        />
      </div>
    );
  }
);

SignagePreview.displayName = "SignagePreview";
export default SignagePreview;
