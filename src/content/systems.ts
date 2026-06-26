import type { ResearchSystem, SystemCategory } from "./types";

export const SYSTEMS_INTRO = {
  label: "Systems",
  heading: "A research system built to challenge itself.",
  body: "Cumulant uses specialized software roles and deterministic infrastructure to support different parts of the research process. These systems assist human researchers. They do not replace human responsibility.",
};

export const SYSTEMS: ResearchSystem[] = [
  {
    key: "research-director",
    name: "Research Director",
    purpose:
      "Coordinates the research workflow, refines the question, reviews intermediate work, and recommends whether a project should continue, revise, or stop.",
    type: "LLM-assisted software agent",
    humanNote: "Requires human approval for consequential decisions.",
    category: "agent",
  },
  {
    key: "data-source",
    name: "Data Source",
    purpose:
      "Finds candidate data sources, retrieves public data, records provenance, checks coverage, and flags missing variables.",
    type: "Deterministic and tool-assisted system",
    category: "deterministic",
  },
  {
    key: "quantitative-analyst",
    name: "Quantitative Analyst",
    purpose:
      "Writes and runs analytical code, generates estimates, tables, figures, diagnostics, and saved outputs.",
    type: "Hybrid analytical system",
    humanNote: "Verified estimates come from deterministic code, not prose generation.",
    category: "deterministic",
  },
  {
    key: "critic",
    name: "Critic",
    purpose:
      "Challenges the main claim, searches for alternative explanations, identifies leakage, questions design choices, and flags unsupported language.",
    type: "LLM-assisted adversarial reviewer",
    category: "agent",
  },
  {
    key: "sensitivity-analyst",
    name: "Sensitivity Analyst",
    purpose:
      "Tests alternate specifications, samples, parameters, windows, and assumptions to measure conclusion stability.",
    type: "Deterministic analytical system",
    category: "deterministic",
  },
  {
    key: "literature-intelligence",
    name: "Literature Intelligence",
    purpose:
      "Plans searches, retrieves academic work, maps prior claims, and records verified references.",
    type: "Hybrid retrieval and synthesis system",
    category: "agent",
  },
  {
    key: "citation-verification",
    name: "Citation Verification",
    purpose: "Checks whether a cited source supports the claim attached to it.",
    type: "Deterministic verification system",
    category: "deterministic",
  },
  {
    key: "reproduction-runner",
    name: "Reproduction Runner",
    purpose: "Rebuilds statistics, tables, and figures from preserved inputs and code.",
    type: "Deterministic system",
    category: "deterministic",
  },
  {
    key: "knowledge-graph",
    name: "Knowledge Graph",
    purpose:
      "Connects papers, findings, methods, variables, datasets, contradictions, research gaps, and sensitivity results.",
    type: "Deterministic institutional memory system",
    category: "deterministic",
  },
  {
    key: "institutional-memory",
    name: "Institutional Memory",
    purpose: "Stores durable research decisions, mistakes, lessons, prior findings, and project history.",
    type: "Persistent structured memory system",
    category: "deterministic",
  },
  {
    key: "human-review-gate",
    name: "Human Review Gate",
    purpose:
      "Prevents automatic external release and requires a human to approve, revise, or reject the work.",
    type: "Mandatory governance control",
    category: "governance",
  },
];

export const SYSTEM_CATEGORIES: SystemCategory[] = [
  {
    key: "agent",
    title: "AI research agents",
    summary:
      "LLM-assisted software roles that retrieve, synthesize, code, and critique, always under human approval.",
    members: ["research-director", "critic", "literature-intelligence"],
  },
  {
    key: "deterministic",
    title: "Deterministic infrastructure",
    summary:
      "Fixed, traceable systems that compute and verify estimates, run sensitivity, reproduce outputs, and preserve research state.",
    members: [
      "data-source",
      "quantitative-analyst",
      "sensitivity-analyst",
      "citation-verification",
      "reproduction-runner",
      "knowledge-graph",
      "institutional-memory",
    ],
  },
  {
    key: "governance",
    title: "Human governance",
    summary: "Controls that keep a human responsible for what becomes public.",
    members: ["human-review-gate"],
  },
];

export function systemsInCategory(key: SystemCategory["key"]): ResearchSystem[] {
  return SYSTEMS.filter((s) => s.category === key);
}
