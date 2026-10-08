# Task 2 + 3 — world simulation and living village

Status: complete. Combined assignment followed parent ruling because both modules share simulation hooks. No subagents spawned. Read AGENTS.md and mandated legacy specifications. No shared legacy/UI/payment files changed by this task.

## Changed / Files

- `chief-world-config.js`: private save priority, source backup fallback, copy-only import, permanent reset/import marker, basic roster record/ID sanitization before legacy loading.
- `chief-world.js`: five playable regions, independent scenes, terrain palettes/static props, regional gathering/depletion/regrowth, unlocks, outposts, enemy behavior, named regional bosses, safe retreat, discovery journal, persistent worker expeditions, bounded state normalization, additive core hooks.
- `chief-events.js`: resident moods/factions/one-neighbor relationships, periodic visible life events, three original petition templates with three choices each, cost validation, active-time delayed outcomes, approval/happiness, free night-defense commands, fifth-night crowned home warden.
- `tests/world-simulation.cjs`: 38 deterministic Playwright integration checks. Optional `WORLD_TEST_SERVE=1` starts and cleans up its own Python server because this environment isolates localhost across exec calls.
- This report.

All required public methods match the task brief, including `Council.ensure(worker)` returning the persistent life object directly. No required API deviations. Extra internal persisted fields include world `serial`, `home`, `whistleRemaining`, `rallyRemaining` and council `defenseMode`, `defenseRemaining`, `defenseCooldown`.

## Behavior / safety details

Each map owns 18 nodes and 7 enemies (one boss), below 24/12 bounds. Five region definitions and special resources are fixed. First four nodes are near the safe entrance; enemies engage beyond the safe radius and within their detection distance. Region terrain landmarks are groves / cliff strata / pools / lava seams / wooden docks. The renderer culls props, nodes, and enemies outside the view and uses the existing player/effect pipeline. Forest tree grain/crown highlights and ground tufts were added following parent visual review.

Each 0.52-second stopped gather adds special resources and a bounded basic yield. Lifetime collection unlocks the next region at five and is separate from spendable resources. Special inventories cap at 999, lifetime journals at 999999; logs at 40. Outpost levels 0–5 spend 6/12/18/24/30 local resources plus wood/stone, and improve gathering/expeditions. Regional bosses reward 12 special, 3 iron and 3 renown once per region, using the clear ledger; respawns do not repeat first-clear rewards. A defeat restores 70% health and returns to saved home coordinates with input cleared, without a retreat fee.

`state.nodes` and `state.enemies` are never swapped for region arrays. Away wrappers suppress home production/combat/lifecycle/phase while Chief forge and expeditions continue on active time. Parent added the necessary early guard inside the *captured legacy interval* `repairResourceLifecycle`, and guarded Pocket's private keyboard whistle/minimap/cache routes. Without that captured-interval guard, home resources would still regenerate while away. Home rendering is unchanged; regional rendering replaces draw only while away.

Expeditions reserve 1–3 unique, living existing workers and allow one job at a time. Present residents continue legacy production/combat; away workers are excluded from iteration and rendering. Iteration temporarily scopes the roster inside a `try/finally`; the serialization wrapper always writes the complete roster even if legacy combat saves from inside that scope. The test specifically triggers a save inside `towerCombat` and verifies party preservation. Worker objects remain the same throughout dispatch/claim/cancel. No workers are created on return. Only matching flags are cleared. Training/reassignment and damage of expedition members are rejected. Jobs are removed before their rewards, so replay returns false. Reward snapshots, reservations, and remaining times survive reload; malformed/orphan reservations are released. Ready jobs remain reserved until claim or cancellation.

Council queues are bounded: pending 1, delayed read cap 8, news 30, resolved ledger 80. Petition text/effects are rebuilt from canonical templates instead of trusting saved option costs. Choices validate cost before changing anything, mark resolution before effects, and queue one 35-second outcome; due outcomes are removed before award. Life events happen about every 25 active home seconds; first petition about 20 seconds, then 75. Mood modifies real worker movement by 0.93–1.05; faction assignments use Citizens' creation-time `number`. Defense commands have 12-second effect / 45-second cooldown; rally costs food12 and grants +25% damage; shelter cuts incoming player/resident damage30%, regenerates modest HP, and cuts harvest40%. Fifth-night warden is marked before spawning/saving and remains single on reload.

Regional player attacks consult only `ChiefShop.damageMultiplier()`; regional received damage calls the parent's wrapped `damagePlayer`, so the mech shield is not applied twice. Regional whistle shares Pocket cooldown and maintains an active-time remaining counter across reload. No offline rewards or production cheats were added.

## Tests

Final command: `WORLD_TEST_SERVE=1 CHROME_PATH=/tmp/chromium node tests/world-simulation.cjs`

Result: **38 PASS, 0 FAIL, zero uncaught browser errors**, exit0. Also `node --check chief-world.js` and `node --check chief-events.js` passed. Parent independently owns actual pointer/viewport/shop regression and existing Chief regression.

Checks:

