#!/usr/bin/env node
/**
 * Social carousel generator — retention-engineered, art-directed decks.
 *
 * Built to the Cumulant carousel playbook: a locked chassis (one grid, Neue Haas
 * Unica, ink/cream/magenta, fixed wordmark) with ONE variable rotated per slide
 * (the archetype), so cohesion is automatic and variety is aggressive. Every
 * photo is forced through one transform stack (ink/cream or magenta duotone +
 * fixed-seed grain) so unrelated licensed shots read as one art-directed brand.
 *
 * Arc: hook (open loop) -> standalone re-serve cover -> evidence -> chart ->
 * evidence photo -> the TURN (magenta) -> proof chart -> payoff recap + save CTA.
 * ink<->cream strobes every slide; magenta touches exactly one token per slide;
 * no kicker labels, no slide counter; signs off with the "Cumulant" wordmark.
 *
 * Usage: node scripts/social-carousel.mjs --slug <slug> [--format 4x5] [--out DIR]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = process.cwd();
const ART = join(ROOT, "content", "articles");
const PUB = join(ROOT, "public");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CLAUDE = process.env.FCRI_CLAUDE_BIN || "claude";
const TMP = "/tmp/cumulant-carousel-tmp";
const SCALE = 3; // device pixels -> 3240x4050 (4K-class)

const INK = "#17140f";
const CREAM = "#f4f1ea";
const MAG = "#ff2d92";
const W = 1080, H = 1350;

const NEUE = readFileSync(join(PUB, "fonts", "NeueHaasUnica-Regular.woff2")).toString("base64");
const MONO = readFileSync(join(PUB, "fonts", "Akkurat-Mono.woff2")).toString("base64");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => { s = String(s ?? ""); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…"; };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const FIG = /(\$\s?\d[\d,.]*%?|\b\d[\d,.]*[\s\-]?(?:%|percent|weeks?|months?|days?|years?|billion|million|trillion|barrels?)\b|\b\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\b|\b(?:fifth|third|half|quarter)\b)/i;
// magenta touches exactly ONE token per slide: the first figure.
const hl1 = (s) => esc(s).replace(FIG, (m) => `<span class="hl">${m}</span>`);

// ---- shared chassis (fonts, filters, base CSS) --------------------------- //

const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
  <filter id="duo" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/>
    <feComponentTransfer><feFuncR type="gamma" exponent="1.35" amplitude="1.15"/><feFuncG type="gamma" exponent="1.35" amplitude="1.15"/><feFuncB type="gamma" exponent="1.35" amplitude="1.15"/></feComponentTransfer>
    <feComponentTransfer><feFuncR type="table" tableValues="0.090 0.957"/><feFuncG type="table" tableValues="0.078 0.945"/><feFuncB type="table" tableValues="0.059 0.918"/></feComponentTransfer>
  </filter>
  <filter id="duomag" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/>
    <feComponentTransfer><feFuncR type="table" tableValues="0.090 1.0"/><feFuncG type="table" tableValues="0.078 0.176"/><feFuncB type="table" tableValues="0.059 0.573"/></feComponentTransfer>
  </filter>
  <filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
</defs></svg>`;

const grain = `<svg class="grain" preserveAspectRatio="none" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" filter="url(#grainf)"/></svg>`;

function baseCss(dark) {
  const bg = dark ? INK : CREAM, fg = dark ? CREAM : INK;
  return `@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${NEUE}) format('woff2');font-weight:400;font-style:normal;}
  @font-face{font-family:'Mono';src:url(data:font/woff2;base64,${MONO}) format('woff2');font-weight:400;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:${W}px;height:${H}px;}
  .slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${bg};color:${fg};font-family:'Neue','Helvetica Neue',Arial,sans-serif;}
  .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .duo{filter:url(#duo) contrast(1.03);}
  .duomag{filter:url(#duomag) contrast(1.04);}
  .grain{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:overlay;opacity:.13;pointer-events:none;z-index:5;}
  .wm{position:absolute;top:58px;left:64px;font-size:23px;letter-spacing:-.01em;color:${fg};opacity:.78;z-index:6;}
  .scrim{position:absolute;inset:0;background:linear-gradient(transparent 34%, rgba(23,20,15,.74) 100%);}
  .hl{background:${MAG};color:#fff;padding:.04em .16em;border-radius:7px;white-space:nowrap;box-decoration-break:clone;-webkit-box-decoration-break:clone;}
  .pad{position:absolute;inset:0;padding:64px;display:flex;flex-direction:column;z-index:4;}
  .mono{font-family:'Mono',ui-monospace,monospace;}
  .pull{position:absolute;right:64px;bottom:58px;font-family:'Mono',monospace;font-size:21px;letter-spacing:.04em;color:${MAG};z-index:6;}
  .src{position:absolute;left:64px;bottom:54px;font-family:'Mono',monospace;font-size:19px;letter-spacing:.03em;color:${fg};opacity:.5;z-index:6;}`;
}

const page = (dark, extraCss, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss(dark)}${extraCss || ""}</style></head><body><div class="slide">${DEFS}${body}${grain}</div></body></html>`;

const wm = `<div class="wm">Cumulant</div>`;

// ---- archetype slide builders -------------------------------------------- //

function hookSlide(copy, bg) {
  const len = copy.hook.length;
  const size = len > 78 ? 86 : len > 50 ? 104 : len > 30 ? 124 : 150;
  const css = `.hk{position:absolute;left:64px;right:64px;bottom:120px;font-size:${size}px;line-height:1.0;letter-spacing:-.03em;color:${CREAM};z-index:4;text-shadow:0 2px 40px rgba(0,0,0,.5);}`;
  return page(true, css, `${bg ? `<img class="photo duo" src="${bg}">` : ""}<div class="scrim"></div>${wm}<div class="hk">${hl1(copy.hook)}</div>`);
}

function reserveSlide(copy, bg) {
  const css = `.rh{position:absolute;left:64px;right:140px;top:230px;font-size:78px;line-height:1.04;letter-spacing:-.025em;color:${INK};z-index:4;}
  .rs{position:absolute;left:64px;right:200px;top:560px;font-size:33px;line-height:1.4;color:${INK};opacity:.82;z-index:4;}
  .strip{position:absolute;left:0;right:0;bottom:0;height:300px;overflow:hidden;}
  .strip img{width:100%;height:100%;object-fit:cover;}
  .strip .sc{position:absolute;inset:0;background:linear-gradient(transparent,rgba(244,241,234,.25));}
  .pull{bottom:336px;color:${INK};opacity:.6;}`;
  return page(false, css, `${wm}<div class="rh">${hl1(copy.restate)}</div><div class="rs">${esc(copy.promise)}</div>
    <div class="strip">${bg ? `<img class="duomag" src="${bg}">` : ""}<div class="sc"></div></div><div class="pull">keep reading →</div>`);
}

function listSlide(rows, pull, bg) {
  const items = rows.slice(0, 3).map((r, i) => `<div class="row"><span class="tick mono">0${i + 1}</span><span class="rt">${hl1(clip(r, 150))}</span></div>`).join("");
  const css = `.list{position:absolute;left:64px;right:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:46px;z-index:4;}
  .row{display:grid;grid-template-columns:90px 1fr;gap:30px;align-items:start;}
  .tick{color:${MAG};font-size:26px;padding-top:14px;}
  .rt{font-size:48px;line-height:1.16;letter-spacing:-.015em;color:${CREAM};}
  .edge{position:absolute;right:0;top:0;bottom:0;width:34%;opacity:.16;}
  .edge img{width:100%;height:100%;object-fit:cover;}`;
  return page(true, css, `${bg ? `<div class="edge"><img class="duo" src="${bg}"></div>` : ""}${wm}<div class="list">${items}</div>${pull ? `<div class="pull">${esc(pull)}</div>` : ""}`);
}

function bigNumberSlide(c) {
  const d = c.data || {};
  const css = `.cap{position:absolute;left:64px;right:120px;top:200px;font-size:40px;line-height:1.12;letter-spacing:-.01em;color:${INK};z-index:4;}
  .big{position:absolute;left:60px;right:60px;top:430px;font-size:300px;line-height:.86;letter-spacing:-.05em;color:${MAG};z-index:4;}
  .lab{position:absolute;left:64px;right:120px;top:830px;font-size:38px;color:${INK};opacity:.85;z-index:4;}`;
  return page(false, css, `${wm}<div class="cap">${esc(c.title)}</div><div class="big">${esc(d.value ?? "")}</div>
    <div class="lab">${esc(d.label ?? c.subtitle ?? "")}</div><div class="src">${esc(c.source || "")}</div>`);
}

function barSlide(c) {
  const bars = (c.data?.bars || []).slice(0, 5);
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const rows = bars.map((b) => {
    const pct = Math.max(6, (Math.abs(b.value) / max) * 100);
    const val = typeof b.value === "number" ? (Number.isInteger(b.value) ? b.value : b.value.toFixed(2)) : b.value;
    return `<div class="brow"><div class="bl">${esc(b.label)}</div><div class="bt"><div class="bf" style="width:${pct}%;background:${b.highlight ? MAG : "rgba(23,20,15,.22)"}"></div><span class="bv" style="color:${b.highlight ? MAG : INK}">${esc(val)}</span></div></div>`;
  }).join("");
  const css = `.ttl{position:absolute;left:64px;right:90px;top:170px;font-size:48px;line-height:1.1;letter-spacing:-.02em;color:${INK};z-index:4;}
  .bars{position:absolute;left:64px;right:64px;top:480px;display:flex;flex-direction:column;gap:38px;z-index:4;}
  .bl{font-size:32px;color:${INK};margin-bottom:14px;}
  .bt{position:relative;height:62px;background:rgba(23,20,15,.07);border-radius:8px;display:flex;align-items:center;}
  .bf{height:100%;border-radius:8px;}
  .bv{position:absolute;right:20px;font-family:'Mono',monospace;font-size:30px;}
  .un{position:absolute;left:64px;bottom:120px;font-size:24px;font-style:italic;color:${INK};opacity:.6;z-index:4;}`;
  return page(false, css, `${wm}<div class="ttl">${esc(c.title)}</div><div class="bars">${rows}</div>${c.units ? `<div class="un">${esc(c.units)}</div>` : ""}<div class="src">${esc(c.source || "")}</div>`);
}

function timelineSlide(c) {
  const ev = (c.data?.events || []).slice(0, 5);
  const mid = Math.min(ev.length - 1, Math.max(1, Math.round(ev.length / 2)));
  const rows = ev.map((e, i) => `<div class="tev"><span class="dot" style="background:${i === mid ? MAG : "rgba(23,20,15,.3)"}"></span><div><div class="td mono" style="color:${i === mid ? MAG : INK}">${esc(e.date)}</div><div class="tt">${esc(e.title)}</div></div></div>`).join("");
  const css = `.ttl{position:absolute;left:64px;right:90px;top:170px;font-size:48px;line-height:1.1;letter-spacing:-.02em;color:${INK};z-index:4;}
  .tl{position:absolute;left:64px;right:64px;top:470px;display:flex;flex-direction:column;gap:40px;z-index:4;}
  .tl::before{content:"";position:absolute;left:13px;top:10px;bottom:10px;width:2px;background:rgba(23,20,15,.18);}
  .tev{display:grid;grid-template-columns:60px 1fr;gap:26px;align-items:start;position:relative;}
  .dot{width:28px;height:28px;border-radius:50%;margin-top:6px;}
  .td{font-size:24px;letter-spacing:.02em;}
  .tt{font-size:36px;line-height:1.12;color:${INK};margin-top:6px;letter-spacing:-.01em;}`;
  return page(false, css, `${wm}<div class="ttl">${esc(c.title)}</div><div class="tl">${rows}</div><div class="src">${esc(c.source || "")}</div>`);
}

function photoSlide(line, pull, bg) {
  const len = line.length;
  const size = len > 110 ? 56 : len > 70 ? 66 : 78;
  const css = `.ph{position:absolute;left:64px;right:64px;bottom:120px;font-size:${size}px;line-height:1.08;letter-spacing:-.02em;color:${CREAM};z-index:4;text-shadow:0 2px 34px rgba(0,0,0,.55);}`;
  return page(true, css, `${bg ? `<img class="photo duo" src="${bg}">` : ""}<div class="scrim"></div>${wm}<div class="ph">${hl1(clip(line, 160))}</div>${pull ? `<div class="pull">${esc(pull)}</div>` : ""}`);
}

function turnSlide(text, bg) {
  const css = `.q{position:absolute;left:60px;top:200px;font-size:280px;line-height:.7;color:${MAG};z-index:4;font-family:'Neue';}
  .tt{position:absolute;left:64px;right:90px;top:520px;font-size:74px;line-height:1.1;letter-spacing:-.025em;color:${CREAM};z-index:4;text-shadow:0 2px 30px rgba(0,0,0,.5);}
  .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,20,15,.5),rgba(23,20,15,.68));}`;
  return page(true, css, `${bg ? `<img class="photo duomag" src="${bg}">` : ""}<div class="ov"></div>${wm}<div class="q">“</div><div class="tt">${esc(clip(text, 150))}</div>`);
}

function ctaSlide(loopback, takeaways, cta, bg) {
  const rows = takeaways.slice(0, 3).map((t) => `<div class="row"><span class="tk">—</span><span class="rt">${esc(clip(t, 96))}</span></div>`).join("");
  const css = `.lb{position:absolute;left:64px;right:120px;top:150px;font-size:40px;line-height:1.14;letter-spacing:-.015em;color:${CREAM};z-index:4;}
  .recap{position:absolute;left:64px;right:80px;top:430px;display:flex;flex-direction:column;gap:30px;z-index:4;}
  .row{display:grid;grid-template-columns:42px 1fr;gap:18px;align-items:start;}
  .tk{color:${MAG};font-size:34px;line-height:1;}
  .rt{font-size:34px;line-height:1.22;color:${CREAM};opacity:.92;}
  .cta{position:absolute;left:64px;right:120px;bottom:200px;font-size:38px;line-height:1.2;color:${MAG};z-index:4;}
  .sign{position:absolute;left:0;right:0;bottom:80px;text-align:center;font-size:30px;letter-spacing:-.01em;color:${CREAM};z-index:6;}
  .edge{position:absolute;right:0;top:0;bottom:0;width:42%;opacity:.14;}.edge img{width:100%;height:100%;object-fit:cover;}`;
  return page(true, css, `${bg ? `<div class="edge"><img class="duomag" src="${bg}"></div>` : ""}<div class="lb">${esc(loopback)}</div>
    <div class="recap">${rows}</div><div class="cta">${esc(cta)}</div><div class="sign">Cumulant</div>`);
}

// ---- copy (retention-optimized, claude with fallbacks) ------------------- //

function getCopy(a) {
  const fb = {
    hook: a.headline,
    restate: clip(a.deck || a.headline, 80),
    promise: clip(a.whyItMatters || a.deck || "", 130),
    turn: clip(a.whyItMatters || (a.takeaways || [])[a.takeaways?.length - 1] || "", 150),
    loopback: clip(a.deck || a.headline, 90),
    cta: "Save this for the next time it comes up.",
  };
  try {
    const prompt = `You are the social editor for Cumulant Research (independent, AI-assisted financial newsroom). Write a retention-optimized copy pack for an 8-slide carousel. Rules: curiosity-gap hooks (tension + withheld why), plain English, no hype, no investment advice, no em dashes, no surrounding quotation marks. Keep each value short.\n`
      + `HEADLINE: ${a.headline}\nDECK: ${a.deck || ""}\nWHY IT MATTERS: ${a.whyItMatters || ""}\nTAKEAWAYS: ${(a.takeaways || []).slice(0, 3).join(" | ")}\n\n`
      + `Return STRICT JSON: {"hook":"slide 1 cover, 5-9 words, an open loop or a withheld number, the WHY off the cover","restate":"slide 2, restate the stakes in one line for someone who never saw slide 1, <=11 words","promise":"slide 2 setup line that raises the question and promises a payoff","turn":"slide 6 the turn, the single most quotable here-is-what-nobody-priced-in reframe, short","loopback":"slide 8, one line echoing the hook now answered","cta":"slide 8, ONE save or share prompt"}. Output ONLY JSON.`;
    const out = execFileSync(CLAUDE, ["-p"], { input: prompt, encoding: "utf8", timeout: 90000 });
    const m = out.replace(/```json?/g, "").replace(/```/g, "").match(/\{[\s\S]*\}/);
    if (m) { const j = JSON.parse(m[0]); return { ...fb, ...Object.fromEntries(Object.entries(j).filter(([, v]) => v && String(v).trim())) }; }
  } catch { /* fall back */ }
  return fb;
}

