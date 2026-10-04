# GUILD∞ v1.6 — CLEAN REBUILD

Owner verdict on v1.5: rejected as too rough. Do not patch v1.5 further.

## Base
- clean base: `legacy/v14-settlement-growth`
- integration: `legacy/v16-core-rebuild`
- playable: `prototype-buildjoy-v16.html`
- Work new game remains out of scope

## Product loop
`gather outside -> build inside -> survive night -> earn IRON/RENOWN -> raise Guild Rank -> expand wall/town -> unlock stronger enemies/buildings`

## Implemented
- smooth drag movement, no grid, zero screen shake
- autosave heartbeat + pagehide save
- limited resource storage to stop Day-5 inflation
- slower harvesting + long node respawn
- FOOD upkeep + Morale affecting worker efficiency
- House population cap + Guild Rank population ceiling
- Palisade Lv1-6 with actual larger territory
- House / Warehouse / Watchtower / Barracks / Guild Hall / Lantern / Lumber / Quarry
- per-building level systems and changing visuals
- Watchtower arrows and Guard combat
- 4 waves per night
- Walker / Runner / Brute / Spitter / Warden
- day/rank/wave combat scaling
- attack slash / damage numbers / hit flash / knockback / projectile / death fade + particles
- IRON and RENOWN drops create combat reasons

## Non-negotiable QA
- first 10 minutes must not become a grind wall
- Day5 cannot naturally reproduce thousands of WOOD/STONE
- buildings stay inside the current settlement
- wall collision remains physical; only gate crosses intact wall
- enemy movement is visible and enemy silhouettes differ
- death does not pop instantly
- no screen shake
- iPhone 390x844 first

## Lanes
- Economy: constants/caps/upkeep only
- Combat: enemy feel/effects only
- Growth: ranks/building levels/territory only
- QA: regression/playthrough only

Do not overwrite another lane. Rebase from `legacy/v16-core-rebuild` before proposing integration.
