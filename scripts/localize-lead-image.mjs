// Self-host an article's lead image: if leadImage.src is an external URL,
// download it into public/images/articles/<slug>.jpg and rewrite the path. If
// the download fails, drop leadImage so the article never ships a broken image.
//
//   node scripts/localize-lead-image.mjs <article.json>
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [, , path] = process.argv;
if (!path) {
  console.error("usage: node scripts/localize-lead-image.mjs <article.json>");
  process.exit(1);
}
const ROOT = join(import.meta.dirname, "..");
const a = JSON.parse(readFileSync(path, "utf8"));

if (!a.leadImage || !/^https?:\/\//.test(a.leadImage.src || "")) {
  console.log("no external lead image - nothing to do");
  process.exit(0);
}

const out = join(ROOT, "public", "images", "articles", `${a.slug}.jpg`);
try {
  execFileSync("node", [join(ROOT, "scripts", "fetch-image.mjs"), a.leadImage.src, out], { stdio: "inherit" });
  a.leadImage.src = `/images/articles/${a.slug}.jpg`;
  writeFileSync(path, JSON.stringify(a, null, 2) + "\n");
  console.log(`localized -> ${a.leadImage.src}`);
} catch {
  console.error("download failed; dropping leadImage to avoid a broken image");
  delete a.leadImage;
  writeFileSync(path, JSON.stringify(a, null, 2) + "\n");
}
