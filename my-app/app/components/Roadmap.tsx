import { CONTACT_HREF, ROADMAP } from '../lib/content';
import StageTabs from './StageTabs';

/* Module 5 — the stage cards reuse the Figma "From early validation to delivery"
 * card grid (node 2050:4954); the working models reuse the Figma "Choose the
 * support you need" layout (node 2050:5063). */
const STAGE_TONES = ['validate', 'build', 'enable', 'run'];

export default function Roadmap() {
  return (
    <section className="roadmap" id="work-together" aria-labelledby="roadmap-title" data-theme="light">
      <div className="wrap" data-reveal>
        <div className="roadmap-head">
          <h2 id="roadmap-title" className="h2">
            {ROADMAP.headline}
          </h2>
          <p className="lead">{ROADMAP.intro}</p>
        </div>

        {/* V2 (html[data-roadmap="2"]): the stages as a tabbed media panel, after siteassist.com */}
        <div className="roadmap-v2">
          <StageTabs />
        </div>

        <ol className="stage-grid roadmap-v1">
          {ROADMAP.stages.map((s, i) => (
            <li key={s.title} className="stage-card" data-tone={STAGE_TONES[i]}>
              <span className="stage-icon">
                <img src={s.icon} alt="" width={28} height={28} />
              </span>
              <h3>{s.title}</h3>
              <p className="stage-when">{s.when}</p>
              <p className="stage-body">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="support">
          <div className="support-photo">
            <img src="/assets/support-team.jpg" alt="" />
          </div>

          <div className="support-copy">
            <h3 className="support-title">{ROADMAP.subhead}</h3>
            <ul className="support-list">
              {ROADMAP.models.map((m, i) => (
                <li key={m.key}>
                  <span className="support-n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{m.title}</h4>
                    <p>{m.body}</p>
                    <a href={`${CONTACT_HREF}?model=${m.key}`} className="link-arrow support-link">
                      Talk to our team <span aria-hidden>→</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
