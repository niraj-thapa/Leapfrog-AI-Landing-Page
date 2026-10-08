'use client';

import { useEffect, useRef } from 'react';
import { fwFlight } from './flywheel/flywheel';
import { glideTo, isGliding } from '../lib/glide';
import { splitWords } from '../lib/sqText';

/* The ring tile IS the Flywheel (after waabi.ai, where one mosaic tile grows and
 * settles as the next section's image).
 *
 * The Flywheel's own WebGL canvas is borrowed for the whole journey, so the tile
 * is the live glass ring — never a picture of it:
 *  - follow  — while the hero's ring tile is on screen, the canvas is pinned to the
 *    viewport (.fw.is-flying), masked to the glass band, and flywheel.js draws the
 *    ring at the tile's centre and size (72% of the tile), spinning with the scroll;
 *  - flight  — as the Flywheel section scrolls in (p 0 → 1 from its top just below the
 *    screen to the anchor line, scroll-padding-top) the ring travels from the tile to its place in the
 *    section (#fw-slot centre, --ring-px), growing, unwinding its spin and tilting
 *    through the middle of the move — only the ring leaves, its tile stays in the
 *    mosaic; the section's backdrop is let in within the section as the ring lands
 *    and the header lines rise in step. In the tile the ring is calm (no
 *    reflections or glare; bubbles scaled to the ring); its shine returns as it lands;
 *  - landed  — the canvas goes back into the section; then each connector draws out
 *    from its ring dot and its card rises in, stage by stage, and the Flywheel runs
 *    as normal.
 * Scrubbed by the scroll throughout, so scrolling back reverses it.
 *
 * Until WebGL has drawn its first frame (or without WebGL) the tile and the flying
 * copy show a still of the ring instead (assets/flywheel-ring.jpg).
 * Reduced motion: nothing flies; the tile shows the still. */

const RING_SHARE = 0.72;
const SPIN_LAND = 1.2; // radians of spin still to unwind when the flight begins
const SPIN_PER_PX = 0.0012; // spin per px of scroll before that
const TILT = 0.38; // radians of tilt at the middle of the flight
/* the flight starts just before the Flywheel's top enters the screen (10% of a viewport
 * below it), while the ring tile is still lower than the ring's landing height — so on
 * any screen the ring only ever rises into place — and lands at the anchor line */
const FLIGHT_START = 1.1;
/* Square-style snap: after a free half-viewport of scroll in either direction (past the
 * docked statement going down, below the landed Flywheel going up), stop anywhere
 * between them and the page glides on — to the Flywheel, or back to the statement — only ever after the visitor's own scrolling, never a link glide. */
const HERO_DOCK = 0.38; // Hero.tsx DOCK
const HERO_HOLD = 0.25; // Hero.tsx HOLD: the docked tiles hold still this long before moving on
const SNAP_IDLE = 260;
/* free scroll through the tile parallax first: the snap only takes over once the visitor
 * is this far (in viewports) past the statement */
const FREE_SCROLL = 0.5;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
/* leaves the tile at once (the tile keeps rising with its row) and eases into place */
const launch = (v: number) => 1 - Math.pow(1 - v, 2.4);
const STEP_MS = 420; // between stages as the Flywheel assembles
const DRAW_MS = 650; // a connector drawing out from the ring

