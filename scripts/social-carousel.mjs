#!/usr/bin/env node
/**
 * Social carousel generator — a multi-slide post from one article.
 *
 * EVERY slide is image-backed (the lead image plus any extras in
 * public/images/social/<slug>-*.jpg, cycled across slides) with a dark scrim so
 * white text and data stay legible. Cover -> key stats -> bar/comparison charts
 * rebuilt from the article data -> takeaways -> timeline -> CTA. Rendered at 3x
 * for true 4K-class output.
 *
 * Usage:
 *   node scripts/social-carousel.mjs --slug <slug> [--format 4x5|1x1] [--out DIR]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = process.cwd();
const ART = join(ROOT, "content", "articles");
const PUB = join(ROOT, "public");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/cumulant-carousel-tmp";
const MAG = "#ff2d92";
const SCALE = 3; // 3x device pixels -> ~4K-class

const FORMATS = { "4x5": { w: 1080, h: 1350 }, "1x1": { w: 1080, h: 1080 } };

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (s) => String(s ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const clip = (s, n) => { s = String(s ?? ""); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…"; };
// Brut-style: highlight the figures (money, %, counts) in a magenta block.
const hl = (s) => esc(s).replace(
  /(\$\s?\d[\d,.]*|\b\d[\d,.]*\s?%|\b\d[\d,.]*\s?(?:percent|weeks?|months?|days?|years?|barrels?|billion|million|trillion)\b|\b\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\b)/gi,
  '<span class="hl">$1</span>');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };

function mark(color) {
  return `<svg viewBox="0 0 30 24" fill="none"><path d="M2.5 18.6H27.5" stroke="${color}" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/><path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23.4" cy="15" r="2.1" fill="${MAG}"/></svg>`;
}

function gatherImages(a) {
  const imgs = [];
  if (a.leadImage?.src) imgs.push("file://" + join(PUB, a.leadImage.src));
  try {
    const dir = join(ROOT, ".social-assets");
    readdirSync(dir).filter((f) => f.startsWith(a.slug + "-") && /\.(jpg|jpeg|png)$/i.test(f)).sort()
      .forEach((f) => imgs.push("file://" + join(dir, f)));
  } catch { /* none */ }
  return imgs.length ? imgs : [""];
}

// position helper so the same photo doesn't crop identically on each reuse.
const POS = ["center", "center top", "center bottom", "left center", "right center"];

// ---- slide shells -------------------------------------------------------- //

function coverSlide(a, hook, bg) {
  const section = a.primarySection ? cap(a.primarySection) : "";
  const len = hook.length;
  const size = len > 88 ? 74 : len > 56 ? 92 : len > 34 ? 110 : 128;
  return `<div class="slide">
    ${bg ? `<img class="photo" src="${bg}" style="object-position:center">` : ""}
    <div class="scrim cover"></div>
    <div class="cpad">
      ${section ? `<div class="ckick">${esc(section)}</div>` : ""}
      <div class="chead" style="font-size:${size}px">${hl(hook)}</div>
      <div class="cfoot"><div class="brand">${mark("#fff")}<span>Cumulant</span></div><div class="arrow">→</div></div>
    </div></div>`;
}

