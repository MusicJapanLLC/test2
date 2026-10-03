# GUILD∞ Asset Credits / Provenance

This file tracks third-party assets referenced or imported into the old/legacy GUILD∞ project

## v1.1.1 owner-review prototype — actually referenced

| Local usage | Asset / Project | Author | Source | License | Integration |
|---|---|---|---|---|---|
| `openassets-v111.css` worker portraits/silhouettes | Free 16x16 Puny Character Sprites | Shade | https://merchant-shade.itch.io/16x16-puny-characters | CC0-1.0 | Raw GitHub mirror references for Worker/Soldier/Archer/Mage variants; CSS scales them as pixel portraits |
| `openassets-v111.css` RPG panel/button skin | Kenney UI Pack: RPG Expansion / Adventure UI family | Kenney | https://kenney.nl/assets/ui-pack-rpg-expansion | CC0 | Raw GitHub mirror references for brown panel / inset / long button / pressed button |

### Exact Puny Character mirror files used
Source mirror: `series-ai/jam-ready-assets`, which records `SPDX-License-Identifier: CC0-1.0` for this pack

- `puny-characters/2D/top-down-rpg/Human-Worker-Red.png`
- `puny-characters/2D/top-down-rpg/Human-Worker-Cyan.png`
- `puny-characters/2D/top-down-rpg/Human-Soldier-Red.png`
- `puny-characters/2D/top-down-rpg/Human-Soldier-Cyan.png`
- `puny-characters/2D/top-down-rpg/Archer-Green.png`
- `puny-characters/2D/top-down-rpg/Mage-Cyan.png`

Mirror license record:
`https://github.com/series-ai/jam-ready-assets/blob/main/puny-characters/2D/top-down-rpg/License.txt`

### Exact Kenney mirror files used
Prototype mirror path:
`series-ai/jam-ready-assets/kenney-ui-adventure-pack/ui/PNG/`

- `panel_brown.png`
- `panelInset_brown.png`
- `buttonLong_brown.png`
- `buttonLong_brown_pressed.png`

Original Kenney source remains the license authority

## Approved next coherent world family

| Asset / Project | Author | Source | License | Status |
|---|---|---|---|---|
| 16x16 Puny World Tileset | Shade | https://merchant-shade.itch.io/16x16-puny-world | CC0 | preferred tree/rock/resource/building family for Graphics lane |
| MiniWorld Sprites | Shade | https://opengameart.org/content/miniworld-sprites | CC0 | compatible Shade world/building/character family |
| 496 pixel art icons for medieval/fantasy RPG | 7Soul1 / repack by gnola14 | https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg | CC0 | optional inventory/build icon family after compatibility check |

## Code/design references only

| Project | Source | License | Use |
|---|---|---|---|
| Solstice Valley | https://github.com/Debb1ie/Soltice-Valley-Drop | MIT per README | browser pixel architecture / particles / HUD / day-night reference only |
| Origin 16-bit ARPG | https://github.com/DFarm6/origin-16bit-arpg | MIT | rarity / progression / UI hierarchy reference only |

## Release rule

1. Prototype may reference verified CC0 files from stable raw GitHub mirrors for speed
2. Before shipping an app/store build, selected third-party files must be vendored into the MusicJapanLLC repository/app bundle
3. Every vendored file keeps exact original name, source, license and modification note here
4. Do not mix unrelated visual packs just because they are free; art-direction consistency has priority
5. Commercial/proprietary game art, music, UI, maps, logos and sprites are reference-only and must never be copied
