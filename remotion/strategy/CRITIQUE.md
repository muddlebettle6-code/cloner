# Five-Critic Critique — Housing Reel (draft → revisions)

Reviewed the first full draft (`housing_draft_1080.mp4`) through five lenses. Blocking/significant issues were fixed, then the final was re-rendered (`housing_final_1080.mp4`).

## Critic 1 — Scrolling viewer (score 6→8)
- **Blocking:** first frame was a blurry house + "The" — wastes the stop window. **Fixed:** s1 set to a fast low-blur fade; house + $371,000 sticker legible by ~frame 8.
- Topic clear in <2s after fix; flip reveal rewards attention; "ask for the buydown" is save/share-worthy.

## Critic 2 — Retention editor (score 6→8)
- Drop-off risk concentrated at the opening (fixed) and the s3 supply beat (kept to ~6s with stacking motion).
- No dead seconds; transitions varied; first payoff ($48k) lands ~17s, twist + flip close strong. Loop (sticker→real→sticker) adds replays.

## Critic 3 — Motion designer (score 7→8.5)
- Strong within-beat motion (line draw, dial sweep, bars grow, 3D flip) — fixes the audit's #1 leak.
- **Significant:** rate dial value overlapped its label. **Fixed:** value moved down, label cleared.
- Not templated; new object system; magenta used for emphasis not everywhere.

## Critic 4 — News editor (score 8→8.5)
- All numbers trace to Census / Lennar / Mortgage News Daily / NAHB. $323,000 = $371,000 − $48,000 (consistent).
- The −13% is labeled **EFFECTIVE** on the chart (distinct from the official flat headline) — no false implication that it's an official figure. Framing fair; not investment advice.

## Critic 5 — Platform reviewer (score 6→8)
- **Significant:** captions sat low (bottom UI). **Fixed:** raised to centerY 1408 (central safe zone).
- **Significant:** dark + magenta will band under compression. **Fixed:** grain added on the IG/FB export; thick lines/large labels already in place.
- 1080×1920, 30fps, H.264 High, 11.3 Mbps, faststart — meets specs. Covers central for the grid crop.

## Net
Draft ≈ 6.6/10 average → after revisions ≈ **8.2/10**. Remaining opportunities (next iteration): a touch more environmental detail on the supply beat; optional A/B of cover B vs C in live testing.

## Round 2 — user feedback (post-v1)
Reviewer notes from the user: captions should be higher; some cuts "glitching"; SFX off; needs to be faster.
- **Glitch (root cause):** scenes faded out to black before the next appeared, and incoming content started ~8 frames late → ~0.25s dead black gap per cut. **Fixed:** removed the fade-to-black (scenes hold full until a hard cut), incoming content draws from frame 1, opacity floor 0.4 (no black flash). Verified frame-by-frame at every boundary — no dead frames.
- **Captions:** moved from lower-third (1408) to upper-third (470), clear of the top UI and the centre visuals.
- **Pace:** VO regenerated ~7% faster with more energy; per-beat padding trimmed; every reveal sped (dial 20f, line 38f, bars 15f, house entrances 10–12f). Runtime **44s → 39.7s**.
- **SFX:** re-timed to the new scene starts and de-cluttered (one transition sound per cut + one matched accent per event); levels eased.
- Final: `housing_v2_1080.mp4` (master) → grained IG/FB exports (1080×1920, 39.7s, 11.3 Mbps).