// A scroll-stopping cover line (curiosity/tension). Falls back to the headline.
function getHook(a) {
  try {
    const prompt = `Write ONE scroll-stopping cover line for a social carousel about this financial news story. `
      + `Do NOT simply reword the headline. Open a curiosity gap or state a provocative "this, but that" contrast that `
      + `makes someone stop scrolling; a short, sharp question is allowed. Under 10 words. Punchy and factual; no hype, `
      + `no clickbait falsehoods, no em dashes, no quotation marks. Lead with or include the single most striking figure `
      + `if it fits.\nHEADLINE: ${a.headline}\nDECK: ${a.deck || ""}\nReturn ONLY the line.`;
    const out = execFileSync(process.env.FCRI_CLAUDE_BIN || "claude", ["-p"], { input: prompt, encoding: "utf8", timeout: 60000 });
    const line = out.split("\n").map((s) => s.trim()).filter(Boolean).pop().replace(/^["'“”]|["'“”]$/g, "").trim();
    if (line && line.length >= 8 && line.length < 130) return line;
  } catch { /* fall back */ }
  return a.headline;
}

function dataSlide(idx, total, source, inner, bg, pos) {
  return `<div class="slide">
    ${bg ? `<img class="photo dim" src="${bg}" style="object-position:${pos}">` : ""}
    <div class="scrim data"></div>
    <div class="hdr"><div class="brand sm">${mark("#fff")}<span>Cumulant Research</span></div><div class="count">${String(idx).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div></div>
    <div class="body">${inner}</div>
    <div class="ftr"><span>${source ? "Source: " + esc(source) : ""}</span><span class="dot"></span></div>
  </div>`;
}

function ctaSlide(a, total, bg) {
  return `<div class="slide">
    ${bg ? `<img class="photo dim2" src="${bg}" style="object-position:center">` : ""}
    <div class="scrim cta"></div>
    <div class="cbody">
      <div class="ctamark">${mark("#fff")}</div>
      <div class="ctakick">The full analysis</div>
      <div class="ctahead">${esc(a.headline)}</div>
      <div class="ctaurl">cumulant.org/articles</div>
      <div class="ctanote">Independent, source-backed analysis. AI-assisted; every figure traces to a cited source.</div>
    </div></div>`;
}

// ---- bodies -------------------------------------------------------------- //

function keynumberBody(c) {
  const d = c.data || {};
  return `<div class="kicker">${esc(c.title)}</div>
    <div class="kn">${esc(d.value ?? "")}</div>
    <div class="knlabel">${esc(d.label ?? c.subtitle ?? "")}</div>`;
}

function barsBody(c) {
  const bars = (c.data?.bars || []).slice(0, 5);
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const rows = bars.map((b) => {
    const pct = Math.max(4, (Math.abs(b.value) / max) * 100);
    const val = typeof b.value === "number" ? (Number.isInteger(b.value) ? b.value : b.value.toFixed(2)) : b.value;
    return `<div class="brow"><div class="blabel">${esc(b.label)}</div>
      <div class="btrack"><div class="bfill" style="width:${pct}%;background:${b.highlight ? MAG : "rgba(255,255,255,.92)"}"></div><span class="bval">${esc(val)}</span></div></div>`;
  }).join("");
  return `<div class="kicker">${esc(c.title)}</div>
    <div class="bars">${rows}</div>
    ${c.units ? `<div class="units">${esc(c.units)}</div>` : ""}`;
}

function statementBody(kicker, text) {
  const len = String(text).length;
  const size = len > 185 ? 44 : len > 135 ? 52 : len > 92 ? 59 : 68;
  return `<div class="stwrap"><div class="stkick">${esc(kicker)}</div><div class="sttext" style="font-size:${size}px">${hl(text)}</div></div>`;
}

function timelineBody(c) {
  const ev = (c.data?.events || []).slice(0, 5);
  const rows = ev.map((e) => `<div class="tev"><div class="tdate">${esc(e.date)}</div><div class="tcol"><div class="ttitle">${esc(e.title)}</div>${e.detail ? `<div class="tdetail">${esc(clip(e.detail, 110))}</div>` : ""}</div></div>`).join("");
  return `<div class="kicker">${esc(c.title)}</div><div class="timeline">${rows}</div>`;
}

// ---- planner ------------------------------------------------------------- //

function plan(a) {
  const charts = a.charts || [];
  const kn = charts.find((c) => c.kind === "keynumber");
  const bars = charts.filter((c) => c.kind === "bar" || c.kind === "comparison");
  const tl = charts.find((c) => c.kind === "timeline");
  const takes = a.takeaways || [];
  const kp = a.keyPoints || [];
  const srcOf = (c) => c.source || (a.sources?.[0]?.publisher ?? "Cumulant analysis");
  const s = [{ cover: true }];
  if (takes[0]) s.push({ statement: ["The story", takes[0]] });
  if (kn) s.push({ body: keynumberBody(kn), src: srcOf(kn) });
  if (takes[1]) s.push({ statement: ["The catch", takes[1]] });
  if (bars[0]) s.push({ body: barsBody(bars[0]), src: srcOf(bars[0]) });
  if (tl) s.push({ body: timelineBody(tl), src: srcOf(tl) });
  if (takes[2] || kp[2]) s.push({ statement: ["The detail", takes[2] || kp[2]] });
  if (bars[1]) s.push({ body: barsBody(bars[1]), src: srcOf(bars[1]) });
  if (a.whyItMatters) s.push({ statement: ["Why it matters", a.whyItMatters] });
  s.push({ cta: true });
  return s;
}

// ---- css ----------------------------------------------------------------- //

function css(F) {
  return `*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:${F.w}px;height:${F.h}px;font-family:"Helvetica Neue",Arial,sans-serif;color:#fff;}
  .slide{position:relative;width:${F.w}px;height:${F.h}px;overflow:hidden;background:#0a0a0c;}
  .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .photo.dim{filter:brightness(.62) saturate(1.05);}
  .photo.dim2{filter:brightness(.4) saturate(1.05);}
  .scrim{position:absolute;inset:0;}
  .scrim.cover{background:linear-gradient(to top,rgba(0,0,0,.94) 0%,rgba(0,0,0,.66) 26%,rgba(0,0,0,.14) 52%,rgba(0,0,0,.06) 74%,rgba(0,0,0,.34) 100%);}
  .scrim.data{background:linear-gradient(180deg,rgba(8,8,13,.55) 0%,rgba(8,8,13,.42) 34%,rgba(8,8,13,.55) 70%,rgba(8,8,13,.72) 100%);}
  .scrim.cta{background:linear-gradient(180deg,rgba(8,8,13,.74) 0%,rgba(8,8,13,.66) 50%,rgba(8,8,13,.8) 100%);}
  /* cover */
  .cpad{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:74px;}
  .ckick{font-size:24px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${MAG};margin-bottom:22px;}
  .chead{line-height:1.16;letter-spacing:-.025em;font-weight:700;color:#fff;max-width:98%;text-wrap:balance;text-shadow:0 2px 30px rgba(0,0,0,.55);}
  .cfoot{display:flex;align-items:center;justify-content:space-between;margin-top:50px;}
  .arrow{font-size:48px;font-weight:400;line-height:1;color:rgba(255,255,255,.9);}
  /* brand */
  .brand{display:flex;align-items:center;gap:13px;}.brand svg{width:34px;height:27px;}.brand span{font-size:30px;font-weight:600;letter-spacing:-.01em;color:#fff;}
  .brand.sm svg{width:27px;height:22px;}.brand.sm span{font-size:20px;}
  /* interior frame */
  .hdr{position:absolute;top:62px;left:74px;right:74px;display:flex;align-items:center;justify-content:space-between;z-index:2;}
  .count{font-family:ui-monospace,monospace;font-size:18px;letter-spacing:.08em;color:rgba(255,255,255,.7);}
  .body{position:absolute;top:150px;left:74px;right:74px;bottom:120px;display:flex;flex-direction:column;justify-content:center;z-index:2;}
  .ftr{position:absolute;bottom:60px;left:74px;right:74px;display:flex;align-items:center;justify-content:space-between;font-family:ui-monospace,monospace;font-size:17px;letter-spacing:.03em;color:rgba(255,255,255,.62);z-index:2;}
  .ftr .dot{width:9px;height:9px;border-radius:50%;background:${MAG};}
  .kicker{font-size:35px;font-weight:700;line-height:1.12;letter-spacing:-.01em;margin-bottom:34px;max-width:94%;text-shadow:0 2px 24px rgba(0,0,0,.45);}
  .csub{font-size:23px;line-height:1.4;color:rgba(255,255,255,.82);margin-top:-18px;margin-bottom:30px;}
  /* keynumber */
  .kn{font-size:178px;font-weight:700;letter-spacing:-.04em;line-height:.95;color:${MAG};text-shadow:0 4px 40px rgba(0,0,0,.4);}
  .knlabel{font-size:31px;font-weight:600;margin-top:20px;}
  .knsub{font-size:23px;line-height:1.45;color:rgba(255,255,255,.82);margin-top:16px;max-width:92%;}
  /* bars */
  .bars{display:flex;flex-direction:column;gap:30px;margin-top:8px;}
  .brow{display:flex;flex-direction:column;gap:11px;}
  .blabel{font-size:26px;font-weight:600;}
  .btrack{position:relative;height:52px;background:rgba(255,255,255,.16);border-radius:8px;overflow:hidden;display:flex;align-items:center;}
  .bfill{height:100%;border-radius:8px;}
  .bval{position:absolute;right:18px;font-size:24px;font-weight:700;font-family:ui-monospace,monospace;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6);}
  .units{margin-top:30px;font-size:20px;font-style:italic;color:rgba(255,255,255,.7);}
  .note{margin-top:12px;font-size:21px;line-height:1.42;color:rgba(255,255,255,.84);}
  /* statement (Brut-style big bold text) */
  .stkick{display:inline-block;font-family:ui-monospace,monospace;font-size:22px;text-transform:uppercase;letter-spacing:.14em;color:#fff;background:${MAG};padding:7px 14px;border-radius:5px;margin-bottom:30px;}
  .sttext{line-height:1.34;font-weight:700;letter-spacing:-.02em;text-shadow:0 2px 26px rgba(0,0,0,.6);}
  .hl{background:${MAG};color:#fff;padding:.05em .18em;border-radius:7px;white-space:nowrap;box-decoration-break:clone;-webkit-box-decoration-break:clone;}
  /* timeline */
  .timeline{display:flex;flex-direction:column;gap:27px;}
  .tev{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:start;}
  .tdate{font-family:ui-monospace,monospace;font-size:20px;font-weight:600;color:${MAG};padding-top:4px;}
  .ttitle{font-size:28px;font-weight:700;line-height:1.15;}
  .tdetail{font-size:21px;line-height:1.4;color:rgba(255,255,255,.78);margin-top:6px;}
  /* cta */
  .cbody{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:80px;z-index:2;}
  .ctamark{margin-bottom:40px;}.ctamark svg{width:66px;height:54px;}
  .ctakick{font-family:ui-monospace,monospace;font-size:24px;text-transform:uppercase;letter-spacing:.12em;color:${MAG};margin-bottom:26px;}
  .ctahead{font-size:56px;line-height:1.1;font-weight:700;letter-spacing:-.02em;margin-bottom:40px;text-shadow:0 2px 24px rgba(0,0,0,.5);}
  .ctaurl{font-size:35px;font-weight:600;}
  .ctanote{font-size:21px;line-height:1.5;color:rgba(255,255,255,.66);margin-top:24px;max-width:88%;}`;
}

const page = (body, F) => `<!doctype html><html><head><meta charset="utf-8"><style>${css(F)}</style></head><body>${body}</body></html>`;

function render(html, F, outPath) {
  mkdirSync(TMP, { recursive: true });
  const tmp = join(TMP, "slide.html");
  writeFileSync(tmp, html);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${SCALE}`,
    `--screenshot=${outPath}`, `--window-size=${F.w},${F.h}`, `file://${tmp}`,
  ], { stdio: "ignore" });
}

