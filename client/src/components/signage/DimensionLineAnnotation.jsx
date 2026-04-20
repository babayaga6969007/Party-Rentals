/**
 * Dimension line with label centered; transparent label area so strokes do not run through the text.
 */
const STROKE = "#374151";

export default function DimensionLineAnnotation({
  orientation = "horizontal",
  label,
  fontSize = 11,
  className = "",
}) {
  const labelPadX = Math.max(6, fontSize * 0.55);
  const labelPadY = Math.max(2, fontSize * 0.2);
  const gapFromLine = Math.max(4, fontSize * 0.35);

  if (orientation === "vertical") {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full w-full min-h-[48px] min-w-[28px] ${className}`}
        aria-hidden={label ? undefined : true}
      >
        <div className="flex flex-1 flex-col items-center min-h-[8px] w-full min-w-0">
          <div
            className="flex-1 w-px min-h-[4px] mx-auto"
            style={{ backgroundColor: STROKE }}
          />
        </div>
        <div
          className="shrink-0 z-[1] font-normal tabular-nums text-gray-900 text-center whitespace-nowrap leading-tight rounded-sm bg-white/90 shadow-sm"
          style={{
            fontSize,
            padding: `${labelPadY}px ${labelPadX}px`,
            marginTop: gapFromLine,
            marginBottom: gapFromLine,
            marginLeft: labelPadX * 0.35,
            marginRight: labelPadX * 0.35,
          }}
        >
          {label}
        </div>
        <div className="flex flex-1 flex-col items-center min-h-[8px] w-full min-w-0">
          <div
            className="flex-1 w-px min-h-[4px] mx-auto"
            style={{ backgroundColor: STROKE }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-row items-center justify-center w-full min-h-[28px] ${className}`}
      aria-hidden={label ? undefined : true}
    >
      <div className="flex flex-1 flex-row items-center min-w-[8px] min-h-0">
        <div
          className="flex-1 h-px min-w-[4px]"
          style={{ backgroundColor: STROKE }}
        />
      </div>
      <div
        className="shrink-0 z-[1] font-normal tabular-nums text-gray-900 whitespace-nowrap rounded-sm bg-white/90 shadow-sm"
        style={{
          fontSize,
          padding: `${labelPadY}px ${labelPadX}px`,
          marginLeft: gapFromLine,
          marginRight: gapFromLine,
        }}
      >
        {label}
      </div>
      <div className="flex flex-1 flex-row items-center min-w-[8px] min-h-0">
        <div
          className="flex-1 h-px min-w-[4px]"
          style={{ backgroundColor: STROKE }}
        />
      </div>
    </div>
  );
}
