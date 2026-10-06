'use client';

import { useEffect, useRef, useState } from 'react';
import { CLIENT_STORIES } from '../lib/content';

/* Client results V2 (html[data-results="2"], review button): the client stories as tabs,
 * after the Figma "Tab Container" (LF AI Landing Page, node 2111:132), styled as the V1
 * featured story card ("From first use case to roadmap").
 *
 * A row of client logos across the top: the open one on white with its logo in colour (or
 * dark ink), the others on a faint glass with their logos in white; a brand-green line
 * fills along the open tab's foot (8s) and then the next story opens. Below, the story
 * card: the person's photo on the left, their name and role along its foot on a
 * progressive blur; on the right their quote, four facts in a 2×2 grid and "Read full
 * story" as the primary button. It plays only while the card is on screen, holds while
 * the pointer is on the card, and a tab click opens that story. Reduced motion: no
 * auto-advance. */

const DWELL = 8000;

export default function ClientStories() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  const [still, setStill] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.4), { threshold: [0, 0.2, 0.4, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !held && !still;
  const next = () => setActive((a) => (a + 1) % CLIENT_STORIES.length);

  return (
    <div ref={ref} className={`cs${playing ? ' is-playing' : ''}`}>
      <div className="cs-tabs" role="tablist" aria-label="Client stories">
        {CLIENT_STORIES.map((c, i) => {
          const open = i === active;
          return (
            <button
              key={c.client}
              type="button"
              role="tab"
              aria-selected={open}
              aria-controls="cs-panel"
              className={`cs-tab${open ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <img src={c.logo} alt={c.client} style={{ ['--lw' as string]: c.logoW }} />
              <span className="cs-tab-rule" aria-hidden="true">
                {open && !still && <span key={active} className="cs-tab-fill" style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={next} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* the story, as the V1 featured story card. Every story is in the card at once, stacked:
          switching crossfades the photos (the new one settling from 1.06×) while the text
          steps out and the new story's quote, facts and button rise in one after another; the
          card keeps the tallest story's height, so nothing below it jumps */}
      <div
        id="cs-panel"
        role="tabpanel"
        className="story-card cs-card"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
      >
        <div className="story-photo">
          {CLIENT_STORIES.map((c, i) => (
            <div key={c.client} className={`cs-shot${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
              <img className="story-photo-img" src={c.photo} alt="" style={{ objectPosition: c.photoPos }} />
              <img className="story-photo-img story-photo-blur cs-photo-blur" src={c.photo} alt="" aria-hidden="true" style={{ objectPosition: c.photoPos }} />
              <span className="story-photo-tint cs-photo-tint" aria-hidden="true" />
              <p className="story-who">
                <span>{c.person}</span>
                <small>{c.role}</small>
              </p>
            </div>
          ))}
        </div>

        <div className="story-body cs-stories">
          {CLIENT_STORIES.map((c, i) => (
            <div key={c.client} className={`cs-story${i === active ? ' is-active' : ''}`} aria-hidden={i !== active} inert={i !== active}>
              <blockquote className="cs-quote">“{c.quote}”</blockquote>
              <dl className="story-facts cs-facts">
                {c.facts.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="story-foot">
                <a href={c.href} className="btn-primary story-link">
                  Read full story
                  <img src="/assets/arrow-up-right.svg" alt="" width={14} height={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