1. World/Council boot with five regions.
2. Initial unlock and invalid/locked destination rejection.
3. First-region visit.
4. All five regions collected and unlocked in sequence through proximity/playerGather (no collected-counter seeding).
5. All four home arrays and cycle unchanged by travel.
6. Home unchanged across real loop + legacy interval elapsed while away.
7. Away scene/home origin survive reload.
8. Free return restores home coordinates and clears movement.
9. Outpost pays special and basics while lifetime unlock remains.
10. Node depletion and active-clock regrowth.
11. Menu prevents explicit world clock advancement.
12. Free player damage equals base28.
13. Regional boss reward/journal idempotent across respawn.
14. Downed regional player safely retreats.
15. Duplicate/missing/invalid/empty expedition rejection.
16. Insufficient food leaves no reservations.
17. Dispatch charge, reservation, concurrency and assignment/training guards.
18. Nonparticipants keep producing; expedition participant unchanged; IDs stable.
19. Save from inside scoped legacy update contains whole roster.
20. Expedition remaining time/reservations survive reload with no offline credit.
21. Early claim rejection and atomic, replay-safe cancellation.
22. Ready expedition grants resources and XP once with worker object preserved.
23. Three-choice petitions reject unaffordable/invalid choices atomically.
24. Petition choice replay rejected.
25. Delayed outcome remaining time survives reload.
26. Delayed outcome awarded once.
27. Mood has real bounded movement effect.
28. Defense requires night/dusk.
29. Rally disclosed cost and cooldown enforced.
30. Effect ends before cooldown.
31. Fifth-night boss spawns once.
32. Fifth-night boss remains single across reload.
33. Chief migration priority and unchanged source bytes.
34. Reset prevents reimport.
35. Corrupt Chief import falls back to Pocket.
36. Corrupt primary falls back to private backup.
37. Corrupt nested world/council/life and duplicate worker IDs normalize without throw.
38. No uncaught browser exceptions.

During development, the first freeze assertion caught a test snapshot taken a frame before departure; moved departure and snapshot into one evaluation. The mood assertion then exposed a real stale-reference issue: `ensure()` replaced the life object; changed it to mutate the same normalized object. Full suite rerun passed. Final cap adjustment from 9999 to 999 is a constant-only bounded-inventory reduction after that run.

## Known risks / merge notes

- Tests use a resource-rich town fixture and deterministic positioning/manual dt to cover long progression without hours of waiting. They do not claim organic town build pacing. Regional unlock rewards themselves are earned through the real gather API. Parent owns gesture/UI testing.
- Existing home resource lifecycle still uses legacy wall-clock respawns while at home; requested away freeze is enforced by the parent's interval guard. New regional/council/expedition timers use simulation time only.
- Region enemy patterns are intentionally modest (runner/brute/spitter, crowned boss) and share the existing original enemy art; this is additive expansion rather than an engine rewrite.
- Very long play can fill capped special inventory after all outposts are complete; the journal still counts discoveries and basic regional yields continue. No uncapped economic runaway.
- No physical mobile device or audio hardware tested here.
- Commit only the five task-owned files. Parent must include shared Pocket/stability guards, entry ordering, UI/audio/shop and build changes in integration commit.

## Review round 1 — resolved

Read `.superpowers/sdd/2026-10-08-world-v3/task-2-review.md` verbatim. Resolved both findings. This appendix supersedes the earlier recurring-special-material-sink limitation.

Added `WorldGame.trade(regionId)` and `WorldGame.tradeCost(regionId)`. Every unlocked region accepts 25 of its special resource for iron1 and renown2, including after outpost level5. Invalid/locked IDs, insufficient inventory, active shared cooldown, and both rewards already capped reject without mutation. Iron caps99999, renown999999, shipment count per region caps999999. The30-second cooldown is persisted as active simulation time, freezes in menus/hidden pages via the existing world tick gate, and resumes without offline credit. Successful trade records a journal entry and toast, updates a per-region shipment count, and saves immediately. Lifetime collection/unlocks are unaffected. The parent owns the trade-button/UI integration. No purchase effect multiplies shipping rewards.

Added `WorldGame.hasResident(id)` as the authoritative living-resident membership check against `roster || state.workers`. `Council.ensure()` now uses this complete roster instead of the temporarily scoped production roster. Dispatch no longer erases friendship while another worker moves; genuinely dead or removed residents do not validate as friends.

Changed only task-owned `chief-world.js`, `chief-events.js`, `tests/world-simulation.cjs`, and this report.

Validation:

- Before implementation, expanded tests failed as expected at `TypeError: WorldGame.trade is not a function`.
- Command: `WORLD_TEST_SERVE=1 CHROME_PATH=/tmp/chromium node tests/world-simulation.cjs`.
- Final output: **TOTAL47;47 PASS,0 FAIL; zero uncaught browser errors**, exit0.
- New coverage: live friendship preservation through scoped moving-worker update; clearing truly dead friendship; repeatable trading after completed outpost; exact charge/reward and lifetime unlock preservation; shared cooldown and atomic rejection; menu pause; shipment/cooldown persistence on reload; insufficient stock rejection; fully capped rejection and partially capped reward. Initial unlock test also verifies trading into a locked region fails.
- Original38 checks continue to pass, including the final inventory cap999 adjustment.
