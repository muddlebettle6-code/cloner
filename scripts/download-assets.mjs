// Downloads all Seed Health assets (themed images, fonts, favicon) into public/.
// Images come from Contentful (images.ctfassets.net); we request webp (jpg) / png (icons).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public/images');
const FONT_DIR = path.join(ROOT, 'public/fonts');
const SEO_DIR = path.join(ROOT, 'public/seo');

// JSON files were saved double-encoded (a JSON string). Parse twice.
async function loadJson(p) {
  const raw = await readFile(p, 'utf8');
  let v = JSON.parse(raw);
  if (typeof v === 'string') v = JSON.parse(v);
  return v;
}

function assetId(url) {
  // https://images.ctfassets.net/oq6r31hkrb9r/<ASSETID>/<HASH>/<file>
  const m = url.match(/ctfassets\.net\/[^/]+\/([^/]+)\//);
  return m ? m[1] : null;
}
function isPng(url) { return /\.png(\?|$)/i.test(url) || /icon-|allo-graphic/i.test(url); }

function localNameFor(url) {
  const id = assetId(url);
  const base = decodeURIComponent(url.split('/').pop().split('?')[0]).replace(/\.[a-z0-9]+$/i, '');
  const slug = (id || base).replace(/[^a-zA-Z0-9_-]/g, '');
  return isPng(url) ? `${slug}.png` : `${slug}.webp`;
}
function cdnUrl(url) {
  const clean = url.split('?')[0];
  return isPng(url) ? `${clean}?fm=png&w=1400` : `${clean}?fm=webp&w=2000&q=80`;
}

async function download(url, dest) {
  if (existsSync(dest)) return { ok: true, skipped: true };
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return { ok: false, status: res.status, url };
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return { ok: true, bytes: buf.length };
  } catch (e) { return { ok: false, error: String(e), url }; }
}

async function batch(items, fn, size = 5) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...await Promise.all(items.slice(i, i + size).map(fn)));
  }
  return out;
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(FONT_DIR, { recursive: true });
  await mkdir(SEO_DIR, { recursive: true });

  // 1. Collect image URLs
  const manifest = await loadJson(path.join(ROOT, 'docs/research/seedhealth.com/theme-image-manifest.json'));
  const programs = await loadJson(path.join(ROOT, 'docs/research/seedhealth.com/programs-tabs.json'));
  const urls = new Set();
  for (const theme of Object.keys(manifest)) for (const { url } of manifest[theme]) if (url) urls.add(url);
  for (const k of Object.keys(programs)) if (programs[k].img) urls.add(programs[k].img);

  const urlList = [...urls];
  console.log(`Images to fetch: ${urlList.length}`);
  const map = {};
  const imgResults = await batch(urlList, async (url) => {
    const name = localNameFor(url);
    map[url] = `/images/${name}`;
    const r = await download(cdnUrl(url), path.join(IMG_DIR, name), name);
    if (!r.ok) console.log('  FAIL', name, r.status || r.error);
    return r;
  }, 6);

  await writeFile(path.join(IMG_DIR, '_url-map.json'), JSON.stringify(map, null, 2));

  // 2. Fonts
  const fonts = [
    'NeueHaasUnica-Regular.woff', 'NeueHaasUnica-Regular.woff2',
    'Akkurat-Mono.woff', 'Akkurat-Mono.woff2',
  ];
  const fontResults = await batch(fonts, (f) =>
    download(`https://www.seedhealth.com/fonts/${f}`, path.join(FONT_DIR, f), f), 4);

  // 3. Favicon
  await download('https://www.seedhealth.com/icons/seed-favicon.svg', path.join(SEO_DIR, 'seed-favicon.svg'), 'favicon');

  const okImg = imgResults.filter(r => r.ok).length;
  const okFont = fontResults.filter(r => r.ok).length;
  console.log(`\nDONE. Images ${okImg}/${urlList.length}, Fonts ${okFont}/${fonts.length}`);
}
main();
