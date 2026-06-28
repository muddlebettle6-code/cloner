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

## Reels (9:16 video) — `scripts/social-reel.mjs`

A reel is built from a deck's saved `storyboard.json` (the carousel writes it), so
it tells the SAME story. Keep it **~30-35s**: trim to the strongest ~6 beats (hook
-> count-up/proof -> payoff -> CTA). Style: full-color photos with **Ken Burns**
motion; **white word-group captions** that pop in synced to the voice (pink is
reserved for the count-up numbers and the mark); **keynumber beats count up** from
0 to the figure; **crossfade** cuts; a soft **music bed** under the voice. The
voiceover is a **natural OpenAI TTS** voice (gpt-4o-mini-tts, nova) - never robotic
`say`. NEVER clip copyrighted news footage; reels are motion graphics from our
licensed images only. Drop a royalty-free track at `REEL_MUSIC` for real music.

## Brand context (applies everywhere)

- Logo / favicon: the **distribution curve + magenta dot**, transparent background.
- The public newsroom is **plain white / editorial**; the liquid-purple look lives
  ONLY on the internal dashboard, not the site.
- **No em dashes** in any rendered content.
- AI-assisted, source-backed, not peer reviewed; **every figure traces to a cited
  source**; honest status words only; no investment advice or solicitation.

When in doubt, match this document. If the user changes a preference, update this
file first, then the code.
