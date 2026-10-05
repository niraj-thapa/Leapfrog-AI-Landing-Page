'use client';

import { useEffect, useRef, useState } from 'react';
import { BADGES, PILLARS, WHY } from '../lib/content';
import AgentFlow, { AGENT_FLOW_TEXT } from './AgentFlow';

/* Each pillar borrows a Flywheel stage colour. */
const TONE: Record<string, string> = { expertise: 'build', attention: 'validate', results: 'enable', stay: 'accelerate' };

/* Why Leapfrog. The first three pillars are an explorer after concourse.ai's
 * "Agents built to own the work": the pillars as a list on the left (large titles, the
 * open one shows its text; "And we stay." heads the Real results scene), a picture panel on the right with a scene per
 * pillar and a strip of proof along its bottom. The list moves on by itself — a line
 * fills above the open pillar (8s), then the next opens — and holds while the pointer is on
 * the picture (or keyboard focus is in the section).
 *
 * Scenes: Deep AI expertise — "We run it on ourselves", our agent pipeline as a moving
 * agents (AgentFlow, after Concourse's Close Agent), the partner badges along the
 * bottom as in the hero (still). Boutique attention — the client quote. Real results, faster —
 * the path from the agreed metric to the next use case, the figures along the bottom.
 * Photos: Unsplash placeholders (credits in design.md). */

const DWELL = 8000; // ms each pillar stays open while the explorer plays

const EXTRA: Record<string, { image: string; strip?: { value: string; label: string }[] }> = {
  expertise: { image: '/assets/why/expertise.jpg' },
  attention: {
    image: '/assets/why/attention.jpg',
    strip: [
      { value: 'Days', label: 'To a decision, not committee cycles' },
      { value: 'Same people', label: 'From first meeting to delivery' },
      { value: 'On demand', label: 'Your team scales with the work' },
    ],
  },
  results: {
    image: '/assets/why/results.jpg',
    /* UNVERIFIED — figures come from the Figma featured story (see PILLARS.results.proof) */
    strip: [
      { value: '9 weeks', label: 'SecondLook Health, live' },
      { value: '70–90%', label: 'Less review time' },
      { value: 'Weeks', label: 'To your first use case' },
    ],
  },
};

const RESULT_STEPS = [
  { n: '01', label: 'Agree the success metric', tag: 'Up front' },
  { n: '02', label: 'First use case live', tag: 'Weeks' },
  { n: '03', label: 'Each next one, faster', tag: 'Roadmap' },
];

type Pillar = (typeof PILLARS)[number];

