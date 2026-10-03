# OLD GUILD∞ v0.6.1 — QA checklist

QA lane only

## Movement focus
- iPhone 390x844 first
- touch anywhere + drag begins movement reliably
- no ground tap-to-route
- direct building tap remains usable
- release stops without long glide
- diagonal drag does not feel locked to one axis
- no accidental MENU/management tap leaking into field movement
- no stuck pointer after app switch / notification / Safari gesture
- no repeated vibration spam

## Regression
- ABXY remains hidden
- MENU still opens/closes
- graphics remain identical or better
- no TAP TO START
- save/load works
- BGM unlock still works from normal user gesture

When Systems continuous movement lands, rerun the same checklist and add collision corner tests
