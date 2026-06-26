import type { ApproachPillar } from "./types";

export const APPROACH = {
  label: "Approach",
  heading: "Different strengths. One accountable process.",
  subtitle:
    "The partnership is designed to increase research capacity without outsourcing judgment.",
  body: [
    "Human researchers decide what is worth studying, define the boundaries of the work, evaluate the design, interpret the evidence, and remain responsible for every public conclusion.",
    "AI agents extend the process by searching literature, writing code, testing ideas, generating critiques, and iterating at a scale one person could not match alone.",
    "Deterministic systems keep the evidence fixed, traceable, and reproducible.",
  ],
};

export const APPROACH_PILLARS: ApproachPillar[] = [
  {
    key: "human",
    title: "Human researchers",
    summary:
      "Decide what is worth studying, define the boundaries of the work, interpret the evidence, and remain responsible for every public conclusion.",
    contributions: [
      "Select questions",
      "Provide context",
      "Approve designs",
      "Judge meaning",
      "Set claim boundaries",
      "Review ethics",
      "Control release",
    ],
  },
  {
    key: "ai",
    title: "AI agents",
    summary:
      "Extend the process by searching literature, writing code, testing ideas, generating critiques, and iterating at a scale one person could not match alone.",
    contributions: [
      "Search literature",
      "Generate candidate questions",
      "Write and revise code",
      "Produce critiques",
      "Compare interpretations",
      "Support drafting",
      "Coordinate repeated tasks",
    ],
  },
  {
    key: "deterministic",
    title: "Deterministic systems",
    summary: "Keep the evidence fixed, traceable, and reproducible.",
    contributions: [
      "Compute estimates",
      "Verify numbers",
      "Test code",
      "Record provenance",
      "Reproduce outputs",
      "Enforce gates",
      "Preserve versions",
    ],
  },
];
