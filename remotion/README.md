# Cumulant Reel Studio (Remotion)

A React/TypeScript motion-graphics system for Cumulant short-form vertical reels (**DARK mode** — near-black `#070708` + subtle grid, white text only, magenta `#ff2d92`). Neue Haas Unica, detailed drei 3D objects + charts/tables on **every** sentence, deep male narration, **verbatim word-synced subtitles** (whisper-aligned) with a **smooth word-by-word reveal** (slide + focus-in), varied low SFX synced to the animations, cinematic flowy transitions + a slow **3D camera drift**, a follow-card ending. Music is optional (v8 ships **without** music per request — VO + SFX only; drop a licensed MP3 at `public/audio/music.mp3` + re-add the `<Audio>` to use one). Isolated in `remotion/`; the site is untouched (excluded from the site tsconfig; site typecheck passes).

## Output
- **`out/CumulantReel_v10_oilinflation_4k.mp4`** — **2160×3840 (4K)**, 9:16, 30 fps, ~79 s, H.264 + AAC. (v10: May's 4.1% oil-inflation — **warm female VO**, human script, thermometer/barrel/flame(extinguishes)/gas-pump 3D, varied per-transition SFX, **visual-only logo ending**, no music.)
- Prior finished reels: `CumulantReel_v9_aibubble_4k.mp4` (AI bubble, deep male VO, bubble-burst), `CumulantReel_v7_4k.mp4` (SpaceX spectrum).
- **`out/cover.png`** — thumbnail.

> ⚠️ When regenerating VO, NEVER `rm public/audio/s*.mp3` — that glob also deletes `subdrop.mp3` (and `swoosh_*`). Use `rm public/audio/s[0-9]*.mp3`.

## Commands
Run from the project root.

**Render at 4K** (`--scale=2` doubles the 1080×1920 comp to 2160×3840; `--gl=angle` is required for the 3D):
```bash
npx remotion render remotion/index.ts CumulantReel remotion/out/CumulantReel_v4_4k.mp4 \
  --public-dir=remotion/public --gl=angle --scale=2 --codec=h264 --audio-codec=aac --crf=18
```
(Drop `--scale=2` for a faster 1080p preview render.)

**Interactive preview / dev (Remotion Studio):**
```bash
npx remotion studio remotion/index.ts --public-dir=remotion/public
```

**Single still (QA a frame):**
```bash
npx remotion still remotion/index.ts CumulantReel remotion/out/frame.png --frame=460 --public-dir=remotion/public --gl=angle
```

**Voiceover:** the VO clips `public/audio/s1..s7.mp3` use `gpt-4o-mini-tts`, voice **`onyx`** (deep), speed 1.1. Music + SFX are procedurally synthesized in `public/audio/`.

## Architecture
| File | Role |
|---|---|
| `index.ts` / `Root.tsx` | Remotion entry + composition registration (id `CumulantReel`) |
| `theme.ts` | design tokens — colors, fonts, safe margins, **9 easing presets** (the "graph editor") |
| `data.ts` | **structured story data** — scenes, timings, captions, chart values, sources (content ≠ presentation) |
| `fonts.ts` | approved fonts embedded (deterministic render) |
| `components.tsx` | reusable (v2, big-text-only): `Background`, `BigText`, `BigNumber`, `BarChartBig`, `LogoOutro`, `Mark`, `SceneWrap` (flash / scale / blur transitions), motion helpers (`rev`, `counter`) |
| `objects3d.tsx` | the **3 3D objects** — globe, barrel, coin (`@remotion/three` + R3F), white key + magenta rim |
| `scenes.tsx` | the 7 scenes + `ObjectStage` (contact shadow + scrim) |
| `Reel.tsx` | persistent background + scene series + full audio mix |
| `public/audio/` | VO (`s1..s7`), `music.mp3`, `whoosh/riser/impact/tick` |

**Data-driven:** to make a different reel today, an agent supplies a new `reel` object in `data.ts` (script + timings + chart values + sources) and re-renders. That is the foundation for the future agent → video workflow.

## Known limitations
1. **3D needs `--gl=angle`** in headless render (documented above; works in Studio natively).
2. **Audio sync** is timed by scene (VO durations drive frames); SFX hit points are hand-placed, not waveform-detected. Close, but a forced-alignment pass would make it word-tight.
3. **Music + SFX are procedurally synthesized** (royalty-free, functional). A licensed composed bed would sound richer; drop one in `public/audio/music.mp3` and re-render.
4. **Transitions are flash / scale / blur** over a persistent background — energetic, but true *morph* match-cuts (the $72 dissolving into a chart bar, the coin unrolling into the barrel) are the next level and not yet built.
5. **3D shadow is faked** (a soft 2D contact gradient); no shadow-mapped ground. 3D uses primitives (clean, not photoreal).
6. 4K render is ~10–15 min on this machine (3D at 2× scale). 1080p preview is much faster (drop `--scale=2`).

## Recommendations for reel #3
- **Morph match-cuts** between scenes via shared elements (counter digit → bar; globe → barrel).
- A **map scene** (Strait of Hormuz) as a 4th 3D/2D composition type; parallax depth planes behind objects.
- **Forced-align** SFX + any captions to the VO waveform (whisper timestamps).
- License a **music bed**; keep the synth as fallback.
- **`calculateMetadata`** reads `public/audio/_durations.json` so the comp self-times (no hardcoded frames).
- A **`make-reel`** script that turns an article's `storyboard.json` + charts into `data.ts` — closing the agent → video loop.
