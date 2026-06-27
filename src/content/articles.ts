import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Article } from "./types";

// Articles live in a JSON content store (content/articles/*.json). Import this
// DIRECTLY from server components only (it reads the filesystem at build time).
export interface StoredArticle extends Article {
  published?: boolean;
}

export const ARTICLES_INTRO = {
  label: "Articles",
  heading: "Articles.",
  body: "Deeply reported pieces that take one current event and answer a single, consequential question with original analysis, sources, and honest visuals. AI-assisted and not peer reviewed; every figure traces to a cited source.",
};

const DIR = join(process.cwd(), "content", "articles");

function loadStored(): StoredArticle[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const items = files.map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")) as StoredArticle);
  items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.slug.localeCompare(b.slug));
  return items;
}

export const ALL_ARTICLES: StoredArticle[] = loadStored();
export const ARTICLES: Article[] = ALL_ARTICLES.filter((a) => a.published !== false);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

// --------------------------------------------------------------------------- //
// Newsroom helpers — section/type/tag views, the lead story, and related logic.

function ts(a: Article): number {
  return new Date(a.publishedAt ?? `${a.date}T00:00:00`).getTime() || 0;
}

/** Most-recent first, by publish time (finer than the date-only default). */
export const ARTICLES_BY_RECENCY: Article[] = [...ARTICLES].sort((a, b) => ts(b) - ts(a) || a.slug.localeCompare(b.slug));

export function sectionOf(a: Article): string {
  return a.primarySection ?? "markets";
}

export function bySection(slug: string): Article[] {
  return ARTICLES_BY_RECENCY.filter((a) => sectionOf(a) === slug);
}

export function byType(slug: string): Article[] {
  return ARTICLES_BY_RECENCY.filter((a) => a.articleType === slug);
}

export function byTag(tag: string): Article[] {
  const t = tag.toLowerCase();
  return ARTICLES_BY_RECENCY.filter((a) => (a.tags ?? []).some((x) => x.toLowerCase() === t));
}

/** How many published articles each section currently holds. */
export function sectionCounts(): Record<string, number> {
  const c: Record<string, number> = {};
  for (const a of ARTICLES) {
    const s = sectionOf(a);
    c[s] = (c[s] ?? 0) + 1;
  }
  return c;
}

/** The single most prominent story: featuredPriority, then score, then recency. */
export function leadStory(): Article | undefined {
  return [...ARTICLES_BY_RECENCY].sort(
    (a, b) =>
      (b.featuredPriority ?? 0) - (a.featuredPriority ?? 0) ||
      (b.newsScore ?? 0) - (a.newsScore ?? 0) ||
      ts(b) - ts(a)
  )[0];
}

/** Related stories by shared section and tag overlap. */
export function relatedArticles(a: Article, n = 4): Article[] {
  const explicit = (a.relatedArticles ?? [])
    .map((slug) => ARTICLES.find((x) => x.slug === slug))
    .filter((x): x is Article => Boolean(x));
  const tags = new Set((a.tags ?? []).map((t) => t.toLowerCase()));
  const scored = ARTICLES_BY_RECENCY.filter((x) => x.slug !== a.slug && !explicit.includes(x))
    .map((x) => {
      let score = x.primarySection && x.primarySection === a.primarySection ? 2 : 0;
      score += (x.tags ?? []).filter((t) => tags.has(t.toLowerCase())).length;
      return { x, score };
    })
    .sort((p, q) => q.score - p.score || ts(q.x) - ts(p.x))
    .map((r) => r.x);
  return [...explicit, ...scored].slice(0, n);
}
