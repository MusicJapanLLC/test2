# OLD GUILD∞ v0.8 — SYSTEMS / PROGRESSION HANDOFF

Updated: 2026-10-04 JST

## Boundary
旧GUILD∞のみ
ChatGPT Workの新作には触れない

## Latest owner direction
- グラフィックは現在の方向を維持
- 次はシステム/やり込みを厚くする
- 建物を新規で建てられるようにする
- オートセーブ必須。ブラウザ再読み込みで最初からに戻らない
- 200人まで増員可能
- ドロップ / レア度 / 召喚（ガチャ）
- 倍速はアイテム消費制、最大3倍
- ログは下部常設
- 下部メニューから建築/雇用/依頼/召喚/記録へアクセス
- メニュー画面を毎回開かない

## Implemented in `legacy/guild-v08-bottombar`

### Movement
- smooth drag / analog movement維持
- tap-to-destination無し
- 建物の軽いtapは選択のみ

### Persistent bottom UI
- LOG ticker
- selected building context / upgrade button
- 依頼
- 冒険者
- 建築
- 召喚
- 記録

### Population
- cap 10 → 200
- normal HIRE = gold recruit
- summon/gacha recruit = rarity付き adventurer
- render culling keeps 200 NPC draw cost bounded

### New building construction
Initial catalog:
- 工房 — wood bonus
- 薬草園 — food bonus
- 記録庫 — summon ticket drop bonus
- 星見の祠 — premium-like gem drop bonus

Facilities are built into fixed empty town plots and then become selectable/upgradable

### Drops / inventory
Quest returns may drop:
- 時砂
- 召喚券
- 星晶
- 鉱石
- 薬草
- 古い遺物

### Rarity / summon
- Common 60%
- Rare 28%
- Epic 10%
- Legendary 2%
- Epic pity: 20 pulls
- Legendary pity: 80 pulls
- ticket first, otherwise 50 星晶
- prototype only — no real-money purchase flow yet

### Speed item
- default = x1
- 時砂1個 -> x2 for 60 sec
- another 時砂 -> max x3
- no permanent free 5x/10x

### Autosave — mandatory
Two persistence layers:
1. localStorage
2. IndexedDB mirror

Save triggers:
- every 3 seconds
- all critical actions
- pagehide
- beforeunload
- visibility hidden/shown
- freeze event where supported

Also requests persistent browser storage after first pointer gesture when supported

Offline progress cap remains 4 hours for prototype

## Important persistence note
Claude artifact / temporary preview environments can change origin or storage partition, which can make browser storage look like a reset even when the game calls save correctly
Final app / stable web origin must use a fixed origin; native app later should swap this adapter for Capacitor Preferences / SQLite / platform storage

## Role split from here
- Systems/Progression: this branch
- Graphics: only new building silhouettes/signs; do not redesign approved town
- Audio: drop/rarity/build/summon feedback only
- QA: persistence reload test + 200 NPC performance + gacha pity + speed item timing
- UX: tune bottom-bar height and text only after device playtest

## Acceptance tests
1. Hire to >10 NPCs without cap regression
2. Save at 20 NPCs, reload, remains 20
3. Build one facility, reload, building + level remains
4. Spend timeSand on x2, max x3 only
5. Summon consumes ticket/gem and persists rarity/name
6. Reload does not reset resources/buildings/roster
7. 390x844 bottom bar does not obscure player controls
8. Existing approved graphics do not regress
