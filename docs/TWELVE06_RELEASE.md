# TWELVE06 — 12人開拓団

## Changed

The village now grows through a small, recognizable cast. Active residents are capped at 12, with four base jobs and eight specialties. Work and training earn existing XP; Lv.4 unlocks specialties and Lv.10 adds a master bonus. Eight personal tool upgrades, mutual buddies, nearby cooperation, cooking, healing, construction discounts and specialist combat connect character growth to real production and defense.

Old rosters above 12 are preserved as named development alumni. Their full records, XP, cargo and relationships remain in the save, and they can exchange places with active residents. Each initially archived resident grants a mentoring ticket. A pre-conversion backup is saved before conversion. Alumni do not silently produce resources. Save namespace remains `guild-chief-world-v3`.

Completed migration goals permit a village evacuation even when distant enemies remain. The departure dialog explains progress and carries residents, careers, tools and archives into the next settlement. Defeated enemies left behind grant no reward.

Lethal damage now visibly incapacitates the mayor for four seconds, charges available food for rescue, then restores partial HP and temporary protection. The camp recovers HP when safe. Residents rest for 18 seconds after otherwise lethal damage. Later settlements increase enemy damage up to a bounded 65% bonus. Zombie defeats have bounded green fragments, a tipping animation, short work jokes and a throttled synthesized growl using existing audio controls. No screen shake.

The phone UI uses a compact HUD and combo display, explicitly named resource gains, small speech bubbles and top-right trophy notices. Delivery remains more prominent than harvesting. Sheet headers, resident tabs and resident section introductions stay fixed while content scrolls. Construction, equipment and research have separate tabs. System buttons use the same pixel typeface, with newly used Japanese glyphs included. A dismissible six-step onboarding guide and an HP strip explain the next action.

## Files

- `chief-twelve.js`, `chief-twelve.css`: integrated careers, roster migration, cooperation, rescue, combat feedback and mobile presentation
- `chief-campaign.js`, `chief-caravan-ui.js`: migration gating and departure feedback
- `chief-logistics.js`, `chief-world.js`: actual carry/targeting integration and archived relationship validation
- `chief-living-fx.js`, `chief-living-ui.js`: named smaller gains and resident handbook integration
- `assets/chief/chief-twelve-pixel.woff2`: DotGothic16 subset; existing SIL OFL applies
- `prototype-chief-world.html`, generated standalone, packaging script
- `tests/twelve-smoke.cjs`, `qa/twelve-v6/`: focused checks and phone screenshots

## Research and adaptation

Reviewed 2026-10-09. These are design references, not copied game assets or code.

| Source | Principle adapted |
| --- | --- |
| [Goblin Cleanup](https://store.steampowered.com/app/2748340/Goblin_Cleanup/) | Shared mundane tasks become memorable through cooperation and visible outcomes → buddy targeting, delivery, work jokes |
| [RV There Yet?](https://store.steampowered.com/app/3949040/RV_There_Yet/) | Travel, mishaps and helping each other → village evacuation, rescue, continuity of companions |
| [A Game About Digging A Hole](https://store.steampowered.com/app/3244220/A_Game_About_Digging_A_Hole/) | Simple repeated action with legible upgrades → named resource feedback and personal tools |
| [Level 13](https://github.com/nroutasuo/level13) | Expedition and settlement progression → preserving the existing campaign while deepening a bounded roster |
| [Idle Game Engine](https://github.com/kssilveira/idle-game-engine) | Incremental systems with explicit resource/upgrade relationships → bounded career bonuses and actual production integration |

Font source: [Google Fonts / DotGothic16](https://github.com/google/fonts/tree/main/ofl/dotgothic16). The bundled font contains the current game source's characters; no runtime font request is needed.

## Tests

`node scripts/build-world.cjs` and `node tests/twelve-smoke.cjs` passed. The focused test covers 17 assertions: boot/game loop; career/gear/buddy yield; sticky header/tabs/intro; isolated research tab; 12-person hiring cap; 300-person conversion to 12 active + 288 archived; identity/XP/cargo/bonds after reload; alumni exchange; real defeat and rescue; touch departure and next-village reload; compact trophy positioning; 360/390/430px layouts; no runtime errors in these scenarios.

Advanced progression, 300-person saves and completed campaign goals are explicit fixtures. Screenshots are phone emulation, not physical-device captures. This is not a full campaign playthrough, long-session balance test or exhaustive debugging pass.

## Known risks

Balance values are first-pass tuning. Physical iOS/Android behavior, audio on actual devices, later settlement difficulty and long-term economy still need player feedback. Keep the save key and pre-conversion backup; do not reset user progress as part of deployment.

## Merge notes

Source branch is based on `feat/mayor-caravan-v5` at `e830830879ca8c4309fc151bd4898d42600d5b7e`. Do not merge unrelated historical source branches to publish this release.

Publish only `guild/mayor/index.html` and `guild/mayor/release.json` to `MusicJapanLLC/test`, targeting `claude/guild-idle-game-j8o75k`, the verified branch for the existing `guild-akari-game` deployment at `https://game.music-japan.com/mayor/`. The similarly named `music-japan-production` branch is a different site's branch and is not the target. Guild's root build and Lantern routes must remain unchanged.
