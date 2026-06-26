import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleChartView } from "@/components/article-chart";
import { ArrowIcon } from "@/components/icons";
import { ARTICLES, getArticle } from "@/content/articles";
import type { Article, ArticleBlock } from "@/content/types";

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

function Block({ article, block }: { article: Article; block: ArticleBlock }) {
  switch (block.type) {
    case "p":
      return <p className="my-[18px] text-[17px] leading-[1.65] text-ink md:text-[18px]">{block.text}</p>;
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
          <p className="mt-[6px] text-[16px] leading-[1.5] text-ink md:text-[17px]">{block.text}</p>
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
              {fmtDate(article.date)}{meta ? `  ·  ${meta}` : ""}
            </p>
            <h1 className="mt-[14px] text-[33px] font-medium leading-[1.06] tracking-[-1px] text-ink md:text-[52px]">
              {article.headline}
            </h1>
            <p className="mt-[20px] text-[19px] leading-[1.45] text-smoke md:text-[22px]">{article.deck}</p>
            <p className="mt-[22px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
              By {article.byline ?? "Cumulant Research"}
            </p>
          </header>

          {/* Lead visual */}
          {lead && (
            <div className="mx-auto mt-[40px] max-w-[880px]">
              <ArticleChartView chart={lead} />
            </div>
          )}

          {/* Body */}
          <div className="mx-auto max-w-[760px]">
            {article.sections.map((s, i) => (
              <section key={i} className="mt-[40px] md:mt-[52px]">
                <h2 className="text-[22px] font-medium leading-[1.2] tracking-[-0.4px] text-ink md:text-[27px]">{s.heading}</h2>
                <div className="mt-[14px]">
                  {s.blocks.map((b, j) => (
                    <Block key={j} article={article} block={b} />
                  ))}
                </div>
              </section>
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
