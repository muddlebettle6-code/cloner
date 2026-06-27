import Link from "next/link";
import { NewsroomShell } from "@/components/newsroom-shell";
import { Reveal } from "@/components/reveal";
import { ARTICLES_BY_RECENCY, leadStory } from "@/content/articles";
import { CompactRow, LeadCard, Masthead, StoryCard } from "@/components/article-cards";

const INTRO =
  "Independent analysis of the events moving markets, the economy, and policy, one consequential question at a time.";

export const metadata = {
  title: "Newsroom",
  description: INTRO,
};

export default function ArticlesPage() {
  const all = ARTICLES_BY_RECENCY;
  const lead = leadStory();
  const rest = lead ? all.filter((a) => a.slug !== lead.slug) : all;
  const latest = rest.slice(0, 4);
  const grid = rest.slice(4);

  return (
    <NewsroomShell>
      <Masthead title="Newsroom" intro={INTRO} />

      {all.length === 0 && <p className="py-[40px] text-[15px] text-smoke">No stories yet.</p>}

      {/* Lead story + Latest */}
      {lead && (
        <section className="grid gap-[36px] py-[36px] lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-[48px]">
          <Reveal>
            <LeadCard a={lead} />
          </Reveal>
          <Reveal className="lg:border-l lg:border-clay lg:pl-[40px]">
            <p className="mb-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink">Latest</p>
            <div>
              {latest.map((a, i) => (
                <CompactRow key={a.slug} a={a} first={i === 0} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* More stories */}
      {grid.length > 0 && (
        <Reveal as="section" className="border-t border-clay py-[36px]">
          <p className="mb-[22px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink">More stories</p>
          <div className="grid gap-x-[40px] gap-y-[38px] sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((a) => (
              <StoryCard key={a.slug} a={a} />
            ))}
          </div>
        </Reveal>
      )}

      <div className="flex gap-[26px] border-t border-clay pt-[24px]">
        <Link href="/articles/topics" className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke transition-colors hover:text-ink">
          Browse all topics
        </Link>
        <Link href="/articles/methodology" className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke transition-colors hover:text-ink">
          Methodology
        </Link>
      </div>
    </NewsroomShell>
  );
}
