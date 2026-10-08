# Mayor domain discovery — 2026-10-08

Read-only deployment discovery. No deployment, DNS, route, branch or remote file was changed. This file is the only local change by the discovery task.

## Findings and confidence

| Scope | Evidence-backed target | Verification limit |
| --- | --- | --- |
| Existing domain entry | Vercel project `guild-akari-game`, `prj_NBCaxFSAXKu6SGCYOkvuAXpQ1fB9`; team `musicjapanllc`, `team_YYjb3kjHKNHDFvupwnzuBcRw` | Exact IDs are recorded in The World's deployment documentation. Current scoped project/alias/routes/deployment reads return **403 forbidden**. |
| Homepage `/` | Existing game **ギルドの灯** | HTTP 200, Vercel response headers; current HTML SHA-256 below. The connected GitHub repositories do not identify this game's source repository/production branch. Do not equate it with legacy GUILD∞. |
| Existing `/the-world/` | Cloudflare Pages `music-japan-the-world`; account `d88ea188f03390ecf51a823ef7a9a5c0`; Pages production branch `main`; documented immutable origin `c879d094.music-japan-the-world.pages.dev` | Documentation says direct static upload, not automatic deployment from the GitHub default branch. Current automated public requests receive Cloudflare 403/1010 through Vercel; this alone does not prove a browser outage. |
| The World development source | Private `MusicJapanLLC/the-world`, `feat/living-world-discovery-20261008`, `07a783f9d48e8e0ae76b2be6ce93fa2d02f3ed2c`, PR #1 | GitHub connector verified. `main` at `7e5be7ded62d0dacbfce4548af2dfba697cf7eb8` contains only README.md. The unmerged branch's Homes preview is not the documented production release. |
| Mayor source | `MusicJapanLLC/test2`, `feat/chief-world-v3`, `51fbc5ae8312582673ecb661ee99480abeecda72`, PR #130 | GitHub branch SHA verified. This is the discovery baseline, not a promise that later implementation has the same commit. |
| Proposed additive path | `https://game.music-japan.com/mayor/` | Public path returned Vercel 404 on discovery. No Mayor origin/project is known yet. |

`MusicJapanLLC/the-world2` exists, default branch `audit/reality-gate-v1`, but no evidence connected it to this game domain. Repository searches for `guild` did not return a separate accessible Guild repository. Absence in connected search is not proof that a repository does not exist.

The legacy `.github/workflows/guild-pages.yml` deploys only `game/guild-infinite-hd2d-v03` to GitHub Pages. It is unrelated evidence for today's Vercel entry point and must not be dispatched for this release.

## Existing routes to preserve

The World deployment record names production route version `2c13d67a-6604-467d-9888-3ccb9bdd5698`:

| Route | ID | Match and destination |
| --- | --- | --- |
| The World - Cloudflare | `dcf4e5e6-611b-41c0-9171-504e08a6a757` | `^/the-world/(.*)$` → `https://music-japan-the-world.pages.dev/$1` |
| The World - trailing slash | `4577c1c2-183f-406a-8f53-934e31ede9ec` | `/the-world` → `/the-world/`, HTTP 308 |

Both have an exact host condition `game.music-japan.com`. This is a documented previous state; obtain live production and staging route versions before any mutation. Other work may have added rules.

## Reproducible evidence

Read with the GitHub connector, pinned to commit `07a783f9d48e8e0ae76b2be6ce93fa2d02f3ed2c`:

- `https://github.com/MusicJapanLLC/the-world/blob/07a783f9d48e8e0ae76b2be6ce93fa2d02f3ed2c/docs/DEPLOYMENT.md`: exact Vercel/Cloudflare IDs, routing, direct upload commands and rollback anchor.
- Same commit, `docs/2026-10-08-source-audit.md`: source provenance and Pages output/build distinction.
- Same commit, `docs/2026-10-08-release-notes.md`: production prototype03 is retained while Homes preview is separate.
- `GET https://api.github.com/repos/MusicJapanLLC/the-world/pulls/1`: open PR from the branch above into README-only main.
- `GET https://api.github.com/repos/MusicJapanLLC/test2/branches?per_page=100`: Mayor source branch SHA above.

Public homepage request at approximately 15:29 UTC:

- HTTP 200, title `ギルドの灯 | 合同会社Music Japan`, `Server: Vercel`, `X-Vercel-Cache`, `X-Vercel-Id`.
- Response bytes: **1,399,790**; SHA-256 **471949937bb6a65b14c87d66f95403f79ee5bfc8da23264efacfe89849794436**.
- No external script URL or GitHub source reference appeared in its HTML.
- `/mayor/`: 404. `/the-world` and `/the-world/`: automated HTTP 403; sampled body `error code: 1010`, Cloudflare `Cf-Ray` header plus Vercel headers. This is a baseline limitation, not authorization to change those routes.

Vercel connector probes with **explicit** team `team_YYjb3kjHKNHDFvupwnzuBcRw` all returned 403, scope `musicjapanllc`: project, alias `game.music-japan.com`, production deployments and project routes. Unscoped probes returned 404 and the unscoped project catalog contained unrelated projects; they must not be used as release targets. Local `vercel` CLI is unavailable, so no authenticated same-scope CLI fallback was possible. No Cloudflare connector is available. No credentials were read or requested.

