import type { ResearchProgram } from "./types";

export const RESEARCH = {
  label: "Research",
  heading: "Current research.",
  body: "Cumulant studies difficult questions across finance, risk, statistical inference, model reliability, humanitarian allocation, and AI-assisted research systems.",
};

export const RESEARCH_PROGRAMS: ResearchProgram[] = [
  {
    key: "financial-inference",
    title: "Financial inference and model risk",
    summary:
      "Statistical inference and model reliability in financial data, where limited decision counts and flexible analysis can make findings fragile.",
    focus: [
      "Backtest inference",
      "Decision timing",
      "Researcher degrees of freedom",
      "Model selection",
      "False discovery",
      "Robustness",
      "Event studies",
      "Statistical fragility",
    ],
  },
  {
    key: "portfolios",
    title: "Portfolios and capital allocation",
    summary:
      "How diversification, concentration, and allocation behave under uncertainty and in the tails.",
    focus: [
      "Diversification",
      "Diminishing marginal risk reduction",
      "Portfolio construction",
      "Concentration",
      "Allocation under uncertainty",
      "Tail risk",
      "Scenario analysis",
    ],
  },
  {
    key: "humanitarian-finance",
    title: "Humanitarian finance",
    summary:
      "Whether allocation methods from finance can help humanitarian organizations reason about concentration, uncertainty, and limited resources.",
    focus: [
      "Humanitarian resource allocation",
      "Nonprofit capital allocation",
      "Program concentration",
      "Geographic concentration",
      "Operational uncertainty",
      "Mission constraints",
      "Limited resources",
      "Impact measurement",
    ],
  },
  {
    key: "ai-research-systems",
    title: "AI-assisted research systems",
    summary:
      "Whether multi-agent, AI-assisted workflows improve speed without sacrificing citation validity, code reliability, reproducibility, or human accountability.",
    focus: [
      "Multi-agent research",
      "Citation reliability",
      "Code reliability",
      "Automated critique",
      "Model disagreement",
      "Human review",
      "Reproducibility",
      "Research provenance",
    ],
  },
  {
    key: "replication",
    title: "Replication and failure analysis",
    summary:
      "Reproducing findings, testing published claims, diagnosing artifacts, and preserving null and failed results.",
    focus: [
      "Reproducing findings",
      "Testing published claims",
      "Diagnosing artifacts",
      "Preserving null results",
      "Comparing in-sample and out-of-sample behavior",
      "Documenting failed hypotheses",
    ],
  },
];
