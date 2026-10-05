'use client';

import { useEffect, useLayoutEffect } from 'react';

/* Page-level light/dark theme.
 *
 * Sections declare the theme they sit on with data-theme="light" | "dark" and are
 * transparent, so the page background itself is what changes colour. This sets
 * <html data-theme> from scroll position and CSS transitions the background
 * (see "Page theme" in globals.css). Nothing is interpolated per frame.
 *
 * The theme is that of the last section whose top has crossed a line at 90% of
 * the viewport height (set at 60%, Oct 4 — earlier it was 90%, which turned the page as
 * soon as a section peeked in). It used to be early on purpose: when an incoming section has
 * only just appeared, what is still visible of the outgoing one is its bottom
 * edge, which in every case is a card or band with its own surface, so the
 * background can change under it without costing any text legibility. The
 * incoming section's heading sits a full padding below its top edge, so it
 * arrives after the colour has largely settled.
 *
 * First paint is set instantly (no transition), so a reload halfway down the
 * page does not flash. Without JS the sections keep their own backgrounds
 * (the transparent rules only apply under html.js-theme). */
const LINE = 0.6; // was 0.9: the incoming section is ~40% into view before the page turns

const useBeforePaint = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ThemeController() {
  useBeforePaint(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'));
    if (!sections.length) return;

    root.classList.add('js-theme', 'theme-instant');

    let current = '';
    const apply = () => {
      const line = window.innerHeight * LINE;
      let theme = 'light';
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) theme = s.dataset.theme || 'light';
        else break; // document order: everything after this is further down
      }
      if (theme !== current) {
        current = theme;
        root.dataset.theme = theme;
      }
    };

    apply();

    /* Stay instant until the page has loaded and the browser has finished any
     * scroll of its own (a #hash jump or restoring the position on reload), which
     * happens after this effect runs. Otherwise a deep link to a dark section
     * would paint light and then animate to dark. */
    let settle = 0;
    const enableTransitions = () => {
      settle = window.setTimeout(() => root.classList.remove('theme-instant'), 350);
    };
    if (document.readyState === 'complete') enableTransitions();
    else window.addEventListener('load', enableTransitions, { once: true });

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      clearTimeout(settle);
      window.removeEventListener('load', enableTransitions);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.classList.remove('js-theme', 'theme-instant');
      delete root.dataset.theme;
    };
  }, []);

  return null;
}
