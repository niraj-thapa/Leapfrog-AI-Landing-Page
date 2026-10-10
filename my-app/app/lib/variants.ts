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

export type VariantOption = { value: string; note: string; swatch?: string /* a colour option: shown as a swatch */ };
export type VariantGroup = {
  key: string; // the data attribute and URL parameter (letters only)
  label: string; // the section's name in the switcher
  target?: string; // the section's id: picking a version scrolls there (none: stay put)
  targetOffset?: number; // …this many viewport heights further in (a pinned section's revealed point)
  options: VariantOption[]; // the first is the baseline (no html attribute)
  default?: string; // the version shown until the visitor picks one (else the first)
  legacy?: string; // an older localStorage key to carry over
};

export const VARIANT_GROUPS: VariantGroup[] = [
  {
    key: 'brand',
    label: 'Primary colour',
    options: [
      { value: '1', note: 'Leapfrog green #038E43', swatch: '#038e43' },
      { value: '2', note: 'Deep teal #014841', swatch: '#014841' },
      { value: '3', note: 'Forest green #28775C', swatch: '#28775c' },
    ],
  },
  {
    key: 'font',
    label: 'Body font',
    default: '2', // chosen Oct 10
    options: [
      { value: '1', note: 'Tomato Grotesk' },
      { value: '2', note: 'Geist' },
      { value: '3', note: 'Inter' },
    ],
  },
  {
    key: 'nav',
    label: 'Header',
    options: [
      { value: '1', note: 'Scrolls away, returns on scroll up' },
      { value: '2', note: 'Always sticky' },
    ],
  },
  {
    key: 'fw',
    label: 'Flywheel',
    target: 'flywheel',
    legacy: 'fw-variant',
    default: '6', // chosen Oct 8
    options: [
      { value: '1', note: 'Cards around the ring' },
      { value: '2', note: 'Chips, cards in a row below' },
      { value: '3', note: 'Stage list beside the ring' },
      { value: '4', note: 'List, liquid plays through the stages' },
      { value: '5', note: 'Version 4 on a dark ground' },
      { value: '6', note: 'Version 1, one benefit per card, opens on hover' },
    ],
  },
  {
    key: 'why',
    label: 'Measured by your outcomes',
    target: 'why',
    default: '4', // chosen Oct 8
    options: [
      { value: '1', note: 'Pillar explorer, picture panel' },
      { value: '2', note: 'Scroll story, sticky picture panel' },
      { value: '3', note: 'Scroll story in the page width, reasons 1-2-3' },
      { value: '4', note: 'Version 3, client card upright as Boutique attention' },
    ],
  },
  {
    key: 'results',
    label: 'Client results delivered',
    target: 'results',
    default: '2', // chosen Oct 6
    options: [
      { value: '1', note: 'Photo panels and featured story' },
      { value: '2', note: 'Client stories as tabs' },
    ],
  },
  {
    key: 'roadmap',
    label: 'Start focused',
    target: 'work-together',
    options: [
      { value: '1', note: 'Four stage cards' },
      { value: '2', note: 'Tabbed photo panel' },
    ],
  },
  {
    key: 'faq',
    label: 'Straight answers',
    target: 'answers',
    options: [
      { value: '1', note: 'Heading beside the list' },
      { value: '2', note: 'Heading on top, cards in two columns' },
    ],
  },
  {
    key: 'talk',
    label: 'Talk to our team',
    target: 'talk',
    targetOffset: 0.5, // TalkBand LAND: the scene revealed
    legacy: 'talk-variant',
    options: [
      { value: '1', note: 'Ripple rings' },
      { value: '2', note: 'Glass Flywheel' },
    ],
  },
];

/* the storage key carries a set number: bumping it (Oct 6, the chosen line-up; Oct 8, Flywheel
 * version 6; Oct 8, the sticky header; Oct 10, Geist body) drops earlier choices, so every browser starts from the defaults above */
const SET = '6';
export const variantStorageKey = (key: string) => `variant${SET}:${key}`;
export const defaultValue = (g: VariantGroup) => g.default ?? g.options[0].value;

/** The pre-paint script for <head>: applies the stored or linked versions to <html>. */
export function variantScript() {
  const groups = VARIANT_GROUPS.map((g) => ({ k: g.key, o: g.options.map((o) => o.value), d: defaultValue(g) }));
  return `try{var G=${JSON.stringify(groups)},q=new URLSearchParams(location.search),s=localStorage;G.forEach(function(g){var v=q.get(g.k),sk='variant${SET}:'+g.k;if(v&&g.o.indexOf(v)>-1)s.setItem(sk,v);else v=s.getItem(sk);if(!v||g.o.indexOf(v)<0)v=g.d;if(v!==g.o[0])document.documentElement.dataset[g.k]=v})}catch(e){}`;
}
