import Faq from './components/Faq';
import Flywheel from './components/Flywheel';
import Hero from './components/Hero';
import Insights from './components/Insights';
import RevealController from './components/RevealController';
import Results from './components/Results';
import Roadmap from './components/Roadmap';
import SiteHeader from './components/SiteHeader';
import TalkBand from './components/TalkBand';
import ThemeController from './components/ThemeController';
import TileFlight from './components/TileFlight';
import VariantSwitcher from './components/VariantSwitcher';
import SmoothAnchors from './components/SmoothAnchors';
import WhyLeapfrog from './components/WhyLeapfrog';

/* Scroll order follows Design Brief v8: Hero, AI Flywheel, Why Leapfrog, Client
 * results, Start focused, Insights, Straight answers, Talk to our team. */
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Flywheel />
        <WhyLeapfrog />
        <Results />
        <Roadmap />
        <Insights />
        <Faq />
        <TalkBand />
      </main>
      {/* Footer hidden for now (Oct 2 2026) — SiteFooter.tsx is kept; restore with <SiteFooter /> */}
      <RevealController />
      <ThemeController />
      <TileFlight />
      <SmoothAnchors />
      {/* review button: section versions (lib/variants.ts) — remove once they are settled */}
      <VariantSwitcher />
    </>
  );
}
