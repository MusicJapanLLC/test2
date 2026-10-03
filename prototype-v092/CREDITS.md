# GUILD∞ v0.9.2 prototype credits

This comparison prototype intentionally uses redistributable/open assets instead of copying art from commercial games.

## Shipped / loaded assets

- **Kenney — Tiny Town** — CC0 1.0
  - world tiles, trees, paths, building pieces, fences, props
  - runtime source used by prototype: `Two-Weeks-Team/openClawWorld` Kenney mirror
- **Kenney — Roguelike Characters** — CC0 1.0
  - in-world player / resident sprites
  - runtime source used by prototype: `Two-Weeks-Team/openClawWorld` Kenney mirror
- **Kenney — Pixel UI / UI assets** — CC0 1.0
  - panel/button texture treatment
  - runtime source used by prototype: `euuuuuuan/todak-public`
- **Kenney UI Audio** — CC0 1.0
  - UI click sound
  - runtime source: `Calinou/kenney-ui-audio`
- **Tozan — Background Music 1** — CC0 1.0
  - optional lightweight BGM loaded after user gesture
  - mirrored/credited by `ishaanrajiv/snake-rs`

## Implementation references only

No source code is copied wholesale from these projects. They are references for interaction / simulation patterns.

- `kangarooking/heartbeat-town` — MIT — NPC movement, dialog, time-of-day, local canvas town simulation
- `trymnilsen/kingdomarchitect` — open-source browser medieval simulation — city/NPC/system decomposition reference

## Design boundary

Commercial game screenshots/assets are not redistributed. We study pacing, information hierarchy, feedback density and settlement-progression patterns, then implement the behavior with CC0/open assets and original code.
