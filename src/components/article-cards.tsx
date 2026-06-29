// Reusable newsroom card system. Server components in the house aesthetic
// (Neue Haas + Akkurat Mono, white/black/grey, magenta section accent,
// rectangular imagery). Used by the newsroom homepage and topic pages.
import Link from "next/link";
import type { Article } from "@/content/types";
import { SECTION_BY_SLUG, ARTICLE_TYPE_BY_SLUG, SECTIONS } from "@/content/newsroom";
import { ArrowIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const MAG = "#ff2d92";

/** The newsroom topic navigation strip. `active` is a section slug or "all". */
export function TopicNav({ active }: { active?: string }) {
  const cls = (on: boolean) =>
    cn("whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.06em] transition-colors", on ? "text-ink" : "text-smoke hover:text-ink");
  return (
    <div className="relative border-y border-clay">
      <nav className="flex gap-[20px] overflow-x-auto py-[13px] pr-[48px] [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link href="/articles" className={cls(!active)}>Top</Link>
        {[...SECTIONS].sort((a, b) => a.order - b.order).map((s) => (
          <Link key={s.slug} href={`/articles/topic/${s.slug}`} className={cls(active === s.slug)}>
            {s.short ?? s.label}
          </Link>
        ))}
        <Link href="/articles/topics" className={cls(active === "all")}>All topics</Link>
      </nav>
      {/* Fade + arrow so the list reads as scrollable instead of cut off. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-cream via-cream to-transparent pl-[30px]">
        <ArrowIcon className="h-[12px] w-[12px] text-smoke" />
      </div>
    </div>
  );
}

/** Newsroom masthead: kicker + large title (matching other pages), intro, nav. */
export function Masthead({ title, kicker, intro, active }: { title: string; kicker?: string; intro?: string; active?: string }) {
  return (
    <div>
      <div className="pb-[28px] pt-[40px] md:pt-[60px]">
        {kicker && <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">{kicker}</p>}
        <h1 className="mt-[16px] text-[40px] leading-[1.05] tracking-[-1px] text-ink md:text-[64px]">{title}</h1>
        {intro && <p className="mt-[22px] max-w-[680px] text-[18px] leading-[1.4] text-ink md:text-[20px]">{intro}</p>}
      </div>
      <TopicNav active={active} />
    </div>
  );
}

export function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function fmtTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** The magenta section kicker. */
export function SectionTag({ slug, className }: { slug?: string; className?: string }) {
  const s = slug ? SECTION_BY_SLUG[slug] : undefined;
  if (!s) return null;
  return (
    <Link
      href={`/articles/topic/${s.slug}`}
      className={cn("font-mono text-[11px] uppercase tracking-[0.08em] transition-opacity hover:opacity-70", className)}
      style={{ color: MAG }}
    >
      {s.short ?? s.label}
    </Link>
  );
}

export function Meta({ a, showType = true }: { a: Article; showType?: boolean }) {
  const t = a.articleType ? ARTICLE_TYPE_BY_SLUG[a.articleType] : undefined;
  const time = fmtTime(a.publishedAt);
  const parts = [
    fmtDate(a.publishedAt ?? a.date) + (time ? `, ${time}` : ""),
    showType && t ? t.label : null,
    `${a.readingMinutes} min`,
  ].filter(Boolean);
  return <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-smoke">{parts.join("  ·  ")}</p>;
}

function Thumb({ a, ratio, className }: { a: Article; ratio: string; className?: string }) {
  if (!a.leadImage) return null;
  return (
    <div className={cn("overflow-hidden border border-clay bg-stone", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={a.leadImage.src}
        alt={a.leadImage.alt}
        loading="lazy"
        className={cn("w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]", ratio)}
      />
    </div>
  );
}

/** The single lead story: wide image, large headline, summary. */
export function LeadCard({ a }: { a: Article }) {
  return (
    <Link href={`/articles/${a.slug}`} className="group block">
      <Thumb a={a} ratio="aspect-[16/9]" className="mb-[20px]" />
      <SectionTag slug={a.primarySection} />
      <h2 className="mt-[10px] text-[30px] font-medium leading-[1.04] tracking-[-1px] text-ink md:text-[44px]">
        {a.headline}
      </h2>
      <p className="mt-[14px] max-w-[660px] text-[17px] leading-[1.5] text-smoke md:text-[19px]">{a.summary ?? a.deck}</p>
      <div className="mt-[14px]">
        <Meta a={a} />
      </div>
    </Link>
  );
}

/** Standard image-led story card for grids. */
export function StoryCard({ a }: { a: Article }) {
  return (
    <Link href={`/articles/${a.slug}`} className="group block">
      <Thumb a={a} ratio="aspect-[3/2]" className="mb-[14px]" />
      <SectionTag slug={a.primarySection} />
      <h3 className="mt-[8px] text-[19px] font-medium leading-[1.16] tracking-[-0.4px] text-ink md:text-[21px]">
        {a.headline}
      </h3>
      <p className="mt-[8px] line-clamp-2 text-[15px] leading-[1.45] text-smoke">{a.summary ?? a.deck}</p>
      <div className="mt-[10px]">
        <Meta a={a} showType={false} />
      </div>
    </Link>
  );
}

/** Compact, text-led headline row for "Latest" / section lists. */
export function CompactRow({ a, first }: { a: Article; first?: boolean }) {
  return (
    <Link href={`/articles/${a.slug}`} className={cn("group block py-[15px]", !first && "border-t border-clay")}>
      <div className="flex items-center gap-[10px]">
        <SectionTag slug={a.primarySection} className="text-[10px]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-smoke">
          {fmtTime(a.publishedAt) || fmtDate(a.publishedAt ?? a.date)}
        </span>
      </div>
      <h4 className="mt-[6px] text-[16px] font-medium leading-[1.25] tracking-[-0.2px] text-ink transition-colors group-hover:text-smoke">
        {a.headline}
      </h4>
    </Link>
  );
}

/** Horizontal text+thumbnail row (used in section modules and lists). */
export function ListRow({ a, first }: { a: Article; first?: boolean }) {
  return (
    <Link
      href={`/articles/${a.slug}`}
      className={cn("group grid grid-cols-[1fr_96px] items-start gap-[16px] py-[16px] md:grid-cols-[1fr_120px]", !first && "border-t border-clay")}
    >
      <div>
        <SectionTag slug={a.primarySection} className="text-[10px]" />
        <h4 className="mt-[6px] text-[17px] font-medium leading-[1.22] tracking-[-0.3px] text-ink md:text-[18px]">
          {a.headline}
        </h4>
        <p className="mt-[6px] line-clamp-2 text-[14px] leading-[1.4] text-smoke">{a.summary ?? a.deck}</p>
      </div>
      {a.leadImage && <Thumb a={a} ratio="aspect-[1/1]" />}
    </Link>
  );
}

/** Text-led story for a newspaper-style side column (headline + dek, no image). */
export function TextStory({ a, first }: { a: Article; first?: boolean }) {
  return (
    <Link href={`/articles/${a.slug}`} className={cn("group block py-[20px]", !first && "border-t border-clay")}>
      <SectionTag slug={a.primarySection} />
      <h3 className="mt-[8px] text-[21px] font-medium leading-[1.14] tracking-[-0.5px] text-ink transition-colors group-hover:text-smoke md:text-[23px]">
        {a.headline}
      </h3>
      <p className="mt-[8px] line-clamp-3 text-[15px] leading-[1.45] text-smoke">{a.summary ?? a.deck}</p>
    </Link>
  );
}
