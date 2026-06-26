import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Paper } from "./types";

// Papers live in a JSON content store (content/papers/*.json) so the FCRI
// publish pipeline can write them. Each stored paper carries a `published` flag
// (drafts are excluded from the public site) and an `order` for sequencing.
export interface StoredPaper extends Paper {
  published?: boolean;
  order?: number;
}

export const PAPERS_INTRO = {
  label: "Papers",
  heading: "Working papers & reports.",
  body: "Drafts are released openly so the methods can be inspected before conclusions are drawn. None are peer reviewed; journal status is stated plainly, and results are shown with their caveats.",
};

const PAPERS_DIR = join(process.cwd(), "content", "papers");

function loadStoredPapers(): StoredPaper[] {
  let files: string[] = [];
  try {
    files = readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const papers = files.map((f) => JSON.parse(readFileSync(join(PAPERS_DIR, f), "utf8")) as StoredPaper);
  papers.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (b.date ?? "").localeCompare(a.date ?? ""));
  return papers;
}

/** Every paper in the store, including unpublished drafts (used by tooling). */
export const ALL_PAPERS: StoredPaper[] = loadStoredPapers();

/** Public papers (published only) — what the site renders. */
export const PAPERS: Paper[] = ALL_PAPERS.filter((p) => p.published !== false);

export function getPaper(slug: string): Paper | undefined {
  return PAPERS.find((p) => p.slug === slug);
}
