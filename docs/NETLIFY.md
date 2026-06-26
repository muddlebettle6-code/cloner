# Hosting the console on Netlify (employee sign-in)

The console can run on the same Netlify that serves the public site, using
**Netlify Identity** for employee sign-in and **Netlify Functions** for the API.
Approving or editing in the console commits to the source repo, and Netlify
auto-rebuilds — no laptop in the loop. The pieces are already in this repo:

- `netlify.toml` — build the site from source (`npm run build` -> `out`) + functions.
- `netlify/functions/console.mjs` — the Identity-gated API (reads/writes the
  content store via the GitHub Contents API).
- `public/console/index.html` — the dashboard, served at `/console`.

## One-time setup

1. **Point Netlify at the `cloner` source repo.** In the Netlify site that serves
   cumulant.org: Site settings -> Build & deploy -> link to
   `github.com/muddlebettle6-code/cloner`. The build command, publish dir, and
   functions dir come from `netlify.toml`. (This replaces the manual
   build-and-push-to-`cumulant` step: every push to `cloner` now deploys.)

2. **Enable Netlify Identity.** Site -> Identity -> Enable Identity. Set
   registration to **Invite only**, then invite each employee by email; they set
   a password from the invite. (Optional: enable Git Gateway if you later want
   Identity to commit without a token.)

3. **Add a GitHub token + env vars.** Create a fine-grained personal access token
   with **Contents: read and write** on the `cloner` repo. In Netlify -> Site
   settings -> Environment variables, add:
   - `GITHUB_TOKEN` = the token
   - `GITHUB_REPO` = `muddlebettle6-code/cloner`
   - `GITHUB_BRANCH` = `master`

4. **Deploy** (push `cloner`, or "Trigger deploy").

## Using it

Employees open **`cumulant.org/console`**, sign in (Netlify Identity), and see the
draft queue. They can Preview, Edit (with live preview), and **Publish**.
Publishing commits the change to the repo; Netlify rebuilds and the change is
live in 1-2 minutes. Drafts stay hidden from the public site until approved.

## How it stays honest + safe

- **Invite-only Identity** — no public sign-ups; only invited employees get in.
- The function returns 401 without a valid Identity token, so the data and all
  writes are gated even though the page itself is static.
- `GITHUB_TOKEN` lives only in Netlify's server env, never in the browser.
- `/console` is `noindex`.

## What still runs locally / on the Mac

- **Generating** field notes (the daily `fcri field-note` via launchd, and the
  `Generate` button in the local `npm run console`) runs where FCRI lives — it
  needs the claude CLI + GDELT, not Netlify. The hosted console is the
  review/approve front door for that output.
- The local console (`npm run console`) still works for quick local review; it
  edits files directly instead of via GitHub.

## Note on the old deploy

Once Netlify builds from `cloner`, the `cumulant` static repo and the manual
"build `out/` -> copy -> push" flow are no longer needed (keep it as a backup or
retire it). Everything deploys from a push to `cloner`.
