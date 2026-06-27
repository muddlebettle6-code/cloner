import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleChartView } from "@/components/article-chart";
import { ArrowIcon } from "@/components/icons";
import { ARTICLES, getArticle } from "@/content/articles";
import type { Article, ArticleBlock, GlossaryEntry } from "@/content/types";
import { Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article" };
  return {
    title: a.headline,
    description: a.deck,
    openGraph: {
      title: a.headline,
      description: a.deck,
      type: "article",
      publishedTime: a.date,
      authors: [a.byline ?? "Cumulant Research"],
      siteName: "Cumulant Research",
      url: `/articles/${a.slug}`,
    },
    twitter: { card: "summary_large_image", title: a.headline, description: a.deck },
  };
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fmtTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** A key term the reader can hover (or tap) to see a plain-language definition. */
function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  return (
    <span tabIndex={0} className="group relative cursor-help border-b border-dotted border-smoke outline-none">
      {term}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-[8px] w-[240px] max-w-[78vw] -translate-x-1/2 rounded-[8px] border border-clay bg-white p-[12px] text-left text-[13px] font-normal normal-case leading-[1.45] tracking-normal text-ink opacity-0 shadow-[0_8px_28px_rgba(0,0,0,0.14)] transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-smoke">{term}</span>
        <span className="mt-[4px] block text-ink">{definition}</span>
      </span>
    </span>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap the first occurrence of each glossary term in the text with a tooltip. */
function renderProse(text: string, glossary: GlossaryEntry[] | undefined, linked: Set<string>): React.ReactNode {
  if (!glossary || glossary.length === 0) return text;
  let best: { start: number; end: number; entry: GlossaryEntry } | null = null;
  for (const g of glossary) {
    if (!g.term || linked.has(g.term.toLowerCase())) continue;
    const m = new RegExp(`\\b${escapeRegExp(g.term)}\\b`, "i").exec(text);
    if (m && (best === null || m.index < best.start || (m.index === best.start && g.term.length > best.end - best.start))) {
      best = { start: m.index, end: m.index + m[0].length, entry: g };
    }
  }
  if (!best) return text;
  linked.add(best.entry.term.toLowerCase());
  const after = text.slice(best.end);
  return (
    <>
      {text.slice(0, best.start)}
      <GlossaryTerm term={text.slice(best.start, best.end)} definition={best.entry.definition} />
      {renderProse(after, glossary, linked)}
    </>
  );
}

function Block({ article, block, linked }: { article: Article; block: ArticleBlock; linked: Set<string> }) {
  switch (block.type) {
    case "p":
      return <p className="my-[18px] text-[17px] leading-[1.65] text-ink md:text-[18px]">{renderProse(block.text, article.glossary, linked)}</p>;
    case "pullquote":
      return (
        <blockquote className="my-[34px] border-l-[3px] pl-[20px] text-[23px] font-medium leading-[1.32] tracking-[-0.4px] text-ink md:text-[27px]" style={{ borderColor: "#ff2d92" }}>
          {block.text}
        </blockquote>
      );
    case "callout":
      return (
        <div className="my-[24px] rounded-[8px] bg-stone p-[20px] md:p-[24px]">
          {block.label && <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-smoke">{block.label}</p>}
          <p className="mt-[6px] text-[16px] leading-[1.5] text-ink md:text-[17px]">{renderProse(block.text, article.glossary, linked)}</p>
        </div>
      );
    case "list":
      return (
        <ul className="my-[18px] flex flex-col gap-[10px]">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-[12px] text-[17px] leading-[1.55] text-ink">
              <span className="mt-[10px] h-[4px] w-[4px] flex-none rounded-full bg-ink" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "chart": {
      const chart = article.charts.find((c) => c.id === block.chartId);
      return chart ? <div className="my-[28px]"><ArticleChartView chart={chart} /></div> : null;
    }
    case "image":
      return (
        <figure className="my-[28px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-[6px] border border-clay bg-stone" />
          {(block.caption || block.credit) && (
            <figcaption className="mt-[10px] text-[13px] leading-[1.5] text-smoke">
              {block.caption}
              {block.caption && block.credit ? "  " : ""}
              {block.credit && <span className="text-smoke">{block.credit}</span>}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

const SOURCE_KIND_LABEL: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  academic: "Academic",
  data: "Data",
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const lead = article.leadChartId ? article.charts.find((c) => c.id === article.leadChartId) : undefined;
  const meta = [article.tags?.[0], `${article.readingMinutes} min read`].filter(Boolean).join("  ·  ");
  // Each glossary term is defined on its first appearance only.
  const linked = new Set<string>();

  return (
    <>
      <Header solid />
      <main className="w-full bg-cream pt-[60px]">
        <article className="px-[15px] pb-[40px] md:px-[30px]">
          {/* Hero */}
          <header className="mx-auto max-w-[760px] pt-[36px] md:pt-[72px]">
            <Link
              href="/articles"
              className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke transition-opacity duration-300 hover:opacity-60"
            >
              <ArrowIcon className="h-[13px] w-[13px] rotate-180" /> Articles
            </Link>
            <p className="mt-[26px] font-mono text-[11px] uppercase tracking-[0.05em] text-smoke">
              {fmtDate(article.date)}{fmtTime(article.publishedAt) ? `, ${fmtTime(article.publishedAt)}` : ""}{meta ? `  ·  ${meta}` : ""}
            </p>
            <h1 className="mt-[14px] text-[33px] font-medium leading-[1.06] tracking-[-1px] text-ink md:text-[52px]">
              {article.headline}
            </h1>
            <p className="mt-[20px] text-[19px] leading-[1.45] text-smoke md:text-[22px]">{article.deck}</p>
            <p className="mt-[22px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
              By {article.byline ?? "Cumulant Research"}
            </p>
            {article.glossary && article.glossary.length > 0 && (
              <p className="mt-[10px] text-[12px] leading-[1.4] text-smoke">
                Underlined terms have a plain-language definition - hover or tap to read.
              </p>
            )}
          </header>

          {/* Hero image (optional, openly licensed) */}
          {article.leadImage && (
            <figure className="mx-auto mt-[36px] max-w-[980px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.leadImage.src} alt={article.leadImage.alt} loading="lazy" className="w-full rounded-[6px] border border-clay bg-stone object-cover" />
              {(article.leadImage.caption || article.leadImage.credit) && (
                <figcaption className="mt-[10px] text-[13px] leading-[1.5] text-smoke">
                  {article.leadImage.caption}
                  {article.leadImage.caption && article.leadImage.credit ? "  " : ""}
                  {article.leadImage.credit && <span className="text-smoke">{article.leadImage.credit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {/* Quick version */}
          {article.takeaways && article.takeaways.length > 0 && (
            <Reveal className="mx-auto mt-[36px] max-w-[760px] rounded-[10px] border border-clay bg-stone p-[20px] md:p-[24px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">The quick version</p>
              <ul className="mt-[12px] flex flex-col gap-[10px]">
                {article.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-[12px] text-[15px] leading-[1.5] text-ink md:text-[16px]">
                    <span className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full" style={{ background: "#ff2d92" }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Lead visual */}
          {lead && (
            <Reveal className="mx-auto mt-[40px] max-w-[880px]">
              <ArticleChartView chart={lead} />
            </Reveal>
          )}

          {/* Body */}
          <div className="mx-auto max-w-[760px]">
            {article.sections.map((s, i) => (
              <Reveal as="section" key={i} className="mt-[40px] md:mt-[52px]">
                <h2 className="text-[22px] font-medium leading-[1.2] tracking-[-0.4px] text-ink md:text-[27px]">{s.heading}</h2>
                <div className="mt-[14px]">
                  {s.blocks.map((b, j) => (
                    <Block key={j} article={article} block={b} linked={linked} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          {/* Methodology + limitations */}
          {(article.methodology?.length > 0 || article.limitations?.length > 0) && (
            <div className="mx-auto mt-[52px] max-w-[760px] rounded-[10px] border border-clay bg-white p-[24px] md:p-[32px]">
              {article.methodology?.length > 0 && (
                <>
                  <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">How we did this</p>
                  <ul className="mt-[12px] flex flex-col gap-[8px]">
                    {article.methodology.map((m, i) => (
                      <li key={i} className="text-[14px] leading-[1.55] text-ink">{m}</li>
                    ))}
                  </ul>
                </>
              )}
              {article.limitations?.length > 0 && (
                <>
                  <p className="mt-[22px] font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">What this cannot establish</p>
                  <ul className="mt-[12px] flex flex-col gap-[8px]">
                    {article.limitations.map((m, i) => (
                      <li key={i} className="text-[14px] leading-[1.55] text-smoke">{m}</li>
                    ))}
                  </ul>
                </>
              )}
              {article.honesty?.length > 0 && (
                <p className="mt-[22px] border-t border-clay pt-[16px] text-[13px] leading-[1.5] text-smoke">
                  {article.honesty.join("  ")}
                </p>
              )}
            </div>
          )}

          {/* Sources */}
          {article.sources?.length > 0 && (
            <div className="mx-auto mt-[36px] max-w-[760px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">Sources</p>
              <ol className="mt-[14px] flex flex-col gap-[10px]">
                {article.sources.map((src, i) => (
                  <li key={i} className="flex gap-[12px] text-[13px] leading-[1.5]">
                    <span className="font-mono text-smoke">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-ink underline-offset-2 hover:underline">
                        {src.title}
                      </a>
                      {src.publisher && <span className="text-smoke">{`, ${src.publisher}`}</span>}
                      {src.kind && (
                        <span className="ml-[8px] font-mono text-[10px] uppercase tracking-[0.04em] text-smoke">
                          {SOURCE_KIND_LABEL[src.kind] ?? src.kind}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
