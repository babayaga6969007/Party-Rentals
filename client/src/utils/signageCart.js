import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "../context/SignageContext";

/**
 * Captures a snapshot of the preview element and converts it to an image
 * Uses html2canvas if available, otherwise falls back to legacy canvas method
 * @param {HTMLElement} previewElement - The DOM element to capture (the preview div)
 * @param {Function} callback - Callback function that receives the data URL
 * @param {Object} fallbackData - Fallback data for legacy method if html2canvas fails
 */
export const capturePreviewSnapshot = async (previewElement, callback, fallbackData = null) => {
  if (!previewElement) {
    console.error("Preview element not found");
    if (fallbackData) {
      // Use legacy method as fallback
      createCanvasPreview(
        fallbackData.backgroundType,
        fallbackData.backgroundColor,
        fallbackData.backgroundGradient,
        fallbackData.backgroundImageUrl,
        fallbackData.getTextsFromContent,
        callback,
        fallbackData.canvasWidth,
        fallbackData.canvasHeight
      );
    } else {
      callback(null);
    }
    return;
  }

  // Use html2canvas to capture the actual rendered preview (screenshot of what's displayed)
  try {
    console.log("Capturing preview screenshot with html2canvas...");
    
    // Wait a bit to ensure all text is rendered
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Import html2canvas - it uses default export
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    if (typeof html2canvas !== 'function') {
      throw new Error("html2canvas.default is not a function");
    }
    
    console.log("html2canvas loaded, capturing preview element...");
    
    // Get the exact dimensions from the preview element's style
    const computedStyle = window.getComputedStyle(previewElement);
    const styleWidth = parseFloat(computedStyle.width) || previewElement.offsetWidth;
    const styleHeight = parseFloat(computedStyle.height) || previewElement.offsetHeight;
    
    const captureWidth = Math.round(styleWidth);
    const captureHeight = Math.round(styleHeight);
    
    console.log("Preview container dimensions:", captureWidth, "x", captureHeight);
    
    // Create a temporary container with EXACT dimensions to capture
    // This ensures we only capture what's in the preview, nothing more
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${captureWidth}px`;
    tempContainer.style.height = `${captureHeight}px`;
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.position = 'relative';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.backgroundColor = previewElement.style.backgroundColor || 'transparent';
    
    // Clone the preview element's content
    const clonedPreview = previewElement.cloneNode(true);
    clonedPreview.style.width = `${captureWidth}px`;
    clonedPreview.style.height = `${captureHeight}px`;
    clonedPreview.style.overflow = 'hidden';
    clonedPreview.style.position = 'relative';
    clonedPreview.style.margin = '0';
    clonedPreview.style.padding = '0';
    clonedPreview.style.border = 'none';
    
    // Ensure background image is exactly the container size
    const bgImage = clonedPreview.querySelector('img');
    if (bgImage) {
      bgImage.style.width = `${captureWidth}px`;
      bgImage.style.height = `${captureHeight}px`;
      bgImage.style.objectFit = 'cover';
      bgImage.style.objectPosition = 'center';
      bgImage.style.position = 'absolute';
      bgImage.style.top = '0';
      bgImage.style.left = '0';
      bgImage.style.zIndex = '1';
      bgImage.style.maxWidth = 'none';
      bgImage.style.maxHeight = 'none';
    }
    
    // Ensure text elements are positioned correctly
    const textElements = clonedPreview.querySelectorAll('[style*="absolute"]');
    textElements.forEach((textEl) => {
      textEl.style.position = 'absolute';
      textEl.style.zIndex = '999';
    });
    
    // Append to body temporarily
    tempContainer.appendChild(clonedPreview);
    document.body.appendChild(tempContainer);
    
    // Wait for it to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("Capturing temporary container with exact dimensions:", captureWidth, "x", captureHeight);
    
    // Capture the temporary container (which has exact dimensions)
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: false,
      width: captureWidth,
      height: captureHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, element) => {
        // Ensure fonts are loaded and text is visible in the cloned document
        console.log("=== html2canvas onclone callback ===");
        
        // Find the cloned container
        const clonedContainer = clonedDoc.body.firstElementChild;
        if (clonedContainer) {
          clonedContainer.style.width = `${captureWidth}px`;
          clonedContainer.style.height = `${captureHeight}px`;
          clonedContainer.style.overflow = 'hidden';
          
          // Find the cloned preview inside
          const clonedPreview = clonedContainer.firstElementChild;
          if (clonedPreview) {
            clonedPreview.style.width = `${captureWidth}px`;
            clonedPreview.style.height = `${captureHeight}px`;
            clonedPreview.style.overflow = 'hidden';
            
            // Ensure background image is exactly the preview size
            const bgImage = clonedPreview.querySelector('img');
            if (bgImage) {
              bgImage.style.width = `${captureWidth}px`;
              bgImage.style.height = `${captureHeight}px`;
              bgImage.style.objectFit = 'cover';
              bgImage.style.objectPosition = 'center';
            }
            
            // Fix text transforms
            const clonedTexts = clonedPreview.querySelectorAll('div[style*="absolute"]');
            clonedTexts.forEach((textEl) => {
              if (textEl.style.transform && textEl.style.transform.includes('translate(-50%, -50%)')) {
                const leftMatch = textEl.style.left.match(/(\d+)px/);
                const topMatch = textEl.style.top.match(/(\d+)px/);
                if (leftMatch && topMatch) {
                  const leftPx = parseFloat(leftMatch[1]);
                  const topPx = parseFloat(topMatch[1]);
                  const fontSize = parseFloat(textEl.style.fontSize) || 48;
                  const textWidth = textEl.textContent.length * (fontSize * 0.6);
                  const textHeight = fontSize;
                  textEl.style.transform = 'none';
                  textEl.style.left = `${leftPx - textWidth / 2}px`;
                  textEl.style.top = `${topPx - textHeight / 2}px`;
                }
              }
              textEl.style.zIndex = '999';
            });
          }
        }
      }
    });
    
    console.log("html2canvas capture successful!");
    console.log("Canvas size:", canvas.width, "x", canvas.height);
    console.log("Expected preview size:", captureWidth, "x", captureHeight);
    
    // ALWAYS crop to exact preview dimensions - this ensures we only get the preview, not the whole image
    const targetWidth = captureWidth;
    const targetHeight = captureHeight;
    
    console.log("Canvas before crop:", canvas.width, "x", canvas.height);
    console.log("Target preview size:", targetWidth, "x", targetHeight);
    
    // Create a new canvas with exact preview dimensions
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Fill with white background first (in case of transparency)
    croppedCtx.fillStyle = '#FFFFFF';
    croppedCtx.fillRect(0, 0, targetWidth, targetHeight);
    
    // Calculate how to crop: take the center portion if canvas is larger, or scale if smaller
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = Math.min(targetWidth, canvas.width);
    let sourceHeight = Math.min(targetHeight, canvas.height);
    
    // If canvas is larger than target, take from top-left corner
    if (canvas.width > targetWidth) {
      sourceWidth = targetWidth;
    }
    if (canvas.height > targetHeight) {
      sourceHeight = targetHeight;
    }
    
    console.log("Cropping from canvas:", {
      sourceX, sourceY, sourceWidth, sourceHeight,
      targetWidth, targetHeight
    });
    
    // Draw only the portion we need - this crops out any extra image
    croppedCtx.drawImage(
      canvas,
      sourceX, sourceY, // Source x, y (start from top-left)
      sourceWidth, sourceHeight, // Source width/height (crop to preview size)
      0, 0, // Destination x, y
      targetWidth, targetHeight // Destination size (exact preview dimensions)
    );
    
    console.log("Canvas cropped to:", croppedCanvas.width, "x", croppedCanvas.height);
    
    // Remove temporary container from DOM
    document.body.removeChild(tempContainer);
    
    // Convert to data URL (JPEG with quality 0.9)
    const dataUrl = croppedCanvas.toDataURL("image/jpeg", 0.9);
    console.log("Preview image generated, data URL length:", dataUrl.length);
    
    callback(dataUrl);
    return;
  } catch (error) {
    console.error("Error capturing preview with html2canvas:", error);
    console.error("Error details:", error.message, error.stack);
    console.log("Falling back to canvas method (which will crop the image)");
    // Fall through to fallback method
  }

  // Fallback: use legacy method (this crops the image to canvas size)
  if (fallbackData) {
    console.log("Using fallback canvas method with dimensions:", fallbackData.canvasWidth, "x", fallbackData.canvasHeight);
    createCanvasPreview(
      fallbackData.backgroundType,
      fallbackData.backgroundColor,
      fallbackData.backgroundGradient,
      fallbackData.backgroundImageUrl,
      fallbackData.getTextsFromContent,
      callback,
      fallbackData.canvasWidth,
      fallbackData.canvasHeight
    );
  } else {
    console.error("No fallback data available!");
    callback(null);
  }
};

/**
 * Legacy function - creates canvas preview by recreating the design
 * Kept for backward compatibility
 */
export const createCanvasPreview = (
  backgroundType,
  backgroundColor,
  backgroundGradient,
  backgroundImageUrl,
  getTextsFromContent,
  callback,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT
) => {
  console.log("createCanvasPreview: Creating canvas with exact dimensions:", canvasWidth, "x", canvasHeight);
  
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  
  console.log("Canvas created with size:", canvas.width, "x", canvas.height);

  // Helper to draw text and call callback (waits for fonts if available)
  const drawComplete = () => {
    const drawAndCallback = () => {
      // Get texts and verify they exist
      const texts = getTextsFromContent();
      console.log("Drawing texts in canvas preview:", texts);
      
      if (texts && texts.length > 0) {
        drawTexts(ctx, getTextsFromContent);
      } else {
        console.warn("No texts found to draw!");
      }
      
      // Use JPEG with quality 0.85 to reduce file size significantly
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    
    // Wait for fonts to be ready if available
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Add a small delay to ensure fonts are fully loaded
        setTimeout(drawAndCallback, 100);
      }).catch(() => {
        // If fonts.ready fails, draw anyway with delay
        setTimeout(drawAndCallback, 100);
      });
    } else {
      // Fallback: wait a bit for fonts to load
      setTimeout(drawAndCallback, 150);
    }
  };

  // Draw background
  if (backgroundType === "color") {
    if (backgroundGradient) {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
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
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    // Draw text on colored background
    drawComplete();
    return;
  } else if (backgroundType === "image" && backgroundImageUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const drawTextAfterImage = () => {
      // Get texts first to verify they exist
      const texts = getTextsFromContent();
      console.log("drawTextAfterImage: Texts to draw:", texts);
      
      const drawAndCallback = () => {
        if (texts && texts.length > 0) {
          console.log("drawTextAfterImage: Drawing texts on canvas...");
          drawTexts(ctx, getTextsFromContent);
          
          // Verify text was drawn by checking canvas
          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          const hasNonBackgroundPixels = Array.from(imageData.data).some((pixel, index) => {
            // Check if pixel is not background (not white/transparent)
            if (index % 4 === 3) return false; // Skip alpha channel
            return pixel < 250; // Not white/light background
          });
          console.log("drawTextAfterImage: Canvas has non-background pixels:", hasNonBackgroundPixels);
        } else {
          console.warn("drawTextAfterImage: No texts to draw!");
        }
        
        // Verify canvas is exactly the right size before exporting
        console.log("Final canvas size before export:", canvas.width, "x", canvas.height);
        console.log("Expected size:", canvasWidth, "x", canvasHeight);
        
        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
          console.error("Canvas size mismatch! Canvas:", canvas.width, "x", canvas.height, "Expected:", canvasWidth, "x", canvasHeight);
        }
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        console.log("drawTextAfterImage: Generated preview image, length:", dataUrl.length);
        
        // Verify the exported image dimensions by creating a test image
        const testImg = new Image();
        testImg.onload = () => {
          console.log("Exported image actual dimensions:", testImg.width, "x", testImg.height);
          if (testImg.width !== canvasWidth || testImg.height !== canvasHeight) {
            console.error("WARNING: Exported image size doesn't match preview size!");
          }
        };
        testImg.src = dataUrl;
        
        callback(dataUrl);
      };
      
      // Wait for fonts to be ready, then draw text
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          // Add delay to ensure fonts are fully loaded
          setTimeout(drawAndCallback, 200);
        }).catch(() => {
          // If fonts.ready fails, draw anyway with delay
          setTimeout(drawAndCallback, 200);
        });
      } else {
        // Fallback: wait a bit for fonts to load
        setTimeout(drawAndCallback, 250);
      }
    };
    
    img.onload = () => {
      console.log("Background image loaded, dimensions:", img.width, img.height);
      console.log("Canvas dimensions:", canvasWidth, "x", canvasHeight);
      
      // CRITICAL: Crop the background image to fit the canvas exactly
      // Calculate how to crop the image to center it and fill the canvas
      const imgAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
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
        "canvas": `${canvasWidth}x${canvasHeight} (aspect: ${canvasAspect.toFixed(3)})`,
        "crop area": `${sourceWidth}x${sourceHeight} from (${sourceX}, ${sourceY})`,
        "cropped aspect": croppedAspect.toFixed(3),
        "matches canvas": Math.abs(croppedAspect - canvasAspect) < 0.01
      });
      
      // Draw ONLY the cropped portion of the image to fill the canvas exactly
      // The cropped portion has the same aspect ratio as the canvas, so it will fill perfectly
      // This matches what object-fit: cover does in the preview
      ctx.drawImage(
        img,
        sourceX, sourceY, // Source: start position (cropped area from original image)
        sourceWidth, sourceHeight, // Source: cropped size (matches canvas aspect ratio)
        0, 0, // Destination: start at top-left of canvas
        canvasWidth, canvasHeight // Destination: fill entire canvas (600x1200)
      );
      
      // Verify the canvas is exactly the right size
      console.log("Background image drawn on canvas:", {
        "canvas size": `${canvas.width}x${canvas.height}`,
        "expected": `${canvasWidth}x${canvasHeight}`,
        "source crop": `${sourceWidth}x${sourceHeight} from (${sourceX}, ${sourceY})`,
        "original image": `${img.width}x${img.height}`
      });
      
      // Double-check: the canvas should be exactly canvasWidth x canvasHeight
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        console.error("ERROR: Canvas size mismatch!", {
          actual: `${canvas.width}x${canvas.height}`,
          expected: `${canvasWidth}x${canvasHeight}`
        });
      }
      // Draw text after image is loaded
      setTimeout(() => {
        drawTextAfterImage();
      }, 50);
    };
    
    img.onerror = () => {
      // If image fails to load, draw text on blank background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      drawComplete();
    };
    
    // Handle both relative and absolute URLs
    const imageUrl = backgroundImageUrl.startsWith('/') 
      ? window.location.origin + backgroundImageUrl 
      : backgroundImageUrl;
    img.src = imageUrl;
    return;
  } else {
    // No background - draw text on white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawComplete();
    return;
  }
};

const drawTexts = (context, getTextsFromContent) => {
  const texts = getTextsFromContent();
  if (!texts || texts.length === 0) {
    console.warn("drawTexts: No texts provided");
    return;
  }
  
  console.log("drawTexts: Drawing", texts.length, "text lines");
  
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
      .trim();
    
    // If font family is empty, use a default
    if (!fontFamily) {
      fontFamily = "Arial, sans-serif";
    }
    
    const fontSize = text.fontSize || 48;
    const fontString = `${fontSize}px ${fontFamily}`;
    context.font = fontString;
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Add text shadow/glow effect for visibility on images
    context.shadowColor = "rgba(0, 0, 0, 0.9)";
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Draw text with color - ensure it's visible
    const textColor = text.color || "#000000";
    context.fillStyle = textColor;
    const x = text.x !== undefined && text.x > 0 ? text.x : context.canvas.width / 2;
    const y = text.y !== undefined && text.y > 0 ? text.y : context.canvas.height / 2;
    
    console.log(`drawTexts: Drawing "${text.content}" at (${x}, ${y}) with font ${fontString} and color ${textColor}`);
    console.log(`drawTexts: Canvas dimensions: ${context.canvas.width}x${context.canvas.height}`);
    
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
    
    // Verify the text was drawn by checking a pixel near the text position
    const testX = Math.min(x + 10, context.canvas.width - 1);
    const testY = Math.min(y + 10, context.canvas.height - 1);
    const pixelData = context.getImageData(testX, testY, 1, 1).data;
    console.log(`drawTexts: Pixel at (${testX}, ${testY}):`, pixelData);
    
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
