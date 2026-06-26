#!/usr/bin/env bash
#
# Daily field note: generate a current-events note from FCRI and ingest it into
# the site as a DRAFT for human review. Nothing is published automatically.
#
# Configure the two paths below (or set FCRI_DIR / SITE_DIR in the environment).
# Run it by hand to test, or on a schedule via launchd (see
# deploy/com.cumulant.fieldnote.daily.plist).
#
set -uo pipefail

FCRI_DIR="${FCRI_DIR:-$HOME/Desktop/cumulant/FCRI}"
SITE_DIR="${SITE_DIR:-$HOME/cloner}"
LOG="${FIELDNOTE_LOG:-$SITE_DIR/scripts/daily-field-note.log}"
TIMESPAN="${FIELDNOTE_TIMESPAN:-2d}"

DATE="$(date +%F)"
OUTDIR="$FCRI_DIR/field_notes/$DATE"
NOTE="$OUTDIR/note.json"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "Daily field note starting."

# 1) Generate the note (standalone: needs python3 + certifi + the claude CLI,
#    not the full FCRI virtualenv).
[ -d "$FCRI_DIR" ] || { log "FCRI_DIR not found: $FCRI_DIR"; exit 1; }
if ! FCRI_DIR="$FCRI_DIR" python3 "$SITE_DIR/scripts/field-note-standalone.py" "$OUTDIR" --timespan "$TIMESPAN" >>"$LOG" 2>&1; then
  log "field-note generation failed (no news, GDELT rate limit, or the claude CLI is unavailable / not logged in). Stopping."
  exit 1
fi
[ -f "$NOTE" ] || { log "No note.json produced at $NOTE. Stopping."; exit 1; }

# 2) Ingest as a DRAFT on the site (hidden until a human approves it).
cd "$SITE_DIR" || { log "SITE_DIR not found: $SITE_DIR"; exit 1; }
if ! node scripts/note-ingest.mjs "$NOTE" >>"$LOG" 2>&1; then
  log "note-ingest failed. Stopping."
  exit 1
fi

log "Done. A new draft is waiting. Review and approve:"
log "    cd $SITE_DIR && npm run console        # review + approve in the browser"
log "    (or: npm run note:review, then npm run note:publish <slug>)"
log "    then push to deploy (Cloudflare rebuilds the site)."
