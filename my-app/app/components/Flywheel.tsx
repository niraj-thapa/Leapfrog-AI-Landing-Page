'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { initFlywheel } from './flywheel/flywheel';
import './flywheel/flywheel.css';

/* The AI Flywheel (brief v8, module 2) — the "glass pipe" build.
 *
 * Markup, copy and behaviour come from the reference package (index.html,
 * main.js, styles.css, "option 2"). The imperative engine in ./flywheel/flywheel.js
 * is the reference's main.js, wrapped so it can be mounted, torn down and
 * remounted by React. It drives hover/selection state, the detail dialog and a
 * three.js scene (a refractive glass ring with a flowing water channel).
 *
 * three.js is loaded lazily, so the panels appear immediately and the canvas
 * fades in once the library has arrived. If WebGL is unavailable the section
 * falls back to a flat conic ring (.no-gl in the stylesheet).
 *
 * Differences from the reference, made for the page:
 *  - panels and ring labels are real <a> links (the brief requires it); a click
 *    opens the dialog instead of navigating, so Enter on a focused panel works
 *    and middle-click / "open in new tab" still reaches the service page
 *  - the canvas has a text alternative (.fw-sr)
 *  - the "Option 1 / Option 2" switcher is omitted (a design-comparison control)
 *  - dialog links point at the real service routes
 */

