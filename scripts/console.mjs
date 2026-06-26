#!/usr/bin/env node
// Cumulant review console — browser dashboard for the draft queue.
//
//   npm run console            then open http://localhost:4040
//
// Sign-in (opt-in): set CONSOLE_PASSWORD (one shared password) or CONSOLE_USERS
// ("email:pass,email:pass") to require login. With neither set it is open, for
// local use. See docs/HOSTING.md to put it online with employee sign-in.
//
// Zero dependencies (Node stdlib).
import { createServer } from "node:http";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const ROOT = process.cwd();
const PORT = Number(process.env.CONSOLE_PORT || 4040);
const STORES = {
  paper: { dir: join(ROOT, "content", "papers"), label: "Papers" },
  note: { dir: join(ROOT, "content", "notes"), label: "Field Notes" },
};

// ----------------------------------------------------------------- auth (opt-in)
function authConfig() {
  const usersEnv = process.env.CONSOLE_USERS;
  const pass = process.env.CONSOLE_PASSWORD;
  if (usersEnv) {
    const map = new Map(
      usersEnv.split(",").map((pair) => {
        const i = pair.indexOf(":");
        return [pair.slice(0, i).trim(), pair.slice(i + 1)];
      })
    );
    return { enabled: true, check: (u, p) => map.has(u) && map.get(u) === p };
  }
  if (pass) return { enabled: true, check: (_u, p) => p === pass };
  return { enabled: false, check: () => true };
}
const AUTH = authConfig();
const sessions = new Set();
function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("=");
    if (i > 0) out[c.slice(0, i).trim()] = c.slice(i + 1).trim();
  });
  return out;
}
const authed = (req) => !AUTH.enabled || sessions.has(cookies(req).cu_sid || "");

