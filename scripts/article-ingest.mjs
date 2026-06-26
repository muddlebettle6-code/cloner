#!/usr/bin/env node
// Ingest a research article into the site's content store.
//   node scripts/article-ingest.mjs <article.json> [--publish]
//
// Enforces the quality gate before a publish: the piece must be specific,
// sourced, visual, and honest. A draft (no --publish) skips the hard gate.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content", "articles");
const REQUIRED = ["slug", "headline", "deck", "date", "event", "question", "sections", "charts", "sources", "methodology", "limitations", "honesty"];

const publish = process.argv.includes("--publish");
const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!arg) {
  console.error("usage: node scripts/article-ingest.mjs <article.json> [--publish]");
  process.exit(1);
}
let path = arg;
if (existsSync(arg) && statSync(arg).isDirectory()) path = join(arg, "article.json");
if (!existsSync(path)) {
  console.error(`No article.json at: ${path}`);
  process.exit(1);
}
const a = JSON.parse(readFileSync(path, "utf8"));
if (!a.date) a.date = new Date().toISOString().slice(0, 10);
if (!a.byline) a.byline = "Cumulant Research";

const errs = [];
const gate = []; // quality-gate failures (block a publish)
for (const f of REQUIRED) {
  const v = a[f];
  if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) errs.push(`missing/empty: ${f}`);
}
if (a.slug && !/^[a-z0-9-]+$/.test(a.slug)) errs.push("slug must be kebab-case");
if (!Array.isArray(a.sections) || !a.sections.every((s) => s && s.heading && Array.isArray(s.blocks))) {
  errs.push("sections must be [{ heading, blocks[] }]");
}
if (errs.length) {
  console.error("INVALID:\n - " + errs.join("\n - "));
  process.exit(1);
}

// quality gate (only enforced on publish)
if ((a.charts?.length ?? 0) < 2) gate.push("fewer than 2 charts (visuals must add analytical value)");
if ((a.sources?.length ?? 0) < 3) gate.push("fewer than 3 sources");
if (!a.sources?.every((s) => /^https?:\/\//.test(s.url || ""))) gate.push("a source is missing a real URL");
if ((a.sections?.length ?? 0) < 6) gate.push("fewer than 6 sections (the full arc is required)");
const text = JSON.stringify(a);
if (/[—–]/.test(text)) gate.push("contains an em/en dash (house style uses plain hyphens)");
const blob = text.toLowerCase();
if (/\bpeer[\s-]?reviewed\b/.test(blob)) gate.push('claims "peer reviewed"');
if (!a.honesty?.length) gate.push("no honesty caveats");

if (publish && gate.length) {
  console.error("QUALITY GATE FAILED (not publishing):\n - " + gate.join("\n - "));
  console.error("\nIngest as a draft instead (drop --publish) or fix the article.");
  process.exit(2);
}

mkdirSync(DIR, { recursive: true });
const isUpdate = existsSync(join(DIR, `${a.slug}.json`));
writeFileSync(join(DIR, `${a.slug}.json`), JSON.stringify({ published: publish, ...a }, null, 2) + "\n");

console.log(`\n  Ingested ${isUpdate ? "(updated) " : ""}${publish ? "PUBLISHED" : "DRAFT"} article: ${a.slug}`);
console.log(`  ${a.headline}`);
if (!publish && gate.length) gate.forEach((g) => console.log(`  ! gate: ${g}`));
console.log(`  charts: ${a.charts?.length ?? 0}  sources: ${a.sources?.length ?? 0}  sections: ${a.sections?.length ?? 0}\n`);
