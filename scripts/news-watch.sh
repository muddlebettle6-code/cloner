#!/usr/bin/env bash
#
# Continuous newsroom watcher (launchd wrapper). Runs the scan-and-maybe-write
# cycle. Scheduled every ~30 minutes; the script self-limits (lock + daily cap +
# a high bar), so most cycles do nothing.
#
set -uo pipefail
SITE_DIR="${SITE_DIR:-$HOME/cloner}"
LOG="${WATCH_LOG:-$SITE_DIR/scripts/news-watch.log}"
{
  echo "=== watch $(date '+%Y-%m-%d %H:%M:%S') ==="
  python3 "$SITE_DIR/scripts/news-watch.py" "$@"
} >>"$LOG" 2>&1
