#!/usr/bin/env node
// Ingest a field-note package as a DRAFT (hidden until approved).
//   node scripts/note-ingest.mjs <note.json | package-dir>
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const NOTES_DIR = join(process.cwd(), "content", "notes");
const REQUIRED = ["slug", "title", "date", "dek", "question", "sections", "honesty"];

const arg = process.argv[2];
if (!arg) {
  console.error("usage: node scripts/note-ingest.mjs <note.json | package-dir>");
  process.exit(1);
}
let notePath = arg;
if (existsSync(arg) && statSync(arg).isDirectory()) notePath = join(arg, "note.json");
if (!existsSync(notePath)) {
  console.error(`No note.json found: ${notePath}`);
  process.exit(1);
}
const n = JSON.parse(readFileSync(notePath, "utf8"));

const errs = [];
const warns = [];
for (const f of REQUIRED) {
  if (n[f] === undefined || n[f] === "" || (Array.isArray(n[f]) && n[f].length === 0)) errs.push(`missing/empty field: ${f}`);
}
if (n.slug && !/^[a-z0-9-]+$/.test(n.slug)) errs.push("slug must be kebab-case (a-z, 0-9, -)");
if (!Array.isArray(n.sections) || !n.sections.every((s) => s && s.heading && s.body)) {
  errs.push("sections must be a non-empty array of { heading, body }");
}
if (n.date && !/^\d{4}-\d{2}-\d{2}$/.test(n.date)) warns.push("date should be ISO (YYYY-MM-DD) so notes sort correctly");

const text = JSON.stringify(n);
if (/\bpublished\b/i.test(text)) warns.push('contains "published" - confirm it is honest');
if (/peer[\s-]?reviewed/i.test(text)) warns.push('mentions "peer reviewed" - confirm it is honest');
if (/[—–−]/.test(text)) warns.push("contains an em/en dash or minus sign - house style uses plain hyphens");
if (Array.isArray(n.honesty) && !n.honesty.some((h) => /\bai\b|ai-assisted|not.*(peer|advice)/i.test(h))) {
  warns.push("honesty should state this is AI-assisted and not investment advice");
}

if (errs.length) {
  console.error("VALIDATION FAILED:\n - " + errs.join("\n - "));
  process.exit(1);
}

mkdirSync(NOTES_DIR, { recursive: true });
const isUpdate = existsSync(join(NOTES_DIR, `${n.slug}.json`));
writeFileSync(join(NOTES_DIR, `${n.slug}.json`), JSON.stringify({ published: false, ...n }, null, 2) + "\n");

console.log(`\n  Ingested ${isUpdate ? "(updated) " : ""}DRAFT field note: ${n.slug}`);
console.log(`  ${n.title}`);
warns.forEach((w) => console.log(`  ! ${w}`));
console.log(`\n  Review:   npm run note:review`);
console.log(`  Publish:  npm run note:publish ${n.slug}\n`);
