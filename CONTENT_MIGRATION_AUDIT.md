# Content Migration Audit — Seed Health → Cumulant Research

Conversion of the cloned site into the institutional site for **Cumulant Research**.
Design, layout, motion, typography, spacing, transitions, component structure, and
responsive behavior were **preserved**. All written content, identity, links, and
metadata were **replaced**. Nothing was invented.

`npm run build` passes: 1 homepage + 9 content pages + 7 statically-generated project
pages (20 routes total). `npx tsc --noEmit` clean.

## Content architecture
All copy/data lives in typed content modules under `src/content/` (re-exported by
`src/lib/site-data.ts`); components contain no hard-coded prose. Project, system,
principle, method, research-program, and approach schemas are defined in
`src/content/types.ts`.

## Pages updated / created
| Route | Source / status | Content |
|-------|-----------------|---------|
| `/` | rewritten | Hero, positioning, intro, methods, approach, research, projects, systems, operating statement, about, principles, collaborate, manifesto, footer |
| `/research` | created | 5 research programs + featured projects grouped by program |
| `/research/[slug]` | created (7 pages) | Full project schema per project |
| `/methods` | created | 12 workflow stages + 4 phases |
| `/systems` | created | 11 systems grouped by 3 categories |
| `/principles` | created | 9 principles |
| `/about` | created | About, founder, technical infrastructure, data sources |
| `/collaborate` | created | Collaboration types + single email action |
| `/ai-disclosure` | created | AI-use statement, human responsibilities, AI boundaries |
| `/reproducibility` | created | What a serious release aims to include |
| `/corrections` | created | Version-history records (from project data) + schema |

## Homepage section → component mapping (composition preserved)
- Hero → `Hero` (added eyebrow + supporting copy + two CTAs into the existing bottom-left block)
- Positioning / operating statements → `QuoteBlock` (was the scientist quote)
- Intro → `Intro` (was "A Bio Revolution")
- Methods → `Methods` (was "End-to-End Platform" flowchart accordion; 12 stages in 4 phase columns, expand reveals descriptions)
- Approach → `Approach` (was Human-First Discovery cards + drawer; Human/AI/Deterministic, drawer lists contributions)
- Research programs → `Research` (was Programs tabs)
- Featured projects → `Projects` (was the Pipeline filter table; status → 4-stage progress bar, program/status filters, rows link to project pages)
- Systems → `Systems` (was SeedLabs cards + drawer; 3 category cards, drawer lists member systems)
- Principles → `Principles` (was the Press grid; thumbnail replaced with a number tile — no fabricated imagery)
- About → `About` (was "Us")
- Collaborate → `Collaborate` (new section, built with existing tokens — no new design system)
- Manifesto → `Manifesto` (was the poem; 4 principle one-liners)
- Footer → `Footer`

## Original references removed
- **Org name / brand:** "Seed Health" wordmark logo replaced with a "Cumulant" text wordmark; all body copy replaced.
- **People:** Dr. Alessio Fasano, George Church, Eran Segal, etc. — removed (no fabricated people added; only the real founder, Aryan Patel, appears).
- **Products / engines:** CODA, LUCA, ALLO, SeedLabs, DS-01/PDS-08/etc., microbiome/probiotic copy — removed. Internal image-slot identifiers renamed to neutral `PLACEHOLDER_*` names in `src/lib/site-images.ts`.
- **Emails:** `research@seedhealth.com`, `press@seedhealth.com` → `research@cumulant.org` (and `aryan@cumulant.org`).
- **Links:** seedhealth.com routes, `seed.com/join-us`, twitter/instagram/linkedin Seed profiles, all press article URLs, `marcd.co` ("Site Credits"), "Do Not Sell or Share My Personal Information" — all removed. Footer now links only to real internal Cumulant routes + the research email.
- **Misc:** GZA poem, "A Bio Revolution", "Human-First Discovery", "Play Video", Contentful press imagery references, the Seed favicon (`public/seo/seed-favicon.svg` deleted; favicon now unset — flagged below).
- Verified by grep: zero standalone Seed/Fasano/Church/microbiome/CODA/LUCA/SeedLabs/GZA tokens in `src/`.

## Placeholder images retained (temporary)
All imagery is carried-over placeholder art (theme-swappable). See `IMAGE_REPLACEMENT_PLAN.md`
for the full slot-by-slot plan. Components reference neutral slot names; image files are in
`public/images/`. The Principles grid uses number tiles (no placeholder photo).

## Missing assets
- **Favicon** — unset (framework default served); needs a Cumulant favicon.
- **Logo mark** — text wordmark only; needs a real logo when available.
- **OG/social image** — not set.
- All section imagery — placeholders pending replacement.

## Claims requiring future verification
- **Technical infrastructure counts** — stated qualitatively only (no module/test/directory
  counts). The Cumulant research codebase is **not present in this repository**, so counts
  could not be verified; `/about` explicitly says exact counts are not published here.
- **Diversification figure (≈1.78 percentage points)** — presented exactly as provided and
  scoped to the defined setup (S&P 500, 2021–2025, equal-weight 10/20/100); not generalized.
- **Backtest Inference** — desk rejection from the journal *Risks* recorded only in that
  project's version history; the work is labeled a working paper, never "published".
- Project statuses (in progress / working paper / research note / experimental / completed
  phase / concept) reflect the states provided; verify against the research repository before release.

## Accuracy-rule compliance (mandatory checks — all pass)
- Not described as a university, government institute, hedge fund, investment adviser, journal,
  large staffed institution, fully autonomous org, grant-maker, or consulting firm. ✓
- No invented publications, journal acceptances, advisers, researchers, offices, funding,
  partnerships, awards, media coverage, clients, performance records, or impact metrics. ✓
- Submitted/unpublished work is never called "published" or "peer reviewed". ✓
- AI agents are described as software roles (not employees) and are **not** listed as authors;
  human review is required before public release; AI does not approve its own work. ✓
- No investment-service or "manages outside money" language; CTAs avoid sales language. ✓
- Honest status states used throughout (research in progress, working paper, internal
  validation, experimental system, concept, etc.). ✓
- No lorem ipsum; no broken internal routes (all nav/footer/section links resolve). ✓

## Known gaps / incomplete
- Imagery, favicon, logo, OG image — placeholders / missing (above).
- The 5-theme switcher remains (swaps placeholder imagery only); it can be retired or
  re-themed once real assets land.
- `/corrections` currently surfaces one version-history entry (Backtest Inference); it grows
  as versioned outputs are released.
- `docs/research/seedhealth.com/*` (the original clone's research notes/screenshots) are left
  in place as build history; they are not part of the site and are not served.
