export const AI_DISCLOSURE = {
  label: "AI Disclosure",
  heading: "How AI is used, and where humans remain responsible.",
  core: "AI systems assist with literature retrieval, document analysis, data acquisition, code generation, statistical testing, robustness analysis, citation checking, drafting, and workflow coordination.",
  humanHeading: "Human researchers remain responsible for:",
  human: [
    "Choosing the research question",
    "Approving the design",
    "Evaluating data quality",
    "Reviewing analytical code",
    "Interpreting results",
    "Verifying citations",
    "Deciding what becomes public",
    "Correcting errors",
    "Accepting responsibility for conclusions",
  ],
  rulesHeading: "Boundaries on AI",
  rules: [
    "AI systems are not listed as authors.",
    "AI-generated text is not treated as evidence.",
    "AI-generated citations must be verified against original sources.",
    "AI-generated code must be tested and inspected.",
    "Automated outputs do not advance to public claims without human review.",
  ],
};

export const REPRODUCIBILITY = {
  label: "Reproducibility",
  heading: "A result should come with a path back to the evidence.",
  intro: "Depending on the project, releases may include:",
  items: [
    "Raw retrievals or retrieval instructions",
    "Processed data",
    "Source provenance",
    "Content hashes where appropriate",
    "Analytical code",
    "Configuration files",
    "Dependency information",
    "Random seeds",
    "Saved outputs",
    "Figures",
    "Tables",
    "Claim verification",
    "Replication instructions",
    "Known limitations",
    "Version history",
    "Corrections",
  ],
  note: "Not every project includes every item. The list above describes what a serious Cumulant release aims to include.",
};

export const CORRECTIONS = {
  label: "Corrections",
  heading: "Corrections are part of the research record.",
  intro:
    "Cumulant preserves changes so readers can see how a result evolved, what was wrong, and whether the conclusion changed.",
  fields: [
    "Project",
    "Date",
    "Version",
    "Original statement",
    "Revised statement",
    "Reason",
    "Effect on conclusions",
    "Updated files",
    "Current status",
  ],
  emptyState:
    "The public correction log grows as versioned outputs are released. Project-level version history is recorded on each project page.",
};
