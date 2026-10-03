# OLD GUILD∞ — Systems spec: true continuous movement

Systems lane only

## Goal
Replace the player's internal 24px step movement with true continuous fractional-position movement while keeping the current world, collision, save, UI, NPC and graphics behavior intact

## Required API
Expose a continuous player movement API that Input/Feel can drive without knowing core state

Suggested shape:
```js
GUILD_API.setMoveVector(x, y) // normalized -1..1
GUILD_API.stopMove()
GUILD_API.getMoveState()
```

## Behavior
- player position may be fractional world coordinates
- speed should be time-based, not frame-based
- 4-direction sprite facing is okay; choose dominant axis for animation while allowing diagonal world movement
- collision should resolve per-axis or with a small player capsule/circle so corners do not snag badly
- releasing input should stop quickly; no tap-to-route on ground
- building tap routing may remain as a separate helper
- camera follow should be damped and smooth
- save/load should preserve fractional position safely
- keyboard fallback may use the same vector API

## Do not change
- current approved visual composition
- Typography/UI
- NPC count/economy
- Audio
- ChatGPT Work new game

## Acceptance
- iPhone drag feels continuous, not like 24px stepping
- diagonal drag works naturally
- no walking through buildings
- no oscillation at corners
- stop latency feels immediate
