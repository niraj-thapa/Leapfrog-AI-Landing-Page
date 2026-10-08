'use client';

import { useState } from 'react';
import { FAQS } from '../lib/content';
import Arrow from './Arrow';

/* Straight answers — Figma node 2050:5450. Heading left (with Expand all / Collapse
 * all under it), stacked white cards right, the first open.
 *
 * Opening and closing follow squareup.com's accordion ("All you need to do it all",
 * /us/en/services, measured Oct 3 2026): the answer grows and folds (0.35s, eased in
 * and out, a beat after the click) while its text fades — in as it opens, out first as
 * it closes — and the plus turns into a minus (both lines rotate half a turn, the
 * upright one shrinking away, 0.4s). Unlike Square's, any number of answers can be open,
 * so "Expand all" can open them together. */
export default function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const allOpen = open.size === FAQS.length;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(FAQS.map((_, i) => i)));

  return (
    <section className="faq" id="answers" aria-labelledby="faq-title" data-theme="light">
      <div className="wrap faq-grid" data-reveal>
        <div className="faq-head">
          <h2 id="faq-title" className="h2 faq-title">
            Straight answers
          </h2>
          <button type="button" className="btn-glass faq-all" aria-controls="faq-list" onClick={toggleAll}>
            <span className={`faq-ic faq-ic--small${allOpen ? ' is-open' : ''}`} aria-hidden />
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className="faq-list" id="faq-list">
          {FAQS.map((f, i) => {
            const isOpen = open.has(i);
            return (
              <div key={f.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => toggle(i)}
                  >
                    <span>{f.q}</span>
                    <span className={`faq-ic${isOpen ? ' is-open' : ''}`} aria-hidden />
                  </button>
                </h3>
                {/* always rendered so it can grow and fold; inert while closed */}
                <div className="faq-answer-wrap" id={`faq-a-${i}`} inert={!isOpen}>
                  <div className="faq-answer-clip">
                    <div className="faq-answer">
                      <p>{f.a}</p>
                      {f.link && (
                        <a href={f.link.href} className="link-arrow">
                          {f.link.label} <Arrow />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
