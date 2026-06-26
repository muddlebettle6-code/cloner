#!/usr/bin/env node
// Ingest a finished paper "package" from the FCRI pipeline into the site's
// content store as a DRAFT (excluded from the public build until approved).
//
//   node scripts/paper-ingest.mjs <package-dir>
//
// A package is a directory:
//   <dir>/paper.json     the paper fields (see docs/PUBLISHING.md)
//   <dir>/figures/*.png  figures referenced by figures[].file (basename)
//   <dir>/paper.pdf      optional full-paper PDF
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const PAPERS_DIR = join(ROOT, "content", "papers");
const FIG_DIR = join(ROOT, "public", "papers", "figures");
const PDF_DIR = join(ROOT, "public", "papers", "pdfs");

const ALLOWED_KIND = ["paper", "note"];
const ALLOWED_STATUSKIND = ["submitted", "working-paper", "research-note", "in-progress", "experimental"];
const REQUIRED = ["slug", "title", "authors", "status", "statusKind", "date", "kind", "oneLine", "abstract"];

const pkg = process.argv[2];
if (!pkg) {
  console.error("usage: node scripts/paper-ingest.mjs <package-dir>");
  process.exit(1);
}
const paperPath = join(pkg, "paper.json");
if (!existsSync(paperPath)) {
  console.error(`No paper.json found in ${pkg}`);
  process.exit(1);
}
const p = JSON.parse(readFileSync(paperPath, "utf8"));

// ---- validate ----
const errs = [];
const warns = [];
for (const f of REQUIRED) if (p[f] === undefined || p[f] === "") errs.push(`missing field: ${f}`);
if (p.kind && !ALLOWED_KIND.includes(p.kind)) errs.push(`kind must be one of ${ALLOWED_KIND.join(", ")}`);
if (p.statusKind && !ALLOWED_STATUSKIND.includes(p.statusKind))
  errs.push(`statusKind must be one of ${ALLOWED_STATUSKIND.join(", ")}`);
if (p.slug && !/^[a-z0-9-]+$/.test(p.slug)) errs.push("slug must be kebab-case (a-z, 0-9, -)");

// honesty guards (from CONTENT_TRUTH_AUDIT)
const text = JSON.stringify(p);
if (/\bpublished\b/i.test(text)) warns.push('contains "published" — never claim unpublished work is published');
if (/peer[\s-]?reviewed/i.test(text)) warns.push("mentions peer review — confirm it is honest");
if (/[—–−]/.test(text)) warns.push("contains an em/en dash or minus sign — house style uses plain hyphens");

if (errs.length) {
  console.error("VALIDATION FAILED:\n - " + errs.join("\n - "));
  process.exit(1);
}

// ---- copy assets ----
mkdirSync(FIG_DIR, { recursive: true });
mkdirSync(PDF_DIR, { recursive: true });
mkdirSync(PAPERS_DIR, { recursive: true });

if (Array.isArray(p.figures)) {
  for (const fig of p.figures) {
    const fname = basename(fig.file || (fig.src ? fig.src : ""));
    if (!fname) errs.push("a figure is missing its file");
    const srcFile = join(pkg, "figures", fname);
    if (!existsSync(srcFile)) {
      console.error(`Figure not found: figures/${fname}`);
      process.exit(1);
    }
    copyFileSync(srcFile, join(FIG_DIR, fname));
    fig.src = `/papers/figures/${fname}`;
    delete fig.file;
  }
}

const pdfSrc = join(pkg, "paper.pdf");
if (existsSync(pdfSrc)) {
  const head = readFileSync(pdfSrc).subarray(0, 5).toString("latin1");
  if (head !== "%PDF-") {
    console.error("paper.pdf is not a valid PDF (does not start with %PDF-). Skipping or fix the source.");
    process.exit(1);
  }
  copyFileSync(pdfSrc, join(PDF_DIR, `${p.slug}.pdf`));
  p.pdf = `/papers/pdfs/${p.slug}.pdf`;
}

// ---- write draft to the store ----
const existing = readdirSync(PAPERS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(PAPERS_DIR, f), "utf8")));
const maxOrder = existing.reduce((m, x) => Math.max(m, x.order ?? 0), 0);
const isUpdate = existing.some((x) => x.slug === p.slug);

const stored = { published: false, order: maxOrder + 1, ...p };
writeFileSync(join(PAPERS_DIR, `${p.slug}.json`), JSON.stringify(stored, null, 2) + "\n");

console.log(`\n  Ingested ${isUpdate ? "(updated) " : ""}DRAFT: ${p.slug}`);
console.log(`  ${p.title}`);
warns.forEach((w) => console.log(`  ! ${w}`));
console.log(`\n  Review drafts:  npm run paper:review`);
console.log(`  Publish it:     npm run paper:publish ${p.slug}\n`);
