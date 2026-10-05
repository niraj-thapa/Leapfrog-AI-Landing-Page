import { INSIGHTS } from '../lib/content';

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
          <a href="/insights" className="btn-primary">
            {INSIGHTS.all} <span aria-hidden>→</span>
          </a>
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
                  <img src="/assets/arrow-circle-insight.svg" alt="" width={16} height={16} />
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
