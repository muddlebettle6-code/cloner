import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { bySection } from "@/content/articles";
import { SECTIONS, SECTION_BY_SLUG } from "@/content/newsroom";
import { LeadCard, ListRow, TopicNav } from "@/components/article-cards";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SECTION_BY_SLUG[slug];
  return s ? { title: `${s.label} — Newsroom`, description: s.blurb } : { title: "Topic" };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = SECTION_BY_SLUG[slug];
  if (!section) notFound();

  const arts = bySection(slug);
  const [lead, ...rest] = arts;

  return (
    <PageShell eyebrow="Newsroom" title={section.label} intro={section.blurb}>
      <TopicNav active={slug} />

      {/* Subtopics */}
      <div className="flex flex-wrap gap-[8px] py-[18px]">
        {section.subtopics.map((t) => (
          <span key={t} className="border border-clay px-[11px] py-[5px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
            {t}
          </span>
        ))}
      </div>

      {arts.length === 0 ? (
        <div className="border-t border-clay py-[40px]">
          <p className="text-[16px] leading-[1.5] text-smoke">
            No stories in {section.label} yet. The newsroom runs continuously and covers this desk as developments
            warrant.{" "}
            <Link href="/articles" className="text-ink underline-offset-2 hover:underline">
              Back to the newsroom
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          {lead && (
            <Reveal className="border-t border-clay py-[36px]">
              <LeadCard a={lead} />
            </Reveal>
          )}
          {rest.length > 0 && (
            <Reveal as="section" className="border-t border-clay py-[20px]">
              <p className="mb-[6px] font-mono text-[12px] uppercase tracking-[0.1em] text-ink">More in {section.label}</p>
              <div className="grid gap-x-[40px] md:grid-cols-2">
                {rest.map((a, i) => (
                  <ListRow key={a.slug} a={a} first={i < 2} />
                ))}
              </div>
            </Reveal>
          )}
        </>
      )}

      {/* Related desks */}
      <Reveal as="section" className="border-t border-clay py-[28px]">
        <p className="mb-[12px] font-mono text-[12px] uppercase tracking-[0.1em] text-ink">Other desks</p>
        <div className="flex flex-wrap gap-[10px]">
          {SECTIONS.filter((s) => s.slug !== slug)
            .sort((a, b) => a.order - b.order)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/articles/topic/${s.slug}`}
                className="border border-clay px-[12px] py-[6px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke transition-colors hover:border-ink hover:text-ink"
              >
                {s.label}
              </Link>
            ))}
        </div>
      </Reveal>
    </PageShell>
  );
}
