import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { ARTICLES, ARTICLES_INTRO } from "@/content/articles";
import { cn } from "@/lib/utils";

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
            className={cn(
              "group block border-t border-clay py-[28px] last:border-b md:py-[36px]",
              a.leadImage && "md:grid md:grid-cols-[1fr_300px] md:gap-[30px] md:items-start"
            )}
          >
            {a.leadImage && (
              <div className="order-first mb-[18px] overflow-hidden rounded-[6px] border border-clay bg-stone md:order-last md:mb-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.leadImage.src}
                  alt={a.leadImage.alt}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
            )}
            <div className="md:order-first">
              <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                {fmtDate(a.date)}  ·  {a.readingMinutes} min read{a.tags?.[0] ? `  ·  ${a.tags[0]}` : ""}
              </p>
              <h2 className="mt-[10px] max-w-[820px] text-[26px] font-medium leading-[1.1] tracking-[-0.6px] text-ink md:text-[34px]">
                {a.headline}
              </h2>
              <p className="mt-[12px] max-w-[680px] text-[16px] leading-[1.5] text-smoke">{a.deck}</p>
              <span className="mt-[16px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                Read the article <ArrowIcon className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-[3px]" />
              </span>
            </div>
          </Link>
        ))}
      </Reveal>
    </PageShell>
  );
}
