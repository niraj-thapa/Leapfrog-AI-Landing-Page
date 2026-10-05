/* Page copy — Design Brief v8 (Sep 28, 2026).
 *
 * Anything in [square brackets] is a placeholder the brief itself marks as open
 * in its Launch checklist. Anything tagged UNVERIFIED was carried over from the
 * Figma file or earlier drafts and has no source in the brief; confirm before
 * publishing. Do not "tidy" these into confident-sounding claims. */

export const CONTACT_HREF = '/contact';
export const CTA_LABEL = 'Talk to our team';

/* ── Header ──────────────────────────────────────────────────────────────── */
export const SERVICE_LINKS = [
  { label: 'AI-Driven Design', href: 'https://design.lftechnology.com/', external: true },
  { label: 'AI Solutions', href: '/solutions', external: false },
  { label: 'AI Enablement', href: '/enablement', external: false },
  { label: 'AI-Native Engineering', href: '/engineering', external: false },
  { label: 'AI Managed Services', href: '/managed-services', external: false },
];

export const NAV_LINKS = [
  { label: 'Ways to work together', href: '/#work-together' },
  { label: 'Insights', href: '/#insights' },
];

/* ── 1 Hero ──────────────────────────────────────────────────────────────── */
export const HERO = {
  headline: ['Deep AI expertise.', 'Boutique attention.', 'Real results.'],
  subhead:
    'Put AI to work in your operations and customer experience. Lessons from 100+ AI initiatives get your first use case live in weeks, with a partner that stays.',
  filmLabel: 'Watch the film',
};

/* Six badges, no captions. `art` is the approved artwork key; null means
 * approved artwork is still needed (Launch checklist: "AWS healthcare
 * credentials", "Claude Partner Network tier"). Alt text carries the full name. */
/* Partner credentials — artwork from the Vyaguta Dashboard Figma file ("Partners",
 * node 496:2604), exported as SVG to /public/assets/partners. Ordered so the Claude mark
 * and SOC 2 seal sit between the AWS badges. `kind` sets the size
 * class: the AWS badges are square, the Claude mark a wide wordmark, SOC 2 a round seal. */
export const BADGES: Array<{
  name: string;
  href: string;
  src: string;
  mono: string; // flat white, for the hero marquee (as squareup.com's logo row)
  kind: 'square' | 'wide' | 'seal';
}> = [
  { name: 'AWS Partner · AI Services Competency', href: '/partners/aws', src: '/assets/partners/aws-ai.svg', mono: '/assets/partners/aws-ai-mono.svg', kind: 'square' },
  { name: 'Claude Partner Network', href: '/partners/anthropic', src: '/assets/partners/claude-partner.svg', mono: '/assets/partners/claude-partner-mono.svg', kind: 'wide' },
  { name: 'AWS Partner · Healthcare Services Competency', href: '/partners/aws', src: '/assets/partners/aws-healthcare.svg', mono: '/assets/partners/aws-healthcare-mono.svg', kind: 'square' },
  { name: 'SOC 2 Type II', href: '/security', src: '/assets/partners/soc2.svg', mono: '/assets/partners/soc2-mono.svg', kind: 'seal' },
  { name: 'AWS Partner · DevOps Services Competency', href: '/partners/aws', src: '/assets/partners/aws-devops.svg', mono: '/assets/partners/aws-devops-mono.svg', kind: 'square' },
];

/* ── 2 The AI Flywheel ───────────────────────────────────────────────────── */
/* Copy, panels and dialog content live with the component: see
 * app/components/Flywheel.tsx and app/components/flywheel/flywheel.js. */

/* ── 3 Why Leapfrog ──────────────────────────────────────────────────────── */
export const WHY = {
  headline: 'Measured by your outcomes.',
  intro:
    "Plenty of firms will sell you a pilot, a strategy deck or a team by the hour. We're here to move your numbers. We agree the success metric with you up front, then bring the expertise, attention and dedication to hit it, and we keep going until it moves. Three things make that possible:",
};

/* Launch checklist, "We run it on ourselves": Engineering to confirm which of
 * these are live today. Brief: "list only the ones that are live today". All
 * five are shown because the brief's copy lists all five; trim before launch. */
export const OWN_AGENTS = [
  { lead: 'Review agents', rest: 'check every pull request for bugs, security issues and coding standards.' },
  { lead: 'Test agents', rest: 'write and run unit, integration and end-to-end tests on every change.' },
  { lead: 'Security agents', rest: 'scan code and dependencies on every commit.' },
  { lead: 'Evaluation agents', rest: 'score AI features against benchmark datasets before each release.' },
  { lead: 'Operations agents', rest: 'watch production, flag regressions and roll back or open fixes.' },
];

