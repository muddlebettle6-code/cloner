import type { Project } from "./types";
import { RESEARCH_PROGRAMS } from "./research";

export const PROJECTS_INTRO = {
  heading: "Featured projects.",
  body: "Current and archived work. Each project links to its question, methods, data status, and limitations. Statuses are honest: in progress, working paper, research note, experimental, replication, or null result.",
};

// Lifecycle stages used for the project progress indicator (1 to 4).
export const PROJECT_STAGES = ["CONCEPT", "ANALYSIS", "REVIEW", "DOCUMENTED"];

const AI_DISCLOSURE_DEFAULT =
  "AI agents assisted with literature retrieval, code generation, analysis support, critique, and drafting. Deterministic systems produced and verified the estimates. A human researcher approved the question, design, interpretation, and release.";

// Canonical research projects, synced to the Cumulant research database.
export const PROJECTS: Project[] = [
  {
    slug: "humanitarian-portfolio-allocation",
    title: "Humanitarian Portfolio Allocation Under Uncertainty",
    subtitle: "Spreading limited resources across programs and regions when outcomes are uncertain and benefits diminish.",
    status: "Research in progress",
    statusKind: "in-progress",
    stage: 2,
    program: "humanitarian-finance",
    version: "Working draft",
    date: "2026-05",
    authors: ["Aryan Patel"],
    abstract:
      "An investigation into whether portfolio reasoning can help humanitarian organizations allocate limited resources across programs and regions while accounting for uncertainty, concentration risk, and diminishing marginal benefit. The project examines where financial portfolio concepts transfer to humanitarian objectives and where donor restrictions, mission constraints, and uncertain impact change the allocation problem.",
    researchQuestion:
      "How should limited resources be spread across programs and regions when outcomes are uncertain and benefits diminish?",
    methods: [
      "Allocation across programs and regions",
      "Concentration risk",
      "Diminishing marginal benefit",
      "Donor restrictions and mission constraints",
      "Robust allocation under uncertainty",
    ],
    data: "Public humanitarian and nonprofit allocation data; provenance recorded as the work proceeds.",
    results: "Research in progress. No completed findings are claimed.",
    limitations:
      "Humanitarian objectives, donor restrictions, and uncertain impact change the allocation problem in ways that may limit the transfer of financial portfolio methods.",
    codeAvailability: "Internal. Not yet released.",
    dataAvailability: "Public sources; release forthcoming.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal validation.",
    corrections: [],
    related: ["diversification-marginal-risk"],
  },
  {
    slug: "robustness-in-backtest-inference",
    title: "Robustness in Backtest Inference",
    subtitle: "How much of a historical investment edge survives multiple testing, costs, and out-of-sample evaluation.",
    status: "Working paper",
    statusKind: "working-paper",
    stage: 3,
    program: "financial-inference",
    version: "Working paper",
    date: "2026-05",
    authors: ["Aryan Patel"],
    abstract:
      "A method-focused study of how inference choices, model selection, and repeated testing inflate the apparent performance of historical trading strategies, and what survives once those effects are controlled for. The work develops a structure-preserving randomization test that holds the trade structure and price path fixed and re-randomizes only entry placement, separating profitability from genuine entry-timing skill. A companion working paper presents the method and results in full.",
    researchQuestion:
      "How much of a historical investment edge survives multiple testing, costs, and out-of-sample evaluation?",
    methods: [
      "Structure-preserving randomization",
      "Multiple-testing control",
      "Out-of-sample evaluation",
      "Sensitivity to declared measures",
      "Cross-asset robustness",
    ],
    data: "Gold futures and a cross-asset panel of public daily market data; provenance recorded.",
    results:
      "Working paper. Across the examined panel, profitability is common but no rule shows robust, measure-invariant entry-timing skill after multiplicity control. The work is not published.",
    limitations:
      "Findings are primarily single-asset; the cross-asset panel is exploratory, and conclusions depend on the declared re-randomization measures.",
    codeAvailability: "Internal. Release forthcoming.",
    dataAvailability: "Public market data.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal validation.",
    corrections: [],
    related: ["equity-premium-skeptical-inference", "decision-rules-ambiguous-probabilities"],
  },
  {
    slug: "diversification-marginal-risk",
    title: "Diminishing Marginal Risk Reduction in Diversification",
    subtitle: "How quickly diversification benefits flatten as holdings are added.",
    status: "Research note",
    statusKind: "research-note",
    stage: 3,
    program: "portfolios",
    version: "Research note",
    date: "2026-04",
    authors: ["Aryan Patel"],
    abstract:
      "A short study of how portfolio risk changes as holdings are added to an equal-weight portfolio, and where the marginal benefit of further diversification begins to flatten. The analysis emphasizes dependence on the sample, market period, portfolio construction, and chosen risk measure.",
    researchQuestion: "Where does adding another holding stop meaningfully reducing portfolio risk?",
    methods: [
      "Equal-weight portfolios",
      "Holdings counts of 10, 20, and 100",
      "Risk-measure comparison",
    ],
    data: "Public market data (S&P 500), 2021 to 2025.",
    results:
      "In the defined setup, a previously reported difference between the 10-stock and 100-stock risk estimates was about 1.78 percentage points. This figure is specific to the sample, period, construction, and risk measure, and is not presented as universal.",
    limitations:
      "Results depend on the sample, market period, portfolio construction, and chosen risk measure, and should not be generalized beyond the defined setup.",
    codeAvailability: "Internal. Release forthcoming.",
    dataAvailability: "Public market data (S&P 500).",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal validation.",
    corrections: [],
    related: ["humanitarian-portfolio-allocation"],
  },
  {
    slug: "ai-assisted-research-validation",
    title: "AI-Assisted Research Validation",
    subtitle: "Whether AI agents can reliably check citations, code, and sensitivity inside a reproducible workflow.",
    status: "Experimental",
    statusKind: "experimental",
    stage: 2,
    program: "ai-research-systems",
    version: "Experimental",
    date: "2026-04",
    authors: ["Aryan Patel"],
    abstract:
      "An experimental systems program testing whether AI agents can reliably check citation validity, code reliability, and sensitivity inside a reproducible research workflow, and where automation is safe versus where it introduces hidden risk. AI agents act as software roles under human approval, not as independent researchers.",
    researchQuestion: "Can an AI agent reliably test citation validity, code, and sensitivity inside a research workflow?",
    methods: [
      "Citation resolution checks",
      "Multi-agent error reduction",
      "Automated critique",
      "Measuring how much human review changes conclusions",
    ],
    data: "Internal research workflows, logs, and artifacts, preserved for analysis.",
    results: "Experimental. Preliminary analysis; conclusions are not finalized.",
    limitations:
      "Findings about automation safety are preliminary and depend on the specific systems studied.",
    codeAvailability: "Internal experimental system.",
    dataAvailability: "Internal.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Experimental system.",
    corrections: [],
    related: ["provenance-citation-verification"],
  },
  {
    slug: "provenance-citation-verification",
    title: "Provenance & Citation Verification Pipeline",
    subtitle: "Tracking sources end-to-end so every claim links back to a verifiable origin.",
    status: "Research in progress",
    statusKind: "in-progress",
    stage: 2,
    program: "ai-research-systems",
    version: "In progress",
    date: "2026-03",
    authors: ["Aryan Patel"],
    abstract:
      "A software project building an end-to-end provenance and citation-verification pipeline so that every public claim can be traced back to a verifiable source. The work focuses on recording where data and citations come from and surfacing breaks in the chain before a claim is published.",
    researchQuestion: "Can sources be tracked end-to-end so every claim links back to a verifiable origin?",
    methods: [
      "Source provenance recording",
      "Citation resolution",
      "Claim-to-source linking",
      "Chain-of-custody checks",
    ],
    data: "Internal research artifacts and public citation sources (Semantic Scholar, Crossref, arXiv).",
    results: "Research in progress. No completed findings are claimed.",
    limitations: "An evolving internal system; coverage and reliability are still being established.",
    codeAvailability: "Internal. Release forthcoming.",
    dataAvailability: "Public citation sources.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal validation.",
    corrections: [],
    related: ["ai-assisted-research-validation"],
  },
  {
    slug: "equity-premium-skeptical-inference",
    title: "Does the Equity Premium Survive Skeptical Inference?",
    subtitle: "A replication testing whether a widely cited finding holds under stricter assumptions and new data.",
    status: "Replication",
    statusKind: "replication",
    stage: 3,
    program: "replication",
    version: "Replication",
    date: "2026-02",
    authors: ["Aryan Patel"],
    abstract:
      "A replication that re-examines a widely cited finding under stricter assumptions and new data, asking how much of the original result survives skeptical inference. The project documents what holds, what weakens, and where the original conclusion depends on specific choices.",
    researchQuestion: "Does a widely cited finding hold under stricter assumptions and new data?",
    methods: ["Replication", "Stricter inference", "New-data testing", "Sensitivity analysis"],
    data: "Public market and factor data; provenance recorded.",
    results: "Replication in progress. No completed findings are claimed; the work is not published.",
    limitations: "Findings will be specific to the replication design and the data used.",
    codeAvailability: "Internal. Release forthcoming.",
    dataAvailability: "Public sources.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal validation.",
    corrections: [],
    related: ["robustness-in-backtest-inference", "catalog-of-null-results"],
  },
  {
    slug: "catalog-of-null-results",
    title: "A Catalog of Things That Did Not Work",
    subtitle: "A maintained record of abandoned models and failed hypotheses, kept because failure carries information.",
    status: "Null result",
    statusKind: "null-result",
    stage: 4,
    program: "replication",
    version: "Ongoing record",
    date: "2026-01",
    authors: ["Aryan Patel"],
    abstract:
      "A maintained, public record of abandoned models, failed hypotheses, and diagnosed artifacts from across Cumulant's research, kept because failure carries information. The catalog records what was tried, why it was dropped, and what the failure rules out.",
    researchQuestion: "What can be learned and preserved from the models and hypotheses that did not work?",
    methods: ["Failure documentation", "Artifact diagnosis", "Null-result preservation"],
    data: "Internal research records across projects.",
    results:
      "Documented null and failed results are retained rather than discarded. This is an ongoing record, not a single finding.",
    limitations: "Entries describe specific attempts and do not generalize beyond them.",
    codeAvailability: "Internal.",
    dataAvailability: "Internal.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Internal record.",
    corrections: [],
    related: ["equity-premium-skeptical-inference"],
  },
  {
    slug: "decision-rules-ambiguous-probabilities",
    title: "Decision Rules Under Ambiguous Probabilities",
    subtitle: "How to choose when the probabilities themselves are uncertain, not just the outcomes.",
    status: "Research in progress",
    statusKind: "in-progress",
    stage: 2,
    program: "financial-inference",
    version: "In progress",
    date: "2025-12",
    authors: ["Aryan Patel"],
    abstract:
      "A study of how decisions should be made when the probabilities themselves are uncertain, not only the outcomes. The work examines decision rules under ambiguity and how robust choices change when the underlying distribution is not known.",
    researchQuestion: "How should choices be made when the probabilities themselves are uncertain, not just the outcomes?",
    methods: ["Decision under ambiguity", "Robust decision rules", "Sensitivity to the assumed distribution"],
    data: "Simulated and public data (planned).",
    results: "Research in progress. No completed findings are claimed.",
    limitations: "A developing project; design and scope are still being defined.",
    codeAvailability: "Not yet available.",
    dataAvailability: "Planned public and simulated data.",
    aiDisclosure: AI_DISCLOSURE_DEFAULT,
    reproductionStatus: "Concept and early analysis.",
    corrections: [],
    related: ["robustness-in-backtest-inference"],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

// Projects grouped by research program, for the homepage pipeline view.
export const PROJECT_GROUPS = RESEARCH_PROGRAMS.map((program) => ({
  program,
  projects: PROJECTS.filter((p) => p.program === program.key),
})).filter((g) => g.projects.length > 0);

export const PROJECT_STATUS_FILTERS = [
  "All",
  "In progress",
  "Working paper",
  "Research note",
  "Experimental",
  "Replication",
  "Null result",
];

const STATUS_KIND_LABEL: Record<string, string> = {
  "In progress": "in-progress",
  "Working paper": "working-paper",
  "Research note": "research-note",
  Experimental: "experimental",
  Replication: "replication",
  "Null result": "null-result",
};

export function matchesStatusFilter(p: Project, filter: string): boolean {
  if (filter === "All") return true;
  return p.statusKind === STATUS_KIND_LABEL[filter];
}
