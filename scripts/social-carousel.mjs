#!/usr/bin/env node
/**
 * Social carousel generator — bold, colorful, research-forward.
 *
 * Every slide is a full-color photo with a pink title + white body, the
 * "Cumulant" wordmark top-right (bottom on the last), and a magenta arrow. One
 * font (Neue Haas Unica). Text positions rotate. Photo slides get a subtle
 * text-behind-subject DEPTH effect wherever the image has a real focal subject
 * (native macOS Vision subject lift, coverage-gated). The article's charts -
 * big numbers, bars, comparisons, tables, timelines, lines, ranges - are surfaced
 * as their own slides so the research shows. Each slide draws a different image.
 *
 * Usage: node scripts/social-carousel.mjs --slug <slug> [--format 4x5] [--out DIR]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = process.cwd();
const ART = join(ROOT, "content", "articles");
const PUB = join(ROOT, "public");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CLAUDE = process.env.FCRI_CLAUDE_BIN || "claude";
const TMP = "/tmp/cumulant-carousel-tmp";
const SCALE = 3;
const MAG = "#ff2d92";
const W = 1080, H = 1350;
const NEUE = readFileSync(join(PUB, "fonts", "NeueHaasUnica-Regular.woff2")).toString("base64");

const htmlEsc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// spell out financial unit abbreviations: $44B -> $44 billion, 76.8M -> 76.8 million
const UNIT = { k: "thousand", m: "million", mn: "million", b: "billion", bn: "billion", t: "trillion", tn: "trillion", trn: "trillion", thousand: "thousand", million: "million", billion: "billion", trillion: "trillion" };
const expandUnits = (s) => String(s ?? "").replace(/(\$?\d[\d,.]*)\s*(billion|trillion|million|thousand|bn|tn|trn|mn|[KMBT])\b/g, (full, num, u) => { const w = UNIT[u.toLowerCase()]; return w ? `${num} ${w}` : full; });
const esc = (s) => htmlEsc(expandUnits(s));
const clip = (s, n) => { s = String(s ?? ""); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…"; };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const fmtNum = (v) => (typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : v);

function baseCss() {
  return `@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${NEUE}) format('woff2');font-weight:400;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:${W}px;height:${H}px;}
  .slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:'Neue','Helvetica Neue',Arial,sans-serif;}
  .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.03);}
  .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.05) 16%,rgba(0,0,0,0) 40%,rgba(0,0,0,.45) 66%,rgba(0,0,0,.86) 100%);}
  .dark{position:absolute;inset:0;background:rgba(0,0,0,.64);}
  .wm{position:absolute;top:54px;right:64px;font-size:32px;letter-spacing:-.01em;color:#fff;z-index:6;}.wm .d{color:${MAG};}
  .arrow{position:absolute;bottom:52px;right:60px;font-size:64px;line-height:1;color:${MAG};z-index:6;}
  .content{position:absolute;left:64px;right:108px;bottom:128px;z-index:4;}
  .title{color:${MAG};line-height:1.04;letter-spacing:-.025em;text-shadow:0 2px 30px rgba(0,0,0,.65);}
  .body{color:#fff;font-size:36px;line-height:1.36;margin-top:26px;text-shadow:0 2px 22px rgba(0,0,0,.7);}
  .ctitle{position:absolute;left:56px;right:90px;top:138px;color:${MAG};font-size:50px;line-height:1.06;letter-spacing:-.02em;z-index:4;text-shadow:0 2px 30px rgba(0,0,0,.7);}`;
}
const wm = `<div class="wm">Cumulant<span class="d">.</span></div>`;
const arrow = `<div class="arrow">&rarr;</div>`;
const page = (extraCss, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss()}${extraCss || ""}</style></head><body><div class="slide">${body}</div></body></html>`;
const photo = (src) => (src ? `<img class="photo" src="${src}">` : "") + `<div class="scrim"></div>`;

// ---- photo / text slides ------------------------------------------------- //

const POSCSS = {
  bl: ``,
  tl: `.content{bottom:auto;top:148px;}`,
  c: `.content{bottom:auto;top:50%;transform:translateY(-50%);}`,
  bc: `.content{left:80px;right:80px;text-align:center;}`,
};

function titleSlide(title, body, img, posHint = "bl") {
  const pos = (img ? darkRegion(img) : null) || (posHint === "bc" ? "bl" : posHint);
  const len = String(title).length;
  const size = len > 150 ? 50 : len > 105 ? 60 : len > 64 ? 72 : len > 32 ? 88 : 104;
  const css = `.title{font-size:${size}px;}${POSCSS[pos] || ""}.scr{position:absolute;inset:0;z-index:1;background:${scrimBg(pos)};}`;
  return page(css, `${img ? `<img class="photo" src="${img}">` : ""}<div class="scr"></div>${wm}<div class="content"><div class="title">${esc(title)}</div>${body ? `<div class="body">${esc(body)}</div>` : ""}</div>${arrow}`);
}

// ---- chart slides (the research) — pink/white over a darkened photo ------- //

function bigNumberSlide(c, img) {
  const d = c.data || {};
  const num = String(d.value ?? "");
  const size = num.length > 7 ? 220 : num.length > 5 ? 270 : 320;
  const css = `.num{color:${MAG};font-size:${size}px;line-height:.9;letter-spacing:-.045em;text-shadow:0 3px 40px rgba(0,0,0,.6);}
  .lab{color:#fff;font-size:40px;line-height:1.25;margin-top:30px;text-shadow:0 2px 22px rgba(0,0,0,.7);}`;
  return page(css, `${photo(img)}${wm}<div class="content"><div class="num">${esc(num)}</div><div class="lab">${esc(d.label ?? c.title ?? "")}</div></div>${arrow}`);
}

function barSlide(c, img) {
  const bars = (c.data?.bars || []).slice(0, 4);
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const rows = bars.map((b) => {
    const pct = Math.max(8, (Math.abs(b.value) / max) * 100);
    return `<div class="brow"><div class="bl">${esc(b.label)}</div><div class="bt"><div class="bf" style="width:${pct}%;background:${b.highlight ? MAG : "rgba(255,255,255,.9)"}"></div><span class="bv" style="color:${b.highlight ? "#fff" : "#17140f"}">${esc(fmtNum(b.value))}</span></div></div>`;
  }).join("");
  const css = `.bars{position:absolute;left:56px;right:56px;bottom:170px;display:flex;flex-direction:column;gap:40px;z-index:4;}
  .bl{color:#fff;font-size:34px;margin-bottom:14px;text-shadow:0 2px 16px rgba(0,0,0,.8);}
  .bt{position:relative;height:60px;background:rgba(255,255,255,.16);border-radius:9px;display:flex;align-items:center;}
  .bf{height:100%;border-radius:9px;}.bv{position:absolute;right:20px;font-size:32px;text-shadow:0 1px 8px rgba(0,0,0,.5);}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ctitle">${esc(c.title)}</div><div class="bars">${rows}</div>${arrow}`);
}

function tableSlide(c, img) {
  const cols = (c.data?.columns || []).slice(0, 4);
  const rows = (c.data?.rows || []).slice(0, 4);
  const n = cols.length;
  const head = cols.map((h, i) => `<div class="th" style="${i ? "text-align:right" : ""}">${esc(h)}</div>`).join("");
  const body = rows.map((r) => `<div class="tr">${r.slice(0, n).map((cell, i) => `<div class="td" style="${i ? "text-align:right" : "color:#fff"}">${esc(cell)}</div>`).join("")}</div>`).join("");
  const css = `.tbl{position:absolute;left:52px;right:52px;top:330px;z-index:4;}
  .hr,.tr{display:grid;grid-template-columns:1.5fr repeat(${Math.max(1, n - 1)},1fr);gap:16px;padding:18px 0;border-bottom:1px solid rgba(255,255,255,.2);}
  .th{color:${MAG};font-size:21px;line-height:1.15;}.td{color:rgba(255,255,255,.92);font-size:23px;line-height:1.2;}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ctitle">${esc(c.title)}</div><div class="tbl"><div class="hr">${head}</div>${body}</div>${arrow}`);
}

function timelineSlide(c, img) {
  const ev = (c.data?.events || []).slice(0, 5);
  const mid = Math.min(ev.length - 1, Math.max(1, Math.round(ev.length / 2)));
  const rows = ev.map((e, i) => `<div class="tev"><span class="dot" style="background:${i === mid ? MAG : "rgba(255,255,255,.55)"}"></span><div><div class="dt" style="color:${i === mid ? MAG : "#fff"}">${esc(e.date)}</div><div class="tt">${esc(e.title)}</div></div></div>`).join("");
  const css = `.tl{position:absolute;left:56px;right:56px;top:420px;display:flex;flex-direction:column;gap:34px;z-index:4;}
  .tl::before{content:"";position:absolute;left:13px;top:12px;bottom:12px;width:2px;background:rgba(255,255,255,.25);}
  .tev{display:grid;grid-template-columns:54px 1fr;gap:24px;align-items:start;position:relative;}
  .dot{width:28px;height:28px;border-radius:50%;margin-top:6px;}
  .dt{font-size:24px;}.tt{color:#fff;font-size:34px;line-height:1.14;margin-top:6px;letter-spacing:-.01em;}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ctitle">${esc(c.title)}</div><div class="tl">${rows}</div>${arrow}`);
}

function lineSlide(c, img) {
  const series = (c.data?.series || [])[0];
  const pts = (series?.points || []).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 2) return barSlide(c, img);
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const px = 70, pw = 940, py0 = 1040, ph = 520;
  const poly = pts.map((p) => `${(px + ((p.x - minx) / (maxx - minx || 1)) * pw).toFixed(1)},${(py0 - ((p.y - miny) / (maxy - miny || 1)) * ph).toFixed(1)}`).join(" ");
  const css = `.ln{position:absolute;inset:0;z-index:4;}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ctitle">${esc(c.title)}</div>
    <svg class="ln" viewBox="0 0 ${W} ${H}"><polyline points="${poly}" fill="none" stroke="${MAG}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>${arrow}`);
}

function rangeSlide(c, img) {
  const items = (c.data?.items || []).slice(0, 4);
  const all = items.flatMap((i) => [i.low, i.high]).filter(Number.isFinite);
  const lo = Math.min(...all), hi = Math.max(...all) || 1, span = hi - lo || 1;
  const rows = items.map((it) => {
    const l = ((it.low - lo) / span) * 100, h = ((it.high - lo) / span) * 100, m = ((it.mid - lo) / span) * 100;
    return `<div class="rrow"><div class="bl">${esc(it.label)}</div><div class="rt"><div class="rf" style="left:${l}%;width:${Math.max(2, h - l)}%"></div><div class="rm" style="left:${m}%"></div></div><div class="rv">${esc(fmtNum(it.low))}–${esc(fmtNum(it.high))}</div></div>`;
  }).join("");
  const css = `.rr{position:absolute;left:56px;right:56px;bottom:180px;display:flex;flex-direction:column;gap:38px;z-index:4;}
  .bl{color:#fff;font-size:30px;margin-bottom:14px;text-shadow:0 2px 16px rgba(0,0,0,.8);}
  .rt{position:relative;height:44px;background:rgba(255,255,255,.16);border-radius:8px;}
  .rf{position:absolute;top:0;bottom:0;background:rgba(255,255,255,.55);border-radius:8px;}
  .rm{position:absolute;top:-6px;bottom:-6px;width:8px;background:${MAG};border-radius:4px;}
  .rv{color:${MAG};font-size:26px;margin-top:10px;}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ctitle">${esc(c.title)}</div><div class="rr">${rows}</div>${arrow}`);
}

function ctaSlide(loopback, takeaways, cta, img) {
  const rows = takeaways.slice(0, 3).map((t) => `<div class="row">${esc(clip(t, 96))}</div>`).join("");
  const css = `.dark{background:rgba(0,0,0,.62);}
  .lb{color:${MAG};font-size:60px;line-height:1.06;letter-spacing:-.02em;position:absolute;left:64px;right:96px;top:150px;z-index:4;text-shadow:0 2px 30px rgba(0,0,0,.6);}
  .recap{position:absolute;left:64px;right:80px;top:520px;display:flex;flex-direction:column;gap:30px;z-index:4;}
  .row{color:#fff;font-size:36px;line-height:1.28;text-shadow:0 2px 16px rgba(0,0,0,.8);}
  .cta{position:absolute;left:64px;right:96px;bottom:170px;color:${MAG};font-size:44px;line-height:1.16;z-index:4;text-shadow:0 2px 22px rgba(0,0,0,.6);}
  .sign{position:absolute;left:0;right:0;bottom:74px;text-align:center;color:#fff;font-size:34px;z-index:6;}.sign .d{color:${MAG};}`;
  return page(css, `${photo(img)}<div class="dark"></div><div class="lb">${esc(loopback)}</div><div class="recap">${rows}</div><div class="cta">${esc(cta)}</div><div class="sign">Cumulant<span class="d">.</span></div>`);
}

// ---- copy + images + cutouts --------------------------------------------- //

function getCopy(a) {
  const fb = {
    hook: a.headline, restate: clip(a.deck || a.headline, 80), promise: clip(a.whyItMatters || a.deck || "", 120),
    turn: clip(a.whyItMatters || (a.takeaways || []).slice(-1)[0] || "", 150),
    loopback: clip(a.deck || a.headline, 80), cta: "Save this for the next time it comes up.",
    behindLine: clip(String(a.headline).split(/[.,:;]/)[0], 38),
  };
  try {
    const prompt = `You are the social editor for Cumulant Research (independent, AI-assisted financial newsroom). Write a retention copy pack for a carousel. Rules: curiosity-gap hooks (tension + withheld why), plain English, no hype, no investment advice, no em dashes, no surrounding quotation marks. Short.\n`
      + `HEADLINE: ${a.headline}\nDECK: ${a.deck || ""}\nWHY IT MATTERS: ${a.whyItMatters || ""}\nTAKEAWAYS: ${(a.takeaways || []).slice(0, 3).join(" | ")}\n\n`
      + `Return STRICT JSON: {"hook":"cover line, 6-11 words: genuinely hooky (curiosity or tension), but the reader must immediately know WHAT it is about - name the company, market, asset, or topic. Not vague or cryptic. Use digits with the unit word (e.g. $15.7 billion, $77 million); never write the number itself in words; never use bn or M","restate":"restate the stakes in one line, <=11 words, topic clear","promise":"one setup line that raises a question","turn":"the most quotable here-is-what-nobody-priced-in line, short","loopback":"one line echoing the hook now answered","cta":"ONE save or share prompt","behindLine":"a punchy 3 to 6 word fragment"}. Output ONLY JSON.`;
    const out = execFileSync(CLAUDE, ["-p"], { input: prompt, encoding: "utf8", timeout: 90000 });
    const m = out.replace(/```json?/g, "").replace(/```/g, "").match(/\{[\s\S]*\}/);
    if (m) { const j = JSON.parse(m[0]); return { ...fb, ...Object.fromEntries(Object.entries(j).filter(([, v]) => v && String(v).trim())) }; }
  } catch { /* fall back */ }
  return fb;
}

