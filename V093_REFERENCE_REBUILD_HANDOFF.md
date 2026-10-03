# GUILD∞ v0.9.3 — Reference Rebuild handoff

## Owner feedback driving this rebuild
- A single barricade piece does not read as defense. One build must create a complete perimeter defense system.
- Tempo is too slow.
- Illustrations lack facial/personality/detail quality.
- UI still reads as a web dashboard rather than a game.
- Stop waiting for owner to specify every missing detail; use strong external game references and permissively licensed/open-source material to raise the quality bar.

## New product fantasy
The main pleasure is **settlement expansion**, not hardcore survival.

`move smoothly -> auto gather -> build quickly -> the entire scene changes -> meet distinct residents -> automate more -> expand`

Night raids / rarity / summon remain secondary spice.

## Reference policy
Use only:
- CC0/public-domain assets where copied directly
- MIT/BSD/Apache-style code where copied/modified with required license notice
- commercial/proprietary games only as visual/UX references; do not copy their assets/code

Verified references during owner-feedback pass:
- Kenney Pixel UI Pack — CC0, 750 files
- Kenney UI Pack: Pixel Adventure — CC0, 500 files
- Kenney Tiny Town — CC0, 130 files, 16x16 town tiles
- OpenGameArt Tiny RPG CC0 Characters and Portraits — CC0
- OpenGameArt EverFace — CC0, 18 character portraits
- OpenGameArt Pixel People — CC0, modular hair/clothes/eyes/body parts
- btn0s/hearthfall — MIT; useful reference for generated portraits with multiple moods and explicit NPC identity

## v0.9.3 prototype decisions
### 1. Perimeter defense
`外周防壁` is one construction action.
On completion, build the whole visual system at once:
- perimeter palisade
- main gate
- four corner watch platforms
- shared wall HP/state
- large construction burst / audio cue

No repeated one-piece-at-a-time fence construction for the first defense unlock.

### 2. Resident identity
Every resident must have:
- portrait / visible face
- name
- age
- rarity
- personality
- current mood
- preferred job / skill
- gameplay bonus
- short quote / voice line
- different hair / skin / clothes

Resident list must be a real character roster, not a numeric worker counter.

### 3. Faster construction loop
- player movement remains continuous analog, no grid/tile movement
- nearby resource nodes auto gather
- early gather yields increased
- early building costs reduced
- early node respawn shortened
- first house automatically introduces first resident
- lumber hut / quarry create passive resource generation quickly

### 4. Visual density
Buildings should include secondary props so the scene becomes richer when built:
- crates / logs / tools
- windows / doors / roof layers
- signs / flags
- forge fire / chimney
- market stalls
- lamps / small decorative elements

The reward for construction is a changed screenshot, not only a changed number.

### 5. UI direction
Move away from transparent dark web-dashboard cards.
Use game-native pixel UI language:
- framed wood / brass panels
- icon resource ribbon
- obvious selected state
- illustrated build cards
- portrait cards for residents
- one dominant construction action
- compact lower HUD that leaves the world readable

## Role split
- Graphics: buildings/props/resource silhouettes/palisade detail; preserve pixel-HD language
- Input: smooth analog movement, no snap, no camera shake
- NPC/Life: identity/personality/mood/job data + portrait/sprite variation
- Systems/Economy: faster costs/yields/passive generation/perimeter wall state
- UI: game-native framed HUD/cards/portrait roster
- Audio: gather/build/perimeter/hire feedback, faster reward cadence
- QA: 390x844; first building in short session; full wall from one action; resident roster visibly distinct; reload persistence

## Owner-review prototype
Standalone v0.9.3 comparison build has been rendered at 390x844 with zero page errors before handoff.
Do not merge wholesale until owner playtest; port approved deltas into canonical lanes.
