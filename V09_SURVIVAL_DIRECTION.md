# GUILD∞ LEGACY v0.9 — SURVIVAL DIRECTION

Updated: 2026-10-04 JST
Coordinator: ChatGPT integration thread

## Product pivot
The approved visual baseline remains intact, but the game loop changes substantially

The player should NOT begin in an already-complete town
The player begins almost alone with an axe
The first minutes must feel like survival and creation, not management of an existing city

## Core loop
1. Walk with smooth drag movement
2. Chop trees / gather food manually
3. Use resources to build the first workbench
4. Hire people only after infrastructure exists
5. Workers automate gathering during the day
6. Build barricades before night
7. Zombies attack at night
8. Fight with the axe and defend the camp
9. Survive the night and earn rare drops
10. Build new facilities and gradually transform the wilderness into a guild town

## Non-negotiables
- workers start at 0
- no prebuilt town
- player begins with an axe
- smooth drag movement remains
- player can attack with the axe
- day / night cycle
- zombie night raids
- barricade construction
- new buildings are constructed from gathered resources
- worker cap may eventually reach 200
- world speed defaults to x1
- x2/x3 require consumable Time Sand
- no free permanent fast-forward
- keep the approved high-density pixel / pseudo-3D graphics direction

## Autosave — highest priority
Current requirement: browser reload must never intentionally reset normal progress

v0.9 prototype saves:
- every 2 seconds
- after harvest
- after combat
- after building
- after upgrade
- after hire
- after summon / gacha
- after speed item use
- after phase change
- after zombie damage
- on pagehide
- on visibility hidden
- on beforeunload

Two-slot local persistence:
- `guild-v09-survival`
- `guild-v09-survival-backup`

App version later should migrate this schema to native/cloud storage

## Construction chain
Prototype order:
- Workbench
- Barricade
- Hut
- Forge
- Quest Hall
- Guild Hall
- Watchtower

Buildings are not prebuilt
Locked plots are shown lightly so the player can understand future growth

## Workers
- initial workers: 0
- Workbench unlocks hiring
- Hut expands worker capacity
- ordinary workers gather wood / food automatically during daytime
- workers retreat toward the camp at night
- hard cap: 200
- visual rendering/performance may cap on-screen representation separately later

## Survival
Day prototype: 150 sec
Night prototype: 70 sec

Night:
- zombies spawn from map edges
- zombies move toward camp
- barricade takes damage first
- camp/core takes damage if barricade fails
- player can kill zombies with axe

The timings are prototype values and should be balanced through playtesting

## Rare drops / monetization-ready prototype
No real-money purchase implementation yet

Prototype premium-like resources:
- Star Crystal / 星晶
- Summon Ticket / 召喚券
- Time Sand / 時砂

Zombie kills can drop these at low rates
These are game-earned in v0.9 and can later be connected to app IAP if product policy/legal design is decided

## Gacha prototype
Rarities:
- N 65%
- R 25%
- SR 8%
- SSR 2%

Prototype pity:
- 20 pulls => SR or better

Summoned units improve gathering / support and may become workers if capacity exists
Odds and economy are temporary prototype values

## Role split
### Core / Systems
Branch: `legacy/agent-systems-depth-v09`
Own: resource economy, construction, workers, save schema, API

### Survival / Night
Branch: `legacy/agent-survival-night-v09`
Own: day/night, zombies, barricade combat, difficulty curve

### Save / Persistence
Branch: `legacy/agent-save-v09`
Own: save durability, migration, corruption fallback, app persistence plan

### Progression / Drops
Branch: `legacy/agent-progression-v09`
Own: rarity, drop tables, summon economy, building unlock pacing, long-term progression

### UI / Mobile
Branch: `legacy/agent-ui-survival-v09`
Own: bottom management bar, action context, build sheet, readable typography, iPhone safe area

### QA
Branch: `legacy/agent-qa-survival-v09`
Own: reload persistence, first-run state, day/night transitions, zombie raids, 200 workers, speed cap, iPhone regression

## Current integrated prototype
- `prototype-v09-survival.html`
- `ui-v09-survival.css`
- `survival-game-v09.js`
- branch: `legacy/guild-v09-systems-depth`

## QA priority
1. Start with zero workers
2. Chop wood manually
3. Reload browser and confirm wood persists
4. Build Workbench
5. Hire first worker
6. Build Barricade
7. Reach night and survive zombie attack
8. Kill zombie and confirm rare drop logic can occur
9. Use Time Sand and verify max speed x3
10. Reload again and confirm day/buildings/workers/items persist

## Boundary
Do not touch ChatGPT Work's separate new game
