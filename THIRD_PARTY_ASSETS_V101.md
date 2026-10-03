# GUILD∞ v1.0.1 — Third-party asset/reference ledger

Updated: 2026-10-04 JST

## Rule
Only assets that are clearly reusable for commercial work are allowed into the old/legacy GUILD∞ line.

Allowed for this prototype lane
- CC0 / Public Domain
- MIT / similarly permissive code, after license confirmation

Not allowed
- random Google images
- ripped game sprites/UI/audio
- assets with unclear license
- proprietary Romancing SaGa / Bravely Default / other commercial game assets

## CC0 visual assets approved for prototype use

### Kenney — UI Pack (RPG Expansion)
Source: https://kenney.nl/assets/ui-pack-rpg-expansion
License: CC0
Use: brown RPG panels / long buttons / pressed-state language

Known vendored copy for prototype reference:
- https://raw.githubusercontent.com/hyunghwan/glenmoor-story/main/public/assets/ui/kenney/panel_brown.png
- https://raw.githubusercontent.com/hyunghwan/glenmoor-story/main/public/assets/ui/kenney/panelInset_brown.png
- https://raw.githubusercontent.com/hyunghwan/glenmoor-story/main/public/assets/ui/kenney/buttonLong_brown.png
- https://raw.githubusercontent.com/hyunghwan/glenmoor-story/main/public/assets/ui/kenney/buttonLong_brown_pressed.png

### Kenney — Roguelike Characters
Source: https://kenney.nl/assets/roguelike-characters
License: CC0
Use: face/personality prototype portraits, class silhouette reference

Known spritesheet reference:
- https://raw.githubusercontent.com/TheBestNinja/math-dungeon-crawler/main/public/assets/chars/roguelikeChar_transparent.png
- tile size 16x16, 1px spacing

### Kenney — Roguelike/RPG Pack
Source: https://kenney.nl/assets/roguelike-rpg-pack
License: CC0
Use: medieval props / signs / furniture / icon and tile language reference

### Kenney — Tiny Town
Source: https://kenney.nl/assets/tiny-town
License: CC0
Use: compact town readability reference

### Kenney — Pixel UI Pack
Source: https://kenney.nl/assets/pixel-ui-pack
License: CC0
Use: compact mobile pixel UI language reference

### OpenGameArt — RPG character sprites by GrafxKid
Source: https://opengameart.org/content/rpg-character-sprites
License: CC0
Use: walk-cycle and readable-character reference

### OpenGameArt — 496 medieval/fantasy RPG icons
Source: https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg
License: CC0 / Public Domain collection
Use: inventory/build/resource icon reference after vendoring selected icons

### OpenGameArt — Free Fantasy Game GUI
Source: https://opengameart.org/content/free-fantasy-game-gui
License: CC0
Use: fantasy frame hierarchy reference only for this first prototype

## Integration policy

1. Prototype may load CC0 files from their known raw GitHub mirrors for speed
2. Before release, selected files must be vendored into this repository/app bundle so gameplay does not depend on third-party uptime
3. Every vendored asset keeps a source record in this file even when attribution is not legally required
4. Recoloring / cropping / compositing is allowed; GUILD∞ should not look like an untouched asset-pack demo
5. Character identity, names, traits, role behavior and final palette are original GUILD∞ design

## System reference policy

Open-source games can be inspected for interaction/state patterns, but code is only copied when its repository license is explicitly compatible and the copied portion is recorded here

For now v1.0.1 uses our existing BuildJoy systems and only imports CC0 visual language/assets

## Current owner feedback encoded here
- barricade must create an immediate perimeter/wall system, not a lonely stake
- characters need visible identity: face + name + trait/personality + role
- UI must stop looking like generic web cards
- use proven game UI/assets instead of drawing every primitive from scratch
