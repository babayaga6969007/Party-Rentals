import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, getBoardBounds } from "../context/SignageContext";
import { waitForFonts as waitForFontsUtil, preloadFontsWithFontFace } from "./fontLoader";

const MAX_EXPORT_LONG_SIDE = 1200;

/**
 * Captures a snapshot by drawing the design programmatically (background, board, text).
 */
export const capturePreviewSnapshot = async (containerElement, callback, fallbackData = null) => {
  const data = fallbackData;
  if (!data) {
    callback(null);
    return;
  }
  await preloadFontsWithFontFace();
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 300));

  createCanvasPreview(
    data.backgroundType,
    data.backgroundColor,
    data.backgroundGradient,
    data.backgroundImageUrl,
    data.getTextsFromContent,
    callback,
    data.canvasWidth,
    data.canvasHeight,
    data.verticalBoardImageUrl,
    null,
    null
  );
};

/**
 * Legacy function - creates canvas preview by recreating the design
 * Kept for backward compatibility
 */
/** Draw the vertical board image at the same position as in the preview. */
const drawVerticalBoard = (ctx, canvasWidth, canvasHeight, verticalBoardImageUrl) => {
  if (!verticalBoardImageUrl || !ctx) return Promise.resolve();
  const b = getBoardBounds(canvasWidth, canvasHeight);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, b.left, b.top, b.width, b.height);
      resolve();
    };
    img.onerror = () => resolve(); // no board if load fails
    const url = verticalBoardImageUrl.startsWith("/") ? window.location.origin + verticalBoardImageUrl : verticalBoardImageUrl;
    img.src = url;
  });
};

