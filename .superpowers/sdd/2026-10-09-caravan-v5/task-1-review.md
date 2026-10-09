# Task 1 independent review

Reviewed commit `8f5f718` campaign implementation, transfer schema additions, simulation test, and the required early World capacity hook. Root's unfinished UI/cast/audio work is excluded. No implementation files changed.

## Finding to fix

### P2 — Wind bonus follows a stale/default destination during cargo transport

**Location:** `chief-campaign.js:44`.

The resident wind direction is inferred from its resource `targetId`, falling back to world x=0. Logistics clears that target during hauling, but the delivery destination is `Logistics.depot()`, which becomes the warehouse's actual position. Therefore cargo carriers can receive the advertised tailwind bonus while moving against the wind and miss it while moving with the wind. Homeward trips also need their actual destination rather than the resource/default coordinate.

Focused Chromium reproduction against the actual World entry:

```js
WorldGame.state.region = 'home';
Campaign.state.stageId = 'wind';
Campaign.state.repairs = {};
state.buildings = [{id:'offcenter', type:'warehouse', level:1, x:300, y:0}];
const carrier = {
  id:'carrier', role:'wood', x:100, y:35, targetId:null,
  cargoMode:'returning', state:'hauling', cargo:{wood:5,stone:0,food:0}
};
Campaign.state.elapsed = 0;
Campaign.modifiers(carrier).move; // actual 1; eastbound trip has east wind
Campaign.state.elapsed = 12;
Campaign.modifiers(carrier).move; // actual 1.25; eastbound trip has west wind
Logistics.depot().x; // 300
```

Use actual intended travel direction, accounting for cargo delivery, return-home and gathering destinations. A regression should assert 1.25 for the first case and 1 for the second, preferably also measuring movement through the actual worker path. If gate routing determines the physical heading, apply the bonus to that heading consistently.

## Verification and other conclusions

- Ran `node tests/campaign-simulation.cjs`. All campaign assertions reached the final browser-error assertion, including conserved resources/30 resident identities/cargo/research/relationships, rollback, reloads, camp housing, repair costs, and 18 serialized moves. The final assertion failed on repeated `Cannot assign to read only property 'voice' of object '#<Object>'` errors from the concurrent unfinished audio lane; root was informed. This is not classified as a Task 1 defect.
- Independently reproduced the wind issue above in Chromium. No broader optional test suite was run.
- No P0/P1 defects found in the scoped migration or storage code. Successful persistence writes the old-state recovery first and new primary last; failed writes attempt restoration before releasing the move lock. The existing failure test covers a primary-write rejection.
- Fresh action goals are feasible with a full carried bank: two low-cost buildings plus a repair free more than 40 wood/stone storage, and fresh nodes contain each required resource. Returning carried cargo can use those slots without being destroyed; subsequent building/repair/contract spending remains available. The 18-transition loop injects completed goal counters after the first played stage, so it proves serialized transitions and bounded stamps/history, not natural gameplay through all 18 villages.
- The early World `capResource` hook prevents boot-time truncation before the campaign establishes its carried-inventory capacity floor. The new primary preserves resident IDs and nested ledgers while resetting the settlement map.
- Pause/away guards and campaign import container checks are present; no additional must-fix findings were identified in the scoped code.

**Disposition:** fix the directional wind case, then rerun its focused regression and the campaign simulation after the root integration lane is stable.
