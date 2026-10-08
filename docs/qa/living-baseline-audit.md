# Living village baseline audit

Role: read-only economy, worker lifecycle, and integration audit. Baseline: `c559b1145ebeac01f88d6bc55423172cf93a4811`. Date: 2026-10-08.

## Changed / Files

No gameplay source changes. This report and two requested baseline screenshots were added:

- `docs/qa/living-baseline-audit.md`
- `qa/living/before-production.png`
- `qa/living/before-people.png`

Read AGENTS.md, V14_SETTLEMENT_GROWTH.md, V13_CORE_REPAIR_AUDIT.md, BUILDJOY_CORE_V10.md, GUILD_RULES.md, COLLAB.md, UI_DIRECTION_V06.md, V05_PRODUCT_DIRECTION.md, and POCKET_HANDOFF.md before the focused audit. This is the legacy Chief World edition, not the unrelated new game.

## Main finding

The reported impression of unproductive workers is not explained by a general failure of the current worker production loop. Real production-page fixtures show approximately linear output with 1, 5, and 10 workers when resources and storage are available. All four gate routes produced and returned home successfully. There are concrete visibility and model gaps: resource credit is immediate and often offscreen, no cargo or delivery state exists, the per-worker legacy production ledger is bypassed, and contextual life is mostly periodic text unconnected to current actions.

Adding return trips will reduce throughput unless gather rate or cargo batch size is explicitly tuned against this baseline. A visible haul mechanic alone is not an economy fix.

## Tests

Used the exact baseline `prototype-chief-world-standalone.html`, served from a temporary `git archive c559b11` checkout, with Playwright Chromium `/tmp/chromium` at 390×844. No current source edits were used. Python HTTP server and browser ran in the same execution process/network namespace.

The fixtures suppress requestAnimationFrame and call the production `updateWorkers(1/60)` synchronously. They do not replace worker movement, targeting, yield, gates, storage, XP, or respawn functions. Date.now advances at 60 Hz so home-node wall-clock respawns remain valid; Math.random uses a deterministic LCG seed of 99 reset for each case. The original seeded node array is cloned each run, then `clearInside()` applies the real Lv1 wall zoning. Original supply is 32 trees, 20 rocks, and 14 food nodes. Respawn uses the actual `respawnNodes` function each step. Time-of-day is held at day, enemies are absent, player is far from resource nodes, worker morale is 100, worker trait is 5 (no daytime harvest/speed modifier), starting citizen level is 1, mood is 65, policies/technologies are zero. Workers start at (0,45) with the same home. Normal citizen XP/level gains remain enabled. Lv20 warehouse prevents resource caps; no storage-full worker states occurred in these comparisons.

### Same original map supply, Lv1 wall, 180 seconds

| Role | 1 worker | 5 workers | 10 workers | First yield |
| --- | ---: | ---: | ---: | ---: |
| Wood | 96.638 | 476.146 | 929.397 | 3.833 s |
| Stone | 67.686 | 337.696 | 621.036 | 7.800 s |

Ten woodcutters spent 91.1% of worker frames working; ten miners spent 86.7%. Remaining frames were movement, with no idle or storage-full frames. The modest sublinear scaling follows longer target travel and depletion/retargeting; every worker earned production XP. The ten-worker stone outcome is 9.17 times one-worker output; wood is 9.62 times.

### Same abundant nearby supply, no wall, 120 seconds

Twenty same-role nodes, each 10,000 HP, in a fixed small grid around workers; respawn not needed. No per-count supply increase.

| Role | 1 worker | 5 workers | 10 workers |
| --- | ---: | ---: | ---: |
| Wood | 67.777 | 338.886 | 677.773 |
| Stone | 47.883 | 239.414 | 478.829 |

This isolates production from travel and depletion. Output is linear to reported precision. First wood yield is 1.5 seconds, stone 1.8 seconds. Each worker's `citizen.total` increases; `totalGathered` remains absent in these fresh fixture workers because the current Chief loop never calls `recordRemoteYield`.

### Four gate journeys

One worker at home, one nondepleting tree 80 units beyond the chosen gate's outer waypoint, Lv1 intact wall. Run 30 daytime seconds, then 30 nighttime seconds.

