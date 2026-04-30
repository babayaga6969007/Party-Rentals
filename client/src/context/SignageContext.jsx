import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { api } from "../utils/api";

// Default constants (fallback) - Using local fonts from public/fonts
/** Default font stack for new signage, reset, and missing-font fallbacks */
export const DEFAULT_SIGNAGE_FONT = "'BlackMango-Bold', sans-serif";

export const DEFAULT_FONTS = [
  { name: "Black Mango Bold", value: DEFAULT_SIGNAGE_FONT },
  { name: "Farmhouse", value: "'Farmhouse', cursive" },
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

/** Physical sign board size in feet — fixed in code; not editable in admin. */
export const SIGNAGE_BOARD_WIDTH_FT = 4;
export const SIGNAGE_BOARD_HEIGHT_FT = 8;

/**
 * Printable span (ft): full **painted** board width/height in canvas px map to 8′ × 8′ (96″ × 96″).
 * Used for px→in labels and pricing vs `boardClampRect` width/height.
 */
export const SIGNAGE_TEXT_BOUNDARY_WIDTH_FT = 8;
export const SIGNAGE_TEXT_BOUNDARY_WIDTH_INCHES = SIGNAGE_TEXT_BOUNDARY_WIDTH_FT * 12;

/** Convert text box width (canvas px) to inches using the board’s horizontal text boundary. */
export const textBoxWidthPxToInches = (textBoxWidthPx, boundaryWidthPx) => {
  const bw = Number(boundaryWidthPx);
  if (!Number.isFinite(bw) || bw <= 0) return 0;
  return (Number(textBoxWidthPx) || 0) * (SIGNAGE_TEXT_BOUNDARY_WIDTH_INCHES / bw);
};

export const SIGNAGE_TEXT_BOUNDARY_HEIGHT_FT = 8;
export const SIGNAGE_TEXT_BOUNDARY_HEIGHT_INCHES = SIGNAGE_TEXT_BOUNDARY_HEIGHT_FT * 12;

/** Convert text box height (canvas px) to inches using painted board height (same idea as width). */
export const textBoxHeightPxToInches = (textBoxHeightPx, boundaryHeightPx) => {
  const bh = Number(boundaryHeightPx);
  if (!Number.isFinite(bh) || bh <= 0) return 0;
  return (Number(textBoxHeightPx) || 0) * (SIGNAGE_TEXT_BOUNDARY_HEIGHT_INCHES / bh);
};

/**
 * Horizontal canvas px that maps to 96″ for the text box (slightly less than full painted width).
 * Keeps max-width labels in sync with what fits visually — browser text can exceed OpenType advance.
 */
export const SIGNAGE_TEXT_PRINTABLE_WIDTH_RATIO = 0.88;

export function signageTextPrintableWidthPx(boardClampWidthPx) {
  const bw = Number(boardClampWidthPx) || 1;
  return Math.max(32, bw * SIGNAGE_TEXT_PRINTABLE_WIDTH_RATIO);
}

/** Canvas px that matches physical inches on the painted board boundary. */
export function printedTextBoxCanvasPxFromInches(
  widthIn,
  heightIn,
  boundaryWidthPx,
  boundaryHeightPx
) {
  const bw = Number(boundaryWidthPx);
  const bh = Number(boundaryHeightPx);
  const wi = Number(widthIn) || 0;
  const hi = Number(heightIn) || 0;
  const printW = signageTextPrintableWidthPx(bw);
  const widthPx =
    Number.isFinite(printW) && printW > 0 ? (wi * printW) / SIGNAGE_TEXT_BOUNDARY_WIDTH_INCHES : 0;
  const heightPx =
    Number.isFinite(bh) && bh > 0 ? (hi * bh) / SIGNAGE_TEXT_BOUNDARY_HEIGHT_INCHES : 0;
  return { widthPx, heightPx };
}

/** Reference pair: 90″×26″ rule for resize box aspect and height-from-width pricing (separate from 8′×8′ px→in span). */
export const SIGNAGE_TEXT_ASPECT_REF_WIDTH_IN = 90;
export const SIGNAGE_TEXT_ASPECT_REF_HEIGHT_IN = 26;
export const SIGNAGE_TEXT_ASPECT_H_PER_W =
  SIGNAGE_TEXT_ASPECT_REF_HEIGHT_IN / SIGNAGE_TEXT_ASPECT_REF_WIDTH_IN;

/**
 * Default printed text box (pristine: “Hello”, default font, 100% scale).
 * Same aspect as the 90×26″ resize rule. Height is derived from width.
 */
export const INITIAL_PRINTED_TEXT_BOX_WIDTH_IN = 28;
export const INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN =
  (INITIAL_PRINTED_TEXT_BOX_WIDTH_IN * SIGNAGE_TEXT_ASPECT_REF_HEIGHT_IN) /
  SIGNAGE_TEXT_ASPECT_REF_WIDTH_IN;

export const signageTextHeightInchesForWidthInches = (widthInches) =>
  (Number(widthInches) || 0) * SIGNAGE_TEXT_ASPECT_H_PER_W;

/**
 * Canvas px height for a given box width so inches match height = width × (26 / aspect ref width).
 * Uses painted board aspect (bh/bw) so width/height inches scale together with the 90×26 rule.
 */
export const textBoxHeightPxForAspectWidthPx = (widthPx, boundaryWidthPx, boundaryHeightPx) => {
  const bw = Number(boundaryWidthPx);
  const bh = Number(boundaryHeightPx);
  const w = Number(widthPx) || 0;
  if (!Number.isFinite(bw) || bw <= 0) return w * SIGNAGE_TEXT_ASPECT_H_PER_W;
  const boardRatio = Number.isFinite(bh) && bh > 0 ? bh / bw : 1;
  return w * boardRatio * SIGNAGE_TEXT_ASPECT_H_PER_W;
};

const aspectK = (boardWidth, boardHeight) =>
  (Number(boardHeight) || 1) / (Number(boardWidth) || 1) * SIGNAGE_TEXT_ASPECT_H_PER_W;

/** Minimum logical box size in canvas px when using the corner resize handle (allow sub-inch print areas). */
export const SIGNAGE_RESIZE_MIN_CANVAS_PX = 1;

/**
 * Top-left for a w×h box inside the painted board, staying as close as possible to the
 * resize anchor. Lets width reach the full printable span (96″ mapping) even when the
 * box started centered — the box slides left/up instead of stopping at ~anchor→edge.
 */
export function signageResizeClampTopLeft(anchorX, anchorY, w, h, board) {
  const b = board;
  const aw = Number(w) || 0;
  const ah = Number(h) || 0;
  const ax = Number(anchorX) || 0;
  const ay = Number(anchorY) || 0;
  const tlX = Math.max(b.left, Math.min(ax, b.left + b.width - aw));
  const tlY = Math.max(b.top, Math.min(ay, b.top + b.height - ah));
  return { tlX, tlY };
}

/**
 * Bottom-right resize: width from cursor (uniform scale hint), height = f(width) for 90×26″ physical rule.
 */
export const signageResizeBoxWithAspect = ({
  startWidth: sw,
  startHeight: sh,
  pointerWidth: nw,
  pointerHeight: nh,
  anchorX,
  anchorY,
  board: b,
  contentMinW = 0,
  contentMinH = 0,
}) => {
  const k = aspectK(b.width, b.height);
  /** Match px→in printable span so “96 in” is reached before glyphs hit the panel edge. */
  const maxW = Math.max(0, signageTextPrintableWidthPx(b.width));
  const maxH = Math.max(0, b.height);
  const minDim = SIGNAGE_RESIZE_MIN_CANVAS_PX;
  const scale = sw > 0 && sh > 0 ? Math.min(nw / sw, nh / sh) : 1;
  let w = sw * scale;
  w = Math.max(minDim, contentMinW, Math.min(w, maxW));
  let h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
  if (h > maxH) {
    h = maxH;
    w = k > 0 ? h / k : w;
  }
  w = Math.max(minDim, contentMinW, Math.min(w, maxW));
  h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
  if (h > maxH) {
    h = maxH;
    w = k > 0 ? h / k : w;
    w = Math.max(minDim, contentMinW, Math.min(w, maxW));
    h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
  }
  const minH = Math.max(minDim, contentMinH);
  if (h < minH) {
    h = minH;
    w = k > 0 ? h / k : w;
    if (w > maxW) {
      w = maxW;
      h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
    }
    w = Math.max(minDim, contentMinW, w);
    h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
    if (h > maxH) {
      h = maxH;
      w = k > 0 ? h / k : w;
    }
  }
  if (maxW > 0 && w >= maxW - 1.5) {
    w = maxW;
    h = textBoxHeightPxForAspectWidthPx(w, b.width, b.height);
    if (h > maxH) {
      h = maxH;
      w = k > 0 ? h / k : w;
    }
  }
  return { w, h };
};

// Reference canvas height for text size scaling (font sizes in config are at this height)
const REFERENCE_CANVAS_HEIGHT = Math.round(SIGNAGE_BOARD_HEIGHT_FT * PX_PER_FT);

export const DEFAULT_CANVAS_WIDTH = Math.round(SIGNAGE_BOARD_WIDTH_FT * PX_PER_FT);
export const DEFAULT_CANVAS_HEIGHT = Math.round(SIGNAGE_BOARD_HEIGHT_FT * PX_PER_FT);

// Vertical board: centered, attached to bottom (fraction of canvas width / height).
export const BOARD_WIDTH_RATIO = 0.7;
export const BOARD_HEIGHT_RATIO = 0.72;
export const VERTICAL_BOARD_IMAGE_URL = "/signage/vertical-board.png";

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

/**
 * Actual painted rect of the vertical board PNG inside the outer board box (canvas px).
 * Matches CSS object-fit: contain + object-position: bottom (horizontal center).
 * If natural size is unknown, returns the same rect as getBoardBounds.
 */
export const getBoardPaintRect = (cw, ch, naturalW, naturalH) => {
  const outer = getBoardBounds(cw, ch);
  const nw = Number(naturalW);
  const nh = Number(naturalH);
  if (!Number.isFinite(nw) || !Number.isFinite(nh) || nw <= 0 || nh <= 0) {
    return outer;
  }
  const boxW = outer.width;
  const boxH = outer.height;
  const scale = Math.min(boxW / nw, boxH / nh);
  const paintedW = nw * scale;
  const paintedH = nh * scale;
  const offsetX = (boxW - paintedW) / 2;
  const offsetY = boxH - paintedH;
  return {
    left: Math.round(outer.left + offsetX),
    top: Math.round(outer.top + offsetY),
    width: Math.round(paintedW),
    height: Math.round(paintedH),
  };
};

/** Extra half-width when clamping (keep 0 so a full-width box can reach the full horizontal boundary in inches). */
const CLAMP_BOX_HALF_WIDTH_PAD = 0;

/**
 * Clamp text anchor (center x/y) for the axis-aligned box [w×h] in canvas coordinates.
 *
 * Horizontal (left/right drag limit):
 * 1. Pass the **painted** board rect from getBoardPaintRect (not the outer div) so text stays on the pink panel.
 * 2. Canvas band: box stays inside [0, canvasWidth].
 * halfW is inflated slightly by CLAMP_BOX_HALF_WIDTH_PAD for outline / rendering bleed.
 *
 * Vertical: intersect canvas [halfH, ch-halfH] with painted board vertical span.
 *
 * @param canvasWidth - required for horizontal canvas edge clamp (same as editor canvas logical width)
 */
export const clampTextCenterInBoard = (board, centerX, centerY, boxWidth, boxHeight, canvasHeight, canvasWidth) => {
  const w = Number(boxWidth) || 0;
  const h = Number(boxHeight) || 0;
  const halfW = w / 2 + CLAMP_BOX_HALF_WIDTH_PAD;
  const halfH = h / 2;
  const { left, top, width, height } = board;
  const right = left + width;

  /** Inset so handles / labels clear the panel edge; drop when the box is almost full width (else no valid center). */
  const padLX = 20;
  const padRX = 15;
  let minCX = left + halfW + padLX;
  let maxCX = right - halfW - padRX;
  if (minCX > maxCX) {
    minCX = left + halfW;
    maxCX = right - halfW;
  }
  if (minCX > maxCX) {
    const mid = (left + right) / 2;
    minCX = maxCX = mid;
  }

  const cw = canvasWidth != null && Number(canvasWidth) > 0 ? Number(canvasWidth) : null;
  if (cw != null) {
    const canvasMin = halfW;
    const canvasMax = cw - halfW;
    if (canvasMin <= canvasMax) {
      minCX = Math.max(minCX, canvasMin);
      maxCX = Math.min(maxCX, canvasMax);
      if (minCX > maxCX) {
        minCX = canvasMin;
        maxCX = canvasMax;
      }
      if (minCX > maxCX) {
        const mid = cw / 2;
        minCX = maxCX = mid;
      }
    }
  }

  const ch =
    canvasHeight != null && Number(canvasHeight) > 0 ? Number(canvasHeight) : top + height;
  const boardBottom = top + height;
  let minCY = halfH;
  let maxCY = ch - halfH;
  const boardMinCY = top + halfH;
  const boardMaxCY = boardBottom - halfH;
  if (boardMinCY <= boardMaxCY) {
    minCY = Math.max(minCY, boardMinCY);
    maxCY = Math.min(maxCY, boardMaxCY);
  }
  if (minCY > maxCY) {
    minCY = boardMinCY;
    maxCY = boardMaxCY;
  }
  if (minCY > maxCY) {
    const mid = (top + boardBottom) / 2;
    minCY = maxCY = mid;
  }

  return {
    x: Math.max(minCX, Math.min(centerX, maxCX)),
    y: Math.max(minCY, Math.min(centerY, maxCY)),
  };
};

/** Canvas px — drop-shadow / glow sits outside glyph ink (must match textDragClampBox). */
export const TEXT_DRAG_CLAMP_PAD_PX = 18;

/** Ignore glyph→px extents beyond this past the logical box (bad metrics were shrinking max resize). */
const GLYPH_DRAG_BLEED_PX = 56;

/**
 * Same effective w×h as `textDragClampBox`: logical box union glyph span + pad.
 * Glyph inches from layout can spike (e.g. height); cap how far past the box they may expand drag.
 */
export function computeTextDragClampDimensionsPx(
  textBoxW,
  textBoxH,
  boardW,
  boardH,
  extentWIn,
  extentHIn
) {
  const bw = Number(boardW) || 0;
  const bh = Number(boardH) || 0;
  let w = Number(textBoxW) || 0;
  let h = Number(textBoxH) || 0;
  const printW = signageTextPrintableWidthPx(bw);
  const wIn = extentWIn;
  const hIn = extentHIn;
  if (wIn != null && Number.isFinite(wIn) && wIn > 0 && Number.isFinite(printW) && printW > 0) {
    const wGlyph = (wIn * printW) / SIGNAGE_TEXT_BOUNDARY_WIDTH_INCHES;
    w = Math.max(w, Math.min(wGlyph, w + GLYPH_DRAG_BLEED_PX));
  }
  if (hIn != null && Number.isFinite(hIn) && hIn > 0 && Number.isFinite(bh) && bh > 0) {
    const hGlyph = (hIn * bh) / SIGNAGE_TEXT_BOUNDARY_HEIGHT_INCHES;
    h = Math.max(h, Math.min(hGlyph, h + GLYPH_DRAG_BLEED_PX));
  }
  return { width: w + TEXT_DRAG_CLAMP_PAD_PX, height: h + TEXT_DRAG_CLAMP_PAD_PX };
}

/**
 * Shrink a resize result (90×26 aspect) until the drag-clamp box fits
 * `clampTextCenterInBoard` at the resulting center — same limit as moving the text.
 * Uses {@link signageResizeClampTopLeft} so near-max width isn’t capped by the initial TL anchor.
 */
export function shrinkSignageResizeToDragClamp({
  w,
  h,
  anchorX,
  anchorY,
  board,
  canvasWidth,
  canvasHeight,
  extentWIn,
  extentHIn,
  contentMinW = 0,
  contentMinH = 0,
  minDim = SIGNAGE_RESIZE_MIN_CANVAS_PX,
}) {
  const b = board;
  const bw = b.width;
  const bh = b.height;
  const maxW = Math.max(0, signageTextPrintableWidthPx(bw));
  const maxH = Math.max(0, bh);
  const cw = canvasWidth != null && Number(canvasWidth) > 0 ? Number(canvasWidth) : 600;
  const ch = canvasHeight != null && Number(canvasHeight) > 0 ? Number(canvasHeight) : 1200;
  const boardRatio = Number.isFinite(bh) && Number.isFinite(bw) && bw > 0 ? bh / bw : 1;
  const invAspect = boardRatio * SIGNAGE_TEXT_ASPECT_H_PER_W;

  const applyBoardCaps = (wCandidate) => {
    let w1 = Math.max(minDim, contentMinW, Math.min(wCandidate, maxW));
    let h1 = textBoxHeightPxForAspectWidthPx(w1, bw, bh);
    if (h1 > maxH) {
      h1 = maxH;
      w1 = invAspect > 0 ? h1 / invAspect : w1;
      w1 = Math.max(minDim, contentMinW, Math.min(w1, maxW));
      h1 = textBoxHeightPxForAspectWidthPx(w1, bw, bh);
    }
    const minH = Math.max(minDim, contentMinH);
    if (h1 < minH) {
      h1 = minH;
      w1 = invAspect > 0 ? h1 / invAspect : w1;
      w1 = Math.max(minDim, contentMinW, Math.min(w1, maxW));
      h1 = textBoxHeightPxForAspectWidthPx(w1, bw, bh);
    }
    return { w: w1, h: h1 };
  };

  let { w: w0, h: h0 } = applyBoardCaps(w);
  /** Allow small float / clamp delta so near-max boxes are not treated as “must shrink”. */
  const eps = 4;
  for (let i = 0; i < 40; i++) {
    const drag = computeTextDragClampDimensionsPx(w0, h0, bw, bh, extentWIn, extentHIn);
    const { tlX, tlY } = signageResizeClampTopLeft(anchorX, anchorY, w0, h0, b);
    const cx = tlX + w0 / 2;
    const cy = tlY + h0 / 2;
    const c2 = clampTextCenterInBoard(b, cx, cy, drag.width, drag.height, ch, cw);
    if (Math.abs(c2.x - cx) <= eps && Math.abs(c2.y - cy) <= eps) {
      return { w: w0, h: h0 };
    }
    const narrowed = Math.max(minDim, contentMinW, w0 * 0.9);
    ({ w: w0, h: h0 } = applyBoardCaps(narrowed));
  }
  return { w: w0, h: h0 };
}

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

/** Acrylic signage on /signage: only these text colors (hex used for preview, cart, orders). */
export const ACRYLIC_TEXT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  {
    name: "Mirrored Gold",
    value: "#d4af37",
    swatch: "linear-gradient(145deg, #fffef5 0%, #e8c547 35%, #b8941f 70%, #6b5918 100%)",
  },
  {
    name: "Mirrored Silver",
    value: "#b8c0cc",
    swatch: "linear-gradient(145deg, #ffffff 0%, #d8dee8 40%, #9aa3b0 75%, #5c6570 100%)",
  },
];

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
  const [canvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const widthFt = SIGNAGE_BOARD_WIDTH_FT;
  const heightFt = SIGNAGE_BOARD_HEIGHT_FT;
  const [pricePerWidthInchAcrylic, setPricePerWidthInchAcrylic] = useState(0);
  const [pricePerWidthInchVinyl, setPricePerWidthInchVinyl] = useState(0);
  const [printFilePrepFee, setPrintFilePrepFee] = useState(25);
  const [configLoading, setConfigLoading] = useState(true);

  // Signage type: acrylic | vinyl (user-facing choice)
  const [signageType, setSignageType] = useState("acrylic");

  // Rush production: sign needed in 3-5 days; adds +30% to initial price (excluding print file prep)
  const [rushProduction, setRushProduction] = useState(false);

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
          const bmIdx = uniqueFonts.findIndex((f) => f.value === DEFAULT_SIGNAGE_FONT);
          const orderedFonts =
            bmIdx > 0
              ? [uniqueFonts[bmIdx], ...uniqueFonts.filter((_, i) => i !== bmIdx)]
              : uniqueFonts;

          setFonts(orderedFonts);
          
          // Store raw sizes config (with labels)
          setTextSizesConfig(res.config.sizes || []);
          
          // Board width/height: SIGNAGE_BOARD_WIDTH_FT / SIGNAGE_BOARD_HEIGHT_FT (client constants)

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
          const pwA = Number(res.config.pricePerWidthInchAcrylic);
          const pwV = Number(res.config.pricePerWidthInchVinyl);
          setPricePerWidthInchAcrylic(Number.isFinite(pwA) && pwA >= 0 ? pwA : 0);
          setPricePerWidthInchVinyl(Number.isFinite(pwV) && pwV >= 0 ? pwV : 0);
          // Print file preparation fee (added to every sign order)
          const prepFee = Number(res.config.printFilePrepFee);
          setPrintFilePrepFee(Number.isFinite(prepFee) && prepFee >= 0 ? prepFee : 25);
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
  const [selectedFont, setSelectedFont] = useState(DEFAULT_SIGNAGE_FONT);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000"); // Black by default
  const [selectedSize, setSelectedSize] = useState("medium");
  
  // Text position (single position for entire text block)
  // Initialize at center horizontally, a bit below top
  const [textPosition, setTextPosition] = useState({ 
    x: DEFAULT_CANVAS_WIDTH / 2, // Horizontally centered
    y: 520, // A bit below top
  });
  
  // Background - Default to pink wallpaper image
  const [backgroundType, setBackgroundType] = useState("image");
  const [backgroundColor, setBackgroundColor] = useState("#F8F9FA");
  const [backgroundGradient, setBackgroundGradient] = useState(
    "linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)"
  );
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("/signage/signage-bg.jpeg");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#F8F9FA");

  // User-adjustable text scale (0.5 = 50%, 2 = 200%)
  const [userTextScale, setUserTextScale] = useState(1);

  /** When true, skip fixed 0.6167″×1.0931″ initial box (e.g. cart edit restores saved text box). */
  const [disableInitialPrintedBoxSizing, setDisableInitialPrintedBoxSizing] = useState(false);

  // Text box dimensions (visible on canvas; synced from size preset, updated when user resizes from handle)
  const [textBoxWidth, setTextBoxWidth] = useState(250);
  const [textBoxHeight, setTextBoxHeight] = useState(60);

  /** naturalWidth/Height of vertical-board.png (set from preview onLoad). */
  const [verticalBoardNaturalSize, setVerticalBoardNaturalSize] = useState(null);

  const boardClampRect = useMemo(
    () =>
      getBoardPaintRect(
        canvasWidth,
        canvasHeight,
        verticalBoardNaturalSize?.w,
        verticalBoardNaturalSize?.h
      ),
    [canvasWidth, canvasHeight, verticalBoardNaturalSize]
  );

  // Default anchor: outer board box (same as before paint-rect work). Clamp still uses painted panel so drag stays on pink.
  useEffect(() => {
    if (!canvasWidth || !canvasHeight || configLoading) return;
    const outer = getBoardBounds(canvasWidth, canvasHeight);
    const defaultCX = outer.left + outer.width / 2;
    const defaultCY = outer.top + outer.height * 0.72;
    setTextPosition((prev) => {
      const pristine = prev.x === DEFAULT_CANVAS_WIDTH / 2 && prev.y === 520;
      const targetX = pristine ? defaultCX : prev.x;
      const targetY = pristine ? defaultCY : prev.y;
      const next = clampTextCenterInBoard(
        boardClampRect,
        targetX,
        targetY,
        textBoxWidth,
        textBoxHeight,
        canvasHeight,
        canvasWidth
      );
      if (next.x === prev.x && next.y === prev.y) return prev;
      return next;
    });
  }, [canvasWidth, canvasHeight, configLoading, textBoxWidth, textBoxHeight, boardClampRect]);

  /** Illustrator-style bounds: physical size of rendered glyphs (set from SignagePreview measuring the live text span). */
  const [textExtentInches, setTextExtentInchesState] = useState({ width: null, height: null });
  const setTextExtentInches = useCallback((wIn, hIn) => {
    if (wIn == null && hIn == null) {
      setTextExtentInchesState({ width: null, height: null });
      return;
    }
    setTextExtentInchesState({
      width: wIn != null && Number.isFinite(wIn) && wIn > 0 ? wIn : null,
      height: hIn != null && Number.isFinite(hIn) && hIn > 0 ? hIn : null,
    });
  }, []);

  // Minimum container size that fits current text (set by SignagePreview after measure; editor clamps resize to this)
  const contentMinSizeRef = useRef({ w: 0, h: 0 });
  const setContentMinSize = useCallback((w, h) => {
    contentMinSizeRef.current = { w: Number(w) || 0, h: Number(h) || 0 };
  }, []);

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

  // Pricing: text width inches vs horizontal printable boundary on the board, not full canvas width
  const widthInches = textBoxWidthPxToInches(
    textBoxWidth,
    signageTextPrintableWidthPx(boardClampRect.width)
  );
  const heightInches = signageTextHeightInchesForWidthInches(widthInches);
  const textWidthInches = textExtentInches.width;
  const textHeightInches = textExtentInches.height;

  /** Canvas px box to keep *visible* glyphs inside the board/canvas when dragging (logical box can be tiny). */
  const textDragClampBox = useMemo(() => {
    return computeTextDragClampDimensionsPx(
      textBoxWidth,
      textBoxHeight,
      boardClampRect.width,
      boardClampRect.height,
      textExtentInches.width,
      textExtentInches.height
    );
  }, [
    textBoxWidth,
    textBoxHeight,
    textExtentInches.width,
    textExtentInches.height,
    boardClampRect.width,
    boardClampRect.height,
  ]);

  const pricePerWidthInch =
    signageType === "vinyl" ? pricePerWidthInchVinyl : pricePerWidthInchAcrylic;
  const widthBasedPrice = (pricePerWidthInch || 0) * widthInches;
  const basePrice =
    pricePerWidthInch > 0
      ? Math.round(widthBasedPrice * 100) / 100
      : (textSizes && Object.keys(textSizes).length > 0)
        ? (textSizes[selectedSize]?.price ?? textSizes.medium?.price ?? 0)
        : 0;
  const rushFee = rushProduction ? Math.round(basePrice * 0.3 * 100) / 100 : 0;
  const currentPrice = basePrice + (Number(printFilePrepFee) || 0) + rushFee;

  // Text box width/height are driven by SignagePreview measurement + user resize (no forced 13.5" width).

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
    setDisableInitialPrintedBoxSizing(false);
    setTextContent("Hello");
    setSelectedFont(DEFAULT_SIGNAGE_FONT);
    setSelectedTextColor(normalizeHexColor("#000000"));
    setSelectedSize("medium");
    setUserTextScale(1);
    // textBoxWidth/textBoxHeight: next SignagePreview layout measure will fit "Hello" to the box
    const outer = getBoardBounds(canvasWidth, canvasHeight);
    const cx = outer.left + outer.width / 2;
    const cy = outer.top + outer.height * 0.72;
    setTextPosition(clampTextCenterInBoard(boardClampRect, cx, cy, textBoxWidth, textBoxHeight, canvasHeight, canvasWidth));
    setBackgroundType("image");
    setBackgroundColor("#F8F9FA");
    setBackgroundGradient("linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 50%, #FFDAB9 100%)");
    setBackgroundImage(null);
    setBackgroundImageUrl("/signage/signage-bg.jpeg");
    setCustomBackgroundColor("#F8F9FA");
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setIsTextHovered(false);
    setIsTextClicked(false);
    setTextExtentInches(null, null);
  }, [canvasWidth, canvasHeight, textBoxWidth, textBoxHeight, boardClampRect, setTextExtentInches]);

  const memoizedLoadSignage = useCallback((signageData) => {
    if (signageData.texts && signageData.texts.length > 0) {
      const content = signageData.texts.map(t => t.content).join('\n');
      setTextContent(content);
      
      if (signageData.texts[0]) {
        const firstText = signageData.texts[0];
        const lines = content.split('\n').filter(line => line.trim());
        const lineHeight = (firstText.fontSize || 48) * 1.5;
        const totalHeight = (lines.length - 1) * lineHeight;
        const px = firstText.x;
        const py = firstText.y + totalHeight / 2;
        setTextPosition(clampTextCenterInBoard(boardClampRect, px, py, textBoxWidth, textBoxHeight, canvasHeight, canvasWidth));
        setSelectedFont(firstText.fontFamily || DEFAULT_SIGNAGE_FONT);
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
  }, [canvasWidth, canvasHeight, textBoxWidth, textBoxHeight, boardClampRect]);

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
    setUserTextScale,
    setDisableInitialPrintedBoxSizing,
    setTextBoxWidth,
    setTextBoxHeight,
    setTextExtentInches,
    setVerticalBoardNaturalSize,
    setContentMinSize,
    contentMinSizeRef,
    setSignageType,
    setRushProduction,
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
    verticalBoardImageUrl: VERTICAL_BOARD_IMAGE_URL,
    boardClampRect,
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
    textWidthInches,
    textHeightInches,
    configLoading,
    signageType,
    printFilePrepFee,
    rushProduction,
    basePrice,
    rushFee,
    
    // Computed
    textSize,
    fontSize,
    userTextScale,
    disableInitialPrintedBoxSizing,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,
    textDragClampBox,
    contentMinSizeRef,

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
    boardClampRect,
    isDragging,
    dragOffset,
    isTextHovered,
    isTextClicked,
    textSize,
    fontSize,
    userTextScale,
    disableInitialPrintedBoxSizing,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,
    textDragClampBox,
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
    textWidthInches,
    textHeightInches,
    configLoading,
    signageType,
    printFilePrepFee,
    rushProduction,
    basePrice,
    rushFee,
    stableSetters,
    stableFunctions,
  ]);

  return <SignageContext.Provider value={value}>{children}</SignageContext.Provider>;
};
