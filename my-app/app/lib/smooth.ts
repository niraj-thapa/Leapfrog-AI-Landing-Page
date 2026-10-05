import type Lenis from 'lenis';

/* The page's Lenis instance (SmoothScroll.tsx), shared with the code that moves the
 * page itself (glide.ts, the film dialog). Kept on window so a hot reload finds the
 * running one instead of stacking a second. Null under reduced motion or before mount. */

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export const getLenis = () => (typeof window === 'undefined' ? null : window.__lenis ?? null);
export const setLenis = (l: Lenis | null) => {
  window.__lenis = l;
};