export const PILLARS = [
  {
    key: 'expertise',
    icon: '/assets/iso-solutions.svg',
    title: 'Deep AI expertise',
    body: '500+ AI-accelerated engineers, designers and project managers, including a 150+ person AI Center of Excellence, with 100+ AI initiatives behind them. That depth matters most where the stakes are highest: critical systems and regulated industries like healthcare, financial services and education. With Leapfrog, HIPAA, privacy and security are built in, not bolted on.',
    proof: 'SOC 2 Type II · AWS competencies (including the AWS Healthcare Competency) · Claude partner badges',
  },
  {
    key: 'attention',
    icon: '/assets/iso-enablement.svg',
    title: 'Boutique attention',
    body: 'We learn your business and goals before we build, and the people you meet are the people who deliver. Your success is personal to us: we move mountains to hit your timeline, outcomes and quality bar, and we can scale your team quickly when the work demands it. Decisions happen in days, not steering-committee cycles.',
    /* Quote is from the Figma file — UNVERIFIED for permission and fit; the
     * brief asks for a quote on responsiveness or going the extra mile. */
    quote: {
      text: 'Leapfrog is a true collaborator. They helped shape SecondLook’s brand from concept to execution across our visual branding, app and website, with exceptional quality and attention to detail.',
      who: 'Sierra Manker, Cofounder & Head of Product, SecondLook Health',
    },
  },
  {
    key: 'results',
    icon: '/assets/iso-design.svg',
    title: 'Real results, faster',
    body: 'We agree on the success metric first, whether dollars saved, cycle time or customer experience, then work backwards to the AI that will move it. Dedicated senior teams with the authority to decide, forward-deployed engineers, proven components and our own AI-accelerated delivery get your first use case live in weeks. Each one after that comes faster. Speed never costs quality: every AI-assisted line of code, design and document is reviewed by experienced engineers and designers, and passes automated tests, security checks and quality gates before it ships.',
    /* UNVERIFIED — figures come from the Figma featured story. */
    proof: 'SecondLook Health live in 9 weeks, with review time down 70–90%',
  },
  {
    key: 'stay',
    icon: '/assets/iso-engineering.svg',
    title: 'And we stay.',
    body: 'We measure our work by your metric, not our hours, and your first launch is the start of a roadmap we build together.',
    proof: null,
  },
];

/* Publish only once confirmed as standard practice (Launch checklist). */
export const COMMITMENT = {
  lead: 'On every engagement:',
  items: [
    'a handpicked delivery lead',
    'a Leapfrog executive sponsor',
    'oversight from our 150+ person AI Center of Excellence',
    'the same core team from first use case to scale',
  ],
};

/* ── 4 Client results delivered ──────────────────────────────────────────── */
/* Metric values and labels are fixed by the brief. Industry, contribution and
 * the service tag are UNVERIFIED: "Publish only sourced cards". */
export const RESULTS_HEADLINE = 'Client results delivered';
export const RESULTS_EYEBROW = 'Proven in production';

export const METRICS = [
  {
    value: '$12.3M',
    image: '/assets/results/healthcare-savings.jpg',
    label: 'Saved in one year',
    industry: 'Healthcare',
    did: 'We built and integrated the extraction and review workflow.',
    service: 'AI Solutions',
    serviceHref: '/solutions',
    /* PLACEHOLDER — the client's logo (white); SecondLook's for now */
    client: 'SecondLook Health',
    logo: '/assets/logo-secondlook.svg',
    href: '/case-studies/healthcare',
  },
  {
    value: '8–30×',
    image: '/assets/results/roi-team.jpg',
    label: 'Client ROI',
    industry: 'Across industries',
    did: 'We agreed the success metric up front and measured against it.',
    service: 'AI Solutions',
    serviceHref: '/solutions',
    /* PLACEHOLDER — the client's logo (white); SecondLook's for now */
    client: 'SecondLook Health',
    logo: '/assets/logo-secondlook.svg',
    href: '/case-studies',
  },
  {
    value: '3 days → 4 hrs',
    image: '/assets/results/finance-documents.jpg',
    label: 'Document turnaround',
    industry: 'Financial services',
    did: 'We delivered the document workflow and its evaluation harness.',
    service: 'AI Solutions',
    serviceHref: '/solutions',
    /* PLACEHOLDER — the client's logo (white); SecondLook's for now */
    client: 'SecondLook Health',
    logo: '/assets/logo-secondlook.svg',
    href: '/case-studies/financial-services',
  },
  {
    value: '70–90%',
    image: '/assets/results/clinical-review.jpg',
    label: 'Less review time',
    industry: 'Healthcare',
    did: 'We designed the review interface and the human-oversight model.',
    service: 'AI Solutions',
    serviceHref: '/solutions',
    /* PLACEHOLDER — the client's logo (white); SecondLook's for now */
    client: 'SecondLook Health',
    logo: '/assets/logo-secondlook.svg',
    href: '/case-studies/healthcare',
  },
];

