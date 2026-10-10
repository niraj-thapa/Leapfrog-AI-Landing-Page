# Leapfrog AI landing page

The marketing landing page for Leapfrog's AI services. It is built with Next.js and deployed on Vercel, and it is still in design review.

## Getting started

You need Node.js 20 or later. The app lives in `my-app/`.

```bash
cd my-app
npm install
npm run dev
```

The dev server runs at http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Makes a production build |
| `npm run start` | Serves the production build |

## Project layout

```
design.md                  design log: every design decision, newest at the end
my-app/
  app/
    page.tsx               the landing page, section by section
    contact/               the contact page (every "Talk to our team" button links here)
    layout.tsx             fonts, the Vercel Toolbar, and the script that applies section versions before the first paint
    globals.css            styles for every section except the Flywheel
    components/            one file per section (Hero, WhyLeapfrog, ClientStories, Roadmap, Faq, TalkBand…)
      flywheel/            the WebGL glass ring (three.js) and its styles
      TileFlight.tsx       flies the ring from its hero tile into the Flywheel section
    lib/
      content.ts           page copy, client stories, partner badges, insights
      variants.ts          the section versions under review, and their defaults
      smooth.ts, glide.ts  smooth scrolling (Lenis) and scripted glides
  public/                  images, logos, fonts and video
```

Most copy changes only touch `app/lib/content.ts`.

## Section versions

Several sections have alternative designs under review. To switch between them, use the review button at the bottom right of the page. Each choice is saved in that browser.

You can also share a specific combination as a link, using each section's key as a URL parameter. For example, `/?fw=2&why=3` shows Flywheel version 2 and "Measured by your outcomes" version 3.

The versions and their defaults are set in `app/lib/variants.ts`:
- To change a default, edit that section's `default` value.
- To reset every visitor's saved choices, bump the `SET` number.
- To add a version, add an option there. Then style it in CSS with `html[data-{key}="{value}"]`.

## Feedback from the team

The Vercel Toolbar is installed, so anyone signed in to Vercel with access to the project can leave comments on the deployed page:
1. Open the page.
2. Click the comment icon in the toolbar.
3. Click anywhere on the page to pin a comment.

Visitors who aren't signed in don't see the toolbar.

## Deploying

Every push to `main` deploys to production on Vercel, and other branches get preview deployments. Before pushing, run `npm run build` in `my-app/` to check that the production build passes.

## Notes

- **Design log:** record each design change in `design.md`, the date and the reason included, so others can follow why the page looks the way it does.
- **Source material:** the design briefs, strategy documents and source video are kept out of the repo (see `.gitignore`).
- **The Flywheel ring:** it uses WebGL. It stops drawing when it is off screen or resting in its hero tile, and the page falls back to a still image when WebGL isn't available.
- **Reduced motion:** with reduced motion turned on, the scroll effects, parallax and video loop are switched off.
