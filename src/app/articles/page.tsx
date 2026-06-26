import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { ARTICLES, ARTICLES_INTRO } from "@/content/articles";

export const metadata = { title: "Articles" };

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticlesPage() {
  return (
    <PageShell eyebrow={ARTICLES_INTRO.label} title={ARTICLES_INTRO.heading} intro={ARTICLES_INTRO.body}>
      <Reveal as="section" stagger className="px-[15px] pb-[80px] md:px-[30px] md:pb-[120px]">
        {ARTICLES.length === 0 && (
          <p className="border-t border-clay py-[28px] text-[15px] text-smoke">No articles yet.</p>
        )}
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="group block border-t border-clay py-[28px] transition-opacity duration-300 last:border-b hover:opacity-70 md:py-[36px]"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
              {fmtDate(a.date)}  ·  {a.readingMinutes} min read{a.tags?.[0] ? `  ·  ${a.tags[0]}` : ""}
            </p>
            <h2 className="mt-[10px] max-w-[820px] text-[26px] font-medium leading-[1.1] tracking-[-0.6px] text-ink md:text-[34px]">
              {a.headline}
            </h2>
            <p className="mt-[12px] max-w-[680px] text-[16px] leading-[1.5] text-smoke">{a.deck}</p>
            <span className="mt-[16px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
              Read the article <ArrowIcon className="h-[14px] w-[14px]" />
            </span>
          </Link>
        ))}
      </Reveal>
    </PageShell>
  );
}
