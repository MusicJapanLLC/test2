# GUILD∞ legacy v1.3 — SYSTEM REPAIR

Updated: 2026-10-04 JST

## Owner feedback that triggered this pass

The previous build finally began to feel like a game, but the owner found the core loop itself stressful and inconsistent:

- UI is cluttered
- external asset / BGM influence is too obvious and GUILD∞ identity is diluted
- hut feels impossible to build
- hiring increases headcount but workers do not visibly work
- lantern can only be built once
- construction expansion does not continue naturally
- the player has to discover too many rough edges manually

This pass is NOT another graphics reform

**Role: Systems / Progression Repair**

Do not overwrite Graphics / FX / Audio lanes
Do not touch the separate ChatGPT Work game

## Code-level problems confirmed in v1.2

### 1. Every building type was globally unique

Existing v1.2 logic rejected a build whenever any building of the same `type` already existed

That accidentally made repeatable expansion buildings such as lanterns one-off objects

Fix:
- type-specific caps
- Hut: repeatable
- Lumber: repeatable
- Quarry: repeatable
- Lantern: repeatable
- Palisade: one settlement-wide project

Prototype caps:
- Hut 6
- Lumber 4
- Quarry 4
- Lantern 10
- Palisade 1

### 2. Workers were passive counters, not workers

Existing v1.2 `passive(dt)` added resources from worker roles without sending the worker to a resource node

Result: PEOPLE increases but on-screen characters appear idle and the economy feels fake

Fix worker state machine:

`seek target → walk to actual node → work animation → carry → return to home/building → deliver resource → repeat`

Roles:
- Woodcutter targets tree nodes
- Miner targets rock nodes
- Gatherer targets food nodes
- Guard targets night enemies

Resources increase on delivery, not merely because a timer elapsed

### 3. First hut pacing had too much hidden friction

The first important build must teach the loop, not block it

Prototype repair:
- Hut = 8 WOOD / 0 STONE
- first objective explicitly says stone is not required
- build card always displays one of:
  - `BUILD OK`
  - exact missing WOOD / STONE
  - `MAX`

### 4. Housing / hiring had no clear physical meaning

Fix:
- each Hut adds +4 housing capacity
- HUD shows PEOPLE current/capacity
- no Hut = no hiring
- more Huts visibly allow more people
- long-term roster hard cap remains 200

### 5. UI was carrying too much prototype chrome

Repair direction:
- bottom actions reduced to BUILD / CREW / BAG in owner-review prototype
- autosave remains automatic rather than demanding a persistent SAVE tab
- objective becomes one concise next action
- no third-party UI overlay in this systems-repair lane

### 6. Borrowed BGM broke identity

Systems-repair owner prototype removes the obviously borrowed medieval track

Audio direction for integration:
- return to GUILD∞ original motif
- folk instrumentation / plucked rhythm / restrained melody
- day/night arrangement difference
- third-party CC0 remains reference/prototype material only, not the identity of the game

## Prototype economy

- Hut: 8W / 0S / cap 6 / +4 housing
- Lumber Yard: 14W / 4S / cap 4 / improves wood work
- Quarry: 12W / 6S / cap 4 / improves stone work
- Full Palisade: 24W / 6S / cap 1
- Lantern: 5W / 1S / cap 10

## Persistence

Keep the autosave contract

- 1 sec heartbeat in owner prototype
- mutation save after gather/build/hire/delivery
- pagehide / beforeunload / visibility lifecycle saves
- primary + backup
- v102 → v103 migration path

## QA already performed on owner-review v1.3 comparison build

### Syntax
- both inline script blocks: `node --check` PASS

### Fresh play
- no page errors
- auto-gather works while moving

### Hut
- build card becomes `BUILD OK` when affordable
- Hut successfully consumes 8 WOOD
- housing changes `0/0 → 0/4`
- objective advances to hiring

### Repeatable Lantern
- second Lantern attempt is NOT blocked by a global same-type rule
- if it fails, UI reports the exact missing resource rather than `already built`

### Worker
- hired Woodcutter joins with explicit role feedback
- worker travels to real resource nodes and returns
- resource total increases after the worker loop
- browser QA observed WOOD increase over time after hire with zero page errors

## Team boundary

### This lane owns
- build caps / build affordability
- housing capacity
- hire gating
- worker task state machine
- job-to-resource targeting
- worker delivery loop
- progression clarity
- persistence migration for these states

### Graphics owns
- final worker work/carry animations
- final building variants for repeated huts / lanterns
- final world art

### Audio owns
- final GUILD∞ original score
- work/build/delivery SFX polish

### UI owns
- final reduced HUD visual treatment
- build affordability visualization

### QA owns
- 10+ buildings
- 20+ workers
- reload mid-task
- repeated lanterns
- housing cap edge cases
- day/night worker interruption

## Integration rule

Do not merge external-asset-heavy PRs wholesale into this lane
Take only approved pieces per subsystem
The owner explicitly wants GUILD∞ identity preserved
