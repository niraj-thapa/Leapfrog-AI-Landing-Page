/* Section versions under review — the one place to add them.
 *
 * Each group is a section with alternative designs. The chosen version is written to
 * <html data-{key}="{value}"> (nothing for the first/default version), so a section's
 * CSS and code can follow it with html[data-{key}="…"]. The review button (bottom
 * right, VariantSwitcher) lists every group; choices are remembered per browser
 * (localStorage "variant:{key}") and can be linked with ?{key}={value}. The script
 * from variantScript() runs in <head> and applies them before the first paint.
 *
 * To add a section: add a group here, then style its versions with html[data-{key}]. */

export type VariantOption = { value: string; note: string };
export type VariantGroup = {
  key: string; // the data attribute and URL parameter (letters only)
  label: string; // the section's name in the switcher
  options: VariantOption[]; // the first is the default
  legacy?: string; // an older localStorage key to carry over
};

export const VARIANT_GROUPS: VariantGroup[] = [
  {
    key: 'fw',
    label: 'Flywheel',
    legacy: 'fw-variant',
    options: [
      { value: '1', note: 'Cards around the ring' },
      { value: '2', note: 'Chips, cards in a row below' },
      { value: '3', note: 'Stage list beside the ring' },
      { value: '4', note: 'List, liquid plays through the stages' },
      { value: '5', note: 'Version 4 on a dark ground' },
    ],
  },
  {
    key: 'why',
    label: 'Measured by your outcomes',
    options: [
      { value: '1', note: 'Pillar explorer, picture panel' },
      { value: '2', note: 'Scroll story, sticky index and panel' },
    ],
  },
  {
    key: 'roadmap',
    label: 'Start focused',
    options: [
      { value: '1', note: 'Four stage cards' },
      { value: '2', note: 'Tabbed photo panel' },
    ],
  },
  {
    key: 'talk',
    label: 'Talk to our team',
    legacy: 'talk-variant',
    options: [
      { value: '1', note: 'Ripple rings' },
      { value: '2', note: 'Glass Flywheel' },
    ],
  },
];

export const variantStorageKey = (key: string) => `variant:${key}`;

/** The pre-paint script for <head>: applies the stored or linked versions to <html>. */
export function variantScript() {
  const groups = VARIANT_GROUPS.map((g) => ({ k: g.key, o: g.options.map((o) => o.value), l: g.legacy || '' }));
  return `try{var G=${JSON.stringify(groups)},q=new URLSearchParams(location.search),s=localStorage;G.forEach(function(g){var v=q.get(g.k),sk='variant:'+g.k;if(v&&g.o.indexOf(v)>-1)s.setItem(sk,v);else v=s.getItem(sk)||(g.l&&s.getItem(g.l));if(v&&v!==g.o[0]&&g.o.indexOf(v)>-1)document.documentElement.dataset[g.k]=v})}catch(e){}`;
}
