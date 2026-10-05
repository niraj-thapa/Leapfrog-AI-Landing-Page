'use client';

import { useEffect, useState } from 'react';
import { OWN_AGENTS } from '../lib/content';

/* "We run it on ourselves" — our five delivery agents, built up the way concourse.ai's
 * Close Agent workflow is (measured frame by frame, Oct 4 2026). Down a column, for each
 * card in turn: the hairline from the card above draws first, then the card arrives —
 * a faint, very wide glow that becomes a bright plain white shape, its contents coming
 * through as the blur clears, sharp at the end and only then its white rim (~0.68s).
 * Nothing moves once placed. It plays each time its pillar opens (no loop): when
 * finished, the stack stays until the pillar closes.
 *
 * Each card, styled as the Real results cards: an icon box on the left, the agent's name
 * on top and what it does below (OWN_AGENTS), a "Live" tag on the agents running today.
 * It starts when its pillar is `open` and on screen (`visible`); closing the pillar
 * resets it for next time. Reduced motion: all five, still. */

const ICONS: Record<string, React.ReactNode> = {
  'Review agents': <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  'Test agents': <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 14h9" /></>,
  'Security agents': <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  'Evaluation agents': <><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-6" /></>,
  'Operations agents': <path d="M3 12h4l3-8 4 16 3-8h4" />,
};

/* live today (the first, second and fourth agents) */
const LIVE = new Set(['Review agents', 'Test agents', 'Evaluation agents']);

const LINE_MS = 280; // the hairline draws …
const CARD_MS = 680; // … then the card arrives
const NEXT_MS = LINE_MS + 560; // the next line starts as this card is nearly sharp

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AgentFlow({ open, visible }: { open: boolean; visible: boolean }) {
  const [started, setStarted] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  /* plays each time the pillar opens (once on screen); stays until it closes */
  useEffect(() => {
    if (!open) setStarted(false);
    else if (visible) setStarted(true);
  }, [open, visible]);

  return (
    <ol className={`ag${started || still ? ' is-playing' : ''}${still ? ' is-still' : ''}`} aria-hidden="true">
      {OWN_AGENTS.map((a, i) => {
        const at = i * NEXT_MS; // when this card's line starts
        return (
          <li
            key={a.lead}
            className="ag-card"
            style={{
              ['--line-at' as string]: `${at}ms`,
              ['--card-at' as string]: `${i === 0 ? 0 : at + LINE_MS}ms`,
              ['--line-ms' as string]: `${LINE_MS}ms`,
              ['--card-ms' as string]: `${CARD_MS}ms`,
            }}
          >
            <span className="ag-box">
              <span className="af-icon">
                <svg viewBox="0 0 24 24">{ICONS[a.lead]}</svg>
              </span>
              <span className="ag-text">
                <strong>{a.lead}</strong>
                <span>{sentence(a.rest)}</span>
              </span>
              {LIVE.has(a.lead) && (
                <span className="af-tag ag-live">
                  <span className="ag-live-dot" />
                  Live
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* for screen readers: the same agents as a sentence */
export const AGENT_FLOW_TEXT = OWN_AGENTS.map((a) => `${a.lead}${LIVE.has(a.lead) ? ' (live today)' : ''} ${a.rest}`).join(' ');