| Gate selected by real nearestGateFor | First yield | 30 s production | End of night journey |
| --- | ---: | ---: | --- |
| North | 6.417 s | 13.60 wood | Sleeping, hidden at home, no transit |
| South | 4.450 s | 14.45 wood | Sleeping, hidden at home, no transit |
| East | 6.533 s | 13.60 wood | Sleeping, hidden at home, no transit |
| West | 6.533 s | 13.60 wood | Sleeping, hidden at home, no transit |

No current systemic gate freeze reproduced. Building collision is not part of `gfStep`; do not misinterpret its direct stepping as a newly verified building-obstacle pathfinder.

### Claims and capacity edge cases

- Five workers / one eligible live tree / no respawn: one works, four remain idle. Output is 5.1 wood in 10 seconds, the same as one worker. Exclusive claims have no sharing fallback when all nodes are claimed. This is a real supply bottleneck, not a failure under the default 32-tree supply.
- Two workers seeded with the same existing target both keep it and produce 10.2 wood in 10 seconds. The claimed set prevents new duplicate claims but does not repair duplicate existing claims. Current valid fresh hires choose unique nodes when supply permits.
- At capacity minus 0.005, the worker enters `storage-full` and drops its target because the worker loop uses `capacity - .01`. This is a negligible rounding margin, not evidence of a large hidden cap defect.
- Regular lethal `damageWorker` clears the target immediately; the 0.85-second death fade is removed by `updateHumanLife`. Thus a dead worker does not normally reserve a node indefinitely. Malformed persisted dead workers with stale targets are a sanitation concern, not a demonstrated ordinary-play stall.

### Serialization probe

Injected a test-only worker field `cargo={wood:2.55,stone:.72,food:0}` and `cargoMode='returning'`, then called production `save`, compared `serial`/localStorage contents, and reloaded the real page with RAF disabled. Both cargo JSON and mode survived exactly. Baseline serialization stores the whole worker object; no field whitelist needs expansion. This does not establish cargo gameplay correctness or corrupt-save sanitation for a future model.

No uncaught browser errors in these fixtures or the reload probe.

## Screenshots

Both screenshots are **seeded visual fixtures, not natural progression evidence**: ten workers (five woodcutters/five miners), two Lv2 homes, a Lv2 warehouse, a lumber yard, Lv1 wall, and ten long-lived southern resource nodes. The production screenshot follows 18 seconds of actual worker simulation with real current art, HUD, and UI. The people screenshot uses the real resident panel. No image manipulation.

- `qa/living/before-production.png`: many workers harvesting beyond the south gate, immediate resource credit, no carried items.
- `qa/living/before-people.png`: the ten mood/faction rows occupy the initial resident-panel viewport before the detailed worker cards. Production/assignment information is pushed below the initial view.

## Causal code findings and safe integration hooks

### Production / attribution

`chief-citizens.js:updateWorkers` is the effective civilian loop before `chief-world.js` wraps it. It sets both `Citizens.actor=w` and `Chief.setActor(w)` for each worker, then calls global `hitNode(n,'worker')` at the work-cycle boundary. `chief-economy.js:hitNode` knows the private actor and source; its exact pre-storage gain is `(tree .85 / rock .72 / food .8) * gatherMultiplier(source,type)`. The multiplier already includes technology, buildings, policy, trait, and citizen level. Player gathering uses separate base values, combo, rally, and `pocket.gathered` tracking.

Prefer a first-class worker harvest result/cargo addition inside Chief's existing source-aware hit function. Keep player `addRes` immediate. Do not simulate cargo by observing global resource increments and subtracting them afterward: that loses yield against full storage, couples cargo to `addRes` clamping, confuses shelter penalties and XP attribution, and creates serializable transient credits. `Chief.gatherMultiplier` is public, but the baseline private actor must be set correctly if called for a worker outside the worker loop.

`recordRemoteYield(w,type,before)` is currently bypassed by Chief. It computes the global resource delta and populates `totalGathered`, `lastYieldAt`, `lastYield`, and `lastYieldType`; consequently it is unsuitable as an unchanged cargo-harvest ledger. Decide explicitly whether the visible lifetime total means harvested or delivered and record actual values at that event. XP should be granted once, with no second award at unload.

`chief-events.js:hitNode` wraps the economy and applies shelter by reducing the global state delta to 60%. A cargo harvest that no longer changes global state will escape this penalty unless the source-aware yield calculation incorporates shelter or the Council wrapper applies its effect to the cargo result. This is the highest-risk hidden integration dependency.

### Movement / night / reassignment

