'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_HREF, CTA_LABEL, TALK } from '../lib/content';
import { initFlywheel } from './flywheel/flywheel';
import { glideTo, isGliding } from '../lib/glide';
import Arrow from './Arrow';

/* Closing call to action — after davidecattaneo.it's "call-section". It is the
 * landing page's last call to action, not the form: the button opens the
 * contact page.
 *
 * The section pins for 1 viewport of scroll (the reference's 1.67, played faster)
 * while, scrubbed by the scroll:
 *  - the title rises from 120% (quad out) as its letters fade in one by one,
 *    the last word in brand green;
 *  - three rings with a dark → green → dark stroke grow from nothing to 1.8×
 *    (quad out, the outer ring leading), drifting up from just below centre;
 *  - the subline's words fade in as it rises 30px; the button rises out of a mask
 *    (and is invisible while fully lowered).
 * Timings were sampled from the reference at 1440×900 and are expressed in its
 * "pixels of scroll at 900px tall" (U), so they scale with the viewport.
 *
 * Reduced motion: no pin, no movement — the finished state, still.
 *
 * Version 2 (html[data-talk="2"], review button, lib/variants.ts): instead of the ripple rings, the
 * glass Flywheel — a decorative copy of the ring (flywheel.js, decor mode) with no stage
 * separators, on the band's dark ground. Scrubbed like the rings: it fades in and grows
 * from 35% to its full size (the title in its heart) while turning a quarter turn. The
 * cursor anywhere over the band tilts it toward itself and lights the stage beneath it. */

const PIN = 1500; // U of the reference's timeline
const SPEED = 1500 / 900; // played over 900 U of scroll (1 viewport) instead of 1500
const RINGS = [
  { r: 731.867, lag: 0 },
  { r: 665.924, lag: 43 },
  { r: 594.687, lag: 87 },
];
/* Square-style snap into the band, as the hero → Flywheel one (TileFlight): between the
 * band entering (its top at the bottom of the screen) and the scene revealed (half a
 * viewport into the pin: U 750, title, subline and button all home), the first half
 * viewport of scroll each way is free; stop beyond it and the page glides on. */
const SNAP_IDLE = 260;
const FREE_SCROLL = 0.5; // viewports
const LAND = 0.5; // viewports into the pin

const C = 736.5; // ring centre in the 1473-unit viewBox
const CY = 732.5;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const quadOut = (v: number) => 1 - (1 - v) * (1 - v);
const sineInOut = (v: number) => (1 - Math.cos(Math.PI * v)) / 2;

