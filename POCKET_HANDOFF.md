# GUILD∞ POCKET v2.0 — おバカ開拓村

## Role
Coordinator / Experience / implementation / QA for the legacy Buildjoy game only

## Changed
- Retains analog drag, automatic gathering, construction growth, four-gate civilian routing, original procedural audio, no screen shake, no wall archers, maximum 16 towers
- New mobile presentation with readable Japanese labels, 44px utility targets, bottom sheets, landscape support and a compact exploration map
- Original pixel detailing: expressive workers, hats, resource hit reactions, roof/chimney detail, smoke, vegetation, river and short worker remarks
- Gathering chains (up to +50% personal yield), 22-second cooldown whistle (five seconds of doubled player yield and nearby enemy knockback)
- Three persistent village policies, five levels each; one point per survived night plus selected milestones
- Nine one-time milestone rewards and six one-time exploration caches
- Menus and background visibility pause gameplay; hourglass and whistle deadlines retain remaining time; active rally survives reload
- Separate `guild-pocket-v2` save namespace, original `guild-infinity-v16-clean` untouched
- Reset blocks lifecycle saves so the old town does not reappear during reload

## Files / Branch
Branch: `feat/buildjoy-pocket-v2`, based on exact PR127 head `4f78c04d41f8338197745a4bc5d44805125f367e`

Play entry: `prototype-buildjoy-pocket.html`
Self-contained build: `prototype-buildjoy-pocket-standalone.html` (no runtime asset requests)
Enhancements: `buildjoy-pocket.js`, `buildjoy-pocket-art.js`, `buildjoy-pocket.css`
Minimal shared-engine changes: optional save namespace and resetting save guard

## Tests
- Pocket browser suite: 29 passing assertions; real pointer movement, UI building/hiring, pause, policy spending, duplicate reward guards, cache rewards, reload, animation cleanup, active rally, keyboard activation, background boost pause, legacy save isolation, 12 civilian-role/four-gate round trips, no wall arrows, three viewport sizes, reset/reload, zero runtime errors
- Legacy suites: 5 passed (defense, hardening, progression, routines, stability)
- Standalone build boots without external runtime assets
- Separate resource-unmodified first-session run: actual pointer drag + automatic gathering + UI actions reached first house in 9.6 seconds and first worker in 9.8 seconds; automation knows target coordinates, so this is not a human usability timing claim
- Chromium 153 desktop with 360×640, 390×844 and 844×390 viewports
- Screenshots in `qa/pocket`; developed-village screenshots use seeded test state, `natural-first-worker.png` uses earned resources
- Final independent code review found paused consumable expiry; regression reproduced failure before fix, then suite green

Reproduce after `npm install` and `npx playwright install chromium`, with a local HTTP server on 4173:

```
node scripts/build-pocket.cjs
npm run test:pocket
npm run test:legacy
node tests/pocket-first-session.cjs
```

Set `CHROME_PATH` if using an existing Chromium binary

## Known risks
- Physical iPhone Safari, speaker mix and low-end device performance have not been tested
- No cloud save; browser storage/origin determines where a town is saved
- Long-term economy beyond the tested early progression needs human playtesting
- This is an additive edition over the legacy engine, not a full engine rewrite

## Merge notes
Draft PR targets `legacy/v16-defense-hardening`; do not merge unrelated Work game branches
Do not replace the old published entry point; new edition has its own URL and save
Regenerate standalone HTML after any source change

## Next recommended task
Human playtest on a phone: gather, build a hut, claim food, hire one worker, choose a policy, build a wall, survive a night
