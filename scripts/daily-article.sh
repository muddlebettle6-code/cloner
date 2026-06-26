#!/usr/bin/env bash
#
# Daily DEEP ARTICLE: research and write a publication-quality data-journalism
# article, run the automatic quality gate, and AUTO-PUBLISH + deploy it. An
# article that fails the gate is held as a draft instead of going live.
#
# Fully autonomous (no human step). The gate + the critique/revise stage are the
# safety. Reliable unattended deploy needs GITHUB_TOKEN set (see deploy.sh).
#
set -uo pipefail

SITE_DIR="${SITE_DIR:-$HOME/cloner}"
LOG="${ARTICLE_LOG:-$SITE_DIR/scripts/daily-article.log}"
AUTO_DEPLOY="${ARTICLE_AUTODEPLOY:-1}"
DATE="$(date +%F)"
OUTDIR="$SITE_DIR/.article-builds/$DATE"
ART="$OUTDIR/article.json"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "Daily article starting."
cd "$SITE_DIR" || { log "SITE_DIR not found: $SITE_DIR"; exit 1; }

# 1) Research + write (standalone pipeline via the claude CLI; ~15-30 min).
if ! python3 "$SITE_DIR/scripts/article-standalone.py" "$OUTDIR" >>"$LOG" 2>&1; then
  log "Article generation failed (no event, or web/claude unavailable). Stopping."
  exit 1
fi
[ -f "$ART" ] || { log "No article.json produced. Stopping."; exit 1; }

# 2) Quality gate + publish. Gate failure (exit 2) holds it as a draft.
if node scripts/article-ingest.mjs "$ART" --publish >>"$LOG" 2>&1; then
  log "Quality gate PASSED -> published."
  git -C "$SITE_DIR" add content/articles/ >>"$LOG" 2>&1
  git -C "$SITE_DIR" diff --cached --quiet || git -C "$SITE_DIR" -c commit.gpgsign=false commit -m "Daily article ($DATE)" >>"$LOG" 2>&1
  if [ "$AUTO_DEPLOY" = "1" ]; then
    if SITE_DIR="$SITE_DIR" bash "$SITE_DIR/scripts/deploy.sh" "Daily article ($DATE)" >>"$LOG" 2>&1; then
      log "Published + deployed. Cloudflare will publish in ~1 min."
    else
      log "Published, but the deploy did not complete (auth?). Run: bash scripts/deploy.sh"
    fi
  fi
else
  rc=$?
  if [ "$rc" -eq 2 ]; then
    log "Quality gate FAILED -> holding as a draft for review (see issues above)."
    node scripts/article-ingest.mjs "$ART" >>"$LOG" 2>&1 || log "draft ingest failed"
  else
    log "Ingest error (rc=$rc). Stopping."
    exit 1
  fi
fi
log "Done."
