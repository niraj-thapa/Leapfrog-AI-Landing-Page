/* Leapfrog AI Flywheel: glass pipe edition.
 * Classic scripts only (vendor/three.min.js exposes window.THREE), so the page also works from file://.
 */
/* Flight hand-off (TileFlight.tsx). While active, the ring is drawn wherever the
 * flight puts it — centre (cx, cy) in canvas px, outer diameter `ring` px — with a
 * scroll-driven spin and tilt, at full frame rate even off screen. `wake` restarts
 * the render loop; `ready` is true once the first GL frame has been drawn. */
// one shared object per page (kept on window), so a hot reload of this file during
// development cannot leave TileFlight and the ring talking to two different copies
export const fwFlight = typeof window === 'undefined'
  ? { active: false, cx: 0, cy: 0, ring: 0, spin: 0, tilt: 0, calm: 0, wake: null, ready: false }
  : (window.__fwFlight ??= { active: false, cx: 0, cy: 0, ring: 0, spin: 0, tilt: 0, calm: 0, wake: null, ready: false });
/* calm 0 → 1: the ring as a small tile — no reflections, highlights or glare (they are
 * eased back in as it lands). */

export function initFlywheel(loadThree, opts = {}) {   // (ES modules are strict already)
/* opts.decor: a decorative copy of the ring for elsewhere on the page (the Talk band, V2):
 * it runs in opts.root on opts.canvas, centred on opts.slot, with no labels, cards,
 * connectors, dialog or hero flight; opts.seams === false drops the stage separators,
 * opts.palette sets its backdrop, opts.ringPx(W, H) its size, and opts.pose (read every
 * frame: { scale, spin, tilt }) lets the page move it. */
const decor = !!opts.decor;
const FL = decor ? { active: false, cx: 0, cy: 0, ring: 0, spin: 0, tilt: 0, calm: 0, wake: null, ready: false } : fwFlight;
const cleanups = [];
const on = (t, ev, fn, o) => { if (!t) return; t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };
let disposeGL = null, disposed = false;

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const ORDER = ['validate', 'build', 'enable', 'accelerate', 'run'];
const NAMES = { validate: 'Validate', build: 'Build', enable: 'Enable', accelerate: 'Accelerate', run: 'Run' };

// angle: segment centre on the ring (degrees, counter-clockwise from 3 o'clock, y up)
// jelly: liquid colour · deep: its colour where the pipe is thickest
// bg: [base, cloud A, cloud B, highlight] for the environment behind the ring
const SEC = {
  validate:   { angle: 126,  jelly: '#8A6BFF', deep: '#5A36E8', bg: ['#ECE6FB', '#D4C5FF', '#F4D3F0', '#FBF9FF'] },
  build:      { angle: 54,   jelly: '#3D8BFF', deep: '#1B5FE0', bg: ['#E4EEFB', '#BFD8FF', '#C6EEF8', '#F8FBFF'] },
  enable:     { angle: -18,  jelly: '#1FC77F', deep: '#048F4A', bg: ['#E3F3EA', '#BDEBD1', '#E2F3BF', '#F8FDF9'] },
  accelerate: { angle: -90,  jelly: '#FFB224', deep: '#F07C00', bg: ['#FBEEDD', '#FFD8A3', '#FFCFBC', '#FFFBF5'] },
  run:        { angle: -162, jelly: '#FF5F82', deep: '#D92B57', bg: ['#FAE6EB', '#FFC3D1', '#F7D2EC', '#FFF8FA'] },
};
const NEUTRAL_BG = ['#E8EAEC', '#DCE7E2', '#E4E0EE', '#F7F8F9'];
const TILE_BG = ['#D9DCF6', '#B9E9CF', '#C9C0F5', '#EEF2FF'];   // the ring tile's field: lavender, mint, violet
const NEUTRAL_GLOW = '#FFFFFF';

const DETAILS = {
  validate: { stage: '01 · Validate · AI-Driven Design', headline: 'Know what’s worth building', desc: 'Find the use cases with the biggest payoff and test them with real users before you invest, through AI discovery workshops, working prototypes and AI-augmented research, with designers guiding every result.', proof: 'RAPID workshop: fully funded for qualified AWS accounts', cta: 'Explore AI-Driven Design', href: 'https://design.lftechnology.com/' },
  build: { stage: '02 · Build · AI Solutions', headline: 'Build the AI you can’t buy', desc: 'We start with your goals and build the agents, customer experiences and automations to reach them. Our industry accelerators let you skip months of groundwork, with the integration, controls and compliance daily use demands.', proof: '$12.3M saved annually with an AI-powered platform', cta: 'Explore AI Solutions', href: '/solutions' },
  enable: { stage: '03 · Enable · AI Enablement', headline: 'Put everyday AI to work for your teams', desc: 'We roll out Claude with custom skills, connectors and a redesigned workflow built around how your teams work, then train your champions to scale the next one.', proof: 'Fixed scope, fixed fee, live in 30 days', cta: 'Explore AI Enablement', href: '/enablement' },
  accelerate: { stage: '04 · Accelerate · AI-Native Engineering', headline: 'Help your engineers ship faster', desc: 'Forward-deployed engineers join your team and bring AI best practices to every step of your development lifecycle, from design and coding to AI-driven testing, measured for speed and quality.', proof: '500+ engineers · AI Center of Excellence', cta: 'Explore AI-Native Engineering', href: '/engineering' },
  run: { stage: '05 · Run · AI Managed Services', headline: 'Keep AI reliable as it spreads', desc: 'We monitor, secure and tune your AI in production, including AI built by others, and feed what we learn into the next turn of the wheel.', proof: '[Client example]', cta: 'Explore AI Managed Services', href: '/managed-services' },
  all: { stage: 'Turnkey · The whole flywheel', headline: 'One partner turning the whole wheel', desc: 'We start with a quick win and keep the wheel turning: validating what’s next, building it, getting teams using it, speeding up engineering and running it all against your success metrics. Each turn reaches further across your business.', proof: 'Handpicked delivery lead · executive sponsor', cta: 'Talk through your AI roadmap', href: '/contact' },
};
const EXAMPLES = {
  validate: ['AI discovery and roadmaps', 'Clickable prototypes', 'User research and brand assets'],
  build: ['Industry accelerators', 'Agentic workflows', 'Customer-facing AI assistants'],
  enable: ['Claude rollouts, live in 30 days', 'Custom skills and MCP connectors', 'Role-based training and governance'],
  accelerate: ['Forward-deployed engineers', 'AI-driven test automation', 'AI-accelerated development practices'],
  run: ['Monitoring and evaluation', 'Security, governance and cost control', 'Usage analytics and monthly tuning'],
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const section = opts.root || document.getElementById('flywheel');
const canvas = opts.canvas || document.getElementById('fw-gl');
const modal = decor ? document.createElement('div') : document.getElementById('fw-modal');
const dialog = decor ? document.createElement('div') : document.getElementById('fw-dialog');

// Shared interaction state, read by the WebGL loop every frame.
const state = {
  hot: null,          // hovered / focused stage (panel, label or ring segment)
  sel: null,          // stage whose dialog is open
  seg: null,          // stage currently under the pointer on the ring
  mx: 0.5, my: 0.5,   // pointer position, 0..1 within the section
  pointerIn: false,
  overCanvas: false,
  pointerType: 'mouse',
};

/* ── Hover / selection plumbing. Hover only highlights; the dialog opens on click. ── */

let current = null, lastFocus = null, closing = null;
const isOpen = () => modal.classList.contains('open');
const tagged = k => section.querySelectorAll('[data-k="' + k + '"]');

function setHot(k, on) {
  tagged(k).forEach(el => el.classList.toggle('is-hot', on));
  if (on) state.hot = k; else if (state.hot === k) state.hot = null;
}
function setSel(k) {
  section.querySelectorAll('.is-sel').forEach(el => el.classList.remove('is-sel'));
  state.sel = k;
  if (k) tagged(k).forEach(el => el.classList.add('is-sel'));
}
let flowK = null;
function setFlow(k) {                      // stage the travelling colour is passing through
  if (k === flowK) return;
  if (flowK) tagged(flowK).forEach(el => el.classList.remove('is-flow'));
  flowK = k;
  if (k) tagged(k).forEach(el => el.classList.add('is-flow'));
  // versions 4 and 5 open the matching stage in the list as the colour reaches it (StageList)
  if (k) section.dataset.flow = k; else delete section.dataset.flow;
  if (k) section.dispatchEvent(new CustomEvent('fw:flow', { detail: k }));
}
const enter = k => setHot(k, true);
const leave = k => setHot(k, false);

function fill(k) {
  const d = DETAILS[k];
  for (const f of ['stage', 'headline', 'desc', 'proof', 'cta']) document.getElementById('d-' + f).textContent = d[f];
  const dl = document.getElementById('d-link');
  dl.href = d.href;
  const ext = /^https?:/.test(d.href);
  if (ext) { dl.target = '_blank'; dl.rel = 'noopener noreferrer'; } else { dl.removeAttribute('target'); dl.removeAttribute('rel'); }
  dialog.dataset.k = k;
  const box = document.getElementById('d-ex');
  box.replaceChildren();
  EXAMPLES[k].forEach((t, i) => {
    const e = document.createElement('div');
    e.textContent = t;
    e.className = 'fw-rise';
    e.style.animationDelay = (0.18 + i * 0.07) + 's';
    box.appendChild(e);
  });
  const i = ORDER.indexOf(k);
  document.getElementById('d-prev-l').textContent = NAMES[ORDER[(i + 4) % 5]];
  document.getElementById('d-next-l').textContent = NAMES[ORDER[(i + 1) % 5]];
  [['d-stage', 0.05], ['d-headline', 0.09], ['d-desc', 0.13], ['d-ex-wrap', 0.15]].forEach(([id, dl]) => {
    const el = document.getElementById(id);
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDelay = dl + 's';
  });
}
function open(k) {
  clearTimeout(closing);
  current = k; setSel(k); fill(k);
  if (!isOpen()) {
    lastFocus = document.activeElement;
    modal.hidden = false; void modal.offsetWidth;
    modal.classList.add('open');
    document.body.classList.add('fw-locked');
  }
  document.getElementById('d-close').focus({ preventScroll: true });
}
function close() {
  if (!isOpen()) return;
  modal.classList.remove('open');
  document.body.classList.remove('fw-locked');
  closing = setTimeout(() => { modal.hidden = true; }, 320);
  setSel(null);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
const step = n => open(ORDER[(ORDER.indexOf(current) + n + 5) % 5]);

// choosing a stage on the ring or a card opens its dialog — except in version 3, where
// it opens the stage in the list beside the ring (StageList, fw:pick)
function pick(k) {
  if (listMode()) section.dispatchEvent(new CustomEvent('fw:pick', { detail: k }));
  else open(k);
}
section.querySelectorAll('[data-pick]').forEach(el => {
  const k = el.dataset.pick;
  on(el, 'click', e => { e.preventDefault(); pick(k); });
});
// hover/focus highlighting: cards, chips, ring labels and the version 3 list
section.querySelectorAll('[data-pick], [data-hover]').forEach(el => {
  const k = el.dataset.pick || el.dataset.hover;
  on(el, 'pointerenter', () => enter(k));
  on(el, 'pointerleave', () => leave(k));
  on(el, 'focus', () => setHot(k, true));
  on(el, 'blur', () => setHot(k, false));
});
// "View details" in the version 3 list opens the dialog
section.querySelectorAll('[data-open]').forEach(el => {
  on(el, 'click', e => { e.preventDefault(); open(el.dataset.open); });
});
on(document.getElementById('d-close'), 'click', close);
on(document.getElementById('d-prev'), 'click', () => step(-1));
on(document.getElementById('d-next'), 'click', () => step(1));
on(modal, 'click', e => { if (e.target === modal) close(); });
on(document, 'keydown', e => {
  if (!isOpen()) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'Tab') {
    const f = [...dialog.querySelectorAll('a[href], button')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// decorative copies sit under other content: they follow the pointer over opts.pointerRoot
// (e.g. the whole Talk band), and the whole of it counts as "over the ring's canvas"
const pointerEl = opts.pointerRoot || section;
on(pointerEl, 'pointermove', e => {
  const r = section.getBoundingClientRect();
  state.mx = (e.clientX - r.left) / r.width;
  state.my = (e.clientY - r.top) / r.height;
  state.pointerIn = true;
  state.pointerType = e.pointerType;
  state.overCanvas = decor || e.target === canvas || !!e.target.closest('.ring-label');
});
on(pointerEl, 'pointerleave', () => { state.pointerIn = false; state.overCanvas = false; });

// Panels 01 + 02 sit at the outer edges and rise toward their pills at the top of the ring
// (up to 70% of their height), stopping short of any header line they would overlap.
const head = section.querySelector('.fw-head');
const desktopMq = window.matchMedia('(min-width: 821px)');
function headerFloor(x0, x1) {
  let floor = 0;
  head.querySelectorAll('.fw-title, .fw-pain, .fw-promise').forEach(el => {
    // split headers (TileFlight) are measured by their words' clips, which never move
    const words = el.querySelectorAll('.sq-w');
    const range = document.createRange();
    range.selectNodeContents(el);
    for (const r of words.length ? [...words].map(w => w.getBoundingClientRect()) : range.getClientRects()) {
      if (r.width > 0 && r.right > x0 - 12 && r.left < x1 + 12) floor = Math.max(floor, r.bottom + 14);
    }
  });
  return floor;
}
function liftPanels() {
  if (decor) return;
  const P = k => section.querySelector('.panel[data-k="' + k + '"]');
  const pairs = [[P('validate'), P('build')], [P('run'), P('enable')]];
  pairs.flat().forEach(p => { p.style.top = ''; p.style.minHeight = ''; });
  if (!desktopMq.matches || chipsMode() || listMode()) return;   // version 2: the cards sit in a row below
  // mirror the two sides: each left/right pair shares one height…
  pairs.forEach(pair => {
    const h = Math.max(...pair.map(p => p.getBoundingClientRect().height));
    pair.forEach(p => { p.style.minHeight = Math.ceil(h / uiZoom(p)) + 'px'; });   // px inside a zoomed panel are scaled
  });
  // …and 01 + 02 rise by the same amount (the most both can take without touching the header)
  const lift = Math.min(...pairs[0].map(p => {
    const r = p.getBoundingClientRect();
    return Math.max(0, Math.min(r.height * 0.7, r.top - headerFloor(r.left, r.right)));
  }));
  pairs[0].forEach(p => { p.style.top = -Math.round(lift / uiZoom(p)) + 'px'; });
}
// version 2 (html[data-fw="2"], review button): chips around the ring, cards in a row below
function chipsMode() { return document.documentElement.dataset.fw === '2'; }
// versions 3–5: the stages as a list beside the ring (no cards, chips or connectors);
// 4 and 5 play the liquid from stage to stage on their own, 5 on a dark ground
function listMode() { const v = document.documentElement.dataset.fw; return v === '3' || v === '4' || v === '5'; }
function autoMode() { const v = document.documentElement.dataset.fw; return v === '4' || v === '5'; }
// version 5 is dark while the page is (the page theme follows the section in view), so it
// turns light with the rest of the page as the next, light section takes over
function darkMode() { const r = document.documentElement; return !!opts.dark || (!decor && r.dataset.fw === '5' && r.dataset.theme === 'dark'); }
function uiZoom(el) { return parseFloat(getComputedStyle(el).zoom) || 1; }
on(window, 'resize', liftPanels);
const layoutTimer = setTimeout(() => { liftPanels(); window.dispatchEvent(new Event('fw:layout')); }, 1000);
cleanups.push(() => clearTimeout(layoutTimer));   // after the entrance animation settles
if (document.fonts) document.fonts.ready.then(() => { if (!disposed) liftPanels(); });
liftPanels();

requestAnimationFrame(() => { if (!disposed) section.classList.add('is-ready'); });

/* ── WebGL ────────────────────────────────────────────────────────────────
 * Three passes per frame, sized for a light GPU budget:
 *   1. backdrop → rtBg    (≈30% res; soft by design)
 *   2. water    → rtScene (60% res, MSAA): backdrop + the water channel + bubbles
 *   3. screen   : backdrop + thick glass ring refracting rtScene with dispersion
 * The water is one continuous stream running clockwise. Colour is a dye field over
 * the ring: nearly clear at rest, a slow wave carries colour from stage to stage,
 * and the hovered stage floods with its colour.
 */

Promise.resolve()
  .then(loadThree)
  .then(THREE => {
    if (disposed) return;
    disposeGL = startGL(THREE);
  })
  .catch(err => {
    console.error('[flywheel] WebGL disabled:', err);
    section.classList.add('no-gl');
  });

function startGL(THREE) {
  THREE.ColorManagement.enabled = false;

  const slot = opts.slot || document.getElementById('fw-slot');
  // decorative: no connectors or labels — detached stand-ins keep the rest of the code as is
  const linksSvg = decor ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.getElementById('fw-links');
  const labels = {};
  if (decor) ORDER.forEach(k => { labels[k] = document.createElement('span'); });
  else section.querySelectorAll('.ring-label').forEach(b => { labels[b.dataset.k] = b; });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' });
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  let running = true;
  on(canvas, 'webglcontextlost', e => { e.preventDefault(); section.classList.add('no-gl'); running = false; });

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  const rtOpts = { depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false };
  const rtBg = new THREE.WebGLRenderTarget(4, 4, rtOpts);
  const rtScene = new THREE.WebGLRenderTarget(4, 4, { ...rtOpts, depthBuffer: true, samples: 4 });

  // Ring: a glass pipe with a softly squared cross-section (superellipse), water tube inside.
  const RM = 1.22;                  // centre-line radius
  const GA = 0.38, GB = 0.2415, GE = 11;   // option 2: polo-mint glass: flat faces, straight walls, small rounded edges (+15% depth)
  const WC = RM + 0.05;                    // water tube sits slightly outward: refraction at the inner rim
  const WA = 0.22, WB = 0.144, WE = 4.5;   // otherwise swallows the inner wall, so it gets more glass
  const RI = RM - GA, RO = RM + GA;
  const T = GB;
  const C0 = WC - WA, C1 = WC + WA;
  const R_OUT = RO;

  const U = {
    time: { value: 0 },
    flow: { value: 0 },                              // accumulated flow phase (radians, clockwise)
    aspect: { value: 1 },
    res: { value: new THREE.Vector2(1, 1) },
    resScene: { value: new THREE.Vector2(1, 1) },
    refract: { value: new THREE.Vector2(0.05, 0.05) },
  };

  const NOISE2 = /* glsl */`
    float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
      return v;
    }`;
  const NOISE3 = /* glsl */`
    float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float n3(vec3 x) {
      vec3 i = floor(x), f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }
    float fbm3(vec3 p) { return 0.55 * n3(p) + 0.3 * n3(p * 2.03 + 7.1) + 0.15 * n3(p * 4.01 + 3.7); }`;
  const FS_VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const fsQuad = mat => { const m = new THREE.Mesh(quadGeo, mat); m.frustumCulled = false; m.renderOrder = -10; return m; };
  const C = hex => new THREE.Color(hex);

  /* dark grounds (version 5): night with each stage's colour mixed in */
  const NIGHT = '#0d1411';
  const mixHex = (a, b, t) => '#' + C(a).lerp(C(b), t).getHexString();
  const DARK_NEUTRAL = [NIGHT, '#12301f', '#1a1830', '#1f3328'];
  const PAL0 = opts.palette || (darkMode() ? DARK_NEUTRAL : NEUTRAL_BG);   // the first frame's backdrop (no light flash on a dark ground)
  const DARK_SEC = Object.fromEntries(ORDER.map(k => [k, [NIGHT, mixHex(NIGHT, SEC[k].deep, 0.3), mixHex(NIGHT, SEC[k].jelly, 0.2), mixHex(NIGHT, SEC[k].jelly, 0.34)]]));

  /* 1 · Backdrop */
  const bgU = {
    uTime: U.time, uAspect: U.aspect,
    uBase: { value: C(PAL0[0]) }, uB1: { value: C(PAL0[1]) }, uB2: { value: C(PAL0[2]) }, uB3: { value: C(PAL0[3]) },
    uGlow: { value: C(NEUTRAL_GLOW) }, uGlowAmt: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uRing: { value: new THREE.Vector4(0.5, 0.45, 0.25, 0) },
    uDye: { value: C('#ffffff') }, uDyeAmt: { value: 0 },
    uActPt: { value: new THREE.Vector2(0.5, 0.5) }, uActAmt: { value: 0 },
    uPrism: { value: 0 }, uPrismGeo: { value: new THREE.Vector3(1.2, 0.4, 0.0) },   // start, length, sideways shift
    uDark: { value: darkMode() ? 1 : 0 },   // decorative on a dark band: the edges fade to the base, not to white
  };
  const bgScene = new THREE.Scene();
  bgScene.add(fsQuad(new THREE.ShaderMaterial({
    uniforms: bgU, depthTest: false, depthWrite: false, vertexShader: FS_VERT,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      uniform float uTime, uAspect, uGlowAmt, uDyeAmt, uActAmt, uPrism, uDark;
      uniform vec3 uPrismGeo;
      uniform vec2 uActPt;
      uniform vec3 uBase, uB1, uB2, uB3, uGlow, uDye;
      uniform vec2 uMouse;
      uniform vec4 uRing;
      ${NOISE2}
      void main() {
        vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
        float t = uTime * 0.11;
        vec2 w = vec2(fbm(p * 1.15 + vec2(t, -t * 0.7)), fbm(p * 1.15 + vec2(4.1 - t * 0.8, 1.7 + t)));
        vec2 q = p + (w - 0.5) * 1.25;
        vec2 c1 = vec2(-0.42 * uAspect + 0.2 * sin(t * 1.7), 0.12 + 0.16 * cos(t * 1.3));
        vec2 c2 = vec2( 0.40 * uAspect + 0.2 * cos(t * 1.4), -0.10 + 0.18 * sin(t * 1.1));
        vec2 c3 = vec2( 0.08 * uAspect + 0.3 * sin(t * 0.9), -0.46 + 0.12 * cos(t * 1.6));
        vec2 c4 = vec2(-0.10 * uAspect + 0.25 * cos(t * 0.8), 0.46 + 0.06 * sin(t * 1.9));
        vec3 col = uBase;
        col = mix(col, uB1, 0.95 * smoothstep(0.95, 0.0, length(q - c1)));
        col = mix(col, uB2, 0.9 * smoothstep(0.9, 0.0, length(q - c2)));
        col = mix(col, uB1, 0.6 * smoothstep(0.7, 0.0, length(q - c3)));
        col = mix(col, uB3, 0.85 * smoothstep(0.75, 0.0, length(q - c4)));
        float f = fbm(q * 2.0 + vec2(t * 1.6, -t));
        col = mix(col, uB3, smoothstep(0.58, 0.85, f) * 0.45);
        col *= 0.955 + 0.075 * smoothstep(0.2, 0.8, f);
        vec2 m = vec2((vUv.x - uMouse.x) * uAspect, vUv.y - uMouse.y);
        col = mix(col, uGlow, uGlowAmt * 0.4 * exp(-dot(m, m) * 4.0));
        // soft coloured light the glowing water spills onto the wall
        vec2 d = vec2((vUv.x - uRing.x) * uAspect, vUv.y - uRing.y) / uRing.z;
        float rr = length(d + vec2(0.03, 0.08));
        col = mix(col, mix(col, uDye, 0.5), uDyeAmt * 0.45 * exp(-pow((rr - 0.78) / 0.32, 2.0)));

        // light from the upper right: soft shadow and a focused caustic fall to the lower left behind the ring
        vec2 ds = d + vec2(0.16, 0.2);
        float rs = length(ds);
        col *= 1.0 - 0.07 * exp(-pow((rs - 0.8) / 0.22, 2.0));
        col += mix(uDye, vec3(1.0), 0.45) * 0.07 * (0.4 + 0.6 * uDyeAmt) * exp(-pow((rs - 0.62) / 0.06, 2.0)) * smoothstep(0.2, -0.6, ds.x + ds.y);

        // keep colour where the action is; fade to white toward the edges
        vec2 dc = vec2((vUv.x - uRing.x) * uAspect, vUv.y - uRing.y);
        float centreMask = exp(-dot(dc, dc) / pow(uRing.z * 2.3, 2.0));
        vec2 da = vec2((vUv.x - uActPt.x) * uAspect, vUv.y - uActPt.y);
        float actMask = exp(-dot(da, da) / pow(uRing.z * 1.5, 2.0)) * uActAmt;
        float keep = clamp(centreMask * 0.9 + actMask * 0.6, 0.0, 1.0);
        col = mix(mix(mix(uB3, vec3(1.0), 0.55), uBase, uDark), col, keep);

        // light from the upper right, split by the thick glass, lands lower left as a faint spectrum
        {
          vec2 dir = normalize(vec2(-0.62, -1.0));                   // away from the light, onto open floor below-left
          float along = dot(d, dir), perp = dot(d, vec2(-dir.y, dir.x)) - uPrismGeo.z;
          // a gap after the ring (it floats above the surface), then a short cast that drifts with the tilt
          float s0 = uPrismGeo.x, len = uPrismGeo.y;
          float k = clamp((along - s0) / len, 0.0, 1.0);
          float spread = 0.16 + 0.1 * k;                                // wider band, fanning out as it travels
          float pm = smoothstep(s0, s0 + len * 0.35, along) * (1.0 - smoothstep(s0 + len * 0.55, s0 + len, along)) * exp(-pow(perp / spread, 2.0));
          pm *= 0.85 + 0.15 * sin(uTime * 0.9 + along * 6.0);           // a little shimmer, as if through moving water
          vec3 spec = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + perp / spread * 0.42 + 0.12));
          vec3 pastel = mix(spec, vec3(1.0), 0.45);                     // light, low-saturation spectrum
          vec3 lit = 1.0 - (1.0 - col) * (1.0 - pastel * 0.62);          // it lightens the floor, like light does
          col = mix(col, lit, clamp(pm * uPrism, 0.0, 1.0) * 0.78);      // +30% visibility
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  })));

  // revolve a superellipse |x/a|^e + |z/b|^e = 1 (centred at radius rc) around the z axis
  function revolve(rc, a, b, e, segs, np) {
    const prof = [];
    for (let j = 0; j <= np; j++) {
      const t = j / np * TAU, c = Math.cos(t), sn = Math.sin(t);
      const pc = Math.sign(c) * Math.pow(Math.abs(c), 2 / e), ps = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / e);
      let nx = Math.sign(pc) * Math.pow(Math.abs(pc), e - 1) / a, nz = Math.sign(ps) * Math.pow(Math.abs(ps), e - 1) / b;
      const l = Math.hypot(nx, nz) || 1;
      prof.push([rc + a * pc, b * ps, nx / l, nz / l]);
    }
    const n = prof.length;
    const pos = new Float32Array((segs + 1) * n * 3), nor = new Float32Array((segs + 1) * n * 3), idx = [];
    for (let s = 0; s <= segs; s++) {
      const ph = s / segs * TAU, cp = Math.cos(ph), sp = Math.sin(ph);
      for (let j = 0; j < n; j++) {
        const [r, z, nr, nz] = prof[j], o = (s * n + j) * 3;
        pos[o] = r * cp; pos[o + 1] = r * sp; pos[o + 2] = z;
        nor[o] = nr * cp; nor[o + 1] = nr * sp; nor[o + 2] = nz;
      }
    }
    for (let s = 0; s < segs; s++) for (let j = 0; j < n - 1; j++) {
      const a0 = s * n + j, b0 = a0 + n;
      idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setIndex(idx);
    return g;
  }

  /* 2 · Water */
  const waterScene = new THREE.Scene();
  waterScene.add(fsQuad(new THREE.ShaderMaterial({
    uniforms: { uBg: { value: rtBg.texture } }, depthTest: false, depthWrite: false, vertexShader: FS_VERT,
    fragmentShader: `varying vec2 vUv; uniform sampler2D uBg; void main() { gl_FragColor = texture2D(uBg, vUv); }`,
  })));
  const ringW = new THREE.Group();
  waterScene.add(ringW);

  const cursorL = new THREE.Vector3(9, 9, 0);
  const segCols = ORDER.map(k => C(SEC[k].jelly));
  const segAng = ORDER.map(k => SEC[k].angle * DEG);
  const waterU = {
    uBg: { value: rtBg.texture }, uRes: U.resScene, uRefract: U.refract, uTime: U.time, uFlow: U.flow, uFlowBase: { value: 0.26 },
    uSegCol: { value: segCols }, uSegAng: { value: segAng },
    uAct: { value: [0, 0, 0, 0, 0] },
    uWaveAng: { value: 0 }, uWaveAmt: { value: 0 },
    uCursor: { value: cursorL }, uCursorAmt: { value: 0 },
    uC0: { value: C0 }, uC1: { value: C1 },
  };
  const isSmallW = window.matchMedia('(max-width: 820px)').matches;
  const water = new THREE.Mesh(revolve(WC, WA, WB, WE, isSmallW ? 160 : 240, 40), new THREE.ShaderMaterial({
    uniforms: waterU, transparent: true,
    vertexShader: /* glsl */`
      varying vec3 vL, vN, vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vL = position; vN = normalize(normalMatrix * normal); vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      #define PI 3.14159265
      uniform sampler2D uBg; uniform vec2 uRes, uRefract;
      uniform float uTime, uFlow, uFlowBase, uWaveAng, uWaveAmt, uCursorAmt, uC0, uC1;
      uniform vec3 uSegCol[5], uCursor;
      uniform float uSegAng[5], uAct[5];
      varying vec3 vL, vN, vV;
      ${NOISE3}
      float angDist(float a, float b) { return abs(mod(a - b + PI, 2.0 * PI) - PI); }
      // one layer of the liquid pattern, displaced along the ring by 'disp' (radians, clockwise)
      void liquidLayer(float th, float u, float disp, vec3 seed, out float n, out float wv, out float ribbon, out float ridge, out float trough) {
        float A = th + disp;
        vec3 q = vec3(cos(A) * 1.9, sin(A) * 1.9, u * 3.4) + seed;
        wv = fbm3(q * 0.7 + vec3(0.0, 0.0, uTime * 0.08));
        n = fbm3(q + vec3(wv * 1.6, -wv * 1.2, uTime * 0.05));
        float ph = A * 3.0 + u * 4.2 + wv * 2.6 + n * 1.4;
        ribbon = smoothstep(-0.35, 0.9, sin(ph));
        // bright ribbon edges: each one has its own strength, swelling and fading as it travels
        float vary = smoothstep(0.32, 0.78, fbm3(vec3(cos(A) * 2.3, sin(A) * 2.3, uTime * 0.11) + seed * 1.7));
        ridge = pow(1.0 - abs(sin(ph * 0.5 + 0.8)), 10.0) * (0.25 + 1.1 * vary);
        trough = pow(1.0 - abs(sin(ph * 0.5 - 0.4)), 12.0);
      }
      void main() {
        float rho = length(vL.xy), th = atan(vL.y, vL.x);
        float u = clamp((rho - uC0) / (uC1 - uC0), 0.0, 1.0);
        vec3 nn = normalize(vN), vv = normalize(vV);
        float ndv = clamp(dot(nn, vv), 0.0, 1.0);
        float prof = pow(ndv, 0.75);                                 // longer path through the middle of the tube

        // the liquid is carried by an uneven flow field, not rotated as one piece:
        //  · faster in the middle of the tube, slower against the glass (shear)
        //  · slow surges that drift along the ring, so some stretches run ahead of others
        // two staggered layers are advected through it and cross-faded, so the pattern keeps re-forming
        float shear = 0.45 + 1.1 * 4.0 * u * (1.0 - u);
        float surge = 0.55 + 0.9 * n3(vec3(cos(th) * 1.3, sin(th) * 1.3, uTime * 0.06));
        float vel = uFlowBase * shear * surge;
        const float P = 5.0;
        float t0 = fract(uTime / P), t1 = fract(uTime / P + 0.5);
        float w0 = 1.0 - abs(2.0 * t0 - 1.0), w1 = 1.0 - w0;
        float n0, wv0, rb0, rg0, tr0, n1, wv1, rb1, rg1, tr1;
        liquidLayer(th, u, vel * t0 * P, vec3(0.0), n0, wv0, rb0, rg0, tr0);
        liquidLayer(th, u, vel * t1 * P, vec3(7.3, 2.1, 4.7), n1, wv1, rb1, rg1, tr1);
        float n = n0 * w0 + n1 * w1, wv = wv0 * w0 + wv1 * w1;
        float ribbon = rb0 * w0 + rb1 * w1, ridge = rg0 * w0 + rg1 * w1, trough = tr0 * w0 + tr1 * w1;
        float streak = pow(1.0 - abs(n * 2.0 - 1.0), 5.0);           // thin bright filaments

        // dye: colour blends smoothly between stages; activation from hover + the travelling wave
        float thd = th + (n - 0.5) * 0.45;                           // dye front has fingers
        vec3 dye = vec3(0.0); float ws = 0.0, act = 0.0;
        for (int i = 0; i < 5; i++) {
          float d = angDist(thd, uSegAng[i]);
          float w = exp(-d * d * 7.0); dye += uSegCol[i] * w; ws += w;
          act = max(act, uAct[i] * (1.0 - smoothstep(0.48, 0.78, d)));
        }
        dye /= max(ws, 1e-3);
        float dw = angDist(thd, uWaveAng);
        act = max(act, uWaveAmt * exp(-dw * dw / 0.2));
        act = clamp(act * (0.85 + 0.35 * n), 0.0, 1.0);

        // refraction wobble through moving water
        vec2 uv = gl_FragCoord.xy / uRes;
        vec2 off = refract(-vv, nn, 1.0 / 1.33).xy * uRefract * 0.55 + (vec2(n, wv) - 0.5) * uRefract * 0.6 * prof;
        vec3 back = texture2D(uBg, uv + off).rgb;

        float dens = prof * (0.55 + 0.45 * n) * (0.55 + 0.45 * ribbon);
        // neighbouring stage colours swirl together as pastel ribbons at rest
        vec3 pastel = mix(vec3(1.0), dye, 0.3);                       // water at rest: ~10% colour, reads as water
        vec3 tint = mix(pastel, dye * dye * 0.75 + dye * 0.25, act);
        vec3 col = back * mix(vec3(1.0), tint, clamp(dens * (0.5 + 0.85 * act), 0.0, 0.96));
        col += mix(dye, vec3(1.0), 0.25) * act * (0.12 * dens + 0.5 * streak * prof);    // light carried in the dye
        col += vec3(1.0) * (ridge * 0.26 + streak * 0.035) * prof * (1.0 - 0.5 * act);   // flowing highlights
        col *= 1.0 - trough * 0.1 * prof;                                                // and their darker folds

        // round volume: lit from the upper left, a soft sheen on the water surface
        vec3 Lk = normalize(vec3(0.45, 0.65, 0.62));                 // lit from the upper right (same light as the glare)
        col *= mix(0.86, 1.05, dot(nn, Lk) * 0.5 + 0.5);
        col += vec3(1.0) * pow(max(dot(nn, normalize(Lk + vv)), 0.0), 60.0) * 0.18;
        float dc = length(vL.xy - uCursor.xy);
        col += mix(dye, vec3(1.0), 0.4) * uCursorAmt * exp(-dc * dc * 9.0) * 0.3 * prof;
        gl_FragColor = vec4(col, smoothstep(0.0, 0.35, ndv));       // soft silhouette, no hard edge on the glass
      }`,
  }));
  ringW.add(water);

  /* Bubbles ride the current where the water is coloured */
  const isSmall = window.matchMedia('(max-width: 820px)').matches;
  const NB = isSmall ? 40 : 72;
  const bPos = new Float32Array(NB * 3), bSize = new Float32Array(NB), bAlpha = new Float32Array(NB), bGlow = new Float32Array(NB), bTint = new Float32Array(NB * 3);
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3).setUsage(THREE.DynamicDrawUsage));
  bGeo.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1).setUsage(THREE.DynamicDrawUsage));
  bGeo.setAttribute('aAlpha', new THREE.BufferAttribute(bAlpha, 1).setUsage(THREE.DynamicDrawUsage));
  bGeo.setAttribute('aGlow', new THREE.BufferAttribute(bGlow, 1).setUsage(THREE.DynamicDrawUsage));
  bGeo.setAttribute('aTint', new THREE.BufferAttribute(bTint, 3).setUsage(THREE.DynamicDrawUsage));
  const bubbleU = { uPx: { value: 100 }, uCamZ: { value: 7 }, uScale: { value: 1 } };
  const bubbles = new THREE.Points(bGeo, new THREE.ShaderMaterial({
    uniforms: bubbleU, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: /* glsl */`
      attribute float aSize, aAlpha, aGlow; attribute vec3 aTint;
      uniform float uPx, uCamZ, uScale;
      varying float vA, vG; varying vec3 vT;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, aSize * 2.0 * uPx * uScale * (uCamZ / -mv.z));   // bubbles keep their size relative to the ring
        vA = aAlpha; vG = aGlow; vT = aTint;
      }`,
    fragmentShader: /* glsl */`
      varying float vA, vG; varying vec3 vT;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0; p.y = -p.y;
        float r = length(p);
        if (r > 1.0) discard;
        float aa = 1.0 - smoothstep(0.86, 1.0, r);
        float ol = smoothstep(0.55, 0.88, r) * aa;                    // wall of the bubble
        vec3 c = mix(vT * 0.5, vec3(1.0), 0.25); float a = ol * 0.6;
        float cres = smoothstep(0.3, 0.78, r) * (1.0 - smoothstep(0.8, 0.95, r)) * smoothstep(0.1, 0.9, dot(normalize(p + 1e-4), vec2(-0.55, -0.83)));
        c = mix(c, vec3(1.0), cres); a = max(a, cres * 0.8);
        vec2 h = p - vec2(0.34, 0.38);
        float sp = exp(-dot(h, h) * 24.0);
        c = mix(c, vec3(1.0), sp); a = max(a, sp);
        c += mix(vT, vec3(1.0), 0.5) * vG * (1.0 - r) * 0.7; a = max(a, vG * 0.4 * (1.0 - r * r));
        gl_FragColor = vec4(c, min(1.0, a * vA * 1.25));             // +25% visibility
      }`,
  }));
  bubbles.frustumCulled = false;
  bubbles.renderOrder = 5;
  ringW.add(bubbles);

  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const act = [0, 0, 0, 0, 0];
  let waveAng = 2.6, waveAmt = 0;
  function activationAt(th) {
    let a = 0;
    for (let i = 0; i < 5; i++) a = Math.max(a, act[i] * (1 - smooth(0.48, 0.78, Math.abs(wrap(th - segAng[i])))));
    const dw = wrap(th - waveAng);
    return Math.max(a, waveAmt * Math.exp(-dw * dw / 0.2));
  }
  const nearestIdx = th => { let bi = 0, bd = 9; for (let i = 0; i < 5; i++) { const d = Math.abs(wrap(th - segAng[i])); if (d < bd) { bd = d; bi = i; } } return bi; };

  const rand = (a, b) => a + Math.random() * (b - a);
  const B = [];
  function spawn(b, nearCursor) {
    let th = 0;
    if (nearCursor) th = Math.atan2(cursorL.y, cursorL.x) + rand(-0.15, 0.25);
    else {
      for (let k = 0; k < 12; k++) { th = rand(-Math.PI, Math.PI); if (Math.random() < activationAt(th)) break; }
    }
    b.th = th; b.u = rand(0.15, 0.85); b.life = rand(2.5, 6); b.a = 0;
    b.sp = rand(0.8, 1.4); b.r = 0.006 + Math.pow(Math.random(), 3) * 0.026;
    b.ph = rand(0, TAU); b.fu = rand(1, 2.4);
    const role = Math.random();
    b.ambient = role < 0.32; b.seek = role >= 0.32 && role < 0.66;
    b.ks = rand(3.5, 6.5); b.off = rand(-1, 1); b.offu = rand(-1, 1);
    if (b.ambient) { b.th = rand(-Math.PI, Math.PI); b.r *= 0.8; b.life = rand(6, 14); }
  }
  for (let i = 0; i < NB; i++) { const b = { glow: 0 }; spawn(b, false); b.life = rand(0, 4); B.push(b); }

  function stepBubbles(dt, t, flowSpeed, cAmt, onRing) {
    const cth = Math.atan2(cursorL.y, cursorL.x);
    const cu = Math.min(0.85, Math.max(0.15, (Math.hypot(cursorL.x, cursorL.y) - C0) / (C1 - C0)));
    for (let i = 0; i < NB; i++) {
      const b = B[i];
      const here = activationAt(b.th);
      const dSeek = wrap(cth + b.off * 0.42 + Math.sin(t * b.fu * 0.6 + b.ph) * 0.08 - b.th);
      const seeking = onRing && b.seek && Math.abs(dSeek) < 1.9;
      if (seeking) {
        const k = Math.min(1, dt * b.ks);
        b.th = wrap(b.th + dSeek * k);
        b.u += (Math.min(0.88, Math.max(0.12, cu + b.offu * 0.38)) - b.u) * k;
        b.life = Math.max(b.life, 1.5);
      } else {
        b.th = wrap(b.th - flowSpeed * b.sp * (1 + 0.5 * here) * dt);
        b.u = Math.min(0.9, Math.max(0.1, b.u + Math.sin(t * b.fu + b.ph) * 0.07 * dt));
      }
      b.life -= dt;
      const target = (b.ambient ? 0.69 : Math.max(smooth(0.12, 0.6, here), seeking ? 1 : 0)) * Math.min(1, b.life);
      b.a += (target - b.a) * Math.min(1, dt * 4);
      if (b.life <= 0 || (!b.ambient && here < 0.05 && b.a < 0.02)) spawn(b, onRing && b.seek && Math.random() < 0.5);
      const rho = C0 + b.u * (C1 - C0) + Math.sin(t * 3.1 + b.ph) * 0.006;
      const x = Math.cos(b.th) * rho, y = Math.sin(b.th) * rho;
      const near = cAmt * Math.exp(-((cursorL.x - x) ** 2 + (cursorL.y - y) ** 2) * 10);
      b.glow += (near - b.glow) * Math.min(1, dt * 6);
      bPos[i * 3] = x; bPos[i * 3 + 1] = y; bPos[i * 3 + 2] = 0;
      bSize[i] = b.r;
      bAlpha[i] = Math.max(0, b.a);
      bGlow[i] = b.glow;
      const c = segCols[nearestIdx(b.th)];
      bTint[i * 3] = c.r; bTint[i * 3 + 1] = c.g; bTint[i * 3 + 2] = c.b;
    }
    for (const k of ['position', 'aSize', 'aAlpha', 'aGlow', 'aTint']) bGeo.attributes[k].needsUpdate = true;
  }

  /* 3 · Screen: backdrop + thick glass */
  const mainScene = new THREE.Scene();
  mainScene.add(fsQuad(new THREE.ShaderMaterial({
    uniforms: { uBg: { value: rtBg.texture }, uTime: U.time }, depthTest: false, depthWrite: false, vertexShader: FS_VERT,
    fragmentShader: /* glsl */`
      varying vec2 vUv; uniform sampler2D uBg; uniform float uTime;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        vec3 c = texture2D(uBg, vUv).rgb;
        c += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 91.0) - 0.5) * (2.5 / 255.0);
        gl_FragColor = vec4(c, 1.0);
      }`,
  })));
  const ringG = new THREE.Group();
  mainScene.add(ringG);

  const glassU = {
    uScene: { value: rtScene.texture }, uRes: U.res, uRefract: U.refract, uTime: U.time,
    uEnvLo: { value: C(PAL0[0]) }, uEnvHi: { value: C('#ffffff') },
    uLight: { value: new THREE.Vector3(0, 0, -8) }, uLightCol: { value: C('#ffffff') }, uLightAmt: { value: 0 },
    uRI: { value: RI }, uRO: { value: RO }, uRM: { value: RM },
    uSeam: { value: ORDER.map(k => (SEC[k].angle + 36) * DEG) },
    uSeamOn: { value: opts.seams === false ? 0 : 1 },   // the stage separators in the glass
    uStudio: { value: opts.dark ? 0.35 : 1 },            // the studio's strip lights: dimmed on a dark band
    uWin: { value: opts.dark ? 0 : 1 },                  // its window panes: off on a dark band, where they read as hard blocks
    uCaustic: { value: C('#ffffff') }, uCausticAmt: { value: 0.5 },
    uShine: { value: 1 },
    uPop: { value: 0 },   // as a tile: deeper walls and a bright rim, so the small ring stands off its pale tile
  };
  const glass = new THREE.Mesh(revolve(RM, GA, GB, GE, isSmall ? 200 : 300, 160), new THREE.ShaderMaterial({
    uniforms: glassU,
    vertexShader: /* glsl */`
      varying vec3 vN, vV, vP, vL, vT;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = -mv.xyz; vP = mv.xyz; vL = position;
        vT = normalize(normalMatrix * vec3(-position.y, position.x, 0.0));   // direction around the ring
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uScene; uniform vec2 uRes, uRefract;
      uniform float uTime, uLightAmt, uRI, uRO, uShine;
      uniform vec3 uEnvLo, uEnvHi, uLight, uLightCol, uCaustic;
      uniform float uRM, uCausticAmt;
      uniform float uSeam[5];
      uniform float uSeamOn, uStudio, uWin, uPop;
      varying vec3 vN, vV, vP, vL, vT;

      // studio for option 2: hard-edged light sources (window panes + strips), the way glass
      // mirrors them. Edges are about a pixel wide (aa = screen-space rate of change of r).
      float box(vec2 p, vec2 c, vec2 h, float aa) {
        vec2 d = abs(p - c) - h;
        return 1.0 - smoothstep(-aa, aa, max(d.x, d.y));
      }
      vec3 env(vec3 r, float aa) {
        vec3 c = uEnvLo * mix(0.45, 0.85, smoothstep(-0.7, 0.9, r.y));
        // a tall two-pane window, upper right (the same light as the glare), with a crossbar and a mullion
        // placed close to straight-ahead, so a small tilt toward the upper right already brings it onto the face
        float win = box(r.xy, vec2(0.34, 0.36), vec2(0.075, 0.2), aa) + box(r.xy, vec2(0.19, 0.36), vec2(0.045, 0.2), aa);
        win *= 1.0 - box(r.xy, vec2(0.27, 0.38), vec2(0.2, 0.008), aa);
        float top  = box(r.xy, vec2(0.16, 0.87), vec2(0.26, 0.016), aa);   // thin overhead strip
        float rimR = box(r.xy, vec2(0.76, -0.05), vec2(0.014, 0.4), aa);   // tall strip, right
        float rimL = box(r.xy, vec2(-0.8, -0.25), vec2(0.012, 0.3), aa);   // kicker, lower left
        float floorL = smoothstep(-0.88, -0.9, r.y);                       // hard floor line
        return c + vec3(1.0) * (win * 10.0 * uWin + top * 9.0 + rimR * 10.0 + rimL * 5.0 + floorL * 0.5) * uStudio;
      }

      void main() {
        vec3 v = normalize(vV), n = normalize(vN), I = -v;

        // five subtle seams in the glass at the stage boundaries: a shallow crease that bends light
        float seamRho = length(vL.xy), seamA = atan(vL.y, vL.x), seamD = 9.0;
        for (int i = 0; i < 5; i++) {
          float sd = (mod(seamA - uSeam[i] + 3.14159265, 6.2831853) - 3.14159265) * seamRho;
          if (abs(sd) < abs(seamD)) seamD = sd;
        }
        float seamG = exp(-pow(seamD / 0.014, 2.0)) * uSeamOn * (1.0 - 0.6 * uPop);   // softer on the tile
        n = normalize(n + normalize(vT) * sign(seamD) * seamG * 0.55);
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float edge = 1.0 - ndv;
        vec2 uv = gl_FragCoord.xy / uRes;

        // refraction through thick glass, split by wavelength
        vec3 refr = vec3(0.0);
        for (int i = 0; i < 4; i++) {
          float s = 1.0 + float(i) * 0.08;
          refr.r += texture2D(uScene, uv + refract(I, n, 1.0 / 1.44).xy * uRefract * s).r;
          refr.g += texture2D(uScene, uv + refract(I, n, 1.0 / 1.48).xy * uRefract * s * 1.07).g;
          refr.b += texture2D(uScene, uv + refract(I, n, 1.0 / 1.53).xy * uRefract * s * 1.14).b;
        }
        refr *= 0.25;
        vec3 col = refr * vec3(0.975, 0.988, 0.992);

        // thin-film iridescence drifting through the body, strongest as the surface turns
        float a = atan(vL.y, vL.x);
        vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + edge * 1.3 + sin(a * 2.0 + uTime * 0.15) * 0.18 + n.y * 0.25));
        col = mix(col, col * (0.78 + 0.36 * film), 0.3 * smoothstep(0.1, 0.75, edge));

        // edge definition: darker refraction band, then a hairline where the rim catches light
        col *= 1.0 - 0.38 * smoothstep(0.6, 0.93, edge) * (1.0 - smoothstep(0.965, 1.0, edge));
        float rho = length(vL.xy);
        float wallLine = exp(-pow((rho - (${(C0 - 0.03).toFixed(3)})) / 0.01, 2.0)) + exp(-pow((rho - (${(C1 + 0.03).toFixed(3)})) / 0.01, 2.0));
        col = mix(col, vec3(1.0), wallLine * 0.12 * smoothstep(0.6, 0.95, ndv));

        // reflection: schlick fresnel on an HDR studio, tinted by the film
        vec3 rf = reflect(I, n);
        float F = 0.04 + 0.96 * pow(edge, 5.0);
        float raa = max(fwidth(rf.x) + fwidth(rf.y), 1e-4);              // one pixel in reflection space
        vec3 refl = env(rf, raa) * mix(vec3(1.0), film, 0.4) * 0.8;       // shine −20%
        col = col * (1.0 - F * uShine) + refl * F * uShine;

        // as a tile: the walls deepen toward the silhouette and a bright rim traces it
        col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 1.0 + 1.6 * uPop);   // richer colour through the glass
        col *= mix(vec3(1.0), vec3(0.6, 0.58, 0.86), uPop * smoothstep(0.3, 0.92, edge));   // indigo depth toward the silhouette
        col = mix(col, vec3(1.0), uPop * 0.75 * smoothstep(0.93, 0.99, edge));

        // the cursor's light rides across the surface
        vec3 Lc = normalize(uLight - vP);
        float nc = max(dot(n, normalize(Lc + v)), 0.0);
        col += mix(uLightCol, vec3(1.0), 0.5) * (pow(nc, 900.0) * 1.6) * uLightAmt * 0.8 * uShine;   // crisp only, no soft halo
        // a fixed, unseen light at the upper right: crisp hot spot with a soft bloom
        vec3 Ls = normalize(vec3(0.6, 0.62, 0.5));
        float ns = max(dot(n, normalize(Ls + v)), 0.0);
        col += vec3(1.0, 0.985, 0.95) * (pow(ns, 1400.0) * 3.2) * 0.8 * uShine;   // crisp only, no soft halo
        // that light, focused by the thick glass, gathers on the far inner wall (lower left)
        float da = abs(mod(a + 2.36 + 3.14159265, 6.2831853) - 3.14159265);
        float innerSide = smoothstep(uRM, uRI + 0.06, rho);
        col += mix(uCaustic, vec3(1.0), 0.45) * exp(-da * da / 0.22) * innerSide * (0.1 + 0.16 * uCausticAmt) * (0.4 + 0.6 * ndv);
        // seam hairlines: a faint dark core with a lit edge beside it
        col *= 1.0 - 0.09 * uSeamOn * exp(-pow(seamD / 0.0045, 2.0));
        col += vec3(1.0) * 0.07 * uSeamOn * exp(-pow((seamD - 0.008) / 0.0035, 2.0));
        col = min(col, vec3(1.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  }));
  ringG.add(glass);

  const glareU = { uPos: { value: new THREE.Vector2(0.6, 0.6) }, uAmt: { value: 0 }, uSize: { value: 0.05 }, uAspect: U.aspect };
  const glare = fsQuad(new THREE.ShaderMaterial({
    uniforms: glareU, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, vertexShader: FS_VERT,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      uniform vec2 uPos; uniform float uAmt, uSize, uAspect;
      void main() {
        vec2 d = vec2((vUv.x - uPos.x) * uAspect, vUv.y - uPos.y) / uSize;
        float r2 = dot(d, d);
        float bloom = exp(-r2 * 1.6) * 0.55 + exp(-r2 * 0.18) * 0.12;
        vec2 rd = mat2(0.866, 0.5, -0.5, 0.866) * d;                 // star tilted toward the light
        float star = exp(-abs(rd.y) * 26.0) * exp(-abs(rd.x) * 0.9) + exp(-abs(rd.x) * 26.0) * exp(-abs(rd.y) * 1.4) * 0.6;
        vec3 c = vec3(1.0, 0.98, 0.94) * (bloom + star * 0.22) * uAmt;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  glare.renderOrder = 20;
  mainScene.add(glare);
  const glareN = new THREE.Vector3(), glareH = new THREE.Vector3(0.6, 0.62, 0.5).normalize().add(new THREE.Vector3(0, 0, 1)).normalize();

  /* Connector lines */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const links = {};
  /* each connector has a mask (a solid copy of its path, pathLength 1) so it can be drawn
   * out from the ring dot toward its panel: TileFlight sets data-drawn on .fw-link-draw */
  const defs = document.createElementNS(SVGNS, 'defs');
  linksSvg.append(defs);
  ORDER.forEach(k => {
    const mask = document.createElementNS(SVGNS, 'mask');
    mask.setAttribute('id', 'fw-m-' + k);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    const draw = document.createElementNS(SVGNS, 'path');
    draw.setAttribute('class', 'fw-link-draw'); draw.setAttribute('pathLength', '1'); draw.dataset.k = k;
    mask.append(draw);
    defs.append(mask);
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('class', 'fw-link'); path.dataset.k = k;
    path.setAttribute('mask', 'url(#fw-m-' + k + ')');
    const dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('class', 'fw-dot'); dot.setAttribute('r', '3.5'); dot.dataset.k = k;
    linksSvg.append(path, dot);
    links[k] = { path, dot, draw, mask };
  });

  /* Layout */
  let W = 1, H = 1, baseScale = 1, ringPx = 400, ppuL = 1, flightScale = 1, wasFlight = false;
  const anchors = {};
  const linksMq = window.matchMedia('(max-width: 820px)');
  function layout() {
    liftPanels();
    const sr = section.getBoundingClientRect();
    W = Math.max(1, sr.width); H = Math.max(1, sr.height);
    renderer.setSize(W, H, false);
    const bw = Math.round(W * DPR), bh = Math.round(H * DPR);
    U.res.value.set(bw, bh);
    rtBg.setSize(Math.max(64, Math.round(W * 0.3)), Math.max(64, Math.round(H * 0.3)));
    rtScene.setSize(Math.round(bw * 0.6), Math.round(bh * 0.6));
    U.resScene.value.set(rtScene.width, rtScene.height);
    const s = slot.getBoundingClientRect();
    const cx = s.left - sr.left + s.width / 2, cy = s.top - sr.top + s.height / 2;
    camera.aspect = W / H;
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const ppu = H / (2 * camera.position.z * Math.tan(camera.fov * DEG / 2));
    ppuL = ppu;
    ringPx = opts.ringPx ? opts.ringPx(W, H) : Math.max(180, Math.min(s.width * 0.92, s.height * 0.92, H * (listMode() ? 0.64 : 0.52)));   // version 3: the ring is the hero of its half   // ring keeps its size; the UI around it is at 80%
    baseScale = ringPx / (2 * R_OUT * ppu);
    const refrPx = ringPx * 0.085;
    U.refract.value.set(refrPx / W, refrPx / H);
    bubbleU.uPx.value = rtScene.height / (2 * camera.position.z * Math.tan(camera.fov * DEG / 2));
    section.style.setProperty('--ring-px', ringPx.toFixed(0) + 'px');
    section.style.setProperty('--fw-w', W + 'px');
    section.style.setProperty('--fw-h', H + 'px');
    U.aspect.value = W / H;
    linksSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    for (const k of ORDER) { const m = links[k].mask; m.setAttribute('x', '0'); m.setAttribute('y', '0'); m.setAttribute('width', String(W)); m.setAttribute('height', String(H)); }
    // the connectors run to the cards (version 1) or to the chips (version 2)
    section.querySelectorAll(chipsMode() ? '.fw-chip' : '.panel').forEach(p => {
      const r = p.getBoundingClientRect(), side = p.dataset.side;
      const x = r.left - sr.left, y = r.top - sr.top;
      anchors[p.dataset.k] = side === 'l' ? [x + r.width, y + r.height / 2, side]
        : side === 'r' ? [x, y + r.height / 2, side]
        : [x + r.width / 2, y, side];
    });
  }
  const ro = new ResizeObserver(layout);
  ro.observe(section);
  on(window, 'fw:layout', layout);
  if (document.fonts) document.fonts.ready.then(() => { if (!disposed) layout(); });
  layout();

  const tmp = new THREE.Vector3();
  function toScreen(x, y, z) {
    tmp.set(x, y, z); ringG.localToWorld(tmp); tmp.project(camera);
    return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H];
  }

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(), plane = new THREE.Plane();
  const pN = new THREE.Vector3(), pP = new THREE.Vector3(), hit = new THREE.Vector3();
  function pointerLocal(mx, my) {
    ndc.set(mx * 2 - 1, -(my * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
    pN.set(0, 0, 1).applyQuaternion(ringG.quaternion);
    pP.set(0, 0, T * 0.8); ringG.localToWorld(pP);
    plane.setFromNormalAndCoplanarPoint(pN, pP);
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    ringG.worldToLocal(hit);
    return { x: hit.x, y: hit.y, phi: Math.atan2(hit.y, hit.x), rho: Math.hypot(hit.x, hit.y) };
  }
  const onRing = p => p && p.rho > RI - 0.02 && p.rho < RO + 0.02;

  if (!decor) on(canvas, 'click', e => {
    const r = section.getBoundingClientRect();
    const p = pointerLocal((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    if (onRing(p)) pick(ORDER[nearestIdx(p.phi)]);
  });

  /* Frame loop */
  const tgt = [0, 1, 2, 3].map(() => new THREE.Color());
  const tGlow = new THREE.Color(), tMouse = new THREE.Vector2(), dyeCol = new THREE.Color();
  let glowAmt = 0, intro = 0, rotX = 0, rotY = 0, lightAmt = 0, cAmt = 0, ringSX = 0, ringSY = 0, ringSR = 200;
  let last = performance.now(), firstFrame = true, idleFor = 0, skip = false;

  function frame(now) {
    if (!running || disposed) return;
    requestAnimationFrame(frame);
    const rm = reduceMotion.matches;
    const interacting = state.pointerIn || state.hot || state.sel || FL.active;
    if (!visible && !FL.active && !firstFrame) { running = false; return; }
    idleFor = interacting ? 0 : idleFor + (now - last) / 1000;
    if (idleFor > 3) { skip = !skip; if (skip) return; }       // idle: 30 fps
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    U.time.value += dt * (rm ? 0.25 : 1);
    const t = U.time.value;
    const ease = r => 1 - Math.exp(-dt * r);

    // pointer → stage hover
    const pl = state.pointerIn ? pointerLocal(state.mx, state.my) : null;
    const overRing = !!(pl && state.overCanvas && onRing(pl));
    const segK = overRing ? ORDER[nearestIdx(pl.phi)] : null;
    if (segK !== state.seg) {
      if (state.seg) leave(state.seg);
      state.seg = segK;
      if (segK) enter(segK);
      if (!decor) canvas.style.cursor = segK ? 'pointer' : '';
    }
    // version 3 keeps the list's open stage lit (data-pin, StageList)
    const active = state.sel || state.hot || section.dataset.pin || null;
    const flowKey = !active && waveAmt > 0.45 ? ORDER[nearestIdx(waveAng)] : null;
    setFlow(flowKey);
    const envKey = active || flowKey;

    // cursor resting in the heart of the ring → a soft white glow behind the centre text
    const inHole = !!(pl && pl.rho < RI * 0.92);
    section.classList.toggle('center-hot', inHole);

    // cursor light target
    let target = null, tAmt = 0;
    if (pl && state.overCanvas) { target = pl; tAmt = overRing ? 1 : 0.4; }
    else if (active) { const a = SEC[active].angle * DEG; target = { x: Math.cos(a) * RM, y: Math.sin(a) * RM }; tAmt = 0.7; }
    if (target) { cursorL.x += (target.x - cursorL.x) * ease(12); cursorL.y += (target.y - cursorL.y) * ease(12); }
    cAmt += (tAmt - cAmt) * ease(5);

    // water: clockwise current, travelling dye wave at rest, hovered stage floods with colour
    const flowSpeed = rm ? 0.05 : 0.26;
    U.flow.value += flowSpeed * dt;
    waterU.uFlowBase.value = flowSpeed;
    waveAng = wrap(waveAng - flowSpeed * dt);
    // versions 4–5: while a stage is held, the travelling colour waits there, so it flows on from it
    if (autoMode() && !decor && section.dataset.pin && SEC[section.dataset.pin]) waveAng = wrap(SEC[section.dataset.pin].angle * DEG);
    waveAmt += ((active ? 0.12 : 1.0) - waveAmt) * ease(1.5);
    // versions 4–5: the travelling colour floods each stage it passes through, so the liquid reads as moving
    const flowFill = autoMode() && !decor ? 0.85 : 0.4;
    for (let i = 0; i < 5; i++) act[i] += ((ORDER[i] === active ? 1 : ORDER[i] === flowKey ? flowFill : 0) - act[i]) * ease(3.2);
    waterU.uAct.value = act;
    waterU.uWaveAng.value = waveAng;
    waterU.uWaveAmt.value = waveAmt;
    waterU.uCursorAmt.value = overRing ? cAmt : cAmt * 0.3;
    stepBubbles(dt, t, flowSpeed, cAmt, overRing);

    // environment
    /* as a tile, the ring refracts a coloured field (it would read white on a pale one);
     * it eases back to the neutral studio as the shine returns on landing */
    const calmTint = FL.active && FL.calm > 0.35;
    const dark = darkMode();
    const kd = ease(2.4);   // ease between light and dark with the page theme, no snap
    bgU.uDark.value += ((dark ? 1 : 0) - bgU.uDark.value) * kd;
    glassU.uStudio.value += ((dark ? 0.35 : 1) - glassU.uStudio.value) * kd;
    glassU.uWin.value += ((dark ? 0 : 1) - glassU.uWin.value) * kd;
    const pal = opts.palette ? opts.palette : calmTint ? TILE_BG
      : dark ? (envKey ? DARK_SEC[envKey] : DARK_NEUTRAL)
      : envKey ? SEC[envKey].bg : NEUTRAL_BG;
    const kc = ease(active ? 2.4 : 1.2);
    bgU.uBase.value.lerp(tgt[0].set(pal[0]), kc);
    bgU.uB1.value.lerp(tgt[1].set(pal[1]), kc);
    bgU.uB2.value.lerp(tgt[2].set(pal[2]), kc);
    bgU.uB3.value.lerp(tgt[3].set(pal[3]), kc);
    glassU.uEnvLo.value.copy(bgU.uBase.value);
    tGlow.set(envKey ? SEC[envKey].jelly : NEUTRAL_GLOW);
    bgU.uGlow.value.lerp(tGlow, ease(4));
    glowAmt += ((active ? 1 : flowKey ? 0.55 : state.pointerIn ? 0.5 : 0) - glowAmt) * ease(3);
    bgU.uGlowAmt.value = glowAmt;
    bgU.uMouse.value.lerp(tMouse.set(state.mx, 1 - state.my), ease(5));
    dyeCol.copy(segCols[active ? ORDER.indexOf(active) : nearestIdx(waveAng)]);
    bgU.uDye.value.lerp(dyeCol, ease(3));
    bgU.uDyeAmt.value = Math.max(waveAmt * 0.6, Math.max(...act));

    // pose: the ring dips toward whatever has its attention (pointer, hovered stage or the flowing colour)
    intro = Math.min(1, intro + dt / 1.4);
    const io = 1 - Math.pow(1 - intro, 3);
    let tx = 0, ty = 0, k = 0;
    if (state.pointerIn) {
      let dx = (state.mx * W - ringSX) / ringSR, dy = (state.my * H - ringSY) / ringSR;
      const m = Math.hypot(dx, dy);
      if (m > 1) { const f = Math.max(0.3, 1 - (m - 1) * 0.5) / m; dx *= f; dy *= f; }
      tx = dx; ty = dy; k = 0.36;
    } else if (active || flowKey) {
      const a = active ? SEC[active].angle * DEG : waveAng;
      tx = Math.cos(a); ty = -Math.sin(a); k = active ? 0.3 : 0.22 * waveAmt;
    }
    if (rm) k *= 0.25;
    rotX += (ty * k - rotX) * ease(2.6);
    rotY += (tx * k - rotY) * ease(2.6);
    // in flight the ring is placed and sized by TileFlight, and spun/tilted by the scroll
    if (FL.active) {
      camera.setViewOffset(W, H, W / 2 - FL.cx, H / 2 - FL.cy, W, H);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      flightScale = Math.max(1, FL.ring) / (2 * R_OUT * ppuL);
      const refrPx = FL.ring * 0.085;
      U.refract.value.set(refrPx / W, refrPx / H);
      wasFlight = true;
    } else if (wasFlight) {
      wasFlight = false;
      layout();
    }
    const fl = FL.active;
    const shine = fl ? 1 - 0.65 * FL.calm : 1;   // some of the studio's shine stays on the tile
    glassU.uShine.value = shine;
    glassU.uPop.value = fl ? Math.pow(FL.calm, 2.5) : 0;   // full on the tile, gone early in the flight
    bubbleU.uScale.value = fl ? Math.min(1, flightScale / baseScale) : 1;
    const pose = opts.pose || null;   // decorative: moved by the page (scroll)
    const sc = (fl ? flightScale : baseScale) * (0.94 + 0.06 * io) * (pose ? Math.max(0.001, pose.scale) : 1);
    for (const g of [ringW, ringG]) {
      g.rotation.set(rotX + (fl ? FL.tilt : 0) + (pose ? pose.tilt || 0 : 0), rotY, (fl ? FL.spin : 0) + (pose ? pose.spin || 0 : 0));
      g.scale.setScalar(sc);
      g.updateMatrixWorld();
    }

    // light travelling with the cursor
    lightAmt += ((overRing ? 1 : active ? 0.6 : 0) - lightAmt) * ease(6);
    tmp.set(cursorL.x, cursorL.y, T + 0.9);
    ringG.localToWorld(tmp);
    glassU.uLight.value.copy(tmp).sub(camera.position);
    glassU.uLightAmt.value = lightAmt;
    glassU.uLightCol.value.copy(segCols[nearestIdx(Math.atan2(cursorL.y, cursorL.x))]);

    const [ox, oy] = toScreen(0, 0, 0);
    const [rx] = toScreen(R_OUT, 0, 0);
    ringSX = ox; ringSY = oy; ringSR = Math.max(1, Math.abs(rx - ox));
    bgU.uRing.value.set(ox / W, 1 - oy / H, ringSR / H, 0);

    // background colour concentrates around the active stage
    const focusKey = active || flowKey;
    if (focusKey) {
      const fa = SEC[focusKey].angle * DEG;
      const [fx, fy] = toScreen(Math.cos(fa) * RM, Math.sin(fa) * RM, 0);
      bgU.uActPt.value.lerp(tMouse.set(fx / W, 1 - fy / H), ease(3));
    }
    bgU.uActAmt.value += ((active ? 1 : flowKey ? 0.7 : 0) - bgU.uActAmt.value) * ease(2);
    glassU.uCaustic.value.copy(bgU.uDye.value);
    glassU.uCausticAmt.value = bgU.uDyeAmt.value;

    // glare sits on the upper-right rim and brightens as the ring tilts into the light
    const ga = 45 * DEG;
    const [gx, gy] = toScreen(Math.cos(ga) * (RO - 0.15), Math.sin(ga) * (RO - 0.15), GB * 0.8);
    glareN.set(0.5, 0.5, 0.7).normalize().applyQuaternion(ringG.quaternion);
    const facing = Math.pow(Math.max(0, glareN.dot(glareH)), 24);
    bgU.uPrism.value += ((0.18 + 0.82 * Math.min(1, facing * 1.4)) * io - bgU.uPrism.value) * ease(4);   // rainbow follows the glare
    {
      // the cast moves with the light: more light on the upper right → it falls further out and a little longer
      const lit = Math.min(1, facing * 1.4), pg = bgU.uPrismGeo.value;
      pg.x += ((1.16 + 0.1 * lit) - pg.x) * ease(3);   // a small gap: the ring floats just above the surface
      pg.y += ((0.34 + 0.12 * lit) - pg.y) * ease(3);
      pg.z += ((rotY - rotX) * 0.25 - pg.z) * ease(3);
    }
    glareU.uPos.value.set(gx / W, 1 - gy / H);
    glareU.uSize.value = ringSR / H * 0.16;
    glareU.uAmt.value = (0.1 + 1.1 * facing) * io * 0.8 * (FL.active ? 1 - FL.calm : 1);      // faint at most angles, flares when tilted toward the light

    for (let i = 0; i < 5; i++) {
      const k = ORDER[i], c = segAng[i];
      const [lx, ly] = toScreen(Math.cos(c) * RM, Math.sin(c) * RM, T);
      labels[k].style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, -50%)`;
      if (!linksMq.matches && anchors[k]) {
        const [ex, ey] = toScreen(Math.cos(c) * R_OUT, Math.sin(c) * R_OUT, 0);
        const [ax, ay, side] = anchors[k];
        const gap = 26;
        const d = side === 'l' ? `M${ax} ${ay} H${ax + gap} L${ex} ${ey}`
          : side === 'r' ? `M${ax} ${ay} H${ax - gap} L${ex} ${ey}`
          : `M${ax} ${ay} V${ay - gap * 0.6} L${ex} ${ey}`;
        links[k].path.setAttribute('d', d);
        links[k].draw.setAttribute('d', d);
        links[k].dot.setAttribute('cx', ex.toFixed(1));
        links[k].dot.setAttribute('cy', ey.toFixed(1));
      }
    }

    renderer.setRenderTarget(rtBg);
    renderer.render(bgScene, camera);
    renderer.setRenderTarget(rtScene);
    renderer.render(waterScene, camera);
    renderer.setRenderTarget(null);
    renderer.render(mainScene, camera);
    if (firstFrame) { firstFrame = false; section.classList.add('gl-ready'); FL.ready = true; }
  }

  let visible = true;
  const resume = () => {
    if (!running && (visible || FL.active) && !document.hidden && !disposed) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible && !FL.active) running = false; else resume(); });
  FL.wake = resume;
  io.observe(section);
  on(document, 'visibilitychange', () => { if (document.hidden) running = false; else resume(); });
  requestAnimationFrame(frame);

  // teardown for React unmount / strict-mode remount
  return () => {
    running = false;
    FL.wake = null;
    FL.ready = false;
    FL.active = false;
    io.disconnect();
    ro.disconnect();
    rtBg.dispose();
    rtScene.dispose();
    for (const sc of [bgScene, waterScene, mainScene]) {
      sc.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    renderer.dispose();
  };
}

return () => {
  disposed = true;
  cleanups.forEach(fn => fn());
  clearTimeout(closing);
  if (disposeGL) disposeGL();
  section.classList.remove('is-ready', 'gl-ready', 'no-gl', 'center-hot');
  section.querySelectorAll('.is-hot, .is-sel, .is-flow').forEach(el => el.classList.remove('is-hot', 'is-sel', 'is-flow'));
  modal.classList.remove('open');
  modal.hidden = true;
  document.body.classList.remove('fw-locked');
};
}
