// Typed content schema for Cumulant Research.
// Every field is editable copy or structured data — no values are hard-coded
// into layout components. Honest status states only; nothing fabricated.

export type Theme = "green" | "red" | "yellow" | "blue" | "silver";

export interface Cta {
  label: string;
  href: string;
  external?: boolean;
  disabled?: boolean;
}

export interface NavItem {
  label: string;
  /** Homepage section id (used as /#id from any route). */
  target: string;
  /** Dedicated route for the topic. */
  route: string;
  /** When true, the nav links to `route` directly (no homepage section). */
  routeOnly?: boolean;
}

export interface PaperFigure {
  src: string;
  caption: string;
  alt: string;
}

export interface Paper {
  slug: string;
  title: string;
  subtitle?: string;
  authors: string[];
  /** Honest venue status (never "published"). */
  status: string;
  /** Badge kind for color. */
  statusKind: "submitted" | "working-paper" | "research-note" | "in-progress" | "experimental";
  date: string;
  /** "paper" = full visual write-up; "note" = shorter working note. */
  kind: "paper" | "note";
  oneLine: string;
  abstract: string;
  contributions?: string[];
  method?: string[];
  figures?: PaperFigure[];
  dataNote?: string;
  honesty?: string[];
  /** Path to the full paper PDF, when one is released. */
  pdf?: string;
}

export interface Statement {
  /** Small label shown above the statement (the grey eyebrow). */
  eyebrow: string;
  /** Secondary descriptor under the eyebrow. */
  source: string;
  text: string;
}

export interface IntroBlock {
  heading: string;
  lead: string;
  body: string[];
}

export interface MethodStage {
  n: number;
  title: string;
  desc: string;
}

export interface MethodPhase {
  title: string;
  stages: MethodStage[];
}

export interface ApproachPillar {
  key: "human" | "ai" | "deterministic";
  title: string;
  summary: string;
  contributions: string[];
}

export interface ResearchProgram {
  key: string;
  title: string;
  summary: string;
  focus: string[];
}

export type ProjectStatusKind =
  | "in-progress"
  | "working-paper"
  | "research-note"
  | "experimental"
  | "replication"
  | "null-result"
  | "completed-phase"
  | "concept";

export interface ProjectCorrection {
  date: string;
  version: string;
  original: string;
  revised: string;
  reason: string;
  effect: string;
  status: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  status: string;
  statusKind: ProjectStatusKind;
  /** Lifecycle progress, 1–4, mapped to CONCEPT / ANALYSIS / REVIEW / DOCUMENTED. */
  stage: number;
  program: string; // ResearchProgram.key
  version: string;
  date: string;
  authors: string[];
  abstract: string;
  researchQuestion?: string;
  methods: string[];
  data: string;
  results: string;
  limitations: string;
  codeAvailability: string;
  dataAvailability: string;
  aiDisclosure: string;
  reproductionStatus: string;
  corrections: ProjectCorrection[];
  related: string[]; // slugs
}

export interface ResearchSystem {
  key: string;
  name: string;
  purpose: string;
  type: string;
  /** Honest note about human dependence, where the source specifies one. */
  humanNote?: string;
  category: "agent" | "deterministic" | "governance";
}

export interface SystemCategory {
  key: "agent" | "deterministic" | "governance";
  title: string;
  summary: string;
  /** ResearchSystem.key list belonging to this category. */
  members: string[];
}

export interface Principle {
  n: number;
  title: string;
  desc: string;
}

export interface Founder {
  name: string;
  title: string;
  bio: string[];
}

export interface FooterColumn {
  heading: string;
  links: Cta[];
}

export interface PolicySection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface FieldNoteSource {
  title: string;
  url: string;
  domain: string;
}

export interface FieldNoteSection {
  heading: string;
  body: string;
}

/**
 * A "Field Note" — a short, AI-assisted analysis of a current event through a
 * research lens. Distinct from a vetted Paper; never peer reviewed. Produced by
 * the daily loop and held in a review queue until a human approves it.
 */
export interface FieldNote {
  slug: string;
  title: string;
  date: string;
  /** Short standfirst shown under the title. */
  dek: string;
  /** The research question the note frames. */
  question: string;
  /** The news event(s) that prompted the note. */
  sources?: FieldNoteSource[];
  /** The analysis, as headed sections. */
  sections: FieldNoteSection[];
  /** Plain-language takeaways. */
  takeaways?: string[];
  tags?: string[];
  /** Honesty caveats (always includes the AI-assisted, not-peer-reviewed note). */
  honesty: string[];
}

// --------------------------------------------------------------------------- //
// Articles — deeply reported data-journalism pieces (the upgraded format).
// Research-grade evidence + news-feature readability + honest visuals.
// --------------------------------------------------------------------------- //

export type ArticleChartKind = "keynumber" | "bar" | "comparison" | "line" | "timeline" | "range" | "table";

/** A chart that answers a question. Data shape depends on `kind`. */
export interface ArticleChart {
  id: string;
  kind: ArticleChartKind;
  title: string;
  subtitle?: string;
  source: string;
  units?: string;
  period?: string;
  /** Annotation that points at the takeaway. */
  note?: string;
  /** Accessibility description. */
  alt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; label?: string; text: string }
  | { type: "chart"; chartId: string }
  | { type: "list"; items: string[] };

export interface ArticleSection {
  heading: string;
  blocks: ArticleBlock[];
}

export interface ArticleSource {
  title: string;
  publisher?: string;
  url: string;
  kind?: "primary" | "secondary" | "academic" | "data";
}

/**
 * A deeply reported article: one current event, one narrow question, answered
 * with original analysis, sources, visuals, alternatives, scenarios, and limits.
 */
export interface Article {
  slug: string;
  headline: string;
  /** One or two sentences: what happened, what the analysis found, why it matters. */
  deck: string;
  byline?: string;
  date: string;
  readingMinutes: number;
  tags?: string[];
  /** The current event the article hooks on. */
  event: string;
  /** The single research question. */
  question: string;
  /** Chart id used as the lead visual. */
  leadChartId?: string;
  charts: ArticleChart[];
  sections: ArticleSection[];
  /** The methods box. */
  methodology: string[];
  sources: ArticleSource[];
  limitations: string[];
  honesty: string[];
}
