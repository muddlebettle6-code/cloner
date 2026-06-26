// Emit 9:16 reel frames (1080x1920) + a per-frame voiceover script, in the
// Cumulant aesthetic. A companion shell script rasterises the frames, generates
// the narration with macOS `say`, and assembles an MP4 with ffmpeg.
//
//   node scripts/social-reel.mjs <article.json> <out-dir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [, , articlePath, outDir = "."] = process.argv;
const a = JSON.parse(readFileSync(articlePath, "utf8"));
mkdirSync(outDir, { recursive: true });

const FONT_DIR = "/Users/aryanpatel/cloner/public/fonts";
const neue = readFileSync(`${FONT_DIR}/NeueHaasUnica-Regular.woff2`).toString("base64");
const mono = readFileSync(`${FONT_DIR}/Akkurat-Mono.woff2`).toString("base64");
const W = 1080, H = 1920;

const MARK = `<svg viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.5 18.6H27.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.35"/>
  <path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="23.4" cy="15" r="1.7" fill="currentColor"/></svg>`;
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const keynum = a.charts?.find((c) => c.kind === "keynumber")?.data || {};
const t0 = (a.takeaways && a.takeaways[0]) || a.deck;
const t1 = (a.takeaways && a.takeaways[2]) || (a.takeaways && a.takeaways[1]) || a.deck;

const HEAD = `<meta charset="utf-8"><style>
@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${neue}) format('woff2');font-weight:400;font-display:block;}
@font-face{font-family:'Mono';src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:400;font-display:block;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;}
body{background:#fff;color:#000;font-family:'Neue','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;}
.card{width:${W}px;height:${H}px;padding:120px 90px;display:flex;flex-direction:column;}
.brand{display:flex;align-items:center;gap:15px;font-size:38px;letter-spacing:-0.4px;}
.brand svg{width:48px;height:38px;}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;}
.eye{font-family:'Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:#909090;font-size:30px;}
.rule{height:6px;background:#ff2d92;border:0;}
.foot{font-family:'Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#909090;font-size:26px;}
.k{color:#ff2d92;}
</style>`;
const page = (inner) => `<!doctype html><html><head>${HEAD}</head><body><div class="card">${inner}</div></body></html>`;

const frames = [
  {
    html: page(`<div class="brand">${MARK}Cumulant</div>
      <div class="mid"><div class="eye" style="margin-bottom:34px;">${esc(a.tags?.[0] || "Markets")}</div>
      <hr class="rule" style="width:84px;margin-bottom:48px;">
      <div style="font-size:96px;line-height:1.02;letter-spacing:-3px;">${esc(a.headline)}</div></div>
      <div class="foot k">swipe up &middot; cumulant.org</div>`),
    vo: "SpaceX just paid nineteen point six billion dollars for radio spectrum. Here's the part the headlines miss.",
  },
  {
    html: page(`<div class="brand">${MARK}Cumulant</div>
      <div class="mid"><div class="eye" style="margin-bottom:40px;">The number</div>
      <div style="font-size:280px;line-height:0.84;letter-spacing:-10px;">${esc(keynum.value || "2-4 Mbps")}</div>
      <hr class="rule" style="width:84px;margin:54px 0 40px;">
      <div style="font-size:50px;line-height:1.2;">${esc(keynum.label || "shared per beam across every phone in a footprint hundreds of km wide")}</div></div>
      <div class="foot">cumulant.org</div>`),
    vo: "A single Starlink satellite shares just two to four megabits across every phone in a footprint hundreds of kilometers wide. Fine for texts. Far below what a city expects.",
  },
  {
    html: page(`<div class="brand">${MARK}Cumulant</div>
      <div class="mid"><div class="eye" style="margin-bottom:44px;">What the headline misses</div>
      <div style="font-size:78px;line-height:1.1;letter-spacing:-2px;">The towers, not the airwaves, are the hard part.</div>
      <hr class="rule" style="width:84px;margin-top:56px;"></div>
      <div class="foot">cumulant.org</div>`),
    vo: "The real bottleneck isn't the spectrum. It's building the cell towers. The exact part Dish budgeted ten billion dollars for, and then quit.",
  },
  {
    html: page(`<div class="brand">${MARK}Cumulant</div>
      <div class="mid" style="align-items:flex-start;">
      <div class="eye" style="margin-bottom:36px;">Full analysis</div>
      <div style="font-size:64px;line-height:1.12;letter-spacing:-1.5px;margin-bottom:60px;">${esc(a.headline)}</div>
      <div style="display:flex;align-items:center;gap:18px;font-size:56px;"><span style="display:inline-flex;width:64px;height:50px;">${MARK}</span><span class="k">cumulant.org</span></div></div>
      <div class="foot">Cumulant Research</div>`),
    vo: "The full data analysis is at cumulant dot org.",
  },
];

frames.forEach((f, i) => writeFileSync(`${outDir}/f${i}.html`, f.html));
writeFileSync(`${outDir}/vo.json`, JSON.stringify(frames.map((f) => f.vo), null, 2));
console.log(`${frames.length} frames + vo.json -> ${outDir}`);
