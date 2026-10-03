# GUILD∞ v1.1 — REFERENCE LIBRARY / QUALITY BAR

Updated: 2026-10-04 JST
Scope: old/legacy GUILD∞ only

**ChatGPT Workの別新作には触れない**

## 0. Why this exists

Owner feedback: one-by-one micromanagement is exhausting. The team must stop inventing low-detail placeholder art/UI from memory and instead study proven browser pixel-RPG implementations and legally reusable asset libraries before changing visuals.

This document is mandatory before Graphics / UX / Character work.

## 1. Legal rule

Use only:
- MIT / BSD / Apache code patterns when license is confirmed
- CC0 / Public Domain art where redistribution/modification is clearly allowed
- original Music Japan / AI-generated assets created specifically for this game

Never copy copyrighted commercial-game assets, UI panels, characters, music, logos, maps or exact compositions.

Every imported third-party asset must have:
- title
- author
- source URL
- license
- local path

Record these in `ASSET_CREDITS.md`

## 2. GitHub implementation references

### A. Solstice Valley — `Debb1ie/Soltice-Valley-Drop`
README states MIT and a single-file browser pixel RPG

Useful patterns to study, not blindly copy:
- fixed logical pixel resolution + crisp scaling
- delta-time movement
- day/night palette transitions
- small particle bursts and floating numbers
- clear quest/objective hierarchy
- responsive browser/mobile HUD
- NPC proximity/dialogue state

Do NOT bring over:
- D-pad / mobile ABXY control concept
- screen shake
- exact map/art/dialogue

### B. Origin 16-bit ARPG — `DFarm6/origin-16bit-arpg`
README states MIT and browser-contained procedural pixel graphics/audio

Useful patterns:
- item rarity / loot hierarchy
- town + progression UI separation
- local progress storage
- skill/equipment/shop information hierarchy
- procedural pixel-art rendering that is more detailed than primitive rectangles
- audio feedback mapped to distinct actions

Do NOT copy Chronicon or any third-party commercial-game art referenced by that project

## 3. CC0 art libraries worth using or studying

### Character family — use ONE coherent family, not random packs mixed together

Preferred prototype family:
- `Free 16x16 Puny Character Sprites` by Shade — CC0
  https://merchant-shade.itch.io/16x16-puny-characters
- `MiniWorld Sprites` by Shade — CC0
  https://opengameart.org/content/miniworld-sprites

These are useful because the author/style family is compatible and includes medieval/top-down characters/world elements

Alternative character reference:
- `Hero character sprite sheet` by Fry — CC0
  https://opengameart.org/content/hero-character-sprite-sheet
  40x64 top-down idle/walk in all directions

### UI / inventory icons
- `496 pixel art icons for medieval/fantasy RPG` by 7Soul1 / repack — CC0
  https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg
- `Pixel Art Icons - RPG Essentials (16x16)` by Kettoman — CC0
  https://kettoman.itch.io/pixel-art-icons-rpg-essentials-16x16

### Props
- `Feudal Japan Props Vol.1` by PixelKensei — CC0
  https://pixelkensei.itch.io/feudal-japan-props-vol1-free-pixel-art-assets

Use only if palette/perspective matches the chosen core family

## 4. Art-quality rules

### Character silhouette
Every player/worker sprite visible at normal phone size must read as a person, not a colored rectangle

Minimum character detail:
- face/skin region
- hair silhouette
- 1–2 face pixels for eyes or shadow line when orientation permits
- clothing top
- belt/waist break
- legs/boots
- role prop/tool
- directional silhouette
- idle + walk motion

### Personality
Every hired worker gets persistent identity data:
- name
- personality
- role
- trait
- face/hair/clothing seed
- one short flavor line

Example personalities:
- 明るい / Cheerful: work interval -3%, night morale stable
- 慎重 / Careful: repair/guard bonus
- 無口 / Quiet: gathering consistency bonus
- 熱血 / Hot-blooded: guard/chop burst bonus
- のんびり / Easygoing: small food efficiency bonus

This is NOT a complex stat simulator yet — personality first exists so workers feel like people

## 5. UI quality bar

Stop using generic dark rectangles with text pasted inside

Required visual language:
- pixel-frame corners / notched edges
- icon + value pairing for resources
- one consistent mono/pixel rhythm
- strong active/inactive state
- no generic mobile-app rounded pill buttons
- no four unrelated font sizes on one card
- one dominant action per panel
- compact secondary actions

Reference principle from good RPG interfaces:
- resource HUD = instant scan
- construction = image/icon + purpose + cost
- worker card = face + name + personality + role
- rarity = color + label + icon, not color alone

## 6. Barricade correction

Owner feedback is explicit: a single tiny fence object is meaningless

New rule:
- `BUILD 防壁` = **one construction action creates a complete settlement perimeter/palisade**
- perimeter has one visible gate opening
- wall HP is managed as one defensive structure in early prototype
- later upgrades can add towers / gate / stone wall
- no repeated manual placement of 20 fence segments

Visual construction sequence:
1. ghost/perimeter line appears
2. posts rise around settlement over 0.5–1.0 sec
3. dust/timber particles
4. completion chime
5. `防壁 Lv.1 COMPLETE` ticker

## 7. Tempo targets

Owner says current tempo is too slow

Prototype target:
- drag movement: visibly faster than v1.0 alpha, no floaty lag
- auto gather first hit: <= 0.25 sec after entering range
- gather cycle: 0.30–0.40 sec
- first Hut: 20–45 sec for normal player
- first worker: 90–180 sec
- Build animation: 0.45–0.8 sec
- UI panel open: <100 ms perceived
- ticker message: 1.4–2.2 sec before replacement

No forced waiting just to create monetization pressure during prototype

## 8. What the team must proactively decide without owner micromanagement

Before shipping each visual/system change, ask internally:
- Does this look like a finished game element or placeholder geometry?
- Does a character have a face/identity?
- Does a building have readable purpose from its silhouette?
- Is the player rewarded with motion + sound + visible state change?
- Can a routine action be one tap/gesture instead of three menus?
- Is the next meaningful action visible?
- Are we using an established open reference instead of making a bad version from memory?

If the answer is no, improve it before asking the owner to point it out

## 9. Immediate v1.1 priorities

1. Whole-perimeter barricade
2. Character faces + persistent personality/trait identities
3. Worker cards with portrait/role/personality
4. Better pixel-frame UI hierarchy
5. Faster movement/gather/build tempo
6. Use/reference one coherent CC0 sprite family rather than random procedural rectangles
7. Keep autosave / smooth drag / abundant resources / no screen shake
