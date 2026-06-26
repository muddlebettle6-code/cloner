#!/usr/bin/env bash
#
# Connect Reddit and LinkedIn so the autonomous newsroom posts to them. Stores
# the credentials in the daily job's launchd plist (the same place the deploy
# token lives) and validates them read-only. Re-run any time to update.
#
#   bash scripts/set-social-creds.sh
#
set -uo pipefail
PLIST="$HOME/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist"
[ -f "$PLIST" ] || { echo "Daily job plist not found at $PLIST"; exit 1; }

store() { [ -n "${2:-}" ] && plutil -replace "EnvironmentVariables.$1" -string "$2" "$PLIST"; }
ask()  { local v; printf "%s: " "$1" >&2; read -r v; printf '%s' "$v"; }
asks() { local v; printf "%s: " "$1" >&2; read -rs v; printf '\n' >&2; printf '%s' "$v"; }

echo "Leave a field blank to skip that platform. Secrets are hidden as you type."
echo
echo "== Reddit  (reddit.com/prefs/apps -> create another app -> type: script) =="
RC=$(ask  "  client ID  (under the app name)")
RS=$(asks "  secret")
RU=$(ask  "  reddit username")
RP=$(asks "  reddit password")
echo
echo "== LinkedIn  (developer console -> your app -> Auth -> OAuth token w/ w_member_social) =="
LT=$(asks "  access token")
LA=$(ask  "  author URN  (urn:li:person:XXXX  or  urn:li:organization:XXXX)")

store REDDIT_CLIENT_ID "$RC"; store REDDIT_SECRET "$RS"; store REDDIT_USERNAME "$RU"; store REDDIT_PASSWORD "$RP"
store LINKEDIN_ACCESS_TOKEN "$LT"; store LINKEDIN_AUTHOR "$LA"

launchctl unload "$PLIST" 2>/dev/null; launchctl load -w "$PLIST"
echo
echo "Stored + reloaded. Validating (read-only, no posts)..."

if [ -n "$RC" ] && [ -n "$RU" ]; then
  tok=$(curl -s -A "cumulant-newsroom/1.0" -u "$RC:$RS" \
        --data-urlencode "grant_type=password" --data-urlencode "username=$RU" --data-urlencode "password=$RP" \
        https://www.reddit.com/api/v1/access_token \
        | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
  [ -n "$tok" ] && echo "  Reddit:   OK (authenticated as u/$RU)" || echo "  Reddit:   FAILED - check client ID / secret / username / password / 2FA"
fi
if [ -n "$LT" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $LT" https://api.linkedin.com/v2/userinfo)
  [ "$code" = "200" ] && echo "  LinkedIn: OK (token valid)" || echo "  LinkedIn: /userinfo returned HTTP $code - may still post; verify the token has w_member_social"
fi
echo
echo "Done. The next published article auto-posts to whatever validated above."
echo "Note: the Reddit password is stored locally in the plist (readable only by you);"
echo "consider a dedicated posting account."
