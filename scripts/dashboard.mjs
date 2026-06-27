// Cumulant Newsroom dashboard — a local, zero-dependency status board for the
// autonomous agents. Reads live state (published articles, the watcher's
// activity, the pipeline stage in flight, distribution status) and renders an
// auto-refreshing page in the house aesthetic.
//
//   node scripts/dashboard.mjs        (then open http://localhost:4173)
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const ART = join(ROOT, "content", "articles");
const BUILDS = join(ROOT, ".article-builds");
const LOG = join(ROOT, "scripts", "news-watch.log");
const PLIST = join(process.env.HOME, "Library/LaunchAgents/com.cumulant.fieldnote.daily.plist");
const PORT = process.env.DASH_PORT || 4173;
const SITE = "https://cumulant.org";

const STAGES = ["Scout", "Frame", "Field study", "Analysis", "Write", "Critique", "Revise", "Verify", "Publish", "Distribute"];
const PHASE_TO_STAGE = { scout: 0, "frame": 1, "field study": 2, analysis: 3, write: 4, critique: 5, revise: 6, verify: 7 };
const PLATFORMS = [
  ["Reddit", "REDDIT_CLIENT_ID"], ["LinkedIn", "LINKEDIN_ACCESS_TOKEN"], ["X", "X_API_KEY"],
  ["Facebook", "FB_PAGE_TOKEN"], ["Instagram", "IG_TOKEN"],
];

const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function articles() {
  if (!existsSync(ART)) return [];
  return readdirSync(ART).filter((f) => f.endsWith(".json")).map((f) => {
    const a = JSON.parse(read(join(ART, f)));
    return {
      slug: a.slug, headline: a.headline, date: a.date, published: a.published !== false,
      glossary: (a.glossary || []).length, charts: (a.charts || []).length,
      sources: (a.sources || []).length, takeaways: (a.takeaways || []).length,
    };
  }).sort((x, y) => (y.date || "").localeCompare(x.date || "") || x.slug.localeCompare(y.slug));
}

function covered() {
  return read(join(BUILDS, "covered.jsonl")).trim().split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function lockSlug() {
  const p = join(BUILDS, "watch.lock");
  return existsSync(p) ? read(p).trim() : null;
}

function logTail(n) {
  return read(LOG).trim().split("\n").filter((l) => /\] (scanning|WORTHY|Nothing clears|Daily cap|Published|Quality gate|posting|skipped)/.test(l) || /\] (scout|frame|field study|analysis|write|critique|revise|verify)/.test(l)).slice(-n);
}

function currentStage() {
  const lines = read(LOG).trim().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/\]\s*(scout|frame|field study|analysis|write|critique|revise|verify)\b/);
    if (m) return PHASE_TO_STAGE[m[1]];
    if (/Published \+ deployed|Nothing clears|Daily cap|scanning recent/.test(lines[i])) return -1;
  }
  return -1;
}

function connectedPlatforms() {
  const x = read(PLIST);
  return PLATFORMS.map(([name, key]) => [name, x.includes(`<key>${key}</key>`)]);
}

function lastSocial() {
  if (!existsSync(BUILDS)) return null;
  const dirs = readdirSync(BUILDS, { withFileTypes: true }).filter((d) => d.isDirectory());
  let best = null;
  for (const d of dirs) {
    const p = join(BUILDS, d.name, "social-results.json");
    if (existsSync(p)) { const m = (statSafe(p)); if (!best || m > best.m) best = { slug: d.name, m, data: JSON.parse(read(p)) }; }
  }
  return best;
}
function statSafe(p) { try { return statSync(p).mtimeMs; } catch { return 0; } }