export default function TileFlight() {
  const flyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fly = flyRef.current;
    const tile = document.querySelector<HTMLElement>('.hero-tile--ring');
    const fw = document.getElementById('flywheel');
    const slot = document.getElementById('fw-slot');
    if (!fly || !tile || !fw || !slot) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    /* the header waits for the ring: hidden through the flight, then revealed the way
     * Square reveals its headings (word by word from behind a clip) once the ring has
     * landed — title first, then the two lines under it (the promise line sits above the
     * list in versions 4–5). This plays once: after the first landing everything stays put
     * as the ring takes off and lands again (.was-built, flywheel.css) */
    const heads = Array.from(fw.querySelectorAll<HTMLElement>('.fw-title, .fw-pain, .fw-promise'));
    heads.forEach((h, j) => {
      splitWords(h);
      h.style.setProperty('--sq-d', `${[0, 260, 420, 420][j] ?? 0}ms`);
    });
    fw.classList.add('head-waits');
    /* the header reveals after the ring lands, and only while the header is on screen (a page
     * opened further down plays it as you come back up to it). Before that first landing,
     * taking off hides it again (the reveal's play-back) */
    const headEl = fw.querySelector<HTMLElement>('.fw-head');
    let ringLanded = false;
    let headSeen = false;
    const reveal = () => {
      if (ringLanded && headSeen) heads.forEach((h) => h.classList.add('is-sq-in'));
    };
    const headIo = new IntersectionObserver(([e]) => {
      headSeen = e.isIntersecting;
      reveal();
    });
    if (headEl) headIo.observe(headEl);
    const showHeads = (on: boolean) => {
      ringLanded = on;
      if (on) reveal();
      else heads.forEach((h) => h.classList.remove('is-sq-in'));
    };
    const panels = Array.from(fw.querySelectorAll<HTMLElement>('.panel'));
    let raf = 0;
    let lastKey = '';
    let idle = 0;
    let landed: boolean | null = null;
    let built = false; // the header and cards have played their entrance once
    let timers: number[] = [];

    /* once the ring has landed: each connector draws out from its ring dot, then its card
     * rises in, stage by stage */
    const marks = () => [
      ...fw.querySelectorAll<SVGElement>('.fw-link-draw, .fw-dot'),
    ];
    const resetAssembly = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      fw.classList.remove('is-assembling');
      marks().forEach((m) => m.removeAttribute('data-drawn'));
      fw.querySelectorAll('.panel, .fw-chip, .fw-li').forEach((el) => el.classList.remove('is-in'));
    };
    const assemble = () => {
      resetAssembly();
      fw.classList.add('is-assembling');
      panels.forEach((el, i) => {
        const k = el.dataset.k;
        timers.push(window.setTimeout(() => {
          fw.querySelectorAll<SVGElement>(`.fw-link-draw[data-k="${k}"], .fw-dot[data-k="${k}"]`).forEach((m) => m.setAttribute('data-drawn', ''));
        }, 120 + i * STEP_MS));
        /* version 2 (review button, lib/variants.ts): the chip at the end of the line comes in instead;
         * its card waits in the row below until that scrolls into view */
        const stageEl =
          root.dataset.fw === '2' ? fw.querySelector<HTMLElement>(`.fw-chip[data-k="${k}"]`)
          : ['3', '4', '5'].includes(root.dataset.fw ?? '') ? fw.querySelector<HTMLElement>(`.fw-li[data-k="${k}"]`) // versions 3–5: its list item
          : el;
        timers.push(window.setTimeout(() => stageEl?.classList.add('is-in'), 120 + i * STEP_MS + DRAW_MS * 0.6));
      });
      timers.push(window.setTimeout(() => {
        fw.classList.remove('is-assembling');
        marks().forEach((m) => m.removeAttribute('data-drawn'));
        fw.querySelectorAll('.panel, .fw-chip, .fw-li').forEach((el) => el.classList.remove('is-in'));
      }, 120 + panels.length * STEP_MS + DRAW_MS + 800));
    };

    /* the line the section lands on: where an anchor jump leaves it — the header allowance
     * plus its own scroll-margin, which cancels it, so the Flywheel fills the screen */
    const landLine = () =>
      Math.max(0, (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(fw).scrollMarginTop) || 0));

    const setRing = (cx: number, cy: number, ring: number, spin: number, tilt: number) => {
      fwFlight.cx = cx;
      fwFlight.cy = cy;
      fwFlight.ring = ring;
      fwFlight.spin = spin;
      fwFlight.tilt = tilt;
      fw.style.setProperty('--fx', `${cx.toFixed(1)}px`);
      fw.style.setProperty('--fy', `${cy.toFixed(1)}px`);
      fw.style.setProperty('--fr', `${(ring / 2).toFixed(1)}px`);
    };

    const frame = () => {
      raf = 0;
      const H = window.innerHeight;
      const fr = fw.getBoundingClientRect();
      /* the flight lands where an anchor jump to #flywheel leaves the section — flush with
       * the top of the screen — so every way in ends assembled */
      const landTop = landLine();
      /* the flight starts just before the Flywheel's top enters the screen — but never before
       * the visitor scrolls on past the docked tiles' hold (HERO_DOCK + HERO_HOLD): until then the
       * ring stays in its tile, however close the Flywheel follows the hero */
      const heroEl = document.getElementById('top');
      const dockY = heroEl ? window.scrollY + heroEl.getBoundingClientRect().top + (HERO_DOCK + HERO_HOLD) * H : -Infinity;
      const startTop = Math.min(H * FLIGHT_START, window.scrollY + fr.top - dockY - 24);
      /* within a pixel of the line counts as landed (a glide's last step can leave a
       * sub-pixel remainder that the browser rounds away) */
      const p = fr.top - landTop < 1 ? 1 : clamp01((startTop - fr.top) / Math.max(1, startTop - landTop));
      const a = tile.getBoundingClientRect();
      const tileShown = parseFloat(getComputedStyle(tile).opacity) || 0;
      const tileOnScreen = a.bottom > 0 && a.top < H;
      const live = fwFlight.ready && !fw.classList.contains('no-gl');
      root.classList.toggle('ring-live', live);

      const following = p <= 0 && tileShown > 0.001 && tileOnScreen;
      const flying = p > 0 && p < 1;
      const engaged = live && (following || flying);

      fw.classList.toggle('is-flight', p < 1);
      fw.classList.toggle('is-flying', engaged);
      if (engaged !== fwFlight.active) {
        fwFlight.active = engaged;
        if (engaged) fwFlight.wake?.();
      }

      /* only the ring leaves; the tile's glass square stays in the mosaic */
      tile.classList.toggle('is-launched', p > 0);
      fly.style.display = flying && !live ? 'block' : 'none';
      fwFlight.calm = following ? 1 : flying ? 1 - launch(p) : 0;


      /* landing / taking off again */
      const nowLanded = p >= 1;
      if (nowLanded !== landed) {
        if (!built) {
          /* the entrance, once: the header words rise and the cards come in stage by stage */
          showHeads(nowLanded);
          if (nowLanded && landed !== null) assemble();
          else if (!nowLanded) resetAssembly();
          if (nowLanded) {
            built = true;
            fw.classList.add('was-built');
          }
        }
        /* after that, nothing replays or fades: the header, cards and ring labels simply stay
         * (.was-built in flywheel.css) as the ring takes off and lands again */
        landed = nowLanded;
      }

      if (following && live) {
        const spin = SPIN_LAND + SPIN_PER_PX * Math.max(0, fr.top - startTop); // continuous into the flight
        setRing(a.left + a.width / 2, a.top + a.height / 2, a.width * RING_SHARE, spin, 0);
        fw.style.setProperty('--fw-a', tileShown.toFixed(3));
        fw.style.setProperty('--fw-top', `${Math.max(0, fr.top).toFixed(1)}px`); // the backdrop copy stays inside the section
      }

      if (flying) {
        const e = launch(p);
        const s = slot.getBoundingClientRect();
        const ringPx = parseFloat(getComputedStyle(fw).getPropertyValue('--ring-px')) || Math.min(s.width, s.height) * 0.92;
        /* aim for where the Flywheel ring will be when it lands (section top at the
         * anchor line), not where it is now — so the ring grows and rises into place
         * instead of diving below the screen to meet the section */
        const x1 = s.left + s.width / 2;
        const y1 = s.top - fr.top + landTop + s.height / 2;
        /* set off from where the tile was when the flight began — worked out from the
         * current state, so scrolling back retraces the move exactly. The tile keeps
         * rising after launch at (1 + its parallax drift) px per px of scroll, while the
         * section rises at 1. A tile above the landing line (the top row) sends the ring
         * gliding down into place as it grows; one below holds the line and never dips. */
        const drift = parseFloat(tile.dataset.drift || '0') || 0;
        const launchY = a.top + a.height / 2 + Math.max(0, startTop - fr.top) * (1 + drift);
        const size0 = a.width;
        const size1 = ringPx / RING_SHARE;
        const x0 = a.left + a.width / 2;
        const y0 = launchY < y1 ? launchY : Math.max(a.top + a.height / 2, y1);
        const size = size0 + (size1 - size0) * e;
        const cx = x0 + (x1 - x0) * e;
        const cy = y0 + (y1 - y0) * e;
        fly.style.transform = `translate3d(${(cx - size / 2).toFixed(2)}px, ${(cy - size / 2).toFixed(2)}px, 0) scale(${(size / 100).toFixed(5)})`;
        if (live) {
          setRing(cx, cy, size * RING_SHARE, SPIN_LAND * (1 - e), TILT * Math.sin(Math.PI * e));
          fw.style.setProperty('--fw-a', '1');
          /* the section's backdrop (the ring's own, drawn on the canvas) shows inside the section
           * at full strength the whole way, so the section arrives with its real background —
           * no fade in just before the ring lands, or out just after it takes off (Oct 8; was
           * ramped in over the last 20% of the flight) */
          fw.style.setProperty('--rev', '1');
          fw.style.setProperty('--fw-top', `${Math.max(0, fr.top).toFixed(1)}px`);
          fly.style.opacity = '1';
        } else {
          /* still-image flight (WebGL not ready / unavailable): crossfade at the end */
          fly.style.opacity = (1 - span(p, 0.9, 1)).toFixed(3);
          fw.style.setProperty('--fw-gl', span(p, 0.82, 0.98).toFixed(3));
        }
      }

      /* the Flywheel assembles in step with the flight */
      if (p < 1) {
        fw.style.setProperty('--fw-ui', span(p, 0.86, 1).toFixed(3));
      }

      /* keep watching until the hero's own smoothing has settled the tile — it may
       * still be gliding back into view after a long jump */
      const key = `${p.toFixed(4)}|${a.top.toFixed(1)}|${a.width.toFixed(1)}|${tileShown.toFixed(3)}|${live}`;
      idle = key === lastKey ? idle + 1 : 0;
      lastKey = key;
      if (idle < 20) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    kick();
    /* WebGL arrives a moment after load; pick the live ring up as soon as it does */
    const readyPoll = window.setInterval(() => {
      if (fwFlight.ready) {
        window.clearInterval(readyPoll);
        kick();
      }
    }, 250);
    /* the snap */
    let lastInput = -Infinity;
    let dir = 0;
    let prevY = window.scrollY;
    let snapIdle = 0;
    const onInput = () => (lastInput = performance.now());
    const maybeSnap = () => {
      if (isGliding() || performance.now() - lastInput > 2000) return;
      const hero = document.getElementById('top');
      if (!hero) return;
      const H = window.innerHeight;
      const y = window.scrollY;
      const landTop = landLine();
      const landY = y + fw.getBoundingClientRect().top - landTop;
      const dockY = y + hero.getBoundingClientRect().top + HERO_DOCK * H;
      if (y <= dockY + 1 || y >= landY - 1) return;
      /* each way, the first half-viewport scrolls freely (tile parallax at the visitor's
       * pace); stop beyond it and the page glides on in that direction */
      const free = FREE_SCROLL * H;
      if (dir > 0 && y > dockY + free) glideTo(landY);
      else if (dir < 0 && y < landY - free) glideTo(dockY);
    };
    const onScroll = () => {
      const y = window.scrollY;
      /* the direction of travel turns only after a real move (16px): the small rebound
       * some trackpads send as a swipe ends must not read as heading back */
      if (isGliding()) prevY = y;
      else if (Math.abs(y - prevY) > 16) {
        dir = y > prevY ? 1 : -1;
        prevY = y;
      }
      kick();
      window.clearTimeout(snapIdle);
      if (!reducedMq.matches) snapIdle = window.setTimeout(maybeSnap, SNAP_IDLE);
    };
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('touchmove', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    window.addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(readyPoll);
      window.clearTimeout(snapIdle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('touchmove', onInput);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('resize', kick);
      fwFlight.active = false;
      resetAssembly();
      headIo.disconnect();
      fw.classList.remove('is-flight', 'is-flying', 'head-waits', 'was-built');
      heads.forEach((h) => h.classList.add('is-sq-in'));
      root.classList.remove('ring-live');
      tile.classList.remove('is-launched');
    };
  }, []);

  return (
    <div ref={flyRef} className="tile-fly" aria-hidden>
      <span className="tile-fly-bg" />
      <img className="ring-glass" src="/assets/flywheel-ring.jpg" alt="" />
    </div>
  );
}