export const RESULTS_LEAD = 'AI where the stakes are high: HIPAA, data privacy and security built in.';

/* Featured story — five beats, UNVERIFIED (Figma figures; brackets are open). */
export const STORY = {
  headline: 'From first use case to roadmap',
  client: 'SecondLook Health',
  person: 'Sierra Manker',
  role: 'Cofounder & Head of Product',
  href: '/case-studies/secondlook-health',
  beats: [
    { k: 'The problem', v: '[The problem the team was solving]' },
    { k: 'What went live', v: 'Clinical record review workflow, integrated with the existing EHR and review queue' },
    { k: 'Elapsed weeks', v: '9 weeks' },
    { k: 'Measured result', v: 'Review time down 70–90% with clinician sign-off retained' },
    { k: 'What the partnership built next', v: '[What the partnership built next]' },
  ],
  /* the path, step by step: done, done, done, then what comes next */
  timeline: [
    { k: 'Start', v: 'Kickoff' },
    { k: 'Live', v: '9 weeks' },
    { k: 'Result', v: '70–90% faster review' },
    { k: 'Next', v: 'The next phase', next: true },
  ],
};

/* ── 5 Start focused. Build for the long run. ────────────────────────────── */
export const ROADMAP = {
  headline: 'Start focused. Build for the long run.',
  intro:
    "Most AI roadmaps don't fail on ideas. They stall between the first use case and the tenth. We stay with you through every stage.",
  stages: [
    {
      icon: '/assets/stage-search.svg',
      title: 'Assess',
      when: '2–3 weeks',
      body: 'Compare approaches, validate one use case and define a path to production.',
    },
    {
      icon: '/assets/stage-rocket.svg',
      title: 'Launch',
      when: 'weeks',
      body: 'Put the first use case into daily use and measure it against the agreed success metric.',
    },
    {
      icon: '/assets/stage-sparkle.svg',
      title: 'Expand',
      when: 'quarters',
      body: "Sequence the roadmap by value, reuse what works and grow your team's capability.",
    },
    {
      icon: '/assets/stage-clipboard.svg',
      title: 'Run and improve',
      when: 'ongoing',
      body: "Keep AI reliable, secure and cost-controlled, whether it's run by your team, with us or by us.",
    },
  ],
  subhead: 'Choose how we work together',
  models: [
    { key: 'advise', title: 'Advise your team', body: 'Compare approaches, review an existing plan or test a critical assumption.' },
    { key: 'build', title: 'Build alongside your team', body: 'Add specialist capability and delivery capacity while sharing knowledge.' },
    { key: 'deliver', title: 'Deliver or operate with us', body: 'Give us responsibility for agreed work, with clear measures and ownership.' },
  ],
};

/* ── 6 Ideas and insights ────────────────────────────────────────────────── */
export const INSIGHTS = {
  headline: 'Ideas and insights from our AI work',
  intro: "What we're learning as we put AI to work with clients.",
  all: 'View all AI insights',
  /* The first is the multi-year agentic roadmap piece the brief asks for. Its
   * title is descriptive, not a published title — replace with the real one. */
  items: [
    {
      topic: 'Agentic roadmaps',
      image: '/assets/insight-3.png',
      title: 'Planning and running a multi-year agentic roadmap',
      takeaway: 'How to sequence agentic work by value so the tenth use case is faster than the first.',
      href: '/insights',
    },
    {
      topic: 'Data and AI',
      image: '/assets/insight-2.png',
      title: 'Securing GenAI: Vol. 9 - Safeguarding Agentic AI systems and integrations',
      takeaway: 'The controls that keep agents and their integrations safe in production.',
      href: '/insights',
    },
    {
      topic: 'Data and AI',
      image: '/assets/insight-1.png',
      title: 'When AI writes both code and tests: New risks QA engineers can’t ignore',
      takeaway: 'Why AI-written tests need independent review, and how to set that up.',
      href: '/insights',
    },
  ],
};

