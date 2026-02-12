import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { api } from "../utils/api";

// Default constants (fallback) - Using local fonts from public/fonts
export const DEFAULT_FONTS = [
  { name: "Farmhouse", value: "'Farmhouse', cursive" },
  { name: "Black Mango Bold", value: "'BlackMango-Bold', sans-serif" },
  { name: "Bodoni 72 Smallcaps", value: "'Bodoni 72 Smallcaps', serif" },
  { name: "Bright", value: "'Bright', sans-serif" },
  { name: "Futura", value: "'Futura', sans-serif" },
  { name: "Greycliff CF Thin", value: "'Greycliff CF Thin', sans-serif" },
  { name: "SignPainter", value: "'SignPainter', cursive" },
  { name: "Sloop Script Three", value: "'Sloop Script Three', cursive" },
];

export const BACKGROUND_GRADIENTS = [
  { name: "Creamy Summer", value: "linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Peach", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Lavender", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Warm", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Cool", value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  { name: "Pastel", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
];

export const DEFAULT_TEXT_SIZES = {
  small: { width: 150, height: 40, fontSize: 32 },
  medium: { width: 250, height: 60, fontSize: 48 },
  large: { width: 350, height: 80, fontSize: 64 },
  extralarge: { width: 450, height: 100, fontSize: 80 },
};

// Pixels per foot for canvas (so physical size in ft maps to display size)
const PX_PER_FT = 150;
// Reference canvas height for text size scaling (font sizes in config are at this height)
const REFERENCE_CANVAS_HEIGHT = 1200;

// Default canvas dimensions (will be overridden by config from widthFt/heightFt)
export const DEFAULT_CANVAS_WIDTH = 600;
export const DEFAULT_CANVAS_HEIGHT = 1200;

// Vertical board: centered, attached to bottom. Text can only be moved within this area.
export const BOARD_WIDTH_RATIO = 0.58;
export const BOARD_HEIGHT_RATIO = 0.72;
export const VERTICAL_BOARD_IMAGE_URL = "/signage/vertical-board.png";

export const VERTICAL_BOARD_OPTIONS = [
  { label: "Default", path: "/signage/vertical-board.png" },
  { label: "Style 1", path: "/signage/vertical-board-1.png" },
  { label: "Style 2", path: "/signage/vertical-board-2.png" },
  { label: "Style 3", path: "/signage/vertical-board-3.png" },
];

export const getBoardBounds = (cw, ch) => {
  const width = Math.round(cw * BOARD_WIDTH_RATIO);
  const height = Math.round(ch * BOARD_HEIGHT_RATIO);
  return {
    left: Math.round((cw - width) / 2),
    top: ch - height,
    width,
    height,
  };
};

// Backward compatibility alias
export const getBannerBounds = getBoardBounds;

/** Normalize to #rrggbb so color is always valid and consistent for style/input */
export const normalizeHexColor = (str) => {
  if (!str || typeof str !== "string") return "#000000";
  let hex = str.trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) return "#000000";
  return "#" + hex.toLowerCase();
};

const SignageContext = createContext();

export const useSignage = () => {
  const context = useContext(SignageContext);
  if (!context) {
    throw new Error("useSignage must be used within a SignageProvider");
  }
  return context;
};

