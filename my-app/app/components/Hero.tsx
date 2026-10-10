'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_HREF, CTA_LABEL, HERO } from '../lib/content';
import { getLenis } from '../lib/smooth';
import CredibilityMarquee, { AnthropicMark } from './Credibility';
import Arrow from './Arrow';

/* Two cuts of Animatics v1 (encoded from the 65 MB master, which lives outside
 * public/ in source-video/):
 *  - hero-loop.mp4 — 15s (42–57s of the film), silent, 1280×630, ~1.2 MB; the bottom
 *    of the frame is cropped away so the burned-in captions never show;
 *  - animatics-film.mp4 — the whole film, 720p with sound, ~12.6 MB; it only loads
 *    when someone opens the film. */
const LOOP_VIDEO = '/video/hero-loop.mp4';
const FILM_VIDEO = '/video/animatics-film.mp4';
const POSTER = '/assets/hero-loop-poster.jpg'; // the loop's first frame
const FILM_POSTER = '/assets/hero-poster-animatics.jpg'; // the film's first frame

/* Film dialog — blurred backdrop, 16:9 panel, circular close. The opening click
 * is the user gesture that lets the film play with sound. Escape, the close
 * button or a click on the backdrop closes it.
 *
 * The close button sits in the film's top-right corner, solid white so no frame can
 * hide it. Full screen is ours (the player's own button is turned off): it enlarges the
 * whole frame — film, close button and all — so the close button keeps its corner. A
 * double-click on the film toggles it too. Escape leaves full screen first, then closes. */
function FilmDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);
  const toggleFull = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void frame.requestFullscreen?.().catch(() => {});
  };
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.fullscreenElement && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const onFs = () => setIsFull(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onFs);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    getLenis()?.stop(); // hold the page still behind the film
    closeRef.current?.focus();

    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.muted = false;
      v.volume = 1;
      // If a browser still refuses audio, fall back to muted rather than a dead dialog.
      v.play().catch(() => {
        v.muted = true;
        void v.play().catch(() => {});
      });
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      document.body.style.overflow = prev;
      getLenis()?.start();
      videoRef.current?.pause();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Leapfrog film" className="film-backdrop" data-lenis-prevent onClick={onClose}>
      <div className="film-panel" onClick={(e) => e.stopPropagation()}>
        <div ref={frameRef} className="film-frame">
          <div className="film-tools">
            {typeof document !== 'undefined' && document.fullscreenEnabled && (
              <button
                type="button"
                className="film-btn"
                aria-label={isFull ? 'Exit full screen' : 'Full screen'}
                onClick={toggleFull}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d={isFull ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button ref={closeRef} type="button" className="film-btn" aria-label="Close film" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <video
            ref={videoRef}
            controls
            controlsList="nofullscreen"
            disablePictureInPicture
            playsInline
            preload="metadata"
            poster={FILM_POSTER}
            className="film-video"
            onDoubleClick={(e) => {
              e.preventDefault();
              toggleFull();
            }}
          >
            <source src={FILM_VIDEO} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}

/* Stage icons, shared with the Flywheel panels. */
const STAGE_ICON: Record<string, React.ReactNode> = {
  validate: (<><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 14h9" /></>),
  build: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>),
  enable: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M18 14.5a6 6 0 0 1 3 5.5" /></>),
  accelerate: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  run: (<><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>),
};

type Tile =
  | { kind: 'photo'; src: string; pos?: string }
  | { kind: 'stage'; k: string; label: string }
  | { kind: 'stat'; value: string; label: string }
  | { kind: 'badge'; art: 'aws' | 'anthropic' }
  | { kind: 'competency'; src: string } // an AWS Partner competency badge (Figma "Partners", dark ink)
  | { kind: 'service'; name: string | string[]; label: string } // a service we're recognised for: its name and a label
  | { kind: 'chip'; src: string } // a square partner chip with its own card, centred on a square tile
  | { kind: 'ring' }
  | { kind: 'video' };

/* The mosaic, on squareup.com's grid: rows of 4 / 5 / 5 / 4 tiles, the statement
 * between the second and third rows, the loop landing in the centre of the third.
 * Desktop offsets are from the viewport centre in --u units (1u = 1vw at 16:10;
 * the grid scales down to fit shorter screens). Phone offsets are [vw, svh] from
 * the centre, or null to drop the tile on small screens. Phones (Oct 9), after Square's
 * phone mosaic: a stagger of rows of 2 · 3 · 3 · 2 — rows of 2 at ±24vw, rows of 3 at 0 and
 * ±39vw; rows at −42 / −24svh above the statement and 24 / 42svh below — the ring top centre
 * and the video bottom centre: Claude · AWS Healthcare | 100+ · ring · 150+ | AWS AI ·
 * video · Agentic AI | Generative AI · 250+ (Oct 9). The stage tiles, 500+, AWS DevOps and the
 * team photo are dropped there. */
const A = -28.6, B = -15, C = 19, D = 32.6; // Square's grid, rows 2–3 opened up around the statement
const TILES: Array<{ t: Tile; d: [number, number]; m: [number, number] | null }> = [
  { t: { kind: 'stage', k: 'validate', label: 'Validate' }, d: [-32.85, A], m: null },
  { t: { kind: 'stat', value: '500+', label: 'AI-accelerated experts' }, d: [-10.97, A], m: null },
  { t: { kind: 'stage', k: 'build', label: 'Build' }, d: [10.97, A], m: null },
  { t: { kind: 'competency', src: '/assets/partners/aws-healthcare-ink.svg' }, d: [32.85, A], m: [24, -42] }, // swapped with Build, Oct 6

  { t: { kind: 'stat', value: '100+', label: 'AI initiatives led' }, d: [-43.8, B], m: [-39, -24] },
  { t: { kind: 'chip', src: '/assets/partners/claude-select-chip.svg' }, d: [-21.9, B], m: [-24, -42] }, // Claude Partner Network, Select Services Partner (Figma 538:3101); swapped with 100+, Oct 6
  { t: { kind: 'ring' }, d: [0, B], m: [0, -24] }, // the Flywheel ring, top centre (swapped with the portrait, Oct 4)
  { t: { kind: 'stat', value: '150+', label: 'Person AI CoE' }, d: [21.9, B], m: [39, -24] },
  { t: { kind: 'stage', k: 'enable', label: 'Enable' }, d: [43.8, B], m: null }, // swapped with 150+, Oct 6

  { t: { kind: 'stage', k: 'accelerate', label: 'Accelerate' }, d: [-43.8, C], m: null }, // swapped with Run, Oct 7
  { t: { kind: 'competency', src: '/assets/partners/aws-ai-ink.svg' }, d: [-21.9, C], m: [-39, 24] }, // AWS AI Services Competency
  { t: { kind: 'video' }, d: [0, C], m: [0, 24] },
  { t: { kind: 'service', name: 'Agentic AI', label: 'Consulting services' }, d: [21.9, C], m: [39, 24] }, // the AI Services competency's two services, as tiles
  { t: { kind: 'service', name: 'Generative AI', label: 'Consulting services' }, d: [43.8, C], m: [-24, 42] },

  { t: { kind: 'photo', src: '/assets/support-team.jpg', pos: '30% 50%' }, d: [-32.85, D], m: null }, // the team photo (Oct 6, back from row 2)
  { t: { kind: 'stage', k: 'run', label: 'Run' }, d: [-10.97, D], m: null },
  { t: { kind: 'stat', value: '250+', label: 'Products' }, d: [10.97, D], m: [24, 42] },
  { t: { kind: 'competency', src: '/assets/partners/aws-devops-ink.svg' }, d: [32.85, D], m: null },
];

function TileBody({ t }: { t: Tile }) {
  switch (t.kind) {
    case 'photo':
      return <img src={t.src} alt="" style={t.pos ? { objectPosition: t.pos } : undefined} />;
    case 'stage':
      return (
        <>
          <svg viewBox="0 0 24 24" aria-hidden>
            {STAGE_ICON[t.k]}
          </svg>
          <span>{t.label}</span>
        </>
      );
    case 'stat':
      return (
        <>
          <strong>{t.value}</strong>
          <span>{t.label}</span>
        </>
      );
    case 'competency':
      return <img src={t.src} alt="" />;
    case 'service':
      return (
        <>
          {/* one service, or several — each its name over the label, divided by a hairline */}
          {(Array.isArray(t.name) ? t.name : [t.name]).map((n, i) => (
            <span key={n} className="svc">
              {i > 0 && <i className="svc-rule" aria-hidden />}
              <strong>{n}</strong>
              <span>{t.label}</span>
            </span>
          ))}
        </>
      );
    case 'chip':
      return <img src={t.src} alt="" />;
    case 'badge':
      return t.art === 'aws' ? <img src="/assets/badge-aws.svg" alt="" width={47} height={28} /> : <AnthropicMark />;
    case 'ring':
      /* a still of the Flywheel's own glass ring, so the tile and the flight match it */
      return <img className="ring-glass" src="/assets/flywheel-ring.jpg" alt="" />;
    case 'video':
      return <img src={POSTER} alt="" />;
  }
}

/* Timing, measured on squareup.com (1440×900):
 *  - the move completes after 33% of a viewport of scroll, the page settles at 38%
 *    and the mosaic holds until 60%;
 *  - the scroll position goes through a smoother (~8.5% of the gap per frame)
 *    before it is mapped to progress;
 *  - stopping part-way glides the page on to the docked point (or back to the
 *    top when scrolling up), so one wheel notch plays the whole move;
 *  - the loop shrinks with one uniform scale while a clip crops it to a square
 *    tile with rounded corners; the headline stays put, clipped to the loop, and
 *    fades word by word: each word drifts up one line while it fades, left to
 *    right, the drift accelerating as the word disappears;
 *  - every tile grows from 25% and fades in with the loop; photos zoom out from 1.5×;
 *  - statement words rise one after another through the second half of the move. */
/* After the mosaic docks, the hero scrolls away as normal while every tile rises
 * faster than the page, at its own depth (after waabi.ai's 150vh tile section,
 * whose outer columns travel ±600px against the inner ones): rows above the
 * statement fastest (outer columns most), the statement next, rows below slower —
 * so the depth reads plainly and no tile ever crosses the words. The ring tile
 * rises with its row like the rest; only its ring flies on into the Flywheel. */
const SAY_DRIFT = 0.8;
const driftFor = (_t: Tile, dx: number, dy: number) => {
  const col = Math.abs(dx) >= 30 ? 2 : Math.abs(dx) >= 15 ? 1 : 0; // centre · middle · outer
  return dy < 0 ? [1.0, 1.2, 1.45][col] : [0.45, 0.55, 0.7][col];
};
/* phones: the speed steps down row by row (top row fastest), so in the stagger no tile ever
 * catches the one diagonally above it; rows above the statement outpace it (0.8), rows below
 * lag it; the ring's row keeps the desktop ring's 1.0 (TileFlight reads that) */
const phoneDrift = (my: number) => (my <= -40 ? 1.2 : my < 0 ? 1.0 : my <= 30 ? 0.35 : my <= 50 ? 0.25 : 0.2); // rows below: slower (Oct 9: 0.6 / 0.5), less empty space before the Flywheel
const MORPH = 0.33; // the move completes here…
const HERO_DARK_UNTIL = 0.3; // morph progress at which the shrinking video clears the header
const DOCK = 0.38; // …and the glide settles here, so the move ends crisply instead of easing to a stop
export const HOLD = 0.25; // once docked, the tiles hold still for this much of a viewport before they move on (globals.css .hero height includes it)
const SMOOTH = 0.085;
const WORD_SMOOTH = 0.13;
/* Headline fade, fitted to squareup.com's TextStack title (sampled per frame
 * against the loop's progress): word i starts at 0.11 + 0.0225·i of the move and
 * takes 0.35 of it; opacity (1 − x)^1.8 while it drifts up 0.5·x² of a line,
 * jumping to a full line once invisible. The buttons follow the same curve from
 * 0.37 to 0.77, the second 0.02 later. No extra smoothing: words track the move. */
const TITLE_START = 0.11;
const TITLE_STEP = 0.0225;
const TITLE_SPAN = 0.35;
const fade = (x: number) => Math.pow(1 - x, 1.8);
const SNAP_IDLE = 280;
const SNAP_MS = 620;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

/* Hero — after squareup.com. The loop fills the screen under the headline; as
 * the visitor scrolls it shrinks into one tile of a mosaic and the statement is
 * revealed in the middle.
 *
 * Reduced motion: nothing scales, travels or snaps. The loop is paused on its
 * poster, the full-screen frame fades out and reappears already in its tile, and
 * the mosaic and statement fade in. */
export default function Hero() {
  const trackRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLLIElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const filmOpenRef = useRef(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [docked, setDocked] = useState(false);
  filmOpenRef.current = filmOpen;

  /* Reduced motion: hold on the still image instead of looping. */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Hold the loop while the film is open, while it is off screen (scrolled past the hero: no
   * decoding the page can't see, Oct 10), and always under reduced motion. */
  const [loopSeen, setLoopSeen] = useState(true);
  useEffect(() => {
    const v = loopRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setLoopSeen(e.isIntersecting));
    io.observe(v);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const v = loopRef.current;
    if (!v) return;
    if (filmOpen || reduced || !loopSeen) v.pause();
    else void v.play().catch(() => {});
  }, [filmOpen, reduced, loopSeen]);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const frame = frameRef.current;
    const intro = introRef.current;
    const slot = slotRef.current;
    if (!track || !pin || !frame || !intro || !slot) return;
    const say = pin.querySelector<HTMLElement>('.hero-say');
    const videoIndex = TILES.findIndex((x) => x.t.kind === 'video');

    const titleWords = Array.from(intro.querySelectorAll<HTMLElement>('.hero-word'));
    const actions = intro.querySelector<HTMLElement>('.hero-actions');
    const buttons = actions ? Array.from(actions.children) as HTMLElement[] : [];
    const words = Array.from(pin.querySelectorAll<HTMLElement>('.hw-i'));
    const wordStart = words.map((_, i) => 0.48 + 0.3 * (i / Math.max(1, words.length - 1)));
    const wordGoal = (m: number, i: number) => 110 * (1 - easeOut(span(m, wordStart[i], Math.min(1, wordStart[i] + 0.4))));
    const wordY = words.map(() => 110);

    const phoneMq = window.matchMedia('(max-width: 720px)');
    let W = 0, H = 0, run = 1;
    /* docked transform, and the fraction of the frame clipped on each axis */
    let fin = { s: 1, tx: 0, ty: 0, cx: 0, cy: 0, r: 0 };
    let target = 0, shown = -1, last = 0, raf = 0;
    let wasDocked = false;

    const measure = () => {
      W = pin.clientWidth;
      H = pin.clientHeight;
      run = Math.max(1, H * MORPH);
      const pr = pin.getBoundingClientRect();
      const sr = slot.getBoundingClientRect();
      const T = slot.offsetWidth; // untransformed size: tiles are scaled while hidden
      const s = T / Math.min(W, H);
      fin = {
        s,
        tx: sr.left - pr.left + sr.width / 2 - W / 2,
        ty: sr.top - pr.top + sr.height / 2 - H / 2 - (parseFloat(slot.style.getPropertyValue('--py')) || 0),
        cx: W > H ? (1 - H / W) / 2 : 0,
        cy: H > W ? (1 - W / H) / 2 : 0,
        r: (parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 20) / s,
      };
    };

    const rel = () => -track.getBoundingClientRect().top;

    /* returns true while any word is still settling */
    const root = document.documentElement;
    const render = (m: number, dt: number, px: number) => {
      let moving = false;
      /* the video is a dark ground: while it still fills the top of the screen the header
       * (and anything else keyed to it) takes its dark version (html.hero-dark) */
      root.classList.toggle('hero-dark', m < HERO_DARK_UNTIL && px < H);
      const tiles = pin.querySelectorAll<HTMLElement>('.hero-tile');
      if (reduced) {
        /* crossfade, no movement */
        const inTile = m >= 0.5;
        frame.style.transform = inTile ? `translate3d(${fin.tx}px, ${fin.ty}px, 0) scale(${fin.s})` : 'none';
        frame.style.clipPath = inTile ? `inset(${fin.cy * 100}% ${fin.cx * 100}% round ${fin.r}px)` : 'none';
        const op = inTile ? span(m, 0.5, 0.7) : 1 - span(m, 0.1, 0.45);
        frame.style.opacity = String(op);
        frame.style.pointerEvents = op < 0.05 ? 'none' : '';
        intro.style.clipPath = 'none';
        intro.style.opacity = String(1 - span(m, 0.05, 0.4));
        titleWords.forEach((w) => {
          w.style.opacity = '';
          w.style.transform = 'none';
        });
        buttons.forEach((b) => (b.style.opacity = ''));
        pin.style.setProperty('--m', span(m, 0.4, 0.8).toFixed(4));
        words.forEach((w) => {
          w.style.transform = 'none';
          w.style.opacity = String(span(m, 0.5, 0.9));
        });
        pin.style.setProperty('--say', span(m, 0.6, 0.95).toFixed(4));
        tiles.forEach((t) => t.style.setProperty('--py', '0px'));
      } else {
        /* depth parallax once docked — after a hold (HOLD of a viewport) where the docked
         * tiles stay still — every tile drifts up at its own rate */
        const par = Math.max(0, px - H * (DOCK + HOLD));
        /* on phones the drift follows the phone grid (a column moves as one, so its tiles keep
         * their spacing; rows above the statement outpace it, rows below lag) — the desktop
         * grid's speeds there made tiles collide */
        const drift = (i: number) => {
          const { t, d, m } = TILES[i];
          return phoneMq.matches && m ? phoneDrift(m[1]) : driftFor(t, d[0], d[1]);
        };
        const pyVideo = -par * drift(videoIndex);
        tiles.forEach((t, i) => t.style.setProperty('--py', `${(-par * drift(i)).toFixed(1)}px`));
        pin.style.setProperty('--py-video', `${pyVideo.toFixed(1)}px`);
        if (say) say.style.translate = `0 ${(-par * SAY_DRIFT).toFixed(1)}px`;
        const s = 1 + (fin.s - 1) * m;
        const tx = fin.tx * m;
        const ty = fin.ty * m + pyVideo;
        const cx = fin.cx * m;
        const cy = fin.cy * m;
        const r = fin.r * m;
        frame.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
        frame.style.clipPath = `inset(${cy * 100}% ${cx * 100}% round ${r}px)`;
        frame.style.opacity = '';
        frame.style.pointerEvents = '';

        /* the headline is not scaled: it is clipped to the loop's visible rectangle */
        const vw = W * s * (1 - 2 * cx);
        const vh = H * s * (1 - 2 * cy);
        const left = W / 2 + tx - vw / 2;
        const top = H / 2 + ty - vh / 2;
        intro.style.clipPath = `inset(${top}px ${W - left - vw}px ${H - top - vh}px ${left}px round ${r * s}px)`;
        intro.style.opacity = '';

        /* headline words, as squareup.com's TextStack title */
        titleWords.forEach((w, i) => {
          const a = TITLE_START + i * TITLE_STEP;
          const x = span(m, a, a + TITLE_SPAN);
          const rise = x >= 1 ? 1 : 0.5 * x * x;
          w.style.opacity = fade(x).toFixed(3);
          w.style.transform = `translate3d(0, ${(-rise).toFixed(4)}em, 0)`;
        });
        buttons.forEach((b, i) => (b.style.opacity = fade(span(m, 0.37 + i * 0.02, 0.77 + i * 0.02)).toFixed(3)));

        pin.style.setProperty('--m', m.toFixed(4));

        /* words: each follows its own staggered goal through a smoother, so the
         * last ones are still settling just after the loop docks */
        const a = 1 - Math.pow(1 - WORD_SMOOTH, dt / 16.7);
        words.forEach((w, i) => {
          const goal = wordGoal(m, i);
          wordY[i] += (goal - wordY[i]) * a;
          if (Math.abs(goal - wordY[i]) < 0.05) wordY[i] = goal;
          else moving = true;
          w.style.transform = `translate3d(0, ${wordY[i].toFixed(2)}%, 0)`;
          w.style.opacity = '';
        });
        pin.style.setProperty('--say', span(m, 0.8, 1).toFixed(4));
      }

      const nowDocked = reduced ? m > 0.6 : m > 0.97;
      if (nowDocked !== wasDocked) {
        wasDocked = nowDocked;
        setDocked(nowDocked);
      }
      return moving;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      if (shown < 0 || reduced) shown = target;
      else {
        const a = 1 - Math.pow(1 - SMOOTH, dt / 16.7);
        shown += (target - shown) * a;
        if (Math.abs(target - shown) < 0.3) shown = target;
      }
      /* the scroll position is smoothed, then mapped and clamped, so the move
       * finishes crisply as the smoothed position passes the end of the morph */
      const wordsMoving = render(clamp01(shown / run), dt, shown);
      /* the Flywheel ring sits on its tile: place and draw it now, after the tiles moved (TileFlight) */
      (window as unknown as { __fwFlight?: { follow?: (() => void) | null } }).__fwFlight?.follow?.();
      if (shown !== target || wordsMoving) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      target = Math.max(0, Math.min(H * 3, rel()));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ── snap: finish (or undo) the move when the visitor stops part-way ── */
    let dir = 1, prevY = window.scrollY, idle = 0, snapRaf = 0, snapping = false;
    const stopSnap = () => {
      if (snapRaf) cancelAnimationFrame(snapRaf);
      snapRaf = 0;
      snapping = false;
    };
    const snapTo = (goal: number) => {
      const from = window.scrollY;
      const dist = goal - from;
      if (Math.abs(dist) < 2) return;
      const t0 = performance.now();
      snapping = true;
      const step = (now: number) => {
        if (!snapping) return;
        const k = easeOut(clamp01((now - t0) / SNAP_MS));
        window.scrollTo({ top: from + dist * k, behavior: 'instant' as ScrollBehavior });
        if (k < 1) snapRaf = requestAnimationFrame(step);
        else stopSnap();
      };
      snapRaf = requestAnimationFrame(step);
    };
    /* only the visitor's own scrolling (wheel, touch, keys) is ever finished off by the
     * glide — never a link jump or other programmatic scroll passing through the hero */
    let lastInput = -Infinity;
    const maybeSnap = () => {
      if (reduced || snapping || filmOpenRef.current) return;
      if (performance.now() - lastInput > 2000) return;
      const r = rel();
      const dock = H * DOCK;
      if (r <= 1 || r >= dock - 1) return;
      const top = window.scrollY - r;
      snapTo(dir < 0 ? top : top + dock);
    };
    const onScroll = () => {
      const y = window.scrollY;
      /* the direction of travel turns only after a real move (16px): the small rebound
       * some trackpads send as a swipe ends must not read as heading back */
      if (snapping) prevY = y;
      else if (Math.abs(y - prevY) > 16) {
        dir = y > prevY ? 1 : -1;
        prevY = y;
      }
      kick();
      clearTimeout(idle);
      if (!snapping) idle = window.setTimeout(maybeSnap, SNAP_IDLE);
    };
    /* any new input from the visitor takes over from a glide in progress */
    const onUser = () => {
      lastInput = performance.now();
      if (snapping) stopSnap();
    };
    const onResize = () => {
      measure();
      shown = -1;
      kick();
    };

    measure();
    target = Math.max(0, Math.min(H * 3, rel()));
    shown = target;
    words.forEach((_, i) => (wordY[i] = wordGoal(clamp01(target / run), i)));
    render(clamp01(shown / run), 16.7, shown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onUser, { passive: true });
    window.addEventListener('touchstart', onUser, { passive: true });
    window.addEventListener('touchmove', onUser, { passive: true });
    window.addEventListener('keydown', onUser);
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(pin);
    return () => {
      cancelAnimationFrame(raf);
      stopSnap();
      clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onUser);
      window.removeEventListener('touchstart', onUser);
      window.removeEventListener('touchmove', onUser);
      window.removeEventListener('keydown', onUser);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [reduced]);

  const statementWords = HERO.subhead.split(' ');

  return (
    <section ref={trackRef} className={`hero${reduced ? ' is-still' : ''}`} id="top" aria-labelledby="hero-title" data-theme="light">
      <div ref={pinRef} className="hero-pin">
        <ul className="hero-tiles" aria-hidden>
          {TILES.map(({ t, d, m }, i) => (
            <li
              key={i}
              ref={t.kind === 'video' ? slotRef : undefined}
              className={`hero-tile hero-tile--${t.kind}${m ? '' : ' is-wide-only'}`}
              data-tone={t.kind === 'stage' ? t.k : undefined}
              data-drift={t.kind === 'ring' ? driftFor(t, d[0], d[1]) : undefined /* TileFlight reads the ring tile's parallax speed */}
              style={{ '--dx': d[0], '--dy': d[1], '--mx': m ? m[0] : 0, '--my': m ? m[1] : 0 } as React.CSSProperties}
            >
              <TileBody t={t} />
            </li>
          ))}
        </ul>

        <div className="hero-say">
          <p className="hero-statement">
            {statementWords.map((w, i) => (
              <span key={i}>
                <span className="hw">
                  <span className="hw-i">{w}</span>
                </span>{' '}
              </span>
            ))}
          </p>
          <div className="hero-say-actions">
            <a href={CONTACT_HREF} className="btn-primary" tabIndex={docked ? 0 : -1}>
              {CTA_LABEL}
            </a>
            <a href="#flywheel" className="btn-glass" tabIndex={docked ? 0 : -1}>
              See how we work <Arrow dir="down" className="btn-ic" />
            </a>
          </div>
        </div>

        <div ref={frameRef} className={`hero-frame${docked ? ' is-docked' : ''}`}>
          <video
            ref={loopRef}
            className="hero-loop"
            autoPlay={!reduced}
            loop
            muted
            playsInline
            preload="metadata"
            poster={POSTER}
            aria-hidden
          >
            <source src={LOOP_VIDEO} type="video/mp4" />
          </video>
          <div className="hero-scrim" aria-hidden />
          {/* partner badges ride along the bottom of the loop, as Square's client logos do */}
          <CredibilityMarquee tabbable={!docked} />
        </div>

        {/* outside the scaled frame so it keeps its size; Hero clips it to the loop */}
        <div ref={introRef} className={`hero-intro${docked ? ' is-gone' : ''}`}>
          <h1 id="hero-title" aria-label={HERO.headline.join(' ')}>
            {HERO.headline.map((line) => (
              <span key={line} className="hero-line" aria-hidden>
                {line.split(' ').map((w, i) => (
                  <span key={i}>
                    <span className="hero-word">{w}</span>{' '}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="hero-actions">
            <a href={CONTACT_HREF} className="btn-primary" tabIndex={docked ? -1 : 0}>
              {CTA_LABEL}
            </a>
            <button
              type="button"
              className="btn-glass btn-glass--dark"
              onClick={() => setFilmOpen(true)}
              aria-haspopup="dialog"
              tabIndex={docked ? -1 : 0}
            >
              <svg className="btn-ic" width="15" height="15" viewBox="0 0 12 12" aria-hidden>
                <path d="M2 1l9 5-9 5V1z" fill="currentColor" />
              </svg>
              {HERO.filmLabel}
            </button>
          </div>
        </div>

        {/* sits on the docked tile; outside the frame so it isn't scaled */}
        <button
          type="button"
          className={`hero-play${docked ? ' is-on' : ''}`}
          aria-label={HERO.filmLabel}
          aria-haspopup="dialog"
          tabIndex={docked ? 0 : -1}
          onClick={() => setFilmOpen(true)}
        >
          <svg viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.5l7.5 4.5L3 10.5z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <FilmDialog open={filmOpen} onClose={() => setFilmOpen(false)} />
    </section>
  );
}
