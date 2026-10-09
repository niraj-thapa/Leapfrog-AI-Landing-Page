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
 * The badges are not links (Oct 8); each shows its name in a tooltip on hover. Only the first
 * copy of each is named for screen readers; the repeats are decorative.
 * Reduced motion: the row holds still and shows each badge once. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CredibilityMarquee(_props: { tabbable?: boolean }) {
  const run = (copy: number) =>
    Array.from({ length: COPIES }, (_, c) =>
      BADGES.map((b) => {
        const real = copy === 0 && c === 0;
        return (
          <li key={`${copy}-${c}-${b.name}`} className={real ? undefined : 'is-repeat'} aria-hidden={real ? undefined : true}>
            {/* not a link (Oct 8): the badge, named in a small tooltip on hover (CSS), as
                capsulecrm.com's integration icons */}
            <span className="badge" role={real ? 'img' : undefined} aria-label={real ? b.name : undefined} data-tooltip={b.name}>
              <img src={b.mono} alt="" className={`badge-img badge-img--${b.kind}`} />
            </span>
          </li>
        );
      }),
    ).flat();

  return (
    <div className="marquee" role="region" aria-label="Partner credentials">
      <ul className="marquee-track">
        {run(0)}
        {run(1)}
      </ul>
    </div>
  );
}
