# Hosting the console (employee sign-in)

The review console (`npm run console`) is a single Node file with no
dependencies. Locally it is open and edits files directly. To put it online for
employees, you add **sign-in** and swap the **storage + deploy** mechanism. This
guide covers both. The public site (`cumulant.org`) stays exactly as it is —
static on Netlify; only the console becomes a hosted, gated app.

## 1. Sign-in (already built)

The console gates itself when either env var is set:

| Env var | Meaning |
|---|---|
| `CONSOLE_PASSWORD` | one shared password for everyone |
| `CONSOLE_USERS` | per-employee logins: `aryan@cumulant.org:pass1,sam@cumulant.org:pass2` |

With neither set it stays open (local use). With one set, every route redirects
to `/login`; a correct credential sets an `HttpOnly` session cookie. Always run
it over HTTPS when hosted (the host below provides that), and prefer
`CONSOLE_USERS` so logins are per person.

For real SSO later (Google/GitHub login, password resets), the console would be
re-expressed as a small Next.js app using Auth.js — but the env-based gate is
enough to put it behind a login today.

## 2. Where to host it

It is a long-running Node HTTP server, so a **persistent Node host** fits best:

- **Railway / Render / Fly.io** — point at this repo, start command
  `node scripts/console.mjs`, set `CONSOLE_USERS` (and the storage env in step 3).
  These give you a URL + HTTPS in minutes.
- **Vercel** specifically is serverless (no long-running server), so hosting *there*
  would mean porting the console to Next.js API routes first. If you want Vercel,
  that port is the task; otherwise a Node host is less work.

## 3. The one real decision: how a hosted console deploys

Locally the console writes `content/*.json` and you run a build + push. A hosted
console can't touch your laptop's files, so "Publish" needs a remote path to the
live site. Two options:

**A. Git-write + CI (recommended — keeps the simple static model).**
Put the site source on GitHub. The console commits `content/<store>/<slug>.json`
through the GitHub API (a fine-grained token in `GITHUB_TOKEN`), and a GitHub
Action rebuilds the static export and deploys to Netlify on push. Approving in
the console then becomes: commit → Action builds → Netlify publishes, with no
laptop in the loop. (The `setPublished` / save handlers in `console.mjs` are the
single place to switch from `writeFileSync` to a GitHub commit.)

**B. Content database.**
Move `content/papers` + `content/notes` into a hosted store (Postgres or a KV).
The site reads it at build (or becomes a dynamic app), and the console writes the
store + pings a deploy hook. More moving parts; choose this only if you outgrow
files.

Either way the data shape (the same `paper.json` / note JSON) does not change, so
the local pipeline (`paper:ingest`, `note:ingest`, `fcri publish`, `fcri
field-note`) keeps working unchanged.

## 4. Suggested rollout

1. Host on Railway/Render with `CONSOLE_USERS` set — employees can sign in and
   **review/preview/edit** immediately (read-only-ish; publishing still done from
   your machine).
2. Add option A (GitHub commit + Action) so **Publish** deploys without your
   laptop.
3. Only if needed, move to SSO (Next.js + Auth.js) and/or a content DB.

The agents and the daily field-note loop keep running where FCRI lives; the
hosted console is just the front door employees use to review and approve their
output.
