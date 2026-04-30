/** Bottom-right corner resize — handle centered on the bbox corner (editor-style). */
export default function SignageTextResizeHandle({ onMouseDown, onTouchStart, scale = 1 }) {
  const s = Math.min(Math.max(scale, 0.75), 2.5);
  /** Compact corner control */
  const dot = Math.max(12, Math.round(11 * Math.min(s, 1.05)));
  const iconPx = Math.max(5, Math.round(5 * Math.min(s, 1.02)));
  const hit = Math.max(dot + 8, 28);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onTouchStart?.(e);
      }}
      className="absolute touch-none flex items-center justify-center bg-transparent"
      style={{
        pointerEvents: "auto",
        cursor: "nwse-resize",
        width: hit,
        height: hit,
        zIndex: 40,
        right: 0,
        bottom: 0,
        transform: "translate(50%, 50%)",
      }}
      title="Drag to scale text"
      aria-label="Resize text"
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-neutral-900 ring-1 ring-white/90 shadow-sm"
        style={{ width: dot, height: dot }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: iconPx, height: iconPx }}
        >
          <path d="M8 8 4 4M16 8 20 4M8 16 4 20M16 16 20 20" />
        </svg>
      </span>
    </div>
  );
}
