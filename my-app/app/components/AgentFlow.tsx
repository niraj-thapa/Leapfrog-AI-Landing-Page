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
  // a half gauge, refined (Oct 8): a wider dial, three ticks, the needle to the high side and its pivot
  'Evaluation agents': <><path d="M2.75 15.5a9.25 9.25 0 0 1 18.5 0" /><path d="M12 6.25v1.75M5.46 8.96l1.24 1.24M18.54 8.96l-1.24 1.24" /><path d="M12 15.5l4-4.75" /><circle cx="12" cy="15.5" r="1.5" /></>, // centred in the tile
  'Operations agents': <><rect x="3.5" y="4" width="17" height="7" rx="2" /><rect x="3.5" y="13" width="17" height="7" rx="2" /><path d="M7.5 7.5h.01M7.5 16.5h.01M11 7.5h3M11 16.5h3" /></>, // servers with status lights: production watched (Oct 8; was a pulse line)
};

/* live today (the first, second and fourth agents) */
const LIVE = new Set(['Review agents', 'Test agents', 'Evaluation agents']);

/* timed as concourse.ai's "Agents built to own the work" (its Lottie, measured Oct 8): each
 * card comes in from a heavy blur to sharp, box and contents together, over 1s on
 * cubic-bezier(0.5, 0, 0, 1) — it reads sharp in ~0.35s and settles — and the next starts
 * 0.4s later; the hairline above a card draws just ahead of it */
const LINE_MS = 180; // the hairline draws …
const CARD_MS = 1000; // … as the card comes in (ag-in)
const NEXT_MS = 400; // the next card starts

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
              ['--card-at' as string]: `${i === 0 ? 0 : at + 80}ms`, // just after its line starts
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
