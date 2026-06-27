// Download an image URL, validate it is a real image, cap it at 4K, and save it
// as JPEG. Used to self-host article lead images instead of hotlinking.
//
//   node scripts/fetch-image.mjs <imageUrl> <outPath>
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";

const [, , url, out] = process.argv;
if (!url || !out) {
  console.error("usage: node scripts/fetch-image.mjs <imageUrl> <outPath>");
  process.exit(1);
}

const UA = "cumulant-newsroom/1.0 (+https://cumulant.org; research desk)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let res;
for (let i = 0; i < 4; i++) {
  res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (res.status !== 429 && res.status !== 503) break;
  await sleep(2500 * (i + 1)); // back off on rate limit
}
if (!res.ok) {
  console.error(`HTTP ${res.status} for ${url}`);
  process.exit(1);
}
const ct = res.headers.get("content-type") || "";
if (!/^image\//.test(ct)) {
  console.error(`not an image (content-type: ${ct})`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
if (buf.length < 15000) {
  console.error(`too small (${buf.length} bytes) - probably a placeholder`);
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });
const tmp = `/tmp/fetchimg-${Date.now()}`;
writeFileSync(tmp, buf);
try {
  // Cap the long edge at 3840 (4K) and normalise to JPEG.
  execFileSync("sips", ["-Z", "3840", "-s", "format", "jpeg", "-s", "formatOptions", "82", tmp, "--out", out], { stdio: "ignore" });
  const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", out]).toString();
  const w = info.match(/pixelWidth: (\d+)/)?.[1];
  const h = info.match(/pixelHeight: (\d+)/)?.[1];
  console.log(`saved ${out} (${w}x${h})`);
} catch (e) {
  console.error("sips failed (not a decodable image)");
  process.exit(1);
} finally {
  try { unlinkSync(tmp); } catch {}
}
