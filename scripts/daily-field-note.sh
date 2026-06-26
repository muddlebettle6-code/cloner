#!/usr/bin/env bash
#
# Daily field note: generate a current-events note, run an automatic safety
# review, and AUTO-PUBLISH it (commit + push so Cloudflare rebuilds). Only a note
# the safety review flags is held back as a draft for a human to look at.
#
# Configure FCRI_DIR / SITE_DIR (or rely on the defaults). Run by hand to test,
# or on a schedule via launchd (deploy/com.cumulant.fieldnote.daily.plist).
#
set -uo pipefail

FCRI_DIR="${FCRI_DIR:-$HOME/Desktop/cumulant/FCRI}"
SITE_DIR="${SITE_DIR:-$HOME/cloner}"
LOG="${FIELDNOTE_LOG:-$SITE_DIR/scripts/daily-field-note.log}"
TIMESPAN="${FIELDNOTE_TIMESPAN:-2d}"
AUTO_DEPLOY="${FIELDNOTE_AUTODEPLOY:-1}"   # 1 = commit + push; 0 = commit only

DATE="$(date +%F)"
OUTDIR="$FCRI_DIR/field_notes/$DATE"
NOTE="$OUTDIR/note.json"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "Daily field note starting."

# 1) Generate + automatically review (needs python3 + certifi + the claude CLI).
[ -d "$FCRI_DIR" ] || { log "FCRI_DIR not found: $FCRI_DIR"; exit 1; }
FCRI_DIR="$FCRI_DIR" python3 "$SITE_DIR/scripts/field-note-standalone.py" "$OUTDIR" --timespan "$TIMESPAN" --review >>"$LOG" 2>&1
RC=$?
[ -f "$NOTE" ] || { log "No note produced (no news / rate limit / claude unavailable). Stopping."; exit 1; }

if [ "$RC" -eq 0 ]; then
  PUBLISH="--publish"
  log "Safety review PASSED -> auto-publishing."
elif [ "$RC" -eq 3 ]; then
  PUBLISH=""
  log "Safety review HELD this note as a draft (see issues above). It will NOT auto-publish; review it in the console."
else
  log "Generation failed (rc=$RC). Stopping."
  exit 1
fi

# 2) Ingest into the site (published, or draft if held).
cd "$SITE_DIR" || { log "SITE_DIR not found: $SITE_DIR"; exit 1; }
if ! node scripts/note-ingest.mjs "$NOTE" $PUBLISH >>"$LOG" 2>&1; then
  log "note-ingest failed. Stopping."
  exit 1
fi

# 3) If published, commit + push so Cloudflare (building from this repo) redeploys.
if [ -n "$PUBLISH" ]; then
  git -C "$SITE_DIR" add content/notes/ >>"$LOG" 2>&1
  if git -C "$SITE_DIR" diff --cached --quiet; then
    log "Nothing new to commit."
  else
    git -C "$SITE_DIR" -c commit.gpgsign=false commit -m "Daily field note ($DATE)" >>"$LOG" 2>&1
    if [ "$AUTO_DEPLOY" = "1" ] && git -C "$SITE_DIR" push >>"$LOG" 2>&1; then
      log "Published + pushed. Cloudflare will rebuild; live in 1-2 min."
    else
      log "Published + committed locally, but did not push (auth, or AUTO_DEPLOY=0). Push the repo to deploy."
    fi
  fi
else
  log "Held as a draft. Review it: cd $SITE_DIR && npm run console"
fi

log "Done."
