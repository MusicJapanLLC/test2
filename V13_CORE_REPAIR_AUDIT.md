# GUILD∞ v1.3 — CORE REPAIR AUDIT

Updated: 2026-10-04 JST
Scope: old/legacy GUILD∞ only

## Why v1.2 was still stressful

The owner should not have to enumerate every rough edge. This pass audits the product first and fixes the highest-friction problems before adding more features.

### Self-found problems

1. **UI overload**
   - v1.2 stacked brand/rank/time/resources/objective/utilities/ticker/dock/sheets at once
   - too much borrowed visual language made it feel like a different game
   - world view was losing priority

2. **Borrowed identity**
   - external CC0 sprites/tracks were useful for research but too visible in the actual build
   - the game stopped feeling like GUILD∞
   - remote asset dependency also creates reliability risk

3. **Hut/build reliability**
   - the player could reach a state where building did not feel trustworthy
   - build availability and repeatability rules were inconsistent
   - repeatable settlement structures were treated like unique unlocks

4. **Workers were not visibly working**
   - passive resource increments are not enough
   - hired workers need to move to a real node, animate, gather, deplete it, and pick another target
   - multiple workers also should not all dogpile the same node

5. **Lantern limitation made no design sense**
   - a settlement-light building must be repeatable
   - one lantern does not create expansion or night atmosphere

6. **Autosave pressure/performance**
   - saving on every gather hit becomes a performance problem once worker count grows
   - ordinary yield changes should rely on heartbeat save, while structural changes save immediately

7. **BGM had no GUILD∞ identity**
   - borrowed CC0 tracks solved polish but created a different-game feeling
   - v1.3 returns to an original score, but with a richer arrangement than the early placeholder synth

8. **Construction needed a clearer model**
   - Hut: repeatable, +5 worker capacity each
   - Lantern: repeatable
   - Lumber Yard / Quarry: unique efficiency buildings
   - Palisade: one-build full perimeter, not fence spam

9. **Worker scale needed a future-proof model**
   - world renders a bounded number of visible actors
   - simulation can grow toward 200
   - worker gather ticks must not trigger constant storage writes

10. **Still not solved in v1.3 alpha**
   - obstacle-aware pathfinding around buildings/walls
   - building relocation/demolition
   - full building upgrade tree
   - worker assignment editing after hire
   - deeper quest/gacha screens
   - native app/cloud save

These remain explicit backlog items, not hidden unfinished behavior.

---

## v1.3 repair decisions

### UI
Normal play shows only:
- compact day/time chip
- one resource strip
- sound/speed
- bottom ticker
- BUILD / PEOPLE / BAG dock

No giant logo panel, rank block, permanent objective block, save button, or copied RPG chrome in normal play.

### Art
- no remote sprite dependency in the v1.3 prototype
- no remote BGM dependency
- custom code-drawn pixel characters/buildings/resources remain GUILD∞-specific
- references are used for quality comparison, not visible copying

### Music
Original adaptive soundtrack:
- day around 112 BPM
- night around 88 BPM
- settlement growth adds rhythm/lead layers
- first user gesture unlocks audio
- SFX stay procedural for low latency

### Systems
- huts can be built repeatedly
- every hut adds 5 population capacity, global cap 200
- lanterns can be built repeatedly
- wood/stone/food workers physically path to separate nodes and gather
- guards patrol by day and fight at night
- palisade is full perimeter
- heartbeat autosave every second
- immediate save for build/hire/depletion/drop/lifecycle, not every gather tick

---

## Acceptance before showing as stable

- Hut can be built 3 times in one save if resources exist
- Lantern can be built at least 4 times
- PEOPLE unlocks after first Hut
- Woodcutter visibly walks to a tree and increases Wood
- Miner visibly walks to a rock and increases Stone
- Gatherer visibly walks to forage and increases Food
- two same-role workers choose different available nodes when possible
- reload preserves buildings, workers, resources and palisade
- normal play UI leaves most of the screen to the world
- no external borrowed BGM in runtime
- zero screen shake
