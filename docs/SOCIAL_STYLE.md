# Cumulant social style — the canonical preferences

This is the source of truth for how Cumulant social posts look and read. The
generators (`scripts/social-carousel.mjs`, `scripts/social-card.mjs`,
`scripts/social-caption.py`, `scripts/social-images.py`) and any agent producing
social content MUST follow this. Keep it in sync with the code.

## The carousel (the main asset)

Format: 4:5 (1080x1350 logical), rendered at 3x for 4K-crisp output.

Hard rules (do not regress these):
- **Tell ONE clear story anyone understands, and INFORM as you go.** Most important
  rule. The deck is a storyboard (`getStoryboard` in social-carousel.mjs) written in
  PLAIN LANGUAGE for a general audience - avoid jargon or define it simply ("the
  price of oil", not "the front of the curve"). Slide 1 is a CLEAR HEADLINE anyone
  instantly gets (what happened + why it matters), not a cryptic teaser. Each slide
  makes one clear point and DELIVERS the information - do not withhold or save the
  key facts for the end; front-load them. Weave 2-3 charts where they help explain a
  point. Engaging but readable and self-explanatory; close on a one-line takeaway +
  save/share. Use only the article's facts; digits with spelled units ($72, $15.7
  billion, 75 percent), never number-words or bn/M.
- **Full-COLOR photos on every slide.** No duotone, no monochrome, no washing the
  color out. Photos are the point; keep them vivid.
- **Pink titles, white body.** Titles, hooks, big numbers, and the CTA line are
  magenta `#ff2d92`. Supporting/secondary text is white. Never tiny.
- **"Cumulant." wordmark top-right** on content slides; **bottom-center sign-off**
  on the final CTA slide. Always the text wordmark with a magenta period - never a
  logo mark on social.
- **A magenta arrow** (->) bottom-right on every slide except the last.
- **One font: Neue Haas Unica Regular**, embedded, everywhere. NO monospace /
  "code-like" font anywhere (no Akkurat Mono on social).
- **No clutter:** no slide counters (01/09), no kicker labels ("The story"), no
  source lines, no tick numbers, no small sub-captions.
- **Vary the text position** slide to slide (not always bottom-left) AND place the
  text over the image's **darkest third** with a matched dark scrim, so it is
  always legible.
- **Do NOT use background-removal / text-behind-subject overlays.** It was tried
  and looked unnatural; photo slides are plain colorful with the title on the dark
  area.
- **Spell out financial units** in all rendered text: `$44B` -> `$44 billion`,
  `76.8M` -> `76.8 million`. Leave `x` multiples and percentages alone, and never
  write the number itself in words ("$15.7 billion", not "fifteen point seven").
- **A different picture on each slide** (>=5-6 images per article;
  `social-images.py` tops up; cutouts cached in `.social-assets/`).
- **Surface the research.** The article's charts each become their own slide:
  big-number, bar, comparison, table, timeline, line, range - pink accent, white
  text, over a darkened photo.
- **Scroll-stopping hook cover** that is genuinely hooky (curiosity/tension) but
  also makes the topic clear - name the company, market, asset, or subject so the
  reader knows what it is about (not vague or cryptic). **Retention arc:** hook ->
  re-serve cover -> evidence -> research -> turn -> save/share CTA.

## Captions (per platform, in `captions.md`)

- **LinkedIn:** professional; hook + 2-3 sentence insight + a question + link + 3-5
  hashtags.
- **Instagram:** punchy hook + short context + "link in our bio" + 6-9 hashtags.
- **Facebook:** conversational 2-3 sentences + link.
- **Reddit:** analytical and **non-promotional** (Reddit dislikes marketing); a
  neutral title + a short analytical body + the link + an AI-assisted note.
- **X:** tight, <=270 chars, hook + link + 1-2 hashtags.
- Always: preserve the AI-assisted + source-backed disclosure, no hype, **no
  investment advice**, **no em dashes**, and list **image credits** for licensing.

## Platforms (autonomous posting)

Target set: **Instagram, LinkedIn, Facebook, Reddit, X.** Cater each post to the
platform's norms (see captions). Posting modules activate only when their
credentials are present.

## Reels (9:16 video) — Remotion project in `remotion/`

Reels are now built with **Remotion** (React/TS, 4K via `--gl=angle --scale=2`), not
the old ffmpeg script. The locked direction (0x100x-inspired, in Cumulant's style):
- **DARK mode**: near-black page + a subtle **grid** + a soft magenta glow. (Light
  mode was tried and rejected — text was hard to read.)
- **ONE text style**: white Neue Haas only. NO gray subtext, NO small sub-labels, NO
  second font. Magenta only for the one emphasised word/number. Center big numbers.
- **A visual on EVERY sentence**: each sentence is its own beat/frame with a **3D
  object, chart, table, big number, or graph** — never a bare text card. Related
  sentences reuse/extend a visual (small change); new ideas cut to a fresh one.
- **Detailed 3D** via `@remotion/three` + drei (environment reflections); magenta
  rim + white key. Make objects look good (clean, recognisable, not weird).
- **Flowy transitions** in the visuals (zoom / push / slide / magenta wipe / fade);
  each strong cut flies through. Match the cut to a **transition word** in the VO.
- **Deep male VO** (`gpt-4o-mini-tts`, `onyx`), human/documentary, with **transition
  words + at least one rhetorical question**; explain the situation, **what Cumulant
  found**, and **what it means for the viewer**.
- **Music**: an original composed bed (piano + drums) lives in `remotion/public/
  audio/music.mp3`. NEVER use copyrighted/viral tracks (infringement); to use a real
  song the user must drop a **licensed** MP3 there.
- **No end card / no Cumulant logo outro.** SFX: a different low sound per cut (never
  the same swoosh repeated). NEVER clip copyrighted footage. See `remotion/README.md`.

## Brand context (applies everywhere)

- Logo / favicon: the **distribution curve + magenta dot**, transparent background.
- The public newsroom is **plain white / editorial**; the liquid-purple look lives
  ONLY on the internal dashboard, not the site.
- **No em dashes** in any rendered content.
- AI-assisted, source-backed, not peer reviewed; **every figure traces to a cited
  source**; honest status words only; no investment advice or solicitation.

When in doubt, match this document. If the user changes a preference, update this
file first, then the code.
