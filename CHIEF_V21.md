# 村長、正気ですか？ v2.1

Mobile village gathering/defense comedy, expanded from Pocket v2.0

Play `prototype-chief-standalone.html` as a single self-contained page, or serve `prototype-chief.html` with its sibling scripts and font

## Changes

- Economy: slower civilian work; bounded additive yield modifiers; immediate warehouse availability; larger initial resource caps; upgrade costs cannot exceed storage; no speed controls
- Iron: build forge for wood70/stone50; each 12-second job consumes wood12/stone18 and creates iron1; paid job survives reload; optional automatic production starts only while wood and stone each remain60 or more
- Surplus: repeating delivery orders yield renown;20 development chapters spend resources/iron/renown for storage and health;12-level cosmetic chief statue provides an additional sink
- Progression: warehouse20, research25, civilian20, housing12, forge12; personality and level persist
- Citizens: six named persistent traits change yields, movement, melee and ranged damage; work earns XP, training costs resources, roles can be reassigned
- Presentation: new Japanese identity; pixel textures, bundled DotGothic16 subset, wood ledger interface, individual citizen portraits, iron HUD
- Sound: six original procedural scenes with four phrase variations, short synthesized character voices; contextual transitions, bounded voices, gesture unlock; no audio toggle
- Existing four gates, drag movement, stop-to-gather,16 watchtowers, wall repairs, autosave, menu/background pause, two-step reset retained

## Save behavior

New namespace `guild-chief-v21`, one-time copy import from `guild-pocket-v2` on the same browser origin
The source save is never overwritten; old hourglasses convert to renown once
A deliberate reset does not import the old town again
Import cannot cross browser origins, devices, or storage profiles

## Verification

- `CHROME_PATH=/tmp/chromium node tests/chief.cjs`:49 passing assertions
- `CHROME_PATH=/tmp/chromium node tests/pocket.cjs`:29 passing assertions
- `CHROME_PATH=/tmp/chromium node node_modules/@playwright/test/cli.js test --config playwright.pocket.config.cjs`:5 passing suites
- `CHROME_PATH=/tmp/chromium node tests/chief-first-session.cjs`:real pointer gather/build/hire,27.2sec, no injected resources
- Viewports360×640,390×844,844×390; screenshots in `qa/chief`
- Independent final code review; all three reported issues reproduced and fixed

Serve repository at http://127.0.0.1:4173 before running browser tests
Rebuild with `node scripts/build-chief.cjs`

No physical iOS test or multi-hour retention/balance measurement has been performed
Suno was signed out; no Suno music was generated or incorporated
All music/voices are code-generated original audio; font attribution/license in `assets/chief/OFL-DotGothic16.txt` and embedded in standalone
Town screenshots use deliberately staged state; first-session test starts genuinely fresh
