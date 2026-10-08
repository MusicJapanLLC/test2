# World v3 final whole-branch and UI integration review

Reviewed base `1369006d885b3347f52779f9bc0287746247d680` through `db6bbb3`, using the supplied complete authored-source diff, current implementation files, spec, handoff, task reports, fix reviews, and test evidence. Read-only implementation review; no source, index, or branch changes. This report is the only written file. No subagents or real Stripe operations.

**Spec compliance verdict: changes requested for the end-to-end entitlement lifecycle.** The world, expedition, council, persistence, legacy-preservation, and server-payment requirements otherwise substantially conform. The previously reported payment-expiry, initial-null-intent, material-sink, and friendship issues are closed.

**UI integration quality verdict: changes requested.** The four-action mobile layout, parchment world sheet, explicit preview shop, physical region entry/return, and paused-menu behavior are cohesive. One important purchase lifecycle gap and one minor timer explanation mismatch remain. **Not ready to merge until the important finding is addressed.**

## Critical

None found.

## Important

1. **Purchase state never automatically revalidates after the first page load.** `chief-shop.js:10,15,23` defines refresh and performs it once at startup, while subsequent ticks only decrement combat timers. There are no focus, visibility, reconnect, periodic, or Checkout-return retry hooks. `chief-world-ui.js:32` can refresh only after the user explicitly presses the update button. Thus a refund correctly processed by the server during an open game leaves the player with the revoked permanent multiplier and reusable mech indefinitely. The reverse race is also user-visible: if the success-return page's first fetch precedes the paid webhook, the item remains unowned until the user discovers manual refresh or reloads. This is an integration gap between the otherwise-correct durable service and promised purchase/refund behavior, not an anticheat demand.

   Focused verification used the actual `chief-shop.js` in a small isolated Node VM with a fake service response and no real payment: initial verified seal gave multiplier 4 with two requests; after the service entitlement was removed, 3,600 one-second ticks plus focus/online events still gave multiplier 4 with the same two requests; explicit refresh changed it to 1 with four requests. Existing UI tests cover revocation only through reload and failure only through explicit refresh, so they do not cover this case.

   Add bounded automatic revalidation while configured, recheck on return/reconnect, and retry a pending Checkout return for a finite period with truthful pending status. Keep successful grants exclusively response-driven, preserve preview's zero-network behavior, and avoid replacing a recovery input or other active form on every background request. A focused lifecycle test should prove delayed fulfillment appears and revocation disappears without reload/manual update, and failed revalidation removes effects as documented.

## Minor

1. **Timer guidance incorrectly tells explorers to return to the village.** `chief-world-ui.js:21–22` says the trade preparation advances “村に戻ると” and an expedition resumes “村に戻ると再開”. Both advance during active regional exploration (`chief-world.js:51,67`), and the atlas itself correctly says expeditions continue while away. This gives contradictory guidance just when a player checks an expedition from a region, and can cause an unnecessary return home. Use wording such as “メニューを閉じると再開 / 探索中も進行”; update the inherited forge timer wording for the world edition if shown (`chief-ui.js:30`). This is a copy correction, not a requested simulation change.

## Reviewed strengths and evidence

- Five independent regional scenes preserve village arrays, provide progressive free collection unlocks, bosses, return-home coordinates, and a persistent journal. Home iteration/lifecycle/cache/minimap guards and wrapper load order were inspected together. Expedition workers remain the same objects; scoped serialization and friendship lookup retain the complete roster.
- Import preflight selects Chief before Pocket, writes only the new namespace, and retains a reset/import marker. New nested state has bounded normalization. Explicit reset preserves separate purchase identity. Existing editions remain additive rather than overwritten.
- Council decisions validate costs, consume IDs before effects, and persist delayed outcomes; defense and fifth-night boss ledgers are explicit. Existing four gates, total tower limit, absent wall archers, absent camera shake, and removed speed/audio controls are preserved through the limited shared-file changes and reported regressions.
- Checkout uses server prices and fixed redirects; only signed, paid, validated sessions fulfill. SQLite uniqueness and refund tombstones protect duplicate/out-of-order events. Preview remains the default, client save fields cannot assert purchases, and game reset does not erase the recovery identity.
- Inspected the 360-wide, 844-landscape, atlas, and preview-shop screenshots. Layout is contained, actionable controls are legible, and the shop's unavailable state is clear. Landscape intentionally relies on sheet scrolling. No claim of physical-device or auditory validation is made.
- Accepted supplied same-head evidence: payments 37, simulation 47, new UI 36, standalone 5, old Chief 49, Pocket 29, and five legacy suites passing. Inspected their relevant assertions; did not rerun covered suites. The only additional execution was the narrow entitlement-lifecycle probe above. The generated standalone is represented by its build script and reported file-URL/zero-network checks rather than a duplicated generated-source review.

