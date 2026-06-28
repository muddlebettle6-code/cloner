# Cumulant Reel Studio (Remotion)

A React/TypeScript motion-graphics system for Cumulant short-form vertical reels. Black cinematic environment, magenta `#ff2d92` + white, approved fonts (Neue Haas Unica + Akkurat Mono), Vox-style explanatory charts, one 3D scene, natural male narration, synced captions, restrained sound design. Isolated in `remotion/`; the existing site and article pipeline are untouched (`remotion/` is excluded from the site tsconfig; site typecheck passes).

## Output
- **`out/CumulantReel.mp4`** — 1080×1920, 9:16, 30 fps, ~44.3 s, H.264 + AAC.
- **`out/cover.png`** — thumbnail (hero number frame).

## Commands
Run from the project root.

**Render the MP4** (the `--gl=angle` flag is required for the headless 3D scene):
```bash
npx remotion render remotion/index.ts CumulantReel remotion/out/CumulantReel.mp4 \
  --public-dir=remotion/public --gl=angle --codec=h264 --audio-codec=aac --crf=18
```

**Interactive preview / dev (Remotion Studio):**
```bash
npx remotion studio remotion/index.ts --public-dir=remotion/public
```

**Single still (QA a frame):**
```bash
npx remotion still remotion/index.ts CumulantReel remotion/out/frame.png --frame=470 --public-dir=remotion/public --gl=angle
```

**Regenerate the voiceover** (edit lines in `public/audio/_segments.json`, needs `OPENAI_API_KEY`):
the VO clips `public/audio/s1..s7.mp3` were produced with `gpt-4o-mini-tts`, voice `ash`, speed 1.08.

## Architecture
| File | Role |
|---|---|
| `index.ts` / `Root.tsx` | Remotion entry + composition registration (id `CumulantReel`) |
| `theme.ts` | design tokens — colors, fonts, safe margins, **9 easing presets** (the "graph editor") |
| `data.ts` | **structured story data** — scenes, timings, captions, chart values, sources (content ≠ presentation) |
| `fonts.ts` | approved fonts embedded (deterministic render) |
| `components.tsx` | reusable: `Background`, `Headline`, `Captions`, `DataCounter`, `BarChart`, `Flow`, `TopicLabel`, `SourceLabel`, `LogoOutro`, `Mark`, motion helpers (`rev`, `useReveal`, `counter`) |
| `Barrel3D.tsx` | the 3D scene (`@remotion/three` + R3F) |
| `scenes.tsx` | the 7 scenes + `SceneWrap` (fade/blur/scale dissolve) |
| `Reel.tsx` | persistent background + scene series + full audio mix |
| `public/audio/` | VO (`s1..s7`), `music.mp3`, `whoosh/riser/impact/tick` |

**Data-driven:** to make a different reel today, an agent supplies a new `reel` object in `data.ts` (script + timings + chart values + sources) and re-renders. That is the foundation for the future agent → video workflow.

## Known limitations
1. **3D needs `--gl=angle`** in headless render (documented above; works in Studio natively).
2. **Caption sync** is proportional to phrase length within each scene, not waveform-forced-aligned — close, not word-perfect. A future pass can use whisper word timestamps.
3. **Music + SFX are procedurally synthesized** (royalty-free, functional). A licensed composed bed would sound richer; drop one in and lower the synth bed.
4. **Transitions are cross-dissolves** (fade + blur + scale) over a persistent background. True morph match-cuts (circle → pie, bar → building) are designed-for but not yet implemented.
5. **3D shadow is faked** (a soft 2D contact gradient); no real shadow-mapped ground.
6. Bar-chart value labels are small relative to the bars.

## Recommendations for reel #2
- Add **morph match-cuts** between scenes (e.g., the counter digit dissolves into the chart's magenta bar) using shared layout elements.
- **Forced-align captions** to the VO with word timestamps for word-level pop.
- Introduce a **map scene** (Strait of Hormuz) as a second composition type, and parallax depth planes on the object scene.
- Commission or license a **music bed**; keep the synth as fallback.
- Add a **`calculateMetadata`** step so the composition reads `public/audio/_durations.json` and self-times (no hardcoded frames).
- Wire a small `make-reel` script so `data.ts` can be generated from an article's `storyboard.json` + charts, closing the agent → video loop.
