import { useRef } from "react";
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "../../context/SignageContext";

/**
 * Static preview component that renders signage from saved data
 * Used in admin orders view to display signage previews
 */
const SignageStaticPreview = ({ 
  signageData, 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT 
}) => {
  const containerRef = useRef(null);

  if (!signageData) return null;

  const {
    backgroundType = "image",
    backgroundColor = "#F8F9FA",
    backgroundGradient,
    backgroundImageUrl,
    texts = [],
    textContent = "",
    fontFamily = "'Farmhouse', cursive",
    fontSize = 48,
    textColor = "#000000",
  } = signageData;

  // Get text lines from texts array or textContent
  const textLines = texts && texts.length > 0
    ? texts.map(t => typeof t === 'string' ? t : (t.content || t.text || ''))
    : (textContent ? textContent.split('\n').filter(line => line.trim()) : []);

  // Calculate text positions
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = (textLines.length - 1) * lineHeight + fontSize;

  // Get text positions from texts array if available
  const getTextPosition = (index) => {
    if (texts && texts[index] && texts[index].x !== undefined && texts[index].y !== undefined) {
      return { x: texts[index].x, y: texts[index].y };
    }
    // Default centered position (matches editor default)
    return {
      x: canvasWidth / 2,
      y: 520 + (index * lineHeight)
    };
  };

  // Background style
  const getBackgroundStyle = () => {
    if (backgroundType === "image" && backgroundImageUrl) {
      const imageUrl = backgroundImageUrl.startsWith('/') 
        ? window.location.origin + backgroundImageUrl 
        : backgroundImageUrl;
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else if (backgroundType === "color") {
      if (backgroundGradient) {
        return {
          background: backgroundGradient,
        };
      }
      return {
        backgroundColor: backgroundColor,
      };
    }
    return {
      backgroundColor: "#FFFFFF",
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        maxWidth: "100%",
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        ...getBackgroundStyle(),
      }}
    >
      {/* Text overlay */}
      {textLines.length > 0 && textLines.map((line, index) => {
        if (!line || !line.trim()) return null;
        
        const position = getTextPosition(index);
        const cleanFontFamily = fontFamily
          .replace(/'/g, '')
          .replace(/, cursive/g, '')
          .replace(/, sans-serif/g, '')
          .trim();

        return (
          <div
            key={`text-${index}`}
            className="absolute"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              fontSize: `${fontSize}px`,
              fontFamily: cleanFontFamily,
              color: textColor,
              textShadow: `
                1px 1px 2px rgba(0, 0, 0, 0.5),
                0 0 8px rgba(255, 255, 255, 0.6)
              `,
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

export default SignageStaticPreview;
