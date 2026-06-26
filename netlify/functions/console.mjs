// Netlify Function: the review-console API.
//
// Gated by Netlify Identity (employee sign-in) and backed by the GitHub Contents
// API, so approving/editing here commits to the source repo and Netlify
// auto-redeploys the site. No server to run; no laptop in the loop.
//
// Env vars (Netlify site settings):
//   GITHUB_TOKEN   fine-grained PAT with Contents read+write on the repo
//   GITHUB_REPO    "owner/name"   (default: muddlebettle6-code/cloner)
//   GITHUB_BRANCH  branch to commit to (default: main)

const REPO = process.env.GITHUB_REPO || "muddlebettle6-code/cloner";
const BRANCH = process.env.GITHUB_BRANCH || "master";
const TOKEN = process.env.GITHUB_TOKEN;
const STORES = { paper: "content/papers", note: "content/notes" };
const GH = "https://api.github.com";

const ghHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "cumulant-console",
});

async function ghGet(path) {
  const r = await fetch(`${GH}/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`, { headers: ghHeaders() });
  return r.ok ? r.json() : null;
}
async function ghPut(path, obj, sha, message) {
  const body = {
    message,
    branch: BRANCH,
    content: Buffer.from(JSON.stringify(obj, null, 2) + "\n").toString("base64"),
  };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH}/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  return r.ok;
}
const decode = (file) => JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

export const handler = async (event, context) => {
  // Netlify Identity: context.clientContext.user is set only for a valid token.
  const user = context.clientContext && context.clientContext.user;
  if (!user) return json(401, { error: "Sign in required" });
  if (!TOKEN) return json(500, { error: "GITHUB_TOKEN is not configured on the site" });

  const params = event.queryStringParameters || {};
  try {
    if (event.httpMethod === "GET" && params.action === "items") {
      const items = [];
      for (const [type, dir] of Object.entries(STORES)) {
        const listing = await ghGet(dir);
        if (!Array.isArray(listing)) continue;
        const files = listing.filter((f) => f.name.endsWith(".json"));
        const datas = await Promise.all(
          files.map(async (f) => {
            const d = decode(await ghGet(`${dir}/${f.name}`));
            return {
              type,
              slug: d.slug || f.name.replace(/\.json$/, ""),
              title: d.title,
              published: d.published !== false,
              kind: d.kind,
              date: d.date || "",
              status: d.status || "",
            };
          })
        );
        items.push(...datas);
      }
      items.sort((a, b) => (a.published ? 1 : 0) - (b.published ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
      return json(200, { items });
    }

    if (event.httpMethod === "GET" && params.action === "item") {
      const dir = STORES[params.type];
      if (!dir) return json(400, { error: "bad type" });
      const file = await ghGet(`${dir}/${params.slug}.json`);
      return file ? json(200, decode(file)) : json(404, { error: "not found" });
    }

    if (event.httpMethod === "POST") {
      const b = JSON.parse(event.body || "{}");
      const dir = STORES[b.type];
      if (!dir) return json(400, { error: "bad type" });
      if (!/^[a-z0-9-]+$/.test(b.slug || "")) return json(400, { error: "bad slug" });
      const path = `${dir}/${b.slug}.json`;
      const file = await ghGet(path);
      if (!file) return json(404, { error: "not found" });

      let out;
      if (b.action === "publish") {
        out = decode(file);
        out.published = !!b.published;
      } else if (b.action === "save") {
        try {
          out = JSON.parse(b.json);
        } catch (e) {
          return json(400, { error: "Invalid JSON: " + e.message });
        }
        out.slug = b.slug;
      } else {
        return json(400, { error: "unknown action" });
      }
      const ok = await ghPut(path, out, file.sha, `console: ${b.action} ${b.slug} (by ${user.email || "employee"})`);
      return json(ok ? 200 : 502, { ok });
    }

    return json(404, { error: "unknown action" });
  } catch (e) {
    return json(500, { error: String(e) });
  }
};
