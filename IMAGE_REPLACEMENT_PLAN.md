# Image Replacement Plan — Cumulant Research

All imagery on the site is **temporary placeholder art carried over from the previous
build**. Layout, aspect ratios, and motion are final; only the image *files* need to be
swapped. Placeholder files live in `public/images/` (named by opaque asset id) and are
mapped to slots in `src/lib/site-images.ts`. Most slots are **theme-swappable** (5
variants — the header colour dots switch them), so each themed slot needs 5 images (or
the theme feature can be reduced to one set later).

Favicon and logo are **missing** and should be created (see bottom).

| Page | Section | Slot (src/lib/site-images.ts) | Current purpose | Recommended future subject | Orientation | Suggested px | Type |
|------|---------|-------------------------------|-----------------|----------------------------|-------------|--------------|------|
| Home + all | Header theme dots | `HERO` (×5) | 22px swatch thumbnails | Abstract brand swatches (or retire theming) | square | 120×120 | abstract |
| Home | Hero background | `HERO` (×5) | Full-viewport hero | Human–AI research collaboration / abstract data field | landscape | 2400×1400 | photo or abstract |
| Home | Band under positioning | `PLACEHOLDER_SLOTS_A[1]` (×5) | Full-bleed band | Data provenance | landscape (wide) | 2400×1000 | photo/diagram |
| Home | Intro — small image | `PLACEHOLDER_SLOTS_A[0]` (×5) | 190px square | Dataset / research provenance | square | 600×600 | photo/diagram |
| Home | Intro — two-image band | `PLACEHOLDER_SLOTS_A[1]`, `[2]` (×5) | Full-bleed 2-up | Statistical robustness; knowledge graph | landscape | 1600×1200 | diagram/chart |
| Home | Approach — 3 card backgrounds | `PLACEHOLDER_CARD_BG[0..2]` (×5) | Blurred square card bg | Human researchers / AI agents / deterministic systems | square | 1000×1000 | photo/abstract |
| Home | Approach — 3 card overlays | `PLACEHOLDER_OVERLAY[0..2]` (shared) | Centered white diagram | A diagram per pillar (review / agent graph / pipeline) | square (transparent) | 1000×1000 | diagram PNG (alpha) |
| Home | Research — 5 tab images | `RESEARCH_IMAGES[0..4]` (shared) | 4:3 right-column image | One per program: financial inference, portfolios, humanitarian, AI systems, replication | landscape 4:3 | 1200×900 | photo/chart |
| Home | Projects — full-bleed band | `BAND_PLACEHOLDER[0..1]` (shared) | Full-bleed 2-up | Reproducibility artifacts | landscape | 1600×1200 | photo/diagram |
| Home | Systems — 3 category cards | `PLACEHOLDER_SLOTS_B[0..2]` (×5) | 3:4 tall image card | AI agents / deterministic infrastructure / human governance | portrait 3:4 | 900×1200 | photo/abstract |
| Home | About band — portrait | `PORTRAIT_PLACEHOLDER` (×5) | Square portrait | Active research work / human review (or founder portrait) | square | 1000×1000 | photo |
| Home | Principles grid | *(number tiles, no image)* | Numbered tiles | Optional: small icon per principle | square | 200×200 | icon (optional) |
| Home | Manifesto background | `BACKDROP_PLACEHOLDER` (×5) | Full-viewport closing bg | Reproducibility artifacts / abstract | landscape | 2400×1400 | photo/abstract |
| /research/[slug] etc. | (no imagery) | — | Text pages | — | — | — | — |

## Missing assets to create
- **Favicon** — none referenced (browser shows the framework default `src/app/favicon.ico`). Create `public/seo/cumulant-favicon.svg` and wire it in `src/app/layout.tsx` (`metadata.icons`).
- **Logo / wordmark** — the header now renders the text wordmark "Cumulant" (`Wordmark` in `src/components/Header.tsx`). Replace with a real Cumulant logo mark/SVG when available.
- **OG / social share image** — none set. Add an OpenGraph image and `metadata.openGraph` when branding exists.

## How to swap
1. Drop new files into `public/images/` (or a new folder).
2. Update the relevant slot(s) in `src/lib/site-images.ts`. Each themed slot is a
   `Record<Theme,string>` (or array thereof); point each theme to the new file, or
   collapse to one image across themes.
3. No component or layout changes are required — slots are consumed by component props only.
