# GUILD∞ legacy v0.9 — SURVIVAL DIRECTION

Updated: 2026-10-04 JST

## Hard boundary
- OLD / legacy GUILD∞ only
- ChatGPT Work の別系統新作には一切触れない
- 現在好評の high-density pixel / pseudo-3D / teal-amber visual quality は維持する
- 変更するのは「最初から完成した街」ではなく、そこへ到達するまでのゲーム進行

## One-line fantasy

**斧一本で森に放り出された主人公が、昼に資源を集め、夜のゾンビ襲撃をしのぎ、人を雇い、設備を建て、やがて今のGUILD∞の街へ育てる survival guild builder**

今までの完成した街は削除しない。序盤から見せず、成長の到達点へ移動する。

## Player start — Day 1

初期状態
- 主人公 1人
- 村人 / 冒険者 0人
- 斧 1本
- GOLD 0
- WOOD 0
- FOOD 0
- 小さな焚き火 / 廃材だけ
- 完成建物なし
- 夜までの時間が見える

主人公が最初にできること
1. ドラッグ移動
2. 木を斧で伐採
3. 木材を拾う
4. 斧で敵を攻撃
5. 作業台を建てる

## Core loop

`探索 → 採取 → クラフト → 建設 → 雇用 → 自動化 → 防衛 → 夜を越える → 新しい昼`

### Early progression
1. 木を伐る
2. WOOD 12 → 作業台
3. 作業台で簡易バリケード解放
4. WOOD 10 → バリケード
5. FOOD / WOODを集める
6. 簡易寝床 / 募集所を建てる
7. 初めて1人雇える
8. 雇った住民へ「木こり / 採集 / 建築 / 守備」を割り当てる
9. 夜襲を耐える
10. 朝、生存ボーナス / ドロップ / 新設備

## Day / night

Prototype target
- Day: 150 sec
- Dusk: 20 sec
- Night: 70 sec
- Dawn: 10 sec

本番値はプレイテスト後に調整

昼
- 採取効率100%
- 建築可能
- 雇用 / 役割変更可能
- ゾンビ原則なし

夕方
- 空 / BGM / ランタンが変化
- `夜まで XX秒` 警告
- NPCが拠点へ戻り始める

夜
- 外周からゾンビ襲来
- バリケード → 建物 → 拠点の順に狙う
- 主人公 / 守備NPCが攻撃
- 採取効率低下
- 夜を越えることが短期目標

朝
- 生存ログ
- 修理必要箇所
- ドロップ回収
- 小さな報酬

## Combat

主人公
- 初期武器: 斧
- 斧は `伐採` と `攻撃` の両方
- context actionで最寄り対象へ使用
- stamina連打ゲーにはしない

Prototype combat
- axe damage
- short cooldown
- knockback
- player HP
- barricade HP
- zombie HP / speed / damage

## Resource / crafting

Core resources
- WOOD — 建築 / 修理 / 道具
- FOOD — 雇用 / 維持 / 回復
- SCRAP — 夜の敵ドロップ / 上位設備
- CRYSTAL — rare drop / 将来premium相当のゲーム内希少資源

Start recipes
- 作業台: 12 WOOD
- バリケード: 10 WOOD
- 寝床: 16 WOOD + 4 FOOD
- 募集所: 24 WOOD + 8 FOOD
- 木箱: 8 WOOD

## Population

- 初期 population = 0
- roster cap は将来的に 200
- capとvisible actorsを分離
- 初期は1人雇うこと自体を大きな進歩にする

Roles
- 木こり
- 採集
- 建築
- 守備
- 後から鍛冶 / 料理 / 冒険

## Building progression

建物は最初から存在しない

Stage 0 — 野営地
- 焚き火
- 木 / 草 / 廃材

Stage 1 — 生存拠点
- 作業台
- バリケード
- 寝床

Stage 2 — 小集落
- 募集所
- 倉庫
- 採集小屋

Stage 3 — Guild camp
- 依頼所
- 鍛冶
- 宿屋

Stage 4+ — 現在好評のGUILD∞ town visualへ

Graphics laneは「今の街を壊す」のではなく、同品質でStage 0→4の差分を作る

## Rare drops / gacha / premium-like items

今は課金決済そのものは実装しない
ゲーム内で価値を検証する

Rarity
- COMMON
- UNCOMMON
- RARE
- EPIC
- LEGENDARY

Enemy drops prototype
- 木片 / 布 / SCRAP
- 砂時計
- CRYSTAL
- rare blueprint fragment

Gacha concept
- CRYSTALを使う `RELIC DRAW`
- cosmetic / blueprint / survivor trait中心
- survival必須性能をガチャ限定にしない
- pity / 排出率表示を将来必須にする

## Speed

- normal = x1
- x2 / x3 は `砂時計` を消費する時間制boost
- max x3
- 夜襲中のboost可否はplaytestで決定
- 常時無料fast-forwardにはしない

## Autosave — release blocker

保存は「機能」ではなく保証対象

必須
- 2 sec interval autosave
- critical mutation直後save
  - chop reward
  - craft
  - build
  - hire
  - role assignment
  - rare drop
  - gacha
  - speed item
  - dawn/night transition
- pagehide save
- visibility hidden save
- primary + backup slot
- schema versioning
- migration from v0.8 where possible
- corrupted primary → backup restore
- `SAVE ✓` feedback

Browser prototypeではlocalStorage
App化時はnative persistent storage/cloud syncへ置換可能なSaveAdapter境界を持つ

## Team split — do not overwrite other lanes

### Survival Core / Progression — current ChatGPT lane
Owns
- resource state
- gathering nodes
- crafting recipes
- construction state
- day/night state machine
- survivor count / role model
- persistence contract
- drop/rarity data model

Does NOT own
- final pixel assets
- zombie animation art
- BGM composition
- final combat feel

### Graphics lane
Owns
- Stage 0 wilderness / camp visual
- tree/resource node art
- construction stages
- barricade damage states
- day/night palette
- zombie sprite / silhouettes with Combat lane

### Combat lane
Owns
- axe hitbox / cooldown
- zombie AI
- damage / knockback
- barricade targeting
- death / respawn rules

### NPC / Life lane
Owns
- survivor jobs
- work animation / route
- return-to-base at dusk
- guard behavior

### Economy lane
Owns
- resource costs
- production balance
- hire/maintenance curve
- progression timing

### Audio lane
Owns
- day ambience
- dusk warning
- night raid layer
- dawn relief
- chop / build / hit / barricade / drop SE

### UI / Experience lane
Owns
- bottom bar
- log ticker
- build/craft sheet
- context action
- day/night clock
- save indicator

### QA lane
Owns
- reload persistence
- backup restore
- day→night→day regression
- zombie/barricade state
- iPhone pointer conflicts
- 0 villagers at fresh start

## Acceptance for v0.9 first owner prototype

Fresh start must show
- player only
- 0 villagers
- axe equipped
- trees/resource nodes
- no finished town
- day timer

Must be playable
- drag move
- approach tree + chop
- WOOD increases
- craft workbench
- build barricade
- night arrives
- zombies appear
- axe can damage zombie
- barricade can take damage
- morning returns
- save/reload preserves state

Do not wait for every art lane to finish before owner review. Show small playable prototypes continuously.
