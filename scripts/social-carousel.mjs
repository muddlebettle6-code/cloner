#!/usr/bin/env node
/**
 * Social carousel generator — a multi-slide post from one article.
 *
 * Cover (photo + headline) -> key stats -> bar/comparison charts rebuilt from
 * the article's data -> takeaway statements -> timeline -> CTA. Editorial cream
 * interior slides with the Cumulant identity; rendered at 2x for 4K-crisp output.
 *
 * Usage:
 *   node scripts/social-carousel.mjs --slug <slug> [--format 4x5|1x1] [--out DIR]
 *   node scripts/social-carousel.mjs --latest 1
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = process.cwd();
const ART = join(ROOT, "content", "articles");
const PUB = join(ROOT, "public");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/cumulant-carousel-tmp";
const MAG = "#ff2d92";
const CREAM = "#f4f1ea";
const INK = "#17140f";
const SCALE = 2; // 2x device pixels -> 4K-crisp

const FORMATS = { "4x5": { w: 1080, h: 1350 }, "1x1": { w: 1080, h: 1080 } };

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (s) => String(s ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const clip = (s, n) => { s = String(s ?? ""); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…"; };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };

function mark(color) {
  return `<svg viewBox="0 0 30 24" fill="none"><path d="M2.5 18.6H27.5" stroke="${color}" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/><path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23.4" cy="15" r="2.1" fill="${MAG}"/></svg>`;
}

// ---- slide bodies -------------------------------------------------------- //

function coverSlide(a, F) {
  const img = a.leadImage?.src ? "file://" + join(PUB, a.leadImage.src) : "";
  const section = a.primarySection ? cap(a.primarySection) : "";
  const len = a.headline.length;
  const size = len > 64 ? 70 : 86;
  return `<div class="slide cover">
    ${img ? `<img class="photo" src="${img}">` : ""}
    <div class="cscrim"></div>
    <div class="cpad">
      ${section ? `<div class="ckick">${esc(section)}</div>` : ""}
      <div class="chead" style="font-size:${size}px">${esc(a.headline)}</div>
      <div class="cfoot"><div class="cbrand">${mark("#fff")}<span>Cumulant</span></div><div class="cswipe">Swipe →</div></div>
    </div></div>`;
}

function frame(idx, total, source, inner, dark = false) {
  const bg = dark ? INK : CREAM, fg = dark ? "#fff" : INK, mc = dark ? "#fff" : INK;
  return `<div class="slide" style="background:${bg};color:${fg}">
    <div class="hdr"><div class="hbrand">${mark(mc)}<span>Cumulant Research</span></div><div class="count">${String(idx).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div></div>
    <div class="body">${inner}</div>
    <div class="ftr">${source ? `<span>Source: ${esc(source)}</span>` : "<span></span>"}<span class="dot"></span></div>
  </div>`;
}

function keynumberBody(c) {
  const d = c.data || {};
  return `<div class="kicker">${esc(c.title)}</div>
    <div class="kn">${esc(d.value ?? "")}</div>
    <div class="knlabel">${esc(d.label ?? c.subtitle ?? "")}</div>
    ${d.sub ? `<div class="knsub">${esc(d.sub)}</div>` : ""}`;
}

function barsBody(c) {
  const bars = (c.data?.bars || []).slice(0, 5);
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const rows = bars.map((b) => {
    const pct = Math.max(3, (Math.abs(b.value) / max) * 100);
    const val = typeof b.value === "number" ? (Number.isInteger(b.value) ? b.value : b.value.toFixed(2)) : b.value;
    return `<div class="brow"><div class="blabel">${esc(b.label)}</div>
      <div class="btrack"><div class="bfill" style="width:${pct}%;background:${b.highlight ? MAG : INK}"></div><span class="bval">${esc(val)}</span></div></div>`;
  }).join("");
  return `<div class="kicker">${esc(c.title)}</div>${c.subtitle ? `<div class="csub">${esc(c.subtitle)}</div>` : ""}
    <div class="bars">${rows}</div>
    ${c.units ? `<div class="units">${esc(c.units)}</div>` : ""}${c.note ? `<div class="note">${esc(c.note)}</div>` : ""}`;
}

function statementBody(kicker, text) {
  return `<div class="stwrap"><div class="stkick">${esc(kicker)}</div><div class="sttext">${esc(text)}</div></div>`;
}

function timelineBody(c) {
  const ev = (c.data?.events || []).slice(0, 5);
  const rows = ev.map((e) => `<div class="tev"><div class="tdate">${esc(e.date)}</div><div class="tbody"><div class="ttitle">${esc(e.title)}</div>${e.detail ? `<div class="tdetail">${esc(clip(e.detail, 116))}</div>` : ""}</div></div>`).join("");
  return `<div class="kicker">${esc(c.title)}</div><div class="timeline">${rows}</div>`;
}

function ctaSlide(a) {
  return `<div class="slide cta">
    <div class="ctamark">${mark("#fff")}</div>
    <div class="ctakick">The full analysis</div>
    <div class="ctahead">${esc(a.headline)}</div>
    <div class="ctaurl">cumulant.org/articles</div>
    <div class="ctanote">Independent, source-backed analysis. AI-assisted; every figure traces to a cited source.</div>
  </div>`;
}

// ---- planner ------------------------------------------------------------- //

function plan(a) {
  const slides = [{ html: (t) => coverSlide(a, t) }];
  const charts = a.charts || [];
  const kn = charts.find((c) => c.kind === "keynumber");
  const bars = charts.filter((c) => c.kind === "bar" || c.kind === "comparison");
  const tl = charts.find((c) => c.kind === "timeline");
  const takes = a.takeaways || [];
  const srcOf = (c) => c.source || (a.sources?.[0]?.publisher ?? "Cumulant analysis");

  if (kn) slides.push({ body: keynumberBody(kn), src: srcOf(kn) });
  if (takes[0]) slides.push({ statement: ["Takeaway", takes[0]] });
  if (bars[0]) slides.push({ body: barsBody(bars[0]), src: srcOf(bars[0]) });
  if (tl) slides.push({ body: timelineBody(tl), src: srcOf(tl) });
  if (bars[1]) slides.push({ body: barsBody(bars[1]), src: srcOf(bars[1]) });
  if (takes[1] || a.whyItMatters) slides.push({ statement: ["Why it matters", a.whyItMatters || takes[1]] });
  if (bars[2]) slides.push({ body: barsBody(bars[2]), src: srcOf(bars[2]) });
  slides.push({ cta: true });
  return slides;
}

// ---- css ----------------------------------------------------------------- //

function css(F) {
  return `*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:${F.w}px;height:${F.h}px;font-family:"Helvetica Neue",Arial,sans-serif;}
  .slide{position:relative;width:${F.w}px;height:${F.h}px;overflow:hidden;}
  /* cover */
  .cover{background:#0a0a0a;}
  .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .cscrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.94) 0%,rgba(0,0,0,.7) 28%,rgba(0,0,0,.2) 55%,rgba(0,0,0,.1) 75%,rgba(0,0,0,.3) 100%);}
  .cpad{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:74px;}
  .ckick{font-size:24px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${MAG};margin-bottom:22px;}
  .chead{line-height:1.04;letter-spacing:-.02em;font-weight:700;color:#fff;max-width:96%;text-wrap:balance;}
  .cfoot{display:flex;align-items:center;justify-content:space-between;margin-top:46px;}
  .cbrand{display:flex;align-items:center;gap:13px;}.cbrand svg{width:34px;height:27px;}.cbrand span{font-size:30px;font-weight:600;letter-spacing:-.01em;color:#fff;}
  .cswipe{font-size:20px;font-weight:500;color:rgba(255,255,255,.7);letter-spacing:.02em;}
  /* interior frame */
  .hdr{position:absolute;top:62px;left:74px;right:74px;display:flex;align-items:center;justify-content:space-between;}
  .hbrand{display:flex;align-items:center;gap:11px;}.hbrand svg{width:27px;height:22px;}.hbrand span{font-size:20px;font-weight:600;letter-spacing:-.01em;}
  .count{font-family:ui-monospace,monospace;font-size:18px;letter-spacing:.08em;opacity:.5;}
  .body{position:absolute;top:150px;left:74px;right:74px;bottom:120px;display:flex;flex-direction:column;justify-content:center;}
  .ftr{position:absolute;bottom:60px;left:74px;right:74px;display:flex;align-items:center;justify-content:space-between;font-family:ui-monospace,monospace;font-size:17px;letter-spacing:.03em;opacity:.55;}
  .ftr .dot{width:9px;height:9px;border-radius:50%;background:${MAG};opacity:1;}
  .kicker{font-size:34px;font-weight:700;line-height:1.12;letter-spacing:-.01em;margin-bottom:34px;max-width:94%;}
  .csub{font-size:23px;line-height:1.4;opacity:.7;margin-top:-18px;margin-bottom:30px;}
  /* keynumber */
  .kn{font-size:168px;font-weight:700;letter-spacing:-.04em;line-height:.95;color:${MAG};}
  .knlabel{font-size:30px;font-weight:600;margin-top:18px;}
  .knsub{font-size:23px;line-height:1.45;opacity:.72;margin-top:16px;max-width:92%;}
  /* bars */
  .bars{display:flex;flex-direction:column;gap:30px;margin-top:8px;}
  .brow{display:flex;flex-direction:column;gap:11px;}
  .blabel{font-size:25px;font-weight:600;}
  .btrack{position:relative;height:50px;background:rgba(0,0,0,.06);border-radius:7px;overflow:hidden;display:flex;align-items:center;}
  .bfill{height:100%;border-radius:7px;}
  .bval{position:absolute;right:18px;font-size:23px;font-weight:700;font-family:ui-monospace,monospace;color:${INK};}
  .units{margin-top:30px;font-size:20px;font-style:italic;opacity:.6;}
  .note{margin-top:10px;font-size:21px;line-height:1.4;opacity:.8;}
  /* statement */
  .stwrap{border-left:6px solid ${MAG};padding-left:40px;}
  .stkick{font-family:ui-monospace,monospace;font-size:22px;text-transform:uppercase;letter-spacing:.1em;color:${MAG};margin-bottom:26px;}
  .sttext{font-size:46px;line-height:1.22;font-weight:600;letter-spacing:-.015em;}
  /* timeline */
  .timeline{display:flex;flex-direction:column;gap:26px;}
  .tev{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:start;}
  .tdate{font-family:ui-monospace,monospace;font-size:20px;font-weight:600;color:${MAG};padding-top:4px;}
  .ttitle{font-size:27px;font-weight:700;line-height:1.15;}
  .tdetail{font-size:21px;line-height:1.4;opacity:.7;margin-top:6px;}
  /* cta */
  .cta{background:${INK};color:#fff;display:flex;flex-direction:column;justify-content:center;padding:80px;}
  .ctamark{margin-bottom:40px;}.ctamark svg{width:64px;height:52px;}
  .ctakick{font-family:ui-monospace,monospace;font-size:24px;text-transform:uppercase;letter-spacing:.12em;color:${MAG};margin-bottom:26px;}
  .ctahead{font-size:54px;line-height:1.1;font-weight:700;letter-spacing:-.02em;margin-bottom:40px;}
  .ctaurl{font-size:34px;font-weight:600;}
  .ctanote{font-size:21px;line-height:1.5;opacity:.6;margin-top:24px;max-width:88%;}`;
}

function page(bodyHtml, F) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(F)}</style></head><body>${bodyHtml}</body></html>`;
}

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

const out = join(arg("out", join(homedir(), "Downloads", "cumulant-social")), `carousel-${a.slug}`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const slides = plan(a);
slides.forEach((s, i) => {
  const idx = i + 1, total = slides.length;
  let body;
  if (s.html) body = s.html(total);
  else if (s.cta) body = ctaSlide(a);
  else if (s.statement) body = frame(idx, total, null, statementBody(s.statement[0], s.statement[1]));
  else body = frame(idx, total, s.src, s.body);
  render(page(body, F), F, join(out, `slide-${String(idx).padStart(2, "0")}.png`));
  console.log(`  slide ${idx}/${total}`);
});
console.log(`\nCarousel (${slides.length} slides) -> ${out}`);
