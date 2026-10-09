import type Lenis from 'lenis';

/* Scroll stops (Oct 9): places a downward wheel or trackpad flick can't sail past. However hard
 * the visitor flicks, when a step would carry the page across a stop it settles exactly on it
 * and the rest of that flick — the trackpad's momentum tail — is absorbed; a fresh gesture then
 * moves on as normal. Used for one place: the docked tiles ("Put AI to work…"), so a hard flick
 * from the hero always lands there (registered by TileFlight).
 *
 * Only downward wheel input under Lenis (SmoothScroll passes `onVirtualScroll`): scrolling up,
 * touch (native), keys and link glides are untouched; reduced motion has no Lenis. */

type StopsFn = () => number[];
const sources = new Set<StopsFn>();
export const addStops = (fn: StopsFn) => {
  sources.add(fn);
  return () => sources.delete(fn);
};

const QUIET_MS = 400; // the flick has ended once the wheel has been quiet this long…
const MAX_HOLD_MS = 3000; // …or, at the latest, after this
const PUSH = 1.8; // …or a fresh push: the wheel speeding up again (momentum only ever slows)
const SETTLE_S = 0.55; // the glide onto the stop

let holding = false;
let holdStart = 0;
let releaseT = 0;
let lastAbs = 0;
const release = () => {
  holding = false;
};

/** Lenis `virtualScroll` hook: return false to swallow the event. */
export function onVirtualScroll(lenis: Lenis, deltaY: number, event: Event): boolean {
  if (event.type !== 'wheel' || sources.size === 0) return true;
  const now = performance.now();
  const abs = Math.abs(deltaY);
  const prevAbs = lastAbs;
  lastAbs = abs;
  if (holding) {
    const freshPush = abs > 6 && abs > prevAbs * PUSH && now - holdStart > 120;
    if (now - holdStart > MAX_HOLD_MS || freshPush || deltaY < 0) release();
    else {
      window.clearTimeout(releaseT);
      releaseT = window.setTimeout(release, QUIET_MS);
      return false;
    }
  }
  if (deltaY <= 0.5) return true; // downward only
  const from = lenis.targetScroll;
  const to = from + deltaY;
  /* (a step that lands within half a pixel of a stop counts as reaching it) */
  const crossed = [...sources]
    .flatMap((f) => f())
    .filter((s) => Number.isFinite(s) && from < s - 0.5 && to >= s - 0.5)
    .sort((a, b) => a - b)[0];
  if (crossed === undefined) return true;
  holding = true;
  holdStart = now;
  window.clearTimeout(releaseT);
  releaseT = window.setTimeout(release, QUIET_MS);
  lenis.scrollTo(crossed, { duration: SETTLE_S, easing: (t: number) => 1 - Math.pow(1 - t, 3), force: true });
  return false;
}
