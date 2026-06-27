#!/usr/bin/env bash
#
# Generate the full social pack for one article: headline cards (all ratios),
# a multi-slide carousel, pull-quote cards, and platform captions. Everything
# lands in ~/Downloads/cumulant-social/.
#
set -uo pipefail
SITE_DIR="${SITE_DIR:-$HOME/cloner}"
SLUG="${1:?usage: social-pack.sh <article-slug>}"
cd "$SITE_DIR"

echo "== images (find + download licensed photos for variety) =="
python3 scripts/social-images.py "$SLUG"
echo "== headline cards =="
node scripts/social-card.mjs --slug "$SLUG" --formats 4x5,1x1,1.91x1
echo "== carousel =="
node scripts/social-carousel.mjs --slug "$SLUG" --format 4x5
echo "== pull-quote cards =="
node scripts/social-card.mjs --slug "$SLUG" --quote --formats 4x5,1x1
echo "== captions =="
python3 scripts/social-caption.py --slug "$SLUG" >/dev/null && echo "captions.md written"

echo ""
echo "Social pack ready -> ~/Downloads/cumulant-social/ (cards + carousel-$SLUG/ + captions.md)"
