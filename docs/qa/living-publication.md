# Living04 publication handoff

## Reviewed artifact boundary
The release is the single built `prototype-chief-world-standalone.html`. `node scripts/package-mayor.cjs /tmp/music-japan-mayor-release` emits only `index.html` and a checksum manifest. Embedded font and three voice clips require no root-relative paths or external CDN at runtime. Payments stay in explicit preview; no live checkout backend is configured by this release.

## Existing official domain
Requested URL: https://game.music-japan.com/mayor/

Authenticated Vercel browser settings confirm project `guild-akari-game`, team `musicjapanllc`, Git repository `MusicJapanLLC/test`, production branch `claude/guild-idle-game-j8o75k`, root `guild`, build `node build.mjs`, output `dist`. The API connector403 was bypassed using the user's already authorized signed-in browser session; no credentials or DNS changes were needed.

Publication adds only `guild/mayor/index.html` and a build copy into `dist/mayor/index.html`, via a reviewed PR into the existing production branch. The source game lives in MusicJapanLLC/test2. Existing root and `/the-world/` routes remain unchanged. A concurrent production update added specific `/lantern-journey` rewrites; our host branch was rebased onto `ed8082d2e4b7f268ceffee5116fa754d4135cc08` and preserves those rules without edits. Rollback is reverting that host PR.

Baseline source `a51301aa0b5a9266cba54add22e496aa2ccee8cb` builds the currently live homepage byte-for-byte. After adding Mayor, root SHA256 remains `471949937bb6a65b14c87d66f95403f79ee5bfc8da23264efacfe89849794436`, and artifact SHA256 remains `c98e058a80fceacdc1669e97bcdaab2c3ab94b3627b2a80ddf1b5c4a52680c34`.

Prepublication Mayor SHA256: `7ac848c61bd20306cbd2687b4cfbd175631968f04fd6d88feccd89cef0ee6bf8`,586799 bytes. Self-contained build passes actual forest gathering, disabled preview shop, zero browser errors and zero external runtime requests. Deployment readiness must still be verified after merge before reporting the URL as live.

## Player save move
Open the new version on the old raw.githack.com origin first, which retains its existing World namespace. In 村長室 → 街のお引っ越し, export the save file. Open the official domain after publication, choose the file and review DAY / resident count before confirming. A backup of the previous destination save is retained and can be restored from the same panel. Purchase recovery is separate; payment identity is never transferred in the save file.

## Validation labels
All images in qa/living are actual game renders. The village, cargo and relationship scenes use seeded fixtures to expose specific states; they are not claims of natural-play progression or real purchases. Mobile checks are Chromium emulation, not physical phone testing.

Final security correction: both inherited building upgrade attributes escape IDs, imported autoForge requires an optional boolean, and its rendered attribute is boolean-only.19 focused browser security checks passed, including real import/reload/render, plus the26 existing focused checks. Rebuilt standalone5 checks pass after this correction.

## Published — 2026-10-08
- Official verified URL: https://game.music-japan.com/mayor/
- Host PR: https://github.com/MusicJapanLLC/test/pull/1010 (merged)
- Source PR: https://github.com/MusicJapanLLC/test2/pull/131
- Host merge: ddedd21219ac192703d865b0c804c10deae0a8cb
- Production Vercel deployment: 2cX8QxubuMBEjqZnu9HHFuadTJa5, guild-akari-game success
- Official HTTP200,586799 bytes, SHA2567ac848c61bd20306cbd2687b4cfbd175631968f04fd6d88feccd89cef0ee6bf8: exact reviewed release
- Existing homepage HTTP200,1399790 bytes, SHA256471949937bb6a65b14c87d66f95403f79ee5bfc8da23264efacfe89849794436: byte-identical baseline
- Authenticated cloud browser opened the official URL, showed LIVING04, entered the forest through the real controls, and wood/collection increased0 to16. Screenshot: qa/living/official-live.jpg. Browser logs contained extension metadata errors only, not game-origin errors.
- Existing The World project routing was not changed; its earlier automated HTTP baseline was Cloudflare1010, so no new claim of successful automated play for that unrelated route. The specific Lantern Journey repository rewrites are byte-preserved.
- The repository triggers several unrelated Vercel projects. The test project status was already failed on production base ed8082d; guild-akari-game succeeds on both preview and production. No required-check bypass or hosting setting changes were used.
- No real charge or checkout activation. Physical iOS/Android and subjective sound perception remain untested.

Old-origin migration build: https://raw.githack.com/MusicJapanLLC/test2/4a2370a40f5714b3dbc3883e304e2214612cd4e2/prototype-chief-world-standalone.html
Open it on the previous raw.githack.com origin to export the existing World save, then import at the official URL through 村長室 → 街のお引っ越し. Do not reset the prior village.