/* ── 7 Straight answers ──────────────────────────────────────────────────── */
export const FAQS: Array<{ q: string; a: string; link?: { label: string; href: string } }> = [
  {
    q: 'Why a boutique partner instead of a large consultancy?',
    a: 'You get senior people who stay on your work, faster decisions and a team accountable for the outcome, backed by specialists in AI, design, data, cloud and security.',
  },
  {
    q: 'Can a boutique support an enterprise, multi-year program?',
    a: 'Yes. Our 500+ engineers, designers and project managers across the US, Europe and Asia, including a 150+ person AI Center of Excellence, let us scale the team as your roadmap grows, while keeping the same leads. SOC 2 Type II and AWS competencies cover the controls enterprises expect.',
  },
  {
    q: 'Can you work with patient data or other regulated data?',
    a: 'Yes. We build for healthcare, financial services and education, where HIPAA, data privacy and security reviews shape the design from day one. Our SOC 2 Type II controls apply to every engagement.',
  },
  {
    q: "Can't we just do this ourselves?",
    a: 'You can. We help your team get there faster, avoid the common detours and leave the capability behind.',
    link: { label: 'See AI Enablement', href: '/enablement' },
  },
  {
    q: 'Will this become another pilot?',
    a: "That's what we're here to prevent. Every project starts with a success metric, an owner and a route into daily work.",
  },
  {
    q: 'Does AI-accelerated delivery cut corners?',
    a: 'No. AI speeds up the work; our people own the result. Every output is reviewed, tested and measured against the quality bar we agree with you up front.',
  },
  {
    q: 'How quickly will we see value?',
    a: 'Focused use cases can go live in weeks. Timing depends on scope, data access, integrations and approvals, which we agree up front.',
  },
  {
    q: 'Which AI will you use?',
    a: 'Whatever fits the job. We explain the tradeoffs in capability, cost and complexity. Sometimes simpler is better.',
  },
  {
    q: 'What happens after launch?',
    a: 'Your team owns it. If you prefer, we run it: monitored, secure and cost-controlled, including AI built by others.',
  },
];

/* ── 8 Talk to our team ──────────────────────────────────────────────────── */
export const TALK = {
  headline: 'Talk to our team',
  body: "Tell us the outcome you're after. You'll talk with a senior member of our team, not a sales queue, about the fastest practical route to value.",
};

/* ── Contact page ────────────────────────────────────────────────────────── */
export const CONTACT = {
  headline: 'Where do you want AI to make a difference?',
  interests: [
    { key: 'validate', label: 'Validate (AI-Driven Design)' },
    { key: 'build', label: 'Build (AI Solutions)' },
    { key: 'enable', label: 'Enable (AI Enablement)' },
    { key: 'accelerate', label: 'Accelerate (AI-Native Engineering)' },
    { key: 'run', label: 'Run (AI Managed Services)' },
    { key: 'unsure', label: 'Not sure yet, help me decide' },
  ],
  models: [
    { key: 'advise', label: 'Advise your team' },
    { key: 'build', label: 'Build alongside your team' },
    { key: 'deliver', label: 'Deliver or operate with us' },
    { key: 'unsure', label: 'Not sure yet' },
  ],
  stages: [
    { key: 'exploring', label: 'Exploring' },
    { key: 'first', label: 'First use case' },
    { key: 'scaling', label: 'Scaling across the business' },
  ],
  reply: 'A senior member of our team replies within one business day.',
};

/* ── Footer (from the Figma file) ────────────────────────────────────────── */
export const FOOTER = {
  phone: '(800) 815-2044',
  hours: 'Mon-Fri during US work hours',
  columns: [
    [
      { title: 'Company', links: ['About Us', 'Security and Compliance', 'Contact Us'] },
      { title: 'Resources', links: ['Blogs', 'Success Stories', 'Hackathon', 'Ebooks'] },
      { title: 'Work With Us', links: ['Careers', 'Fellowship', 'Life at Leapfrog'] },
    ],
    [
      {
        title: 'Services',
        links: [
          'GenAI Solutions',
          'Product Development',
          'AI & Data',
          'Design',
          'DevOps & Cloud',
          'Staff Augmentation',
          'AWS Solutions',
          'Healthcare Technology',
        ],
      },
    ],
    [{ title: 'Industries', links: ['Healthcare', 'Ed-tech', 'Fin-tech', 'Construction'] }],
  ],
  social: [
    { label: 'Podcast', icon: '/assets/social-podcast.svg' },
    { label: 'Instagram', icon: '/assets/social-instagram.svg' },
    { label: 'TikTok', icon: '/assets/social-tiktok.svg' },
    { label: 'LinkedIn', icon: '/assets/social-linkedin.svg' },
    { label: 'X', icon: '/assets/social-x.svg' },
    { label: 'Facebook', icon: '/assets/social-facebook.svg' },
  ],
  initiatives: [
    { label: 'Leapfrog Brand', icon: '/assets/brand-leapfrog.svg' },
    { label: 'Education Mission', icon: '/assets/brand-education.svg' },
    { label: 'Student Partnership', icon: '/assets/brand-student.svg' },
  ],
  root: 'https://www.lftechnology.com/',
};
