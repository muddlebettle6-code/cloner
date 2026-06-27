#!/usr/bin/env node
/**
 * Build a 9:16 motion reel from a deck's saved storyboard (carousel-<slug>/storyboard.json).
 * Tells the SAME story as the carousel, in the fast finance-reel style: a natural
 * OpenAI voiceover, Ken Burns motion on the colorful photos, kinetic captions that
 * rise + fade in synced to the voice, the Cumulant mark, crossfade cuts, and a
 * music bed. No robotic TTS, no slideshow.
 *
 *   node scripts/social-reel.mjs <deck-dir> [out.mp4]
 * env: OPENAI_API_KEY (natural voice), REEL_VOICE=nova, REEL_MUSIC=/path/to.mp3 (optional)
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const [, , deckDir, outArg] = process.argv;
if (!deckDir) { console.error("usage: social-reel.mjs <deck-dir> [out.mp4]"); process.exit(1); }
const ROOT = "/Users/aryanpatel/cloner";
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VOICE = process.env.REEL_VOICE || "nova";
const FPS = 30, W = 1080, H = 1920, MAG = "#ff2d92";
const sb = JSON.parse(readFileSync(join(deckDir, "storyboard.json"), "utf8"));
const out = outArg || join(deckDir, "reel.mp4");
const tmp = join(deckDir, ".reel");
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });

const KEY = (() => {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try { return readFileSync(`${process.env.HOME}/Desktop/FCRI/.env`, "utf8").match(/^OPENAI_API_KEY=(.+)$/m)[1].trim().replace(/['"]/g, ""); } catch { return null; }
})();
const NEUE = readFileSync(join(ROOT, "public/fonts/NeueHaasUnica-Regular.woff2")).toString("base64");
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
const ff = (args) => execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

// ---- natural voiceover (OpenAI TTS, falls back to macOS `say`) ------------ //
function narrate(text, i) {
  const mp3 = join(tmp, `v${i}.mp3`);
  if (KEY) {
    try {
      execFileSync("curl", ["-s", "https://api.openai.com/v1/audio/speech",
        "-H", `Authorization: Bearer ${KEY}`, "-H", "Content-Type: application/json",
        "-d", JSON.stringify({ model: "gpt-4o-mini-tts", voice: VOICE, input: text, instructions: "Confident, natural news-explainer delivery; clear and engaging, not robotic." }),
        "-o", mp3], { stdio: "ignore" });
      if (existsSync(mp3) && dur(mp3) > 0.3) return mp3;
    } catch { /* fall back */ }
  }
  const aiff = join(tmp, `v${i}.aiff`);
  try { execFileSync("say", ["-v", "Evan (Enhanced)", "-o", aiff, text]); } catch { execFileSync("say", ["-o", aiff, text]); }
  ff(["-i", aiff, mp3]); return mp3;
}

// ---- frame layers (rendered transparent via headless Chrome) -------------- //
const css = `@font-face{font-family:'Neue';src:url(data:font/woff2;base64,${NEUE}) format('woff2');font-weight:400;font-display:block;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
html,body{width:${W}px;height:${H}px;background:transparent;font-family:'Neue','Helvetica Neue',Arial,sans-serif;}
.f{position:relative;width:${W}px;height:${H}px;overflow:hidden;}`;
function shot(html, file) {
  const f = join(tmp, "x.html"); writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--default-background-color=00000000", `--screenshot=${file}`, `--window-size=${W},${H}`, `file://${f}`], { stdio: "ignore" });
}
// the scrim + Cumulant wordmark (static overlay, rendered once)
const scrim = join(tmp, "scrim.png");
shot(`<div class="f"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.12) 13%,rgba(0,0,0,0) 36%,rgba(0,0,0,.5) 62%,rgba(0,0,0,.93) 100%)"></div><div style="position:absolute;top:92px;left:0;right:0;text-align:center;color:#fff;font-size:48px;letter-spacing:-.01em">Cumulant<span style="color:${MAG}">.</span></div></div>`, scrim);
function captionPng(text, i, big, end) {
  const f = join(tmp, `cap${i}.png`);
  const n = String(text).length;
  const size = end ? 60 : big ? (n > 70 ? 78 : n > 40 ? 100 : 122) : (n > 90 ? 60 : n > 56 ? 72 : n > 30 ? 88 : 104);
  const pos = end ? `top:50%;transform:translateY(-50%);text-align:center` : `bottom:330px`;
  const inner = end
    ? `<div style="color:#fff;font-size:96px;letter-spacing:-.02em">Cumulant<span style="color:${MAG}">.</span></div><div style="color:${MAG};font-size:56px;line-height:1.15;margin-top:44px">${esc(text)}</div><div style="color:rgba(255,255,255,.72);font-size:34px;margin-top:40px">Follow for the analysis behind the headlines</div>`
    : `<div style="color:${MAG};font-size:${size}px;line-height:1.06;letter-spacing:-.02em;text-shadow:0 3px 30px rgba(0,0,0,.6)">${esc(text)}</div>`;
  shot(`<div class="f"><div style="position:absolute;left:84px;right:84px;${pos}">${inner}</div></div>`, f);
  return f;
}

