import type { Founder } from "./types";

export const ABOUT = {
  label: "About",
  heading: "Built to make research more inspectable.",
  body: [
    "Cumulant began as an attempt to build a research system capable of doing more than generating answers.",
    "The system was designed to preserve evidence, challenge its own findings, document failed hypotheses, test sensitivity, verify citations, and produce work another researcher could inspect.",
    "Its early work focused on finance, backtesting, event studies, market information, and statistical inference.",
    "The research program later expanded into humanitarian resource allocation and the reliability of AI-assisted research itself.",
    "Cumulant remains a developing independent initiative.",
    "Its purpose is not to remove humans from research. Its purpose is to increase the reach of researchers while keeping verification, judgment, and responsibility visible.",
  ],
  // Short version used on the homepage About band.
  short:
    "An organization built around the structure beneath the average. It combines human direction, AI agents, and deterministic systems while keeping verification, judgment, and responsibility visible.",
};

export const FOUNDER: Founder = {
  name: "Aryan Patel",
  title: "Founder and Research Director",
  bio: [
    "Aryan Patel founded Cumulant Research to investigate finance, risk, humanitarian allocation, and AI-assisted research systems.",
    "He develops the organization's research infrastructure, coordinates its projects, and remains responsible for its public research direction.",
  ],
};

export const INFRASTRUCTURE = {
  heading: "Technical infrastructure.",
  intro:
    "The research system is built from a set of software components and deterministic infrastructure. Exact repository counts are not published here; where figures are uncertain, broad language is used.",
  components: [
    "Python research modules",
    "An automated test suite",
    "Multiple research project directories",
    "Persistent SQLite databases",
    "LangGraph checkpoints",
    "A versioned knowledge graph",
    "Institutional memory in structured files",
    "Reproducibility reports",
    "LaTeX paper generation",
    "Claim verification",
    "Citation checking",
    "Sensitivity analysis",
    "Human review gates",
  ],
  note: "Specific counts of modules, tests, and directories require verification from the research codebase and are not stated here.",
};

export const SOURCES = {
  heading: "Data and literature sources.",
  intro:
    "The system has used or supported public retrieval from these sources. They are public sources and integrations, not partners.",
  list: [
    "SEC EDGAR",
    "Yahoo Finance",
    "Kenneth French data",
    "Semantic Scholar",
    "Crossref",
    "arXiv",
    "ProPublica Nonprofit Explorer",
    "GDELT",
  ],
};
