#!/usr/bin/env node
/**
 * Social carousel generator — bold, colorful, one clean look.
 *
 * Every slide: a full-COLOR photo, a pink (magenta) title, white supporting text,
 * the "Cumulant" wordmark top-right, and a magenta arrow. One font (Neue Haas
 * Unica) everywhere. No mono/"code" font, no slide counters, no source lines, no
 * tiny labels. Photos cycle through the article's image set; big stats become a
 * giant pink number; the deck still runs a hook -> build -> turn -> save arc.
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

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => { s = String(s ?? ""); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…"; };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };

// ---- shared chassis ------------------------------------------------------ //

function baseCss() {
  return `@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${NEUE}) format('woff2');font-weight:400;font-style:normal;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:${W}px;height:${H}px;}
  .slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:'Neue','Helvetica Neue',Arial,sans-serif;}
  .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.03);}
  .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.05) 16%,rgba(0,0,0,0) 40%,rgba(0,0,0,.45) 66%,rgba(0,0,0,.86) 100%);}
  .wm{position:absolute;top:54px;right:64px;font-size:32px;letter-spacing:-.01em;color:#fff;z-index:6;}
  .wm b{font-weight:400;}.wm .d{color:${MAG};}
  .arrow{position:absolute;bottom:52px;right:60px;font-size:64px;line-height:1;color:${MAG};z-index:6;}
  .content{position:absolute;left:64px;right:108px;bottom:128px;z-index:4;}
  .title{color:${MAG};line-height:1.04;letter-spacing:-.025em;text-shadow:0 2px 30px rgba(0,0,0,.65);}
  .body{color:#fff;font-size:36px;line-height:1.36;margin-top:26px;text-shadow:0 2px 22px rgba(0,0,0,.7);}`;
}

const wm = `<div class="wm"><b>Cumulant</b><span class="d">.</span></div>`;
const arrow = `<div class="arrow">&rarr;</div>`;

const page = (extraCss, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss()}${extraCss || ""}</style></head><body><div class="slide">${body}</div></body></html>`;

const photo = (src) => (src ? `<img class="photo" src="${src}">` : "") + `<div class="scrim"></div>`;

// ---- slide builders ------------------------------------------------------ //

// text-position variants so the layout switches up slide to slide
const POSCSS = {
  bl: ``,
  tl: `.content{bottom:auto;top:148px;}`,
  c: `.content{bottom:auto;top:50%;transform:translateY(-50%);}`,
  bc: `.content{left:80px;right:80px;text-align:center;}`,
};

function titleSlide(title, body, img, pos = "bl", withArrow = true) {
  const len = String(title).length;
  const size = len > 150 ? 50 : len > 105 ? 60 : len > 64 ? 72 : len > 32 ? 88 : 104;
  const css = `.title{font-size:${size}px;}${POSCSS[pos] || ""}`;
  return page(css, `${photo(img)}${wm}<div class="content"><div class="title">${esc(title)}</div>${body ? `<div class="body">${esc(body)}</div>` : ""}</div>${withArrow ? arrow : ""}`);
}

// background image -> pink text -> cutout subject on top, so the text weaves behind the object
function behindSlide(title, bg, cut) {
  const len = String(title).length;
  const size = len > 62 ? 80 : len > 36 ? 100 : 126;
  const css = `.bgi{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.66) saturate(1.08);}
  .fg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:3;filter:saturate(1.12) contrast(1.05);}
  .topscrim{position:absolute;left:0;right:0;top:0;height:210px;background:linear-gradient(rgba(0,0,0,.42),transparent);z-index:4;pointer-events:none;}
  .bt{position:absolute;left:60px;right:60px;top:210px;z-index:2;color:${MAG};font-size:${size}px;line-height:.98;letter-spacing:-.03em;text-shadow:0 0 16px rgba(0,0,0,.75),0 0 40px rgba(0,0,0,.6),0 3px 30px rgba(0,0,0,.6);}`;
  return page(css, `<img class="bgi" src="${bg}"><div class="bt">${esc(title)}</div><img class="fg" src="${cut}"><div class="topscrim"></div>${wm}${arrow}`);
}

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
    const val = typeof b.value === "number" ? (Number.isInteger(b.value) ? b.value : b.value.toFixed(2)) : b.value;
    return `<div class="brow"><div class="bl">${esc(b.label)}</div><div class="bt"><div class="bf" style="width:${pct}%;background:${b.highlight ? MAG : "rgba(255,255,255,.9)"}"></div><span class="bv" style="color:${b.highlight ? "#fff" : "#17140f"}">${esc(val)}</span></div></div>`;
  }).join("");
  const css = `.ttl{color:${MAG};font-size:60px;line-height:1.06;letter-spacing:-.02em;position:absolute;left:64px;right:108px;top:150px;z-index:4;text-shadow:0 2px 30px rgba(0,0,0,.7);}
  .dark{position:absolute;inset:0;background:rgba(0,0,0,.5);}
  .bars{position:absolute;left:64px;right:64px;bottom:170px;display:flex;flex-direction:column;gap:40px;z-index:4;}
  .bl{color:#fff;font-size:34px;margin-bottom:14px;text-shadow:0 2px 16px rgba(0,0,0,.8);}
  .bt{position:relative;height:60px;background:rgba(255,255,255,.16);border-radius:9px;display:flex;align-items:center;}
  .bf{height:100%;border-radius:9px;}
  .bv{position:absolute;right:20px;color:#fff;font-size:32px;text-shadow:0 1px 8px rgba(0,0,0,.9);}`;
  return page(css, `${photo(img)}<div class="dark"></div>${wm}<div class="ttl">${esc(c.title)}</div><div class="bars">${rows}</div>${arrow}`);
}

function ctaSlide(loopback, takeaways, cta, img) {
  const rows = takeaways.slice(0, 3).map((t) => `<div class="row">${esc(clip(t, 96))}</div>`).join("");
  const css = `.dark{position:absolute;inset:0;background:rgba(0,0,0,.62);}
  .lb{color:${MAG};font-size:60px;line-height:1.06;letter-spacing:-.02em;position:absolute;left:64px;right:96px;top:150px;z-index:4;text-shadow:0 2px 30px rgba(0,0,0,.6);}
  .recap{position:absolute;left:64px;right:80px;top:520px;display:flex;flex-direction:column;gap:30px;z-index:4;}
  .row{color:#fff;font-size:36px;line-height:1.28;text-shadow:0 2px 16px rgba(0,0,0,.8);}
  .cta{position:absolute;left:64px;right:96px;bottom:170px;color:${MAG};font-size:44px;line-height:1.16;z-index:4;text-shadow:0 2px 22px rgba(0,0,0,.6);}
  .sign{position:absolute;left:0;right:0;bottom:74px;text-align:center;color:#fff;font-size:34px;z-index:6;}.sign .d{color:${MAG};}`;
  return page(css, `${photo(img)}<div class="dark"></div><div class="lb">${esc(loopback)}</div><div class="recap">${rows}</div><div class="cta">${esc(cta)}</div><div class="sign">Cumulant<span class="d">.</span></div>`);
}

// ---- retention copy ------------------------------------------------------ //

function getCopy(a) {
  const fb = {
    hook: a.headline, restate: clip(a.deck || a.headline, 80), promise: clip(a.whyItMatters || a.deck || "", 120),
    turn: clip(a.whyItMatters || (a.takeaways || []).slice(-1)[0] || "", 150),
    loopback: clip(a.deck || a.headline, 80), cta: "Save this for the next time it comes up.",
  };
  try {
    const prompt = `You are the social editor for Cumulant Research (independent, AI-assisted financial newsroom). Write a retention copy pack for an 8-slide carousel. Rules: curiosity-gap hooks (tension + withheld why), plain English, no hype, no investment advice, no em dashes, no surrounding quotation marks. Short.\n`
      + `HEADLINE: ${a.headline}\nDECK: ${a.deck || ""}\nWHY IT MATTERS: ${a.whyItMatters || ""}\nTAKEAWAYS: ${(a.takeaways || []).slice(0, 3).join(" | ")}\n\n`
      + `Return STRICT JSON: {"hook":"cover, 5-9 words, open loop / withheld why","restate":"restate the stakes in one line for someone who never saw slide 1, <=11 words","promise":"one setup line that raises a question","turn":"the single most quotable here-is-what-nobody-priced-in line, short","loopback":"one line echoing the hook now answered","cta":"ONE save or share prompt"}. Output ONLY JSON.`;
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
      .filter((f) => f.startsWith(a.slug + "-") && /\.(jpg|jpeg|png)$/i.test(f) && !f.includes("-cut-"))
      .sort()
      .forEach((f) => imgs.push("file://" + join(ROOT, ".social-assets", f)));
  } catch { /* none */ }
  return imgs.length ? imgs : [""];
}

