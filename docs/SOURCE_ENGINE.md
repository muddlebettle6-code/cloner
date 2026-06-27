# The combined newsroom: core engine + source-driven engine

The newsroom now runs two engines in parallel. They share the same content store,
schema, design system, quality gate, and deploy path; they differ in how they
find stories.

## 1. Core editorial engine (unchanged)

`scripts/news-watch.py` + `scripts/article-standalone.py` is the existing
autonomous engine. It scans recent news across the full taxonomy, scores and
diversifies, and writes a deep, fact-checked, illustrated article
(scout -> frame -> field study -> analysis -> write -> critique -> revise ->
verify -> illustrate -> classify), then publishes and deploys on its own. This is
untouched and keeps its rhythm, voice, formats, and visual identity.

## 2. Source-driven engine (new)

A parallel layer that reads primary sources directly instead of waiting for
another outlet to summarize them.

- **Source Monitor** (`scripts/source-monitor.py`) polls public, keyless APIs -
  SEC EDGAR (8-K / S-1 / prospectus filings) and the Federal Register (rules and
  proposed rules) - with a descriptive User-Agent and polite rate limits. It
  dedupes against a seen store, captures source metadata (url, published time,
  retrieval time, type, reliability), assigns a cheap preliminary score, and
  appends source alerts to `.article-builds/source-queue.jsonl`. No AI here.
- **Source Engine** (`scripts/source-engine.py`) triages the queue with the
  story-priority desk (most routine filings -> ignore; only consequential
  developments clear the bar), builds a web-grounded **research packet** for a
  qualifying event (impact map, the sharpest angle, confirmed facts vs reported
  claims, unknowns, confidence, and whether human review is required), checks
  editorial memory for duplicates, then routes:
  - **High-impact / sensitive** (legal, political, allegations, named
    individuals, market-moving, or priority immediate/high) -> a **draft held for
    human review**. It is never published from a single model output.
  - **Otherwise** -> a source-backed story is written and published.
  Writing reuses `article-standalone.py`, so source stories look and read exactly
  like the rest of the newsroom; they are then stamped with source metadata and
  the fact/analysis split.

The two engines share a lock (`watch.lock` / `source.lock`) so they never write
or deploy at the same time.

## Roles, not one model

The pipeline uses distinct prompted roles - source monitor (no AI), priority
triage, research packet (impact + angle + verification), and the core engine's
own critique/verify/adversarial passes - so no single model both drafts and
approves a story.

## Schema additions (back-compatible)

`Article` gained optional `sourceType`, `sourcePublishedAt`, `sourceRetrievedAt`,
`sourceReliability`, `priority`, `confidenceScore`, `verificationStatus`,
`humanReviewStatus`, `whatChanged`, `confirmedFacts`, `reportedClaims`,
`scenarios`, `updateHistory`, `researchPacketId`. New `SourceEvent`,
`ResearchPacket`, and `UpdateEntry` types describe the queue and packet. Existing
articles are unaffected.

## Where it surfaces

- **Article page** renders, when present: a primary-source line (type, confidence,
  verification), a "What changed" box, and a confirmed-vs-reported split.
- **Methodology page** (`/articles/methodology`) explains how stories are found,
  selected, verified, separated into fact vs analysis, and updated, and how human
  review works.
- **Dashboard** (`scripts/dashboard.mjs`) adds a Source-engine panel: docs queued,
  triaged, and drafts awaiting human review.

## Schedule

`scripts/source-watch.sh` runs the monitor then the engine. Install
`deploy/com.cumulant.source.plist` (every 60 min) to run it alongside the core
engine. Auto-publishing source briefs uses the same deploy token as the core
engine; high-impact drafts need no token (they wait for review).

## Safety

No invented sources, quotes, data, or market reactions. Estimates are not
presented as facts; allegations and high-impact claims are held for review;
social posts are not treated as confirmed evidence; the existing human-approval
path is preserved and extended. Only public, ToS-respecting sources are polled.
