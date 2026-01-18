import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "../context/SignageContext";

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
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

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
  } else if (backgroundImageUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      drawTexts(ctx, getTextsFromContent);
      // Use JPEG with quality 0.85 to reduce file size significantly
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = backgroundImageUrl;
    return;
  } else {
    drawTexts(ctx, getTextsFromContent);
    // Use JPEG with quality 0.85 to reduce file size significantly
    callback(canvas.toDataURL("image/jpeg", 0.85));
    return;
  }

  drawTexts(ctx, getTextsFromContent);
  // Use JPEG with quality 0.85 to reduce file size significantly
  callback(canvas.toDataURL("image/jpeg", 0.85));
};

const drawTexts = (context, getTextsFromContent) => {
  const texts = getTextsFromContent();
  texts.forEach((text) => {
    context.font = `${text.fontSize}px ${text.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Add glow effect
    context.shadowColor = "rgba(255, 255, 255, 0.8)";
    context.shadowBlur = 10;
    context.fillStyle = text.color;
    context.fillText(text.content, text.x, text.y);
    
    // Reset shadow
    context.shadowBlur = 0;
  });
};