// Native macOS Vision subject lift -> a transparent-background cutout PNG.
// Returns the cutout url, or null when no clear subject is found (graceful).
const CUTBIN = join(TMP, "subject-cutout");
function ensureCutBin() {
  if (existsSync(CUTBIN)) return true;
  try {
    mkdirSync(TMP, { recursive: true });
    execFileSync("swiftc", ["-O", join(ROOT, "scripts", "subject-cutout.swift"), "-o", CUTBIN], { stdio: "ignore", timeout: 180000 });
    return existsSync(CUTBIN);
  } catch { return false; }
}
function cutoutFor(imgUrl, slug, idx) {
  if (!imgUrl) return null;
  const cut = join(ROOT, ".social-assets", `${slug}-cut-${idx}.png`);
  if (existsSync(cut)) return "file://" + cut;
  if (!ensureCutBin()) return null;
  try { execFileSync(CUTBIN, [imgUrl.replace("file://", ""), cut], { stdio: "ignore", timeout: 60000 }); }
  catch { return null; } // non-zero exit = no subject
  return existsSync(cut) ? "file://" + cut : null;
}

// Fraction of the frame the cut-out subject covers — used to decide whether the
// behind-subject layout will actually read (too small = no occlusion, too large
// = text fully hidden). A clean centered subject sits around 0.15-0.6.
function coverage(cutUrl) {
  if (!cutUrl) return 0;
  try {
    const p = cutUrl.replace("file://", "");
    const out = execFileSync("python3", ["-c",
      `from PIL import Image;im=Image.open(${JSON.stringify(p)}).convert("RGBA");h=im.getchannel("A").histogram();t=im.width*im.height;print(round((t-h[0])/t,3))`],
      { encoding: "utf8", timeout: 20000 }).trim();
    return parseFloat(out) || 0;
  } catch { return 0; }
}

