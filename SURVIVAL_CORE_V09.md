# GUILD∞ LEGACY v0.9 — SURVIVAL CORE

Date: 2026-10-04 JST
Scope: old/legacy GUILD∞ only

**ChatGPT Work's separate new game remains out of scope. Do not touch it.**

## 0. Design pivot

The approved visual direction stays.

The gameplay start changes completely:

**Do NOT begin with an already-functioning village and 10 workers.**

Begin with:
- player only
- one axe
- almost no built settlement
- raw wilderness / ruins / empty plots
- zero hired workers

The current polished village is now a **mid/late-game visual destination**, not the starting condition.

Core fantasy:

> Chop the first tree yourself → craft the first survival structure → survive the first night → hire the first worker → automate gathering → expand the settlement → defend larger night waves → eventually grow into the current beautiful guild town.

---

## 1. First 10 minutes

### Start
Player inventory:
- Axe x1
- Wood 0
- Stone 0
- Food 0
- Gold 0 or very low
- Workers 0 / 200

World:
- trees
- rocks
- forage nodes
- empty build plots
- one abandoned camp marker / ruined firepit is allowed as a landmark, but it is not a functional building

### First actions
1. Drag to a tree
2. Context action becomes `CHOP`
3. Chop tree several times
4. Gain wood
5. Collect stone / food
6. Build first Campfire / Workbench
7. Day timer warns of dusk
8. Build at least one Barricade before night
9. First zombie wave arrives
10. Player can attack with axe
11. Survive until dawn
12. New survivor/hire opportunity appears after the first successful night

The player must understand the loop without a tutorial modal.

---

## 2. Core loop

```text
DAY
manual gathering
  ↓
crafting / building
  ↓
hire + assign workers
  ↓
prepare defenses
  ↓
DUSK WARNING
  ↓
NIGHT
zombie wave
  ↓
player combat + guards + barricades
  ↓
loot / rare drops
  ↓
DAWN
repair / expand / automate more
  ↓
next night is harder
```

This loop is the heart of the game.

---

## 3. Player actions

Mobile movement remains drag-only.
No visible ABXY / permanent joystick.

### Context action
Bottom UI exposes one contextual action depending on nearby target:
- `CHOP` tree
- `MINE` rock
- `GATHER` forage node
- `ATTACK` zombie
- `BUILD` empty plot
- `REPAIR` damaged barricade/building
- `OPEN` workbench/storage/etc

The action button is contextual; do not add a controller cluster.

### Starting weapon/tool
Axe is both:
- gathering tool
- weak melee weapon

Later tools/weapons can be separate.

---

## 4. Resources

Prototype resources:
- Wood
- Stone
- Food
- Scrap
- Gold
- Gem / Star Crystal (secondary/premium placeholder)

Early game prioritizes physical resources over Gold.

### Example first recipes
- Campfire: Wood 8 + Stone 4
- Workbench: Wood 16 + Stone 8
- Barricade: Wood 12
- Shelter: Wood 24 + Stone 10
- Storage: Wood 20 + Stone 12

Balance is provisional.

---

## 5. Construction

### Build flow
1. Open bottom `BUILD` / facility panel
2. Pick structure
3. Valid empty plot highlights
4. Place structure
5. Deduct materials
6. Construction begins / completes
7. Structure becomes persistent world state

### Initial structures
- Campfire
- Workbench
- Barricade
- Shelter
- Storage
- Watch Post
- Herb Garden
- Training Hall

### Later town structures
- Inn
- Forge
- Market
- Workshop
- Trading Post
- Guild Hall
- Walls / Gate

The existing polished buildings are not deleted; they become unlockable construction stages.

---

## 6. Workers / hiring / automation

Workers are not free ambient NPCs at game start.

### First worker
Unlock after:
- Campfire or Shelter exists
- first night survived OR a survivor event triggers

### Roles
- Woodcutter
- Miner
- Forager
- Builder
- Guard
- Crafter

### Assignment
Player hires a person and assigns one job.
That worker performs a job the player previously had to do manually.

This creates the main incremental progression:

> Manual labor → hire → automate → expand → hire more → specialize

### Population
- cap: 200
- simulation population may reach 200
- visible actors on screen should be capped / LOD'd so the town stays readable
- housing and food create meaningful population constraints

---

## 7. Day / night

Prototype timing target:
- 1 full day: 6–8 real minutes at ×1
- Day: ~70%
- Night: ~30%
- speed boost can accelerate production/time only if design remains fair; zombie combat should not become unreadable

### Day phases
- Dawn
- Day
- Dusk warning
- Night

HUD should always show:
- DAY number
- clock or phase
- next night warning when close

No screen shake during transitions.

---

## 8. Zombies / defense

