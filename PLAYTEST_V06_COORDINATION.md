# GUILD∞ LEGACY v0.6 PLAYTEST — COORDINATION

Updated: 2026-10-04 JST

This is the active coordination sheet for the old GUILD∞ line only
Do not touch the separate ChatGPT Work new game

## Current visual baseline
The latest screenshot direction is APPROVED as the baseline

Keep:
- dense pixel characters
- pseudo-polygon / diorama buildings
- lantern / fog / shadow atmosphere
- restrained population
- compact top HUD

Do not rebuild the art direction from zero

## Current highest priority
1. input feel
2. typography consistency
3. UI polish
4. menu / interaction flow
5. regression QA

## Branch ownership

### Coordinator / integration
`legacy/guild-v06-playtest`
Owns:
- accepted prototype
- merge decisions
- regression review
- owner feedback propagation

### Input feel
`legacy/guild-v06-playtest-input`
Owns:
- tap movement
- drag-to-one-tile walking
- SFC-like step rhythm
- camera feel
- touch fatigue / accidental input

Do not redesign graphics or economy

### Graphics detail
`legacy/guild-v06-playtest-graphics`
Owns:
- character readability
- building facets
- shadow / fog / lantern polish
- props and micro-detail

Do not add more NPCs just to fill the screen

### UI / typography
`legacy/guild-v06-playtest-ui`
Owns:
- one digital/2D font rhythm
- text spacing / alignment
- MENU
- HUD hierarchy
- remove web-app-like styling

Visible ABXY is currently NOT required

### Systems
`legacy/guild-v06-playtest-systems`
Owns:
- save/load
- collision
- economy preservation
- state/API stability

Do not change art/input feel without coordination

### Audio
`legacy/guild-v06-playtest-audio`
Owns:
- BGM fade in/out
- scene crossfade
- step/confirm/cancel volume balance
- long-session listening fatigue

### QA
`legacy/guild-v06-playtest-qa`
Owns:
- iPhone safe area
- touch regression
- 390x844 / common phone sizes
- text clipping
- menu focus
- save/resume
- no blocking TAP TO START

### Research / retention
`legacy/guild-v06-playtest-research`
Owns:
- owner-requested 300+ review analysis
- retention / churn patterns
- concrete implementation hypotheses

No dark-pattern implementation

## Prototype acceptance for this cycle
- opens directly into world
- graphics baseline is preserved
- visible ABXY row is gone
- MENU is available
- tap-to-move still works
- drag can produce deliberate one-tile movement rhythm
- typography reads as one family
- NPC count does not increase
- economy / GUILD UP / HIRE / FEVER still work
- iPhone interaction remains usable

## Handoff format
Role
Changed
Files / Branch
Tests
Known risks
Merge notes
Next recommended task
