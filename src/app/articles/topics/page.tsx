import Link from "next/link";
import { NewsroomShell } from "@/components/newsroom-shell";
import { Reveal } from "@/components/reveal";
import { sectionCounts } from "@/content/articles";
import { SECTIONS } from "@/content/newsroom";
import { Masthead } from "@/components/article-cards";

export const metadata = { title: "Topics — Newsroom" };

export default function TopicsPage() {
  const counts = sectionCounts();
  return (
    <NewsroomShell>
      <Masthead kicker="Newsroom" title="Topics" intro="Every desk in the newsroom." active="all" />
      <Reveal as="section" stagger className="mt-[28px] grid gap-px border border-clay bg-clay sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.sort((a, b) => a.order - b.order).map((s) => (
          <Link key={s.slug} href={`/articles/topic/${s.slug}`} className="group block bg-cream p-[22px] transition-colors hover:bg-stone">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[19px] font-medium tracking-[-0.4px] text-ink">{s.label}</h2>
              <span className="font-mono text-[11px] text-smoke">{counts[s.slug] ?? 0}</span>
            </div>
            <p className="mt-[8px] text-[14px] leading-[1.45] text-smoke">{s.blurb}</p>
          </Link>
        ))}
      </Reveal>
    </NewsroomShell>
  );
}
