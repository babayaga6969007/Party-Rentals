/** Bottom-right corner resize: small scale icon + large hit area. */
export default function SignageTextResizeHandle({ onMouseDown, onTouchStart, scale = 1 }) {
  const s = Math.min(Math.max(scale, 0.75), 2.5);
  const nudgePx = Math.round(6 * s);
  /** Visual only — compact scale glyph */
  const dot = Math.max(20, Math.round(18 * Math.min(s, 1.08)));
  const iconPx = Math.max(8, Math.round(8 * Math.min(s, 1.02)));
  const hit = Math.max(dot + 20, 44);

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
      className="absolute right-0 bottom-0 touch-none flex items-center justify-center bg-transparent"
      style={{
        pointerEvents: "auto",
        cursor: "nwse-resize",
        width: hit,
        height: hit,
        zIndex: 40,
        transform: `translate(calc(42% + ${nudgePx}px), calc(42% + ${nudgePx}px))`,
      }}
      title="Drag to scale text"
      aria-label="Resize text"
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-neutral-900 ring-2 ring-white/95 shadow-md"
        style={{ width: dot, height: dot }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
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
