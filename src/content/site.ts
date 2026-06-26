import type { Cta, FooterColumn, IntroBlock, NavItem, Statement } from "./types";

export const ORG = {
  name: "Cumulant Research",
  short: "Cumulant",
  domain: "cumulant.org",
  founder: "Aryan Patel",
  founderTitle: "Founder and Research Director",
  email: "aryan@cumulant.org",
  researchEmail: "research@cumulant.org",
  description:
    "Cumulant Research combines human judgment, specialized AI agents, and deterministic systems to study difficult questions across finance, risk, humanitarian allocation, and computational research.",
  shortDescription:
    "Cumulant Research combines human judgment, specialized AI agents, and deterministic systems to study difficult questions across finance, risk, humanitarian allocation, and computational research.",
  tagline: "Research beyond the norm.",
} as const;

// Primary navigation. Homepage uses #target anchors; each topic also has a route.
export const NAV: NavItem[] = [
  { label: "Research", target: "research", route: "/research" },
  { label: "Papers", target: "papers", route: "/papers", routeOnly: true },
  { label: "Articles", target: "articles", route: "/articles", routeOnly: true },
  { label: "Methods", target: "methods", route: "/methods" },
  { label: "Systems", target: "systems", route: "/systems" },
  { label: "Principles", target: "principles", route: "/principles" },
  { label: "About", target: "about", route: "/about" },
  { label: "Collaborate", target: "collaborate", route: "/collaborate" },
];

// Approved calls to action (no marketing/sales language).
export const CTA = {
  exploreResearch: { label: "Explore the research", href: "/research" } as Cta,
  seeHowItWorks: { label: "See how it works", href: "/methods" } as Cta,
  inspectMethods: { label: "Inspect the methods", href: "/methods" } as Cta,
  seeSystems: { label: "See the systems", href: "/systems" } as Cta,
  readPrinciples: { label: "Read the principles", href: "/principles" } as Cta,
  reviewEvidence: { label: "Review the evidence", href: "/research" } as Cta,
  startCollaboration: { label: "Start a collaboration", href: "/collaborate" } as Cta,
  contactResearch: { label: "Email the founder", href: "mailto:aryan@cumulant.org", external: true } as Cta,
};

// Title banner: just the headline, split across two lines by a connecting rule
// (Seed-style motif). Uses Cumulant's real tagline.
export const HERO_CONTENT = {
  line1: "Research",
  midLeft: "beyond",
  midRight: "the norm.",
};

// Core positioning — shown as the large statement directly under the hero.
export const POSITIONING: Statement = {
  eyebrow: "Cumulant Research",
  source: "Core positioning",
  text: "Researchers define the questions, challenge the assumptions, interpret the evidence, and control what becomes public. AI agents search literature, analyze data, test robustness, criticize findings, and reproduce results.",
};

// Second statement, lower on the page.
export const OPERATING_STATEMENT: Statement = {
  eyebrow: "Cumulant Research",
  source: "Operating principle",
  text: "Every estimate remains tied to a traceable artifact. Every major conclusion passes human review. Every project preserves its uncertainty, failures, and revisions.",
};

export const INTRO: IntroBlock = {
  heading: "Transparent computational research.",
  lead: "Cumulant Research develops transparent computational methods for difficult questions involving capital, risk, intelligence, and human systems.",
  body: [
    "Its work combines human research direction, specialized AI agents, deterministic analytical pipelines, and public accountability.",
    "The goal is not to automate judgment. The goal is to give researchers greater reach while preserving traceability, criticism, reproducibility, and human responsibility.",
  ],
};

// Footer
export const FOOTER_STATEMENT: Cta = {
  label: "Human-directed computational research.",
  href: "/about",
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "RESEARCH",
    links: [
      { label: "Research", href: "/research" },
      { label: "Papers", href: "/papers" },
      { label: "Methods", href: "/methods" },
      { label: "Systems", href: "/systems" },
      { label: "Principles", href: "/principles" },
    ],
  },
  {
    heading: "ORGANIZATION",
    links: [
      { label: "About", href: "/about" },
      { label: "Collaborate", href: "/collaborate" },
      { label: "Email Aryan", href: "mailto:aryan@cumulant.org", external: true },
    ],
  },
  {
    heading: "TRANSPARENCY",
    links: [
      { label: "AI Disclosure", href: "/ai-disclosure" },
      { label: "Reproducibility", href: "/reproducibility" },
      { label: "Corrections", href: "/corrections" },
    ],
  },
];
