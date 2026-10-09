# Final holistic review — Caravan05

Reviewed baseline `2a8f223deefc8e062dd435a0255d33ec7f9f0b40` through `ba7b7b407540ca6113ae880d5f18d4b7fb725159`, release notes, accepted specification steering, task reports, independent scoped reviews, integrated source/load order, packaged artifact and supplied renderer screenshots. No implementation or production changes were made. This is the one final integration review, not another broad test pass.

## Must fix

### P2 — Migration silently loses relationships for residents beyond the 200th relationship owner

**Location:** `chief-social.js`, initialization of `s.relations` (`Object.entries(raw.relations||{}).slice(0,200)`), interacting with `chief-campaign.js`'s supported 300-resident roster and reload-based migration.

The inherited social normalization retains at most 200 relationship owners, while Caravan permits and explicitly carries up to 300 residents. The migration writes the complete relationship map successfully, then the destination boot silently truncates it. This violates the new explicit promise that every resident's relationships travel with the caravan. The bound itself predates this change; the newly introduced caravan conservation contract must account for it.

**Focused reproduction, actual standalone release in Chromium:** freeze animation callbacks; create 201 valid resident records, initialize logistics/council data, and give each resident one valid relationship to the next resident; mark the current stage completed with no enemies/projectiles/away expedition; call `Campaign.migrate('rain', false)` and reload. This exercises the real serializer, validator, storage and destination initialization, with no migration-code replacement.

Observed result:

```json
{
  "before": {"migration": {"ok": true, "stageId": "rain"}, "workers": 201, "relations": 201},
  "after": {"stage": "rain", "workers": 201, "relations": 200, "lastRelationship": null}
}
```

**Required correction:** normalize relationship owners up to the supported roster bound (300), retaining the current resident-ID checks and per-person relation bound. Keep other resident-indexed normalization bounds consistent where applicable. Rebuild the standalone, then scope the single final rereview to conservation of a 300-resident relationship map through migration/reload. No broad suite rerun is required for this correction.

## Other conclusions

- No additional P0/P1/P2 must-fix issue found in reviewed integration paths: settlement/World separation, early over-cap inventory preservation, serial migration and rollback ordering, departure guards, stage goals and revisit unlocking, title pause/first gesture shared audio, autosave-only controls and guarded reset, or spear/staffed-tower wiring.
- The four prior scoped findings were not reopened: the reviewed fixes and independent recheck evidence cover wind destinations, compact card layout, wall/gate spear pursuit and active conversation reply reservation.
- Standalone regeneration was compared in memory with checked-in source and matched exactly. No artifact was rewritten by this reviewer.
- Inspected supplied actual-renderer first-village and dialogue screenshots; no new visual blocker identified. Existing test limitations remain accurately documented: seeded visual fixtures, Chromium mobile emulation, no physical iPhone or subjective listening claim, and no natural full 18-stage playthrough claim.
- One targeted runtime reproduction was run for the concrete relationship-loss risk above; no broad suites or production actions were run. Publishing must still preserve the main root and unrelated game artifacts, as the release plan requires.

**Disposition:** request the single P2 data-conservation fix before publication; then one scoped rereview of that fix.

## Single scoped fix verification — PASS

Reviewed fix commit `36d0d45`: saved relationship-owner and cooldown-owner normalization now supports 300 residents. Root rebuilt the standalone before this check.

Ran only `node tests/caravan-roster.cjs` against the actual self-contained release. All six assertions passed: migration succeeds, destination is rain, all 300 resident IDs survive unchanged, the entire 300-owner relationship map (three ties per owner) is deeply equal after reload, all 300 cooldown entries remain deeply equal, and no browser errors occur. The last owner `roster-299` retains all three relationships and its cooldown of 105. Evidence: `qa/caravan-v5/roster-results.json`.

The test freezes animation to isolate real serialization, validation, local storage and destination initialization. This is a seeded Chromium integration check, not a natural 300-person playthrough. No broader review, test suite, implementation edit or production mutation was performed during this rereview.

**Final disposition: PASS.** The one final-review P2 is resolved. No outstanding must-fix finding remains from this holistic review or its single scoped rereview.
