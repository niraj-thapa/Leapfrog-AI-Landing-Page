'use client';

import { useEffect } from 'react';
import { glideTo } from '../lib/glide';

/* In-page links (#flywheel, #work-together, …) glide to their section instead of
 * jumping: an eased scroll whose length grows with the distance, landing where the
 * browser would (clear of the header, scroll-padding-top). The address bar is left as it
 * is — no #flywheel added (Oct 8). Modified clicks (new tab etc.) are left alone. */
export default function SmoothAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = decodeURIComponent(a.getAttribute('href')!.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      /* where the browser would land: the header allowance, adjusted by the target's own
       * scroll-margin (the Flywheel cancels it to sit flush with the top) */
      const pad = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
      const top = target.getBoundingClientRect().top + window.scrollY - pad;
      glideTo(top, undefined, () => target.focus({ preventScroll: true }));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
