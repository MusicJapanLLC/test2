# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `BUILDJOY_CORE_V10.md` ← **最優先の最新仕様**
2. `GUILD_RULES.md`
3. `COLLAB.md`
4. `SURVIVAL_CORE_V09.md` ← 歴史/互換参照のみ。v1.0と衝突したらv1.0優先
5. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## v1.0のゲーム方向

旧GUILD∞は **construction-first casual survival** へ調整します

主役:
- 建物を増やす
- 街が目に見えて広がる
- 手作業から雇用/自動化へ進む
- 音/エフェクト/テンポで作業そのものが気持ちいい

Survivalは補助:
- 昼夜あり
- 夜に少数ゾンビ
- バリケード/衛兵で軽く守る
- 面倒なsurvival管理を主役にしない

## 最新フィードバック

- 木が少なすぎる → 大幅増量 / respawn
- 石が少なすぎる → 大幅増量 / respawn
- 作業台を必須ゲートにしない
- マス移動廃止
- drag vectorで滑らかなcontinuous movement
- 木/石/食料は近づくと自動採取 + モーション
- routine gather button連打をなくす
- 建設の視覚/音/particle feedbackを強化
- first useful building 30–60 sec
- first worker 2–4 min目標
- screen shake = 0
- autosave必須
- 今の承認済みpixel/HD-2D方向は維持

## 開始状態

- 主人公1人
- 斧1本
- hired workers 0
- 荒野/小さな開拓地
- 近距離に十分なtree/rock/forage
- 建設を始めるまで素材探しで彷徨わせない

## 操作

- mobile: smooth analog drag movement
- world positionはfloat
- spriteはpixel-artのままでよい
- plain field tap auto-walkなし
- visible ABXYなし
- permanent joystickなし
- gatheringはauto
- context actionはattack/repair/special向け

## 優先順位

1. smooth movement
2. abundant resources + auto gather motion
3. build joy / construction effects
4. autosave/reload persistence
5. workers / automation
6. casual day/night + small zombie waves
7. music / SFX / tempo polish
8. drops / rarity / gacha / Hourglass
9. later-town growth toward approved polished town

## 役割分担

### Systems
- resource density / respawn state
- auto gathering state
- building placement/effects hooks
- workers/automation
- casual day/night/zombie pressure
- persistence

### Input / Feel
- analog drag
- acceleration/deceleration
- auto-work interrupt
- combat/repair coexistence

### Graphics
- abundant tree/rock/forage
- gather animations
- construction stages/particles
- early camp -> current polished town progression

### UX
- BUILD always accessible
- bottom ticker/log
- worker controls
- context only for special action
- no routine gather button spam

### Economy
- first building 30–60 sec
- first worker 2–4 min
- lightweight survival costs
- construction pacing

### Audio
- stronger day pulse
- chop/mine/pickup/build/hire/drop
- dusk/night/dawn transitions
- phone-speaker friendly

### QA
- 390x844 first
- smooth drag
- no resource starvation
- auto gather
- build under 60 sec
- no shake
- autosave/reload

作業開始前に担当を宣言し、完了時は Changed / Files / Tests / Known risks / Merge notes を残す

**v1.0の正本は `BUILDJOY_CORE_V10.md`**
