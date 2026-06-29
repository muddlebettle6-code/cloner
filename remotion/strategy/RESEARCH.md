# Platform Research — IG & FB Reels (2026)

Confidence labels: **OFFICIAL** (Meta/IG docs/announcements) · **DATA** (broad credible study) · **PLAUSIBLE** · **OPINION** · **MYTH**.

## Distribution & retention signals
- **OFFICIAL — Watch time is the #1 Reels signal**, then **sends-per-reach** (DM shares), then likes-per-reach. Mosseri: pay attention to *average watch time, likes per reach, sends per reach*. (Social Media Today, Jan 2025; about.instagram.com ranking page.)
- **OFFICIAL — Sends > likes for *unconnected* (non-follower) reach**, and ~55% of Reels views come from non-followers → **sends are the growth lever**. Reels' top predictions, in order: reshare likelihood, watch-through, like, audio-page visit.
- **OFFICIAL — Watch time counts both completion % AND absolute seconds** ("we don't want to penalize longer videos"). So length isn't directly penalized — but see completion data below.
- **DATA — Completion correlates strongly with reach, and short completes far more:** 15–30s ≈ 58% completion; sub-30s > 72%; >90s < 20%. A 10s @ 80% beats a 60s @ 30%. **7–30s maximizes completion; match length to the goal.**
- **PLAUSIBLE — Saves ≈ "lasting value"** (community estimates ~3× a like; not an official figure). **Replays/loops** add to watch time (loop-friendly endings help).
- **DATA — Hook window ≈ 1.7–2.0s**; a 3-second hold-rate above ~60% is early proof the hook works.
- **OFFICIAL (FB) — Original Reels are surging**: FB original-Reels views/time ~doubled H2-2025 vs 2024; reaction/repost content deprioritized. FB 2026 added a **User True Interest Survey** layer (1–5 "does this match your interests"), so genuine topical relevance matters, not just raw engagement.
- **MYTH** — precise viral claims with no Meta confirmation: "50% retention at halfway = 4× reach," "same-day upload = +50%," "sends weighted 3–5× likes." Treat as folklore.

## Specs, safe zones, compression
- **OFFICIAL — 1080×1920, 9:16, H.264 + AAC, MP4**, ≤4GB. **30fps** safest. Enable **Settings → Data usage and media quality → "Upload at highest quality."**
- **DATA — Export ~8–12 Mbps** at 1080. Upload **1080, not 4K** (IG's 4K→1080 downscale softens; same-res recompress is gentler).
- **DATA — Safe zone:** keep critical text/subject inside the central ~**1080×1350** (middle 4:5). Avoid top ~14% (handle), bottom ~20% (caption + audio), right ~12% (action buttons), rounded corners.
- **Compression-proofing (dark/gradient video is worst case):** thick lines, large labels, controlled glow, a touch of **grain/dither** to stop banding in the magenta glows, strong contrast.
- **Cover:** IG center-crops the Reel cover for the grid → keep the subject/headline **central**.

## Originality / penalties / eligibility (all OFFICIAL)
- **Original content is favored; reposts/aggregator/watermarked content is deprioritized.** Must be ≤3 min + original to be recommended.
- **Unoriginal accounts lose non-follower recommendation reach**, account-wide, on a **rolling 30-day** recovery. As of **Apr 30 2026** this extended to photos/carousels too. Can also pull **monetization** eligibility.
- **Captions that only *describe* what's on screen, borders, speed changes do NOT count as "transformation."** (Not our risk — our reels are wholly original animation + narration — but worth knowing.)
- **Never upload watermarked files** (TikTok/CapCut/Shorts logos).
- **No hard engagement bait** ("comment X for the link," "tag 3 friends") — penalized.
- **Don't blind-cross-post the identical file to FB** — treat FB Reels as a separate post (separate caption; the UTIS rewards genuine interest fit).

## What this means for Cumulant reels
1. **Shorter.** Target the shortest that delivers context→evidence→consequence→payoff. For this story ≈ **35s**, not 78s.
2. **Engineer for sends + completion + saves:** a payoff worth DMing ("the sticker isn't the price"), a clean loop, a save-worthy tip.
3. **Hook in <2s**, legible first frame, the whole thesis stated fast.
4. **1080/30/H.264, ~10 Mbps, grain, "highest quality" toggle.** Separate IG vs FB captions. No engagement bait.
