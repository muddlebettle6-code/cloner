#!/usr/bin/env bash
#
# Assemble a 9:16 reel from the frames + voiceover script that social-reel.mjs
# emits: rasterise each frame (headless Chrome, high DPI), narrate each with
# macOS `say`, and stitch an MP4 (voiceover + a subtle ambient bed) with ffmpeg.
#
#   node scripts/social-reel.mjs <article.json> <dir> && bash scripts/social-reel.sh <dir>
#
set -uo pipefail
DIR="${1:?usage: social-reel.sh <frames-dir>}"
CHROME="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
VOICE="${REEL_VOICE:-Samantha}"
PAD="${REEL_PAD:-0.7}"
SCALE="${REEL_SCALE:-2}"
BG="${REEL_BG:-1}"

N=$(python3 -c "import json;print(len(json.load(open('$DIR/vo.json'))))")
: > "$DIR/vlist.txt"; : > "$DIR/alist.txt"

for ((i = 0; i < N; i++)); do
  vo=$(python3 -c "import json;print(json.load(open('$DIR/vo.json'))[$i])")
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor="$SCALE" \
    --screenshot="$DIR/f$i.png" --window-size=1080,1920 "file://$DIR/f$i.html" >/dev/null 2>&1
  say -v "$VOICE" -o "$DIR/v$i.aiff" "$vo" 2>/dev/null || say -o "$DIR/v$i.aiff" "$vo"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DIR/v$i.aiff")
  total=$(python3 -c "print(round($dur + $PAD, 3))")
  ffmpeg -y -i "$DIR/v$i.aiff" -af "apad=pad_dur=$PAD" -t "$total" -ar 44100 -ac 2 "$DIR/a$i.wav" >/dev/null 2>&1
  printf "file '%s/f%d.png'\nduration %s\n" "$DIR" "$i" "$total" >> "$DIR/vlist.txt"
  printf "file '%s/a%d.wav'\n" "$DIR" "$i" >> "$DIR/alist.txt"
done
printf "file '%s/f%d.png'\n" "$DIR" "$((N - 1))" >> "$DIR/vlist.txt"

ffmpeg -y -f concat -safe 0 -i "$DIR/alist.txt" -c copy "$DIR/voice.wav" >/dev/null 2>&1
VDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DIR/voice.wav")

if [ "$BG" = "1" ]; then
  ffmpeg -y -f concat -safe 0 -i "$DIR/vlist.txt" -i "$DIR/voice.wav" \
    -f lavfi -t "$VDUR" -i "anoisesrc=color=brown:amplitude=0.06,lowpass=f=380,highpass=f=70" \
    -filter_complex "[0:v]scale=1080:1920,fps=30,format=yuv420p[v];[2:a]volume=0.05[bg];[1:a][bg]amix=inputs=2:duration=first:dropout_transition=0,loudnorm[a]" \
    -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$DIR/reel.mp4" >/dev/null 2>&1
else
  ffmpeg -y -f concat -safe 0 -i "$DIR/vlist.txt" -i "$DIR/voice.wav" \
    -filter_complex "[0:v]scale=1080:1920,fps=30,format=yuv420p[v]" \
    -map "[v]" -map 1:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$DIR/reel.mp4" >/dev/null 2>&1
fi

[ -f "$DIR/reel.mp4" ] && echo "reel: $DIR/reel.mp4  ($(python3 -c "print(round($VDUR,1))")s, 1080x1920)" || echo "reel build failed"