// ---- assemble ------------------------------------------------------------ //

function build(a, copy, images) {
  const img = (i) => images[i % images.length];
  const charts = a.charts || [];
  const kn = charts.find((c) => c.kind === "keynumber");
  const bars = charts.filter((c) => c.kind === "bar");
  const comparison = charts.find((c) => c.kind === "comparison");
  const kp = a.keyPoints || a.takeaways || [];
  const takes = a.takeaways || kp;

  // cutouts + coverage -> only use behind-subject where a real focal subject reads
  const cuts = images.map((im, i) => cutoutFor(im, a.slug, i));
  const covs = cuts.map(coverage);
  const good = (i) => cuts[i] && covs[i] >= 0.14 && covs[i] <= 0.6;
  const coverBehind = good(0);
  // best non-cover image for the interior behind-subject slide (coverage near 0.4)
  const cand = covs.map((c, i) => ({ c, i })).filter(({ i }) => good(i) && i !== (coverBehind ? 0 : -1))
    .sort((x, y) => Math.abs(x.c - 0.4) - Math.abs(y.c - 0.4));
  const j = cand.length ? cand[0].i : -1;

  const s = [];
  // 1 hook: behind-subject only if the cover image has a strong subject, else colorful bottom-left
  s.push(coverBehind ? behindSlide(copy.hook, img(0), cuts[0]) : titleSlide(copy.hook, null, img(0), "bl")); // 1
  s.push(titleSlide(copy.restate, copy.promise, img(1), "tl"));                                              // 2 top-left
  if (takes[0]) s.push(titleSlide(clip(takes[0], 170), null, img(2), "c"));                                  // 3 centered
  if (kn) s.push(bigNumberSlide(kn, img(3)));                                                                // 4 big number
  s.push(titleSlide(clip(kp[1] || takes[1] || a.deck, 170), null, img(0), "bc"));                            // 5 evidence, bottom-center
  // 6 turn: short quotable line woven behind a real subject when one exists, else centered
  s.push(j >= 0 ? behindSlide(clip(copy.turn, 60), img(j), cuts[j]) : titleSlide(copy.turn, null, img(1), "c"));
  const chart2 = comparison || bars[1] || bars[0];
  if (chart2) s.push(barSlide(chart2, img(2)));                                                              // 7 chart
  s.push(ctaSlide(copy.loopback, takes, copy.cta, img(3)));                                                  // 8 cta
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
// clear only stale slide PNGs; keep captions.md so re-renders don't wipe captions
try { readdirSync(out).filter((f) => /^slide-\d+\.png$/.test(f)).forEach((f) => rmSync(join(out, f))); } catch { /* fresh */ }

const slides = build(a, copy, images);
slides.forEach((html, i) => {
  render(html, join(out, `slide-${String(i + 1).padStart(2, "0")}.png`));
  console.log(`  slide ${i + 1}/${slides.length}`);
});
console.log(`\nCarousel (${slides.length} slides, ${images.length} image(s), 4K) -> ${out}`);
