# OLD GUILD∞ v0.6 — SPRINT COORDINATION

Updated: 2026-10-04 JST

## Hard boundary
This sprint is for the old/legacy GUILD∞ only.
Do not touch, merge, copy, or cherry-pick anything into ChatGPT Work's new game.

## User-approved visual baseline
The current `legacy/guild-v05-detail-polish` visual is the baseline and must not regress:
- high-density pixel characters
- 2D world with polygon / pseudo-3D buildings
- muted teal + amber palette
- lantern / fire light, fog, depth
- compact resource HUD
- low NPC count, no pointless crowd inflation

## Latest control/UI direction
- primary mobile control = tap / drag the world
- no permanent D-pad
- no visible ABXY row
- compact MENU for secondary functions
- one consistent SFC / 2D-digital typography rhythm
- gameplay starts immediately; no blocking TAP TO START
- world should remain visible; UI must not cover the play field

## Role ownership

### Input / Feel
Branch: `legacy/agent-input-feel-v06`
Owns ONLY:
- tap / drag start latency
- retarget feel
- release / stop behavior
- building tap reliability
- camera follow timing
- pointer conflict with UI
Must not edit graphics, typography, economy, audio, NPC count.

### Graphics Detail
Branch: `legacy/agent-graphics-detail-v06`
Owns ONLY:
- character/building/terrain detail
- pseudo-3D / polygon treatment
- light / shadow / fog / depth
Must preserve approved composition and UI behavior.

### Systems
Branch: `legacy/agent-systems-v06`
Owns ONLY:
- pathfinding / collision
- menu/save state
- compatibility hooks
- state separation / performance
Must not redesign visual UI.

### Audio
Branch: `legacy/agent-audio-v06`
Owns ONLY:
- BGM/SE
- fade in/out
- ambient layers
- mobile-safe gain balance
Direction: calm Cologne/medieval-folk/tavern feel; pleasant for long sessions.

### QA
Branch: `legacy/agent-qa-v06`
Owns ONLY verification/regression:
- iPhone 390x844 first
- safe area
- text clipping
- tap/drag responsiveness
- building tap
- MENU no pointer leak
- ABXY stays hidden
- no TAP TO START
- pixel rendering stays sharp

### UX Integration
Branch: `legacy/agent-ux-integration-v06`
Owner: current ChatGPT coordination lane
Owns ONLY:
- cross-lane review
- merge ordering
- playtest acceptance
- user feedback routing
- small glue changes that do not belong to another lane

## Merge order
1. UI/Typography baseline (DONE: PR #25)
2. Input/Feel
3. Systems
4. Graphics detail
5. Audio
6. QA
7. UX integration sign-off

## Current user feedback
- Current visual screenshot is close to ideal
- Next priority is operation feel
- Unify all fonts
- Remove permanent ABXY
- MENU is welcome if it fits gameplay
- Clean up sloppy/mixed text
- SFC / 2D-digital feel, not generic web UI

## Acceptance for next prototype
- opens directly into the town
- town is visible immediately
- tap/drag reacts on first try
- building tap is dependable
- no permanent controller UI
- MENU opens/closes without moving the player
- no clipped text at 390x844
- no visual regression from approved screenshot
