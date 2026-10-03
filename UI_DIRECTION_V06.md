# GUILD∞ Legacy — UI / Typography Direction v0.6

Updated: 2026-10-04 JST

## User-approved visual baseline

The current `legacy/guild-v05-detail-polish` screen is the visual baseline

Keep:
- high-density pixel characters
- tile world
- polygon / pseudo-3D architecture
- muted teal / amber palette
- lantern / fire lighting
- compact resource HUD
- tap / drag destination movement

Do not regress to the older generic web-app look

## Latest UI direction

- Typography must feel like one game, not mixed browser fonts
- HUD / buttons / labels / numbers should share one compact digital / 16-bit-inspired system
- Japanese copy should be short and visually consistent
- Avoid random font weights, oversized prose, and unrelated rounded UI styles
- Numbers use tabular spacing and fixed rhythm
- English HUD labels remain compact uppercase
- Menu copy may be Japanese, but uses the same mono/digital visual rhythm

## Controller change

Visible A/B/X/Y buttons are no longer required

Default mobile UI:
- tap / drag world to move
- tap a building to approach / inspect
- one compact `MENU` control for secondary screens
- context interactions are direct where possible
- keyboard shortcuts may remain as accessibility / desktop fallback

Do not delete internal A/B/X/Y action APIs yet if existing systems depend on them
Hide the controller UI first and preserve compatibility hooks

## Menu direction

MENU should open one compact pixel-RPG panel with tabs/sections such as:
- 街 / TOWN
- 台帳 / LEDGER
- 冒険者 / ROSTER
- 設定 / SYSTEM

For this pass, only existing information must be wired; do not invent large new systems

## Role split

### UI / Typography
- font rhythm
- HUD label cleanup
- hide ABXY controller
- MENU entry point
- menu panel visual polish

### Input / Feel
- tap / drag destination movement
- stop / retarget feel
- building tap reliability
- camera follow timing

### Graphics
- preserve current art baseline
- improve character/building detail without changing UI logic

### Systems
- keep compatibility action hooks
- save/menu state
- no visual redesign

### QA
- iPhone safe-area
- no touch conflict with MENU
- no text clipping
- no accidental controller reappearance
- pixel rendering stays sharp

## Boundary

This is the old/legacy GUILD∞ only
ChatGPT Work's new game remains untouched
