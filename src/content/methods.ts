import type { MethodPhase, MethodStage } from "./types";

export const METHODS = {
  label: "Methods",
  heading: "From question to auditable result.",
  body: [
    "Cumulant's workflow is designed to make research inspectable. Software agents help retrieve evidence, write and test code, challenge findings, and preserve research state.",
    "Deterministic systems verify estimates, citations, artifacts, and progression gates. Human researchers define the question, review the design, interpret the evidence, and decide what becomes public.",
  ],
};

// The twelve workflow stages, verbatim.
export const METHOD_STAGES: MethodStage[] = [
  { n: 1, title: "Frame", desc: "Define one specific and falsifiable research question." },
  { n: 2, title: "Map", desc: "Review prior literature, methods, disagreements, and unresolved gaps." },
  { n: 3, title: "Retrieve", desc: "Acquire data and record its source, coverage, and provenance." },
  { n: 4, title: "Validate", desc: "Check missingness, duplicates, alignment, transformations, and sample construction." },
  { n: 5, title: "Declare", desc: "Specify the main outcome, assumptions, model, exclusions, and robustness plan." },
  { n: 6, title: "Analyze", desc: "Run deterministic code and save machine-readable outputs." },
  { n: 7, title: "Challenge", desc: "Use critical review to search for leakage, weak identification, alternative explanations, and unsupported claims." },
  { n: 8, title: "Stress-test", desc: "Test alternate samples, variables, models, windows, costs, assumptions, and out-of-sample behavior." },
  { n: 9, title: "Verify", desc: "Trace numerical claims and citations to saved evidence." },
  { n: 10, title: "Reproduce", desc: "Rebuild results from preserved inputs, code, seeds, and configurations." },
  { n: 11, title: "Review", desc: "Require human evaluation of the design, interpretation, limitations, and release decision." },
  { n: 12, title: "Release", desc: "Publish a versioned output with methods, code, data status, limitations, and correction history." },
];

// The twelve stages grouped into four process phases for the flowchart layout.
// Phase titles are organizational labels for the same twelve stages above.
export const METHOD_PHASES: MethodPhase[] = [
  { title: "Define", stages: METHOD_STAGES.slice(0, 2) },
  { title: "Build", stages: METHOD_STAGES.slice(2, 5) },
  { title: "Interrogate", stages: METHOD_STAGES.slice(5, 8) },
  { title: "Confirm", stages: METHOD_STAGES.slice(8, 12) },
];
