# Seed Health — Behavior Bible

## Global
- **Native scroll** (no Lenis/Locomotive/GSAP detected). Smooth via CSS only.
- **Scroll-reveal:** most blocks fade + translate-up as they enter viewport (content is invisible until scrolled into view). Builders should add a reveal-on-enter (IntersectionObserver) wrapper: from `opacity:0; translateY(~20-40px)` → `opacity:1; translateY(0)`, ~0.6–0.8s ease, slight stagger. Once revealed, stays.
- **Fonts:** Neue Haas Unica (400, sans, primary), Akkurat Mono (400, mono labels), system **Times** serif (used for big quote marks “ and possibly poem). `font-display: swap`.
- **Root font-size 10px** → site uses numeric utilities as px. Clone uses **exact px** via Tailwind arbitrary values.

## Header (fixed, z-9, h60, padding 20px 30px)
- **Text-color flip on scroll:** over the hero/dark image, logo + nav links + hamburger are **white (#fff)**. Once scrolled onto cream content (past hero, ~>viewport height OR when the section under the header is light), they turn **black (#000)**. Theme dots unaffected. Implement: track which section is under the header (or scrollY > heroHeight-ish) → toggle text color. Transition ~0.3s.
- **Active-section indicator:** each nav button is `flex-col items-center`; a small **dot (•)** appears centered *under* the active section's label as you scroll (PLATFORM dot when in platform range, PROGRAMS when in programs, PIPELINE, US, PRESS). Scroll-spy.
- **Nav buttons** scroll to their section (smooth scroll to anchor). Labels uppercase 13.3px Neue Haas Unica.
- **Theme dots:** 5 buttons, 22px squares (`rounded-[.2rem]`=2px), each shows a tiny `object-cover` thumbnail of that theme's hero image (Green/Red/Yellow/Blue/Silver). Active has a subtle ring/scale. Click → switches site-wide imagery.
- **Mobile (<768px / `md`):** nav links hidden, replaced by hamburger `open menu` (3 lines) at right; theme dots hidden (moved into menu). Logo + hamburger only.

## Theme switcher (signature feature)
- Switches **all photographic imagery** site-wide (hero, media bands, Bio-Revolution images, CODA/LUCA/ALLO card bgs, Programs tab images, Pipeline media band, SeedLabs cards, Us portrait, Poem bg). Text/colors unchanged (always black/grey on cream `#f4f4f0`).
- Implement via React context: `theme` ∈ {green,red,yellow,blue,silver}; each themed image slot picks its URL from a per-theme map (see `theme-image-manifest.json`). Shared across themes: press images, card diagram PNGs (icon-coda/luca/allo).
- Transition between themes: images cross-fade (~0.3–0.5s opacity).

## Section interaction models
- **Hero (0):** static bg image + headline. Headline line 2 has a decorative horizontal rule between "human" and "and planetary health" (desktop only; wraps plainly on mobile). A "Play Video" control + cycling scientist quote sit in the hero/just below.
- **Fasano quote (1) & Church quote (17):** static. Two-col: grey label (name + board) left ~⅓, big 36px black quote right ~⅔, with a Times serif “ opening quote mark. Fasano has a "Play Video" button.
- **Bio Revolution (3–4):** static. Lead line + body (left col) + small image top-right; then 2-image grid (full-bleed). Footnote superscript `1`.
- **End-to-End Platform (6):** **NOT tabs** — 4 simultaneous columns in a grey rounded panel (#f5f5f5-ish, radius ~20px). Each column: pill header (DISCOVERY/DEVELOPMENT/CLINICAL/GTM, rounded-full white w/ border) connected by **dotted flowchart lines** to a white card. Card = description + 3 mono sub-items (separated by thin rules) + a **"+" circle button** that expands to reveal each sub-item's description. Click-to-expand per card.
- **Human-First Discovery cards (8):** 3 square cards (CODA/LUCA/ALLO). Each = themed blurred bg image + centered white diagram PNG overlay (icon-coda/luca/allo) + title 36px white bottom-left + "READ MORE" + arrow. **Click → opens a slide-over drawer** (from right) with detail: title (e.g. "Powered By The Human Phenotype Project"), mono subtitle, body paragraphs, a large image, CLOSE (×) top-right. Drawer overlays full page.
- **Programs (9–11):** **Click-driven tabs** INFANT/PEDIATRIC/ADULT/AGING (`btn is-small is-active`, title-case text, displayed uppercase). Switching fades body copy + KEY SCIENTISTS list + APPLICATIONS list + the right-hand image. Content differs per tab (see `programs-tabs.json`). "open drawer" CTA. Below: 2 themed images.
- **Pipeline (12–13):** Filterable. View toggle SELECT INNOVATIONS / CLINICAL ROADMAP. Path filter ALL/THERAPEUTICS/CONSUMER. Program filter ALL/INFANT/PEDIATRIC/ADULT/AGING (pill buttons, active=darker grey). Rows grouped by "Category | Program" → subgroup (Consumer/Therapeutic Applications) → product rows. Each row (`grid-cols-12`): left `col-span-4` product name (text-14); right `col-span-8` = flex of **4 `flex-1 rounded-full h-10` segments**, `bg-black` (completed stages) or `bg-clay` (remaining). Stage labels DISCOVERY/DEVELOPMENT/CLINICAL/GTM above. Filtering hides/shows groups. Data + fills in `pipeline-data.json`.
- **SeedLabs / Environmental (15–16):** 3 image cards (CO₂ Capture / Plastic Upcycling / Honey Bee Resilience). Title top-left white, question blurb + READ MORE bottom. Click → drawer (same pattern as CODA).
- **Us (19):** static 2-col: themed petri-dish image left, "Us" + blurb + LEARN MORE pill (→ /us) right.
- **Press (21):** "Press" + VIEW ALL (→ /press). 3-col grid of article cards: square thumbnail left + [date · READ] row + source name + headline. Each links to external article (new tab). Hover: likely subtle.
- **Poem (22):** full-viewport themed bg + centered white **mono uppercase** verse (4 lines) + "GZA, THE SPARK".
- **Footer:** "Explore the art curated throughout our site. →" (→ /credits) left; CONTACT / SOCIAL / SUPPORT link columns right; "Copyright © 2026 Seed Health, Inc." + "Site Credits" (→ marcd.co).

## Hover states (observed/expected)
- Nav links, theme dots, filter pills, READ MORE / LEARN MORE / VIEW ALL: subtle opacity or underline on hover (~0.2s). Pill buttons: bg darkens on hover. Cards: slight image scale / overlay darken. (Confirm in QA; default to opacity 0.7 hover for links, bg shift for pills.)

## Responsive
- **md breakpoint = 768px.** Desktop ≥768 multi-column; mobile <768 single column, hamburger nav, side padding 15px (px-15) vs 30px (px-30) desktop.
- Hero headline shrinks (~80px desktop → ~36px mobile), decorative rule dropped on mobile.
- Platform 4-col → stacks; Discovery 3 cards → stack; Programs 2-col → stack (image below); Pipeline `col-span-8` bars hidden on mobile, replaced by inline "status: <Stage>" text under product name; Press 3-col → 1-col; Us 2-col → stack.
