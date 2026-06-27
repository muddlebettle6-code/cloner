#!/usr/bin/env node
/**
 * Social card generator — Bloomberg-style branded graphics from our articles.
 *
 * Full-bleed lead image + dark scrim + bold headline + section kicker + the
 * Cumulant mark, rendered to PNG via headless Chrome in every social aspect
 * ratio. Photo credit is kept on the card for licensing compliance.
 *
 * Usage:
 *   node scripts/social-card.mjs --latest 3
 *   node scripts/social-card.mjs --slug <slug> --formats 4x5,1x1,1.91x1
 *   node scripts/social-card.mjs --slug <slug> --quote   # pull-quote style
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = process.cwd();
const ART = join(ROOT, "content", "articles");
const PUB = join(ROOT, "public");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = process.env.SOCIAL_TMP || "/tmp/cumulant-social-tmp";
const MAG = "#ff2d92";

const FORMATS = {
  "4x5": { w: 1080, h: 1350 },   // Instagram portrait (best feed engagement)
  "1x1": { w: 1080, h: 1080 },   // Instagram square
  "1.91x1": { w: 1200, h: 628 }, // LinkedIn / Facebook / X link card
  "9x16": { w: 1080, h: 1920 },  // Stories / Reels
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (s) => String(s ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(`--${name}`);

function loadArticles() {
  return readdirSync(ART)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(ART, f), "utf8")))
    .filter((a) => a.published !== false)
    .sort((a, b) => new Date(b.publishedAt ?? b.date) - new Date(a.publishedAt ?? a.date));
}

function cardHTML(a, fmt, quote) {
  const { w, h } = FORMATS[fmt];
  const img = a.leadImage?.src ? "file://" + join(PUB, a.leadImage.src) : "";
  const wide = fmt === "1.91x1";
  const tall = fmt === "9x16";

  // Headline, or a punchy pull-quote drawn from a takeaway.
  let text = a.headline;
  let attribution = "";
  if (quote && (a.takeaways?.length || a.deck)) {
    text = `“${(a.takeaways?.[0] ?? a.deck).replace(/\s+/g, " ").trim()}”`;
    attribution = a.byrole ?? "Cumulant Research";
  }

  const pad = Math.round(w * 0.064);
  const base = tall ? 96 : wide ? 60 : 86;
  const len = text.length;
  const size = Math.round(len > 150 ? base * 0.5 : len > 100 ? base * 0.62 : len > 64 ? base * 0.78 : base);
  const credit = a.leadImage?.credit ?? "";
  const section = a.primarySection ? cap(a.primarySection) : "";

  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
html,body{width:${w}px;height:${h}px;overflow:hidden;}
.card{position:relative;width:${w}px;height:${h}px;background:#0a0a0a;overflow:hidden;font-family:"Helvetica Neue",Arial,sans-serif;}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.94) 0%,rgba(0,0,0,.74) 26%,rgba(0,0,0,.28) 52%,rgba(0,0,0,.10) 74%,rgba(0,0,0,.34) 100%);}
.pad{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:${pad}px;}
.kicker{font-size:${Math.round(base * 0.27)}px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${MAG};margin-bottom:${Math.round(base * 0.3)}px;}
.headline{font-size:${size}px;line-height:1.05;letter-spacing:-.018em;font-weight:700;color:#fff;max-width:${wide ? "76%" : "96%"};text-wrap:balance;}
.attr{font-size:${Math.round(base * 0.3)}px;font-weight:500;color:rgba(255,255,255,.78);margin-top:${Math.round(base * 0.34)}px;}
.footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:${Math.round(base * 0.62)}px;}
.brand{display:flex;align-items:center;gap:${Math.round(base * 0.18)}px;}
.brand svg{width:${Math.round(base * 0.74)}px;height:${Math.round(base * 0.6)}px;}
.wm{font-size:${Math.round(base * 0.36)}px;font-weight:600;letter-spacing:-.01em;color:#fff;}
.credit{font-size:${Math.round(base * 0.18)}px;line-height:1.3;color:rgba(255,255,255,.5);text-align:right;max-width:42%;}
</style></head><body>
<div class="card">
  ${img ? `<img class="photo" src="${img}">` : ""}
  <div class="scrim"></div>
  <div class="pad">
    ${section ? `<div class="kicker">${esc(section)}</div>` : ""}
    <div class="headline">${esc(text)}</div>
    ${attribution ? `<div class="attr">${esc(attribution)}</div>` : ""}
    <div class="footer">
      <div class="brand">
        <svg viewBox="0 0 30 24" fill="none"><path d="M2.5 18.6H27.5" stroke="#fff" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/><path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23.4" cy="15" r="2" fill="${MAG}"/></svg>
        <span class="wm">Cumulant</span>
      </div>
      ${credit ? `<div class="credit">${esc(credit)}</div>` : ""}
    </div>
  </div>
</div>
</body></html>`;
}

function render(html, w, h, outPath) {
  mkdirSync(TMP, { recursive: true });
  const tmp = join(TMP, "card.html");
  writeFileSync(tmp, html);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--screenshot=${outPath}`, `--window-size=${w},${h}`, `file://${tmp}`,
  ], { stdio: "ignore" });
}

const out = arg("out", join(homedir(), "Downloads", "cumulant-social"));
const formats = arg("formats", "4x5,1x1,1.91x1").split(",").map((s) => s.trim()).filter((f) => FORMATS[f]);
const quote = has("quote");

let targets = [];
const slug = arg("slug", null);
if (slug) {
  targets = [JSON.parse(readFileSync(join(ART, `${slug}.json`), "utf8"))];
} else {
  targets = loadArticles().slice(0, parseInt(arg("latest", "3"), 10));
}

mkdirSync(out, { recursive: true });
let n = 0;
for (const a of targets) {
  for (const fmt of formats) {
    const { w, h } = FORMATS[fmt];
    const file = join(out, `${a.slug}${quote ? "-quote" : ""}-${fmt}.png`);
    render(cardHTML(a, fmt, quote), w, h, file);
    console.log(`  ${fmt.padEnd(7)} ${a.slug}`);
    n++;
  }
}
console.log(`\nGenerated ${n} card(s) -> ${out}`);
