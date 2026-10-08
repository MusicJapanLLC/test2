# World v3 single final fix wave report

Status: complete; the Important entitlement lifecycle finding and Minor timer-copy finding from final-review.md are addressed. Starting head: `db6bbb3`. Fix commit: `9c11c69` (`fix(world): revalidate verified purchases throughout open sessions`). No subagents, server/API changes, unrelated legacy engine changes, or live Stripe operations.

## Changed

- `chief-shop.js`: one serial verification chain, with a normal **30,000 ms** visible interval measured after completion. Hidden pages cancel scheduled polling. Window focus, document visibility resume, online reconnect, and shop entry request an immediate verification. Busy work rejects competing requests, including manual/restore/checkout activity, so service fetches never overlap.
- A configured `?checkout=success` return requests verification every **2,000 ms**, for at most **30,000 ms** from startup, then resumes normal verification. The query is only a retry trigger; entitlement grants still come solely from service responses. The return notice explicitly explains the pending window, stays visible after status/restore changes, and gives truthful follow-up when no ownership change is verified. A verified ownership-set change resolves it to a server-confirmed update.
- Failed verification and revoked entitlements clear owned effects and immediately clear an active mech once the failed/revoked result is received. Existing ten-second per-request abort remains unchanged. Polling without an identity only checks catalog and never creates a player. The unconfigured preview installs no network polling/hooks and manual/shop triggers make no external request.
- `chief-world-ui.js`: persistent PREVIEW / Stripe test / LIVE environment badge independent of transient operation status; Checkout return notice; shop-entry verification; recovery draft, active input/select focus, and password selection restored across background UI renders. The recovery draft remains in memory across tab changes. Trade and expedition guidance now explains menu pause and progress while exploring.
- `chief-ui.js`: the existing forge guidance line is conditional on `document.body.dataset.world === 'true'`. World uses the corrected exploration/menu guidance; Chief v2.1 keeps its previous text.
- `tests/world-shop-lifecycle.cjs`: focused actual-production-page lifecycle regression fixture and controlled Playwright browser clock. No production-only fake timers or mock grants were added.
- `assets/chief/chief-world-pixel.woff2`: regenerated from `/tmp/DotGothic16-Regular.ttf` using fontTools, including source text plus existing bundled glyphs. Covers all Japanese source characters, including new サ / 映 / full-width parentheses. Size 46,072 bytes (base 45,928). The source font still lacks twelve existing icon symbols; browser font fallback supplies those as before.
- `prototype-chief-world-standalone.html`: rebuilt by the existing script in default unconfigured preview mode; 374,315 bytes (base 371,290).

## Test commands and final output

All browser gates used `/tmp/chromium`. The HTTP server and HTTP-based test must share one shell exec because this environment isolates loopback between executions:

```sh
python -m http.server 4173 --bind 127.0.0.1 >/tmp/world-final-lifecycle-http.log 2>&1 &
world_http_pid=$!
trap 'kill "$world_http_pid"' EXIT
node tests/world-shop-lifecycle.cjs
```

Final lifecycle run: **32/32 checks; exit 0**. Full output:

```text
PASS Checkout success and forged query cannot grant ownership
PASS Checkout return shows explicit pending verification
PASS pending return does not poll more often than two seconds
PASS delayed fulfillment arrives automatically without manual refresh or reload
PASS background verification preserves recovery draft, focus and selection
PASS verified change resolves pending return message
PASS mech is active before remote revocation
PASS ordinary visible verification waits thirty seconds
PASS automatic revocation clears seal and active mech while game remains open
PASS foreground focus automatically regains verified ownership
PASS online event automatically observes revocation
PASS hidden document makes no periodic verification requests
PASS visibility resume immediately regains verified ownership
PASS shop entry automatically observes revocation
PASS failed automatic verification fails closed and ends active mech
PASS test environment badge survives connection status failure
PASS test environment badge survives restored status
PASS live environment badge remains explicit after restore
PASS slow verification fixture is in flight
PASS foreground, online, shop and manual bursts never overlap service fetches
PASS automatic verification never creates a player or starts checkout
PASS pending return short retries are bounded to a thirty-second window
PASS unfulfilled return retains truthful pending follow-up after retry window
PASS return expiry falls back to thirty-second verification
PASS ordinary verification continues after return retry window
PASS configured polling with no identity only checks catalog and never creates a player
PASS unconfigured preview stays at zero external requests with forged return and automatic hooks
PASS trade copy correctly explains progress during exploration
PASS expedition copy correctly explains menu pause and exploration progress
PASS World-only forge guidance explains exploration progress
PASS Chief v2.1 retains its original forge guidance
PASS no uncaught browser errors: []
REQUEST_EVIDENCE {"lifecycleRequests":29,"pendingWindowRequests":34,"maxConcurrentFetches":1,"previewExternalRequests":0}
TOTAL 32 (actual production page, mocked payment service, controlled browser clock; no real Stripe operations)
```

