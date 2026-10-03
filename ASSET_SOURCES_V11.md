# BUILDJOY v1.1 — reference & asset sources

This prototype intentionally separates **reference inspiration** from **reusable licensed assets**.

## Reusable licensed assets

- OpenGameArt — **RPG portraits** by Buch — CC0
  - https://opengameart.org/content/rpg-portraits
  - Runtime atlas: https://opengameart.org/sites/default/files/rpgportraits.png
  - Used for crew/character portrait rendering when network access is available
  - The game keeps a built-in pixel portrait fallback for offline/error cases

- OpenGameArt — **Puny Characters** by Shade — CC0
  - https://opengameart.org/content/puny-characters
  - Evaluated for the next field-sprite replacement pass

- OpenGameArt — **16x16 Puny World Tileset** by Shade — CC0
  - https://opengameart.org/content/16x16-puny-world-tileset
  - Includes grass, trees, paths, water, buildings and resource nodes
  - Evaluated for the next terrain/building atlas pass

- Kenney — **Roguelike Characters** — CC0
  - https://kenney.nl/assets/roguelike-characters
  - Evaluated as an additional character/icon source

## UI / systems references only — no asset copying

- Pixelshire — villager compendium / portrait roster density
- dotAGE — readable construction-first village HUD
- Evil Hunter Tycoon — character detail / rarity / equipment information hierarchy
- ksstr92/pixel-game-editor — NPC portrait/dialog/schedule feature ideas; repository did not expose a license file during review, so code/assets are **not copied**

## v1.1 implementation rule

Only CC0 / MIT / similarly clear commercial-use sources may be directly imported. Unclear-license GitHub repositories and commercial-game screenshots are reference-only.
