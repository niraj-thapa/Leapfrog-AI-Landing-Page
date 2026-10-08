'use client';

import { useEffect, useRef, useState } from 'react';
import ClientStories from './ClientStories';
import { METRICS, RESULTS_EYEBROW, RESULTS_HEADLINE, RESULTS_LEAD, STORY } from '../lib/content';
import Arrow from './Arrow';

/* Client results delivered — after squareup.com's "Keep your business growing"
 * (HomePageV3AudienceMoment, measured Oct 3 2026): a row of full-height photo panels.
 * One panel is open (half the row, no shade) and shows its result at the bottom over a
 * blurred fade — a white rule, then the big number and what we did as one group with
 * the case study link to its right; the client's logo sits top right; the others
 * are narrow, shaded 50%, and carry the result's name. Hovering or focusing a panel
 * opens it (flex, 0.4s decelerate); its content follows 0.2–0.3s later. As the row
 * scrolls in, each panel opens out from a 25% inset while its photo settles from 1.2×.
 * Photos: Unsplash (credits in design.md). Module 4 of the brief; the featured story
 * follows. (The industry strip was removed; its line is now the lead under the title.) */

/* HIPAA · SOC 2 · PCI DSS · GDPR — marks from Figma (Vyaguta Dashboard 541:3250), at its sizes */
const COMPLIANCE = [
  { name: 'HIPAA', icon: '/assets/compliance/hipaa.svg', w: 56 },
  { name: 'SOC2', icon: '/assets/partners/soc2-mono.svg', w: 52 }, // the hero marquee's SOC 2 seal
  { name: 'PCI', icon: '/assets/compliance/pci.png', w: 48 },
  { name: 'GDPR', icon: '/assets/compliance/gdpr.png', w: 48 },
];

const METRIC_TONES = ['validate', 'build', 'enable', 'accelerate'];

export default function Results() {
  const [active, setActive] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<HTMLOListElement>(null);

  /* the story's path draws in, segment by segment, once it is on screen */
  useEffect(() => {
    const ol = pathRef.current;
    if (!ol || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ol.classList.add('is-armed');
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        ol.classList.add('is-in');
        io.disconnect();
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(ol);
    return () => io.disconnect();
  }, []);

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
          {/* the lead's first sentence in strong */}
          <p className="lead results-lead">
            <strong>{RESULTS_LEAD.slice(0, RESULTS_LEAD.indexOf('.') + 1)}</strong>
            {RESULTS_LEAD.slice(RESULTS_LEAD.indexOf('.') + 1)}
          </p>
        </div>
      </div>

      {/* version 2 (html[data-results="2"], review button): the client stories as tabs */}
      <div className="results-v2">
        <div className="wrap">
          <ClientStories />
          {/* the compliance standards we work to, under the stories (Figma 541:3250) */}
          <ul className="compliance" aria-label="Compliance">
            {COMPLIANCE.map((c) => (
              <li key={c.name}>
                <span className="compliance-mark">
                  <img src={c.icon} alt="" style={{ width: c.w }} />
                </span>
                <span className="compliance-name">
                  {c.name}
                  <img className="compliance-check" src="/assets/compliance/check.svg" alt="" aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* version 1: the photo panels and the featured story */}
      <div className="results-v1">
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
              {/* a progressive blur along the top, behind the industry tag and the logo */}
              <img className="growth-bg growth-top-blur" src={m.image} alt="" loading="lazy" aria-hidden="true" />
              <span className="growth-top-tint" aria-hidden="true" />
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
              {/* the client, top right, opposite the industry tag */}
              <img className="growth-logo" src={m.logo} alt={m.client} aria-hidden={!open} />
              <div className="growth-content" id={`growth-${i}`} aria-hidden={!open}>
                <div className="growth-inner">
                  <hr />
                  {/* the figure and what we did, as one group; the case study to the right */}
                  <div className="growth-foot">
                    <div className="growth-main">
                      <p className="growth-value">{m.value}</p>
                      <p className="growth-did">
                        <strong>{m.label}.</strong> {m.did}
                      </p>
                    </div>
                    <p className="growth-links">
                      <a href={m.href} tabIndex={open ? 0 : -1}>
                        Case study <Arrow />
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
            {/* one picture: the client's logo along the top and the person along the bottom,
                each on a progressive blur (a blurred copy of the photo, faded in) */}
            <div className="story-photo">
              <img className="story-photo-img" src="/assets/story-portrait.png" alt="" />
              <img className="story-photo-img story-photo-blur" src="/assets/story-portrait.png" alt="" aria-hidden="true" />
              <span className="story-photo-tint" aria-hidden="true" />
              <img className="story-logo" src="/assets/logo-secondlook.svg" alt={STORY.client} width={249} height={36} />
              <p className="story-who">
                <span>{STORY.person}</span>
                <small>
                  {STORY.role}, {STORY.client}
                </small>
              </p>
            </div>

            <div className="story-body">
              {/* the path as four steps: a segment each, filled for the done ones */}
              <ol className="story-timeline" aria-label="Timeline" ref={pathRef}>
                {STORY.timeline.map((t, i) => (
                  <li key={t.k} className={'next' in t && t.next ? 'is-next' : undefined} style={{ ['--i' as string]: i }}>
                    <span className="story-step-k">{t.k}</span>
                    <span className="story-step-v">{t.v}</span>
                  </li>
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
                <a href={STORY.href} className="btn-primary story-link">
                  Read full story
                  <Arrow dir="up-right" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
