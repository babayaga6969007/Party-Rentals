import { useRef, useState, useLayoutEffect, useEffect } from "react";
import {
  useSignage,
  getBoardBounds,
  clampTextCenterInBoard,
  normalizeHexColor,
  DEFAULT_SIGNAGE_FONT,
  INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
  INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
  printedTextBoxCanvasPxFromInches,
} from "../../context/SignageContext";
import {
  canvasPxWidthFromMeasureDom,
  tightWidthCanvasPx,
  computeClampedTextBoxSizePx,
  computeGlyphExtentInchesFromVisibleRect,
  typographicCanvasPxToInches,
  computePrintedBoxInches,
  formatInchesLabel,
} from "./signagePreviewTextDimensions";
import SignageTextResizeHandle from "./SignageTextResizeHandle";
import { getSignageOpenTypeFontUrl } from "../../utils/fontLoader";
import {
  loadSignageOpenTypeFont,
  measureSignageTextWithOpenType,
  measureSignageTypographicCanvasPx,
} from "../../utils/signageOpenTypeMeasure";

export default function SignagePreviewText({
  displayPosition,
  scale,
  hasSize,
  canvasLeft,
  canvasTop,
  cw,
  ch,
  isEditable = true,
  isDragging,
  onTextMouseDown,
  onTouchStart,
  onResizeHandleMouseDown,
  onResizeHandleTouchStart,
}) {
  const {
    textContent,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textSize,
    userTextScale,
    disableInitialPrintedBoxSizing,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,
    setTextBoxWidth,
    setTextBoxHeight,
    setTextExtentInches,
    setContentMinSize,
    boardClampRect,
  } = useSignage();

  const textMeasureRef = useRef(null);
  const visibleTextRef = useRef(null);
  /** Rendered glyph size in preview CSS px (union with logical box for chrome / dimensions / handle). */
  const [glyphScreenCssPx, setGlyphScreenCssPx] = useState({ w: 0, h: 0 });
  const [baseBoxHeightState, setBaseBoxHeightState] = useState(
    (textSize?.height ?? 60) * (userTextScale ?? 1)
  );
  /** String advance width in canvas px at `effectiveFontSize` (OpenType or hidden DOM). */
  const [stringWidthCanvasAtEffFont, setStringWidthCanvasAtEffFont] = useState(0);
  /** OpenType sTypo + advance → inches (Illustrator-style), when a font file is available. */
  const [illustratorTypeIn, setIllustratorTypeIn] = useState({ w: null, h: null });
  const [illustratorScreenPx, setIllustratorScreenPx] = useState({ w: 0, h: 0 });

  const displayText = (textContent?.trim() || "Hello").replace(/\n/g, " ").trim() || "Hello";

  const b = getBoardBounds(cw, ch);
  const rawCenterX = displayPosition.x != null ? displayPosition.x : b.left + b.width / 2;
  const rawCenterY = displayPosition.y != null ? displayPosition.y : b.top + b.height * 0.72;
  const { x: centerX, y: centerY } = clampTextCenterInBoard(
    boardClampRect,
    rawCenterX,
    rawCenterY,
    textBoxWidth,
    textBoxHeight,
    ch,
    cw
  );
  /** Canvas center → screen px within the full-canvas overlay (origin = canvas top-left). */
  const textCenterOffsetX = hasSize ? centerX * scale : null;
  const textCenterOffsetY = hasSize ? centerY * scale : null;
  const clipLeftPx = hasSize ? boardClampRect.left * scale : 0;
  const clipTopPx = hasSize ? boardClampRect.top * scale : 0;
  const clipWpx = hasSize ? boardClampRect.width * scale : 0;
  const clipHpx = hasSize ? boardClampRect.height * scale : 0;
  const textBoxWidthPx = hasSize ? (effectiveTextSize?.width ?? 250) * scale : 0;
  const textBoxHeightPx = hasSize ? (effectiveTextSize?.height ?? 60) * scale : 0;

  const baseBoxHeight = baseBoxHeightState;

  // Scale font with box height, but never wider than the logical text box (canvas px).
  const fontScaleFromHeight = baseBoxHeight > 0 ? textBoxHeight / baseBoxHeight : 1;
  /** Slight slack: DOM / bold rendering can exceed OpenType advance at large sizes. */
  const WIDTH_MEASURE_SLACK = 1.045;
  const fontScaleFromWidth =
    stringWidthCanvasAtEffFont > 0 && textBoxWidth > 0
      ? textBoxWidth / (stringWidthCanvasAtEffFont * WIDTH_MEASURE_SLACK)
      : Number.POSITIVE_INFINITY;
  const fontScaleFromBox = Math.min(fontScaleFromHeight, fontScaleFromWidth);
  const scaledFontSize = hasSize
    ? effectiveFontSize * fontScaleFromBox * scale
    : effectiveFontSize;

  const fontFileUrl = getSignageOpenTypeFontUrl(selectedFont);

  /**
   * OpenType: advance at base `effectiveFontSize` (for width cap) + typographic line box at
   * the same logical size as the preview (`effectiveFontSize * fontScale` computed in .then
   * so it never references state before the first `advBase` is known).
   */
  useEffect(() => {
    if (!hasSize || !scale || scale <= 0 || !fontFileUrl) {
      setIllustratorTypeIn({ w: null, h: null });
      setIllustratorScreenPx({ w: 0, h: 0 });
      return;
    }
    let cancelled = false;
    loadSignageOpenTypeFont(fontFileUrl)
      .then((font) => {
        if (cancelled) return;
        const advBase = font.getAdvanceWidth(displayText, effectiveFontSize);
        if (Number.isFinite(advBase) && advBase > 0) {
          setStringWidthCanvasAtEffFont(Math.round(advBase * 100) / 100);
        }
        const fsh = baseBoxHeight > 0 ? textBoxHeight / baseBoxHeight : 1;
        const fsw =
          advBase > 0 && textBoxWidth > 0
            ? textBoxWidth / (advBase * WIDTH_MEASURE_SLACK)
            : Number.POSITIVE_INFINITY;
        const fontScale = Math.min(fsh, fsw);
        const logical = effectiveFontSize * fontScale;
        const { widthPx, heightPx } = measureSignageTypographicCanvasPx(
          font,
          displayText,
          logical
        );
        const { widthIn, heightIn } = typographicCanvasPxToInches(
          widthPx,
          heightPx,
          boardClampRect.width,
          boardClampRect.height
        );
        setIllustratorTypeIn({ w: widthIn, h: heightIn });
        setTextExtentInches(widthIn, heightIn);
        setIllustratorScreenPx({ w: widthPx * scale, h: heightPx * scale });
      })
      .catch(() => {
        if (cancelled) return;
        setIllustratorTypeIn({ w: null, h: null });
        setIllustratorScreenPx({ w: 0, h: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [
    hasSize,
    scale,
    fontFileUrl,
    displayText,
    effectiveFontSize,
    textBoxWidth,
    textBoxHeight,
    baseBoxHeight,
    boardClampRect.width,
    boardClampRect.height,
    setTextExtentInches,
  ]);

  useLayoutEffect(() => {
    if (fontFileUrl) return;
    const m = textMeasureRef.current;
    if (!m || !scale || scale <= 0) {
      setStringWidthCanvasAtEffFont(0);
      return;
    }
    const w = canvasPxWidthFromMeasureDom(m.getBoundingClientRect().width, scale);
    if (!Number.isFinite(w) || w <= 0) return;
    setStringWidthCanvasAtEffFont((prev) => {
      const rounded = Math.round(w * 100) / 100;
      return Math.abs(prev - rounded) < 0.25 ? prev : rounded;
    });
  }, [fontFileUrl, displayText, selectedFont, effectiveFontSize, scale]);

  const fontMatchesDefault =
    selectedFont === DEFAULT_SIGNAGE_FONT ||
    (typeof selectedFont === "string" && selectedFont.includes("BlackMango-Bold"));

  const useInitialPrintedBox =
    !disableInitialPrintedBoxSizing &&
    displayText === "Hello" &&
    fontMatchesDefault &&
    (userTextScale ?? 1) === 1 &&
    selectedSize === "medium";

  useLayoutEffect(() => {
    if (!useInitialPrintedBox || !scale || scale <= 0) return;
    const bw = boardClampRect.width;
    const bh = boardClampRect.height;
    if (!(bw > 0 && bh > 0)) return;

    const { widthPx, heightPx } = printedTextBoxCanvasPxFromInches(
      INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
      INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
      bw,
      bh
    );
    const newW = Math.max(1, Math.min(widthPx, bw));
    const newH = Math.max(1, Math.min(heightPx, bh));
    if (import.meta.env.DEV) {
      console.log("[SignagePreviewText] initial printed box (canvas px)", {
        newW,
        newH,
        targetIn: {
          w: INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
          h: INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
        },
      });
    }
    setBaseBoxHeightState(newH);
    setTextBoxWidth(newW);
    setTextBoxHeight(newH);
    setContentMinSize(newW, newH);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preview `scale` is CSS-only; omit so the inch seed is not reset on window resize
  }, [
    useInitialPrintedBox,
    setTextBoxWidth,
    setTextBoxHeight,
    setContentMinSize,
    boardClampRect.width,
    boardClampRect.height,
  ]);

  const disableSizingPrevRef = useRef(false);
  useEffect(() => {
    if (disableInitialPrintedBoxSizing && !disableSizingPrevRef.current) {
      setBaseBoxHeightState(textBoxHeight);
    }
    disableSizingPrevRef.current = disableInitialPrintedBoxSizing;
  }, [disableInitialPrintedBoxSizing, textBoxHeight]);

  useEffect(() => {
    if (useInitialPrintedBox || !scale || scale <= 0) return;
    if (disableInitialPrintedBoxSizing) return;
    const bw = boardClampRect.width;
    const bh = boardClampRect.height;
    if (!(bw > 0 && bh > 0)) return;

    let cancelled = false;

    const measureDomWidthCanvasPx = () => {
      if (!textMeasureRef.current) return null;
      const rect = textMeasureRef.current.getBoundingClientRect();
      return canvasPxWidthFromMeasureDom(rect.width, scale);
    };

    const measureDomHeightCanvasPx = () => {
      if (!textMeasureRef.current) return null;
      const rect = textMeasureRef.current.getBoundingClientRect();
      const h = canvasPxWidthFromMeasureDom(rect.height, scale);
      return Number.isFinite(h) && h > 0 ? h : null;
    };

    const applyMeasuredWidth = (measuredWCanvas, source, measuredHCanvas = null) => {
      if (cancelled || measuredWCanvas == null || !Number.isFinite(measuredWCanvas)) return;
      const tightW = tightWidthCanvasPx(measuredWCanvas);
      const clamped = computeClampedTextBoxSizePx(tightW, bw, bh, measuredHCanvas);
      if (import.meta.env.DEV) {
        console.log("[SignagePreviewText] text box from measure", {
          source,
          measuredStringWidth: measuredWCanvas,
          measuredContentHeight: measuredHCanvas,
          tightWidth: tightW,
          boxWidthAfterBoardClamp: clamped.width,
          boxHeightAfterBoardClamp: clamped.height,
          preview: displayText.length > 48 ? `${displayText.slice(0, 48)}…` : displayText,
        });
      }
      setBaseBoxHeightState(clamped.height);
      setTextBoxWidth(clamped.width);
      setTextBoxHeight(clamped.height);
      setContentMinSize(clamped.width, clamped.height);
    };

    const fontUrl = getSignageOpenTypeFontUrl(selectedFont);
    if (fontUrl) {
      loadSignageOpenTypeFont(fontUrl)
        .then((font) => {
          if (cancelled) return;
          const { width, height } = measureSignageTextWithOpenType(
            font,
            displayText,
            effectiveFontSize
          );
          applyMeasuredWidth(width, "opentype", height);
        })
        .catch((err) => {
          if (import.meta.env.DEV) {
            console.warn("[SignagePreviewText] OpenType measure failed, using DOM", err);
          }
          if (cancelled) return;
          applyMeasuredWidth(measureDomWidthCanvasPx(), "dom", measureDomHeightCanvasPx());
        });
    } else {
      applyMeasuredWidth(
        measureDomWidthCanvasPx(),
        "dom",
        measureDomHeightCanvasPx()
      );
    }

    return () => {
      cancelled = true;
    };
  }, [
    useInitialPrintedBox,
    displayText,
    selectedFont,
    effectiveFontSize,
    scale,
    setTextBoxWidth,
    setTextBoxHeight,
    setContentMinSize,
    boardClampRect.width,
    boardClampRect.height,
    disableInitialPrintedBoxSizing,
  ]);

  useLayoutEffect(() => {
    if (!scale || scale <= 0) {
      setGlyphScreenCssPx({ w: 0, h: 0 });
      if (!fontFileUrl) setTextExtentInches(null, null);
      return;
    }
    /** Live painted span — matches preview; typographic line box is much taller than ink. */
    const el = visibleTextRef.current;
    if (hasSize && el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setGlyphScreenCssPx({ w: r.width, h: r.height });
        if (!fontFileUrl) {
          const { widthIn, heightIn } = computeGlyphExtentInchesFromVisibleRect(
            r.width,
            r.height,
            scale,
            boardClampRect.width,
            boardClampRect.height
          );
          setTextExtentInches(widthIn, heightIn);
        }
        return;
      }
    }
    if (fontFileUrl) {
      if (
        illustratorTypeIn.w != null &&
        Number.isFinite(illustratorTypeIn.w) &&
        illustratorScreenPx.w > 0
      ) {
        setGlyphScreenCssPx({ w: illustratorScreenPx.w, h: illustratorScreenPx.h });
      }
      return;
    }
    if (!el) {
      setGlyphScreenCssPx({ w: 0, h: 0 });
      setTextExtentInches(null, null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) {
      setGlyphScreenCssPx({ w: 0, h: 0 });
      setTextExtentInches(null, null);
      return;
    }
    setGlyphScreenCssPx({ w: r.width, h: r.height });
    const { widthIn, heightIn } = computeGlyphExtentInchesFromVisibleRect(
      r.width,
      r.height,
      scale,
      boardClampRect.width,
      boardClampRect.height
    );
    setTextExtentInches(widthIn, heightIn);
  }, [
    displayText,
    selectedFont,
    scaledFontSize,
    textBoxWidth,
    textBoxHeight,
    scale,
    boardClampRect.width,
    boardClampRect.height,
    setTextExtentInches,
    fontFileUrl,
    illustratorTypeIn.w,
    illustratorTypeIn.h,
    illustratorScreenPx.w,
    illustratorScreenPx.h,
    hasSize,
  ]);

  // Tight selection box: logical print frame ∪ glyph ink.
  const chromeWidthPx = Math.max(textBoxWidthPx, glyphScreenCssPx.w, 1);
  const chromeHeightPx = Math.max(textBoxHeightPx, glyphScreenCssPx.h, 1);

  const { widthIn: boxWidthIn, heightIn: boxHeightIn } = computePrintedBoxInches(
    textBoxWidth,
    textBoxHeight,
    boardClampRect.width,
    boardClampRect.height
  );
  /** Border labels follow the logical print frame (matches selection chrome), not OpenType typo line. */
  const widthLabel = formatInchesLabel(boxWidthIn);
  const heightLabel = formatInchesLabel(boxHeightIn);
  const labelFontPx = Math.max(9, Math.round(8 * scale));

  return (
    <>
      <div
        ref={textMeasureRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
          fontSize: (effectiveFontSize || 0) * (scale || 1),
          fontWeight: "bold",
          whiteSpace: "nowrap",
          display: "inline-block",
          lineHeight: 0.85,
        }}
      >
        {displayText}
      </div>
      <div
        className="absolute overflow-visible"
        style={{
          left: hasSize ? canvasLeft : "50%",
          top: hasSize ? canvasTop : "65%",
          width: hasSize ? cw * scale : "40%",
          height: hasSize ? ch * scale : "55%",
          transform: hasSize ? undefined : "translate(-50%, -50%)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: clipLeftPx,
            top: clipTopPx,
            width: clipWpx || undefined,
            height: clipHpx || undefined,
            borderRadius: 0,
          }}
        >
          <div className="relative h-full min-h-0 min-w-0" style={{ width: clipWpx || "100%" }}>
            <div
              className="absolute touch-none min-w-0 overflow-visible"
              style={{
                left:
                  hasSize && textCenterOffsetX != null
                    ? textCenterOffsetX - clipLeftPx
                    : "50%",
                top:
                  hasSize && textCenterOffsetY != null
                    ? textCenterOffsetY - clipTopPx
                    : "50%",
              transform: "translate(-50%, -50%)",
              width: chromeWidthPx > 0 ? chromeWidthPx : undefined,
              height: chromeHeightPx > 0 ? chromeHeightPx : undefined,
              minWidth: chromeWidthPx > 0 ? chromeWidthPx : undefined,
              minHeight: chromeHeightPx > 0 ? chromeHeightPx : undefined,
              pointerEvents: "none",
              boxSizing: "border-box",
              boxShadow: "inset 0 0 0 1px #000000",
              backgroundColor: "transparent",
            }}
          >
            <div
              data-text-id="text-0"
              data-text-content={displayText}
              onMouseDown={onTextMouseDown}
              onTouchStart={onTouchStart}
              className="relative box-border m-0 flex h-full min-h-0 min-w-0 w-full items-center justify-center px-0"
              style={{
                paddingTop: "0.08em",
                paddingBottom: "0.08em",
                cursor: isEditable ? (isDragging ? "grabbing" : "grab") : "default",
                fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
                fontSize: scaledFontSize,
                fontWeight: "bold",
                color:
                  selectedTextColor && selectedTextColor !== "transparent"
                    ? normalizeHexColor(selectedTextColor)
                    : "#1a1a1a",
                whiteSpace: "nowrap",
                textAlign: "center",
                pointerEvents: isEditable ? "auto" : "none",
              }}
            >
              <span
                className="inline-flex max-w-full"
                style={{
                  filter:
                    "drop-shadow(0 0 7px #fff) drop-shadow(2px 2px 4px rgba(0,0,0,0.42))",
                }}
              >
                <span
                  ref={visibleTextRef}
                  style={{
                    display: "inline-block",
                    lineHeight: 0.85,
                    padding: 0,
                    margin: 0,
                    verticalAlign: "middle",
                    maxWidth: "100%",
                    textShadow: "none",
                  }}
                >
                  {displayText}
                </span>
              </span>
            </div>

            <span
              className="pointer-events-none absolute left-1/2 z-10 max-w-[calc(100%-8px)] -translate-x-1/2 translate-y-1/2 truncate rounded-none border border-black bg-white px-1 py-0 font-medium tabular-nums text-black"
              style={{
                bottom: 0,
                fontSize: labelFontPx,
                lineHeight: 1.15,
              }}
              aria-hidden
            >
              {widthLabel}
            </span>
            <span
              className="pointer-events-none absolute top-1/2 z-10 max-h-[calc(100%-8px)] -translate-y-1/2 translate-x-1/2 truncate rounded-none border border-black bg-white px-0.5 py-0.5 font-medium tabular-nums text-black"
              style={{
                right: 0,
                fontSize: labelFontPx,
                lineHeight: 1.15,
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
              aria-hidden
            >
              {heightLabel}
            </span>

            {isEditable && chromeWidthPx > 0 && chromeHeightPx > 0 && (
              <SignageTextResizeHandle
                scale={scale}
                onMouseDown={onResizeHandleMouseDown}
                onTouchStart={onResizeHandleTouchStart}
              />
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
