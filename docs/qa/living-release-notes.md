# 村長、世界まで行くんですか？ LIVING04

A substantial World-only upgrade from c559b11. The exact release commit and public URL are recorded after publication.

## Player-facing changes
- Workers now harvest into visible stacked wood/stone/food, travel through existing gates to the depot, and credit storage only when actually delivered. Player harvest still credits immediately.
- Actual harvested/delivered ledgers, carried and away cargo, last60active-seconds receipts, storage wait and work status make output visible.
- Full storage, role change, night, reload and expeditions preserve cargo. Fallen workers leave recoverable parcels.
- Every8 handoffs starts a20-second festival with10% movement bonus. Rewards do not multiply resource stock.
-80 context lines /40 two-turn exchanges, observed shared-work and delivery encounters, named friendship/rivalry and resident journals. One pair at a time with perworker/global cooldowns.
- Large actual harvest decimals, four combo tiers, stacked cargo animation, depot delivery arcs, node squash, bounded particles and screen overlays. No camera shake.
-15 persistent trophies and selectable cosmetic titles, showing achieved trophies first.
- Wind, stream, birds, insects, leaves, butterflies, night fireflies and regional ripples. Three generated Japanese voice cues with cooldowns; existing11 musical scenes preserved.
- Phone production board, contextual resident handbook, achievement cabinet and explicit save-file move between origins. Import previews before replacing, retains previous save backup, and excludes purchase authority.

## Economy evidence
Baseline production was not generally broken:1/5/10 worker fixtures showed near-linear output. Missing individual ledgers, invisible immediate credit and scarce-node claims obscured work. Hauling introduces real travel cost. Worker harvest compensation2.0 was measured; in180seconds on the same original map wood1/5/10 banked108/444/876 and stone72/348/636. Five/ten wood banked totals remain approximately6% below baseline; carried resources are reported separately. This is not a claim of universally faster production.

## Validation and limits
- Task1:60 behavioral checks, including4gates×3roles, conservation, caps, night, role changes, death, expeditions, social exclusions and reload
- Living UI:35 checks, including360/390/844 widths, real embedded voice playback, bounded effects, trophy persistence, save export/import and purchase identity separation
- Screenshots under qa/living are actual Chromium renders of clearly seeded mobile fixtures driven by production code, not claimed natural progression
- Physical iOS/Android and subjective listening were not tested
- Stripe remains the existing honest preview unless a backend is explicitly configured; no real charge was made
- Official /mayor/ target identified, but current Vercel musicjapanllc scope returns403; no unrelated routes were changed
