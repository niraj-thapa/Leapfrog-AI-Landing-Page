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
  attention: { image: '/assets/why/attention.jpg' }, // the client card sits over it
  results: {
    image: '/assets/why/results.jpg',
    /* UNVERIFIED — figures come from the Figma featured story (see PILLARS.results.proof) */
    strip: [
      { value: '9 weeks', label: 'From kickoff to live' },
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

/* the steps' build timing, as AgentFlow's */
const STEP_LINE_MS = 280;
const STEP_NEXT_MS = STEP_LINE_MS + 560;

type Pillar = (typeof PILLARS)[number];

/* One pillar's picture scene — shared by both versions of the section. */
function Scene({ p, open, inView }: { p: Pillar; open: boolean; inView: boolean }) {
  const stay = PILLARS[3];
  const x = EXTRA[p.key];
  const figRef = useRef<HTMLElement>(null);
  /* the scene's cards build in as the agents do (AgentFlow): each time the pillar opens,
   * once on screen; closing it resets them for next time */
  const [built, setBuilt] = useState(false);
  useEffect(() => {
    if (!open) setBuilt(false);
    else if (inView) setBuilt(true);
  }, [open, inView]);

  /* the progressive blur behind the bands (as the Boutique attention card's): where the top
   * band's line and the bottom band's line sit, so the blurred copy of the photo can fade
   * out at the one and in at the other */
  useEffect(() => {
    const fig = figRef.current;
    if (!fig || p.key === 'attention') return;
    const top = fig.querySelector<HTMLElement>('.why-intro');
    const bottom = fig.querySelector<HTMLElement>('.why-partners');
    const stack = fig.querySelector<HTMLElement>('.ag, .why-steps');
    const strip = fig.querySelector<HTMLElement>('.why-strip');
    const fit = () => {
      if (top) fig.style.setProperty('--band-top', `${top.offsetHeight}px`);
      if (bottom) fig.style.setProperty('--band-bottom', `${bottom.offsetHeight}px`);
      /* what sits below the stack: the partner row, or the proof strip (8px off the edge) */
      const below = bottom ? bottom.offsetHeight : strip ? strip.offsetHeight + 8 : 0;
      fig.style.setProperty('--stack-bottom', `${below}px`);
      /* the height that fits the scene exactly (agents or steps): the bands and the stack, 24px apart
       * (used where the picture sits under its text on phones) */
      const cards = stack ? Array.from(stack.children) as HTMLElement[] : [];
      if (cards.length) {
        const first = cards[0];
        const last = cards[cards.length - 1];
        const stackH = last.offsetTop + last.offsetHeight - first.offsetTop;
        fig.parentElement?.style.setProperty('--scene-h', `${Math.ceil((top?.offsetHeight ?? 0) + 24 + stackH + 24 + below)}px`);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    [top, bottom, strip, ...(stack ? Array.from(stack.children) : [])].forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [p.key]);

  return (
    <figure ref={figRef} className={`why-scene${open ? ' is-open' : ''}${built ? ' is-built' : ''}`} data-tone={TONE[p.key]} aria-hidden={!open}>
      <img className="why-photo" src={x.image} alt="" loading="lazy" />
      <img className="why-photo why-photo--blur" src={x.image} alt="" loading="lazy" aria-hidden="true" />
      <span className="why-shade" aria-hidden="true" />
      {p.key === 'attention' && <ClientCard />}

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
          {/* one after another, as the agents: the line from the card above draws, then the card arrives */}
          {RESULT_STEPS.map((s, i) => (
            <li
              key={s.n}
              className="why-step"
              style={{
                ['--line-at' as string]: `${i * STEP_NEXT_MS}ms`,
                ['--card-at' as string]: `${i === 0 ? 0 : i * STEP_NEXT_MS + STEP_LINE_MS}ms`,
              }}
            >
              <span className="af-card">
                <span className="af-icon af-icon--num" aria-hidden="true">{s.n}</span>
                <span className="af-label">{s.label}</span>
                <span className="af-tag">{s.tag}</span>
              </span>
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

/* Boutique attention — a client story card over the scene's photo (after webflow.com's
 * customer stories, measured Oct 5 2026, then set as a card): the client's portrait on the
 * left; on the right a figure and its label, the quote, the name, and the role with the
 * client's logo after it. */
const CLIENT = {
  photo: '/assets/story-portrait.png',
  logo: '/assets/logo-secondlook.svg',
  client: 'SecondLook Health',
  /* UNVERIFIED — "9 weeks" as in the Results proof; quote as PILLARS.attention.quote */
  stat: { value: '9 weeks', label: 'From brand concept to a live app' },
  name: 'Sierra Manker',
  role: 'Cofounder & Head of Product',
};

function ClientCard() {
  const quote = PILLARS[1].quote;
  return (
    <div className="why-card">
      <img className="why-card-photo" src={CLIENT.photo} alt={CLIENT.name} loading="lazy" />
      {/* phones: the card fills the picture, as Webflow's — a blurred copy behind the story */}
      <img className="why-card-photo why-card-photo--blur" src={CLIENT.photo} alt="" loading="lazy" aria-hidden="true" />
      <div className="why-card-text">
        <p className="why-card-stat">
          <strong>{CLIENT.stat.value}</strong>
          <span>{CLIENT.stat.label}</span>
        </p>
        {quote && <blockquote className="why-card-quote">“{quote.text}”</blockquote>}
        <p className="why-card-name">{CLIENT.name}</p>
        <p className="why-card-role">
          {CLIENT.role}
          <span className="why-card-org">
            <span className="why-card-bar" aria-hidden="true" />
            <img className="why-card-logo" src={CLIENT.logo} alt={CLIENT.client} />
          </span>
        </p>
      </div>
    </div>
  );
}

export default function WhyLeapfrog() {
  const three = PILLARS.slice(0, 3);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer or focus inside: don't move on
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  /* ≤900px the split stacks, as Square's does: the open pillar's picture sits inside it,
   * between its title and its text, and nothing moves on by itself (it would shift the page
   * under the reader) — a tap opens a pillar */
  const [stacked, setStacked] = useState(false);
  const exRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const mq = window.matchMedia('(max-width: 900px)');
    const onMq = () => setStacked(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    const el = exRef.current;
    if (!el) return () => mq.removeEventListener('change', onMq);
    /* plays only while the section is properly in view (60% of it, or most of the screen
     * when it is taller); otherwise the line and the agent cards hold where they were */
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.6 || e.intersectionRect.height >= window.innerHeight * 0.6), { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener('change', onMq);
    };
  }, []);

  /* the list is centred in its column at its tallest (the pillar with the longest text
   * open), so it holds still as the pillars take turns instead of re-centring each time */
  useEffect(() => {
    const box = sideRef.current;
    const list = box?.querySelector<HTMLElement>('.why-list');
    if (!box || !list) return;
    const fit = () => {
      const details = [...list.querySelectorAll<HTMLElement>('.why-detail')];
      const shut = list.offsetHeight - details.reduce((h, d) => h + d.offsetHeight, 0);
      const tallest = Math.max(...details.map((d) => d.firstElementChild?.scrollHeight ?? 0));
      box.style.minHeight = `${Math.ceil(shut + tallest)}px`;
    };
    fit();
    void document.fonts?.ready.then(fit); // the text's height settles once the fonts are in
    const ro = new ResizeObserver(fit);
    ro.observe(box.parentElement!);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  const playing = inView && !held && !still && !stacked;
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
          <div ref={sideRef} className="why-side-main" data-reveal>
          <ul className="why-list">
            {three.map((p, i) => {
              const open = i === active;
              return (
                <li key={p.key} className={`why-item${open ? ' is-open' : ''}`} data-tone={TONE[p.key]}>
                  <div className="why-rule" aria-hidden="true">
                    {open && !still && !stacked && <span key={active} className="why-rule-fill" style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={next} />}
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
                      {/* stacked (≤900px): the pillar's picture, between its title and its text */}
                      {stacked && (
                        <div className="why-item-media">
                          <div className="why-stage">
                            <Scene p={p} open={open} inView={inView} />
                          </div>
                        </div>
                      )}
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
          {!stacked && (
            <div className="why-stage" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
              {three.map((p, i) => (
                <Scene key={p.key} p={p} open={i === active} inView={inView} />
              ))}
            </div>
          )}
      </div>
      </div>

      {/* version 2 — the pillars as a scroll story, after bayshore.ai */}
      <div className="why-v2">
        <WhyStory />
      </div>

      {/* version 3 — the same story inside the page width, numbered as reasons 1-2-3 and tied
          to its picture (html[data-why="3"]) */}
      <div className="why-v3">
        <div className="wrap">
          <WhyStory numbered />
        </div>
      </div>
    </section>
  );
}

/* Version 2 (html[data-why="2"], review button): after bayshore.ai's "Business Waits.
 * Compliance Drowns." (measured Oct 4 2026). Two columns: the pillars' text on the left —
 * one block per screen, scrolling normally — and a sticky full-height picture panel on the right whose
 * scene crossfades to the pillar in the middle of the screen (Bayshore plays a Lottie per
 * step; ours are the same three scenes as version 1). */

/* Version 3 (html[data-why="3"], review button; Oct 8): version 2 brought inside the page
 * width, so the text and its picture read as one unit on large screens, with the three
 * pillars set as our 1-2-3 reasons. Each step: "Reason 1 of 3" (as the eyebrow), the title
 * (40px), the text and three key points (from the text); its text starts level with the
 * picture, whose caption names the same reason ("Reason 1 · Deep AI expertise"). Greys and
 * ink only, as the headings and eyebrows. ≤900px: as version 2, each picture under its
 * step, the numbering kept. */
const REASON_POINTS: Record<string, string[]> = {
  expertise: ['500+ AI-accelerated experts', '150+ person AI Center of Excellence', 'HIPAA, privacy and security built in'],
  attention: ['The people you meet deliver', 'Decisions in days', 'Your team scales when the work does'],
  results: ['The success metric agreed first', 'First use case live in weeks', 'Every AI-assisted line reviewed'],
};

function WhyStory({ numbered = false }: { numbered?: boolean }) {
  const three = PILLARS.slice(0, 3);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  /* ≤900px, as Bayshore's: no pinned panel — each step's own picture follows its text */
  const [stacked, setStacked] = useState(false);
  const [seen, setSeen] = useState<boolean[]>([false, false, false]); // which steps' pictures are on screen
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
    /* stacked: each picture plays its scene once it is well on screen */
    const ioMedia = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const i = Number((e.target as HTMLElement).dataset.i);
          setSeen((s) => (s[i] === e.isIntersecting ? s : s.map((v, j) => (j === i ? e.isIntersecting : v))));
        }),
      { threshold: 0.5 },
    );
    root.querySelectorAll('.why-story-media').forEach((el) => ioMedia.observe(el));
    const mq = window.matchMedia('(max-width: 900px)');
    const onMq = () => setStacked(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => {
      ioStep.disconnect();
      ioRoot.disconnect();
      ioMedia.disconnect();
      mq.removeEventListener('change', onMq);
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
            {numbered && (
              <p className="why-eyebrow why3-kicker">
                Reason {i + 1} of {three.length}
              </p>
            )}
            <h3>{p.title}</h3>
            <p className="why-story-body">{p.body}</p>
            {numbered && (
              <>
                <ul className="why3-points">
                  {REASON_POINTS[p.key]?.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            )}
            {/* stacked (≤900px): this step's picture, under its text */}
            <div className="why-story-media" data-i={i}>
              {stacked && (
                <div className="why-stage">
                  <Scene p={p} open inView={seen[i]} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {!stacked && (
        <div className="why-story-visual">
          {/* version 3: the picture's caption, the same reason as the open step */}
          {numbered && (
            <div className="why3-caption" aria-hidden="true">
              <span className="why3-caption-text">
                {three.map((p, i) => (
                  <span key={p.key} className={i === active ? 'is-active' : undefined}>
                    <b>Reason {i + 1}</b> · {p.title}
                  </span>
                ))}
              </span>
            </div>
          )}
          <div className="why-stage">
            {three.map((p, i) => (
              <Scene key={p.key} p={p} open={i === active} inView={inView} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
