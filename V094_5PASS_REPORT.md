# GUILD∞ v0.9.4 REFORM — 5-pass report

## Owner feedback
The previous v0.9.3 did not change the visual language enough. This pass treats graphics, effects, BGM and tempo as a reform, not polish.

## External reference policy
Direct copying is restricted to CC0/public-domain assets and permissively licensed code. Proprietary games are composition/tempo references only.

Verified references used to set the quality bar:
- `shorepine/kenney` — Kenney's CC0 library, including Isometric Medieval Town, RTS Medieval (Pixel), Tiny Town and UI assets
- `victorqribeiro/isocity` — MIT-licensed JavaScript isometric city-builder reference
- `btn0s/hearthfall` — MIT-licensed portrait/mood identity reference

The owner-review HTML remains self-contained and renders without network access. The canonical asset lane may replace the self-contained redraw layer with selected CC0 PNGs after owner approval.

## PASS 1 — ART / WORLD RENDERER
Replaced the flat top-down box renderer with a pseudo-isometric world:
- diamond terrain projection
- depth sorting
- layered conifer silhouettes
- faceted stone nodes
- 3-face building volumes
- pitched roofs, windows, doors, signs, crates, logs, forge fire, flags
- road cross and central settlement clearing
- full perimeter palisade, gate and four towers from one build action
- no camera shake, no grid movement

390x844: PASS, zero page errors.

## PASS 2 — GAME-NATIVE UI
Reworked the HUD away from dark web-dashboard cards:
- carved wood/brass top resource board
- parchment objective ribbon
- console-style bottom dock
- oversized central BUILD action
- illustrated build cards
- parchment resident roster with portrait cards
- initial objective now points directly to building, not grind

390x844: PASS, zero page errors.

## PASS 3 — EFFECTS
Added non-shake spectacle:
- dual expanding light rings
- radial rays
- construction light beams
- BUILD / BUILD COMPLETE / FORTIFY stingers
- leaf chips for wood
- sparks + stone fragments for mining
- floating resource numbers
- large wall construction sequence around the whole perimeter
- night tint and ambient motes

No random screen or camera shake.

## PASS 4 — BGM / SFX
Replaced the old procedural beeps with an original D-minor folk-builder arrangement:
- lute-like pluck layer
- flute lead
- bass layer
- hand drum
- shaker/noise percussion
- day/night adaptive mix
- separate wood, stone, build, fortify, resident-join and fail SFX

Audio-start browser QA: zero JS/page errors.
A 14-second offline WAV preview was rendered from the same motif for review.

## PASS 5 — TEMPO / REWARD CADENCE
- start stash: 6 wood / 4 stone / 4 food
- first house cost: 4 wood / 2 stone — immediately buildable
- auto gather: +3 per tick
- gather interval: 0.32s
- tree respawn: 5s
- rock respawn: 6s
- passive lumber/quarry interval: 0.85s
- normal building celebration: 0.62s
- perimeter build: 0.95s
- first house immediately introduces a named resident
- lumber/quarry/market also introduce specialist residents
- every resident has face, hair, skin, clothes, name, age, personality, mood, preferred job, bonus and quote

## Validation
- JavaScript syntax: PASS
- 390x844 fresh render: PASS
- 390x844 developed-town render: PASS
- 390x844 resident roster render: PASS
- wall-build effect render: PASS
- page-error collection across render runs: zero
- smooth analog input retained
- no screen shake path
- autosave hooks retained; browser sandbox blocks native localStorage origin QA in this environment, so device/stable-origin persistence remains a release-gate test
