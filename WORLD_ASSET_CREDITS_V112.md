# BUILDJOY v1.1.2 — World Asset Pass

## Directly used assets

### Kenney — Tiny Town
- Official source: https://kenney.nl/assets/tiny-town
- License: Creative Commons CC0
- Commercial use: allowed
- Attribution: not required
- Runtime mirror used by prototype:
  - `https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/tiles/tinytown_tilemap.png`
- The mirrored PNG was verified as an actual PNG in GitHub, not a Git LFS pointer
- Used for field trees, rocks, forage, huts, lumber yard, quarry, lantern, perimeter palisade, front gate and BUILD card illustrations

### Kenney — Roguelike Characters family
- Kenney assets are CC0; commercial use is allowed and attribution is not required
- Runtime mirror used by prototype:
  - `https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/characters/characters_spritesheet.png`
- The mirrored PNG was verified as an actual PNG in GitHub
- Used for player / field-resident rendering and roster portrait sprites

### Kenney RPG UI assets
- Existing v1.1.1 integration pointed at `series-ai/jam-ready-assets` image paths that are Git LFS pointer files when fetched through raw GitHub URLs
- v1.1.2 overrides those references with actual PNG copies found in the public Godot tutorial repository below:
  - panel: `MinaPecheux/godot-tutorials/.../panel_brown.png`
  - button: `MinaPecheux/godot-tutorials/.../btn-long.png`
- Asset design remains Kenney CC0; these URLs are mirrors used only to avoid broken Git LFS raw links

## Implementation boundary

This pass does **not** change v1.1 Systems, movement, economy, autosave, wall HP logic, worker logic or combat logic

`worldassets-v112.js` reads the current state from `window.BUILDJOY.getState()` and renders licensed art as a visual overlay, keeping the #91/#93 gameplay implementation intact

## Why this architecture

- avoids overwriting other agents' active Systems work
- makes rollback trivial
- replaces procedural placeholder art without forking the save format
- allows the final app build to vendor the CC0 PNG files locally later, eliminating runtime network dependencies
