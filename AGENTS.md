# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `SURVIVAL_CORE_V09.md` ← **最優先の最新仕様**
2. `GUILD_RULES.md`
3. `COLLAB.md`
4. `V08_FEEDBACK_2026-10-04.md`
5. `VISUAL_TARGET_V06.md`
6. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## v0.9のゲーム開始状態

旧GUILD∞はサバイバル育成ゲームへ進化します

- 最初は主人公1人だけ
- 所持は斧1本
- 雇用NPC 0人
- 街は完成していない
- 木 / 石 / 食料を手で集める
- 集めた素材で建築
- 建築後に人を雇って作業を自動化
- 昼夜あり
- 夜にゾンビ襲撃
- バリケード / 防衛 / 修理が必要
- 現在の美しい街は中盤〜終盤の成長先として残す

## モーション最優先ルール

社長が画面揺れで明確に酔いを訴えたため、**screen shakeは禁止**

- ランダムcamera shake禁止
- level up / FEVER / attackでも画面全体を揺らさない
- hit feedbackはsprite recoil / flash / particles / SEで行う

## 操作

- mobileはdrag movement
- plain field tapでauto-walkしない
- visible ABXYなし
- permanent joystickなし
- 近接対象に応じたcontext actionのみ
  - CHOP
  - MINE
  - GATHER
  - ATTACK
  - BUILD
  - REPAIR

## v0.9の優先順位

1. screen shake完全撤去
2. autosave/reload persistence
3. manual gathering: tree / rock / food
4. construction: campfire / workbench / barricade
5. day / night clock
6. zombie first wave
7. axe combat
8. worker hire + assignment automation
9. drops / rarity / gacha / Hourglass compatibility
10. graphics polish / later-town evolution

## 役割分担

### Survival Systems
- save schema
- inventory/resources
- recipes/construction
- workers/roles
- day/night
- zombie waves
- barricade HP
- drops/gacha state

### Input / Combat
- drag movement
- contextual target/action
- axe chop/attack
- collision/hit detection
- no shake

### Graphics / World States
- empty wilderness start
- tree/rock/forage nodes
- build stages
- barricades
- zombies
- day/night palettes
- current town as later-stage visual target

### UX / HUD
- day/time
- contextual action
- bottom log
- build/worker panels
- dusk/night warnings

### Economy / Progression
- recipes/costs
- upkeep/housing
- wave scaling
- rarity/drop/gacha rates
- Hourglass economy
- unlock tree

### Audio
- chop/gather/build/combat/zombie/dawn-night ambience
- no rumble or motion-sickness effects

### QA
- 390x844 first
- reload persistence
- first 10-minute loop
- first night survivability
- no shake
- drag + combat coexistence

作業開始前に担当を宣言し、完了時は Changed / Files / Tests / Known risks / Merge notes を残す

**v0.9の正本は `SURVIVAL_CORE_V09.md`**