### First night
Small wave, readable and survivable with:
- axe
- one barricade
- basic positioning

### Enemy priority
1. Barricades / gate blocking their route
2. Camp core / key structures
3. Workers / player if reachable

### Barricades
- buildable
- HP
- repairable during day and possibly during night with risk
- upgrades later

### Escalation
Wave difficulty depends on:
- Day number
- settlement value / rank
- number of workers
- optional region difficulty

Do not simply multiply zombie count forever; later waves can introduce stronger types.

### Prototype zombie types
- Walker
- Runner
- Brute (later)

---

## 9. Combat

Prototype:
- Axe melee arc / short range
- Player HP
- short attack cooldown
- zombie HP
- hit flash / knockback without screen shake
- damage numbers optional but small

Later:
- sword
- bow
- spells
- guard NPC combat

Do not make combat the only focus; it protects the management loop.

---

## 10. Drops / rarity / gacha

Keep the v0.8 progression concepts, but fit them into survival.

### Zombie / exploration drops
- Scrap
- Food
- Hourglass
- Summon Ticket
- Blueprint
- Gem / Star Crystal
- rare equipment

### Rarity
- N
- R
- SR
- SSR

### Gacha / summon
Prototype may summon:
- worker/adventurer variants
- rare survivor classes
- cosmetic / support characters

Rates must be visible in prototype.

Core progression must remain playable without payment.
Real-money IAP is a future app integration, not required in this browser prototype.

---

## 11. Speed items

Normal game speed = ×1
Maximum = ×3

- ×2 requires Hourglass
- ×3 requires additional/stronger Hourglass use
- boost is timed
- no free permanent ×5/×10

Night combat may clamp to ×1 or ×2 for readability if necessary.

---

## 12. Autosave — non-negotiable

Autosave must survive browser reload.

Required:
- primary local save
- backup save
- IndexedDB mirror
- save every 1–2 seconds in prototype
- save on every meaningful mutation
- save on app/background/page lifecycle
- load before normal play
- schema version and migration path

Saved state must include:
- player position / HP / equipment
- resources
- day/time/phase
- workers / roles / assignments
- buildings / positions / levels / HP
- barricades / HP
- zombies only if needed; safe checkpoint handling is acceptable
- inventory / drops
- gacha collection / pity
- speed items / active boost
- progression flags / first-night status

---

## 13. Motion safety

Owner reported motion sickness from screen shake.

**Screen shake is prohibited by default.**

Use instead:
- hit flash
- sprite recoil
- small particles
- sound
- UI pulse
- local object knockback

Camera should not jitter randomly.

---

## 14. Team lanes

### A. Survival Systems
Owns:
- new save schema
- resource nodes/state
- inventory
- recipes
- construction state
- worker/hiring/assignment simulation
- day/night clock
- zombie wave state
- barricade HP / repair
- drops / gacha state

Must not redesign graphics/UI.

### B. Input / Combat
Owns:
- drag movement
- contextual action targeting
- axe chop / attack
- collision
- hit detection
- no screen shake

Must not redesign economy/graphics.

### C. Graphics / World States
Owns:
- wilderness/empty-start visuals
- trees/rocks/forage nodes
- construction stages
- barricade sprites
- zombie sprites
- dawn/day/dusk/night palette
- gradual visual transformation toward current polished village

Must preserve current approved art style.

### D. UX / HUD
Owns:
- day/time HUD
- contextual action button
- bottom log
- build panel
- worker assignment panel
- survival warnings

No ABXY / permanent controller.

### E. Economy / Progression
Owns:
- costs
- worker upkeep
- wave scaling
- rarity/drop rates
- gacha rates
- long-term unlock tree
- Hourglass balance

### F. Audio
Owns:
- day/night ambience
- chop / gather / build / zombie / barricade / dawn warning sounds
- no nausea-inducing rumble

### G. QA
Owns:
- reload persistence
- first 10-minute loop
- first night survivability
- drag/combat coexistence
- no shake
- save corruption recovery
- 390x844 iPhone first

---

## 15. v0.9 milestone — playable survival slice

v0.9 is complete when all are true:

1. New save starts with player only + axe
2. No pre-hired villagers
3. Player can chop a tree and gain Wood
4. Player can collect Stone/Food
5. Player can build Campfire/Workbench/Barricade
6. Day visibly changes to night
7. At least 1 zombie wave attacks
8. Player can kill a zombie with axe
9. Barricade takes damage and can protect the camp
10. First worker can be hired/assigned after survival progression
11. Reload restores all important progress
12. No random screen shake
13. Hourglass/gacha/drop systems remain compatible
14. Current beautiful village is preserved as a later-stage visual target, not the starting state

Do not add unrelated systems until this slice is genuinely playable.
