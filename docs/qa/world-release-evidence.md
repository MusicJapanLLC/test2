# World v3 release evidence

Base: `1369006d885b3347f52779f9bc0287746247d680` (PR129)

## Scope verification

The release handoff records the independent World, payments, mobile UI, standalone, old Chief, Pocket, and v1.6 results. The screenshot files in `qa/world/` come from the actual browser game, not the image concept or MagicPath prototype. `mech-test-fixture.png` uses a mocked payment-service response and is not a real purchase.

## Existing generic test failures

`GUILD_EXECUTABLE=/tmp/chromium npm test`: 13/17 passing. These four failures concern the old generic game's directional/ABXY controls:

- touch hold cancellation and multitouch isolation: expected visible direction control
- native two finger touch and cancellation: expected `[data-dir="down"]` bounding box
- touch controls at 390×844: expected four directions and ABXY controls
- touch controls at 844×390: same expected controls

An isolated detached worktree at base `1369006` ran `GUILD_TEST_FILTER=touch GUILD_EXECUTABLE=/tmp/chromium npm test`. All four reproduced with the same failure conditions, 0/4. `index.html`, `game.js`, `graphics.js`, `audio.js`, `tests/playtest.cjs`, and `package.json` are unchanged in this release. These failures are recorded, not counted as passing World tests.

`npm run check` and `npm run test:audio` passed. No physical phone, auditory evaluation, live Stripe charge, or real Stripe test Checkout was performed.

## Final scoped review

The final fix `9c11c69` passed 32 lifecycle checks, 36 World UI checks and 5 standalone checks. The independent scoped re-review marked both entitlement-lifecycle and timer-copy findings addressed, with no new or residual findings. Spec PASS; UI quality APPROVE for the documented preview release. Detailed evidence is in `world-payment-lifecycle-report.md` and `world-review.md`.