// ---- per-scene clip: Ken Burns photo + scrim + rising caption ------------- //
function scene(i, photoPath, capPng, secs) {
  const clip = join(tmp, `s${i}.mp4`);
  const frames = Math.round(secs * FPS);
  const fc = [
    `[0:v]scale=1296:2304,zoompan=z='min(zoom+0.0008,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},trim=end_frame=${frames},setsar=1[bg]`,
    `[bg][1:v]overlay=0:0:shortest=1[bs]`,
    `[2:v]fade=in:st=0:d=0.45:alpha=1[cap]`,
    `[bs][cap]overlay=0:'max(0,(1-min(t/0.45,1))*90)'[v]`,
  ].join(";");
  ff(["-loop", "1", "-i", photoPath, "-loop", "1", "-i", scrim, "-loop", "1", "-i", capPng,
    "-filter_complex", fc, "-map", "[v]", "-frames:v", String(frames), "-r", String(FPS),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", clip]);
  return { clip, secs };
}

// ---- assemble ------------------------------------------------------------- //
const imgs = (sb.images || []).filter(Boolean);
const slides = sb.slides || [];
const scenes = [], voClips = [];
slides.forEach((sl, i) => {
  const text = String(sl.text || "");
  const end = sl.role === "cta" || i === slides.length - 1;
  const v = narrate(text, i);
  const secs = Math.round((dur(v) + 0.55) * 100) / 100;
  const cap = captionPng(text, i, i === 0, end);
  const photo = imgs[i % imgs.length];
  scenes.push(scene(i, photo, cap, secs));
  voClips.push({ v, secs });
  process.stdout.write(`  scene ${i + 1}/${slides.length} (${secs}s)\n`);
});

// crossfade-concat the video scenes
let vcur = scenes[0].clip, acc = scenes[0].secs;
for (let i = 1; i < scenes.length; i++) {
  const next = join(tmp, `x${i}.mp4`);
  const off = Math.max(0.1, acc - 0.35);
  ff(["-i", vcur, "-i", scenes[i].clip, "-filter_complex", `[0:v][1:v]xfade=transition=fade:duration=0.35:offset=${off},format=yuv420p[v]`, "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", next]);
  vcur = next; acc = acc + scenes[i].secs - 0.35;
}
// build the voiceover track at the scene offsets, then mux (+ music bed if provided)
const aArgs = [], aMaps = []; let t = 0;
voClips.forEach((c, i) => { aArgs.push("-i", c.v); aMaps.push(`[${i}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[a${i}]`); t += c.secs - (i < voClips.length - 1 ? 0.35 : 0); });
const mixIn = voClips.map((_, i) => `[a${i}]`).join("");
const voTrack = join(tmp, "vo.m4a");
ff([...aArgs, "-filter_complex", `${aMaps.join(";")};${mixIn}amix=inputs=${voClips.length}:normalize=0[a]`, "-map", "[a]", voTrack]);

const music = process.env.REEL_MUSIC;
if (music && existsSync(music)) {
  ff(["-i", vcur, "-i", voTrack, "-stream_loop", "-1", "-i", music, "-filter_complex", "[2:a]volume=0.10[m];[1:a][m]amix=inputs=2:duration=first[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-shortest", out]);
} else {
  ff(["-i", vcur, "-i", voTrack, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-shortest", out]);
}
console.log(`\nReel -> ${out}  (${Math.round(dur(out) * 10) / 10}s, ${KEY ? "OpenAI " + VOICE + " voice" : "say voice"})`);
