# UI / Dock v0.8 handoff

## Changed
- full-screen menu dependency removed from the v0.8 shell
- persistent bottom dock with 育成 / 冒険者 / 施設 / ログ
- central speed-item button
- persistent GUILD UP / HIRE / FEVER shortcuts
- bottom log ticker
- building contextual upgrade strip
- single digital/SFC-like font stack
- safe-area aware phone layout

## Files
- prototype-v08.html
- ui-v08.css

## Tests
- markup keeps canvas visible behind all UI
- no permanent D-pad / ABXY
- no TAP TO START

## Known risks
- exact iPhone Safari bottom safe-area feel still needs device review

## Merge notes
- requires game-v08.js from Systems lane
- does not replace graphics.js or audio-v07.js
