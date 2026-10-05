/* Smooth, eased page glides (in-page links, the hero → Flywheel snap).
 *
 * One glide at a time; any new wheel, touch or key input from the visitor stops it
 * and hands the page straight back. Everything on the page that follows the scroll
 * (the hero mosaic, the ring's flight, the theme) simply plays along. Reduced
 * motion: jumps instead. */

const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

let raf = 0;
let active = false;
let listening = false;

export const isGliding = () => active;

export function stopGlide() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  active = false;
}

function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  const stop = () => active && stopGlide();
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
}

/** Glide the page to `top`; the duration grows with the distance unless given. */
export function glideTo(top: number, ms?: number, onDone?: () => void) {
  listen();
  stopGlide();
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const goal = Math.max(0, Math.min(max, top));
  const from = window.scrollY;
  const dist = goal - from;
  if (Math.abs(dist) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: goal, behavior: 'instant' as ScrollBehavior });
    onDone?.();
    return;
  }
  const duration = ms ?? Math.min(1700, Math.max(700, 520 + Math.abs(dist) * 0.32));
  const t0 = performance.now();
  active = true;
  const step = (now: number) => {
    if (!active) return;
    const k = Math.min(1, (now - t0) / duration);
    window.scrollTo({ top: from + dist * inOut(k), behavior: 'instant' as ScrollBehavior });
    if (k < 1) raf = requestAnimationFrame(step);
    else {
      stopGlide();
      onDone?.();
    }
  };
  raf = requestAnimationFrame(step);
}