export const SignageProvider = ({ children }) => {
  // Config from backend
  const [fonts, setFonts] = useState(DEFAULT_FONTS);
  const [textSizes, setTextSizes] = useState(DEFAULT_TEXT_SIZES);
  const [textSizesConfig, setTextSizesConfig] = useState([]); // Raw config with labels
  const [textColors, setTextColors] = useState([]);
  const [backgroundGradients, setBackgroundGradients] = useState(BACKGROUND_GRADIENTS);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const [widthFt, setWidthFt] = useState(4);
  const [heightFt, setHeightFt] = useState(8);
  const [pricePerSqInch, setPricePerSqInch] = useState(0);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api("/signage-config");
        if (res.config) {
          // Convert fonts array to format expected by components
          // Use fonts from config if available, otherwise use defaults
          // Deduplicate by font value to avoid duplicates
          const configFonts = res.config.fonts || [];
          const fontsArray = configFonts.length > 0 ? configFonts : DEFAULT_FONTS;
          
          // Remove duplicates based on font value
          const uniqueFonts = fontsArray.filter((font, index, self) =>
            index === self.findIndex((f) => f.value === font.value)
          );
          
          setFonts(uniqueFonts);
          
          // Store raw sizes config (with labels)
          setTextSizesConfig(res.config.sizes || []);
          
          // Background dimensions in feet (admin-configurable)
          const wFt = Number(res.config.widthFt) || 4;
          const hFt = Number(res.config.heightFt) || 8;
          setWidthFt(wFt);
          setHeightFt(hFt);
          // Derive canvas pixels from physical size (ft) so aspect ratio and scale are correct
          setCanvasWidth(Math.round(wFt * PX_PER_FT));
          setCanvasHeight(Math.round(hFt * PX_PER_FT));
          
          // Convert sizes array to object format (width/height scaled in the computed textSize below)
          const sizesObj = {};
          (res.config.sizes || []).forEach((size) => {
            sizesObj[size.key] = {
              width: size.width,
              height: size.height,
              fontSize: size.fontSize,
              price: size.price || 0,
            };
          });
          if (Object.keys(sizesObj).length > 0) {
            setTextSizes(sizesObj);
          }
          
          // Text colors from config
          if (res.config.textColors && res.config.textColors.length > 0) {
            setTextColors(res.config.textColors);
          }
          
          // Background gradients from config
          if (res.config.backgroundGradients && res.config.backgroundGradients.length > 0) {
            setBackgroundGradients(res.config.backgroundGradients);
          }
          // Price per square inch (1" × 1") for scale-based pricing
          const ppi = Number(res.config.pricePerSqInch);
          setPricePerSqInch(Number.isFinite(ppi) && ppi >= 0 ? ppi : 0);
        }
      } catch (err) {
        console.error("Failed to load signage config:", err);
        // Use defaults on error
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Text content and styling
  const [textContent, setTextContent] = useState("Hello");
  const [selectedFont, setSelectedFont] = useState("'Farmhouse', cursive");
  const [selectedTextColor, setSelectedTextColor] = useState("#000000"); // Black by default
  const [selectedSize, setSelectedSize] = useState("medium");
  
  // Text position (single position for entire text block)
  // Initialize at center horizontally, a bit below top
  const [textPosition, setTextPosition] = useState({ 
    x: DEFAULT_CANVAS_WIDTH / 2, // Horizontally centered
    y: 520, // A bit below top
  });
  
  // Update text position when canvas dimensions are loaded: use board center, or snap into board if currently outside
  useEffect(() => {
    if (canvasWidth && canvasHeight && !configLoading) {
      const bounds = getBoardBounds(canvasWidth, canvasHeight);
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height * 0.72;
      setTextPosition(prev => {
        if (prev.x === DEFAULT_CANVAS_WIDTH / 2 && prev.y === 520) {
          return { x: centerX, y: centerY };
        }
        // If position is outside the board, snap it onto the board so "Hello" stays on the board
        const inBoardX = prev.x >= bounds.left && prev.x <= bounds.left + bounds.width;
        const inBoardY = prev.y >= bounds.top && prev.y <= bounds.top + bounds.height;
        if (!inBoardX || !inBoardY) {
          return { x: centerX, y: centerY };
        }
        return prev;
      });
    }
  }, [canvasWidth, canvasHeight, configLoading]);

  // Background - Default to pink wallpaper image
  const [backgroundType, setBackgroundType] = useState("image");
  const [backgroundColor, setBackgroundColor] = useState("#F8F9FA");
  const [backgroundGradient, setBackgroundGradient] = useState(
    "linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)"
  );
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("/signage/garden-bg.jpg");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#F8F9FA");

  // Vertical board image (changeable; background is fixed)
  const [verticalBoardImageUrl, setVerticalBoardImageUrl] = useState(VERTICAL_BOARD_IMAGE_URL);

  // User-adjustable text scale (0.5 = 50%, 2 = 200%)
  const [userTextScale, setUserTextScale] = useState(1);

  // Text box dimensions (visible on canvas; synced from size preset, updated when user resizes from handle)
  const [textBoxWidth, setTextBoxWidth] = useState(250);
  const [textBoxHeight, setTextBoxHeight] = useState(60);

  // Drag state (moved to local in SignageEditor, but kept here for compatibility)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isTextClicked, setIsTextClicked] = useState(false);

  // Scale factor: text sizes in config are at REFERENCE_CANVAS_HEIGHT; scale by actual canvas height so text looks relative to sign size
  const textScale = canvasHeight > 0 ? canvasHeight / REFERENCE_CANVAS_HEIGHT : 1;
  const baseTextSize = (textSizes && Object.keys(textSizes).length > 0)
    ? (textSizes[selectedSize] || textSizes.medium)
    : null;
  const baseDefault = DEFAULT_TEXT_SIZES[selectedSize] || DEFAULT_TEXT_SIZES.medium;
  const textSize = baseTextSize
    ? {
        width: (baseDefault.width ?? 250) * textScale,
        height: (baseDefault.height ?? 60) * textScale,
        fontSize: (baseTextSize.fontSize ?? 48) * textScale,
        price: baseTextSize.price ?? 0,
      }
    : {
        ...baseDefault,
        fontSize: (baseDefault.fontSize ?? 48) * textScale,
        width: (baseDefault.width ?? 250) * textScale,
        height: (baseDefault.height ?? 60) * textScale,
      };
  const fontSize = textSize?.fontSize || 48;
  const effectiveFontSize = fontSize * userTextScale;
  const baseEffective = textSize
    ? { ...textSize, width: textSize.width * userTextScale, height: textSize.height * userTextScale, fontSize: effectiveFontSize }
    : { width: 250 * userTextScale, height: 60 * userTextScale, fontSize: 48 * userTextScale };
  const effectiveTextSize = {
    ...baseEffective,
    width: textBoxWidth,
    height: textBoxHeight,
  };

  // Get current price: scale-based (pricePerSqInch × widthIn × heightIn) when pricePerSqInch is set; else fallback to size-based
  const widthInches = canvasWidth > 0 ? (textBoxWidth * widthFt * 12) / canvasWidth : 0;
  const heightInches = canvasHeight > 0 ? (textBoxHeight * heightFt * 12) / canvasHeight : 0;
  const scaleBasedPrice = (pricePerSqInch || 0) * widthInches * heightInches;
  const currentPrice =
    pricePerSqInch > 0
      ? Math.round(scaleBasedPrice * 100) / 100
      : (textSizes && Object.keys(textSizes).length > 0)
        ? (textSizes[selectedSize]?.price ?? textSizes.medium?.price ?? 0)
        : 0;

  // Sync text box dimensions: width = 13.5 inch (from sign dimensions), height from size preset
  const targetTextWidthInches = 13.5;
  useEffect(() => {
    const base = textSize
      ? { w: textSize.width * userTextScale, h: textSize.height * userTextScale }
      : { w: 250 * userTextScale, h: 60 * userTextScale };
    const widthPx =
      canvasWidth > 0 && widthFt > 0
        ? (targetTextWidthInches * canvasWidth) / (widthFt * 12)
        : base.w;
    setTextBoxWidth(widthPx);
    setTextBoxHeight(base.h);
  }, [selectedSize, userTextScale, textSize?.width, textSize?.height, canvasWidth, widthFt]);

  // Memoize functions to prevent rerenders
  const memoizedGetLinePositions = useCallback(() => {
    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = effectiveFontSize * 1.4;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = textPosition.y - (totalHeight / 2);
    
    return lines.map((line, index) => ({
      x: textPosition.x,
      y: startY + (index * lineHeight),
    }));
  }, [textContent, textPosition, effectiveFontSize]);

  const memoizedGetTextLines = useCallback(() => {
    if (!textContent.trim()) return [];
    return textContent.split('\n').filter(line => line.trim());
  }, [textContent]);

  const memoizedGetTextsFromContent = useCallback(() => {
    if (!textContent.trim()) return [];
    
    const lines = textContent.split('\n').filter(line => line.trim());
    const linePositions = memoizedGetLinePositions();
    
    return lines.map((line, index) => ({
      content: line.trim(),
      x: linePositions[index].x,
      y: linePositions[index].y,
      fontSize: effectiveFontSize,
      fontFamily: selectedFont,
      color: selectedTextColor,
    }));
  }, [textContent, memoizedGetLinePositions, effectiveFontSize, selectedFont, selectedTextColor]);

  const memoizedResetSignage = useCallback(() => {
    setTextContent("Hello");
    setSelectedFont("'Farmhouse', cursive");
    setSelectedTextColor(normalizeHexColor("#000000"));
    setSelectedSize("medium");
    setUserTextScale(1);
    // textBoxWidth/textBoxHeight will sync from size preset via useEffect
    const bounds = getBoardBounds(canvasWidth, canvasHeight);
    setTextPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height * 0.72,
    });
    setBackgroundType("image");
    setBackgroundColor("#F8F9FA");
    setBackgroundGradient("linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)");
    setBackgroundImage(null);
    setBackgroundImageUrl("/signage/garden-bg.jpg");
    setCustomBackgroundColor("#F8F9FA");
    setVerticalBoardImageUrl(VERTICAL_BOARD_IMAGE_URL);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setIsTextHovered(false);
    setIsTextClicked(false);
  }, [canvasWidth, canvasHeight]);

  const memoizedLoadSignage = useCallback((signageData) => {
    if (signageData.texts && signageData.texts.length > 0) {
      const content = signageData.texts.map(t => t.content).join('\n');
      setTextContent(content);
      
      if (signageData.texts[0]) {
        const firstText = signageData.texts[0];
        const lines = content.split('\n').filter(line => line.trim());
        const lineHeight = (firstText.fontSize || 48) * 1.5;
        const totalHeight = (lines.length - 1) * lineHeight;
        setTextPosition({
          x: firstText.x,
          y: firstText.y + (totalHeight / 2),
        });
        setSelectedFont(firstText.fontFamily || "'Farmhouse', cursive");
        setSelectedTextColor(normalizeHexColor(firstText.color || "#000000"));
        
        const fs = firstText.fontSize || 48;
        if (fs <= 32) setSelectedSize("small");
        else if (fs <= 48) setSelectedSize("medium");
        else if (fs <= 64) setSelectedSize("large");
        else setSelectedSize("extralarge");
      }
    }
    
    if (signageData.backgroundType) {
      setBackgroundType(signageData.backgroundType);
    }
    if (signageData.backgroundColor) {
      setBackgroundColor(signageData.backgroundColor);
    }
    if (signageData.backgroundGradient) {
      setBackgroundGradient(signageData.backgroundGradient);
    }
    if (signageData.backgroundImage?.url) {
      setBackgroundImageUrl(signageData.backgroundImage.url);
    }
  }, []);

  // Memoize setters separately - they're stable but we want to ensure they don't change
  const stableSetters = useMemo(() => ({
    setTextContent,
    setSelectedFont,
    setSelectedTextColor,
    setSelectedSize,
    setTextPosition,
    setBackgroundType,
    setBackgroundColor,
    setBackgroundGradient,
    setBackgroundImage,
    setBackgroundImageUrl,
    setCustomBackgroundColor,
    setVerticalBoardImageUrl,
    setUserTextScale,
    setTextBoxWidth,
    setTextBoxHeight,
    setIsDragging,
    setDragOffset,
    setIsTextHovered,
    setIsTextClicked,
  }), []); // Empty deps - setters from useState are always stable

  // Memoize functions separately
  const stableFunctions = useMemo(() => ({
    getLinePositions: memoizedGetLinePositions,
    getTextLines: memoizedGetTextLines,
    getTextsFromContent: memoizedGetTextsFromContent,
    resetSignage: memoizedResetSignage,
    loadSignage: memoizedLoadSignage,
  }), [
    memoizedGetLinePositions,
    memoizedGetTextLines,
    memoizedGetTextsFromContent,
    memoizedResetSignage,
    memoizedLoadSignage,
  ]);

  // Memoize context value - only recreate when actual state values change
  const value = useMemo(() => ({
    // State values
    textContent,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textPosition,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    backgroundImageUrl,
    customBackgroundColor,
    verticalBoardImageUrl,
    isDragging,
    dragOffset,
    isTextHovered,
    isTextClicked,
    
    // Config from backend
    fonts,
    textSizes,
    textSizesConfig,
    textColors,
    backgroundGradients,
    canvasWidth,
    canvasHeight,
    widthFt,
    heightFt,
    currentPrice,
    widthInches,
    heightInches,
    configLoading,
    
    // Computed
    textSize,
    fontSize,
    userTextScale,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,

    // Stable setters
    ...stableSetters,
    
    // Stable functions
    ...stableFunctions,
  }), [
    textContent,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textPosition,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    backgroundImageUrl,
    customBackgroundColor,
    verticalBoardImageUrl,
    isDragging,
    dragOffset,
    isTextHovered,
    isTextClicked,
    textSize,
    fontSize,
    userTextScale,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,
    fonts,
    textSizes,
    textSizesConfig,
    textColors,
    backgroundGradients,
    canvasWidth,
    canvasHeight,
    widthFt,
    heightFt,
    currentPrice,
    widthInches,
    heightInches,
    configLoading,
    stableSetters,
    stableFunctions,
  ]);

  return <SignageContext.Provider value={value}>{children}</SignageContext.Provider>;
};
