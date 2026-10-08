/* The page's arrow (Oct 8): an SVG in place of the text arrows (→ ← ↓) in buttons and links.
 * 1em square, in the text colour; `dir` turns it. Decorative, so hidden from screen readers. */
export default function Arrow({ dir = 'right', className }: { dir?: 'right' | 'left' | 'down' | 'up' | 'up-right'; className?: string }) {
  const turn = { right: 0, down: 90, left: 180, up: 270, 'up-right': -45 }[dir];
  return (
    <svg
      className={`arrow${className ? ` ${className}` : ''}`}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={turn ? { transform: `rotate(${turn}deg)` } : undefined}
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
