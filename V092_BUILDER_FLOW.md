# GUILD∞ v0.9.2 — Builder Flow update

Owner playtest feedback 2026-10-04

## What changes

v0.9.1 was too survival-heavy and too sparse.
The game should feel closer to a casual resource/building loop where the primary pleasure is **expanding construction**, not micromanaging hardcore survival.

### New priority
1. abundant resources nearby
2. smooth free movement, no tile stepping
3. automatic harvesting/mining with visible motion
4. fast, satisfying feedback on resource gain
5. construction is the main progression reward
6. survival/night raid remains a light pressure layer, not the entire game

## Resource density
- trees: dense enough that the player is rarely more than a few seconds from one
- rocks: same
- food nodes: enough to avoid dead time
- respawn is relatively fast in prototype

## Gathering
- no manual AXE spam
- move close to a tree / rock / food node
- player automatically faces it
- repeated harvesting animation and small particle feedback
- floating `+WOOD`, `+STONE`, `+FOOD`
- resource node visually reacts and depletes
- short respawn

## Movement
- no grid / tile stepping
- analog continuous movement
- drag vector controls direction and speed
- light acceleration/deceleration for smoothness
- release stops quickly without skating
- camera follow is eased and must not shake

## Building
Remove workbench as the first gate.
The player should reach the first satisfying construction very quickly.

First buildings:
- Tent
- Barricade
- Lumber Camp
- Quarry
- Recruitment Hut

Buildings use WOOD + STONE (+ FOOD where appropriate)
Construction happens at authored camp slots for this prototype and visibly expands the base.

## Night survival
Keep day/night and zombies, but make them a seasoning layer.
- shorter/light raid prototype
- build/expansion remains the main motivation
- barricades make night easier
- failing a night should not destroy hours of progress

## Feedback feel
Every gather tick should have at least 2 of:
- motion
- particle
- floating number
- short SFX
- node hit animation

Every building completion:
- build particles
- clear sound
- log line
- immediate visual structure
- save immediately

## Team boundaries
- Gameplay Feel / Builder Loop: smooth movement, auto gather, resource density, building unlock curve
- Graphics: trees/rocks/harvest motion/building construction art
- Audio: gather/build/night/dawn sound feel + music energy
- NPC: hired workers visibly gather and carry resources
- Survival Core: save/day-night/drop schema

Do not touch ChatGPT Work's separate new game.