The full lifecycle test uses real authored frontend scripts loaded by the production World page. Only payment responses and browser time/foreground visibility stimuli are controlled. The normal thirty-second interval, 2-second retry cadence, 30-second retry expiry, hidden-page suspension, automatic grants/revocations and active mech clearing are exercised without waiting wall-clock 30 seconds per case. Focus/online events are dispatched; hidden/visible transitions use a controlled `document.hidden` property and the real visibility listener. This is browser integration evidence, not a claim of physical-phone foreground/reconnect validation.

Affected World UI gate (same-exec local HTTP server):

```sh
node tests/world-ui.cjs
```

**36/36 checks; exit 0.** Final output:

```text
PASS no uncaught browser errors: []
TOTAL 36
```

The gate includes actual pointer movement, gesture audio initialization, entry into forest/canyon/marsh through real UI, natural collection unlocks, return home, pause behavior, purchase attack/shield effects via explicit test service, menu layout at 360/390/844 widths, local forged purchase rejection, restore, reset identity retention and fail-closed/revoked behavior. `qa/world/ui-results.json` records checks 36 and errors [].

Build and standalone actual-play gate:

```sh
node scripts/build-world.cjs
node tests/world-standalone.cjs
```

Build output:

```text
World standalone: 374315 bytes; payments: preview
```

Standalone output (**5/5 checks; exit 0**):

```text
PASS standalone boot / embedded assets / actual forest gathering / honest preview shop / zero errors or external requests
```

`qa/world/standalone-results.json` records checks 5, errors [], externalRequests [], file-URL play, and preview mode. This includes actual forest gathering from the rebuilt standalone, embedded scripts/styles/assets, honest disabled purchases and zero external HTTP requests.

Syntax gates: `node --check chief-shop.js`, `node --check chief-world-ui.js`, `node --check chief-ui.js`, and `node --check tests/world-shop-lifecycle.cjs` all exited 0 with no output. `git diff --check` exited 0 with no output.

Total final browser assertion evidence in this wave: **73 passing checks (32 lifecycle + 36 affected UI + 5 standalone)**. Chief v2.1 copy preservation is covered by one targeted actual-page assertion inside the 32 lifecycle checks; its broad 49-check gate was not repeated because no Chief behavior changed. Previously passing payment/simulation/legacy gates were not repeated. Generic root npm test's existing 13/17 result and four base-reproduced obsolete ABXY/directional assertions are recorded by the parent in release evidence and are outside this scoped fix.

## Known limits / concerns

- No unresolved scoped fix concern. Purchase verification is bounded/eventual, not zero-latency: ordinary visible revalidation runs 30 seconds after completion; individual payment fetches retain their existing ten-second timeout. Hidden pages recheck on resume. Offline verification removes unverified effects when its failure is observed.
- Checkout return metadata does not identify a trusted purchased SKU or prove payment. Ownership is strictly response-driven; a return with no changed verified ownership retains pending follow-up and normal revalidation rather than falsely announcing a grant.
- Payment tests use fixtures only; no actual Stripe charge, refund, webhook or live merchant operation occurred. Browser tests are desktop Chromium mobile emulation, not physical iOS/Android or auditory validation.
- One initial local-server attempt failed with `ECONNREFUSED` because it ran in another network namespace. Running server and test in the same exec resolved it. An initial focused lifecycle run passed 30/30; the final run above adds no-identity polling and old-Chief-copy assertions and passes 32/32.
- Existing UI/standalone tests refresh tracked `qa/world/*.png`. These are left for the parent to stage with release evidence. Parent-owned `WORLD_V3_HANDOFF.md` and publishing metadata were not staged in this fix commit. This report follows the existing ignored `.superpowers` report convention and is available in the workspace.

## Merge notes

Commit only the owned production/test/font/standalone files; parent performs the one scoped final re-review and publishes the playable preview. No additional feature wave or live payment activation is required by this fix.
