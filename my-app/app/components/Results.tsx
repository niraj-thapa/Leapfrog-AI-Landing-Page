'use client';

import { useEffect, useRef, useState } from 'react';
import { METRICS, RESULTS_EYEBROW, RESULTS_HEADLINE, RESULTS_LEAD, STORY } from '../lib/content';

/* Client results delivered — after squareup.com's "Keep your business growing"
 * (HomePageV3AudienceMoment, measured Oct 3 2026): a row of full-height photo panels.
 * One panel is open (half the row, no shade) and shows its result at the bottom over a
 * blurred fade — a white rule, the big number, what we did and the links; the others
 * are narrow, shaded 50%, and carry the result's name. Hovering or focusing a panel
 * opens it (flex, 0.4s decelerate); its content follows 0.2–0.3s later. As the row
 * scrolls in, each panel opens out from a 25% inset while its photo settles from 1.2×.
 * Photos: Unsplash (credits in design.md). Module 4 of the brief; the featured story
 * follows. (The industry strip was removed; its line is now the lead under the title.) */

const METRIC_TONES = ['validate', 'build', 'enable', 'accelerate'];

export default function Results() {
  const [active, setActive] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  /* the row's scroll-in reveal ("media-scale"), once */
  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    row.classList.add('is-armed');
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        row.classList.add('is-in');
        io.disconnect();
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(row);
    return () => io.disconnect();
  }, []);

  return (
    <section className="results" id="results" aria-labelledby="results-title" data-theme="dark">
      <div className="wrap" data-reveal>
        <div className="results-head">
          <p className="results-eyebrow">{RESULTS_EYEBROW}</p>
          <h2 id="results-title" className="results-title">
            {RESULTS_HEADLINE}
          </h2>
          <p className="lead results-lead">{RESULTS_LEAD}</p>
        </div>
      </div>

      <div className="growth" ref={rowRef}>
        {METRICS.map((m, i) => {
          const open = i === active;
          return (
            <article
              key={m.value}
              className={`growth-item${open ? ' is-active' : ''}`}
              data-tone={METRIC_TONES[i % METRIC_TONES.length]}
              style={{ ['--k' as string]: i }}
              onMouseEnter={() => setActive(i)}
              aria-label={`${m.value} ${m.label}`}
            >
              <img className="growth-bg" src={m.image} alt="" loading="lazy" />
              {/* the whole panel opens on hover; keyboard users open it with this button */}
              <button
                type="button"
                className="growth-trigger"
                aria-expanded={open}
                aria-controls={`growth-${i}`}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="growth-name">{m.label}</span>
              </button>
              <span className="growth-tag" aria-hidden={!open}>
                {m.industry}
              </span>
              <div className="growth-content" id={`growth-${i}`} aria-hidden={!open}>
                <div className="growth-inner">
                  <hr />
                  <p className="growth-value">{m.value}</p>
                  <div className="growth-foot">
                    <p className="growth-did">
                      <strong>{m.label}.</strong> {m.did}
                    </p>
                    <p className="growth-links">
                      <a href={m.href} tabIndex={open ? 0 : -1}>
                        Case study <span aria-hidden>→</span>
                      </a>
                      <a href={m.serviceHref} className="growth-service" tabIndex={open ? 0 : -1}>
                        How we did it: {m.service}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="wrap" data-reveal>

        {/* Featured story: five beats, with a timeline. */}
        <div className="story">
          <h3 className="story-headline">{STORY.headline}</h3>

          <div className="story-card">
            <div className="story-photo">
              <div className="story-photo-img">
                <img src="/assets/story-portrait.png" alt="" />
              </div>
              <p className="story-who">
                <span>{STORY.person}</span>
                <i aria-hidden />
                <small>{STORY.role}</small>
              </p>
            </div>

            <div className="story-body">
              <div className="story-logo">
                <img src="/assets/logo-secondlook.svg" alt={STORY.client} width={249} height={36} />
              </div>

              <ol className="story-timeline" aria-label="Timeline">
                {STORY.timeline.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>

              <dl className="story-facts">
                {STORY.beats.map((b) => (
                  <div key={b.k}>
                    <dt>{b.k}</dt>
                    <dd>{b.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="story-foot">
                <a href={STORY.href} className="story-link">
                  Read full story
                  <img src="/assets/arrow-up-right.svg" alt="" width={14} height={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
