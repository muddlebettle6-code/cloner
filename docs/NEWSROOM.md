# The Cumulant Newsroom

How the articles section works as a full financial-and-economic newsroom — the
editorial logic, taxonomy, selection engine, and the components that render it —
built inside our existing identity (Neue Haas Unica + Akkurat Mono, white / black
/ grey with a magenta section accent, the distribution logo mark, the `Reveal`
scroll system, rectangular imagery).

## Editorial taxonomy

`src/content/newsroom.ts` is the single source of truth.

- **Sections** (`SECTIONS`) — ~25 desks (Markets, Economy, Politics, Policy,
  Geopolitics, Business, Technology, AI, Banking, Investing, Personal Finance,
  Real Estate, Energy, Commodities, Healthcare, Consumer, Labor, Trade, Deals,
  Crypto, Global Markets, Research, Explainers, Opinion, Breaking). Each carries
  subtopics, a flexible story-mix weight, and a nav flag.
- **Article types** (`ARTICLE_TYPES`) — 12 shapes: Breaking, News Analysis,
  Market Brief, Explainer, Data Story, Company Analysis, Policy Impact,
  Geopolitical, Personal Finance Guide, Long-Form Feature, Research Note, Opinion.
- **Controlled tags** — `normalizeTag()` / `dedupeTags()` collapse aliases to one
  canonical label ("Artificial Intelligence" -> "AI") so similar ideas never
  split into duplicate tags.

Every published article carries a `primarySection`, an `articleType`, structured
tags (`companies`, `people`, `regions`, `industries`, `assetClasses`,
`impactTags`, topic `tags`), a `readerLevel`, a `timeHorizon`, a `newsScore`, a
`confidenceLevel`, and the editorial boxes `keyPoints` / `whyItMatters` /
`whatToWatch`. The full schema is in `src/content/types.ts` (`Article`).

## Why the old system was narrow, and the fix

The scout prompt limited the universe to "markets, finance, IPOs, tariffs, AI
investment, disclosure, economic policy" and asked for *the single most
significant event*, so it converged on big finance M&A / IPO news every cycle.

The selection engine (`scripts/news-watch.py` scan + `scripts/article-standalone.py`
classify) now:

1. Scans the **whole universe** above.
2. **Scores** candidates — economic impact 20%, reader interest 15%, timeliness
   15%, market relevance 15%, policy/geopolitical 10%, original-analysis 10%,
   breadth of consequences 10%, source quality 5%.
3. Requires the story to **connect** an event to markets, companies, industries,
   households, and the wider economy — not just a market reaction.
4. **Rejects** thin press-release rewrites, minor announcements, low-impact IPO
   updates, predictable recaps, weak sources, and already-saturated stories.
5. Applies **diversity**: the watcher records each story's section in
   `.article-builds/covered.jsonl` and steers away from desks already
   well-covered recently, toward under-served ones.

The watcher passes the chosen `--section` to the writer, which classifies the
finished piece (section, type, tags, key points, why it matters, what to watch)
and sources an openly-licensed image.

## What renders it

- `src/app/articles/page.tsx` — newsroom homepage: topic nav, lead story +
  latest stream, desk modules.
- `src/app/articles/topic/[slug]/page.tsx` — per-desk topic pages (+
  `topics/page.tsx`, the topic explorer).
- `src/app/articles/[slug]/page.tsx` — article page: section kicker, type +
  publish/updated times, hero image, quick version, why-it-matters and
  what-to-watch boxes, glossary tooltips, methodology, sources, tag chips,
  related stories.
- `src/components/article-cards.tsx` — the reusable card system (`LeadCard`,
  `StoryCard`, `ListRow`, `CompactRow`, `SectionTag`, `Meta`, `TopicNav`).
- `scripts/dashboard.mjs` — the editor dashboard adds desk coverage and editorial
  alerts (desk over-concentration, repeated company, single-source stories,
  missing "why it matters", missing metadata) and per-article news scores.

## Standards preserved

Source hierarchy, fact-checking, and honest framing are unchanged: every figure
traces to a cited source, the verify stage fact-checks each number against
primary or reputable sources, AI is described as software, opinion is labeled,
and nothing is presented as more certain than the evidence supports.
