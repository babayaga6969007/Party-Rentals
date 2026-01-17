import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { api } from "../utils/api";

// Default constants (fallback)
export const DEFAULT_FONTS = [
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Pacifico", value: "'Pacifico', cursive" },
  { name: "Great Vibes", value: "'Great Vibes', cursive" },
  { name: "Satisfy", value: "'Satisfy', cursive" },
  { name: "Allura", value: "'Allura', cursive" },
  { name: "Brush Script MT", value: "'Brush Script MT', cursive" },
  { name: "Lobster", value: "'Lobster', cursive" },
  { name: "Playball", value: "'Playball', cursive" },
  { name: "Tangerine", value: "'Tangerine', cursive" },
  { name: "Cookie", value: "'Cookie', cursive" },
  { name: "Amatic SC", value: "'Amatic SC', cursive" },
  { name: "Caveat", value: "'Caveat', cursive" },
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

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

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
  const [basePrice, setBasePrice] = useState(0);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api("/signage-config");
        if (res.config) {
          // Convert fonts array to format expected by components
          const fontsArray = res.config.fonts || DEFAULT_FONTS;
          setFonts(fontsArray);
          
          // Convert sizes array to object format
          const sizesObj = {};
          (res.config.sizes || []).forEach((size) => {
            sizesObj[size.key] = {
              width: size.width,
              height: size.height,
              fontSize: size.fontSize,
            };
          });
          if (Object.keys(sizesObj).length > 0) {
            setTextSizes(sizesObj);
          }
          
          setBasePrice(res.config.basePrice || 0);
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
  const [selectedFont, setSelectedFont] = useState("'Dancing Script', cursive");
  const [selectedTextColor, setSelectedTextColor] = useState("#FFFFFF");
  const [selectedSize, setSelectedSize] = useState("medium");
  
  // Custom size (when user wants to set custom dimensions)
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState({
    width: 250,
    height: 60,
    fontSize: 48,
  });
  
  // Text position (single position for entire text block)
  const [textPosition, setTextPosition] = useState({ 
    x: CANVAS_WIDTH / 2, 
    y: CANVAS_HEIGHT / 2 
  });

  // Background
  const [backgroundType, setBackgroundType] = useState("color");
  const [backgroundColor, setBackgroundColor] = useState("#F8F9FA");
  const [backgroundGradient, setBackgroundGradient] = useState(
    "linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)"
  );
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#F8F9FA");

  // Drag state (moved to local in SignageEditor, but kept here for compatibility)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isTextClicked, setIsTextClicked] = useState(false);

  // Get current text size (use custom if enabled, otherwise use predefined)
  const textSize = useCustomSize 
    ? customSize 
    : (textSizes[selectedSize] || textSizes.medium || DEFAULT_TEXT_SIZES.medium);
  const fontSize = textSize.fontSize;

  // Memoize functions to prevent rerenders
  const memoizedGetLinePositions = useCallback(() => {
    const lines = textContent.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.4;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = textPosition.y - (totalHeight / 2);
    
    return lines.map((line, index) => ({
      x: textPosition.x,
      y: startY + (index * lineHeight),
    }));
  }, [textContent, textPosition, fontSize]);

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
      fontSize: fontSize,
      fontFamily: selectedFont,
      color: selectedTextColor,
    }));
  }, [textContent, memoizedGetLinePositions, fontSize, selectedFont, selectedTextColor]);

  const memoizedResetSignage = useCallback(() => {
    setTextContent("Hello");
    setSelectedFont("'Dancing Script', cursive");
    setSelectedTextColor("#FFFFFF");
    setSelectedSize("medium");
    setTextPosition({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    setBackgroundType("color");
    setBackgroundColor("#F8F9FA");
    setBackgroundGradient("linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)");
    setBackgroundImage(null);
    setBackgroundImageUrl(null);
    setCustomBackgroundColor("#F8F9FA");
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setIsTextHovered(false);
    setIsTextClicked(false);
  }, []);

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
        setSelectedFont(firstText.fontFamily || "'Dancing Script', cursive");
        setSelectedTextColor(firstText.color || "#000000");
        
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
    setIsDragging,
    setDragOffset,
    setIsTextHovered,
    setIsTextClicked,
    setUseCustomSize,
    setCustomSize,
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
    isDragging,
    dragOffset,
    isTextHovered,
    isTextClicked,
    
    // Config from backend
    fonts,
    textSizes,
    basePrice,
    configLoading,
    
    // Custom size
    useCustomSize,
    customSize,
    
    // Computed
    textSize,
    fontSize,
    
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
    isDragging,
    dragOffset,
    isTextHovered,
    isTextClicked,
    textSize,
    fontSize,
    fonts,
    textSizes,
    basePrice,
    configLoading,
    useCustomSize,
    customSize,
    stableSetters,
    stableFunctions,
  ]);

  return <SignageContext.Provider value={value}>{children}</SignageContext.Provider>;
};