/* One pillar's picture scene — shared by both versions of the section. */
function Scene({ p, open, inView }: { p: Pillar; open: boolean; inView: boolean }) {
  const stay = PILLARS[3];
  const x = EXTRA[p.key];
  return (
    <figure className={`why-scene${open ? ' is-open' : ''}`} data-tone={TONE[p.key]} aria-hidden={!open}>
      <img className="why-photo" src={x.image} alt="" loading="lazy" />
      <span className="why-shade" aria-hidden="true" />

      {p.key === 'expertise' && (
        <>
          {/* on a blurred band with a line below, as the Client results cards' text */}
          <div className="why-intro">
            <p className="why-intro-text">
              <strong>We run it on ourselves.</strong> Agents build, test, validate and operate our own code and
              products, and our engineers approve every release:
            </p>
            <hr />
          </div>
          <AgentFlow open={open} visible={inView} />
          <p className="sr-only">{AGENT_FLOW_TEXT}</p>
          {/* the partner credentials, flat white as in the hero, on a blurred band like the intro's */}
          <ul className="why-partners" aria-label="Partner credentials">
            {BADGES.map((b) => (
              <li key={b.name}>
                <a href={b.href} className="badge" title={b.name} aria-label={b.name} tabIndex={open ? 0 : -1}>
                  <img src={b.mono} alt="" className={`badge-img badge-img--${b.kind}`} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {p.key === 'attention' && p.quote && (
        <blockquote className="why-quote">
          <p>“{p.quote.text}”</p>
          <footer>{p.quote.who}</footer>
        </blockquote>
      )}

      {p.key === 'results' && stay && (
        /* "And we stay." — across the top, as "We run it on ourselves" */
        <div className="why-intro">
          <p className="why-intro-text">
            <strong>{stay.title}</strong> {stay.body}
          </p>
          <hr />
        </div>
      )}

      {p.key === 'results' && (
        <ol className="why-steps">
          {RESULT_STEPS.map((s) => (
            <li key={s.n} className="af-card">
              <span className="af-icon af-icon--num" aria-hidden="true">{s.n}</span>
              <span className="af-label">{s.label}</span>
              <span className="af-tag">{s.tag}</span>
            </li>
          ))}
        </ol>
      )}

      {x.strip && (
        <dl className="why-strip">
          {x.strip.map((s) => (
            <div key={s.value}>
              <dt>{s.value}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}

export default function WhyLeapfrog() {
  const three = PILLARS.slice(0, 3);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer or focus inside: don't move on
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const exRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = exRef.current;
    if (!el) return;
    /* plays only while the section is properly in view (60% of it, or most of the screen
     * when it is taller); otherwise the line and the agent cards hold where they were */
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.6 || e.intersectionRect.height >= window.innerHeight * 0.6), { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !held && !still;
  const next = () => setActive((a) => (a + 1) % three.length);

  return (
    <section className="why" id="why" aria-labelledby="why-title" data-theme="light">
      {/* the heading, centred above the split */}
      <div className="wrap" data-reveal>
        <div className="why-head">
          <p className="why-eyebrow">Why Leapfrog</p>
          <h2 id="why-title" className="h2">
            {WHY.headline}
          </h2>
          <p className="lead">{WHY.intro}</p>
        </div>
      </div>
      {/* split as squareup.com's "Point of sale": a column on the left (the pillars as an
          accordion, the note at its foot), a full-bleed picture
          panel on the right, edge to edge and the section's full height */}
      {/* version 1 — the explorer (V2, WhyStory, below; html[data-why] picks one) */}
      <div className="why-v1">
      <div
        ref={exRef}
        className={`why-split${playing ? ' is-playing' : ''}`}
        onFocus={(e) => {
          if ((e.target as HTMLElement).matches(':focus-visible')) setHeld(true); // keyboard focus only, not a mouse click
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
        }}
      >
        <div className="why-side">
          {/* the page's scroll reveal works on this block's children, which React never re-classes */}
          <div className="why-side-main" data-reveal>
          <ul className="why-list">
            {three.map((p, i) => {
              const open = i === active;
              return (
                <li key={p.key} className={`why-item${open ? ' is-open' : ''}`} data-tone={TONE[p.key]}>
                  <div className="why-rule" aria-hidden="true">
                    {open && !still && <span key={active} className="why-rule-fill" style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={next} />}
                  </div>
                  <button
                    type="button"
                    className="why-tab"
                    aria-expanded={open}
                    aria-controls={`why-detail-${p.key}`}
                    onClick={() => setActive(i)}
                  >
                    <h3>{p.title}</h3>
                    <span className={`why-pm${open ? ' is-open' : ''}`} aria-hidden="true" />
                  </button>
                  <div className="why-detail" id={`why-detail-${p.key}`} inert={!open}>
                    <div className="why-detail-inner">
                      <p className="why-body">{p.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          </div>

          </div>

          {/* the list moves on by itself, pausing only while the pointer is on the picture */}
          <div className="why-stage" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
            {three.map((p, i) => (
              <Scene key={p.key} p={p} open={i === active} inView={inView} />
            ))}
          </div>
      </div>
      </div>

      {/* version 2 — the pillars as a scroll story, after bayshore.ai */}
      <div className="why-v2">
        <WhyStory />
      </div>
    </section>
  );
}

/* Version 2 (html[data-why="2"], review button): after bayshore.ai's "Business Waits.
 * Compliance Drowns." (measured Oct 4 2026). Two columns: the pillars' text on the left —
 * one block per screen, scrolling normally — and a sticky full-height picture panel on the right whose
 * scene crossfades to the pillar in the middle of the screen (Bayshore plays a Lottie per
 * step; ours are the same three scenes as version 1). */

function WhyStory() {
  const three = PILLARS.slice(0, 3);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    /* the step crossing the middle of the screen is the active one */
    const ioStep = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: '-50% 0px -50% 0px' },
    );
    stepRefs.current.forEach((el) => el && ioStep.observe(el));
    /* the agent cards play while the story is on screen */
    const ioRoot = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '-20% 0px -20% 0px' });
    ioRoot.observe(root);
    return () => {
      ioStep.disconnect();
      ioRoot.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="why-story">
      <div className="why-story-steps">
        {three.map((p, i) => (
          <article
            key={p.key}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-i={i}
            data-tone={TONE[p.key]}
            className={`why-story-step${i === active ? ' is-active' : ''}`}
          >
            <h3>{p.title}</h3>
            <p className="why-story-body">{p.body}</p>
          </article>
        ))}
      </div>

      <div className="why-story-visual">
        <div className="why-stage">
          {three.map((p, i) => (
            <Scene key={p.key} p={p} open={i === active} inView={inView} />
          ))}
        </div>
      </div>
    </div>
  );
}
