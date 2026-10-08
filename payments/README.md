# Chief World payment service

Standalone Node 24+ HTTP service. `npm ci && npm test`, then `npm start` from this directory. Stripe Node 23.0.0 uses API `2026-09-30.endive`; the SDK supports `integration_identifier`. The identifier has eight letters derived from a cryptographically random, durable order ID and stays identical across retries.

Use a persistent local SQLite volume for `DATABASE_PATH`; back up the database with SQLite-aware tooling, including WAL state. The Dockerfile runs as the node user and expects a mounted, writable `/data`. Put HTTPS and request limits in front of the service. This is a stateful server, unsuitable for ephemeral serverless SQLite storage.

## Configuration

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Game URL. Its origin is allowed by CORS. Fixed redirects retain this URL's origin, path, other query parameters and fragment, replacing only the `checkout` query parameter with `success` or `cancelled`. Defaults to `http://localhost:8080`. HTTPS required for live mode. |
| `DATABASE_PATH` | Persistent SQLite file; default `./data/payments.sqlite`. |
| `STRIPE_SECRET_KEY` | Server-only restricted Stripe key recommended. Test and live key prefixes are recognized. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this service's snapshot webhook endpoint. |
| `LIVE_PAYMENTS_ENABLED` | Must equal exactly `true` with a live key to sell in live mode. Default disabled. |
| `ALLOWED_ORIGINS` | Optional comma-separated exact additional origins. Wildcards rejected. |
| `HOST`, `PORT` | Defaults `127.0.0.1:4242`; Docker uses `0.0.0.0:4242`. |

Missing credentials, unknown key mode, or a live key without the live gate makes the service **preview**: catalog is visible, Checkout returns 503, and entitlements are empty. Test entitlements are kept separate from live entitlements. Keep server keys and webhook secrets in the host's secret store, never browser code or committed configuration. Restricted-key permissions must allow Checkout Sessions creation/read, Price/Product read for expanded session verification, and Charge read for refund aggregation. Register a required **snapshot** webhook endpoint at `/api/webhook` for:

- `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`, `checkout.session.expired`
- `charge.refunded`, `refund.updated`, `charge.dispute.created`

No tax collection is enabled. Configure merchant registration and applicable legal disclosures separately before enabling sales. No external Stripe objects or account setup are performed by this code.

## API

Every write requires `Content-Type: application/json` and at most 64 KiB. Errors have `{error: code}` with no grant data. All API responses are `no-store`. CORS is restricted to configured origins; bearer authorization is required independently.

| Method and path | Input | Output |
| --- | --- | --- |
| `POST /api/player` | `{}` | 201 `{token, recoveryCode, playerId}` |
| `POST /api/restore` | `{recoveryCode}` | `{token, playerId, entitlements, mode}`; unknown code returns 404 |
| `GET /api/catalog` | none | `{mode, products:[{sku,name,amount,currency,description}]}` |
| `GET /api/entitlements` | `Authorization: Bearer token` | `{entitlements:[sku],mode}` |
| `POST /api/checkout` | Bearer token; `{sku,requestId}` | `{url,sessionId}`; owned SKU returns 409; preview 503 |
| `POST /api/webhook` | Exact raw JSON bytes + `stripe-signature` | `{received:true}` after verified, durable processing |
| `GET /api/health` | none | `{status:'ok',mode}` |

The recovery code is the bearer token. **Possession grants full access to that purchase identity.** The server stores only a SHA-256 hash of the 256-bit random token. Keep it private and back it up before clearing browser storage; there is no email recovery or token rotation at this stage. New identity creation does not erase the original server purchases. Restore retrieves that original identity.

Use UUIDs or other safe strings (1–128 ASCII letters/digits/underscore/hyphen) for request IDs. Price, amount, currency, player ID, and redirect URL supplied by clients are ignored. Permanent catalog: `supporter` ¥300, `golden_seal` ¥980, `mayor_mech` ¥1980. No consumables or subscriptions.

| Product | Permanent unlock |
| --- | --- |
| `supporter` ¥300 | Crown and 太っ腹村長 title; player attack power unchanged. |
| `golden_seal` ¥980 | Player combat damage ×4 and golden pulse. |
| `mayor_mech` ¥1980 | Reusable transformation every 45 seconds; 15 seconds of player combat damage ×6 and 80% incoming damage reduction. Its multiplier does not stack with golden_seal. |

These purchases do not boost worker production. The mech unlock is permanent; each activated transformation lasts 15 seconds.

Pending identical purchases reuse their Checkout Session across requests/restarts. Canceled browser redirects do not mark a payment as failed or grant anything; the player can resume an open Checkout. Verified expiry or asynchronous failure closes it and permits a fresh request. Retrying the original expired request ID consistently returns 409 `request_expired`, including its first retry and after a replacement session exists. Ambiguous Stripe network failures retry the same durable order with identical parameters and Stripe idempotency key. Unresolved creation older than 23h is blocked with `order_requires_reconciliation` rather than risking a second payment after Stripe's idempotency retention window.

Only signed, paid Checkout webhook events fulfill. Fulfillment verifies the actual Stripe session, matching internal order, JPY amount, mode, SKU, product metadata, single line item, and payment intent. Events, orders and sessions are unique; SQLite transactions make fulfillment/revocation atomic. Full refunds and disputes revoke; partial refunds retain access until the cumulative charge refund is full. Durable payment-intent tombstones prevent a refund/dispute arriving before success from being undone by later delivery or replay. Disputes remain revoked even if later won; manual review is required to regrant.

Offline signed tickets are not implemented. Browser gameplay cannot be made tamper-proof by a payment backend; UI should apply perks only after a successful entitlement response and recheck at restore/reload and periodically for revocations. Losing the database or recovery secret loses the ability to validate ownership. Rates are bounded in-memory per process (restore 20/minute/IP); behind a proxy the service uses the socket IP and deliberately ignores spoofable forwarded headers. Add trusted edge limits for large deployments. No multi-region shared database or reconciliation admin UI is included.

Primary references checked: [Stripe webhooks](https://docs.stripe.com/webhooks), [Checkout Sessions create](https://docs.stripe.com/api/checkout/sessions/create), and installed Stripe SDK declarations/API version. No real payment or sandbox account was queried during implementation.
