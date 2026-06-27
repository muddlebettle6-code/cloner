import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ARTICLES_BY_RECENCY, ARTICLES_INTRO, bySection, leadStory, sectionCounts } from "@/content/articles";
import { SECTIONS } from "@/content/newsroom";
import { CompactRow, LeadCard, ListRow, TopicNav } from "@/components/article-cards";

export const metadata = {
  title: "Newsroom",
  description: ARTICLES_INTRO.body,
};

export default function ArticlesPage() {
  const all = ARTICLES_BY_RECENCY;
  const lead = leadStory();
  const latest = all.filter((a) => a.slug !== lead?.slug).slice(0, 5);
  const counts = sectionCounts();
  const deskSections = SECTIONS.filter((s) => (counts[s.slug] ?? 0) > 0).sort((a, b) => a.order - b.order);

  return (
    <PageShell eyebrow="Newsroom" title="Newsroom." intro={ARTICLES_INTRO.body}>
      <TopicNav />

      {all.length === 0 && <p className="py-[28px] text-[15px] text-smoke">No stories yet.</p>}

      {/* Lead story + Latest stream */}
      {lead && (
        <section className="grid gap-[36px] py-[40px] md:grid-cols-[1fr_320px] md:gap-[48px]">
          <Reveal>
            <LeadCard a={lead} />
          </Reveal>
          <Reveal className="md:border-l md:border-clay md:pl-[40px]">
            <p className="mb-[4px] font-mono text-[12px] uppercase tracking-[0.1em] text-ink">Latest</p>
            <div>
              {latest.map((a, i) => (
                <CompactRow key={a.slug} a={a} first={i === 0} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Desk modules — the newsroom organized by section */}
      {deskSections.map((s) => {
        const arts = bySection(s.slug).slice(0, 4);
        if (!arts.length) return null;
        return (
          <Reveal as="section" key={s.slug} className="border-t border-clay py-[34px]">
            <div className="mb-[16px] flex items-baseline justify-between">
              <Link href={`/articles/topic/${s.slug}`} className="group inline-flex items-baseline gap-[10px]">
                <h2 className="text-[22px] font-medium tracking-[-0.5px] text-ink transition-opacity group-hover:opacity-70 md:text-[26px]">
                  {s.label}
                </h2>
                <span className="font-mono text-[11px] text-smoke">{counts[s.slug]}</span>
              </Link>
              <Link href={`/articles/topic/${s.slug}`} className="font-mono text-[11px] uppercase tracking-[0.05em] text-smoke transition-colors hover:text-ink">
                View all
              </Link>
            </div>
            <div className="grid gap-x-[40px] md:grid-cols-2">
              {arts.map((a, i) => (
                <ListRow key={a.slug} a={a} first={i < 2} />
              ))}
            </div>
          </Reveal>
        );
      })}
    </PageShell>
  );
}
