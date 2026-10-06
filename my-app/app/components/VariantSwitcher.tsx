'use client';

import { useEffect, useRef, useState } from 'react';
import { glideTo } from '../lib/glide';
import { VARIANT_GROUPS, defaultValue, variantStorageKey, type VariantGroup } from '../lib/variants';

/* glide to a section's place on the page, where an in-page link would land it (clear of the
 * header, with its own scroll-margin), plus its offset for pinned sections */
function goTo(g: VariantGroup) {
  const el = g.target ? document.getElementById(g.target) : null;
  if (!el) return;
  const pad = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  glideTo(el.getBoundingClientRect().top + window.scrollY - pad + (g.targetOffset ?? 0) * window.innerHeight);
}

/* The review button: a floating button at the bottom right that opens a panel listing
 * every section with versions under review (lib/variants.ts) — pick one and the page
 * switches at once and glides to that section, so the change is in view (colour options
 * stay put). It opens on arrival; the button turns into a × to close it (or Escape). Remove it (and the script in
 * layout.tsx) once the versions are settled. */
export default function VariantSwitcher() {
  const [open, setOpen] = useState(true); // open on arrival; the button (now a ×) or Escape closes it
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  /* what the page is showing (the head script may have applied stored choices) */
  useEffect(() => {
    const root = document.documentElement;
    setChosen(Object.fromEntries(VARIANT_GROUPS.map((g) => [g.key, root.dataset[g.key] || g.options[0].value])));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const pick = (g: VariantGroup, value: string, isDefault: boolean) => {
    const key = g.key;
    const root = document.documentElement;
    if (isDefault) delete root.dataset[key];
    else root.dataset[key] = value;
    try {
      localStorage.setItem(variantStorageKey(key), value);
    } catch {}
    setChosen((c) => ({ ...c, [key]: value }));
    /* let sections re-measure for their new layout */
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('fw:layout'));
      window.dispatchEvent(new CustomEvent('variant-change', { detail: { key, value } }));
      /* once the new version has laid out: take the visitor to it */
      requestAnimationFrame(() => goTo(g));
    });
  };

  const changed = VARIANT_GROUPS.filter((g) => chosen[g.key] && chosen[g.key] !== defaultValue(g)).length;

  return (
    <div ref={rootRef} className="vs">
      {open && (
        <div className="vs-panel" id="vs-panel" data-lenis-prevent role="dialog" aria-label="Section versions">
          <p className="vs-title">Section versions</p>
          {VARIANT_GROUPS.map((g) => (
            <div key={g.key} className="vs-group" role="group" aria-label={g.label}>
              <div className="vs-group-head">
                <span className="vs-label">{g.label}</span>
                <span className="vs-note">{g.options.find((o) => o.value === chosen[g.key])?.note}</span>
              </div>
              <div className="vs-options">
                {g.options.map((o, i) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={chosen[g.key] === o.value}
                    title={o.note}
                    aria-label={o.swatch ? o.note : undefined}
                    className={o.swatch ? 'vs-swatch' : undefined}
                    style={o.swatch ? { ['--sw' as string]: o.swatch } : undefined}
                    onClick={() => pick(g, o.value, i === 0)}
                  >
                    {o.swatch ? <span aria-hidden="true" /> : `V${o.value}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        ref={fabRef}
        type="button"
        className="vs-fab"
        aria-expanded={open}
        aria-controls="vs-panel"
        aria-label={open ? 'Close section versions' : 'Section versions'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3l9 5-9 5-9-5 9-5z" />
            <path d="M3 13l9 5 9-5" />
            <path d="M3 17.5l9 5 9-5" opacity="0.5" />
          </svg>
        )}
        {!open && changed > 0 && <span className="vs-badge" aria-hidden="true">{changed}</span>}
      </button>
    </div>
  );
}
