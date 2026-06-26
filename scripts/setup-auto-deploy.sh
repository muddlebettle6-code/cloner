#!/usr/bin/env bash
#
# One-time setup so deploys push automatically, with no GitHub Desktop. It
# configures git's credential store with your deploy token (read from the daily
# job's config if present, otherwise prompted). After this, `git push` to your
# GitHub repos and `bash scripts/deploy.sh` push on their own.
#
# The token is scoped to whatever repos you granted it. For the cumulant repo
# (the live site) that is all you need. To also auto-push the cloner source repo,
# grant the token Contents:write on cloner too when you create it.
#
set -uo pipefail

PLIST="$HOME/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist"
CRED="$HOME/.git-credentials"

TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f "$PLIST" ]; then
  TOKEN=$(plutil -extract EnvironmentVariables.GITHUB_TOKEN raw "$PLIST" 2>/dev/null || true)
fi
if [ -z "$TOKEN" ]; then
  printf "Paste your GitHub token (Contents:write on the repos), then Enter:\n> "
  read -rs TOKEN
  echo
fi
[ -n "$TOKEN" ] || { echo "No token found or entered. Nothing changed."; exit 1; }

git config --global credential.helper store
# Replace any existing github.com entry, then add ours (the token is never printed).
if [ -f "$CRED" ]; then
  grep -v "@github.com" "$CRED" > "$CRED.tmp" 2>/dev/null || true
  mv "$CRED.tmp" "$CRED"
fi
printf 'https://x-access-token:%s@github.com\n' "$TOKEN" >> "$CRED"
chmod 600 "$CRED"

echo "Done. git push to github.com now uses your token (no GitHub Desktop needed)."
echo "Deploy any time with:  bash scripts/deploy.sh \"message\""
echo "The autonomous newsroom already deploys itself with this token."
