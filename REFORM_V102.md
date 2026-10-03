# GUILD∞ legacy v1.0.2 — Visual / FX / Audio Reform

Updated: 2026-10-04 JST

## Scope lock

This branch is OLD / legacy GUILD∞ only.
ChatGPT Work の別系統新作には一切触れない。

Gameplay foundations to preserve:
- smooth analog drag movement
- auto gather near resource nodes
- construction-first pacing
- 200 roster target
- item-gated x2/x3
- autosave / backup

This lane owns only:
- visual rendering quality
- character readability / faces / job/personality cues
- build/gather/rare/night visual FX
- BGM reform + SFX polish
- owner-review prototype shell

Do not rewrite save/economy/input contracts unless required for visual hooks.

## Owner feedback driving this reform

- graphics still looked nearly unchanged
- illustration quality too cheap
- NPCs did not read as people: missing face / personality / detail
- FX lacked reward feel
- BGM still sounded like prototype audio
- UI and field did not feel like one finished game
- barricade must be a meaningful perimeter, not one loose object

## Five-pass workflow

### Pass 1 — diagnosis
Found the dominant quality limit was not feature count. It was presentation density:
- rectangle-based trees/rocks/buildings
- generic NPC bodies
- weak hit/build particles
- procedural single-note BGM
- little dusk/night atmosphere

### Pass 2 — legal reference / asset research
Only CC0 / commercially usable references are approved.

Selected sources:
1. Kenney Tiny Dungeon — CC0, 16x16 RPG/dungeon visual reference
   https://kenney.nl/assets/tiny-dungeon
2. Kenney Tiny Town — CC0, 16x16 town/overworld visual reference
   https://kenney.nl/assets/tiny-town
3. Kenney RPG UI Pack copies found with explicit Kenney license text in public repos — CC0 source lineage only
4. OpenGameArt Pixel Characters by PixelPeon — CC0 character/detail reference
   https://opengameart.org/content/pixel-characters-0
5. OpenGameArt Medieval: The Bard's Tale by RandomMind — CC0
   https://opengameart.org/content/medieval-the-bards-tale
   prototype audio URL: https://opengameart.org/sites/default/files/The_Bards_Tale.mp3

Do not import copyrighted commercial-game assets.
Do not copy Romancing SaGa / Bravely Default sprites, UI, maps, music, names or proprietary material.

## Pass 3 — graphics reform

### World
- grass receives patch/noise variation rather than flat green
- paths are curved and layered
- campsite fire produces local light
- trees use multi-layer crowns, trunk highlights and hit scars
- stone uses polygon facets/highlights
- forage has leaves + berries rather than a plain block
- depth sort remains stable

### Characters
Every visible person gets:
- skin
- hair
- 2 eyes + mouth
- clothing body
- legs
- job-specific tool / guard gear
- avatar variation

Crew UI gets:
- face portrait
- name
- job
- personality trait

Prototype personality vocabulary:
- 木こり: 豪快 / 几帳面 / 早起き
- 採石人: 頑丈 / 無口 / 職人気質
- 採集人: 好奇心 / 陽気 / 器用
- 衛兵: 勇敢 / 慎重 / 忠義

### Buildings
Buildings must read as a reward, not a rectangle appearing:
- raised construction animation
- roof planes
- walls / planks / foundation
- glowing windows
- job-specific props

### Barricade
One build action creates a full perimeter wall visual around the camp.
No single isolated fence segment as the main defense representation.

## Pass 4 — FX + Audio reform

### Gather FX
- local impact reaction
- wood chips / leaf fragments
- stone chips
- floating resource text
- no camera shake

### Build FX
- construction dust/chips
- gold spark layer
- expanding ring
- BUILD COMPLETE banner
- multi-note stinger

### Rare FX
- larger particle shower
- ring
- rarity-colored float text
- distinct stinger

### Day/night ambience
- dusk tint
- night blue overlay
- fireflies at night/dusk
- lantern/campfire light pools
- no screen shake

### BGM
Prototype day BGM replaces the simple WebAudio note loop with a real CC0 medieval/folk track:
- `Medieval: The Bard's Tale` by RandomMind
- CC0
- looped HTMLAudio
- short fade-in/out
- night lowers track volume and playback rate slightly
- WebAudio ambience adds low night drone / percussion under the real track

Fallback: if remote music cannot load, gameplay still works and WebAudio SFX/ambience remain available.

## Pass 5 — integration QA

Release checks for this comparison prototype:
- no TAP TO START blocking screen
- smooth drag retained
- no tile/grid movement
- no random screen shake
- auto gather retained
- build logic remains construction-first
- perimeter barricade is one build action
- people still begin at zero
- autosave hooks remain in prototype
- BGM begins only after user gesture because of iOS Safari policy
- BGM OFF/ON remains explicit
- UI does not depend on external CC0 texture loading; remote UI texture has matte fallback
- systems branch should port approved visual/audio hooks, not wholesale overwrite unrelated logic

## Team boundary

- Visual/FX/Audio Reform: `legacy/v102-visual-audio-reform`
- Systems / persistence: existing BuildJoy Systems lane
- Economy: existing BuildJoy Economy lane
- Input: existing smooth-drag lane
- QA: regression around save/input/performance

Merge only after owner playtest.
