# GUILD∞ v1.3 CLEAN CORE — owner feedback repair

Owner feedback after v1.2: the game finally felt like a game, but UI was cluttered, borrowed art/music diluted GUILD∞ identity, and core systems were unreliable or misleading

## Confirmed root causes in v1.2

1. Repeat building bug
   - `build()` used a generic `state.buildings.some(b => b.type === type)` rejection for every building
   - result: lantern, hut, lumber yard and quarry were all accidentally one-per-type
   - only palisade should be unique

2. Hut copy / implementation mismatch
   - UI said `最初の住人を迎える`
   - hut build path did not actually add a resident

3. Workers were not real workers
   - worker `x/y` never changed after hire
   - `passive()` only added resource numbers every 0.9s
   - visually they stood still while invisible math happened

4. UI hierarchy failure
   - title band / resource band / NEXT / ticker / sound / speed / context / four-button dock / asset-state were all permanent
   - construction was supposed to be the main pleasure but BUILD had no visual priority

5. Identity drift
   - increasing third-party foreground assets and full borrowed tracks made the prototype feel like a different game instead of a stronger GUILD∞

## v1.3 repair contract

- start with enough materials to build the first hut immediately
- hut completion automatically spawns one resident
- resident AI is visible: `seek target -> walk -> work animation -> resource gain -> retarget`
- resident world coordinates must change while working
- hut / lumber / quarry / lantern are repeatable until placement slots are full
- palisade alone is one-time unique
- every lantern has its own night light radius
- lumber/quarry buildings can create or attract corresponding workers when housing capacity exists
- permanent UI reduced to compact resource/time HUD + BUILD + CREW
- save remains automatic and leaves permanent dock
- bag/inventory is not permanent navigation until it has meaningful gameplay
- no screen shake
- visual/audio changes must strengthen GUILD∞ identity, not just add more external assets

## Owner-review prototype QA already completed locally

- JavaScript syntax: PASS
- 390x844 Chromium render: PASS
- page errors: 0
- first hut construction: PASS
- first worker auto-spawn: PASS
- worker moved from initial coordinates and reached `work` state: PASS
- two consecutive lantern constructions: PASS
- resource value changed from worker activity: PASS
- original embedded GUILD∞ theme playback: PASS

## Team boundary

Systems/Input/NPC lanes should port the repair contract above before further visual expansion
Graphics lane should avoid another wholesale art-direction swap
Audio lane should stop importing a full third-party song as the identity layer and use a GUILD∞-specific original theme
ChatGPT Work's separate new game remains untouched
