# Publishing pipeline (FCRI agents -> the site)

This is the bridge between the research agents (FCRI) and the public site. Papers
are **data** in `content/papers/*.json`; the site reads them at build time. New
papers arrive as **drafts** and are hidden from the public site until you approve
them. Nothing goes live without a human step.

## The flow

```
FCRI finishes a project
        |
        v   python -m fcri publish <project>      (in the FCRI repo)
emits a "paper package"  (paper.json + figures/ + paper.pdf)
        |
        v   npm run paper:ingest -- <package-dir> (in the site repo)
adds a DRAFT to content/papers/  (hidden; assets copied into public/)
        |
        v   npm run paper:review          (see what's waiting)
        |
        v   npm run paper:publish <slug>  (you approve)
goes live -> npm run build -> push the cumulant repo (Netlify redeploys)
```

## Producing a package from FCRI (`fcri publish`)

In the FCRI repo (its virtualenv):

```
python -m fcri publish <project-path> [--output DIR] [--kind paper|note] [--no-compile]
```

It reads the finished project (`project_manifest.json`, `paper/main.tex`,
`figures/`, `agent_reports/research_memo.md`) and writes a package to
`<project>/site_package` by default. It extracts the reliable fields
deterministically (title, abstract, figures + captions, date), compiles the PDF
(tectonic/latexmk), maps the project's review state to an honest `statusKind`,
and sources caveats from real signals (fragility, simulated data, the project's
own limitations). Narrative fields (`contributions`, `honesty`) are best-effort
and worth a quick review. To pin polished content, add a `paper/publish.json`
(or a `metadata.publication` block in the manifest) with any `paper.json`
fields; those **override** the extracted values.

## Commands

| Command | What it does |
|---|---|
| `npm run paper:ingest -- <dir>` | Validate a package, copy its figures/PDF into `public/`, and add it as a **draft**. |
| `npm run paper:review` | List every paper with its state (DRAFT vs live). |
| `npm run paper:publish <slug>` | Approve a draft (make it live). `--unpublish` sends it back to draft. |
| `npm run build` | Rebuild the static export (then push the `cumulant` repo to deploy). |

## The "paper package" contract (what FCRI emits)

A package is a directory:

```
<dir>/
  paper.json        # fields below
  figures/          # the .png files named in figures[].file
  paper.pdf         # optional; the full paper (must be a real PDF)
```

`paper.json`:

```jsonc
{
  "slug": "kebab-case-id",            // required, unique, [a-z0-9-]
  "title": "...",                     // required
  "subtitle": "...",                  // optional
  "authors": ["Aryan Patel"],         // required
  "status": "Working paper",          // required, honest venue status (NEVER "published")
  "statusKind": "working-paper",      // required: submitted | working-paper | research-note | in-progress | experimental
  "date": "2026",                     // required
  "kind": "paper",                    // required: "paper" (full visual page) or "note" (lighter)
  "oneLine": "one plain-English sentence",  // required
  "abstract": "the real abstract",    // required
  "contributions": ["...", "..."],    // optional, key findings (honest, with caveats)
  "method": ["para 1", "para 2"],     // optional, accessible method paragraphs
  "figures": [                        // optional; files live in <dir>/figures/
    { "file": "fig1.png", "caption": "...", "alt": "..." }
  ],
  "dataNote": "what the data is",      // optional
  "honesty": ["caveat 1", "caveat 2"]  // optional but recommended
}
```

The ingest step copies `figures/*` into `public/papers/figures/` and rewrites each
figure to `src: "/papers/figures/<file>"`, and copies `paper.pdf` to
`public/papers/pdfs/<slug>.pdf` (setting the download link).

## Honesty rules (enforced / warned at ingest)

From `CONTENT_TRUTH_AUDIT`: honest statuses only ("Submitted", "Working paper",
"Research note", "In progress", "Experimental"), **never** "published" or "peer
reviewed" for unvetted work; label simulated/illustrative data; state result
caveats; no investment advice. Ingest **warns** on `published` / `peer reviewed`
/ em-dashes so a human can confirm before approving.

---

# Field notes (the daily loop)

Field notes are short, AI-assisted readings of current events through a research
lens. They are a **separate, clearly-labelled stream** from the vetted Papers,
and they flow through their own review queue. They are never published
automatically.

## The loop

```
daily (launchd)  ->  python -m fcri field-note          (FCRI repo)
   fetches news (GDELT) -> grounds in the knowledge graph -> drafts via the LLM
        |
        v   writes note.json
        v   npm run note:ingest -- <note.json>           (site repo)
   adds a DRAFT to content/notes/  (hidden)
        |
        v   npm run note:review            (see what's waiting)
        v   npm run note:publish <slug>    (you approve)
   goes live -> npm run build -> push the cumulant repo
```

## Commands

| Command | What it does |
|---|---|
| `python -m fcri field-note [--timespan 2d] [--topic ...]` | Fetch news, draft a note via the LLM, write `note.json`. |
| `npm run note:ingest -- <note.json>` | Validate + add it as a **draft**. |
| `npm run note:review` | List notes (DRAFT vs live). |
| `npm run note:publish <slug>` | Approve a draft (`--unpublish` reverses). |

## Daily automation (macOS, launchd)

`scripts/daily-field-note.sh` generates a note and ingests it as a draft (it does
**not** publish). To run it every morning:

```
cp deploy/com.cumulant.fieldnote.daily.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist
```

Edit the paths, run time, and `PATH` in the plist for your machine. No API key
is needed: generation uses your logged-in `claude` CLI (Claude Code), so make
sure `claude` (in `~/.local/bin`) is on the job's PATH. Each morning a fresh
draft is waiting; you review it, `note:publish`, build, and push.

## Honesty

Field notes are framing and analysis, **not** new empirical results. The
generator forbids invented statistics, always attaches "AI-assisted, not peer
reviewed, not investment advice" caveats, normalises dashes, and rejects
investment-advice language. The human review queue is the final gate.
