'use client';

import { useEffect, useRef, useState } from 'react';
import { VARIANT_GROUPS, variantStorageKey } from '../lib/variants';

/* The review button: a floating button at the bottom right that opens a panel listing
 * every section with versions under review (lib/variants.ts) — pick one and the page
 * switches at once. Escape or a click outside closes the panel. Remove it (and the
 * script in layout.tsx) once the versions are settled. */
export default function VariantSwitcher() {
  const [open, setOpen] = useState(false);
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
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const pick = (key: string, value: string, isDefault: boolean) => {
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
    });
  };

  const changed = VARIANT_GROUPS.filter((g) => chosen[g.key] && chosen[g.key] !== g.options[0].value).length;

  return (
    <div ref={rootRef} className="vs">
      {open && (
        <div className="vs-panel" id="vs-panel" role="dialog" aria-label="Section versions">
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
                    onClick={() => pick(g.key, o.value, i === 0)}
                  >
                    V{o.value}
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
        aria-label="Section versions"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 13l9 5 9-5" />
          <path d="M3 17.5l9 5 9-5" opacity="0.5" />
        </svg>
        {changed > 0 && <span className="vs-badge" aria-hidden="true">{changed}</span>}
      </button>
    </div>
  );
}
