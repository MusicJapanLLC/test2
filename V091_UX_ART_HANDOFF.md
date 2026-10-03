# LEGACY GUILD∞ v0.9.1 — UX / Art Polish lane

## Boundary

- Legacy GUILD∞ only
- Base: `legacy/guild-v09-systems-depth`
- ChatGPT Work new game is untouched
- This lane does not overwrite the v0.9 canonical prototype files
- Review entry: `prototype-v091-polish.html`

## Existing parallel ownership observed

- Systems: `legacy/agent-systems-depth-v09`
- Survival / Night: `legacy/agent-survival-night-v09`
- Save / Persistence: `legacy/agent-save-v09`
- Progression / Drops: `legacy/agent-progression-v09`
- UI / Mobile: `legacy/agent-ui-survival-v09`
- QA: `legacy/agent-qa-survival-v09`

## This lane owns

- motion-sickness camera behavior
- typography rhythm and UI hierarchy
- mobile safe layout
- world readability from empty camp → built settlement
- visual consistency for day/night/combat/context states
- owner-review standalone prototype

## Motion sickness fix

The previous camera continuously followed the player every frame while the renderer snapped authored pixels, which can read as micro-jitter during drag movement.

v0.9.1 uses:

- horizontal camera dead zone: 48px
- vertical camera dead zone: 34px
- camera quantization: 2px
- no camera bob
- no hit shake
- no ambient shake
- player remains free to move inside the camera dead zone

## Survival loop represented

1. Start with player + axe + campfire only
2. Harvest wood / food manually
3. Build workbench
4. Build barricade before night
5. Hire workers after workbench
6. Workers gather during daytime
7. Build lodging / forge / quest hall / guild hall / watch tower
8. Night spawns zombies
9. Barricade takes damage before the core
10. Player attacks zombies with the axe
11. Rare drops feed progression
12. Survive into the next day and expand

## Persistence

- autosave heartbeat every 1.5s
- independent 2s interval save
- immediate saves after harvest / build / upgrade / hire / summon / speed / wave / damage / kill / phase / defeat
- pagehide save
- beforeunload save
- visibility hidden save
- primary + backup localStorage slots

## Progression / app-ready prototype

- crew cap up to 200
- time sand gates x2 / x3 speed; x3 maximum
- zombie drops: star crystal / summon ticket / time sand / gold
- summon rarity: N 65 / R 25 / SR 8 / SSR 2
- 20-pull SR+ pity
- real-money purchase is intentionally not wired in this review build

## UI direction

- top: identity / day-night / core resources / premium-like items / autosave status
- mid: world and next objective only
- bottom: log → contextual action → five persistent management tabs
- build stays visually dominant in center dock
- no TAP TO START
- no D-pad
- no permanent ABXY
- Japanese labels use the same compact digital rhythm as English labels

## Local validation

- `node --check survival-v091-polish.js` PASS
- required survival/autosave/camera/progression hooks checked by grep smoke pass
- owner-review visual renders prepared at 390×844
