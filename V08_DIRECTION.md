# GUILD∞ legacy v0.8 — Bottom HUD / Growth Loop

Updated: 2026-10-04 JST

## Hard boundary
- old / legacy GUILD∞ only
- do not touch ChatGPT Work's separate new game
- preserve the approved v0.5-v0.7 teal/amber high-density pixel + pseudo-3D village look

## Owner feedback this pass
The owner played the Claude prototype and explicitly preferred its low-friction management flow

### Keep
- current GUILD∞ visual baseline
- smooth hold-and-drag movement from PR #36
- no permanent D-pad / ABXY
- original Audio lane work

### Change
1. Logs should flow near the bottom of the field
2. GUILD UP / HIRE / FEVER should be available without opening a modal MENU
3. Move management/navigation into a persistent bottom bar
4. Typography in the bottom bar must use the same digital/16-bit rhythm as the rest of the game
5. Building tap should become meaningful: select the facility and expose its upgrade action near the bottom bar
6. Primary mobile movement is hold + drag; no tap-to-destination auto-walk
7. Adventurer roster cap target changes from 10 to 200
8. Do NOT render/simulate 200 detailed NPCs naïvely; roster capacity and visible active NPC population are separate performance concerns
9. World speed must stop being freely available x1/x2/x5/x10
10. Target maximum world speed is x3, with x2/x3 gated by a consumable/unlock (prototype name: `時の砂`)
11. Normal x1 speed should be the baseline so progression and waiting still have meaning

## What was learned by actually playing the Claude artifact
Useful abstraction — do not copy assets/text

- tight management loop: request → hire → dispatch → return → reward → facility growth
- persistent bottom navigation reduces menu friction
- objectives / history / facilities / roster are surfaced instead of buried
- progression feels good because rank/capacity/roster/facility growth are always near the player's thumb

We borrow the information architecture and short interaction distance, not the proprietary art, copy, names or layout assets

## Role split

### Experience / Bottom HUD — this branch
Owns
- bottom log ticker location/material
- persistent bottom command bar composition
- typography / spacing / safe area
- facility selection presentation
- integration contract / owner-facing comparison prototype

Does NOT own
- smooth movement core (PR #36)
- Audio implementation
- NPC simulation internals
- economy formulas / save migration
- world graphics

### Input / Feel
Continue PR #36
- smooth finger-follow movement
- release = stop
- dead-zone / camera feel / collision feel

### Systems / Economy — requested API work
Please implement without changing UI composition
- `rosterCap = 200`
- separate visible/active NPC simulation budget from total roster
- expose selected building + per-building upgrade API
- speed states only `[1,2,3]`
- x2/x3 require consumable/unlock; no free permanent speed cycling
- save schema migration for roster cap / building levels / speed item

Suggested API
```js
GUILD_API.getState()
GUILD_API.getRosterCap() // 200
GUILD_API.getBuildingState(id)
GUILD_API.upgradeBuilding(id)
GUILD_API.getSpeedState()
GUILD_API.useSpeedItem(targetSpeed) // 2 or 3
```

### Graphics
- do not redesign composition
- continue detail on guild hall / roof / windows / lanterns / stone / vegetation
- building level should eventually have small visible visual changes

### Audio
- PR #34 / v0.7 integrated lane remains owner
- bottom nav / facility upgrade need short confirm/upgrade hooks only

### QA
First target 390x844 iPhone
Check
- bottom bar does not steal drag input from field
- log never hides primary actions
- facility strip fits above bottom bar
- 200 roster does not mean 200 heavy pathfinding NPCs
- x2/x3 cannot be used without item/unlock

## Validated owner-facing standalone prototype
A separate standalone v0.8 comparison build was tested locally with
- page errors: 0
- hold+drag movement: PASS
- building select / facility upgrade strip: PASS
- roster total 200: PASS
- 201st spawn rejected: PASS
- speed sequence: x1 → item x2 → item x3 → x1: PASS

Do not overwrite PR #36 core wholesale with that standalone. Integrate by lane after review