const PANELS = [
  {
    k: 'validate', side: 'l', step: '01 · Validate', title: 'AI-Driven Design',
    href: 'https://design.lftechnology.com/', external: true,
    lead: 'Know what’s worth building: AI discovery and roadmaps, clickable prototypes, user research and brand assets.',
    items: ['AI discovery and roadmaps', 'Clickable prototypes', 'User research and brand assets'],
    icon: (<><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 14h9" /></>),
  },
  {
    k: 'build', side: 'r', step: '02 · Build', title: 'AI Solutions', href: '/solutions',
    lead: 'Build the AI you can’t buy: industry accelerators, agentic workflows and customer-facing AI assistants.',
    items: ['Industry accelerators', 'Agentic workflows', 'Customer-facing AI assistants'],
    icon: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>),
  },
  {
    k: 'enable', side: 'r', step: '03 · Enable', title: 'AI Enablement', href: '/enablement',
    lead: 'Put everyday AI to work for your teams: Claude rollouts live in 30 days, custom skills and connectors, role-based training.',
    items: ['Claude rollouts, live in 30 days', 'Custom skills and MCP connectors', 'Role-based training and governance'],
    icon: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M18 14.5a6 6 0 0 1 3 5.5" /></>),
  },
  {
    k: 'accelerate', side: 'b', step: '04 · Accelerate', title: 'AI-Native Engineering', href: '/engineering',
    lead: 'Help your engineers ship faster: forward-deployed engineers, AI-driven test automation and AI-accelerated practices.',
    items: ['Forward-deployed engineers', 'AI-driven test automation', 'AI-accelerated development practices'],
    icon: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  },
  {
    k: 'run', side: 'l', step: '05 · Run', title: 'AI Managed Services', href: '/managed-services',
    lead: 'Keep AI reliable as it spreads: monitoring and evaluation, security and cost control, monthly tuning.',
    items: ['Monitoring and evaluation', 'Security, governance and cost control', 'Usage analytics and monthly tuning'],
    icon: (<><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  },
] as const;

const RING_LABELS = [
  { k: 'validate', label: 'Validate', aria: 'Validate: AI-Driven Design', href: 'https://design.lftechnology.com/' },
  { k: 'build', label: 'Build', aria: 'Build: AI Solutions', href: '/solutions' },
  { k: 'enable', label: 'Enable', aria: 'Enable: AI Enablement', href: '/enablement' },
  { k: 'accelerate', label: 'Accelerate', aria: 'Accelerate: AI-Native Engineering', href: '/engineering' },
  { k: 'run', label: 'Run', aria: 'Run: AI Managed Services', href: '/managed-services' },
] as const;

const WHEEL_ALT =
  'The Leapfrog AI Flywheel: five services in a cycle around your business outcomes. Validate with AI-Driven Design, Build with AI Solutions, Enable with AI Enablement, Accelerate with AI-Native Engineering and Run with AI Managed Services, then back to Validate with what was learned. Select any stage to read its details.';

/* Version 3 (html[data-fw="3"], review button): the stages as a list on the left, the
 * ring on the right — after apple.com's product viewer ("Take a closer look", iPhone Duo,
 * measured Oct 3 2026). Closed stages are 56px pills (⊕ + name); the open one is a card
 * (stage, a line on what you get, "View details" → the detail dialog). Opening morphs the
 * pill into the card and the card back into its pill — width and height together, timed
 * from Apple's (see flywheel.css). The arrows step through the stages and stop at the
 * ends; the ring lights the open stage (data-pin on the section)
 * and a click on the ring opens that stage here (fw:pick from flywheel.js).
 *
 * Versions 4 and 5 (5 on a dark ground): the liquid plays on its own — the colour travels
 * round the ring and each stage's card opens as it arrives (fw:flow from flywheel.js).
 * A choice by the visitor (a pill, an arrow, the ring) holds that stage for 8s, then the
 * colour flows on from there. */
type Size = { w: number; h: number; cw: number; ch: number };
const OPEN_W = 440;
const HOLD_MS = 8000; // versions 4–5: how long a visitor's choice holds the liquid before it flows on

function StageList() {
  const [open, setOpen] = useState(0);
  const [sizes, setSizes] = useState<Size[] | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* measure each pill and each card (at the card width) so both can be animated */
  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const measure = () => {
      if (!ul.offsetParent) return; // hidden (another version)
      const cw = Math.min(OPEN_W, ul.clientWidth);
      const next = Array.from(ul.querySelectorAll<HTMLElement>('.fw-li')).map((li) => {
        const btn = li.querySelector<HTMLElement>('.fw-li-open')!;
        const content = li.querySelector<HTMLElement>('.fw-li-content')!;
        content.style.width = `${cw}px`;
        return { w: Math.ceil(btn.offsetWidth), h: Math.ceil(btn.offsetHeight), cw, ch: Math.ceil(content.offsetHeight) };
      });
      setSizes(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  /* which list version is showing: 3 (the visitor drives) or 4–5 (the liquid plays) */
  const [variant, setVariant] = useState<string | undefined>(undefined);
  useEffect(() => {
    const read = () => setVariant(document.documentElement.dataset.fw);
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-fw'] });
    return () => mo.disconnect();
  }, []);
  const auto = variant === '4' || variant === '5';

  /* versions 4–5: a choice by the visitor holds the liquid on that stage for a while,
   * then it flows on from there */
  const [hold, setHold] = useState(false);
  const holdTimer = useRef(0);
  const choose = (i: number) => {
    setOpen(i);
    if (!auto) return;
    setHold(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHold(false), HOLD_MS);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  /* the ring lights the open stage: always in version 3, while held in 4–5 */
  useEffect(() => {
    const fw = document.getElementById('flywheel');
    if (!fw) return;
    if (variant === '3' || (auto && hold)) fw.dataset.pin = PANELS[open].k;
    else delete fw.dataset.pin;
  }, [open, variant, auto, hold]);

  /* versions 4–5: the card opens as the travelling colour reaches its stage */
  useEffect(() => {
    const fw = document.getElementById('flywheel');
    if (!fw || !auto || hold) return;
    const follow = (k?: string) => {
      const i = PANELS.findIndex((p) => p.k === k);
      if (i >= 0) setOpen(i);
    };
    follow(fw.dataset.flow);
    const onFlow = (e: Event) => follow((e as CustomEvent<string>).detail);
    fw.addEventListener('fw:flow', onFlow);
    return () => fw.removeEventListener('fw:flow', onFlow);
  }, [auto, hold]);

  /* a click on the ring opens its stage here */
  useEffect(() => {
    const fw = document.getElementById('flywheel');
    const onPick = (e: Event) => {
      const i = PANELS.findIndex((p) => p.k === (e as CustomEvent<string>).detail);
      if (i >= 0) chooseRef.current(i);
    };
    fw?.addEventListener('fw:pick', onPick);
    return () => fw?.removeEventListener('fw:pick', onPick);
  }, []);
  const chooseRef = useRef(choose);
  chooseRef.current = choose;

  /* the arrows stop at the ends, as Apple's (disabled on the first / last stage) */
  const last = PANELS.length - 1;
  const step = (n: number) => choose(Math.max(0, Math.min(last, open + n)));

  return (
    <div className="fw-list-wrap">
      <div className="fw-list-nav">
        <button type="button" aria-label="Previous stage" disabled={open === 0} onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
        </button>
        <button type="button" aria-label="Next stage" disabled={open === last} onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
      <ul className={`fw-list${sizes ? ' is-measured' : ''}`} ref={listRef} aria-label="Flywheel stages">
        {PANELS.map((p, i) => {
          const isOpen = i === open;
          const z = sizes?.[i];
          return (
            <li
              key={p.k}
              className={`fw-li${isOpen ? ' is-open' : ''}`}
              data-k={p.k}
              style={z ? { width: isOpen ? z.cw : z.w, height: isOpen ? z.ch : z.h } : undefined}
            >
              <span className="fw-li-bg" aria-hidden="true" />
              <button
                type="button"
                className="fw-li-open"
                aria-expanded={isOpen}
                aria-controls={`fw-li-${p.k}`}
                data-hover={p.k}
                tabIndex={isOpen ? -1 : 0}
                onClick={() => choose(i)}
              >
                <span className="fw-li-plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" /></svg>
                </span>
                {p.title}
              </button>
              {/* the card's text, clipped to the item's rounded shape while it morphs */}
              <div className="fw-li-mask">
                <div className="fw-li-content" id={`fw-li-${p.k}`} aria-hidden={!isOpen}>
                  <p className="fw-li-step">{p.step}</p>
                  <p className="fw-li-body">
                    <strong>{p.title}.</strong> {p.lead}
                  </p>
                  <a href={p.href} className="fw-li-more" data-open={p.k} tabIndex={isOpen ? 0 : -1}>
                    View details <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Flywheel() {
  const cardsRef = useRef<HTMLDivElement>(null);
  /* version 5 sits on a dark ground: the section tells the page theme so */
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.fw === '5');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-fw'] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    window.dispatchEvent(new Event('scroll')); // let ThemeController re-read the sections' themes
  }, [dark]);
  useEffect(() => initFlywheel(() => import('three')), []);

  /* Version 2 (html[data-fw="2"], review button): the cards sit in a row below the
   * ring and rise in one by one when that row scrolls into view */
  useEffect(() => {
    const row = cardsRef.current;
    if (!row || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        row.classList.add('is-seen');
        io.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(row);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="fw" id="flywheel" aria-labelledby="fw-title" data-theme={dark ? 'dark' : 'light'}>
        <canvas className="fw-gl" id="fw-gl" aria-hidden="true" />
        <svg className="fw-links" id="fw-links" aria-hidden="true" />
        <p className="fw-sr">{WHEEL_ALT}</p>

        <header className="fw-head">
          <h2 className="fw-title" id="fw-title">Quick wins. Lasting reinvention.</h2>
          <p className="fw-pain">
            You’ve seen AI <span>pilots that never ship</span>, <span>tools your teams never adopt</span>,{' '}
            <span>roadmaps that gather dust</span>.
          </p>
          <p className="fw-promise">
            We start your flywheel with <strong>a quick win, live in weeks</strong>, then keep it turning{' '}
            <strong>across every team</strong> until <strong>your whole business is reimagined</strong>.
          </p>
        </header>

        <div className="fw-stage">
          <div className="fw-slot" id="fw-slot">
            <div className="fw-core">
              <span className="fw-core-label">At the center</span>
              <span className="fw-core-title">Your business outcomes</span>
            </div>
          </div>

          {/* version 2: a chip per stage around the ring, in place of the cards */}
          <div className="fw-chips">
            {PANELS.map((p, i) => (
              <a
                key={p.k}
                href={p.href}
                className="fw-chip"
                data-k={p.k}
                data-pick={p.k}
                data-side={p.side}
                {...('external' in p && p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="fw-chip-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">{p.icon}</svg>
                </span>
                <span className="fw-chip-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="fw-chip-title">{p.title}</span>
              </a>
            ))}
          </div>

          {/* version 3: the stages as a list beside the ring */}
          <StageList />

          <div className="fw-panels" ref={cardsRef}>
            {PANELS.map((p) => (
              <a
                key={p.k}
                href={p.href}
                className="panel"
                data-k={p.k}
                data-pick={p.k}
                data-side={p.side}
                {...('external' in p && p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="panel-top">
                  <span className="panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">{p.icon}</svg>
                  </span>
                  <span className="panel-heads">
                    <span className="panel-step">{p.step}</span>
                    <span className="panel-title">{p.title}</span>
                  </span>
                </span>
                <span className="panel-items">
                  {p.items.map((i) => (
                    <span key={i}>{i}</span>
                  ))}
                </span>
                <span className="panel-more">
                  View details <span className="arr" aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="fw-overlay">
          {RING_LABELS.map((l) => (
            <a key={l.k} href={l.href} className="ring-label" data-k={l.k} data-pick={l.k} aria-label={l.aria}>
              {l.label}
            </a>
          ))}
        </div>
      </section>

      <div className="fw-modal" id="fw-modal" hidden>
        <div className="fw-dialog" id="fw-dialog" role="dialog" aria-modal="true" aria-labelledby="d-headline">
          <span className="sweep" aria-hidden="true" />
          <button type="button" className="d-close" id="d-close" aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <p className="d-stage fw-rise" id="d-stage" />
          <h3 className="d-headline fw-rise" id="d-headline" />
          <p className="d-desc fw-rise" id="d-desc" />
          <div className="fw-rise" id="d-ex-wrap">
            <p className="d-label">What you get</p>
            <div className="d-ex" id="d-ex" />
          </div>
          <div className="d-cta-row">
            <a className="d-cta" id="d-link" href="#">
              <span id="d-cta" /> <span aria-hidden="true">→</span>
            </a>
            <span className="d-proof" id="d-proof" />
          </div>
          <nav className="d-nav" aria-label="Flywheel stages">
            <button type="button" id="d-prev"><span aria-hidden="true">←</span> <span id="d-prev-l" /></button>
            <button type="button" id="d-next"><span id="d-next-l" /> <span aria-hidden="true">→</span></button>
          </nav>
        </div>
      </div>
    </>
  );
}
