// Render a Bloomberg-style social CAROUSEL from an article, in the Cumulant
// aesthetic: pure white/black/grey, Neue Haas Unica + Akkurat Mono, a restrained
// magenta accent, the distribution logo mark. Instagram/Facebook feed format
// 4:5 (1080x1350). Emits self-contained HTML (fonts embedded) per card; a
// headless-Chrome step rasterises each at high DPI (4K-crisp) to PNG.
//
//   node scripts/social-cards.mjs <article.json> <out-dir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [, , articlePath, outDir = "."] = process.argv;
const a = JSON.parse(readFileSync(articlePath, "utf8"));
mkdirSync(outDir, { recursive: true });

const FONT_DIR = "/Users/aryanpatel/cloner/public/fonts";
const neue = readFileSync(`${FONT_DIR}/NeueHaasUnica-Regular.woff2`).toString("base64");
const mono = readFileSync(`${FONT_DIR}/Akkurat-Mono.woff2`).toString("base64");

const W = 1080, H = 1350; // 4:5 Instagram / Facebook feed

const MARK = `<svg viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.5 18.6H27.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.35"/>
  <path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="23.4" cy="15" r="1.7" fill="currentColor"/></svg>`;

const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const fmtDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
};
const num = (n) => (Math.abs(n) >= 1000 ? Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }) : String(Math.round(n * 100) / 100));

const eyebrow = `${(a.tags?.[0] || "Analysis")}  ·  ${fmtDate(a.date)}`;
const keynum = a.charts?.find((c) => c.kind === "keynumber")?.data || {};
const bar = a.charts?.find((c) => c.kind === "bar" || c.kind === "comparison");
const takeaway = (a.takeaways && a.takeaways[1]) || (a.takeaways && a.takeaways[0]) || a.deck;
const source = (a.charts?.[0]?.source || "Cumulant Research analysis").replace(/\s*\([^)]*\)/g, "").split(";")[0].slice(0, 52);

const HEAD = `<meta charset="utf-8"><style>
@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${neue}) format('woff2');font-weight:400;font-display:block;}
@font-face{font-family:'Mono';src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:400;font-display:block;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;}
body{background:#fff;color:#000;font-family:'Neue','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}
.card{width:${W}px;height:${H}px;padding:84px 80px;display:flex;flex-direction:column;position:relative;}
.top{display:flex;align-items:center;justify-content:space-between;}
.brand{display:flex;align-items:center;gap:13px;font-size:32px;letter-spacing:-0.4px;}
.brand svg{width:42px;height:34px;color:#000;}
.idx{font-family:'Mono',monospace;font-size:22px;color:#bdbdbd;letter-spacing:0.05em;}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;}
.eye{font-family:'Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:#909090;font-size:25px;}
.rule{height:5px;background:#ff2d92;border:0;}
.foot{display:flex;justify-content:space-between;align-items:flex-end;font-family:'Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#909090;font-size:21px;}
.k{color:#ff2d92;}
</style>`;

const page = (inner) => `<!doctype html><html><head>${HEAD}</head><body><div class="card">${inner}</div></body></html>`;
const brand = (idx) => `<div class="top"><div class="brand">${MARK}Cumulant</div><div class="idx">${idx}</div></div>`;

function barCard(idx) {
  if (!bar) return null;
  const bars = (bar.data?.bars || []).slice(0, 5);
  const vals = bars.map((b) => Number(b.value) || 0);
  const max = Math.max(bar.data?.max || 0, ...vals, 1);
  const rows = bars.map((b) => {
    const v = Number(b.value) || 0;
    const w = Math.max((v / max) * 100, 1.5);
    const col = b.highlight ? "#ff2d92" : "#111";
    return `<div style="margin-bottom:48px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;">
        <span style="font-size:33px;">${esc(b.label)}</span>
        <span style="font-family:'Mono',monospace;font-size:38px;">${esc(num(v))}</span>
      </div>
      <div style="height:30px;background:#f1f1f1;"><div style="height:30px;width:${w}%;background:${col};"></div></div>
    </div>`;
  }).join("");
  return page(`${brand(idx)}
    <div class="mid">
      <div class="eye" style="margin-bottom:18px;">${esc(bar.title)}</div>
      ${bar.subtitle ? `<div style="font-size:30px;color:#5a5a5a;line-height:1.32;margin-bottom:54px;">${esc(bar.subtitle)}</div>` : '<div style="height:30px;"></div>'}
      ${rows}
    </div>
    <div class="foot"><span>cumulant.org</span><span>${esc(bar.units || "")}</span></div>`);
}

const cards = {
  "01-cover": page(`${brand("1 / 5")}
    <div class="mid">
      <div class="eye" style="margin-bottom:30px;">${esc(eyebrow)}</div>
      <hr class="rule" style="width:74px;margin-bottom:44px;">
      <div style="font-size:84px;line-height:1.02;letter-spacing:-3px;">${esc(a.headline)}</div>
    </div>
    <div class="foot"><span>cumulant.org</span><span class="k">swipe &rarr;</span></div>`),

  "02-stat": page(`${brand("2 / 5")}
    <div class="mid">
      <div class="eye" style="margin-bottom:34px;">The number</div>
      <div style="font-size:250px;line-height:0.82;letter-spacing:-10px;">${esc(keynum.value || "$19.6B")}</div>
      <hr class="rule" style="width:74px;margin:48px 0 38px;">
      <div style="font-size:46px;line-height:1.2;max-width:90%;">${esc(keynum.label || "paid for spectrum that already failed to build a network once")}</div>
    </div>
    <div class="foot"><span>cumulant.org</span><span>${esc(source)}</span></div>`),

  "03-chart": barCard("3 / 5"),

  "04-finding": page(`${brand("4 / 5")}
    <div class="mid">
      <div class="eye" style="margin-bottom:40px;">What the headline misses</div>
      <div style="font-size:62px;line-height:1.12;letter-spacing:-1.6px;">${esc(takeaway)}</div>
      <hr class="rule" style="width:74px;margin-top:52px;">
    </div>
    <div class="foot"><span>cumulant.org</span><span>${esc(source)}</span></div>`),

  "05-cta": page(`${brand("5 / 5")}
    <div class="mid" style="align-items:flex-start;">
      <div style="font-size:30px;color:#909090;font-family:'Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:30px;">Full analysis</div>
      <div style="font-size:54px;line-height:1.1;letter-spacing:-1.4px;margin-bottom:46px;">${esc(a.headline)}</div>
      <div style="display:flex;align-items:center;gap:16px;font-size:44px;"><span style="display:inline-flex;width:52px;height:42px;color:#000;">${MARK}</span><span class="k">cumulant.org</span></div>
    </div>
    <div class="foot"><span>Cumulant Research</span><span>${esc(fmtDate(a.date))}</span></div>`),
};

const manifest = [];
for (const [name, html] of Object.entries(cards)) {
  if (!html) continue;
  writeFileSync(`${outDir}/${name}.html`, html);
  manifest.push(name);
  console.log(`${outDir}/${name}.html`);
}
writeFileSync(`${outDir}/manifest.json`, JSON.stringify({ slug: a.slug, w: W, h: H, cards: manifest }, null, 2));
