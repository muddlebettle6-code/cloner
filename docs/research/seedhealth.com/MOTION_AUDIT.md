# Seed Health — Motion & Interaction Audit (for Cumulant parity)

Extracted from the live stylesheet + computed styles (see `motion-css.json`).

## Timing system
- **Easing (global):** `cubic-bezier(0.4, 0, 0.2, 1)` on essentially every transition.
- **Duration tiers:**
  - `0.15s` — generic utilities (`.transition`, `.transition-colors`, etc.)
  - `0.3s` — links, buttons, `.cta`, `.btn`, `.link-grey`, nav active dot (`.icon-dot` opacity), glass/hover buttons
  - `0.5s` — `header`, `.header-item`, `.header-theme`, `.sticky` (color flip + entrance + sticky transform)
  - `0.4s linear` — `.ar img` image fade-in (not used on the home page; Next/Image instead)

## Behaviors
1. **Scroll-reveal** — section content (`.section-wrap` + children) starts hidden and is revealed via JS-set inline `opacity`/`transform` (GSAP-style). Fades up subtly; children can stagger. Once revealed, stays.
2. **Parallax** — full-bleed media-band images sit in `overflow-hidden` containers and translate vertically as they pass through the viewport (observed `transform: translate(0px, -15%)` → `0%`). Subtle, ~±10–15%.
3. **Header** — fixed; text/logo colour flips (white over hero → ink over content) over `0.5s`. Header items (`.header-item`) animate in on load (`transform, opacity` 0.5s). Active nav dot fades (`.icon-dot` opacity 0.3s).
4. **Hover** — links/buttons transition colour over `0.3s`; a glass "Play Video" button fades in over the hero media on hover (opacity 0.3s); card images scale on hover.
5. **Theme switch** — imagery cross-fades (image `transition: all`); ~0.4s feel.
6. **Drawers** (CODA/LUCA/ALLO, SeedLabs) — slide in from the right with a backdrop fade.
7. **Scroll** — native (no Lenis/Locomotive; `scroll-behavior: auto`). Anchor nav is JS/smooth.
8. **Keyframes present:** `pulse` (loader), `marqyL/marqyR` (marquee — not visible on home), `blink`.

## Applied to Cumulant
- Reveal: fade + `translateY(20px)`, ~0.65s, gentle ease-out (`.reveal` in globals.css).
- Parallax: `MediaBand` images parallax on scroll (`Parallax` wrapper).
- Header: colour flip `0.5s`; header items + hero content animate in on load (`.enter` / `enterUp` keyframe, staggered).
- Hover: nav links / CTAs / pills transition over `0.3s`.
- Easing standardized to `cubic-bezier(0.4, 0, 0.2, 1)` to match.
- `prefers-reduced-motion` respected.
