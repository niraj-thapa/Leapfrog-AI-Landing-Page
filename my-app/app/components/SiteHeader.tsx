'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_HREF, CTA_LABEL, NAV_LINKS, SERVICE_LINKS } from '../lib/content';
import { getLenis } from '../lib/smooth';

/* Floating pill header — Figma node 2050:4612. Motion matched to squareup.com:
 *  - at the top it behaves like Square's static nav: it scrolls away with the page,
 *    1:1, until it is out of view;
 *  - after that it stays out while the visitor scrolls down, and slides back in on
 *    any scroll up — Square's sticky bar curves: in 0.25s cubic-bezier(0, 0, 0.2, 1),
 *    out 0.2s cubic-bezier(0.4, 0, 1, 1), transform only;
 *  - back at the top it reattaches. It stays put while a menu is open, and shows
 *    whenever something inside it has keyboard focus (CSS).
 * Sized as design.lftechnology.com's nav (Oct 8); once the page has scrolled it narrows
 * (.is-compact). Version 2 (html[data-nav="2"], review button) is always on screen. */
const DEADBAND = 6; // px: ignore jitter smaller than this
const WIDTH = 'max-width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)'; // the pill narrowing as the page scrolls (.is-compact)
const SHOW = `transform 0.25s cubic-bezier(0, 0, 0.2, 1), ${WIDTH}`;
const HIDE = `transform 0.2s cubic-bezier(0.4, 0, 1, 1), ${WIDTH}`;

export default function SiteHeader() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  pinnedRef.current = servicesOpen || menuOpen;

  useEffect(() => {
    const header = headerRef.current;
    const inner = innerRef.current;
    if (!header || !inner) return;
    type Mode = 'attached' | 'shown' | 'hidden';
    let mode: Mode = 'attached';
    let lastY = window.scrollY;
    let raf = 0;

    const apply = (y: number) => {
      const h = inner.offsetHeight + 8;
      if (mode === 'attached') {
        inner.style.transition = WIDTH; // follows the scroll 1:1, but still narrows smoothly
        inner.style.transform = y > 0 ? `translate3d(0, ${-Math.min(y, h)}px, 0)` : '';
      } else if (mode === 'shown') {
        inner.style.transition = SHOW;
        inner.style.transform = '';
      } else {
        inner.style.transition = HIDE;
        inner.style.transform = `translate3d(0, ${-h}px, 0)`;
      }
      header.classList.toggle('is-hidden', mode === 'hidden' || (mode === 'attached' && y >= h));
    };

    const update = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      const h = inner.offsetHeight + 8;
      /* once the page has moved, the pill narrows (as design.lftechnology.com's) */
      header.classList.toggle('is-compact', y > 8);
      /* version 2 (html[data-nav="2"], review button): always on screen */
      if (document.documentElement.dataset.nav === '2') {
        mode = 'shown';
        inner.style.transition = SHOW;
        inner.style.transform = '';
        header.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      if (pinnedRef.current) {
        if (mode === 'hidden') mode = 'shown';
      } else if (y <= 0) {
        mode = 'attached';
      } else if (mode === 'attached') {
        if (y >= h) mode = 'hidden'; // scrolled off with the page
      } else if (dy < -DEADBAND) {
        mode = 'shown';
      } else if (dy > DEADBAND) {
        mode = 'hidden';
      }
      if (Math.abs(dy) > DEADBAND || mode === 'attached') lastY = y;
      apply(y);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    /* switching versions in the review panel takes effect at once */
    const mo = new MutationObserver(onScroll);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-nav'] });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* an open menu keeps the header in view */
  useEffect(() => {
    if ((servicesOpen || menuOpen) && innerRef.current && headerRef.current) {
      innerRef.current.style.transition = SHOW;
      innerRef.current.style.transform = '';
      headerRef.current.classList.remove('is-hidden');
    }
  }, [servicesOpen, menuOpen]);

  /* the phone menu fills the screen: the page behind holds still while it is open, and
   * Escape closes it */
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      root.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  /* Close the dropdown on outside click or Escape. */
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setServicesOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [servicesOpen]);

  return (
    <header ref={headerRef} className={`site-header${menuOpen ? ' menu-open' : ''}`}>
      <div ref={innerRef} className="site-header-inner">
        <div className="header-pill">
          <a href="/" className="header-logo" aria-label="Leapfrog AI home">
            <span className="header-logo-mark">
              <img src="/assets/header-logo.svg" alt="" width={126} height={24} />
              {/* the dark header's logo: the wordmark in white, the mark still green */}
              <img src="/assets/header-logo-light.svg" alt="" width={126} height={24} className="header-logo-light" />
            </span>
            {/* "AI" after the wordmark, as design.lftechnology.com's "leapfrog design" (Oct 8) */}
            <span className="header-logo-ai" aria-hidden="true">AI</span>
          </a>

          <nav className="header-nav" aria-label="Main navigation">
            <div className="header-services" ref={menuRef}>
              <button
                type="button"
                className="header-link"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((o) => !o)}
              >
                Services
                <img
                  src="/assets/chevron-down.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={servicesOpen ? 'is-flipped' : undefined}
                />
              </button>
              {servicesOpen && (
                <div className="header-menu">
                  {SERVICE_LINKS.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      onClick={() => setServicesOpen(false)}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="header-link">
                {l.label}
              </a>
            ))}
          </nav>

          <a href={CONTACT_HREF} className="btn-primary header-cta">
            {CTA_LABEL}
          </a>

          <button
            type="button"
            className="header-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              {menuOpen ? (
                <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 7h16M3 11h16M3 15h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

      </div>
      {/* outside the sliding bar (its transform would pin the sheet to it, not the screen) */}
      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" data-lenis-prevent>
          <span className="mobile-menu-label">Services</span>
          {SERVICE_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <span className="mobile-menu-rule" aria-hidden="true" />
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="mobile-menu-foot">
            <a href={CONTACT_HREF} className="btn-primary" onClick={() => setMenuOpen(false)}>
              {CTA_LABEL}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