export const createCanvasPreview = (
  backgroundType,
  backgroundColor,
  backgroundGradient,
  backgroundImageUrl,
  getTextsFromContent,
  callback,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  verticalBoardImageUrl = null,
  outputWidth = null,
  outputHeight = null
) => {
  const designW = canvasWidth;
  const designH = canvasHeight;
  const EXPORT_SIZE = 1200; // Export as 1200×1200 square
  const outW = EXPORT_SIZE;
  const outH = EXPORT_SIZE;
  // Contain: scale so full design fits inside square (no cropping; may have letterboxing)
  const scale = Math.min(outW / designW, outH / designH);
  const offsetX = outW / (2 * scale) - designW / 2;
  const offsetY = outH / (2 * scale) - designH / 2;
  const useCrop = true;

  console.log("createCanvasPreview: Design", designW, "x", designH, "→ Export", outW, "x", outH);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  const useOutputSize = useCrop;

  const finishExport = (sourceCanvas) => {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const longSide = Math.max(w, h);
    if (longSide <= MAX_EXPORT_LONG_SIDE) {
      callback(sourceCanvas.toDataURL("image/jpeg", 0.85));
      return;
    }
    const scale = MAX_EXPORT_LONG_SIDE / longSide;
    const outW = Math.round(w * scale);
    const outH = Math.round(h * scale);
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const outCtx = out.getContext("2d");
    outCtx.drawImage(sourceCanvas, 0, 0, w, h, 0, 0, outW, outH);
    callback(out.toDataURL("image/jpeg", 0.85));
  };

  // Helper function to preload a font by creating a hidden element
  const preloadFont = (fontFamily) => {
    const cleanFont = fontFamily
      .replace(/'/g, '')
      .replace(/,.*$/g, '')
      .trim();
    
    // Create a hidden element with the font to force loading
    const testElement = document.createElement('span');
    testElement.style.fontFamily = `"${cleanFont}", Arial, sans-serif`;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.fontSize = '16px';
    testElement.textContent = 'M'; // Use a character that will show font differences
    document.body.appendChild(testElement);
    
    // Force font loading by measuring
    const width1 = testElement.offsetWidth;
    testElement.style.fontFamily = 'Arial, sans-serif';
    const width2 = testElement.offsetWidth;
    
    // Remove test element
    document.body.removeChild(testElement);
    
    // If widths are different, font is likely loaded
    return width1 !== width2;
  };

  // Helper function to check if a specific font is loaded
  const checkFontLoaded = (fontFamily) => {
    // Clean font family name (remove quotes, fallbacks, etc.)
    const cleanFont = fontFamily
      .replace(/'/g, '')
      .replace(/,.*$/g, '') // Remove fallbacks
      .trim();
    
    // Method 1: Use document.fonts.check if available
    if (document.fonts && document.fonts.check) {
      const fontString = `16px "${cleanFont}"`;
      if (document.fonts.check(fontString)) {
        return true;
      }
    }
    
    // Method 2: Preload and measure (more reliable for production)
    try {
      return preloadFont(cleanFont);
    } catch (e) {
      console.warn(`Font check failed for ${cleanFont}:`, e);
      return false;
    }
  };

  // Helper to wait for all fonts used in texts to be loaded
  const waitForFontsLocal = async (texts) => {
    if (!texts || texts.length === 0) return;
    
    // Get unique font families from texts
    const fontFamilies = [...new Set(texts.map(t => t.fontFamily || "'Farmhouse', cursive"))];
    
    console.log("waitForFontsLocal: Waiting for fonts:", fontFamilies);
    
    // Use the utility function for better font loading
    try {
      await waitForFontsUtil(fontFamilies, 10000);
    } catch (e) {
      console.warn("Font loading utility failed, using fallback:", e);
      
      // Fallback: wait for document.fonts.ready
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Helper to draw text and call callback (waits for fonts if available)
  const drawComplete = async () => {
    // Get texts first to check which fonts we need
    const texts = getTextsFromContent();
    console.log("Drawing texts in canvas preview:", texts);
    
    // Wait for fonts to be loaded
    if (texts && texts.length > 0) {
      await waitForFontsLocal(texts);
    }
    
    // Now draw the texts
    if (texts && texts.length > 0) {
      drawTexts(ctx, getTextsFromContent, designW, designH);
    } else {
      console.warn("No texts found to draw!");
    }
    
    if (useOutputSize) ctx.restore();
    finishExport(canvas);
  };

  // Draw background (in design space)
  if (backgroundType === "color") {
    if (backgroundGradient) {
      const gradient = ctx.createLinearGradient(0, 0, designW, designH);
      // Extract colors from gradient string
      if (backgroundGradient.includes("#667eea")) {
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
      } else if (backgroundGradient.includes("#f093fb")) {
        gradient.addColorStop(0, "#f093fb");
        gradient.addColorStop(1, "#f5576c");
      } else if (backgroundGradient.includes("#4facfe")) {
        gradient.addColorStop(0, "#4facfe");
        gradient.addColorStop(1, "#00f2fe");
      } else if (backgroundGradient.includes("#a8edea")) {
        gradient.addColorStop(0, "#a8edea");
        gradient.addColorStop(1, "#fed6e3");
      } else if (backgroundGradient.includes("#fa709a")) {
        gradient.addColorStop(0, "#fa709a");
        gradient.addColorStop(1, "#fee140");
      } else if (backgroundGradient.includes("#30cfd0")) {
        gradient.addColorStop(0, "#30cfd0");
        gradient.addColorStop(1, "#330867");
      } else if (backgroundGradient.includes("#ffecd2")) {
        gradient.addColorStop(0, "#ffecd2");
        gradient.addColorStop(1, "#fcb69f");
      } else if (backgroundGradient.includes("#FFE5B4")) {
        gradient.addColorStop(0, "#FFE5B4");
        gradient.addColorStop(0.5, "#FFCCCB");
        gradient.addColorStop(1, "#FFDAB9");
      } else {
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, backgroundColor);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, designW, designH);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, designW, designH);
    }
    // Draw vertical board then text on colored background
    (async () => {
      await drawVerticalBoard(ctx, designW, designH, verticalBoardImageUrl);
      await drawComplete();
    })();
    return;
  } else if (backgroundType === "image" && backgroundImageUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const drawTextAfterImage = async () => {
      // Get texts first to verify they exist
      const texts = getTextsFromContent();
      console.log("drawTextAfterImage: Texts to draw:", texts);
      
      // Wait for fonts to be loaded before drawing
      if (texts && texts.length > 0) {
        await waitForFontsLocal(texts);
      }
      
      if (texts && texts.length > 0) {
        console.log("drawTextAfterImage: Drawing texts on canvas...");
        drawTexts(ctx, getTextsFromContent, designW, designH);
        
        // Verify text was drawn by checking canvas
        const imageData = ctx.getImageData(0, 0, designW, designH);
        const hasNonBackgroundPixels = Array.from(imageData.data).some((pixel, index) => {
          if (index % 4 === 3) return false;
          return pixel < 250;
        });
        console.log("drawTextAfterImage: Canvas has non-background pixels:", hasNonBackgroundPixels);
      } else {
        console.warn("drawTextAfterImage: No texts to draw!");
      }
      
      if (useOutputSize) ctx.restore();
      console.log("Final canvas size before export:", canvas.width, "x", canvas.height);
      finishExport(canvas);
      };
    
    img.onload = () => {
      console.log("Background image loaded, dimensions:", img.width, img.height);
      console.log("Design dimensions:", designW, "x", designH);
      
      // CRITICAL: Crop the background image to fit the design area exactly
      const imgAspect = img.width / img.height;
      const canvasAspect = designW / designH;
      
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      
      // Calculate crop to match canvas aspect ratio exactly
      // This mimics object-fit: cover behavior - scale to fill, crop to fit
      // The goal is to crop the image so the cropped portion has the same aspect ratio as the canvas
      
      if (imgAspect > canvasAspect) {
        // Image is wider relative to its height than canvas (e.g., 1024x1536 vs 600x1200)
        // Strategy: Scale image to fill canvas height, then crop width
        // This matches object-fit: cover behavior
        // Keep full height, crop width to match canvas aspect ratio
        sourceHeight = img.height; // Use full height (1536)
        sourceWidth = img.height * canvasAspect; // Calculate width to match aspect (1536 * 0.5 = 768)
        sourceX = (img.width - sourceWidth) / 2; // Center horizontally ((1024 - 768) / 2 = 128)
        sourceY = 0; // Start from top
        console.log("Image wider than canvas - cropping from sides (object-fit: cover behavior)");
      } else {
        // Image is taller relative to its width than canvas
        // Strategy: Scale image to fill canvas width, then crop height
        // Keep full width, crop height to match canvas aspect ratio
        sourceWidth = img.width; // Use full width
        sourceHeight = img.width / canvasAspect; // Calculate height to match aspect
        sourceX = 0; // Start from left
        sourceY = (img.height - sourceHeight) / 2; // Center vertically
        console.log("Image taller than canvas - cropping from top/bottom (object-fit: cover behavior)");
      }
      
      // Round to integers for drawImage
      sourceX = Math.round(sourceX);
      sourceY = Math.round(sourceY);
      sourceWidth = Math.round(sourceWidth);
      sourceHeight = Math.round(sourceHeight);
      
      // Verify the cropped area has the correct aspect ratio
      const croppedAspect = sourceWidth / sourceHeight;
      console.log("Cropping image:", {
        "original": `${img.width}x${img.height} (aspect: ${imgAspect.toFixed(3)})`,
        "design": `${designW}x${designH} (aspect: ${canvasAspect.toFixed(3)})`,
        "crop area": `${sourceWidth}x${sourceHeight} from (${sourceX}, ${sourceY})`,
        "cropped aspect": croppedAspect.toFixed(3),
        "matches canvas": Math.abs(croppedAspect - canvasAspect) < 0.01
      });
      
      // Draw ONLY the cropped portion of the image to fill the design area exactly
      ctx.drawImage(
        img,
        sourceX, sourceY,
        sourceWidth, sourceHeight,
        0, 0,
        designW, designH
      );
      
      console.log("Background image drawn on canvas:", {
        "export size": `${canvas.width}x${canvas.height}`,
        "design size": `${designW}x${designH}`,
        "source crop": `${sourceWidth}x${sourceHeight} from (${sourceX}, ${sourceY})`,
        "original image": `${img.width}x${img.height}`
      });
      
      // Draw vertical board then text after background image is loaded
      (async () => {
        await drawVerticalBoard(ctx, designW, designH, verticalBoardImageUrl);
        drawTextAfterImage();
      })();
    };
    
    img.onerror = async () => {
      // If image fails to load, draw text on blank background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, designW, designH);
      await drawComplete();
    };
    
    // Handle both relative and absolute URLs
    const imageUrl = backgroundImageUrl.startsWith('/') 
      ? window.location.origin + backgroundImageUrl 
      : backgroundImageUrl;
    img.src = imageUrl;
    return;
  } else {
    // No background - draw board then text on white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, designW, designH);
    (async () => {
      await drawVerticalBoard(ctx, designW, designH, verticalBoardImageUrl);
      await drawComplete();
    })();
    return;
  }
};

const drawTexts = (context, getTextsFromContent, designWidth = null, designHeight = null) => {
  const texts = getTextsFromContent();
  if (!texts || texts.length === 0) {
    console.warn("drawTexts: No texts provided");
    return;
  }
  const cw = designWidth ?? context.canvas.width;
  const ch = designHeight ?? context.canvas.height;
  console.log("drawTexts: Drawing", texts.length, "text lines (design space:", cw, "x", ch, ")");
  
  texts.forEach((text, index) => {
    if (!text || !text.content) {
      console.warn(`drawTexts: Skipping text ${index} - no content`);
      return;
    }
    
    // Set font - clean up font family string and use fallback
    let fontFamily = (text.fontFamily || "'Farmhouse', cursive")
      .replace(/'/g, '')
      .replace(/, cursive/g, '')
      .replace(/, sans-serif/g, '')
      .replace(/, serif/g, '')
      .trim();
    
    // If font family is empty, use a default
    if (!fontFamily) {
      fontFamily = "Arial";
    }
    
    const fontSize = text.fontSize || 48;
    // Use quotes around font family to ensure proper font matching
    const fontString = `${fontSize}px "${fontFamily}", Arial, sans-serif`;
    
    // Set font and verify it's applied
    context.font = fontString;
    
    // Verify font is actually being used by comparing measurements
    const testText = "M";
    const testMeasurement = context.measureText(testText);
    
    // Try with fallback font to compare
    context.font = `${fontSize}px Arial, sans-serif`;
    const fallbackMeasurement = context.measureText(testText);
    
    // Set font back
    context.font = fontString;
    
    // Log comparison
    const isUsingCustomFont = Math.abs(testMeasurement.width - fallbackMeasurement.width) > 0.1;
    console.log(`drawTexts: Font "${fontFamily}" - Custom: ${testMeasurement.width.toFixed(2)}px, Fallback: ${fallbackMeasurement.width.toFixed(2)}px, Using custom: ${isUsingCustomFont}`);
    
    if (!isUsingCustomFont) {
      console.warn(`WARNING: Font "${fontFamily}" may not be loaded, using fallback`);
    }
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Add text shadow/glow effect for visibility on images
    context.shadowColor = "rgba(0, 0, 0, 0.9)";
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Draw text with color - ensure it's visible (use design space for default center when provided)
    const textColor = text.color || "#000000";
    context.fillStyle = textColor;
    const x = text.x !== undefined && text.x > 0 ? text.x : cw / 2;
    const y = text.y !== undefined && text.y > 0 ? text.y : ch / 2;
    
    console.log(`drawTexts: Drawing "${text.content}" at (${x}, ${y}) with font ${fontString} and color ${textColor}`);
    
    // Draw white stroke first for better visibility on any background
    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.9)";
    context.lineWidth = 4;
    context.lineJoin = "round";
    context.miterLimit = 2;
    context.strokeText(text.content, x, y);
    
    // Then fill the text with the actual color
    context.fillText(text.content, x, y);
    context.restore();
    
    // Verify the text was drawn (skip pixel read when transformed/landscape - coords are design space)
    if (designWidth == null) {
      const testX = Math.min(Math.max(0, x + 10), cw - 1);
      const testY = Math.min(Math.max(0, y + 10), ch - 1);
      try {
        const pixelData = context.getImageData(testX, testY, 1, 1).data;
        console.log(`drawTexts: Pixel at (${testX}, ${testY}):`, pixelData);
      } catch (_) {}
    }
    
    // Reset shadow and stroke
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowColor = "transparent";
    context.lineWidth = 0;
    context.strokeStyle = "transparent";
  });
  
  console.log("drawTexts: Finished drawing all texts");
};
