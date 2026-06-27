#!/usr/bin/env bash
#
# Source-driven layer (launchd wrapper). Monitors primary sources, then triages
# and, for qualifying non-high-impact events, writes a source-backed story;
# high-impact events are drafted and held for human review. Runs alongside the
# core engine - the shared lock keeps the two from writing at the same time.
#
set -uo pipefail
SITE_DIR="${SITE_DIR:-$HOME/cloner}"
LOG="${SOURCE_LOG:-$SITE_DIR/scripts/source-engine.log}"
{
  echo "=== source-watch $(date '+%Y-%m-%d %H:%M:%S') ==="
  python3 "$SITE_DIR/scripts/source-monitor.py"
  python3 "$SITE_DIR/scripts/source-engine.py" "$@"
  python3 "$SITE_DIR/scripts/live-updater.py"
} >> "$LOG" 2>&1
