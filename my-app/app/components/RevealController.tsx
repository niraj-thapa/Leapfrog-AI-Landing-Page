'use client';

import { useEffect, useLayoutEffect } from 'react';
import { splitWords } from '../lib/sqText';

/* "rise" from cube-motion.dev: fade in with a 12px lift over 640ms on
 * cubic-bezier(0.2, 0, 0, 1), siblings staggered 60ms, once, as they enter view
 * (bottom inset 10% of the viewport). Implemented to spec rather than installed:
 * the npm package resolves to a different repo owner than the site credits.
 *
 * Under reduced motion the lift is zeroed in CSS (--rise-lift) so only the
 * opacity change remains. */
const TARGETS = [
  '[data-reveal] > *',
  '.metrics > *',
  '.stage-grid > *',
  '.pillars > *',
  '.results-grid > *',
  /* every group arrives item by item, as the Start focused cards do (Oct 6) */
  '.insight-grid > *',
  '.faq-list > *',
  '.support-list > *',
  '.why-list > *',
  '.why-story-step > *',
  '.why-story-visual',
  '.cs-tabs > *',
  '.cs-card',
  '.compliance > *',
];

/* Grids whose children stagger individually: animating the grid as well would
 * fade everything twice. */
const CONTAINERS = ['.metrics', '.stage-grid', '.pillars', '.results-grid', '.insight-grid', '.faq-list', '.support-list', '.why-list', '.cs-tabs', '.compliance'];

/* Section text, after squareup.com (measured Oct 3 2026, 1440×900):
 *  - headings ("split-text-clip-rise"): split into words; each word starts 100px low
 *    at 20% opacity, clipped by its line (0.5em of slack), and rises home over 1s on
 *    an expo ease-out, words 30ms apart;
 *  - intro text ("rise"): the whole block, 100px low at 20% opacity, home over 1.4s.
 * Both play once, the first time the text's top enters the screen, and then stay.
 * The hero, the Flywheel header and the closing band have their own choreography. */
const SQ_SPLIT = ['#why-title', '#results-title', '#roadmap-title', '#insights-title', '#faq-title', '.story-headline', '.support-title'];
const SQ_RISE = ['.why-head .lead', '.roadmap-head .lead', '.insights-head .lead', '.results-lead', '.commitment'];
const SQ_LIFT = 100; // px

function squareText() {
  const root = document.documentElement;
  const split = SQ_SPLIT.flatMap((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel)));
  const rise = SQ_RISE.flatMap((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel)));
  split.forEach(splitWords);
  rise.forEach((el) => (el.dataset.sqRise = ''));
  root.classList.add('sq-text');
  /* once: revealed the first time it comes into view, then it stays */
  const onEntries = (entries: IntersectionObserverEntry[], io: IntersectionObserver) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (e.target as HTMLElement).classList.add('is-sq-in');
      io.unobserve(e.target);
    });
  /* the rising blocks are measured where they will land, not 100px lower */
  const ioSplit = new IntersectionObserver(onEntries);
  const ioRise = new IntersectionObserver(onEntries, { rootMargin: `0px 0px ${SQ_LIFT}px 0px` });
  split.forEach((el) => ioSplit.observe(el));
  rise.forEach((el) => ioRise.observe(el));
  return () => {
    ioSplit.disconnect();
    ioRise.disconnect();
    root.classList.remove('sq-text');
  };
}

/* A layout effect hides targets before paint; a plain effect flashes them. */
const useBeforePaint = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function RevealController() {
  useBeforePaint(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    /* Section text reveals as squareup.com's does (see SQ_* below); the generic rise
     * covers everything else. A block holding section text hands the rise down to its
     * other children, so nothing animates twice. */
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sqSel = [...SQ_SPLIT, ...SQ_RISE].join(', ');
    const found = new Set<HTMLElement>();
    const expand = (el: HTMLElement) => {
      if (!motion) return void found.add(el);
      if (el.matches(sqSel)) return;
      if (!el.querySelector(sqSel)) return void found.add(el);
      Array.from(el.children).forEach((c) => expand(c as HTMLElement));
    };
    TARGETS.forEach((sel) => document.querySelectorAll<HTMLElement>(sel).forEach(expand));
    CONTAINERS.forEach((sel) => document.querySelectorAll<HTMLElement>(sel).forEach((el) => found.delete(el)));
    const list = Array.from(found);
    const undoSq = motion ? squareText() : () => {};

    const order = new Map<HTMLElement, number>();
    list.forEach((el) => {
      const sibs = Array.from(el.parentElement?.children ?? []).filter((c) => found.has(c as HTMLElement));
      order.set(el, Math.max(0, sibs.indexOf(el)));
      el.setAttribute('data-rise', '');
    });

    /* Above the fold: rise on mount instead of waiting for an intersection. */
    document.querySelectorAll<HTMLElement>('[data-rise-mount]').forEach((el, i) => {
      el.setAttribute('data-rise', '');
      el.style.setProperty('--rise-delay', `${i * 90}ms`);
      requestAnimationFrame(() => el.setAttribute('data-risen', ''));
    });

    const inset = Math.round(window.innerHeight * 0.1);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.setProperty('--rise-delay', `${(order.get(el) ?? 0) * 60}ms`);
          /* an attribute, not a class: React re-renders an element's className (an FAQ
           * item opening, a tab turning active) and would wipe a class it didn't set */
          el.setAttribute('data-risen', '');
          io.unobserve(el);
        });
      },
      { rootMargin: `0px 0px -${inset}px 0px` },
    );
    list.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      undoSq();
    };
  }, []);

  /* the endless loops (the partner marquee, the agents' Live pulse) pause while off screen,
   * so the page isn't animating what nobody can see (.is-offscreen in globals.css, Oct 10) */
  useEffect(() => {
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
    );
    document.querySelectorAll('.marquee, .ag-live-dot').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
