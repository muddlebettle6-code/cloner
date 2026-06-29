# Animation & Sound Libraries (inventory + expansion)

## Visual components — built so far (reusable)
**3D / dimensional** (`objects3d.tsx`, per-story): satellite, tower, phone · bubble (+burst), chip, data center · thermometer, barrel, gas pump, flame · gate, laptop, cart · **house, house+SOLD, supply row (new)**. Wrapper `Object3D` provides drei `Environment` + camera behaviour (drift, **push-in new**).
**Data viz** (`charts.tsx`, `housing_viz.tsx`): bar, table, line (draw+crash), circle-flow · **divergence line, mortgage-rate dial, cresting bars, 2008-split, price-tag flip (new)**.
**Type/number** (`components.tsx`): BigNumber, BigStatement, verbatim Subtitle, Mark, FollowCard.
**Transitions** (`SceneWrap`): zoom, push, slide, wipe, fade + **price-tag 3D flip (new signature)**.

## Expansion backlog (build per story, not all at once)
- **Objects:** coins/currency (retire the literal stack — use a different money device), documents/ballots, factory, server rack, power grid, vehicle/aircraft/ship, oil pipeline, food/grocery, phone/card, lock, clock, scale, bank, flag, satellite, medical, industrial machine.
- **Data visuals:** area, stacked bars, dot/scatter, heat map, **map + flows + Sankey**, ranked list, gauge family, before/after, indexed comparison, distribution curve, price tags, calendar sequence, network diagram.
- **Transitions:** match-shape, object wipe, camera pass-through, depth rack/focus pull, light wipe, number transformation, chart↔object, object↔map, text-mask, document-page, parallax fold, particle convergence, controlled hard cut, sound-led cut.
- **Continuity transforms (preferred):** tariff% → price tag, shipping route → inflation line, chip → data center, ballot → policy doc → household bill, oil barrel → energy chart, **rate dial → cash → flipped price tag (used here)**.

## Sound library structure (`public/audio/`)
Organize by function; never repeat the main impact/whoosh/riser across consecutive reels.
- **Impacts:** impact, boom, snap · **Air:** whoosh, whoosh_rev, swish, swoosh_dn, riser, subdrop · **UI/data:** tick, ding, pop, clink, flash, glitch, shimmer, down · **Money/consumer:** coin, (cash register tbd) · **Story-specific (new):** `paper` (documents/stickers), `stamp` (sold/approval), `crack` (stress/breakage). 
- **To add as needed:** mechanical movement, freight/metallic (shipping), electric texture (tech), muted-camera (public figure), data-pulse (markets), ambient beds.
- **Music:** OFF by default (per editorial preference). If ever used: CC-licensed only, credited, mixed under VO from a developed (non-silent) section, story-matched, never ad-like.

## Brand constants (never vary)
Black `#070708` / magenta `#ff2d92` / white. Neue Haas display + Akkurat mono. The distribution-curve Mark + "Cumulant." wordmark. Restrained close.
