'use client';

import { useEffect, useRef, useState } from 'react';
import { ROADMAP } from '../lib/content';

/* "Start focused" V2 (html[data-roadmap="2"], review button): the four stages as a
 * tabbed media panel, after siteassist.com's "What we do" slider (measured Oct 4 2026).
 * A large rounded photo panel; the stage's timing top-left in mono capitals and its
 * number top-right; the four stages along the bottom, each over a hairline. The open
 * stage shows its description and a line fills its hairline (5s, eased in and out);
 * then the next opens and the photo crossfades. Inactive titles sit at 54%. It plays only
 * while the panel is on screen, holding where it was otherwise; a click opens a stage.
 * Reduced motion: no auto-advance. Photos: Unsplash placeholders (credits in design.md). */

const DWELL = 5000;
const PHOTOS = ['/assets/stages/assess.jpg', '/assets/stages/launch.jpg', '/assets/stages/expand.jpg', '/assets/stages/run.jpg'];
const TONES = ['validate', 'build', 'enable', 'run'];

export default function StageTabs() {
  const stages = ROADMAP.stages;
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.5), { threshold: [0, 0.25, 0.5, 0.75, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const next = () => setActive((a) => (a + 1) % stages.length);
  const playing = inView && !still;
  const s = stages[active];

  return (
    <div ref={ref} className={`stage-tabs${playing ? ' is-playing' : ''}`}>
      {stages.map((st, i) => (
        <img key={st.title} className={`stage-tabs-photo${i === active ? ' is-active' : ''}`} src={PHOTOS[i]} alt="" loading="lazy" />
      ))}
      <span className="stage-tabs-shade" aria-hidden="true" />

      <p className="stage-tabs-kicker" aria-live="polite">
        {s.title} · {s.when}
      </p>
      <p className="stage-tabs-count" aria-hidden="true">
        {String(active + 1).padStart(2, '0')}
      </p>

      <div className="stage-tabs-nav" role="tablist" aria-label="Stages">
        {stages.map((st, i) => {
          const open = i === active;
          return (
            <button
              key={st.title}
              type="button"
              role="tab"
              aria-selected={open}
              data-tone={TONES[i]}
              className={`stage-tab${open ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="stage-tab-title">{st.title}</span>
              <span className="stage-tab-detail">
                <span className="stage-tab-body">{st.body}</span>
              </span>
              <span className="stage-tab-rule" aria-hidden="true">
                {open && !still && (
                  <span key={active} className="stage-tab-fill" style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={next} />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