// ----------------------------------------------------------------- data
function load(type) {
  let files = [];
  try {
    files = readdirSync(STORES[type].dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files.map((f) => {
    const data = JSON.parse(readFileSync(join(STORES[type].dir, f), "utf8"));
    return {
      type,
      slug: data.slug || f.replace(/\.json$/, ""),
      title: data.title,
      published: data.published !== false,
      kind: data.kind,
      date: data.date || "",
      status: data.status || "",
      data,
    };
  });
}
function allItems() {
  const items = [...load("paper"), ...load("note")];
  items.sort((a, b) => (a.published ? 1 : 0) - (b.published ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
  return items;
}
function setPublished(type, slug, published) {
  if (!STORES[type]) return false;
  const fp = join(STORES[type].dir, `${slug}.json`);
  if (!existsSync(fp)) return false;
  const data = JSON.parse(readFileSync(fp, "utf8"));
  data.published = published;
  writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
  return true;
}

const sendJson = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};
async function readBody(req) {
  let b = "";
  for await (const c of req) b += c;
  return b;
}

const LOGIN_PAGE = (msg) => `<!doctype html><meta charset="utf-8"><title>Cumulant Console</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font:15px -apple-system,system-ui,sans-serif;background:#f4f2ec;color:#1a1a1a}
form{background:#fff;border:1px solid #e4e0d8;border-radius:10px;padding:32px;width:320px}
h1{font-size:18px;margin:0 0 4px}.s{font:11px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.05em;color:#6b6b6b}
input{width:100%;margin-top:12px;padding:10px;border:1px solid #e4e0d8;border-radius:6px;font:inherit}
button{width:100%;margin-top:14px;padding:11px;border:none;border-radius:6px;background:#1a1a1a;color:#fff;font:inherit;cursor:pointer}
.m{color:#b00;font-size:13px;margin-top:10px}</style>
<form method="POST" action="/login"><span class="s">Cumulant</span><h1>Console sign-in</h1>
<input name="user" placeholder="Email (if set up)" autocomplete="username">
<input name="password" type="password" placeholder="Password" autocomplete="current-password" autofocus>
<button>Sign in</button>${msg ? `<div class="m">${msg}</div>` : ""}</form>`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (AUTH.enabled) {
      if (url.pathname === "/login") {
        if (req.method === "GET") {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(LOGIN_PAGE(""));
        }
        if (req.method === "POST") {
          const params = new URLSearchParams(await readBody(req));
          if (AUTH.check(params.get("user") || "", params.get("password") || "")) {
            const sid = randomUUID();
            sessions.add(sid);
            res.writeHead(302, { "Set-Cookie": `cu_sid=${sid}; HttpOnly; SameSite=Lax; Path=/`, Location: "/" });
            return res.end();
          }
          res.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(LOGIN_PAGE("Incorrect credentials."));
        }
      }
      if (url.pathname === "/logout") {
        sessions.delete(cookies(req).cu_sid || "");
        res.writeHead(302, { "Set-Cookie": "cu_sid=; Max-Age=0; Path=/", Location: "/login" });
        return res.end();
      }
      if (!authed(req)) {
        res.writeHead(302, { Location: "/login" });
        return res.end();
      }
    }

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(PAGE);
    }
    if (req.method === "GET" && url.pathname === "/api/items") {
      return sendJson(res, 200, { items: allItems().map(({ data: _d, ...r }) => r) });
    }
    if (req.method === "GET" && url.pathname === "/api/item") {
      const it = load(url.searchParams.get("type") || "").find((i) => i.slug === url.searchParams.get("slug"));
      return it ? sendJson(res, 200, it.data) : sendJson(res, 404, { error: "not found" });
    }
    if (req.method === "POST" && url.pathname === "/api/publish") {
      const { type, slug, published } = JSON.parse((await readBody(req)) || "{}");
      const ok = setPublished(type, slug, !!published);
      return sendJson(res, ok ? 200 : 404, { ok });
    }
    if (req.method === "POST" && url.pathname === "/api/save") {
      const { type, slug, json: text } = JSON.parse((await readBody(req)) || "{}");
      if (!STORES[type]) return sendJson(res, 400, { error: "unknown type" });
      if (!/^[a-z0-9-]+$/.test(slug || "")) return sendJson(res, 400, { error: "bad slug" });
      const fp = join(STORES[type].dir, `${slug}.json`);
      if (!existsSync(fp)) return sendJson(res, 404, { error: "not found" });
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return sendJson(res, 400, { error: "Invalid JSON: " + e.message });
      }
      data.slug = slug;
      writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === "POST" && url.pathname === "/api/generate") {
      const child = spawn("bash", ["scripts/daily-field-note.sh"], { cwd: ROOT, detached: true, stdio: "ignore" });
      child.unref();
      return sendJson(res, 200, { started: true });
    }
    if (req.method === "POST" && url.pathname === "/api/build") {
      const child = spawn("npm", ["run", "build"], { cwd: ROOT });
      let out = "";
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (out += d));
      child.on("close", (code) => sendJson(res, 200, { code, tail: out.slice(-800) }));
      return;
    }
    res.writeHead(404);
    res.end("not found");
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Cumulant review console  ->  http://localhost:${PORT}`);
  console.log(`  ${AUTH.enabled ? "sign-in required" : "open (no sign-in; set CONSOLE_PASSWORD to gate it)"}\n`);
});

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Cumulant Console</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--ink:#1a1a1a;--smoke:#6b6b6b;--clay:#e4e0d8;--stone:#f4f2ec;--mag:#ff2d92}
  *{box-sizing:border-box}body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:#fff}
  .mono{font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.04em;color:var(--smoke)}
  a{color:var(--smoke);text-decoration:none}a:hover{opacity:.7}
  header{display:flex;align-items:baseline;gap:14px;padding:22px 28px;border-bottom:1px solid var(--clay)}
  header h1{font-size:18px;margin:0;font-weight:600}
  main{max-width:980px;margin:0 auto;padding:28px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--smoke);margin:34px 0 6px;font-weight:600}
  .row{display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid var(--clay)}
  .row:last-child{border-bottom:1px solid var(--clay)}
  .badge{flex:none;width:54px;text-align:center;padding:4px 0;border-radius:4px;font:10px/1 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.04em}
  .draft{background:#fef3c7;color:#92560a}.live{background:#e7f3ec;color:#1c7a45}
  .grow{flex:1;min-width:0}.title{font-size:16px;line-height:1.25}.meta{margin-top:3px}
  button{font:inherit;font-size:13px;border:1px solid var(--ink);background:#fff;color:var(--ink);border-radius:5px;padding:7px 13px;cursor:pointer;white-space:nowrap}
  button:hover{opacity:.7}button.pri{background:var(--ink);color:#fff}button.ghost{border-color:var(--clay);color:var(--smoke)}
  .bar{display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap}
  #drawer{position:fixed;top:0;right:0;height:100%;width:min(580px,94vw);background:#fff;border-left:1px solid var(--clay);box-shadow:-12px 0 40px rgba(0,0,0,.06);transform:translateX(100%);transition:transform .25s;overflow:auto;padding:28px}
  #drawer.open{transform:none}#drawer h3{font-size:22px;line-height:1.15;margin:14px 0 4px}
  #drawer p{margin:8px 0}.sec{margin-top:18px;padding-top:14px;border-top:1px solid var(--clay)}
  .x{position:absolute;top:18px;right:22px;border:none;background:none;font-size:22px;color:var(--smoke);cursor:pointer}
  .pill{display:inline-block;background:var(--stone);border-radius:20px;padding:3px 10px;margin:2px 4px 2px 0;font-size:12px}
  textarea{width:100%;height:34vh;font:12px/1.5 ui-monospace,monospace;border:1px solid var(--clay);border-radius:6px;padding:12px}
  .lp{border:1px solid var(--clay);border-radius:6px;padding:14px 16px;margin-top:8px;max-height:36vh;overflow:auto;transition:opacity .15s}
  .lp h3{font-size:18px;margin:6px 0 2px}
  #toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;opacity:0;transition:opacity .2s;max-width:80vw}
  #toast.show{opacity:1}
</style></head><body>
<header><h1>Cumulant Console</h1><span class="mono">review queue</span><span class="grow"></span>
  <button class="ghost" id="gen">Generate note</button><button class="ghost" id="build">Rebuild site</button>
  ${AUTH.enabled ? '<a class="mono" href="/logout" style="margin-left:6px">Sign out</a>' : ""}</header>
<main id="app"><p class="mono">loading...</p></main>
<div id="drawer"><button class="x" onclick="closeDrawer()">&times;</button><div id="dbody"></div></div>
<div id="toast"></div>
<script>
const A=document.getElementById('app'),D=document.getElementById('drawer'),DB=document.getElementById('dbody'),T=document.getElementById('toast');
function toast(m){T.textContent=m;T.classList.add('show');setTimeout(()=>T.classList.remove('show'),2400)}
function esc(s){return (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
async function load(){
  const {items}=await (await fetch('/api/items')).json();
  const groups={paper:'Papers',note:'Field Notes'};
  let html='';
  for(const [type,label] of Object.entries(groups)){
    const list=items.filter(i=>i.type===type);
    html+='<h2>'+label+' &middot; '+list.filter(i=>!i.published).length+' draft</h2>';
    if(!list.length){html+='<p class="mono" style="padding:14px 0">none</p>';continue}
    for(const i of list){
      const action=i.published
        ?'<button onclick="toggle(\\''+type+'\\',\\''+i.slug+'\\',false)">Unpublish</button>'
        :'<button class="pri" onclick="publishBuild(\\''+type+'\\',\\''+i.slug+'\\')">Publish &amp; build</button>';
      html+='<div class="row"><span class="badge '+(i.published?'live':'draft')+'">'+(i.published?'live':'draft')+'</span>'
        +'<div class="grow"><div class="title">'+esc(i.title)+'</div>'
        +'<div class="mono meta">'+esc(i.status||i.kind||'')+(i.date?' &middot; '+esc(i.date):'')+' &middot; '+esc(i.slug)+'</div></div>'
        +'<button class="ghost" onclick="preview(\\''+type+'\\',\\''+i.slug+'\\')">Preview</button>'+action+'</div>';
    }
  }
  A.innerHTML=html;
}
async function toggle(type,slug,published){
  await fetch('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,slug,published})});
  toast(published?'Published. Rebuild + push to go live.':'Moved to draft.');load();
}
async function publishBuild(type,slug){
  await fetch('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,slug,published:true})});
  toast('Published. Building the site...');load();
  const r=await (await fetch('/api/build',{method:'POST'})).json();
  toast(r.code===0?'Published and built. Push the cumulant repo to deploy.':'Published, but the build failed (see terminal).');
}
function readable(d,type){
  let h='<span class="mono">'+esc(d.status||(type==='note'?'Field note':''))+(d.date?' &middot; '+esc(d.date):'')+'</span><h3>'+esc(d.title||'(untitled)')+'</h3>';
  if(d.dek)h+='<p>'+esc(d.dek)+'</p>';
  if(d.subtitle)h+='<p>'+esc(d.subtitle)+'</p>';
  (d.tags||[]).forEach(t=>h+='<span class="pill">'+esc(t)+'</span>');
  if(d.question)h+='<div class="sec"><span class="mono">The question</span><p>'+esc(d.question)+'</p></div>';
  if(d.abstract)h+='<div class="sec"><span class="mono">Abstract</span><p>'+esc(d.abstract)+'</p></div>';
  (d.sections||[]).forEach(s=>h+='<div class="sec"><span class="mono">'+esc(s.heading)+'</span><p>'+esc(s.body)+'</p></div>');
  if(d.contributions)h+='<div class="sec"><span class="mono">Key findings</span>'+d.contributions.map(c=>'<p>&middot; '+esc(c)+'</p>').join('')+'</div>';
  if(d.takeaways)h+='<div class="sec"><span class="mono">Takeaways</span>'+d.takeaways.map(c=>'<p>&middot; '+esc(c)+'</p>').join('')+'</div>';
  if(d.honesty)h+='<div class="sec"><span class="mono">How to read this</span>'+d.honesty.map(c=>'<p class="mono" style="text-transform:none">'+esc(c)+'</p>').join('')+'</div>';
  return h;
}
async function preview(type,slug){
  const d=await (await fetch('/api/item?type='+type+'&slug='+encodeURIComponent(slug))).json();
  window.cur={type,slug,d};
  DB.innerHTML='<div class="bar"><button class="ghost" onclick="editMode()">Edit JSON</button></div>'+readable(d,type);
  D.classList.add('open');
}
function closeDrawer(){D.classList.remove('open')}
function editMode(){
  const c=window.cur;
  DB.innerHTML='<div class="bar"><button class="pri" onclick="saveEdit()">Save</button><button class="ghost" onclick="preview(window.cur.type,window.cur.slug)">Cancel</button></div>'
    +'<p class="mono" style="text-transform:none">Editing '+esc(c.slug)+' (slug is fixed). Save writes the file; rebuild + push to go live.</p>'
    +'<textarea id="ed" oninput="livePreview()"></textarea>'
    +'<div class="mono" style="margin-top:14px">Live preview</div><div id="lp" class="lp"></div>';
  document.getElementById('ed').value=JSON.stringify(c.d,null,2);
  livePreview();
}
function livePreview(){
  const lp=document.getElementById('lp');
  try{const d=JSON.parse(document.getElementById('ed').value);lp.innerHTML=readable(d,window.cur.type);lp.style.opacity=1}
  catch(e){lp.style.opacity=.35}
}
async function saveEdit(){
  const c=window.cur, text=document.getElementById('ed').value;
  try{JSON.parse(text)}catch(e){toast('Invalid JSON: '+e.message);return}
  const r=await (await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:c.type,slug:c.slug,json:text})})).json();
  if(r.ok){toast('Saved.');preview(c.type,c.slug);load()}else{toast(r.error||'Save failed')}
}
function generate(){
  const b=document.getElementById('gen');b.textContent='Generating...';b.disabled=true;
  fetch('/api/generate',{method:'POST'}).then(()=>{
    toast('Generating in the background (~1-2 min). The new draft will appear here.');
    setTimeout(()=>{b.textContent='Generate note';b.disabled=false;load()},95000);
  }).catch(()=>{b.textContent='Generate note';b.disabled=false;toast('Could not start generation.')});
}
document.getElementById('gen').onclick=generate;
document.getElementById('build').onclick=async function(){this.textContent='Building...';this.disabled=true;
  const r=await (await fetch('/api/build',{method:'POST'})).json();
  this.textContent='Rebuild site';this.disabled=false;toast(r.code===0?'Build OK. Now push the repo.':'Build failed (see terminal).');};
load();
</script></body></html>`;
