'use client';

import { useEffect, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { CONTACT } from '../lib/content';

/* The one place a visitor leaves their details. Every "Talk to our team" CTA on
 * the site opens this page; the section 5 links arrive with ?model= set so the
 * working model is pre-selected (and still editable). No backend is wired up:
 * submitting shows the confirmation state only. */
export default function ContactPage() {
  const [model, setModel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get('model');
    if (m && CONTACT.models.some((o) => o.key === m)) setModel(m);
  }, []);

  const toggleInterest = (key: string) =>
    setInterests((cur) => {
      if (key === 'unsure') return cur.includes('unsure') ? [] : ['unsure'];
      const next = cur.filter((k) => k !== 'unsure');
      return next.includes(key) ? next.filter((k) => k !== key) : [...next, key];
    });

  return (
    <>
      <SiteHeader />
      <main className="contact">
        <div className="wrap contact-grid">
          <header className="contact-head">
            <h1 className="contact-title">{CONTACT.headline}</h1>
          </header>

          {sent ? (
            <div className="contact-card contact-done" role="status">
              <h2>Thank you. We have your note.</h2>
              <p>{CONTACT.reply}</p>
              <a href="/" className="btn-primary">
                Back to the home page
              </a>
            </div>
          ) : (
            <form
              className="contact-card"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="field-row">
                <label className="field">
                  <span>Name</span>
                  <input name="name" autoComplete="name" required />
                </label>
                <label className="field">
                  <span>Work email</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
              </div>

              <label className="field">
                <span>Company</span>
                <input name="company" autoComplete="organization" required />
              </label>

              <fieldset className="field">
                <legend>Interests</legend>
                <div className="check-grid">
                  {CONTACT.interests.map((o) => (
                    <label key={o.key} className="check">
                      <input
                        type="checkbox"
                        name="interests"
                        value={o.key}
                        checked={interests.includes(o.key)}
                        onChange={() => toggleInterest(o.key)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="field">
                <span>
                  How would you like to work together? <em>Optional</em>
                </span>
                <select name="model" value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">Select one</option>
                  {CONTACT.models.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Where are you today? <em>Optional</em>
                </span>
                <select name="stage" defaultValue="">
                  <option value="">Select one</option>
                  {CONTACT.stages.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  One sentence about your goal <em>Optional</em>
                </span>
                <textarea name="goal" rows={3} />
              </label>

              <button type="submit" className="btn-primary contact-submit">
                Talk to our team
              </button>
              <p className="contact-reply">{CONTACT.reply}</p>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