// ---- main ---------------------------------------------------------------- //

const F = FORMATS[arg("format", "4x5")] || FORMATS["4x5"];
let a;
const slug = arg("slug", null);
if (slug) a = JSON.parse(readFileSync(join(ART, `${slug}.json`), "utf8"));
else {
  const all = readdirSync(ART).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(ART, f), "utf8")))
    .filter((x) => x.published !== false).sort((x, y) => new Date(y.publishedAt ?? y.date) - new Date(x.publishedAt ?? x.date));
  a = all[0];
}

const images = gatherImages(a);
const out = join(arg("out", join(homedir(), "Downloads", "cumulant-social")), `carousel-${a.slug}`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const slides = plan(a);
const total = slides.length;
const hook = getHook(a);
console.log(`  hook: ${hook}`);
slides.forEach((s, i) => {
  const idx = i + 1;
  const bg = images[i % images.length];
  const pos = POS[i % POS.length];
  let body;
  if (s.cover) body = coverSlide(a, hook, bg);
  else if (s.cta) body = ctaSlide(a, total, bg);
  else if (s.statement) body = dataSlide(idx, total, null, statementBody(s.statement[0], s.statement[1]), bg, pos);
  else body = dataSlide(idx, total, s.src, s.body, bg, pos);
  render(page(body, F), F, join(out, `slide-${String(idx).padStart(2, "0")}.png`));
  console.log(`  slide ${idx}/${total}`);
});
console.log(`\nCarousel (${total} slides, ${images.length} image(s), 4K) -> ${out}`);