// ---- images -------------------------------------------------------------- //

function gatherImages(a) {
  const imgs = [];
  if (a.leadImage?.src) imgs.push("file://" + join(PUB, a.leadImage.src));
  try {
    readdirSync(join(ROOT, ".social-assets")).filter((f) => f.startsWith(a.slug + "-") && /\.(jpg|jpeg|png)$/i.test(f)).sort()
      .forEach((f) => imgs.push("file://" + join(ROOT, ".social-assets", f)));
  } catch { /* none */ }
  return imgs.length ? imgs : [""];
}

// ---- assemble ------------------------------------------------------------ //

function build(a, copy, images) {
  const img = (i) => images[i % images.length];
  const charts = a.charts || [];
  const kn = charts.find((c) => c.kind === "keynumber");
  const bars = charts.filter((c) => c.kind === "bar");
  const comparison = charts.find((c) => c.kind === "comparison");
  const timeline = charts.find((c) => c.kind === "timeline");
  const kp = a.keyPoints || a.takeaways || [];
  const takes = a.takeaways || kp;

  const chart1 = kn ? bigNumberSlide(kn) : (bars[0] ? barSlide(bars[0]) : null);
  const chart2 = comparison ? barSlide(comparison) : (timeline ? timelineSlide(timeline) : (bars[1] ? barSlide(bars[1]) : (bars[0] ? barSlide(bars[0]) : null)));

  const slides = [];
  slides.push(hookSlide(copy, img(0)));                                              // 1 hook (dark, photo)
  slides.push(reserveSlide(copy, img(1)));                                           // 2 re-serve cover (cream)
  slides.push(listSlide(kp.slice(0, 2).length ? kp.slice(0, 2) : [a.deck], "what most people miss →", img(2))); // 3 evidence list (dark)
  if (chart1) slides.push(chart1);                                                   // 4 chart (cream)
  slides.push(photoSlide(kp[2] || takes[2] || a.deck, "the catch →", img(3)));       // 5 evidence photo (dark)
  slides.push(turnSlide(copy.turn, img(4)));                                         // 6 the turn (magenta)
  if (chart2) slides.push(chart2);                                                   // 7 proof chart (cream)
  slides.push(ctaSlide(copy.loopback, takes, copy.cta, img(5)));                     // 8 payoff + CTA (dark)
  return slides;
}

