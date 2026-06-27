import { NewsroomShell } from "@/components/newsroom-shell";
import { Reveal } from "@/components/reveal";
import { Masthead } from "@/components/article-cards";

export const metadata = {
  title: "Methodology — Newsroom",
  description: "How the Cumulant newsroom finds, selects, verifies, analyzes, and updates stories.",
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "How we find stories",
    body: [
      "The newsroom reviews primary and reputable secondary material: official documents, regulatory filings, government and central-bank releases, economic data, company announcements, court and procurement records where legally accessible, and reporting from established outlets.",
      "Automated systems help identify meaningful changes, unusual disclosures, new data, and developments with possible economic or financial consequences, so we can read the source closer to the moment it is published rather than waiting for it to be summarized elsewhere.",
    ],
  },
  {
    h: "How AI is used",
    body: [
      "AI assists with monitoring approved sources, comparing document versions, organizing source material, extracting the entities involved, identifying possible economic connections, finding related historical material, drafting structure, checking internal consistency, and flagging claims that need review.",
      "AI output is not treated as a source. The underlying document, dataset, filing, statement, or verified report remains the source, and every figure traces back to it.",
    ],
  },
  {
    h: "How stories are selected",
    body: [
      "Stories are prioritized by economic importance, market relevance, policy significance, public impact, timeliness, source quality, reader usefulness, original analytical value, and the breadth of their consequences.",
      "Most monitored events do not become articles. A routine filing or a predictable market move with no useful explanation is set aside; we publish when there is a genuine, consequential question we can answer with evidence.",
    ],
  },
  {
    h: "How stories are verified",
    body: [
      "We check names, dates, times, numbers, units, percentages, quotes, tickers, and the legal or policy status of an action, and we confirm key figures across sources.",
      "We distinguish a proposal from an enacted rule, an allegation from a verified fact, and an estimate from a reported number. Higher-risk stories receive additional review before publication.",
    ],
  },
  {
    h: "How analysis is kept separate from fact",
    body: [
      "Articles keep verified facts distinct from analysis, estimates, scenarios, and opinion. Where a piece argues a case or projects a range of outcomes, it says so plainly, and possible effects are never presented as confirmed ones.",
      "Forward scenarios are framed as scenarios, with the evidence that would make each more or less likely, not as predictions.",
    ],
  },
  {
    h: "How stories are updated",
    body: [
      "Developing stories show their original publication time and last-updated time. When facts are added or corrected, the change is recorded so readers can see how the story evolved.",
      "When a story is still developing, we update a single article rather than publishing several near-duplicates of the same event.",
    ],
  },
  {
    h: "How data stories are produced",
    body: [
      "Data stories disclose their data sources, the time period, the definitions used, the calculations and assumptions behind a figure, the limitations of the analysis, and any data revisions.",
      "The aim is that a reader could, in principle, follow the method and reach the same numbers.",
    ],
  },
  {
    h: "How human review works",
    body: [
      "Source-driven stories that are high-impact, legal, political, involve named individuals or allegations, or could move markets are written as drafts and held for editorial review before publication. They do not publish from a single model output.",
      "We describe only the review the newsroom actually performs.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <NewsroomShell>
      <Masthead
        kicker="Newsroom"
        title="Methodology"
        intro="How the newsroom finds, selects, verifies, analyzes, and updates stories. AI-assisted and not peer reviewed; every figure traces to a cited source."
        active="all"
      />

      <Reveal as="section" className="border-t border-clay py-[36px]">
        <p className="max-w-[760px] text-[18px] leading-[1.5] text-ink md:text-[19px]">
          Our newsroom combines source monitoring, structured research, data analysis, and editorial review.
          Automated systems help us identify new filings, policy changes, economic releases, company announcements,
          and other developments that might affect markets, businesses, governments, or households. These systems
          help compare documents, organize source material, identify the entities involved, and map possible
          economic consequences. AI-generated output is not treated as evidence on its own: an article must be
          grounded in identifiable source material such as an official document, public dataset, regulatory filing,
          company statement, or verified report.
        </p>
      </Reveal>

      {SECTIONS.map((s) => (
        <Reveal as="section" key={s.h} className="border-t border-clay py-[30px]">
          <div className="grid gap-[14px] md:grid-cols-[230px_1fr] md:gap-[40px]">
            <h2 className="text-[18px] font-medium leading-[1.2] tracking-[-0.3px] text-ink md:text-[20px]">{s.h}</h2>
            <div className="max-w-[680px]">
              {s.body.map((p, i) => (
                <p key={i} className="mb-[14px] text-[16px] leading-[1.55] text-smoke last:mb-0 md:text-[17px]">{p}</p>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </NewsroomShell>
  );
}
