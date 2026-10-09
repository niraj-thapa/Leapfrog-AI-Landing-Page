'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { getLenis, setLenis } from '../lib/smooth';
import { onVirtualScroll } from '../lib/stops';

/* Smooth scrolling (Lenis): wheel and trackpad input is eased into the page's own
 * scroll, so everything that follows window.scrollY (the hero, the ring's flight, the
 * snaps, the theme) simply plays along. Touch keeps the device's native scrolling.
 * Panels that scroll on their own opt out with data-lenis-prevent. Reduced motion:
 * off — plain native scrolling. */
export default function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => {
      if (mq.matches || getLenis()) return;
      const lenis: Lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
        /* the scroll stop at the docked tiles (lib/stops.ts): a hard flick from the hero lands there */
        virtualScroll: (d) => onVirtualScroll(lenis, d.deltaY, d.event),
      });
      setLenis(lenis);
    };
    const stop = () => {
      getLenis()?.destroy();
      setLenis(null);
    };
    const onChange = () => (mq.matches ? stop() : start());
    start();
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      stop();
    };
  }, []);
  return null;
}