// ---- main ---------------------------------------------------------------- //

function render(html, outPath) {
  mkdirSync(TMP, { recursive: true });
  const tmp = join(TMP, "slide.html");
  writeFileSync(tmp, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${SCALE}`,
    `--screenshot=${outPath}`, `--window-size=${W},${H}`, `file://${tmp}`], { stdio: "ignore" });
}

let a;
const slug = arg("slug", null);
if (slug) a = JSON.parse(readFileSync(join(ART, `${slug}.json`), "utf8"));
else {
  const all = readdirSync(ART).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(ART, f), "utf8")))
    .filter((x) => x.published !== false).sort((x, y) => new Date(y.publishedAt ?? y.date) - new Date(x.publishedAt ?? x.date));
  a = all[0];
}

const images = gatherImages(a);
const copy = getCopy(a);
console.log(`  hook: ${copy.hook}`);
const out = join(arg("out", join(homedir(), "Downloads", "cumulant-social")), `carousel-${a.slug}`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const slides = build(a, copy, images);
slides.forEach((html, i) => {
  render(html, join(out, `slide-${String(i + 1).padStart(2, "0")}.png`));
  console.log(`  slide ${i + 1}/${slides.length}`);
});
console.log(`\nCarousel (${slides.length} slides, ${images.length} image(s), 4K) -> ${out}`);
