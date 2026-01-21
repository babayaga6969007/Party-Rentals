import { useRef, useState, useEffect, memo } from "react";
import { useSignage } from "../../context/SignageContext";

const SignagePreview = memo(({ 
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
  isTextClicked: propIsTextClicked,
  className = "",
}) => {
  const internalCanvasRef = useRef(null);
  const actualRef = canvasRef || internalCanvasRef;
  // Use local state for hover and drag position to prevent context rerenders
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [localDragPosition, setLocalDragPosition] = useState(null);
  
  const {
    selectedFont,
    selectedTextColor,
    textPosition,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImageUrl,
    textSize,
    fontSize,
    getLinePositions,
    getTextLines,
    canvasWidth,
    canvasHeight,
  } = useSignage();

  // Use props for drag state instead of context
  const isDragging = propIsDragging;
  const isTextClicked = propIsTextClicked;

  // Update local drag position from ref during drag (no context updates)
  const isDraggingRef = useRef(isDragging);
  const rafRef = useRef(null);
  
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    // Clean up any existing animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!isDragging) {
      setLocalDragPosition(null);
      return;
    }

    // Initialize with current position
    if (dragPositionRef?.current) {
      setLocalDragPosition({ ...dragPositionRef.current });
    }

    const updatePosition = () => {
      if (isDraggingRef.current) {
        if (dragPositionRef?.current) {
          setLocalDragPosition({ ...dragPositionRef.current });
        }
        rafRef.current = requestAnimationFrame(updatePosition);
      } else {
        rafRef.current = null;
      }
    };
    
    // Start the animation loop immediately
    rafRef.current = requestAnimationFrame(updatePosition);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, dragPositionRef]);

  // Use local drag position if dragging, otherwise use context position
  const displayPosition = (isDragging && localDragPosition) 
    ? localDragPosition 
    : textPosition;

  // Calculate dynamic border height based on number of lines
  const lines = getTextLines();
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = Math.max(
    textSize.height,
    (lines.length - 1) * lineHeight + fontSize
  );
  const borderWidth = textSize.width;
  const borderHeight = totalTextHeight;
  const showBorder = isTextHovered || isTextClicked || isDragging;

  return (
    <div className={`flex-1 flex items-center justify-center relative overflow-auto min-h-0 p-4 ${className}`}>
      <div className="flex items-center justify-center w-full h-full">
        <div
          ref={actualRef}
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden shrink-0"
          style={{
            width: `${canvasWidth || 800}px`,
            height: `${canvasHeight || 500}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: `${canvasWidth || 800} / ${canvasHeight || 500}`,
            backgroundColor: backgroundType === "color" && !backgroundGradient ? backgroundColor : "transparent",
            background: backgroundType === "color" && backgroundGradient 
              ? backgroundGradient 
              : "none",
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Background Image as img element for better control */}
          {backgroundType === "image" && backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="Background"
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          )}
          {/* Text container with border showing dimensions */}
          {lines.length > 0 && (
            <div
              onMouseDown={onTextMouseDown}
              onTouchStart={onTouchStart}
              onMouseEnter={isEditable ? () => setIsTextHovered(true) : undefined}
              onMouseLeave={isEditable ? () => setIsTextHovered(false) : undefined}
              className={`absolute ${isEditable ? "cursor-move touch-none" : ""} ${
                isDragging ? "ring-2 ring-[#8B5C42]" : ""
              }`}
              style={{
                left: `${displayPosition.x}px`,
                top: `${displayPosition.y}px`,
                width: `${borderWidth}px`,
                height: `${borderHeight}px`,
                transform: "translate(-50%, -50%)",
                border: showBorder ? "2px dashed rgba(139, 92, 66, 0.6)" : "none",
                pointerEvents: "auto",
                boxSizing: "border-box",
                transition: isDragging ? "none" : (showBorder ? "border 0.15s ease" : "none"),
                willChange: isDragging ? "left, top" : "auto",
              }}
            >
              {/* Dimension labels - always visible */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#8B5C42] font-medium whitespace-nowrap bg-white px-1 rounded shadow-sm">
                W: {textSize.width}px
              </div>
              <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-xs text-[#8B5C42] font-medium whitespace-nowrap bg-white px-1 rounded shadow-sm">
                H: {Math.round(borderHeight)}px
              </div>
            </div>
          )}
          
          {/* Text lines */}
          {lines.map((line, index) => {
            // Calculate positions based on display position (local drag or context)
            const lineHeight = fontSize * 1.4;
            const totalHeight = (lines.length - 1) * lineHeight;
            const startY = displayPosition.y - (totalHeight / 2);
            const pos = {
              x: displayPosition.x,
              y: startY + (index * lineHeight),
            };
            
            return (
              <div
                key={index}
                onMouseDown={onTextMouseDown}
                onTouchStart={onTouchStart}
                onMouseEnter={isEditable ? () => setIsTextHovered(true) : undefined}
                onMouseLeave={isEditable ? () => setIsTextHovered(false) : undefined}
                className={`absolute ${isEditable ? "cursor-move touch-none" : ""}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  fontSize: `${fontSize}px`,
                  fontFamily: selectedFont,
                  color: selectedTextColor,
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  transform: "translate(-50%, -50%)",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  pointerEvents: "auto",
                  willChange: isDragging ? "left, top" : "auto",
                  transition: isDragging ? "none" : "none",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

SignagePreview.displayName = "SignagePreview";

export default SignagePreview;
