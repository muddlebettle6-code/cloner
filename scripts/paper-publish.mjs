#!/usr/bin/env node
// Approve a draft (make it live), or send a live paper back to draft.
//   node scripts/paper-publish.mjs <slug>              -> publish
//   node scripts/paper-publish.mjs <slug> --unpublish  -> back to draft
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2];
const unpublish = process.argv.includes("--unpublish") || process.argv.includes("--draft");
if (!slug) {
  console.error("usage: node scripts/paper-publish.mjs <slug> [--unpublish]");
  process.exit(1);
}
const fp = join(process.cwd(), "content", "papers", `${slug}.json`);
if (!existsSync(fp)) {
  console.error(`No such paper in the store: ${slug}`);
  process.exit(1);
}
const p = JSON.parse(readFileSync(fp, "utf8"));
p.published = !unpublish;
writeFileSync(fp, JSON.stringify(p, null, 2) + "\n");

console.log(`\n  ${slug} is now ${p.published ? "PUBLISHED (live on next deploy)" : "a DRAFT (hidden)"}.`);
console.log(`  Rebuild + deploy:  npm run build   then push the cumulant repo\n`);
