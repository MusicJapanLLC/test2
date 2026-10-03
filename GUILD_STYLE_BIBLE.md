# GUILD∞ — STYLE BIBLE / MANDATORY READ

Updated: 2026-10-04 JST

## READ BEFORE YOU TOUCH THE GAME

Every contributor / AI agent must read this file and the latest `COLLAB.md` before making changes

This is a shared rule, not a suggestion

Do not rebuild the game from scratch
Do not overwrite another lane
Do not declare your own build canonical

## Creative north star

GUILD∞ should strongly evoke the feeling of classic Japanese console RPGs, especially the adventurous, characterful, strategic atmosphere associated with **Romancing SaGa** and **Bravely Default**

This means HOMAGE, not copying

### Take inspiration from

- compact, readable pixel characters with strong silhouettes
- classic JRPG town readability
- deliberate step-like movement instead of frictionless analog sliding
- menu / button feedback that feels like a dedicated game controller
- dramatic depth from foreground / midground / background layering
- painted or polygonal-looking architecture behind crisp pixel characters
- strong light / shadow contrast
- fantasy travel atmosphere
- restrained but distinctive UI frames
- a world that feels larger than the visible screen
- party-adventure energy and discovery

### Do NOT copy

- copyrighted sprites
- exact character designs
- exact maps
- logos
- exact UI layouts
- exact music or melodies
- exact names, text, iconography, or proprietary assets

Create original assets and original implementations that capture the broad genre feeling only

## Current visual / control target

Priority order for the next pass:

1. DOT ART QUALITY
2. GRAPHICS / DEPTH / POLYGON-LIKE BUILDINGS
3. CONTROL FEEL
4. UI
5. ONLY THEN more population / systems

Do not inflate NPC count just to make the screen busy

## Movement rule

The player should NOT feel like a modern free-sliding mobile joystick character

Target feel:

- SFC / classic JRPG stepping
- grid-like discrete movement
- one intentional step at a time
- clear facing direction
- short movement tween is allowed, but input is discrete
- holding direction may repeat at a controlled rhythm
- avoid floaty acceleration / analog drift

## Mobile controller rule

Primary mobile UI should resemble a gamepad:

- left: D-pad
- right: A / B / X / Y cluster
- buttons must visibly depress
- safe-area aware on iPhone
- large enough for thumbs
- gameplay must start immediately
- NEVER restore a blocking TAP TO START screen

Suggested meaning while systems are still being integrated:

- A = context / confirm / attack depending on current integration
- B = cancel / dash
- X = secondary action / menu hook
- Y = utility / future skill hook

Do not hardwire gameplay semantics that conflict with the combat lane; expose clean hooks where possible

## Parallel lanes

### Visual / Pixel / HD-2D
Owns:
- player / NPC / enemy pixel silhouettes
- sprite readability
- buildings
- terrain
- foreground / background depth
- lighting / fog / particles
- polygon-like architectural treatment

### Input / UI
Owns:
- grid-step movement
- D-pad
- ABXY
- keyboard fallback
- touch response
- safe-area
- input hooks

### Combat
Owns:
- attack / dash semantics
- hit detection
- enemy AI
- HP / XP
- boss
- loot

### Systems
Owns:
- collisions
- save/load
- quest state
- inventory data
- performance
- state separation

### Coordinator / QA
Owns:
- canonical build
- merge order
- regression review
- conflict resolution

## Non-negotiable regressions

- no blocking start screen
- iPhone touch must work
- NPC economy must remain alive
- GUILD UP / HIRE / FEVER remain functional until intentionally redesigned
- pixel rendering stays sharp
- no emoji game sprites
- do not mix guild level with player level
- avoid duplicate input systems after merge
- no external copyrighted game assets

## Handoff requirement

Every contributor must report:

### Changed
### Files / Branch
### Tests
### Known risks
### Merge notes
### Next recommended task
