// Cumulant imagery — a curated BLUE + PINK set (real 4K stock from Pexels,
// free/commercial license), chosen to *represent* Cumulant's domains: neural /
// microscopy, machine computation, and research infrastructure. Each figure
// carries a caption (what it is) and a short note on how it relates. The hero
// banner is a static image; the wide band below it is a neural-network video.

export interface Figure {
  src: string;
  caption: string;
  relation: string;
}
const fig = (n: string, caption: string, relation: string): Figure => ({
  src: `/images/blue/${n}.jpg`,
  caption,
  relation,
});

// Hero banner — static image (the title banner).
export const HERO_IMAGE = "/images/blue/hero.jpg";

// The wide band directly below the hero — a neural-network video (blue/pink).
export const BAND_VIDEO = "/videos/band.mp4";
export const BAND_POSTER = "/videos/band-poster.jpg";
export const BAND_CAPTION = "Neural network · visualization";
export const BAND_RELATION =
  "The two intelligences Cumulant pairs: human judgment and machine reasoning.";

// Lower full-bleed band (still images)
export const PIPELINE_BAND: Figure[] = [
  fig("pipeline-1", "Fluid dynamics · marbled ink", "Analysis in motion: the unsettled middle of a question."),
  fig("pipeline-2", "Pigment dispersion · macro", "How a result propagates, and where the signal thins out."),
];

// Intro
export const INTRO_SMALL: Figure = fig(
  "intro-small",
  "Tissue cross-section · microscopy",
  "The fine detail computational methods are built to read."
);
export const INTRO_BAND: Figure[] = [
  fig("intro-band-1", "Pigment in water · macro", "Raw evidence before it resolves into a finding."),
  fig("intro-band-2", "Marbled pigment · macro", "Structure emerging from noise."),
];

// Approach cards (Human judgment / AI agents / Deterministic systems)
export const APPROACH_CARDS: Figure[] = [
  fig("approach-human", "Stained cells · light microscopy", "Human researchers frame the questions and own the judgment."),
  fig("approach-ai", "Microprocessor · macro", "AI agents extend the work: search, drafting, and iteration at scale."),
  fig("approach-deterministic", "Data-centre infrastructure", "Deterministic systems keep every step fixed and reproducible."),
];

// Systems cards (AI agents / Deterministic infrastructure / Human governance)
export const SYSTEMS_CARDS: Figure[] = [
  fig("systems-1", "Compute cluster · server blades", "Where the AI research agents run."),
  fig("systems-2", "Server infrastructure", "Pipelines and storage that make results reproducible."),
  fig("systems-3", "Server hall · cold aisle", "Nothing ships until a human has reviewed it."),
];

export const ABOUT_IMAGE: Figure = fig(
  "about",
  "Cellular network · abstract",
  "A system built to be inspected, like tissue under a lens."
);
export const MANIFESTO_BG = "/images/blue/manifesto.jpg"; // no caption (centered verse)

// Research-program images (one per program)
export const RESEARCH_FIGS: Figure[] = [
  fig("research-1", "Network telemetry · monitoring view", "Financial inference: separating signal from false discovery."),
  fig("research-2", "Pigment distribution · macro", "Portfolios: how risk concentrates and spreads."),
  fig("research-3", "Ink dispersion · macro", "Allocation under uncertainty."),
  fig("research-4", "Circuit board · macro", "AI-assisted research systems."),
  fig("research-5", "Stained cells · microscopy", "Replication and failure analysis."),
];
