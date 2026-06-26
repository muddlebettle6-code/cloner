# Seed Health — Page Topology

Target: https://www.seedhealth.com/  · Desktop width 1440px · Total height ~14,111px · root font-size **10px** (1rem=10px).

Page bg `#f4f4f0` (cream). Text `#000` / muted `#909090` (smoke). Single scroll container, no smooth-scroll lib (native). Heavy scroll-reveal animations (content fades/translates up as it enters viewport). Fixed header overlays everything (z-9).

## Layout system
- `<main>` is 1440px wide, padding 0. Inner content uses horizontal padding `px-15` (15px) mobile / `px-30` (30px) desktop on the header; section content blocks are padded individually (commonly 30px side gutters).
- Numeric Tailwind utilities = pixels (root 10px). For the clone, builders use **exact px arbitrary values** (e.g. `text-[80px] leading-[80px] tracking-[-1.6px]`).

## Sections (top → bottom), with pixel offsets at 1440px

| # | Component | top | h | Notes |
|---|-----------|-----|---|-------|
| H | **Header** (fixed) | 0 | ~60 | Logo (140×20 svg), nav: PLATFORM PROGRAMS PIPELINE US PRESS, 5 theme dots (Green/Red/Yellow/Blue/Silver). White text over hero. z-9. |
| 0 | **Hero** | 0 | 900 | Full-viewport themed bg image (`2I_hike_18` green). Editorial h1 80px white "Pioneering microbiome science for **human** *(struck/underlined)* and planetary health". Bottom-left "Play Video" + cycling scientist quote overlay. |
| 1 | **Quote — Fasano** | 1020 | 279 | h2 24px grey "Dr. Alessio Fasano" / "Seed Health Scientific Board" 18px grey + big 36px black quote. "Play Video" button. |
| 2 | **Hero media band** | 1419 | 576 | Full-bleed themed image (video "Powered By The Human Phenotype Project"). |
| 3 | **A Bio Revolution** | 2115 | 346 | 48px title + multi-paragraph editorial body (2-col) with footnote `1`. |
| 4 | **Bio Revolution images** | 2581 | 523 | 3 themed images (Tal Revolution + 2 masks), grid. |
| 6 | **End-to-End Platform** | 3224 | 653 | 48px title "End-to-End Platform —From Discovery through Impact" + body. 4-column accordion: DISCOVERY / DEVELOPMENT / CLINICAL / GTM, each expandable ("Plus") with sub-items. |
| 7 | **Human-First Discovery** (head) | 3997 | 62 | 48px title + subtitle. |
| 8 | **CODA / LUCA / ALLO cards** | 4179 | 607 | 3 image cards w/ overlay title + icon + READ MORE. Click → opens drawer ("Powered By The Human Phenotype Project" detail). |
| 9 | **Programs** (head) | 4906 | 130 | 48px title + intro. |
| 10 | **Programs tabs** | 5156 | 650 | Tabs INFANT/PEDIATRIC/ADULT/AGING. Each: body copy + KEY SCIENTISTS list + APPLICATIONS list. "open drawer" button. |
| 11 | **Programs images** | 5926 | 576 | 2 themed images. |
| 12 | **Pipeline** (head) | 6622 | 130 | 48px title + intro + "View" toggle. |
| 13 | **Pipeline table** | 6811 | 2466 | Toggle SELECT INNOVATIONS / CLINICAL ROADMAP. Filters: Path (ALL/THERAPEUTICS/CONSUMER), Program (ALL/INFANT/PEDIATRIC/ADULT/AGING). Rows grouped by category; each row = name + stage bar (DISCOVERY→DEVELOPMENT→CLINICAL→GTM progress) + product codes. |
| 14 | **Pipeline media band** | 9398 | 523 | 2 themed images. |
| 15 | **Environmental Health** (head) | 10041 | 182 | 48px title "Environmental Health" + SeedLabs intro. |
| 16 | **SeedLabs cards** | 10342 | 467 | 3 cards: CO₂ Capture / Plastic Upcycling / Honey Bee Resilience — image + title + blurb + READ MORE. "open drawer". |
| 17 | **Quote — George Church** | 10929 | 193 | h2 24px "George Church (Ph.D)" + board + 36px quote. |
| 19 | **Us** | 11242 | 705 | Themed image (Group_2608801) + "Us" title + blurb + LEARN MORE link → /us. |
| 21 | **Press** | 12067 | 567 | "Press" + VIEW ALL. Horizontal scroll/grid of article cards: image, date, READ, source, title → external links. |
| 22 | **Poem** | 12754 | 900 | Full-viewport themed bg image (`9C_sand` green). Centered serif/mono poem "ONE BILLIONTH THE SIZE…" + "GZA, THE SPARK". |
| F | **Footer** (contentinfo) | — | — | "Explore the art…" credits link; CONTACT / SOCIAL / SUPPORT columns; copyright 2026; Site Credits. |

Overlays: Cookie banner (OneTrust, bottom) — not cloned (or simple dismiss). Drawers open from CODA/LUCA/ALLO, Programs, SeedLabs ("open drawer" / READ MORE).

## Theme system
5 themes (Green default, Red, Yellow, Blue, Silver) swap **all photographic imagery** site-wide (hero, media bands, card images, scientist portrait, poem bg). Text colors unchanged. Press images + card icons (coda/luca/allo) are shared across themes. See `theme-image-manifest.json`.
