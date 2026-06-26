#!/usr/bin/env bash
#
# Securely store the GitHub deploy token so the daily field-note job can push
# on its own. Run it and paste your token at the prompt (it is not echoed and
# never touches your shell history). It is saved only in your local LaunchAgent
# plist (readable by your user account only).
#
#   bash scripts/set-deploy-token.sh
#
set -uo pipefail

PLIST="$HOME/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist"
REPO="muddlebettle6-code/cumulant"

[ -f "$PLIST" ] || { echo "Daily schedule not installed at:"; echo "  $PLIST"; echo "Install it first (see deploy/com.cumulant.fieldnote.daily.plist)."; exit 1; }

printf "Paste your GitHub token (fine-grained, Contents:write on %s), then press Enter:\n> " "$REPO"
read -rs TOKEN
echo
[ -n "$TOKEN" ] || { echo "No token entered. Nothing changed."; exit 1; }

# Sanity-check the token can reach the repo (does not prove write access).
if command -v curl >/dev/null 2>&1; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$REPO")
  if [ "$CODE" = "200" ]; then
    echo "Token can access $REPO. Good."
  else
    printf "Warning: a test request to %s returned HTTP %s.\nContinue anyway? [y/N] " "$REPO" "$CODE"
    read -r ANS
    case "$ANS" in y|Y) ;; *) echo "Aborted."; exit 1;; esac
  fi
fi

plutil -replace EnvironmentVariables.GITHUB_TOKEN -string "$TOKEN" "$PLIST" || { echo "Failed to write the token into the plist."; exit 1; }
launchctl unload "$PLIST" 2>/dev/null
launchctl load -w "$PLIST"

echo
echo "Done. The token is stored in your LaunchAgent plist."
echo "Tomorrow's 8am note will publish + push on its own."
echo "To test now without waiting: bash scripts/daily-field-note.sh"
