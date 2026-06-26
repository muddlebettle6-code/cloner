#!/usr/bin/env node
// Approve a field-note draft (make it live), or send a live note back to draft.
//   node scripts/note-publish.mjs <slug>              -> publish
//   node scripts/note-publish.mjs <slug> --unpublish  -> back to draft
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2];
const unpublish = process.argv.includes("--unpublish") || process.argv.includes("--draft");
if (!slug) {
  console.error("usage: node scripts/note-publish.mjs <slug> [--unpublish]");
  process.exit(1);
}
const fp = join(process.cwd(), "content", "notes", `${slug}.json`);
if (!existsSync(fp)) {
  console.error(`No such field note in the store: ${slug}`);
  process.exit(1);
}
const n = JSON.parse(readFileSync(fp, "utf8"));
n.published = !unpublish;
writeFileSync(fp, JSON.stringify(n, null, 2) + "\n");

console.log(`\n  ${slug} is now ${n.published ? "PUBLISHED (live on next deploy)" : "a DRAFT (hidden)"}.`);
console.log(`  Rebuild + deploy:  npm run build   then push the cumulant repo\n`);