function gatherImages(a) {
  const imgs = [];
  if (a.leadImage?.src) imgs.push("file://" + join(PUB, a.leadImage.src));
  try {
    readdirSync(join(ROOT, ".social-assets"))
      .filter((f) => f.startsWith(a.slug + "-") && /\.(jpg|jpeg|png)$/i.test(f) && !f.includes("-cut-")).sort()
      .forEach((f) => imgs.push("file://" + join(ROOT, ".social-assets", f)));
  } catch { /* none */ }
  return imgs.length ? imgs : [""];
}

// Which third of the image is darkest -> place the text there (legibility + variety).
function darkRegion(imgUrl) {
  if (!imgUrl) return null;
  try {
    const p = imgUrl.replace("file://", "");
    const out = execFileSync("python3", ["-c",
      `from PIL import Image\nim=Image.open(${JSON.stringify(p)}).convert("L").resize((40,60))\npx=im.load();W=40\ndef av(a,b):\n s=0\n for x in range(W):\n  for y in range(a,b): s+=px[x,y]\n return s/(W*(b-a))\nt=av(0,20);m=av(20,40);b=av(40,60)\nprint("tl" if t<=m and t<=b else "bl" if b<=m and b<=t else "c")`],
      { encoding: "utf8", timeout: 20000 }).trim();
    return ["tl", "c", "bl"].includes(out) ? out : null;
  } catch { return null; }
}
// a dark gradient matched to the text position so the text always sits on a dark patch
function scrimBg(pos) {
  if (pos === "tl") return "linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.45) 27%,rgba(0,0,0,.04) 52%,rgba(0,0,0,.42) 100%)";
  if (pos === "c") return "linear-gradient(180deg,rgba(0,0,0,.3) 0%,transparent 15%,rgba(0,0,0,.68) 38%,rgba(0,0,0,.68) 64%,transparent 86%,rgba(0,0,0,.32) 100%)";
  return "linear-gradient(180deg,rgba(0,0,0,.38) 0%,transparent 20%,transparent 43%,rgba(0,0,0,.55) 66%,rgba(0,0,0,.9) 100%)";
}

