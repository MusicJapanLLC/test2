# Task 2 independent review

Scope: completed root UI/cast/audio/social changes after `8f5f718`, including the new caravan modules. Read the 24-check UI test and its recorded results. Per request, no broad suite rerun and no implementation edits. Focused Chromium reproductions below use the actual modular World HTML with animation callbacks frozen for deterministic setup.

## Must-fix findings

### P2 — Two speech cards overlap on a compact phone during a combo

**Location:** `chief-living-fx.js:24`, `bubbles()`.

The second card's fallback clamps it to `maxTop` when neither placement fits. It can therefore overlap the first card rather than finding room or showing one card. At 360×640, with combo visible and two speakers near the bottom, measured rectangles were **[410,513]** and **[446,549]**: **67 pixels of overlap**, obscuring dialogue and portraits.

Focused setup: enter game, close menus, hide `living-celebration`, set `living-combo.hidden=false`, camera `(0,0)`, player `(0,200)`, two workers at `(0,200)` and `(10,200)` with `sayUntil=Pocket.clock+10` and text `村長、仕事の終わりはどの方角にありますか。`; call `draw()` and measure both cards.

Fit the pair as a group inside the available space or display one card when two cannot fit. Add the actual non-overlap assertion at 360×640 and landscape with a visible combo; sheet/title geometry tests do not cover this case.

### P2 — Spearmen stop permanently across an intact wall within melee distance

**Location:** `chief-caravan-cast.js:15`, `guardDefendSector()`.

Routing runs only when distance exceeds 39. If guard and target are closer but separated by a non-gate wall, `sameSide` rejects the attack and the guard also stops moving. This leaves the guard idle beside the enemy until the wall breaks.

Reproduction: no towers; intact level-1 wall with right edge x=150; guard `(132,60)`, enemy `(168,60)` at 500 HP. After 300 calls to `guardDefendSector(w,1/60)`, guard remains exactly `(132,60)`, state is `spear`, and enemy HP remains 500.

Continue routing through a gate until a reachable melee position exists, even when straight-line distance is below 39. Keep wall collision intact and assert the guard eventually reaches an attackable side and damages the target. The current no-wall spear test does not exercise this branch.

### P2 — Ambient chatter interrupts an active conversation's pending reply

**Location:** `chief-caravan-fx.js:14`, `chatter()`, interacting with `chief-social.js` conversation scheduling.

The independent ambient timer checks the number of currently speaking residents but does not reserve both participants of `VillageSocial.state.active`. A partner waiting to reply is eligible for unrelated ambient speech, breaking the authored exchange. This path also bypasses the shared pool-use ledger and journal.

Focused reproduction on a fresh page:

1. Enter and close menus; remove residents and enemies; call `drawEffects(7.9)` to place the ambient timer just before firing.
2. Create three nearby civilian workers, each with `sayUntil=0`; initialize their citizen/logistics/council data.
3. Set social state `{active:null,time:100,nextAt:0,cooldowns:{},serial:0}`.
4. Call `VillageSocial.startConversation(a,b,'work')`, then `drawEffects(.2)`.

Observed: `active.replied` remains false, but **both speakers say `村の名前、まだ鉛筆書きだって`**. The scheduled partner reply is `いつでも逃げる気だね`. The ambient timer has put another opening line into the reply slot.

Send ambient conversations through the social scheduler or suppress them while an exchange is active and reserve both participants. The focused regression should assert that the pending partner remains silent until its scheduled reply and then says the stored reply.

## Other reviewed behavior

No additional must-fix issue identified in title pause, start/continue state preservation, autosave-only visible controls, removed spoken MP3 paths, shared-context murmur cooldowns, eighteen-destination rendering, persistent portrait appearance, or living/dead staffed-tower checks. Existing 24-check results support those paths; no physical-device or subjective audio claim is made.

**Disposition:** resolve these three focused cases, then rebuild the standalone artifact and rerun the affected checks. No P0/P1 findings.

## Focused fix verification — PASS

Root applied all three fixes. Independently reran only the original three cases against the current modular World HTML in Chromium; no broader review or suite rerun.

- **Compact dialogue: PASS.** At 360×640 with the same combo and text fixture, the first card remains `[410,513]` and the second is hidden when space is insufficient. No overlapping visible pair.
- **Spear routing: PASS.** With the same intact wall/guard/enemy fixture, 900 simulation steps with normal cooldown decrement move the guard through the gate and damage the enemy (500 HP to -10). The prior stationary stall is gone.
- **Pending reply: PASS.** The same ambient-timer fixture leaves the partner silent while `active.replied=false`; after `VillageSocial.tick(2.9)`, the partner says exactly the stored reply, `いつでも逃げる気だね`.

**Final scoped disposition:** all three Task 2 findings are resolved in the reviewed source. No outstanding must-fix finding from this review. Root remains responsible for rebuilding and validating the final standalone artifact from this source.
