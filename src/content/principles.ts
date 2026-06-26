import type { Principle } from "./types";

export const PRINCIPLES_INTRO = {
  label: "Principles",
  heading: "The rules behind the work.",
  body: "These principles govern how Cumulant frames questions, handles evidence, and decides what becomes public.",
};

export const PRINCIPLES: Principle[] = [
  { n: 1, title: "Evidence before narrative", desc: "A compelling explanation is not a substitute for valid evidence." },
  { n: 2, title: "Uncertainty is part of the result", desc: "Research should show ranges, instability, and unresolved questions rather than hiding them behind one estimate." },
  { n: 3, title: "Null findings belong in the record", desc: "A hypothesis that fails still contains information." },
  { n: 4, title: "Reproducibility before persuasion", desc: "A result should be inspectable and rerunnable." },
  { n: 5, title: "Robustness should be designed", desc: "Alternative specifications should test the real fragility of a conclusion." },
  { n: 6, title: "AI assists the process", desc: "AI systems support research. They do not hold responsibility for it." },
  { n: 7, title: "Humans remain responsible", desc: "Human researchers approve the question, design, interpretation, and release." },
  { n: 8, title: "Corrections strengthen the record", desc: "Changes, errors, and revisions should remain visible." },
  { n: 9, title: "Claims should match evidence", desc: "The language of a conclusion should never exceed the strength of the design." },
];

// Four one-line principle statements distilled for the closing manifesto panel.
export const MANIFESTO = {
  lines: [
    "EVIDENCE BEFORE NARRATIVE.",
    "UNCERTAINTY IS PART OF THE RESULT.",
    "NULL FINDINGS BELONG IN THE RECORD.",
    "HUMANS REMAIN RESPONSIBLE.",
  ],
  attribution: "CUMULANT RESEARCH",
};
