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

# 1) Generate the note in the FCRI repo (uses OpenAI + GDELT; needs its venv).
cd "$FCRI_DIR" || { log "FCRI_DIR not found: $FCRI_DIR"; exit 1; }
# shellcheck disable=SC1091
[ -f .venv/bin/activate ] && source .venv/bin/activate
if ! python -m fcri field-note --output "$OUTDIR" --timespan "$TIMESPAN" >>"$LOG" 2>&1; then
  log "fcri field-note failed (no news, GDELT rate limit, or the claude CLI is unavailable / not logged in). Stopping."
  exit 1
fi
[ -f "$NOTE" ] || { log "No note.json produced at $NOTE. Stopping."; exit 1; }

# 2) Ingest as a DRAFT on the site (hidden until a human approves it).
cd "$SITE_DIR" || { log "SITE_DIR not found: $SITE_DIR"; exit 1; }
if ! node scripts/note-ingest.mjs "$NOTE" >>"$LOG" 2>&1; then
  log "note-ingest failed. Stopping."
  exit 1
fi

log "Done. A new draft is waiting. Review and publish:"
log "    cd $SITE_DIR && npm run note:review"
log "    npm run note:publish <slug> && npm run build   # then push the cumulant repo"
