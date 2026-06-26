#!/usr/bin/env node
// List the field-note store: which are live, which are drafts awaiting approval.
//   node scripts/note-review.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content", "notes");
let files = [];
try {
  files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
} catch {
  console.log("No field-note store yet (content/notes/).");
  process.exit(0);
}
const notes = files
  .map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")))
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
const drafts = notes.filter((n) => n.published === false);

console.log(`\n  ${notes.length} field notes  (${drafts.length} draft${drafts.length === 1 ? "" : "s"} awaiting approval)\n`);
for (const n of notes) {
  const tag = n.published === false ? "DRAFT" : "live ";
  console.log(`  [${tag}]  ${n.slug}  (${n.date})`);
  console.log(`           ${n.title}`);
}
if (drafts.length) {
  console.log(`\n  Approve:  npm run note:publish ${drafts[0].slug}`);
}
console.log("");
