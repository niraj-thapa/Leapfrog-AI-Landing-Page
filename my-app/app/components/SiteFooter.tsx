import { FOOTER } from '../lib/content';

/* Footer — Figma node 2050:5537. The closing band above it is TalkBand. */
export default function SiteFooter() {
  const [left, services, industries] = FOOTER.columns;
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="wrap">
        <div className="footer-top">
          <a href={FOOTER.root} className="footer-logo" aria-label="Leapfrog">
            <img src="/assets/footer-logo.svg" alt="" width={188} height={36} />
          </a>
          <div className="footer-touch">
            <strong>Get in touch</strong>
            <a href="tel:+18008152044" className="footer-phone">
              <img src="/assets/icon-phone.svg" alt="" width={24} height={20} />
              {FOOTER.phone}
            </a>
            <span>{FOOTER.hours}</span>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            {left.map((g) => (
              <section key={g.title}>
                <h3>{g.title}</h3>
                <ul>
                  {g.links.map((l) => (
                    <li key={l}>
                      <a href={FOOTER.root}>{l}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="footer-col">
            {services.map((g) => (
              <section key={g.title}>
                <h3>{g.title}</h3>
                <ul>
                  {g.links.map((l) => (
                    <li key={l}>
                      <a href={FOOTER.root}>{l}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="footer-col">
            {industries.map((g) => (
              <section key={g.title}>
                <h3>{g.title}</h3>
                <ul>
                  {g.links.map((l, i) => (
                    <li key={l}>
                      <a href={FOOTER.root} className={i > 0 ? 'is-dim' : undefined}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="footer-col">
            <section>
              <h3>Connect with Us</h3>
              <ul className="footer-social">
                {FOOTER.social.map((s) => (
                  <li key={s.label}>
                    <a href={FOOTER.root}>
                      <img src={s.icon} alt="" width={24} height={24} />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <ul className="footer-social footer-initiatives">
              {FOOTER.initiatives.map((s) => (
                <li key={s.label}>
                  <a href={FOOTER.root}>
                    <img src={s.icon} alt="" width={24} height={24} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
