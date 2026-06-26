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
