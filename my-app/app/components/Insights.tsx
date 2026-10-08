import { INSIGHTS } from '../lib/content';
import Arrow from './Arrow';

/* Ideas and insights — Figma node 2050:5247. Three resources, each with a
 * thumbnail, a title and a one-line takeaway. */
export default function Insights() {
  return (
    <section className="insights" id="insights" aria-labelledby="insights-title" data-theme="light">
      <div className="wrap" data-reveal>
        <div className="insights-head">
          <div>
            <h2 id="insights-title" className="h2">
              {INSIGHTS.headline}
            </h2>
            <p className="lead lead-muted">{INSIGHTS.intro}</p>
          </div>
        </div>

        <ul className="insight-grid">
          {INSIGHTS.items.map((it) => (
            <li key={it.title}>
              <article className="insight">
                <p className="insight-topic">
                  <span className="conic-dot" aria-hidden />
                  {it.topic}
                </p>
                <a href={it.href} className="insight-thumb" tabIndex={-1} aria-hidden>
                  <img src={it.image} alt="" />
                </a>
                <h3>
                  <a href={it.href}>{it.title}</a>
                </h3>
                <p className="insight-takeaway">{it.takeaway}</p>
                <a href={it.href} className="link-arrow">
                  Read more
                  {/* the circled arrow, inline so it takes the link's brand colour */}
                  <svg className="insight-arrow" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.25" />
                    <path d="M8.58333 5L8.16625 5.4179L10.3771 7.7H4.5V8.3H10.3771L8.16625 10.5719L8.58333 11L11.5 8L8.58333 5Z" fill="currentColor" />
                  </svg>
                </a>
              </article>
            </li>
          ))}
        </ul>

        {/* all insights, under the cards (Oct 8; was beside the heading) */}
        <div className="insights-foot">
          <a href="/insights" className="btn-primary">
            {INSIGHTS.all} <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
