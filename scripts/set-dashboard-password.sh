#!/usr/bin/env bash
#
# Change the dashboard password (stored in the always-on launchd job).
#
#   bash scripts/set-dashboard-password.sh
#
set -uo pipefail
PLIST="$HOME/Library/LaunchAgents/com.cumulant.dashboard.plist"
[ -f "$PLIST" ] || { echo "Dashboard job not installed. Run the install steps in docs/DASHBOARD.md first."; exit 1; }

printf "New dashboard password: " >&2
read -rs PW; echo >&2
[ -n "$PW" ] || { echo "Empty - unchanged."; exit 1; }

plutil -replace EnvironmentVariables.DASH_PASSWORD -string "$PW" "$PLIST"
launchctl unload "$PLIST" 2>/dev/null; launchctl load -w "$PLIST"
echo "Updated. Log in with user 'cumulant' and the new password."
