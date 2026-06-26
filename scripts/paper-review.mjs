#!/usr/bin/env node
// List the paper store: which are live, which are drafts awaiting approval.
//   node scripts/paper-review.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content", "papers");
let files = [];
try {
  files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
} catch {
  console.log("No paper store yet (content/papers/).");
  process.exit(0);
}
const papers = files
  .map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
const drafts = papers.filter((p) => p.published === false);

console.log(`\n  ${papers.length} papers in the store  (${drafts.length} draft${drafts.length === 1 ? "" : "s"} awaiting approval)\n`);
for (const p of papers) {
  const tag = p.published === false ? "DRAFT" : "live ";
  console.log(`  [${tag}]  ${p.slug}`);
  console.log(`           ${p.title}`);
  console.log(`           ${p.status}${p.pdf ? "  (PDF)" : ""}`);
}
if (drafts.length) {
  console.log(`\n  Approve:  npm run paper:publish ${drafts[0].slug}`);
}
console.log("");
