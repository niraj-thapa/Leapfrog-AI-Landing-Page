import { BADGES } from '../lib/content';

/* The Anthropic mark is a stack of masked layers in the Figma file (node
 * 2050:4703); the structure is reproduced as exported so the artwork is exact. */
export function AnthropicMark() {
  return (
    <span className="anthropic" aria-hidden>
      <span className="anthropic-layer a1">
        <img src="/assets/anthropic-fill-1.svg" alt="" />
      </span>
      <span className="anthropic-layer a2">
        <img src="/assets/anthropic-fill-3.svg" alt="" />
      </span>
      <span className="anthropic-layer a3">
        <img src="/assets/anthropic-fill-4.svg" alt="" />
      </span>
    </span>
  );
}

/* Copies of the badge set in one run of the marquee; enough to be wider than any
 * screen. The track holds two identical runs and slides by exactly one run, so
 * the loop is seamless. */
const COPIES = 3;

/* Credibility marquee — after the client-logo row along the bottom of
 * squareup.com's hero video. The badges ride inside the hero loop (they shrink
 * with it), flat white like Square's logos (the *-mono.svg artwork), in one slow horizontal loop that pauses on hover or focus.
 * Only the first copy of each badge is a reachable link; the repeats are
 * decorative. Each badge links to its partner profile or trust page.
 * Reduced motion: the row holds still and shows each badge once. */
export default function CredibilityMarquee({ tabbable = true }: { tabbable?: boolean }) {
  const run = (copy: number) =>
    Array.from({ length: COPIES }, (_, c) =>
      BADGES.map((b) => {
        const real = copy === 0 && c === 0;
        return (
          <li key={`${copy}-${c}-${b.name}`} className={real ? undefined : 'is-repeat'} aria-hidden={real ? undefined : true}>
            <a
              href={b.href}
              className="badge"
              aria-label={real ? b.name : undefined}
              title={b.name}
              tabIndex={real && tabbable ? 0 : -1}
            >
              <img src={b.mono} alt="" className={`badge-img badge-img--${b.kind}`} />
            </a>
          </li>
        );
      }),
    ).flat();

  return (
    <div className="marquee" role="region" aria-label="Partner credentials">
      {/* a small label over the row, as concourse.ai's "Working with 100+ finance departments" */}
      <p className="marquee-label">100+ AI initiatives</p>
      <ul className="marquee-track">
        {run(0)}
        {run(1)}
      </ul>
    </div>
  );
}
