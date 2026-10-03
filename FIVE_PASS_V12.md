# GUILD∞ v1.2 — FIVE PASS REFORM

Updated: 2026-10-04 JST
Scope: legacy GUILD∞ only

This pass exists because v1.1 changed details without changing the perceived quality enough

## PASS 1 — Brutal current audit

Observed problems in v1.1:
- environment is still mostly rectangles/polygons drawn by hand
- character silhouette improved but still reads as placeholder art
- UI hierarchy is game-like but still visually close to a web prototype
- gather/build effects are local but too small and too quiet
- procedural BGM is functional but feels like a test oscillator sequence rather than a real game soundtrack
- barricade logic improved, but construction spectacle is still too weak

Conclusion: incremental polish is not enough. v1.2 must visibly look and sound like a different build within 3 seconds

## PASS 2 — External reference / asset audit

Reference rules:
- use MIT projects for implementation ideas, not copied branded art
- prefer CC0 art/audio for actual prototype assets
- record every external asset in ASSET_CREDITS.md

Approved reference candidates:
- Shade — 16x16 Puny World Tileset — CC0
- Cough-E — Base character spritesheet 16x16 — CC0
- Unnamed — male/female 16x16 walk-cycle bases — CC0
- Louswan — Overworld Theme / alternate — CC0
- HydroGene — 8-bit Slay The Evil — CC0
- Solstice Valley — MIT — browser pixel architecture / particles / day-night ideas
- Origin 16-bit ARPG — MIT — rarity / progression / town UI references

## PASS 3 — Visual replacement, not polish

v1.2 requirements:
- switch the perceived render style from flat vector rectangles to sprite-forward pixel art
- real sprite sheet character for player / workers when remote assets load
- low-resolution logical render surface, scaled crisp to device
- richer grass/dirt/path variation and large tree/rock silhouettes
- foreground foliage layer and atmospheric particles
- stronger light pools / lantern bloom / dusk-night grade
- buildings get roof, wall, trim, window light, material texture and construction stages
- full perimeter wall reads as one defensive project
- fallback procedural art remains if an external asset fails

## PASS 4 — Game-feel / audio reform

Effects:
- gather hit flash + chips + resource arcs + floating value
- node depletion burst
- build starts with foundation markers, rises through 3 stages, then gold finish flash
- hire entrance sparkle + portrait pulse
- rare drop radial star burst
- dawn light sweep
- NO SCREEN SHAKE

Audio:
- replace default procedural melody with real CC0 loop for daytime prototype
- separate real CC0 night/combat loop
- keep procedural SFX for responsiveness
- crossfade day ↔ night
- music stays optional and user-gesture unlocked on iOS

## PASS 5 — Compare / reject / integrate

Do not call the reform complete unless:
1. screenshot comparison looks obviously different from v1.1
2. player has a readable face/silhouette at phone size
3. environment no longer looks like colored rectangles
4. build/gather action creates a visible event, not a tiny blink
5. BGM is a real track, not only synthesized test notes
6. UI still preserves field visibility
7. autosave survives reload
8. zero camera shake
9. asset provenance is documented
10. fallback works if remote CC0 assets are unavailable

If any of these fail, iterate before owner review
