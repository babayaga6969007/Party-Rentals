import { useRef, useState, useEffect } from "react";
import { useSignage } from "../../context/SignageContext";

const SignagePreview = ({ 
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
  let lines = getTextLines();
  
  // Fallback: if no lines but textContent exists, create a line
  if (lines.length === 0 && textContent && textContent.trim()) {
    lines = [textContent.trim()];
  }
  
  // Debug: Ensure we have lines to render
  if (lines.length === 0 && (!textContent || !textContent.trim())) {
    lines = ["Hello"]; // Fallback text
  }
  
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = Math.max(
    textSize.height,
    (lines.length - 1) * lineHeight + fontSize
  );
  const borderWidth = textSize.width;
  const borderHeight = totalTextHeight;
  const showBorder = false; // Always hide borders

  return (
    <div className={`flex-1 flex items-center justify-center relative overflow-auto min-h-0 p-4 ${className}`}>
      <div className="flex items-center justify-center w-full h-full">
        <div
          ref={actualRef}
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden shrink-0"
          style={{
            width: `${canvasWidth || 600}px`,
            height: `${canvasHeight || 1200}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: `${canvasWidth || 600} / ${canvasHeight || 1200}`,
            backgroundColor: backgroundType === "color" && !backgroundGradient 
              ? backgroundColor 
              : backgroundType === "image" 
              ? "#f8f9fa" 
              : "transparent",
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
                objectFit: "cover",
                objectPosition: "center",
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            />
          )}
          {/* Text container - no borders, no dimension labels */}
          
          {/* Text lines */}
          {lines.length > 0 && lines.map((line, index) => {
            // Calculate positions based on display position (local drag or context)
            const lineHeight = fontSize * 1.4;
            const totalHeight = (lines.length - 1) * lineHeight;
            const startY = displayPosition.y - (totalHeight / 2);
            
            // Ensure position is within canvas bounds - position at top-left if invalid
            const canvasW = canvasWidth || 600;
            const canvasH = canvasHeight || 1200;
            const textSizeW = textSize.width || 250;
            const textSizeH = textSize.height || 60;
            
            // Default to top-left if position seems invalid
            let clampedX = displayPosition.x;
            let clampedY = startY + (index * lineHeight);
            
            // If position is way off or invalid, use top-left
            if (!displayPosition.x || !displayPosition.y || 
                displayPosition.x < 0 || displayPosition.y < 0 ||
                displayPosition.x > canvasW || displayPosition.y > canvasH) {
              clampedX = textSizeW / 2 + 20;
              clampedY = (textSizeH / 2 + 50) + (index * lineHeight);
            } else {
              clampedX = Math.max(textSizeW / 2, Math.min(displayPosition.x, canvasW - textSizeW / 2));
              clampedY = Math.max(textSizeH / 2, Math.min(startY + (index * lineHeight), canvasH - textSizeH / 2));
            }
            
            const pos = {
              x: clampedX,
              y: clampedY,
            };
            
            return (
              <div
                key={`text-line-${index}-${selectedFont}`}
                onMouseDown={onTextMouseDown}
                onTouchStart={onTouchStart}
                onMouseEnter={isEditable ? () => setIsTextHovered(true) : undefined}
                onMouseLeave={isEditable ? () => setIsTextHovered(false) : undefined}
                className={`absolute ${isEditable ? "cursor-move touch-none" : ""}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
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
                  WebkitTouchCallout: "none",
                  pointerEvents: "auto",
                  willChange: isDragging ? "left, top" : "auto",
                  transition: isDragging ? "none" : "none",
                  fontWeight: "bold",
                  mixBlendMode: "normal",
                }}
              >
                {line || textContent || "Hello"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

SignagePreview.displayName = "SignagePreview";

export default SignagePreview;