function page() {
  const arts = articles();
  const cov = covered();
  const lock = lockSlug();
  const stage = lock ? currentStage() : -1;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = cov.filter((c) => c.date === today).length;
  const avgGloss = arts.length ? Math.round(arts.reduce((s, a) => s + a.glossary, 0) / arts.length) : 0;
  const plats = connectedPlatforms();
  const live = !!lock;

  const stageHtml = STAGES.map((s, i) => {
    const on = live && i === stage;
    const done = live && stage >= 0 && i < stage;
    const col = on ? "#ff2d92" : done ? "#000" : "#cfcfcf";
    return `<div class="stage"><div class="dot" style="background:${col};${on ? "box-shadow:0 0 0 5px rgba(255,45,146,.18)" : ""}"></div><span style="color:${on ? "#000" : "#9a9a9a"}">${s}</span></div>`;
  }).join('<div class="bar"></div>');

  const artRows = arts.map((a) => `<tr>
    <td><a href="${SITE}/articles/${esc(a.slug)}" target="_blank">${esc(a.headline)}</a></td>
    <td class="mono">${esc(a.date)}</td>
    <td class="mono c">${a.charts}</td><td class="mono c">${a.sources}</td>
    <td class="mono c">${a.glossary}</td>
    <td class="mono c">${a.published ? '<span class="ok">live</span>' : "draft"}</td></tr>`).join("");

  const actRows = logTail(12).reverse().map((l) => {
    const m = l.match(/\[(.*?)\]\s*(.*)/);
    const t = m ? m[1].slice(11) : "";
    let txt = m ? m[2] : l;
    let cls = "";
    if (/Published/.test(txt)) cls = "ok"; else if (/WORTHY/.test(txt)) cls = "mag"; else if (/Daily cap|Nothing clears|skipped/.test(txt)) cls = "dim";
    return `<tr><td class="mono dim">${esc(t)}</td><td class="${cls}">${esc(txt.slice(0, 120))}</td></tr>`;
  }).join("");

  const platHtml = plats.map(([n, ok]) => `<span class="pill ${ok ? "pon" : "poff"}">${n} ${ok ? "&bull; on" : "&bull; off"}</span>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="12">
<title>Cumulant Newsroom</title><style>
:root{--mag:#ff2d92;}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#fff;color:#000;font-family:"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;padding:48px 56px;max-width:1080px;margin:0 auto;}
.mono{font-family:ui-monospace,Menlo,monospace;}
header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e6e6e6;padding-bottom:20px;}
.logo{display:flex;align-items:center;gap:12px;font-size:24px;letter-spacing:-.4px;}
.logo svg{width:30px;height:24px;}
.badge{font-family:ui-monospace,monospace;font-size:12px;text-transform:uppercase;letter-spacing:.1em;padding:7px 13px;border-radius:999px;}
.bon{background:var(--mag);color:#fff;} .bidle{background:#f0f0f0;color:#8a8a8a;}
h2{font-family:ui-monospace,monospace;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#9a9a9a;margin:42px 0 18px;}
.pipe{display:flex;align-items:center;}
.stage{display:flex;flex-direction:column;align-items:center;gap:10px;font-size:12px;text-align:center;width:74px;}
.stage .dot{width:13px;height:13px;border-radius:50%;transition:.3s;}
.bar{flex:1;height:1px;background:#e6e6e6;margin-bottom:22px;}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
.kpi{border:1px solid #e6e6e6;border-radius:12px;padding:20px;}
.kpi .n{font-size:40px;letter-spacing:-1.5px;} .kpi .l{font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9a9a9a;margin-top:6px;}
table{width:100%;border-collapse:collapse;font-size:14px;}
td,th{text-align:left;padding:11px 10px;border-bottom:1px solid #efefef;vertical-align:top;}
th{font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#bcbcbc;font-weight:400;}
td.c{text-align:center;width:54px;} a{color:#000;text-decoration:none;border-bottom:1px solid #ddd;} a:hover{border-color:var(--mag);}
.ok{color:#0a8f3c;} .mag{color:var(--mag);} .dim{color:#b0b0b0;}
.pill{display:inline-block;font-family:ui-monospace,monospace;font-size:12px;padding:7px 13px;border-radius:999px;margin-right:8px;}
.pon{background:#eafaf0;color:#0a8f3c;} .poff{background:#f4f4f4;color:#b0b0b0;}
.foot{margin-top:46px;font-family:ui-monospace,monospace;font-size:11px;color:#bcbcbc;}
</style></head><body>
<header>
  <div class="logo"><svg viewBox="0 0 30 24" fill="none"><path d="M2.5 18.6H27.5" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-opacity=".35"/><path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke="#000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23.4" cy="15" r="1.7" fill="#000"/></svg>Cumulant Newsroom</div>
  <div class="badge ${live ? "bon" : "bidle"}">${live ? "writing now" : "idle - scanning hourly"}</div>
</header>

<h2>Pipeline ${live ? `&middot; ${esc(lock)}` : ""}</h2>
<div class="pipe">${stageHtml}</div>

<h2>At a glance</h2>
<div class="cards">
  <div class="kpi"><div class="n">${arts.length}</div><div class="l">articles live</div></div>
  <div class="kpi"><div class="n">${todayCount}<span style="font-size:20px;color:#bcbcbc"> / 4</span></div><div class="l">published today</div></div>
  <div class="kpi"><div class="n">${avgGloss}</div><div class="l">avg glossary terms</div></div>
  <div class="kpi"><div class="n">${esc((arts[0] && arts[0].date) || "-")}</div><div class="l">last published</div></div>
</div>

<h2>Articles</h2>
<table><tr><th>Headline</th><th>Date</th><th class="c">Ch</th><th class="c">Src</th><th class="c">Gl</th><th class="c">Status</th></tr>${artRows}</table>

<h2>Watcher activity</h2>
<table>${actRows || '<tr><td class="dim">no activity logged yet</td></tr>'}</table>

<h2>Distribution</h2>
<div>${platHtml}</div>

<div class="foot">auto-refreshes every 12s &middot; ${esc(new Date().toString().slice(0, 24))}</div>
</body></html>`;
}

createServer((req, res) => {
  if (req.url === "/favicon.ico") { res.writeHead(204).end(); return; }
  try { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(page()); }
  catch (e) { res.writeHead(500).end(String(e)); }
}).listen(PORT, () => console.log(`Cumulant Newsroom dashboard -> http://localhost:${PORT}`));
