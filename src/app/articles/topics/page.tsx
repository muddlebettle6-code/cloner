import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { sectionCounts } from "@/content/articles";
import { SECTIONS } from "@/content/newsroom";
import { TopicNav } from "@/components/article-cards";

export const metadata = { title: "All topics — Newsroom" };

export default function TopicsPage() {
  const counts = sectionCounts();
  return (
    <PageShell eyebrow="Newsroom" title="Topics." intro="Every desk in the newsroom, from markets and the economy to geopolitics, technology, banking, and personal finance.">
      <TopicNav active="all" />
      <Reveal as="section" stagger className="grid gap-px border border-clay bg-clay sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.sort((a, b) => a.order - b.order).map((s) => (
          <Link key={s.slug} href={`/articles/topic/${s.slug}`} className="group block bg-cream p-[22px] transition-colors hover:bg-stone">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-ink">{s.label}</h2>
              <span className="font-mono text-[11px] text-smoke">{counts[s.slug] ?? 0}</span>
            </div>
            <p className="mt-[8px] text-[14px] leading-[1.45] text-smoke">{s.blurb}</p>
            <p className="mt-[12px] line-clamp-1 font-mono text-[10px] uppercase tracking-[0.04em] text-smoke">
              {s.subtopics.slice(0, 4).join("  ·  ")}
            </p>
          </Link>
        ))}
      </Reveal>
    </PageShell>
  );
}
