# OLD GUILD∞ v0.7 — LIVE DIRECTION

Updated: 2026-10-04 JST

## Hard boundary
- This is the old / legacy GUILD∞ only
- Do not touch ChatGPT Work's separate new game
- Keep the user-approved high-density pixel / pseudo-3D village look
- Do not inflate NPC count to fake richness

## Latest owner feedback — overrides older input rules
The owner tested the tile-step direction and rejected it

### Input
- REMOVE one-tile-at-a-time movement
- REMOVE tap-to-destination as the primary movement model
- RESTORE the earliest smooth / analog-feeling movement
- Mobile primary input: touch the field, keep finger down, slide in a direction, release to stop
- Building tap remains a lightweight inspect action, not auto-walk
- Camera follow should be smooth and calm

### UI
- Keep permanent D-pad removed
- Keep permanent ABXY removed
- Keep compact MENU
- Keep one digital / SFC-like typography rhythm
- Keep the world visible; UI must not swallow the field

### Visual
- The screenshot around v0.5 is the approved visual baseline
- Preserve detailed pixel characters, polygon/pseudo-3D buildings, lantern light, fire, fog and muted teal/amber mood
- Improve detail, but do not redesign the composition into another game

## Current playable candidate
- `prototype-v07-smooth.html`
- core: `smooth-game-v07.js`
- branch: `legacy/guild-v07-smooth`

## Role split

### Input / Feel
Branch: `legacy/agent-input-smooth-v07`
Owns only analog drag, dead zone, speed curve, release-stop, camera follow, collision feel

### UI / Typography
Branch: `legacy/agent-ui-v07`
Owns only font consistency, copy quality, spacing, safe-area, menu readability

### Graphics
Branch: `legacy/agent-graphics-v07`
Owns only pixel art detail, pseudo-3D building depth, lighting, shadow, fog, environment polish

### Audio
Branch: `legacy/agent-audio-v07`
Owns only BGM/SE, long-session comfort, medieval/folk/Cologne-like mood, fade in/out, Safari-safe playback

### Systems
Branch: `legacy/agent-systems-v07`
Owns only economy/save/NPC jobs/guild growth/FEVER progression/performance

### QA
Branch: `legacy/agent-qa-v07`
Owns only regression tests and mobile verification
First target: iPhone 390x844

## Acceptance for next owner review
- screen is immediately visible
- no TAP TO START
- drag movement feels smooth from the first gesture
- release stops immediately
- no tap-to-destination pathing
- building tap inspects without stealing control
- MENU works
- no permanent controller clutter
- existing visual baseline does not regress
- BGM can start reliably after first user gesture
- save/economy continue running

## Reporting format for every agent
Role / Changed / Branch / Files / Tests / Known risks / Merge notes / Next recommendation
