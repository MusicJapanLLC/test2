# GUILD∞ browser regression suite

The suite operates the published game UI and reads snapshots through `window.GUILD_API`; it does not alter private game variables.

Install Node.js, `playwright`, and its Chromium browser, then run from the project root:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/playtest.cjs
```

Optional environment variables:

- `GUILD_URL`: an already running HTTP server
- `GUILD_ENTRY`: an alternate entry file, such as `play.html`
- `GUILD_BROWSER=webkit`: run the cross-engine subset with Playwright WebKit
- `GUILD_EXECUTABLE`: path to an existing Chromium executable

The suite normally starts a temporary local HTTP server itself. Reports and screenshots go to `test-results/`.

Covered behaviors: autostart and resource production, single-key and held grid movement, release/blur/background clearing, collisions, menu isolation, world-speed independence, fixed population during upgrades, persistence, corrupt/invalid saves, unavailable storage, cancellation/concurrent pointers, gesture-started audio, native Chromium two-finger touch, and portrait/landscape control geometry.

Mobile emulation verifies the browser implementation. Actual iPhone Safari hardware remains a separate check for home-indicator safe areas, hardware audio routing, and device performance.