Use existing `gfMove` for a deterministic gate-aware trip to a stable in-town deposit point. Its `_gateTransit` is persistent plain data. Changing goals must cancel or revalidate an old transit. Current home logic runs before harvesting at dusk/night and clears `targetId`. Insert a deliberate carrying-return/deposit decision before a worker can become hidden/sleeping, or retain the cargo while asleep and resume delivery on dawn. Do not silently erase cargo on a phase change.

Existing worker targets are retained solely by matching live node ID, without validating role/type or duplicate ownership. New cargo states should release target claims and reset stale target/transit/work state on reassignment. `Citizens.reassign` currently changes role/HP, clears target and transit, and saves, but does not reset `work` or future cargo. Preserve already harvested resource type through role changes and deliver it once. A role reassignment must not convert carried wood into stone.

`gfStep` advances `anim` but has no collision with buildings, no worker separation, and no facing update. New deposit locations must avoid roofs/footprints; wide visual carrying offsets cannot be treated as collision geometry.

### Save / death / expeditions

`buildjoy-v16-3.js:serial` stringifies state. `apply` retains workers wholesale; Chief and Citizens normalize selected fields but preserve added ones. Add bounded finite cargo normalization in the earliest relevant citizen initialization path; don't normalize from draw calls in a way that changes legitimate cargo. Saves occur every second and on lifecycle/mutation events. Modify cargo and bank synchronously, reduce/remove only the actually deposited amount, then save so reload cannot replay a deposit.

`damageWorker` sets dead and clears targets; `updateHumanLife` deletes the worker after the fade. A cargo death rule must run at lethal damage or before removal. Merely drawing carried cargo until removal will lose it. Keep the rule explicit (drop, bounded recovery, or documented loss) and do not auto-deposit by accident.

`chief-world.js` captures `updateWorkers` into `workers0` at module load and filters expedition members using `residents`. Place a replacement worker loop before this layer, or preserve its wrapper. A late global replacement bypasses away freeze and expedition exclusion. `residents` temporarily replaces `state.workers`; its `serial` wrapper ensures the full roster is saved even if an inner callback saves. Use `WorldGame.hasResident` when validating friendship IDs so an expedition friend is not erased by temporary scoping.

`WorldGame.dispatch` clears target and marks state `expedition`, but retains the worker object. Return/cancel removes expeditionId and sets idle; carry fields would survive. Either require unloading before departure or deliberately freeze cargo with the resident and resume afterward. Never grant cargo at both dispatch and return. Existing wrappers reject training/reassignment for dispatched residents and skip their draw/damage. All home worker simulation freezes when the chief visits another region; cargo timers should preserve that behavior.

### Life / rendering

`Citizens.say` already provides global three-second speech exclusion, nearby-player range 170, and hidden-at-home exclusion. Current idle chatter repeats one trait quote every 14–21 active seconds. `Council.lifeEvent` every 25 seconds selects residents by serial, overwrites reciprocal friend IDs, adjusts one scalar relation, and narrates help/disputes without spatial/work/cargo checks. It excludes expedition members, but is not an observed interaction. Replace or route these through actual nearby participants and known current context; avoid adding a competing unbounded chatter timer.

`chief-art.js:drawPerson` wraps the Pocket pixel actor and adds trait details/name; `drawWorkerEntity` already handles hidden/dead actors, with a later World wrapper hiding expedition members. Carry visuals can sit in the actor draw extension so depth sorting remains tied to the worker. Keep wrapper visibility rules. `buildjoy-pocket-art.js:drawPerson` already animates working tools from `state==='working'`; `chief-art.js` speech renders one worker bubble after world draw. Reuse that single bubble channel to avoid duplicate overlays.

## Known risks / merge notes

These are deterministic daytime engine fixtures, not a natural-play retention test, full-night economy test, physical Safari test, or proof that arbitrary old saves cannot strand an actor. Default-map production measurements hold phase/morale constant to isolate the worker report. Higher population/resource contention, large-wall expansion during an in-flight trip, full-storage delivery, defeat cargo semantics, mixed-type reassignment, paused saves, and expedition save callbacks require focused verification after implementing cargo.

No shared source ownership conflicts; report and baseline images only. Temporary harness/results remain in `/tmp/living-audit.cjs`, `/tmp/living-audit-results.json`, and `/tmp/living-audit-roundtrip.json` for immediate reproduction. No remote writes or model feature changes.