## Safe additive release instructions

1. Restore supported access to **the existing Vercel musicjapanllc scope**. Read project/alias, live and staged route versions and production deployment with Git repository metadata. Record the homepage's actual source repository/branch or establish that it was uploaded directly. Do not create a replacement domain owner.
2. Package the reviewed Mayor release from its exact new commit into an allowlisted directory. All runtime JS/CSS/fonts/audio must resolve under `/mayor/` (or be embedded); avoid root-relative asset URLs. Keep its save namespace separate from the homepage and The World. Confirm the payment API paths before deploying because same-origin paths will now be under the game domain.
3. Host Mayor in its **own** origin/project; a separate Cloudflare Pages static project follows the existing site architecture. `music-japan-mayor` is only a proposed name, not an existing verified project. Do not deploy Mayor to `music-japan-the-world` or upload an entire workspace root. Stage/verify the immutable origin before routing.
4. On `guild-akari-game`, add exactly two new rules with fresh IDs: exact-host `^/mayor/(.*)$` → the verified Mayor origin `/$1`, and exact-host `^/mayor$` → `/mayor/` with 308. Do not replace existing routes. The available `stage_routes` tool merges by ID when `overwrite` is omitted; capture and review the diff, preserve unrelated staging changes, then publish only the reviewed version.
5. After release, verify `/mayor`, `/mayor/` and its packaged assets, then compare `/` byte-for-byte with the recorded pre-release bytes. Verify the existing `/the-world/` rules and browser behavior against their pre-release baseline. Record the new origin deployment, routes, production version and release commit.
6. Roll back only the two newly added Mayor rules; do not roll the entire site to the old route version because that can discard concurrent additions. Keep the previous Mayor origin deployment as a separate rollback anchor.

## Remaining blocker

The domain entry owner/project is identified from concrete same-day release documentation, but authenticated live verification and publication are blocked by **Vercel 403 access to musicjapanllc**. Cloudflare account/project access is also unavailable. The homepage's current source repository/production branch remains unknown. These cannot be safely inferred from the legacy workflow or solved by publishing the Mayor repository to the domain root.

## Browser follow-up — live owner and pipeline verified

This section supersedes the unknown homepage source and publication-access conclusions above. The authenticated Vercel browser session successfully opened the exact existing project without sign-in or account switching. The connector's 403 remains a connector limitation; it does **not** prevent this browser from viewing the actual project. No hosting settings, routes, deployments or repository content were changed. A nonbinding authenticator setup recommendation was dismissed; existing security settings were not changed.

Live Overview (`https://vercel.com/musicjapanllc/guild-akari-game`) shows:

- Connected source **MusicJapanLLC/test**, root directory **guild**.
- Production branch **claude/guild-idle-game-j8o75k**; UI explicitly states that pushing this branch updates production.
- Production commit **a51301aa0b5a9266cba54add22e496aa2ccee8cb**.
- Ready production deployment **guild-akari-game-hn3bxhumi-musicjapanllc.vercel.app**, detail ID **2Ga9Gbjv6by2mSHSJYLfaz5M2WAv**.
- Assigned domains `game.music-japan.com` and `guild-akari-game.vercel.app`.

Live Build and Deployment (`https://vercel.com/musicjapanllc/guild-akari-game/settings/build-and-deployment`) shows:

| Setting | Current value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | guild |
| Build Command override | node build.mjs |
| Output Directory override | dist |
| Install Command override | echo No dependencies |
| Node.js Version | 24.x |
| Include files outside root in build | Enabled |
| Skip unaffected root/dependency deployments | Enabled |
| Ignored Build Step | Automatic |

Live Git settings show `MusicJapanLLC/test` connected since Oct 4. There are no deploy hooks. Therefore an additive `guild/mayor/index.html` delivery through the existing production repository is a concrete alternative to a new Cloudflare project, **provided `guild/build.mjs` is adjusted or already copies it into `guild/dist/mayor/index.html`**. Adding a source folder alone does not establish that the built deployment includes it. The parent release task is inspecting that build file and repository-level Vercel routing concurrently. Preserve the current root output and API files byte-for-byte where possible.

Live CDN routing (`https://vercel.com/musicjapanllc/guild-akari-game/cdn/routing`) reports **2 of 100 routes**, exactly the two The World rules documented above, both enabled. The rewrite editor confirms `^/the-world/(.*)$`, host regex `^game\\.music-japan\\.com$`, destination `https://music-japan-the-world.pages.dev/$1`. No project-wide catchall appears in these live project routes. Deployment-defined rules must still be checked in repository `guild/vercel.json` / build output before an additive static release. No new Mayor CDN rules are needed if Vercel serves the built Mayor directory correctly.

Cloudflare account navigation redirected to its ordinary sign-in page. Its session is not authenticated. Secure browserAuth guidance was read; no credentials were inspected or entered, and no sign-in was started because the existing Git deployment may provide the required additive publication path without Cloudflare changes.
