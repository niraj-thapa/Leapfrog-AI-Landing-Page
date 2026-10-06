# Leapfrog AI Landing Page — Design Reference

Rebuilt (Oct 2026). Sources, and what each one governs:

- **Design Brief v8** (Sep 28, 2026) — copy, scroll order, module rules, launch checklist.
- **The AI Flywheel** (module 2, ported from `~/Downloads/flywheel-glass/option-2/`) — **the visual
  language of the whole page** since Oct 2, 2026: soft luminous paper, frosted-glass panels, the five
  stage colours, pill controls, uppercase 700 labels. (Typography now follows squareup.com — see Tokens.)
- **squareup.com** hero — the scroll pattern of module 1 (full-screen loop → tile in a mosaic).
- **Figma "LF AI Landing Page"** (`zgANygiNQHicFjonum6yck`, node `2050:4610`) — layouts and
  section composition (grids, card structure, story card, FAQ columns). Its colours, 4px radii and
  DM Mono labels are superseded by the Flywheel language.

The cube-motion "rise" reveal and the light ⇄ dark page theme carry over.

## Stack and files

Next.js 16 App Router · TypeScript · plain CSS in `app/globals.css` (Tailwind is only imported for its reset) · three.js **0.165.0** (exact pin = the reference's vendored r165), loaded lazily by the Flywheel only.

```
app/page.tsx                  composes the sections in brief order
app/contact/page.tsx          the one form (module 8 links here)
app/lib/content.ts            ALL copy — edit here, not in components
app/components/               SiteHeader, Hero, Credibility, Flywheel, WhyLeapfrog,
                              Results, Roadmap, Insights, Faq, TalkBand, SiteFooter,
                              RevealController
app/components/flywheel/      flywheel.js (reference main.js, wrapped) + flywheel.css
public/assets/                Figma exports (SVG/PNG/JPG) — see "Assets"
public/fonts/                 Tomato Grotesk woff2 files (no longer used; fonts come from next/font)
```

## Scroll order (brief v8)

1 Hero (credibility marquee inside the loop) · 2 AI Flywheel · 3 Why Leapfrog · 4 Client results delivered
(+ industry strip + featured story) · 5 Start focused. Build for the long run. · 6 Ideas and
insights · 7 Straight answers · 8 Talk to our team → footer.

## Tokens (shared with the Flywheel, `:root` in `globals.css`)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#e8eaec` | Light page colour (same as the Flywheel's paper) |
| `--night` | `#0d1411` | Dark page colour (Results, Talk band, footer) |
| `--ink` / `--ink-2` / `--ink-3` | `#0d1411` / `#36423c` / `#56625c` | Text, body, secondary |
| `--brand` / `--brand-ink` | `#038e43` / `#02713a` | CTAs; green text and hover |
| `--brand-lit` | `#36c37a` | Brand green for **text on dark** |
| `--validate` `--build` `--enable` `--accelerate` `--run` | `#7c5cff` `#2f7dff` `#19c37d` `#ffb020` `#ff5c7c` | Stage colours, each with `-ink` (readable) and `-soft` (tint) |
| `--glass-bg` / `--glass-bg-hot` / `--glass-border` | white 42% / 88% / 75% | Frosted panels at rest / lit |
| `--shadow-panel` | inset highlight + hairline + soft drop | Every glass surface |
| `--radius-xl/lg/md/sm/pill` | 24 / 16 / 12 / 8 / 999px | Large cards / cards / chips / small / buttons |
| `--conic` | five-stage conic gradient | `.conic-dot`, ring motifs |

**Stage tones.** Any element with `data-tone="validate|build|enable|accelerate|run"` gets `--sec`,
`--sec-ink`, `--sec-soft`. (`data-k` stays reserved for the Flywheel's own elements.) Assignments:
pillars expertise=build, attention=validate, results=enable, stay=accelerate; roadmap stages
Assess=validate, Launch=build, Expand=enable, Run and improve=run; metrics cycle through the five.

**Build gotcha — backdrop-filter.** Write only the unprefixed `backdrop-filter`. When a rule also
lists `-webkit-backdrop-filter`, the Tailwind v4 / Lightning CSS build keeps only the prefixed copy,
which Chrome ignores — that silently removed every frosted-glass blur until Oct 2 2026. The build
adds the `-webkit-` prefix for Safari by itself.

**Surfaces.** Light cards (`.pillar`, `.stage-card`, `.faq-item`, `.contact-card`) are
glass; on hover they lift 4px and light up in their stage colour (ring + 5px halo + coloured drop),
exactly like the Flywheel panels. Dark cards (`.metric`, `.industry-strip`, `.footer-top`) are white
5% with a 10% white border and a soft stage-colour glow. Buttons are pills: `.btn-primary` (green
with green shadow) and `.btn-glass` (`--dark` variant for use over video).

**Page light field.** `body::before` (light: green + lavender wash, the Flywheel's background) is a
fixed layer that fades out in dark mode; dark mode is a flat `--night`, with no glows (the dark
glows and the metric-card glows were removed Oct 2 2026). The Flywheel section is transparent and its opaque WebGL canvas is feathered top and bottom
(mask) so it melts into this field instead of ending on a line.

**Type.** Family: **Tomato Grotesk** (Leapfrog's brand face, self-hosted, 400/500/600/700).
Sizes and leading follow **squareup.com's scale**; weights and tracking are ours (Tomato needs tighter
tracking than Square's serif).

| Role | Square size | Ours |
|---|---|---|
| Hero title | 81px / 81px | `clamp(44px, min(5.625vw, 9svh), 96px)`, lh 1, 600, −0.045em |
| Section heading `.h2` | 40px / 45px | `clamp(32px, 3vw, 44px)` / 1.125, 600, −0.03em |
| Statement / story / results titles | 40 / 45 | same scale (statement 500) |
| Card titles | — | 26–28px / 1.15, 600, −0.03em |
| Body | 16 / 24 | 16 / 1.5; lead 18 / 1.5 |
| Nav, buttons | 14–18px, 500 | 15px, 500 |

The small uppercase labels ("01 · VALIDATE") stay as part of the Flywheel language. Content width
1280px; gutter 32px (20px mobile).

## Section rhythm (after concourse.ai, Oct 4)
Measured on concourse.ai at 1440: sections padded 128–192px top and bottom (mostly 128/160), ~80px from a section heading to its content (48–100). Ours, as tokens on `:root`:
- `--section-y: clamp(96px, 10vw, 160px)` — top and bottom padding of Why, Results, Roadmap, Insights and FAQ (144px at 1440; 72px ≤720px as before).
- `--head-gap: clamp(48px, 5.5vw, 80px)` — section head → content (Why, Results, Roadmap, Insights).
- `--block-gap: clamp(88px, 9vw, 128px)` — between big blocks inside a section (Results panels → industry strip → story; Roadmap stages → support).
The hero, Flywheel and Talk band keep their own (pinned / one-screen) spacing.

## Type scale and buttons (after concourse.ai, Oct 4)
Measured on concourse.ai at 1440 (H1 84 · H2 64 · stats 64 · quotes/stats 32 · list titles 28 · lead 18 · body 15 · small 13/12 · eyebrow 12) and applied in our face (Tomato Grotesk, our weights and colours unchanged):
- Section headings (`.h2`, Results title, story headline, Flywheel title): `clamp(36px, 4.45vw, 64px)`, line-height 1.04 (Flywheel: `clamp(36px, min(4.45vw, 7svh), 64px)`, so V1 still fits one screen; V1 shows it at 80%).
- Big stats (Client results number): up to 64px. The Boutique attention client card: 40px figure, 20px quote (Webflow's sizes). Proof figures: up to 32px.
- List / card titles — pillars, stage cards, insights, support options: 28px. Support subhead: 32px.
- Lead 18px (as before); body 15px (insight takeaways, FAQ answers now 15); eyebrows 12px.
- The hero headline stays as matched to Square (81px at 1440 ≈ Concourse's 84); the Talk title stays 80px.
- **Buttons:** 8px corners (`--radius-btn`), as Concourse's — `.btn-primary`, `.btn-glass`, story link, the Flywheel dialog CTA. Everything else about them unchanged. (The header bar and round icon buttons keep their shapes.)

## Header — corners and dark version (Oct 4)
- The header bar's corners are concentric with its CTA: 16px (`--radius-btn` 8px + the bar's 8px inset); nav link hovers 8px.
- **Dark sections** (`html[data-theme="dark"]`): the bar becomes the dark glass of madebykota.com's Orionix "Live preview" button (measured layer by layer) — grey tint `rgba(153,153,153,.16)` over the blur, dark hairline `rgba(0,0,0,.25)`, deeper side shading `rgba(0,0,0,.3)`, the same white rims at ~30%. Nav text `#f2f5f3`, chevron inverted, the wordmark swaps to `header-logo-light.svg` (white wordmark, green mark), services menu dark. Everything eases with the page theme (`--theme-ms`, 700ms). The hero video counts as a dark ground: while it still fills the top of the screen (morph < 0.3, `HERO_DARK_UNTIL`), Hero.tsx sets `html.hero-dark` and the header shows its dark version; it turns light as the video shrinks clear.
- **Secondary buttons** (`.btn-glass`: Watch the film, See how we work, Expand all) use the header's glass — the light liquid glass on light grounds, the dark "Live preview" glass on dark sections and over the video (`.btn-glass--dark`); hover thickens the tint. 8px corners.

## Partner credentials — artwork (Oct 4)
From the Vyaguta Dashboard Figma file, "Partners" frame (node 496:2604), exported as SVG to `public/assets/partners/` with the frame's grey/black backgrounds stripped: AWS Partner · AI Services / Healthcare Services / DevOps Services Competency (square badges), Claude Partner Network (wordmark), SOC 2 Type II (round seal — cropped to its 80px seal, its glass layers raised from 50–82% to full opacity so it reads beside the white badges). `BADGES` in content.ts lists exactly these five (the old "AWS Agentic AI Competency" text badge is gone).
- **Label:** a small "100+ AI initiatives" line over the hero marquee (as concourse.ai's "Working with 100+ finance departments": 12px, uppercase, 0.12em tracking, white at 72%, 18px above the badges).
- **Hero intro centring:** the headline + buttons centre in the open space between the header and the badge row (bottom padding = the row's offset + badges + label), plus an optical lift of ~0.22 × the title size for the room the title's box keeps above its capitals — visually equal gaps above and below (≈178 / 188px at 1440×900).
- Colours: in the **hero marquee**, flat white like squareup.com's logo row — `*-mono.svg` copies (AWS orange and Claude coral turned white; SOC 2 redrawn from its glass layers as white ring + inner-circle outlines with white lettering, glass fills and blur highlights dropped). In the Deep AI expertise strip the brand-colour versions (orange / coral kept). 90% opacity, full on hover.
- **Hero tiles:** the three blog-image tiles now hold the AWS competency badges (AI Services, Healthcare Services, DevOps Services) — `*-ink.svg` copies with the white line art in dark ink `#0D1411` and the AWS orange kept, on the glass stat-tile card (`.hero-tile--competency`, badge 64% of the tile). The "Weeks / to first use case live" stat tile is now **250+ / Products**.
- Sizes by shape (`.badge-img--square / --wide / --seal`): balanced optically (Oct 4) — hero marquee 60 / 38 / 58px tall (48 / 30 / 46 on phones); Deep AI expertise strip 50 / 32 / 48px. Order: AWS AI Services · Claude · AWS Healthcare · SOC 2 · AWS DevOps (Claude and SOC 2 between the AWS badges).

## Components

| Section | Class | Notes |
|---|---|---|
| Header | `.site-header`, `.header-pill` | Floating liquid-glass pill after madebykota.com: near-clear tint, blur 14px, hairline ring, inner side/bottom shading, white top/bottom rims (layered box-shadows); tint thickens over dark sections (`--hdr-tint`). Motion matched to squareup.com: at the top it scrolls away 1:1 with the page (Square's static nav); after that it stays out on scroll down and slides in on any scroll up (6px dead-band) with Square's sticky-bar curves — in 0.25s `cubic-bezier(0,0,0.2,1)`, out 0.2s `cubic-bezier(0.4,0,1,1)`, transform only; reattaches at the top; stays while a menu is open; shows on keyboard focus |
| Hero | `.hero`, `.hero-pin`, `.hero-frame`, `.hero-tiles`, `.hero-say` | See "Hero" below |
| Credibility | `.marquee` (in `Credibility.tsx`) | Inside the hero loop, along its bottom, like Square's client-logo row: white badges in one 48s horizontal loop, edge-faded, pausing on hover/focus; shrinks with the loop. First copy of each badge is the link; repeats are decorative. Reduced motion: still, each badge once |
| Why Leapfrog | `.pillar` | Glass cards, stage-colour top rule, icon in a soft tone tile, tone chips |
| Results (dark) | `.results`, `.metric` | Sticky title left; 2×2 dark-glass metric cards with stage glows |
| Story | `.story-card` | White, radius 24, no border. Left: one photo (min 520px) — the SecondLook logo white at the top and the person (name 18px/600, role 13.5px) at the bottom, each on a progressive blur (a blurred copy of the photo, full at the edge, clear by ~130px / ~170px, under a dark tint). Right: the path as four segments (3px bar — brand green done, dashed for Next — then an 11.5px uppercase step name and its 15px value: Start · Kickoff / Live · 9 weeks / Result · 70–90% faster review / Next · The next phase), the facts grid, and "Read full story" as the primary (green) button, no glow under it; no glow under the card either. The path draws in once it is on screen: each segment fills from the left (0.55s, 0.42s apart) and its name and value rise in as it lands (Oct 5; replaced dots-and-gradient timeline, the white name bar under the photo and the dark pill) |
| Start focused | `.stage-card` | Numbered 01–04 in tone ink; icon tile fills with the tone on hover |
| Support | `.support` | Radius-24 photo (the two buyer cards were removed Oct 4) |
| Insights | `.insight` | Thumb first, conic-dot topic label; card turns to glass on hover |
| FAQ | `.faq-item` | Sticky heading; glass items; open item lit in brand green |
| Talk band (dark) | `.talk`, `TalkBand.tsx` | After davidecattaneo.it's call-section, compared frame by frame at 1440×900 (U = scroll px at 900 tall): pins for **1 viewport** — the reference's 1500 U timeline played 1.67× faster (`SPEED`), so everything is revealed by ~0.45 viewport of scroll. Title rises from 120% (quad out, U 0–430) with **no mask**; its letters fade in at a constant 22 U per letter from U 10 (50 U each), last word brand green. Three rings, dark→green→dark stroke, grow 0→1.8× (quad out, U 0–1440, outer ring leading by 43 U each) drifting up from just below centre. Subline rises 30px and its words fade in over U 370–560. The (standard green) button rises out of a mask on a sine in-out curve, U 400–660 — still hidden at 450, half at 530, home by 600–660 — and is `visibility: hidden` while fully lowered so no browser can show it early. Hidden starting states apply only while the script drives the scene (`.is-armed`). Smoothed 12%/frame. Reduced motion: no pin, finished state |
| Footer (dark) | `.site-footer` | Dark-glass top bar; uppercase column labels |

## Hero — the loop becomes a tile (matched to squareup.com)

**Video (Oct 3 2026):** cut from `Animatics v1.mp4` (the 65 MB master now lives in
`../source-video/`, outside `public/`, with the two retired stock clips):
- `video/hero-loop.mp4` — 15s (42–57s of the film), silent, H.264 1280×612, **1.2 MB**; the bottom 15% is
  cropped off so the burned-in captions never show. Poster `assets/hero-loop-poster.jpg` (its first frame).
- `video/animatics-film.mp4` — the full film, H.264 720p + AAC 96k, **12.6 MB**; only requested when the
  film is opened (verified: page load fetches the loop only). Poster `assets/hero-poster-animatics.jpg`.
Encoded with ffmpeg (x264, CRF 27 / 25, faststart). **Film dialog:** blurred backdrop, 16:9 panel up to
80% of the viewport, circular close; Escape, the close button or a backdrop click closes it; plays with
sound; the hero loop pauses meanwhile. (The browser full-screen version was removed.)

Measured on squareup.com at 1440×900 (DOM, computed styles and per-frame sampling after one
wheel notch) and reproduced value for value:

| Square | Ours |
|---|---|
| Track 160% of the viewport; sticky viewport | `.hero` 160svh, `.hero-pin` sticky |
| Move completes after ~33% of a viewport of scroll; page settles at 38%; mosaic holds to 60% | `MORPH 0.33`, `DOCK 0.38`, `HOLD 0.6` |
| Scroll position smoothed, then mapped (crisp finish, no slow tail) | lerp 8.5%/frame on the scroll position, then clamp |
| Stop part-way → after ~300ms the page glides on to the dock (or back to the top when scrolling up) | `SNAP_IDLE 280ms`, `SNAP_MS 620ms` easeOut; any wheel/touch/key cancels; only ever finishes the visitor's own scrolling (wheel/touch/key input within the last 2s) — never a link jump or other programmatic scroll passing through the hero |
| Loop shrinks with ONE uniform `scale()` + `translateY`, origin centre; `clip-path: inset(0 18.75% round …)` crops it to a square | same: transform + clip-path per frame, no layout work |
| Final tile 138px, 20px corners; scale 0.153 | identical at 1440×900 (verified) |
| TextStack title: clipped to the shrinking loop; fades word by word, left to right, each word drifting up as it fades (sampled per frame against the loop's progress) | `.hero-word`: starts at 0.11 + 0.0225·i of the move, lasts 0.35; opacity (1−x)^1.8; rise 0.5·x² line (full line once invisible); buttons same curve 0.37→0.77; no extra smoothing. Matches Square within ~0.02 opacity per word |
| Header slides up and away during the move | the site-wide rule (hidden on scroll down, back on scroll up) does this |
| All tiles together: scale 0.25 → 1 and opacity 0 → 1 with the move; photos zoom 1.5× → 1× | `--m` drives every tile; `.hero-tile--photo img` |
| Grid 4/5/5/4, tiles 9.58vw, the loop docks centre of row 3, statement between rows 2 and 3, bottom row runs off-screen | `--u = min(1vw, 1.6svh)`; offsets in `TILES`. Unlike Square, the pin clips only sideways and `.hero` has bottom margin `max(0, 33.75u − 50svh) + clamp(40px, 6u, 88px)`, so the last row scrolls fully into view before the Flywheel |
| Statement words rise 100px → 0 out of a line mask, staggered left to right from mid-move, each through its own smoother so the last settle ~400ms after docking | `.hw` / `.hw-i`, start 0.48 → 0.78 of the move, 13%/frame |

Measured timing after one notch, ours vs Square: scale 0.79 at ~300ms (both), 0.73 at ~420ms
(both), 0.27 at ~770ms (both), docked at ~890ms vs ~940ms.

Differences kept on purpose: our tiles are the Flywheel's stage colours, stats and badges instead of
Square's illustrations; the statement is the brief's subhead (3 lines, with two CTAs fading in at the
end of the move); a play disc appears on the docked loop and opens the film. Phones use a 2/3/3/2
grid of 25vw tiles, and the loop is cropped toward the subject (`object-position: 68%`).

**Reduced motion:** no scale, travel, smoothing or snap. The loop is paused on its poster, the
full-screen frame fades out and reappears already in its tile, tiles and words fade only, and the
header hides without sliding.

## Hero → Flywheel: tile parallax and the flying ring (after waabi.ai)

**Parallax (waabi's 150vh tile section).** Measured on waabi.ai: the section scrolls normally while its
columns travel at different rates. Ours: once the mosaic docks the hero scrolls away as normal (track
145svh — it lets go soon after docking) and every tile rises faster than the page, at its own depth — rows above the statement fastest
(centre / middle / outer columns +1.0 / +1.2 / +1.45 px per px of scroll), the statement +0.8, rows
below slower (+0.45 / +0.55 / +0.7). The ring tile rises with its row like every other tile; only its
glass ring lifts out and flies on.
A 6vh gap separates the hero from the Flywheel; docked mosaic → landed Flywheel is ~913px of scroll at
900px tall (was ~1,260). Rows 2–3 are opened up around the statement (rows at
−28.6 / −15 / +19 / +32.6u; statement 2.6u): ~85px of air above and below at 1440×900.

**The ring tile is the live Flywheel (`TileFlight.tsx` + `fwFlight` in flywheel.js).** The Flywheel's own
WebGL canvas is borrowed for the journey. While the ring tile is on screen the canvas is pinned to the
viewport (`.fw.is-flying`), masked to the glass band (`--fx/--fy/--fr`), and flywheel.js draws the ring
at the tile's centre and size (72% of the tile), spinning with the scroll. In the tile the ring is
*calm* (`fwFlight.calm` = 1): no glare and only 35% of the reflections (`uShine`), and bubbles scaled to the ring's size
(they otherwise keep a fixed pixel size). So the small ring pops off its pale tile (Oct 5), it also gets a tile-only
`uPop` (= calm^2.5, gone early in the flight): richer colour through the glass (saturation ×2.6), an indigo depth toward
the silhouette and a bright rim; and the tile shows a soft shadow under it (`.hero-tile--ring::after`, a ring the glass's
size dropped ~10% and blurred, visible below the glass and across the top of the hole; hidden once launched). Only the ring leaves — the tile's glass square stays in the
mosaic. The tile carries a soft stage-colour field (violet / blue / mint / amber) and, while calm, the
ring refracts a tinted studio (`TILE_BG`) instead of the pale neutral one, so the clear glass reads;
it eases back to neutral as the ring lands. As the Flywheel scrolls in (p 0 → 1, from its top 10% of a viewport below
the screen to the anchor line, `scroll-padding-top`, so an anchor jump also ends assembled — starting
there catches the ring while it is still lower than its landing height, so on any screen it only rises) the ring flies
from where the tile was held to where `#fw-slot` will be when the section lands (not where it is
mid-scroll — that would make it dive below the screen first), sized to `--ring-px` (fast departure,
eased landing); on screen it only grows and rises, never moves down, unwinding its spin and tilting up to 0.38
rad mid-flight, its shine returning as calm → 0; the section's backdrop is let in within the section as
it lands (p 0.8–1) and the header lines rise in step. Panels and connectors wait. **After landing**
(`.fw.is-assembling`): each dotted connector draws out from its ring dot (an SVG mask, pathLength 1,
0.65s) and its card rises in, stage by stage (validate → run, 420ms apart). Scrolling back up resets
it, so it replays. Fallback (before WebGL's first frame, no WebGL, reduced motion): the tile shows
`assets/flywheel-ring.jpg`; under reduced motion nothing flies and everything shows at once.

**Reversible flight.** The ring's start point is the tile as it is *now*, held no lower than the landing
height (`y0 = max(tileY, y1)`) — a pure function of the scroll, so scrolling back up retraces the
flight exactly (verified: down vs up within 4px) instead of snapping back to a remembered spot.

**The Flywheel lands flush with the top.** `#flywheel { scroll-margin-top: -104px }` cancels the header
allowance (`scroll-padding-top: 104px`) for this full-screen section — it keeps its own room for the
header, which hides on the way down. The flight, the snap, in-page links and plain anchor jumps all use
that line (`landLine()` / `SmoothAnchors`), and within 1px of it counts as landed (a glide's last step can
leave a sub-pixel remainder).

**Square-style snap, statement → Flywheel (`TileFlight.tsx`).** The first half-viewport of scroll past the
hero's docked statement is free (`FREE_SCROLL` 0.5) — the tile parallax plays at the visitor's pace.
The same applies going back up: the first half-viewport above the landed Flywheel is free. Stop
beyond either free stretch and the page glides on in that direction — to the landed Flywheel; stop while scrolling up and it glides back to the statement. Only after the visitor's
own wheel / touch / key input (within 2s) — never during a link glide. Any new input cancels a glide. The direction of travel only turns after a real move of more than 16px (Oct 5): the small rebound some trackpads send as a swipe ends used to read as "heading back", so a swipe up past the landed Flywheel glided the page back down to it — the header faded, came back, then faded again. Same rule in the hero and Talk band snaps.

**In-page links glide (`SmoothAnchors.tsx`, `lib/glide.ts`).** Links to `#section` ease there (cubic
in-out, 700–1700ms by distance; "See how we work" ≈ 1.35s) instead of the browser's quick jump, landing
clear of the header and keeping the hash. Everything scroll-driven plays along — the ring flies during
the glide. Reduced motion: jumps.

**Smooth scrolling (Lenis, `SmoothScroll.tsx`, `lib/smooth.ts`).** Wheel and trackpad scrolling is
eased by Lenis (`lerp 0.1`); touch stays native. Lenis moves the real window scroll, so every
scroll-driven piece (hero, ring flight, snaps, theme) is unchanged. Link glides and the snaps
(`glideTo`) run through `lenis.scrollTo` with the same easing and durations, and a wheel takes them
over. Because Lenis trails each input by ~1s, the snaps accept the visitor's input from within the
last 2s. The film dialog stops Lenis while open; panels that scroll by themselves carry
`data-lenis-prevent` (film, review panel). Reduced motion: Lenis is off.

## The AI Flywheel (module 2)

Ported from the reference package ("option 2"). It is a full-viewport (`100svh`) light section: a
**refractive glass ring with a flowing water channel**, drawn in WebGL, with five frosted panels around
it joined to the ring by dotted connectors.

**Files.** `Flywheel.tsx` is the markup; `flywheel/flywheel.js` is the reference's `main.js`, kept
imperative so the glass and water behave exactly as designed; `flywheel/flywheel.css` is the reference's
`styles.css`. The engine is wrapped as `initFlywheel(loadThree)` and returns a teardown, so React can mount,
unmount and (in dev) double-mount it without duplicating listeners — verified.

**What it does** (all from the reference):
- **Three render passes:** backdrop → water → screen (thick glass with dispersion, thin-film iridescence,
  seams at the stage boundaries, a fixed upper-right light with a glare that brightens as the ring tilts).
- **Water:** one clockwise stream; colour is a dye field. At rest a slow wave carries colour stage to stage;
  hovering a stage floods the ring with its colour and tints the whole backdrop and the panels.
- **Interaction:** hovering a panel, ring label *or the ring itself* highlights that stage everywhere; a click
  opens the detail dialog. The ring dips toward the pointer. Resting the cursor in the hole lights the centre.
- **Dialog:** stage, headline, description, "What you get", proof, CTA, prev/next. ←/→ step, Esc closes, Tab
  is trapped, focus returns to what opened it, body scroll locks.
- **Performance:** DPR capped at 1.5, water pass at 60% res, backdrop at 30%, frame rate halves after 3s idle,
  and the loop pauses when the section is off-screen or the tab is hidden.
- **Stage colours:** Validate violet · Build blue · Enable green · Accelerate amber · Run pink.

**Changes made for the page** (everything else is the reference verbatim):
- Panels and ring labels are real `<a>` links (the brief requires it). A click opens the dialog instead of
  navigating, so Enter works and "open in new tab" still reaches the service page. Validate's links open
  design.lftechnology.com in a new tab.
- The canvas is `aria-hidden`, so a visually-hidden paragraph (`.fw-sr`) carries the wheel's text alternative.
- The "Option 1 / Option 2" switcher is dropped — it is a design-comparison control.
- Dialog links point at real routes (`/solutions`, `/enablement`, `/engineering`, `/managed-services`).
- CSS is scoped so it cannot leak: the reference's `:root` tokens are scoped to `.fw, .fw-modal` (its `--ink`
  `#0d1411` was then different from the page's ink; since Oct 2 the page uses the Flywheel's palette), its global resets are removed, its `rise` keyframes are renamed
  `fw-rise` (the page's scroll-reveal uses `rise`), and its global reduced-motion rule is confined to the section.
- The modal sits at `z-index: 60`, above the fixed site header. `.fw-head` gets extra top padding so the title
  clears the header pill.
- three.js is `import('three')`-ed on mount, so the panels appear at once and the canvas fades in after.
- **Fallbacks:** if WebGL is missing or the context is lost, `.no-gl` shows a flat conic ring and everything
  else still works; under `prefers-reduced-motion` the flow slows and the ring tilt is damped.

**Where the reference copy differs from brief v8** (the reference is what is built):
| | Reference (built) | Brief v8 |
|---|---|---|
| Eyebrow | none | "The Leapfrog AI Flywheel" |
| Hub text | "At the center / Your business outcomes" | "Your business advantage" |
| Callout examples | e.g. "AI discovery and roadmaps", "Industry accelerators", "Claude rollouts, live in 30 days" | e.g. "Clickable prototypes · User research insights · Brand and launch assets" |
| Dialog headlines | e.g. "Know what's worth building", "Put everyday AI to work for your teams" | e.g. "Test ideas before you build", "Put AI in daily use" |
| Proof | e.g. "RAPID workshop: fully funded for qualified AWS accounts", "$12.3M saved annually with an AI-powered platform", "Fixed scope, fixed fee, live in 30 days" | SecondLook Health + bracketed placeholders |
| Detail view | modal dialog | panel below the wheel |
| Cues | none | "Turnkey" / "À la carte" lines under the wheel |
| Mobile | wheel above a horizontally scrolling row of panels | wheel above a stacked, tap-to-expand list |

The brief's launch checklist still applies to the reference's claims: confirm the RAPID/AWS funding wording,
the "$12.3M saved annually" attribution, the "live in 30 days" fixed-fee offer, and that Claude (rather than
"Amazon Quick") is the right tool name.

### Version 2 under review — chips + card row (Oct 3)
Alternative layouts, switchable on the live page with the review button (Flywheel V1–V5) (bottom left, `FlywheelSwitch.tsx`; stored in `localStorage['fw-variant']`, linkable with `?fw=1` / `2` / `3`, applied to `html[data-fw]` before paint by a script in `layout.tsx`).
- **V1** (default): the five cards around the ring, the header and cards at 80% (`zoom: 0.8`), the section one screen tall.
- **V2**: header and cards at full size (no zoom). Each stage is a glass chip (icon, number, service name) at the end of its connector, in the positions the cards held; the five cards sit in one row below the ring (equal widths) and rise in one by one when the row scrolls into view. The section grows taller than the screen (≈1390px at 1440×900); ring height `clamp(380px, min(60svh, 44vw), 640px)`.
- Arriving from the hero, V2 draws each connector and brings in its chip (instead of the card). Chips open the stage dialog like the cards.
- **V3** (Oct 3, after apple.com/iphone-duo "Take a closer look" — the product viewer): the header on top, centred and full size as in V1/V2; below it the ring on the right (larger: up to 64% of the section height) and an Apple-style stage list on the left. Closed stages are 56px glass pills (⊕ + service name); the open one is a card (step, "**Name.** what you get", View details → the dialog). Opening morphs pill ↔ card — width and height together, 0.33s `cubic-bezier(.4,0,.2,1)`, no bounce (re-measured frame by frame on Apple's). The card's text is clipped to the item's rounded shape (a mask) while it morphs: opening, it rises 28px with the morph while invisible, then fades in (0.5s ease-in-out, after 0.33s); closing, it fades (0.3s) as it sinks 28px (0.4s). The pill's label fades back in after 0.35s (0.4s ease-in-out). Up/down arrows in the left margin step through and stop at the ends — disabled (42%) on the first / last stage, as Apple's (hidden below 1100px). The ring lights the open stage (`data-pin` on the section, read by flywheel.js); a click on the ring or a ring label opens that stage in the list (`fw:pick`) instead of the dialog. No connectors. From the hero: the ring lands, the header reveals, then the list items arrive one by one.
- Phones (≤820px): every version uses the swipeable card row; the chips and the list are hidden.
- Once a version is chosen: remove `FlywheelSwitch`, the `layout.tsx` script and the unused rules/markup.

## Why Leapfrog — pillar explorer (after concourse.ai "Agents built to own the work"; layout after squareup.com "Point of sale", Oct 4)
**Layout (Square's Point of sale):** the head stays centred above (mono eyebrow "Why Leapfrog", the heading, the intro); below it the section is one full-width split, `min-height: max(84svh, 760px)`. The **left column** starts at the page margin (`--why-edge`), ~480px of content plus a 40–96px gap: the three pillars as an accordion — thin dividers, 18–20px/500 titles (hover: fade to 70%, 0.25s), a +/− at the right that turns like the FAQ's — centred vertically beside the panel (Oct 5). It is centred at its tallest (the pillar with the longest text open: `.why-side-main` gets a measured `min-height`, list at its top), so the titles hold still as the pillars take turns. The split has `overflow-anchor: none`: otherwise, with the section's top scrolled above the window, the browser re-anchored the scroll to the growing/shrinking pillar text and the whole section (panel included) jumped on each switch. ("And we stay." moved into the Real results scene, Oct 4.) The **right panel** runs full-bleed from the column to the viewport's right edge, the section's full height, its left corners rounded 24px (`--radius-xl`), the right edge square against the screen; on phones, square. ≤900px (Oct 5, as Square's Point of sale on phones/tablets): no side panel — the open pillar's picture sits inside the accordion, between its title and its text, within the page margins (16px corners; square at tablet widths, 640px tall on phones, 800px for the agents scene); no auto-advance and no progress line when stacked (it would move the page under the reader) — a tap opens a pillar. Phones: the partner row stays on one line (smaller badges) and the proof strip tightens; each picture is only as tall as its scene needs (540px; 600 for the client card; the agents scene fits its content exactly — top band, 24px, the stack, 24px, partner row — via `--scene-h` measured in Scene, cards at their normal size and spacing) and step/media spacing is tightened, so the stacked section stays short. The "On every engagement" commitment line is removed.
- **Left (behaviour):** the open pillar shows its text (no tags). It plays by itself: a line fills the divider above the open pillar over **8s**, then the next opens; it plays only while the section is properly in view (60% of it, or 60% of the screen), holding the line and the agent cards where they were otherwise and resuming from there; it pauses **while the pointer is on the picture panel** (or keyboard focus is in the section — not a mouse click), and only plays on screen. Reduced motion: no auto-advance.
- **Right:** the full-bleed picture panel, one scene per pillar crossfading (0.6s, photo settling from 1.06×), a soft dark gradient, and proof in glass boxes along the bottom (Concourse's stat strip), rounded 16px.
  - **Deep AI expertise — "We run it on ourselves"** (`AgentFlow.tsx`, after Concourse's Close Agent, measured frame by frame): the five delivery agents (OWN_AGENTS) as white cards — an icon box on the left, the agent's name on top, what it does below; a **Live** chip (pulsing green dot) top right on Review, Test and Evaluation agents, running today. Down a column, for each card: the hairline from the card above draws (0.28s), then the card arrives over 0.68s as Concourse's do — a faint, very wide glow (blur 30px, 18%) → a bright plain white shape (blur 14px, contents hidden) → contents coming through as the blur clears (8px → 3px, content 30% → 62%) → sharp, and only then its white rim. Next line starts 0.84s after the previous. **Plays each time its pillar opens** (on screen), no loop; the finished stack stays until the pillar closes. Cards are styled as the Real results cards (white, radius 10, 38px dark icon tile, 14px/500 name, a "Live" tag on Review, Test and Evaluation agents — since Oct 5 a small green pill: 11px/600, green text on 14% green, 3×8px, with a 5px pulsing dot). Above them, full width across the top of the panel on a blurred, dimmed band (as the Client results cards' text: 15px blur, 25% black) that stays within the band and fades to nothing at the white line under it — nothing spills past the line: "**We run it on ourselves.** Agents build, test, validate and operate our own code and products, and our engineers approve every release:". The cards are centred vertically between that band and the partner row. Reduced motion: all five, still. **Bottom:** the partner credentials, flat white as in the hero (`*-mono.svg`), one still row on a blurred band (the intro's band upside down: 15px blur, 25% black) that starts at a thin line above and deepens downward, contained in the band — no bordered box.
  - **Boutique attention:** the scene's photo (`attention.jpg`, with the shade) as the background, and over it, centred, a client story card (Oct 5; after webflow.com's customer stories, then set as a card) — `ClientCard` in WhyLeapfrog.tsx. Styled as the agent cards (Oct 5): white, radius 12, a 3px white-35% rim and the agents' drop shadow, dark type (label #36423c, role #56625c, a dark-18% bar, the logo in its own colours), max 680px; it builds in as they do — `ag-arrive` 0.8s (glow → plain white shape → contents through the clearing blur) each time the pillar opens on screen (Scene's `is-built`), reset when it closes. Layout: Sierra Manker's portrait (`story-portrait.png`) filling the left ~34%; on the right a 36px/600 figure ("9 weeks", UNVERIFIED) with its 17px/500 label, the 17px quote (hanging open-quote), the 17px/500 name, then the 13.5px role ("Cofounder & Head of Product"), a 1px white-40% bar (20px) and the SecondLook logo in white, 22px tall (18px on phones) — bar and logo wrap together. ≤640px: the card becomes Webflow's customer-story card (as first designed) — the portrait fills the whole 600px picture (face in the upper half), the story over a blurred band along the bottom (a blurred copy of the portrait faded in from 38%, under a light-to-dark tint), smaller type, the logo on its own line (no bar). (Tried and dropped on the way: the portrait filling the whole panel with a blurred band, Webflow's hover video, pause button and round arrow; the old Days / Same people / On demand strip.)
  - **Progressive blur behind the bands (Oct 5, as the Boutique attention card):** the blur behind "We run it on ourselves", "And we stay." and the partner row is no longer `backdrop-filter` (its mask fade rendered a hard edge). Each scene has a second, blurred copy of its photo (`.why-photo--blur`, 15px, under the shade) masked to the bands: fully blurred at the panel's top edge, clearing past the top band's line (to 1.25× its height); at the bottom, coming in from just above the partner row's line and full by its middle. Band heights are measured into `--band-top` / `--band-bottom` (Scene); the 25% black tint stays on each band's `::before`.
  - **Real results, faster:** across the top, on the same blurred band as "We run it on ourselves" with a line below: "**And we stay.**" over "We measure our work by your metric…". Then the path as three cards (agree the metric → first use case live → each next one faster), built in as the agents (Oct 5): down the column the line from the card above draws (0.28s), then the card arrives (`ag-arrive` 0.68s), the next line 0.84s after — each time the pillar opens on screen; centred between the top band and the proof strip, 24px clear of each (measured: `--band-top`, `--stack-bottom`; phones: 24px gaps, cards the column's width less 48px, and the picture fits its content via `--scene-h`); strip: 9 weeks ("From kickoff to live" — the client name dropped, Oct 5) · 70–90% · Weeks (SecondLook figures — UNVERIFIED, from the Figma story).
- Photos (Unsplash placeholders, free licence), `public/assets/why/`: expertise.jpg — Arnold Francisca (unsplash.com/photos/f77Bh3inUpE); attention.jpg — Annie Spratt (hCb3lIB8L8E); results.jpg — Carlos Muza (hpjSkU2UYSU).
- ≤900px: the list stacks above the panel.

## Why Leapfrog V2 — scroll story (after bayshore.ai "Business Waits. Compliance Drowns.", Oct 4)
Switch: review button → "Measured by your outcomes" V1 / V2 (`?why=2`, `html[data-why]`). The head (eyebrow, title, intro) is shared; V1 is the explorer above.
- Bayshore's structure (measured): a sticky step index (01 Problem / 02 Solution / 03 Impact, the active number in a filled box), text blocks one per screen (heading, lead, three square bullets) scrolling normally, and a sticky full-height panel on the right whose scene crossfades per step (Bayshore plays a Lottie per step on a dark colour).
- Ours (`WhyStory` in WhyLeapfrog.tsx): two columns — text (from the page margin, ≤460px) | panel (to the right edge, left corners rounded 24px). No step index and no bullets (both removed Oct 4). Each step is 100svh, its text centred vertically in it (Oct 5; was at its top, 120px in), so the active text sits level with the middle of the pinned panel: 30–40px/500 title and the pillar body; inactive steps sit at 35% opacity. The step crossing the middle of the screen is active; the panel (sticky, 100svh) shows the same three scenes as V1 (`Scene`), crossfading; the agent cards play while the story is on screen. In the narrower panel the quote and proof figures scale down. ≤900px (Oct 5, as Bayshore's on phones/tablets): no pinned panel — each step is its title, its text and then its own picture (same sizes as V1 stacked), steps divided by hairlines; each picture plays its scene once half of it is on screen.
- ≤900px: steps stack with the panel (600px) after them.

## Typography — no orphans (Oct 5)
Page-wide (globals.css, after the base reset): headings, `dt`, figcaptions and short labels (`.panel-items > span`, `.why-strip dd`, `.story-who small`, `.story-facts dd`, `.stage-tab-body` — the Start focused tab descriptions, each checked open at 1440 / 1280 / 1024 / 820 / 390px) use `text-wrap: balance`; running text (`p`, `li`, `dd`, `blockquote`) uses `text-wrap: pretty`, so no line ends on a single word. A block's own `text-wrap` still wins. Checked with a script that finds one-word last lines in every visible text block, at 1440 / 1024 / 390px, for the default versions and fw 4 / why 2 / roadmap 2 / talk 2: 24 found before, 0 after (Chrome). Browsers without `text-wrap: pretty` (Firefox, older Safari) fall back to normal wrapping.

## Start focused V2 — tabbed photo panel (after siteassist.com "What we do", Oct 4)
Switch: review button → "Start focused" V1 (the four stage cards) / V2 (`?roadmap=2`, `html[data-roadmap]`). Head, support block and the rest of the section are shared.
- SiteAssist (measured): a large rounded video panel; mono capitals title top-left, the step number top-right; four tabs along the bottom, each over a hairline. The open tab shows its description and a line fills its hairline (~5s, eased in and out), then the next opens and the media changes. Inactive titles at 54%.
- Ours (`StageTabs.tsx`): a full-width rounded (24px) photo panel, `clamp(560px, 72vh, 720px)` tall, a photo per stage crossfading (0.8s, settling from 1.04×), a touch richer (saturate 1.08, contrast 1.04). Since Oct 5 the type is Tomato Grotesk (was mono capitals): top-left the stage and its timing ("Assess · 2–3 weeks", 26–38px/500); top-right its number (01–04, same size, tabular) — both close to the top edge (20–28px in, 24–36px from the sides). Over the photo, the dark scrim as before (55% at the top → 15% at 40% → 75% at the bottom); a progressive blur was tried and dropped (Oct 5). Phones: the scrim deepens from the middle (62% at 55%, 80% at the bottom), where the tabs stack. Along the bottom: Assess / Launch / Expand / Run and improve, 18–22px, inactive at 54%, each with its stage icon on a 36px tile before the name (Oct 5; the V1 cards' icons, drawn as masks) — frosted white-14% and dimmed while closed, filled with the stage colour (`--sec`) with a white icon once open; the open one shows its description (grows open, 0.5s) and a white line fills its hairline over 5s (`cubic-bezier(.45,0,.55,1)`), then the next opens. Plays only while half the panel is on screen, holding otherwise; click opens a stage. Reduced motion: no auto-advance. ≤900px: tabs in a 2×2 grid (one column ≤560px).
- Photos (Unsplash licence, `public/assets/stages/`): assess.jpg — Slidebean (unsplash.com/photos/iW9oP7Ljkbg); launch.jpg — Vitaly Gariev (jPLvaZ06uy0); expand.jpg — Arlington Research (kN_kViDchA0); run.jpg — Tasha Kostyuk (TtMKq3lJm-U).

## Client results — photo panels (after Square's "Keep your business growing", Oct 3)
Measured on squareup.com (HomePageV3AudienceMoment) and rebuilt in `Results.tsx`:
- Header: mono uppercase eyebrow ("Proven in production") over the title.
- A full-width row of 4 photo panels (20px apart, `clamp(460px, 64svh, 736px)` tall, max 1600px, radius 16px). The open panel takes 50% of the row; the others share the rest, shaded `rgba(0,0,0,.5)` (0.4s decelerate) with the result's name ("Saved in one year" …) mid-left, 28–36px in a 190px column, fading over 0.3s. Hover or focus (or tap) opens a panel — `flex` over 0.4s `cubic-bezier(0,0,.2,1)`.
- Photo zoom, as Square's: no transform — the photos are near-square (1500×1526, Square's own ratio) and `object-fit: cover`, so a narrow panel fits them by height and an open one by width; they grow ~30% as the panel opens and shrink as it closes.
- The result is a drawer at the bottom (re-measured frame by frame, matched within ~20ms): its 20px padding appears at once, then it grows up from the bottom edge (`grid-template-rows` 0fr → 1fr, 0.4s decelerate, after 0.2s) with its blurred fade (15px blur, 25% black, masked transparent → black) growing with it, the contents riding up with its top edge. After 0.3s the rule and the row fade in (0.4s accelerate), the number rises 0.25em (0.2s), the sentence rises 10px (0.4s decelerate, +0.1s) and the links fade in last (+0.2s). Closing: all fade (0.4s accelerate) as the drawer folds away, no delay. Industry tag top-left slides down 6px into place as it fades in (0.4s decelerate, after 0.3s). The rule sits 20px into the drawer, `rgba(255,255,255,.55)` (Square's reads as a soft light grey over the photo, not pure white).
- Drawer layout (Oct 5): under the rule, the big number and its sentence ("Saved in one year. We built…") are one group on the left (`.growth-main`, 10px apart, sentence ≤44ch), and "Case study →" sits to the right, vertically centred on the group. The "How we did it: AI Solutions" link was removed (`service` / `serviceHref` stay in `METRICS`, unused). The client's logo (`METRICS[].logo`, white, 24px tall, a faint shadow) sits top right of the open panel, opposite the industry tag, and arrives with it — SecondLook's on every panel as a placeholder. Behind the tag and logo, a progressive blur along the open panel's top (Oct 5): a blurred copy of its photo (14px), full to 36px and clear by 120px, under a 28%→0 black tint; it fades in and out with the tag (`.growth-top-blur`, `.growth-top-tint`).
- Scroll-in ("media-scale"): each panel opens out from a 25% inset (1.2s expo out, 90ms apart) while its photo settles from 1.2×.
- ≤820px: stacked — closed panels are 84px bars, the open one `max(440px, 62svh)`.
- The industry strip (lead + Healthcare / Financial services / Education chips) was removed Oct 4; its line became the lead under the title; since Oct 6 the lead reads "Real results where the bar is highest. Faster cycle times, better customer experiences and teams freed for higher-value work, with security and compliance (HIPAA, PCI DSS, GDPR and more) handled from day one as table stakes." — and the second panel's industry tag is Education (was Across industries) (`RESULTS_LEAD`, `.results-lead`, rises in like the other leads). The featured story follows (see the Story row in the component table).

Photos (Unsplash License — free to use, credit appreciated), in `public/assets/results/`:
- `healthcare-savings.jpg` — Vitaly Gariev, unsplash.com/photos/egCFrNJ6Djw
- `roi-team.jpg` — Andreea Avramescu, unsplash.com/photos/wR56AUlEsE4
- `finance-documents.jpg` — Amina Atar, unsplash.com/photos/Mqc-m8kgxkg
- `clinical-review.jpg` — Mehmet Talha Onuk, unsplash.com/photos/ulgXpe46C54

## Straight answers — accordion (after Square's "All you need to do it all", Oct 3)
Measured on squareup.com/us/en/services and applied in `Faq.tsx` with the FAQ's own styling kept:
- The answer grows and folds: `grid-template-rows` 0fr ↔ 1fr, 0.3s `cubic-bezier(.4,0,.2,1)`, starting 90ms after the click. Its text fades in as it opens (0.15s decelerate, after 70ms) and out first as it closes (0.15s).
- The plus / minus is drawn as two 14×1.5px lines (same ink, disc and size as the old faq-plus/minus SVGs) and turns like Square's: both rotate half a turn and the upright line shrinks away (0.4s `cubic-bezier(.4,0,.6,1)`, after 90ms).
- Any number of answers can be open (Square's opens one at a time); **Expand all / Collapse all** under the title opens or closes them together (its label follows the state). Closed answers stay in the page but are `inert`.

## Flywheel V4 / V5 — the liquid plays (Oct 4)
- **V4**: V3's layout (stage list left, ring right). The colour wave travels round the ring on its own (clockwise, ~5s a stage) and floods each stage it passes (`act` 0.85 instead of 0.4); as it reaches a stage, that card opens in the list (`fw:flow` event / `data-flow` from flywheel.js → StageList). A choice by the visitor — a pill or the ring — holds that stage (`data-pin`, the wave waits there) for 8s, then the colour flows on from it. Hovering the ring still takes over while the pointer is on it.
- **Oct 5:** V4/V5 have no up/down arrows (V3 keeps them). The promise line (since Oct 6: "Our **AI flywheel** turns quick wins into momentum that builds across your business." — "AI flywheel" highlighted in brand ink, as the old line's highlights; was "We start your flywheel with…") moves from the header to above the list, left-aligned, 22em wide (`.fw-list-lead`; the header copy `.fw-head-promise` is hidden ≥821px; phones keep it in the header). While the section arrives and its pills rise in (`.is-flight` / `.is-assembling`), the list ignores the travelling colour, so no card morphs open mid-entrance (that read as the cards juggling); it catches up with `data-flow` once they're in.
- **V5**: V4 on a dark ground. The section reports `data-theme="dark"`, so the page turns night around it — and its dark styling and ring backdrop apply only while the page theme is dark, so it turns light with the page as the next, light section takes over (eased, not snapped); the ring's backdrop goes dark with each stage's colour mixed into night (flywheel.js `darkMode()`, studio reflections dimmed, window panes off); ink, glass, stage inks, list pills and ring labels have dark-ground values (`html[data-fw="5"]` in flywheel.css).

## Review button — section versions (Oct 4)
`VariantSwitcher` (bottom-right floating button; panel above it; badge = sections not on their default) replaces the old bottom-left switch. **All versions live in `app/lib/variants.ts`** — a group per section (`key`, `label`, options with a short note). The choice goes to `<html data-{key}>` (nothing for the default), `localStorage["variant:{key}"]`, and links with `?{key}={value}`; `variantScript()` applies them in `<head>` before paint. To add versions for another section: add a group there and style with `html[data-{key}="…"]`.

## Talk band snap (Oct 3)
Square-style, as the hero → Flywheel snap (TileFlight): between the band entering (its top at the bottom of the screen — the FAQ fully in view) and the scene revealed (half a viewport into the pin, U 750: title, subline and button home), the first half viewport of scroll each way is free; stop beyond it (260ms idle) and the page glides on in that direction (`glideTo`, cancelled by any input). Only after the visitor's own wheel/touch/key input; off under reduced motion (the band doesn't pin then). Both Talk versions.

## Talk band V2 — the Flywheel in place of the rings (Oct 3)
Switchable with the **Talk V1 / V2** row of the review switch (`?talk=1|2`, `localStorage['talk-variant']`, `html[data-talk="2"]` before paint).
- V2 hides the ripple rings and runs a **decorative copy of the glass Flywheel** behind the title: `initFlywheel(loadThree, { decor: true, root, canvas, slot, seams: false, dark: true, palette, ringPx, pose })` (flywheel.js). Decor mode: no labels, cards, connectors, dialog or hero flight (detached stand-ins), its own flight state; `seams: false` removes the five stage separators from the glass (`uSeamOn`); `dark` makes the backdrop fade to its base (#0d1411, the band's ground) instead of white; the palette is dark green / violet clouds.
- Scrubbed with the band's timeline: fades in over U 0–420, grows from 35% to full size (quad out, U 0–1300) while turning ~0.9 rad and untilting (0.32 rad → 0). Full size = `min(0.96 × viewport height, 0.9 × width)` — the title, subline and button sit in its heart. (A ring larger than the screen showed refraction artefacts at its edge, so it stays within the viewport.)
- **Follows the cursor:** the copy listens to the pointer anywhere over the band (`pointerRoot`), the whole band counting as over the ring: it tilts toward the cursor (the Flywheel's own pointer tilt) and the water floods the stage beneath it with colour, the light travelling with it.
- On the dark band the glass's studio reflections are tuned down (`uStudio` 0.35) and its window panes switched off (`uWin` 0), which otherwise read as hard white blocks on the inner rim.
- The subline is `text-wrap: balance` (three even lines, no lone "value.").
- The WebGL copy starts only while V2 is showing and only renders while the band is on screen.

## Page theme — light ⇄ dark as you scroll

The **whole page** changes colour; there is no gradient band. Sections that sit on the page colour are
transparent, and `<html>` carries the colour with a CSS transition.

- **Declare:** every section has `data-theme="light"` or `"dark"` (hero, credibility, Flywheel, Why, roadmap,
  insights, FAQ are light; results, the closing band and the footer are dark). Adding a section needs only
  that attribute — the boundaries are not hard-coded.
- **Switch:** `ThemeController` sets `<html data-theme>` to the theme of the last section whose top has crossed
  a line at **60% of the viewport height** (was 90% until Oct 4 — moved up so the incoming section is ~40% into view
  before the page turns), on a passive, rAF-throttled scroll listener.
- **Animate:** `html { background-color: var(--page-bg); transition: background-color 700ms cubic-bezier(.4,0,.2,1) }`,
  with `--page-bg` flipping between `--paper` (`#e8eaec`) and `--night` (`#0d1411`). `<body>` is transparent so the colour reaches the canvas.
- **Was 90% because:** at that moment the incoming section has only just appeared, and what is still visible of the
  outgoing one is its bottom edge — in every case a card or band with its own surface (commitment band, story
  card, FAQ cards). So the page colour can change underneath without hurting legibility. The
  incoming heading sits a full padding below its section's top, so it arrives after the colour has mostly settled.
  **At 60%** more of the outgoing section is still on screen when the colour changes; its text follows the theme
  tokens, so it re-colours with the page rather than becoming unreadable.
- **Tuning:** `LINE` in `ThemeController.tsx` (earlier/later start) and `--theme-ms` in `globals.css` (speed).
- **First paint:** set instantly (`html.theme-instant`), which stays on until the window has loaded plus 350ms, so a
  reload or `#hash` deep link into a dark section paints dark immediately instead of animating in from light.
- **Progressive enhancement:** the transparent rules apply only under `html.js-theme`, so without JS every
  section keeps its own background. Reduced motion makes the change instant (global reduced-motion rule).
- **Left alone:** surfaces that are always one colour — the Flywheel (its own canvas and backdrop), the closing
  image band, the footer, the header pill, and all cards and chips.

Measured: ~0.9s monotonic tween, settling exactly on the dark and light page colours (now `#0d1411` / `#e8eaec`), at all three
boundaries (Why→Results, Results→Roadmap, FAQ→Talk) and when scrolling back up.


**Whole-page theme (Oct 2 2026).** The theme is no longer only the background. Every section's
text, cards, borders, chips and icon tiles read theme tokens — `--fg`, `--fg-2`, `--fg-3`, `--accent`,
`--card`, `--card-hot`, `--card-border`, `--hair`, `--panel-hi`, `--panel-drop`, `--rule`, `--pill-bg`,
`--pill-border`, `--icon-bg`, `--commit-bg`, plus `--tint-pct` / `--tone-ink-pct` that build
`--tone-soft` / `--tone-ink` from each card's stage colour. They are registered with `@property`, so
`<html>` transitions them with the background: whatever is on screen at a light ⇄ dark boundary fades
to the new theme together (no light cards left on a dark page, or white text on a light one).
Fixed exceptions: the hero and header (always light), the white story card, and the commitment band's
text. Dark-ink SVG icons (FAQ ±, insight arrows) invert in dark. The footer is hidden for now
(`page.tsx`; `SiteFooter.tsx` kept).

## Reveal motion — "rise" (cube-motion.dev)

12px lift + fade, 640ms, `cubic-bezier(0.2, 0, 0, 1)`, siblings staggered 60ms, once, with a
10% bottom viewport inset. Hero rises on mount (90ms stagger). `--rise-lift` goes to `0px` under
`prefers-reduced-motion`, leaving the fade. Implemented to spec in `RevealController` rather than
installing `cube-motion`: the npm package resolves to a different repo owner than the site credits.
Grids whose children stagger individually (`.metrics`, `.stage-grid`, `.pillars`, `.results-grid`)
are excluded as parents so nothing fades twice.


### Section text — squareup.com's reveals (Oct 3)
Measured on squareup.com at 1440×900 and applied by `RevealController` (`html.sq-text`):
- **Headings** (Why, Results, Roadmap, Insights, FAQ titles; story headline; "Choose how we work together"): split into words; each starts 100px low at 20% opacity behind its own clip (`clip-path: inset(-0.5em)`), rising home over 1s, expo out `cubic-bezier(0.16,1,0.3,1)`, words 30ms apart.
- **Intro text** (section leads, industry lead, commitment line): the block rises 100px, 20% → 100%, over 1.4s, same curve.
- Plays **once**, the first time the text's top enters the screen, then stays (no play-back on scrolling up or down again). Cards and other blocks keep the "rise" above; a block holding section text passes the rise to its other children.
- Not applied by scroll to the hero or the Talk band (scroll-scrubbed). The Flywheel header uses the same word reveal, but TileFlight triggers it (below).
- **Flywheel header waits for the ring:** while the ring flies in from the hero tile it is drawn in front of everything in the section (`z-index: 4`), and the header (title, pain line, promise) is fully hidden (0%, not Square's 20%). Once the ring has landed **and the header is on screen** (IntersectionObserver — a page opened further down plays it as you scroll back up to it), the header plays the split-word reveal: title at 0ms, pain line +260ms, promise +420ms (`--sq-d`). It plays **once** (Oct 5; it used to play back on take-off and replay on every landing): before the first landing a take-off still hides it; after it (TileFlight adds `.was-built`) nothing replays and nothing fades — the header, cards, connectors and ring labels stay fully visible while the ring takes off and lands again (Oct 6: the scroll-linked fade-out / fade-in tried on Oct 5–6 was removed). — no word replay, no card rise-in, no connector redraw (`.fw.was-built.is-flight` in flywheel.css; V1/V2 cards fade one by one since their row is `display: contents`). Landing directly on the section (anchor or reload) reveals it at once. flywheel.js measures the header's word clips (which never move) when lifting panels 01/02.
- Reduced motion: off (text shows at rest).

## Contact (module 8)

There is no inline form. Every "Talk to our team" CTA — hero, nav, the three section-5 links and the
closing band — opens `/contact`. Section 5 links arrive with `?model=advise|build|deliver`, which
pre-selects "How would you like to work together?" (still editable). Fields: name, work email,
company, interests (multi-select; "Not sure yet" is exclusive), working model, "where are you today",
one sentence. **No backend is wired up** — submit shows the confirmation state only.

## Decisions where the brief and Figma disagree

| Topic | Brief v8 | Figma | Built |
|---|---|---|---|
| Hero layout | 10–15s loop **behind** the text, darkened overlay | Split: text left, video card right | **Figma.** The silent loop plays in the card with Figma's scrim; play disc and "Watch the film" open the film dialog |
| Hero copy | New headline, subhead, one CTA | Old headline, two CTAs, "Helped lead 100…" label | **Brief** |
| Services section ("Find the expertise…") | Replaced by the Flywheel | Present | **Dropped** |
| "From early validation to delivery" (Research…Launch) | Not in brief | Present | **Dropped**; its card style is reused for the four roadmap stages |
| Customer review band | Quote lives inside "Boutique attention" proof | Standalone band | **Quote moved into the pillar** |
| Why Leapfrog theme | — | Dark | **Light variant.** Chosen when the Flywheel was a dark section; the Flywheel is now light, so the Figma's dark version would sit next to it without clashing. Easy to switch back |
| AI Flywheel | Wheel, cards, panel below | No frame in Figma | **Reference package** (WebGL glass ring, modal dialog) — see its section |
| Insights carousel | Three resources | Carousel with arrows | **Three-up grid**, no arrows (nothing to scroll) |
| Credibility strip | Six badges, no captions, even height | Two logos with captions | **Brief** |
| Header CTA | "Talk to our team" | "Schedule a call" | **Brief** |

## Assets

All 40 images/icons are Figma exports in `/public/assets` (no Figma URLs remain in code). Exceptions:
`hero-poster.jpg` is a frame captured from the actual loop video, because Figma's still showed a
different person from the supplied footage. Two Figma "PNG" exports were JPEGs and are saved as `.jpg`.
The Anthropic badge is a stack of masked layers in Figma and is reproduced as exported
(`.anthropic-layer a1/a2/a3`).

## Still open — launch checklist items the page cannot resolve

| Item | State on the page |
|---|---|
| Badge artwork | Real art for **AWS (Generative AI)** and **Claude**. AWS Agentic / DevOps / Healthcare and **SOC 2** show dashed stand-ins (`BADGES` in `content.ts`). Confirm Claude **Select Tier** is awarded. |
| Hero loop / film | Both are stock placeholders. The loop should be 10–15s of approved footage; the film needs rights, captions, transcript and poster. `hero-captions.vtt` holds one placeholder cue. |
| Results cards | Metrics are fixed by the brief. Industry, "what we did" and the **AI Solutions** service tag are **unverified** invented context — "publish only sourced cards". |
| Featured story | SecondLook Health, **9 weeks**, "review time down 70–90%" and the clinical-record workflow come from the Figma file, not the brief. Problem and "what's next" are `[bracketed]`. |
| Proof points | Four flywheel proofs are the brief's own `[bracketed]` placeholders. |
| "Boutique attention" quote | Sierra Manker's quote is from Figma. Confirm permission and that it fits "responsiveness". |
| "We run it on ourselves" | Shows **all five** agents (the brief's copy). Engineering must confirm which are live and trim `OWN_AGENTS`. |
| Commitment band | Published as written; the brief says only once confirmed as standard practice. |
| Insights | First card is the multi-year agentic roadmap piece the brief asks for, with a **descriptive, unpublished title**. |
| Footer links | All point at lftechnology.com. |
| Contact form | No backend. |

**Design benchmark:** the 65%-fewer-hours figure is internal and must stay out of the results
strip. It is not used anywhere. Do not add it.


## Review panel additions (Oct 5)
- **Primary colour** group (`brand` in lib/variants.ts, shown as swatches): Leapfrog green #038E43 (default), deep teal #014841, forest green #28775C. `html[data-brand]` sets `--brand`, `--brand-ink`, `--brand-lit` and `--accent` (globals.css, and the Flywheel's own tokens); every green tint that was a hard-coded rgba(3,142,67,…) is now a `color-mix` of `--brand`, so glows, focus rings and FAQ states follow. The logo mark keeps its own green.
- Picking a section version glides to that section (`target` / `targetOffset` per group: flywheel, why, work-together, talk at its revealed point), so the change is in view; colour options stay put.

## Hero partner tiles (Oct 6, final arrangement)
- Row 1: Validate · 500+ AI-accelerated experts · Build · AWS Healthcare Services Competency.
- Row 2: 100+ AI initiatives led · Claude Partner Network "Select Services Partner" (`claude-select-chip.svg`, Figma 538:3101, the lockup only, 70% of the tile tall — as large as the AWS badges' artwork; swapped with 100+ on desktop, Oct 6) · the ring · 150+ Person AI CoE · Enable. (Build ↔ Healthcare and Enable ↔ 150+ swapped on desktop only; phone spots unchanged.)
- Row 3: Run · AWS AI Services Competency (phones: this slot's spot) · the video · Agentic AI · Generative AI (service tiles: the name over "Consulting services" in the stat tiles' label style — small bold spaced capitals, ink-3; no dot).
- Row 4: the team photo (`support-team.jpg`, back from row 2) · Accelerate · 250+ Products · AWS DevOps Services Competency.
- AWS competency badges at 70% of their tiles. Tried and dropped the same day: a wide AWS AI Services badge with its service list (files `aws-ai-services-wide*.svg` kept, unused), the Claude chip with its cream card, a combined two-service tile (the `service` tile still accepts a list of names), the client portrait tile.

## Client results V2 — client stories as tabs (Oct 6)
`html[data-results="2"]` (review button "Client results delivered"; `ClientStories.tsx`), after the Figma "Tab Container" (LF AI Landing Page, node 2111:132), replacing both V1 blocks (the photo panels and the featured story); the head and lead stay.
- Tabs: three equal columns, 85px tall, 10px apart, radius 16 — the open one white with its logo in colour (SecondLook) or dark ink (laudio, Signetic are white-only SVGs; their 50% fill-opacity from the Figma export was removed Oct 6 so they read fully dark when open), the others faint glass (5% white) with white logos at 60%. A 4px brand-green line fills along the open tab's foot over 8s, then the next story opens; plays only while the block is ≥40% on screen, holds while the pointer is on the card; click to open. Reduced motion: no auto-advance. Logos from the Figma (`public/assets/clients/`), at its widths (193 / 83 / 92px), scaled ×0.75 ≤900px and ×0.5 ≤560px.
- Card: V1's featured story card styling (`story-card`, white, radius 24, no border/glow): the person's photo on the left with name and role on a progressive blur along the foot (bottom only); on the right the quote (19–24px Tomato Grotesk, hanging open-quote — the Figma's serif italic not used, to keep the card's type), four facts in a 2×2 grid (V1's `story-facts`: Live in / Scope / Integration / Measured result), "Read full story" as the primary button. Switching stories (Oct 6): all stories sit in the card at once, stacked, so the card keeps the tallest story's height and nothing below jumps; the photos crossfade (0.8s), the new one settling from 1.06× (1.4s), its name rising in after 0.3s; the old text steps out (0.25s) while the new quote, facts and button rise in 12px one after another (0.6s, 80ms apart, from 0.15s). (Was: the whole card re-mounted and faded in from blank.) ≤900px: stacked; ≤560px: facts in one column.
- Content (`CLIENT_STORIES` in content.ts): SecondLook from the Figma, its quote the one already used on the page (the Figma's carries lorem ipsum) — UNVERIFIED. **Laudio and Signetic are placeholders** (bracketed quote, person, facts; photos borrowed from the Results panels).
- Partner marquee and the Deep AI expertise partner row (Oct 6): the wide "Claude Partner Network" wordmark is replaced by the Claude "Select Services Partner" lockup (Figma 538:3101) — `claude-select-mono.svg`, all fills white for the flat-white rows (colour original `claude-select-chip.svg`), `kind: 'lockup'`, 62px tall in the marquee (52px in the Deep AI expertise row), as tall as the square AWS badges.
- **Flywheel V1, full size (Oct 6):** ≥821px the header and the five cards are no longer zoomed to 80% (`html:not([data-fw])` in flywheel.css). Each card point sits on one line (`white-space: nowrap`); the side cards share their column's width (min(100%, 340px)) so each pair matches, the bottom card is as wide as its content. The heading keeps the page's `--head-gap` (48–80px) above the ring (was ~35px); the ring's column is min(36vw, 64svh) to give the cards room; the stage is max(640px, min(86svh, 900px)) tall and the section runs taller than one screen (1148px at 1440×900) — the snap still lands the section's top flush with the screen.
- **Oct 6, later:** the hero's 6vh bottom margin is gone (the Flywheel follows the hero straight away), and V1's header sits closer to the top (padding-top clamp(80px, 10svh, 100px), just clear of the site header), so the gap between the last tile row and the Flywheel is short. V1's bottom card (04 Accelerate) is laid out as the other four — icon and title on top, the points below, then View details, 340px wide — instead of the wide two-column version; the stage is max(720px, min(96svh, 1000px)) tall to make room for it, keeping ~60–80px between the heading and the ring.
- V1 ring raised (Oct 6): its slot gives up clamp(56px, 8svh, 96px) at the foot, so the ring (centred in it) sits ~30–40px higher, level with the top cards, ~45px under the heading block at 1440×900. The flight lands on the new centre (it reads the slot).
- Ring flight start (Oct 6): the flight starts just before the Flywheel's top enters the screen (1.1 viewports) **or** 24px past the hero's dock, whichever is later (`startTop` in TileFlight). Without the hero's old 6vh bottom margin, the 1.1-viewport line was crossed while still docked, so the ring left its tile the moment the hero snapped to the tiles.
- Docked hold (Oct 6): once the hero has docked into the tiles, the tiles stay pinned and still for a further quarter viewport of scroll (`HOLD` = 0.25 in Hero.tsx; the hero is 170svh tall, was 145) before the depth parallax and the ring's flight begin (TileFlight `HERO_HOLD`); scrolling back up passes through the same hold. The snap's half-viewport free stretch is still measured from the dock, so it covers the hold.
- V1 bottom card raised (Oct 6): 04 Accelerate is shifted up by `--acc-lift` = clamp(60px, 8.5svh, 90px) (relative `top`, so the ring's grid rows don't change) to sit ~35–45px under the ring (was ~100–130px); the stage gives the same back at its foot (negative margin-bottom), so no gap opens under it. A margin-top was tried first: it shrank the ring's rows and moved the ring down instead.

## Section line-up (Oct 6)
Defaults set in lib/variants.ts (`default` per group): Flywheel V1 · Measured by your outcomes **V2** · Client results delivered **V2** · Start focused V1 · Talk to our team V1 · Primary colour: Leapfrog green. The storage key is now `variant2:{key}`, so choices made earlier are dropped and every browser starts from this line-up (a visitor's new picks are still remembered; `?key=value` links still work). The review panel opens on arrival; its button turns into a × that closes it (Escape too) — clicks elsewhere on the page no longer close it. The badge on the button counts sections changed from these defaults.
- Compliance row (Oct 6, Figma Vyaguta Dashboard 541:3250): under the client stories card (Results V2), HIPAA · SOC2 · PCI · GDPR — four equal columns divided by dashed white-20% hairlines, each a 73px mark (Figma's sizes: 56 / 40 / 48 / 48px wide) over its name (14px/500) and a check, white while the page theme is dark and ink once it turns light (the row sits at the section's foot, where the light theme takes over; eased with the theme). SOC2 uses the hero marquee's seal (`partners/soc2-mono.svg`, 52px). The card's "Read full story" button now matches the hero's primary button: its height (38–44px) and soft green glow (the glow-free override was removed). ≤640px: 2×2. Marks in `public/assets/compliance/` (Figma's #E5E5E5 frame fill removed from the SOC2 export).

## Entrances: item by item (Oct 6)
Every group on the page arrives item by item, as the Start focused cards do — the generic "rise" (fade + 12px lift, 640ms, `cubic-bezier(.2,0,0,1)`), siblings 60ms apart, once, as each enters view (RevealController `TARGETS` / `CONTAINERS`): insight cards, FAQ items, the "Choose how we work together" list, the Why V1 pillar list, each Why V2 step's title → text → picture, the Why V2 sticky panel, the client-story tabs, the story card, the compliance badges (plus the existing stage cards, metrics, pillars). Headings and leads keep Square's word reveal; the hero, Flywheel and Talk band keep their own choreography. The risen state is now an attribute (`data-risen`), not a class: React rewrites `className` on FAQ items and tabs when they open/turn active and would have wiped it.

## Straight answers V2 (Oct 6)
`html[data-faq="2"]` (review button "Straight answers"; V1 stays the default): the heading on top with Expand all / Collapse all at the far right of its row (no longer sticky), then the questions as cards in two columns (12px row gap, 16px column gap), each opening in place — its neighbour keeps its own height (`align-items: start`). ≤900px: one column, the button beside the heading. Same items, icons and open/close animation as V1; the cards arrive one by one (the page's stagger).
