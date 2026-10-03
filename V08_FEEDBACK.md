# GUILD∞ v0.8 — owner playtest feedback

Updated: 2026-10-04 02:32 JST

This file is the latest source of truth for the legacy GUILD∞ prototype only
Do not touch ChatGPT Work's separate new game

## Owner liked
- Claude prototype's system loop feels surprisingly fun
- Current high-density pixel / pseudo-3D visual direction stays approved
- Bottom persistent navigation is easier than repeatedly opening a full menu

## Required changes

### 1. Bottom-first UX
- Logs should flow near the bottom of the game screen
- GUILD UP / HIRE / growth controls should be constantly reachable from a bottom dock
- Move the current top MENU function into the bottom dock
- Avoid making the player repeatedly open a full-screen menu
- Keep one consistent digital / SFC-like font system

### 2. Buildings need a reason to be inspected
- Tapping a building should select it
- The selected building should expose its level / bonus / upgrade cost in the bottom contextual area
- Building upgrades should be possible from the bottom UI
- Do not auto-walk to the building just because it was tapped

### 3. Movement
- Primary mobile movement is smooth drag / analog touch
- No tile-step movement
- No tap-to-destination movement
- Finger down + drag = movement
- release = immediate stop

### 4. Population
- Raise guild roster cap from 10 to 200
- Do not fake richness by rendering 200 overlapping actors at once
- Separate total roster from currently visible / on-duty actors if needed for performance and readability

### 5. Game speed
- Default is x1
- Maximum is x3
- x2/x3 must NOT be permanently free
- Speed-up requires a consumable / progression item
- Speed-up should feel like a reward, not the default expected state

### 6. Game feel
- Deliberately stage the pleasure of growth
- Keep friction low in controls, but progression itself should still feel earned
- Preserve readable feedback for hires, upgrades, returns and resource gains

## v0.8 role split

### UI / Dock lane
Owns bottom dock, ticker, panels, font consistency, safe areas
Does NOT edit economy or movement math

### Systems / Progression lane
Owns roster 200, building levels, upgrade costs, boost items, x1-x3 gating
Does NOT redesign graphics or touch controls

### Input lane
Owns smooth drag only, dead zone, release stop, camera feel
No tap-to-destination

### Graphics lane
Preserve approved village look, improve detail only

### Audio lane
Preserve v0.7 long-session BGM and fades

### QA lane
390x844 iPhone first, then wider phones
Verify no blocking start screen, no full-screen menu dependency, no tap-to-destination regression