export default function TalkBand() {
  const trackRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [wheel, setWheel] = useState(false);
  /* the ring's pose, written by the scroll scrub and read by the ring every frame */
  const pose = useRef({ scale: 0.35, spin: 0, tilt: 0 }).current;

  /* version 2 is on while <html data-talk="2"> */
  useEffect(() => {
    const read = () => setWheel(document.documentElement.dataset.talk === '2');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-talk'] });
    return () => mo.disconnect();
  }, []);

  /* the decorative Flywheel runs only while version 2 is showing */
  useEffect(() => {
    const el = wheelRef.current;
    if (!wheel || !el) return;
    return initFlywheel(() => import('three'), {
      decor: true,
      root: el,
      pointerRoot: trackRef.current ?? el, // the ring follows the cursor anywhere over the band
      canvas: el.querySelector('canvas'),
      slot: el,
      seams: false,
      dark: true,
      palette: ['#0d1411', '#12301f', '#1a1830', '#1f3328'],
      ringPx: (W: number, H: number) => Math.min(H * 0.96, W * 0.9),
      pose,
    });
  }, [wheel, pose]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setStill(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const title = track.querySelector<HTMLElement>('.talk-title');
    const chars = Array.from(track.querySelectorAll<HTMLElement>('.talk-char'));
    const words = Array.from(track.querySelectorAll<HTMLElement>('.talk-w'));
    const body = track.querySelector<HTMLElement>('.talk-body');
    const cta = track.querySelector<HTMLElement>('.talk-cta-inner');
    const rings = Array.from(track.querySelectorAll<SVGCircleElement>('.talk-ring'));

    const set = (u: number) => {
      /* title: rise + letters — a fixed 22 U per letter from U 10, each fading over
       * 50 U, as the reference (its letters run at a constant rate, not a fixed total) */
      if (title) title.style.transform = `translate3d(0, ${(120 * (1 - quadOut(span(u, 0, 430)))).toFixed(2)}%, 0)`;
      chars.forEach((c, i) => (c.style.opacity = span(u, 10 + i * 22, 60 + i * 22).toFixed(3)));
      /* rings */
      rings.forEach((ring, k) => {
        const { lag } = RINGS[k];
        const s = 1.8 * quadOut(span(u, lag, 1440));
        const ty = 120 * (1 - s / 1.8);
        ring.setAttribute('transform', `translate(0 ${ty.toFixed(2)}) translate(${C} ${CY}) scale(${s.toFixed(4)}) translate(${-C} ${-CY})`);
        ring.style.opacity = quadOut(span(u, lag, lag + 400)).toFixed(3);
      });
      /* version 2: the Flywheel grows in and turns (same span as the rings) */
      const g = quadOut(span(u, 0, 1300));
      pose.scale = 0.35 + 0.65 * g;
      pose.spin = 0.9 * (1 - g) - (u / PIN) * 0.6;
      pose.tilt = 0.32 * (1 - g);
      if (wheelRef.current) wheelRef.current.style.opacity = quadOut(span(u, 0, 420)).toFixed(3);
      /* subline and button */
      if (body) body.style.transform = `translate3d(0, ${(30 * (1 - quadOut(span(u, 370, 660)))).toFixed(2)}px, 0)`;
      /* subline words: in over U 370 → 560, as the reference */
      const ws = 130 / Math.max(1, words.length);
      words.forEach((w, i) => (w.style.opacity = span(u, 370 + i * ws, 430 + i * ws).toFixed(3)));
      /* the button rises from fully below its mask; while it is all the way down it
       * is also invisible, so no browser can show it early, whatever its clipping */
      /* sine in-out, fitted to the reference: still almost fully down at U 450,
       * halfway at 530, home at 660 */
      const k = 1 - sineInOut(span(u, 400, 660));
      if (cta) {
        cta.style.transform = `translate3d(0, calc(${(110 * k).toFixed(2)}% + ${(28 * k).toFixed(2)}px), 0)`;
        cta.style.visibility = k >= 1 ? 'hidden' : 'visible';
      }
    };

    if (still) {
      set(PIN);
      return;
    }
    /* the hidden starting states (CSS) apply only once this script is driving them,
     * so a failed or stale script can never leave the section half-hidden */
    track.classList.add('is-armed');

    let target = 0, shown = -1, raf = 0, last = 0;
    const uNow = () => {
      const H = window.innerHeight;
      return Math.max(0, Math.min(PIN, ((-track.getBoundingClientRect().top * 900) / H) * SPEED));
    };
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      if (shown < 0) shown = target;
      else {
        shown += (target - shown) * (1 - Math.pow(1 - 0.12, dt / 16.7));
        if (Math.abs(target - shown) < 0.2) shown = target;
      }
      set(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      target = uNow();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    target = uNow();
    shown = target;
    set(shown);

    /* the snap — only after the visitor's own input (not during link glides) */
    let lastInput = -Infinity, prevY = window.scrollY, dir = 0, snapIdle = 0;
    const onInput = () => (lastInput = performance.now());
    const maybeSnap = () => {
      if (isGliding() || performance.now() - lastInput > 2000) return;
      const H = window.innerHeight;
      const y = window.scrollY;
      const top = y + track.getBoundingClientRect().top;
      const dockY = top - H; // the band just entering; the section before it fully in view
      const landY = top + LAND * H; // the scene revealed
      if (y <= dockY + 1 || y >= landY - 1) return;
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
      snapIdle = window.setTimeout(maybeSnap, SNAP_IDLE);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', kick);
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('touchmove', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapIdle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', kick);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('touchmove', onInput);
      window.removeEventListener('keydown', onInput);
      track.classList.remove('is-armed');
    };
  }, [still]);

  const titleWords = TALK.headline.split(' ');

  return (
    <section ref={trackRef} className={`talk${still ? ' is-still' : ''}`} id="talk" aria-labelledby="talk-title" data-theme="dark">
      <div className="talk-pin">
        {/* version 2: the glass Flywheel in place of the rings */}
        <div ref={wheelRef} className="talk-wheel" aria-hidden>
          {wheel && <canvas className="talk-wheel-gl" />}
        </div>
        <svg className="talk-rings" viewBox="0 0 1473 1473" fill="none" aria-hidden>
          <defs>
            {RINGS.map((ring, k) => (
              <linearGradient
                key={k}
                id={`talk-ring-${k}`}
                x1={C}
                y1={CY - ring.r}
                x2={C}
                y2={CY + ring.r}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.1" stopColor="#0d1411" />
                <stop offset="0.37" stopColor="#36c37a" />
                <stop offset="0.57" stopColor="#36c37a" />
                <stop offset="0.9" stopColor="#0d1411" />
              </linearGradient>
            ))}
          </defs>
          {RINGS.map((ring, k) => (
            <circle
              key={k}
              className="talk-ring"
              cx={C}
              cy={CY}
              r={ring.r}
              stroke={`url(#talk-ring-${k})`}
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="wrap talk-inner">
          <h2 id="talk-title" className="talk-title" aria-label={TALK.headline}>
              {titleWords.map((w, wi) => (
                <span key={wi} aria-hidden>
                  <span className={`talk-word${wi === titleWords.length - 1 ? ' is-accent' : ''}`}>
                    {Array.from(w).map((ch, ci) => (
                      <span key={ci} className="talk-char">
                        {ch}
                      </span>
                    ))}
                  </span>
                  {wi < titleWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          <p className="talk-body" aria-label={TALK.body}>
            {TALK.body.split(' ').map((w, i) => (
              <span key={i} aria-hidden>
                <span className="talk-w">{w}</span>{' '}
              </span>
            ))}
          </p>
          <div className="talk-cta-mask">
            <div className="talk-cta-inner">
              <a href={CONTACT_HREF} className="btn-primary talk-cta">
                {CTA_LABEL} <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