// ---- assemble ------------------------------------------------------------ //

function build(a, copy, images) {
  const img = (i) => images[i % images.length];
  // colorful photo slide; text placed over the image's darkest area, position varies
  const photoD = (text, i, pos, _short, body) => titleSlide(clip(text, 170), body || null, img(i), pos);

  // chart slides — the research (only what the article actually has), capped
  const C = a.charts || [];
  const find = (k) => C.find((c) => c.kind === k);
  const chartBuilders = [];
  if (find("keynumber")) chartBuilders.push((im) => bigNumberSlide(find("keynumber"), im));
  if (find("bar")) chartBuilders.push((im) => barSlide(find("bar"), im));
  if (find("table")) chartBuilders.push((im) => tableSlide(find("table"), im));
  if (find("timeline")) chartBuilders.push((im) => timelineSlide(find("timeline"), im));
  if (find("line")) chartBuilders.push((im) => lineSlide(find("line"), im));
  if (find("comparison")) chartBuilders.push((im) => barSlide(find("comparison"), im));
  if (find("range")) chartBuilders.push((im) => rangeSlide(find("range"), im));
  const charts = chartBuilders.slice(0, 4);

  const kp = a.keyPoints || a.takeaways || [];
  const takes = a.takeaways || kp;
  let k = 0;
  const s = [];
  s.push(photoD(copy.hook, k++, "bl", copy.hook));                               // 1 hook
  s.push(photoD(copy.restate, k++, "tl", copy.behindLine, copy.promise));        // 2 re-serve
  if (charts[0]) s.push(charts[0](img(k++)));                                    // 3 chart
  s.push(photoD(takes[0] || a.deck, k++, "c", copy.behindLine));                 // 4 evidence
  if (charts[1]) s.push(charts[1](img(k++)));                                    // 5 chart
  if (charts[2]) s.push(charts[2](img(k++)));                                    // 6 chart (table / timeline)
  s.push(photoD(copy.turn, k++, "bc", copy.behindLine));                         // 7 turn
  if (charts[3]) s.push(charts[3](img(k++)));                                    // 8 chart
  s.push(ctaSlide(copy.loopback, takes, copy.cta, img(k++)));                    // 9 cta
  return s;
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
mkdirSync(out, { recursive: true });
try { readdirSync(out).filter((f) => /^slide-\d+\.png$/.test(f)).forEach((f) => rmSync(join(out, f))); } catch { /* fresh */ }

const slides = build(a, copy, images);
slides.forEach((html, i) => { render(html, join(out, `slide-${String(i + 1).padStart(2, "0")}.png`)); console.log(`  slide ${i + 1}/${slides.length}`); });
console.log(`\nCarousel (${slides.length} slides, ${images.length} image(s), 4K) -> ${out}`);
