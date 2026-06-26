#!/usr/bin/env bash
#
# Build the site and deploy it to the Cloudflare-served `cumulant` repo.
# Cloudflare Pages serves that repo's files directly (no build step), so deploy =
# build here, copy `out/` into the cumulant repo, commit, and push origin main.
#
#   bash scripts/deploy.sh ["commit message"]
#
# Reliable unattended push: set GITHUB_TOKEN (a PAT with Contents:write on the
# cumulant repo). Otherwise it falls back to `git push origin main` (your normal
# credentials).
#
set -uo pipefail

SITE_DIR="${SITE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
DEPLOY_DIR="${FIELDNOTE_DEPLOY_DIR:-/Users/aryanpatel/Downloads/Virtu_Fortuna_Project/cumulant}"
DEPLOY_REPO="${FIELDNOTE_DEPLOY_REPO:-muddlebettle6-code/cumulant}"
DEPLOY_BRANCH="${FIELDNOTE_DEPLOY_BRANCH:-main}"
MSG="${1:-Deploy $(date '+%Y-%m-%d %H:%M')}"

[ -d "$DEPLOY_DIR/.git" ] || { echo "deploy repo not found at $DEPLOY_DIR (set FIELDNOTE_DEPLOY_DIR)"; exit 1; }

echo "Building the site..."
( cd "$SITE_DIR" && npm run build ) || { echo "build failed"; exit 1; }

echo "Syncing the build into the cumulant repo..."
find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$SITE_DIR/out/." "$DEPLOY_DIR/"
touch "$DEPLOY_DIR/.nojekyll"

git -C "$DEPLOY_DIR" add -A
if git -C "$DEPLOY_DIR" diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi
git -C "$DEPLOY_DIR" -c commit.gpgsign=false commit -m "$MSG" >/dev/null
echo "Committed to the cumulant repo."

if [ -n "${GITHUB_TOKEN:-}" ]; then
  if git -C "$DEPLOY_DIR" push "https://${GITHUB_TOKEN}@github.com/${DEPLOY_REPO}.git" "HEAD:${DEPLOY_BRANCH}" 2>/dev/null; then
    echo "Pushed with token. Cloudflare will publish in ~1 min."
    exit 0
  fi
  echo "Token push failed; trying normal credentials..."
fi
if git -C "$DEPLOY_DIR" push origin "$DEPLOY_BRANCH"; then
  echo "Pushed. Cloudflare will publish in ~1 min."
else
  echo "Built + committed to the cumulant repo, but the push failed (auth)."
  echo "Push it manually (GitHub Desktop -> cumulant -> Push) to go live."
  exit 2
fi