## Considered but not raised as findings

- Live merchant activation, public hosting, email recovery, a reconciliation dashboard, multi-region SQLite, and real Stripe/physical-phone validation: explicitly deferred or documented limitations; this review does not invent deployment prerequisites for a preview release.
- Client-side tampering or perfectly immediate remote revocation: a static single-player game cannot be tamper-proof, and zero-latency revocation is unnecessary. The finding asks for a finite, automatic verification lifecycle, not continuous authoritative combat.
- Offline expedition progress and a running village while exploring: explicitly outside the active-time/frozen-home model. Remote village menu actions are not prohibited by the spec, and no concrete corruption was found from permitting them.
- Larger procedural maps, stronger long-term economy tuning, sophisticated social simulation, or exact parity with concept art: the accepted first-stage scope requires visitable distinct maps and bounded village-life interactions, which are present. Retention and hours-long balance are honestly unproven.
- Completed Figma frames, a paid Higgsfield plan, or bundled model output: connector limitations and design-only artifacts are explicitly disclosed; they do not falsely claim completed assets.
- The earlier material sink/friendship/payment findings: fixes and meaningful regression assertions are present, so they are not reopened.

After the purchase lifecycle fix, review that focused diff and its new lifecycle evidence, correct the timer copy, and rebuild the standalone. No broad repeat of already-passing regression suites is requested unless the fix changes shared engine behavior.

Additional evidence from root during review: generic `npm test` reports 13/17 passing; four failures concern obsolete directional/ABXY controls in unchanged `index.html` and related legacy files. Root is checking those against base `1369006`; the first was already reproduced identically. These are not included in the World v3 pass counts and are not raised as newly introduced findings. Record the completed baseline comparison in the release evidence.


---

# World v3 final scoped re-review

Scope: exactly `db6bbb3..9c11c69`, the supplied `final-fix-review.diff`, fix brief, report, and added lifecycle assertions. No source edits, helper agents, repeated gates, real Stripe actions, or expanded review. Generated standalone/font changes are assessed through source/build evidence.

**Spec verdict: PASS. UI integration quality verdict: APPROVE. Ready for merge as the documented preview release; both final-review findings are closed.**

| Original finding | Verdict | Basis |
| --- | --- | --- |
| Important: entitlements never automatically revalidate after startup | **ADDRESSED** | `chief-shop.js` now schedules serial visible verification 30 seconds after completion, rechecks on foreground/reconnect, and exposes the shop-entry trigger. Checkout success returns receive a bounded 2-second retry window, then normal verification. URL parameters only trigger verification; ownership still comes from service responses. Revocation/failure clears ownership and active mech. Busy guards prevent overlapping service operations; hidden pages suspend scheduled polling; unconfigured preview installs no polling. |
| Minor: trade/expedition/forge copy implies returning to village is required | **ADDRESSED** | World trade and expedition text now distinguishes menu pause from ongoing exploration. The forge copy uses a World-only conditional, preserving Chief v2.1's existing wording. |

The supporting UI changes preserve the recovery draft, focus, and selection across background renders, retain an explicit environment badge independently of transient operation status, and display a truthful Checkout-return notice. No new actionable Critical, Important, or Minor breakage was found in this fix diff. Server price/grant authority and the unchanged engine/save constraints remain intact.

Accepted same-head evidence: **32 lifecycle + 36 UI + 5 standalone checks passing**, syntax checks and diff whitespace checks passing. Inspected the added actual-production-page fixture assertions: delayed fulfillment, automatic revocation with active mech, focus/online/visibility/shop triggers, failed verification, serial request behavior, retry expiry, recovery input preservation, preview zero requests, and old-Chief copy preservation. Tests control payment responses and browser time; they do not claim real Stripe or physical-phone validation. No tests were rerun in this re-review.

Remaining documented limitations are unchanged: verification is bounded/eventual rather than instantaneous; live selling remains unconfigured; real Stripe and physical devices are untested. The four unrelated generic legacy touch-control failures have been reproduced at the base and are documented in `docs/qa/world-release-evidence.md`; they are not regressions introduced by this fix.
