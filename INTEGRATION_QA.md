# GUILD∞ Integration / QA lane

このブランチは、見た目や戦闘を横取りせず、共同開発の統合事故を減らすための担当ブランチです

## 作業前の必須参照

最新ルールの正本は collaboration branch `game/guild-infinite-hd2d-v03` の以下です

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. `ART_DIRECTION.md`

このQAブランチ内の古い引継ぎより、上記最新版を優先します

現在の参照軸は **Romancing SaGa 系の16bit RPG感 × Bravely Default 系のジオラマ/立体感**
直接コピーではなく、移動テンポ・旅情・ドットの読みやすさ・立体背景・光影・UI階層を抽象化してGUILD∞独自表現へ変換します

今の最優先は **ドット絵 → グラフィック → 操作性/UI**
NPCをむやみに増やして豪華さを作らないこと

## 担当

### Visual lane
- 高品質ピクセルスプライト
- 建物・地形・ライティング
- 霧・影・天候・昼夜
- 既存の入力ロジックを不用意に書き換えない

### Input / UI lane
- 4方向・1入力1マス
- 十字キー
- ABXY
- 長押しの一定テンポrepeat
- iPhone safe-area
- 慣性で滑らせない

### Combat lane
- Attack / Dash
- Enemy AI / Boss
- HP / XP / Drops
- 既存の経済・街成長を壊さない

### Systems lane
- Save / Load
- Building collision
- Building interaction
- Quest state
- NPC jobs / production

### Integration / QA lane
- iPhone操作が死んでいないか
- Canvasが必ず描画されるか
- TAP TO START等のブロッキングUIが復活していないか
- JS構文エラーがないか
- mainへ直接変更されていないか
- 各担当の変更を順番に統合する
- 既存の自動経済 / HIRE / GUILD UP / FEVERを落としていないか
- 同じ機能の二重実装がないか

## 現在の正本

- repository: `MusicJapanLLC/test2`
- base collaboration branch: `game/guild-infinite-hd2d-v03`
- playable entry: `index.html`
- collaboration PR: `#1`

## 統合順

1. 4方向・1マス移動 / D-pad / ABXYの入力基盤
2. 高密度ドット / ポリゴン建物 / HD-2D visual
3. UI整合
4. Systems整合 / collision / save
5. iPhone QA
6. その後にcombat / world機能を拡張

## 最低限壊してはいけないもの

- 開いた瞬間からゲームループが動く
- ブロッキング式 `TAP TO START` を復活させない
- NPC自動経済が生きている
- `♪` でBGM開始 / mute
- `×1` から `×2 / ×5 / ×10`
- HIRE
- GUILD UP
- FEVER
- pixel smoothing OFF
- guild level / hero levelを混同しない

## 2026-10-04 — SFC input prototype audit

対象:
- branch `agent/snes-controls-pixel`
- file `prototype-sfc.html`

### Good / merge-worthy
- blocking start screenなし
- iPhone safe-areaを意識した固定D-pad
- A/B/X/Yが独立した物理ボタン風UI
- 24px grid
- `1 input = 1 tile`
- 4方向
- 110msの短いstep tweenでマス感を維持
- 長押し260ms後、135ms間隔repeat
- 慣性移動なし
- keyboard fallbackあり
- NPCは6人固定で、人数水増しをしていない
- 建物側面 / roof plane / shadowがあり、ジオラマ方向に進んでいる
- image smoothing OFF

### Regression / merge blocker
**このprototypeをそのままcanonicalへ置き換えないこと**

理由:
1. 旧canonicalにある `HIRE` UI / hire処理がprototype側に存在しない
2. `FEVER` UI / fever処理がprototype側に存在しない
3. 既存の冒険者が建物を往復して報酬を生むauto quest cycleが、固定NPCのランダム1マス歩行へ簡略化されている
4. GUILD UPはA interactionへ統合されているため機能自体は残るが、既存のUI/進行との統合確認が必要
5. combat laneのA/B意味と衝突しないhook設計がまだ必要

### Merge recommendation
`prototype-sfc.html` から以下だけを先に移植する

- D-pad DOM / CSS
- ABXY DOM / CSS
- grid player state (`gx/gy/from/to/moving/t`)
- `move(dir)` の1タイルstep
- hold repeat
- keyboard fallback
- button press feedback

既存canonical側から維持する

- NPC autonomous quest economy
- HIRE
- GUILD UP
- FEVER
- BGM / speed
- existing resource progression

**入力システムを置き換えるのであって、ゲームループ全体をprototypeへ置き換えない**

## CI

CIで最低限以下を検査する

- 必須UI / Canvasの存在
- blocking `TAP TO START` 再混入防止
- inline JavaScriptの syntax check
- D-pad / ABXYの存在
- HIRE / GUILD UP / FEVERの維持
- smoothing OFF
- HTTP配信した `index.html` の最低限の応答確認

## GitHub Pagesについて

Pages設定失敗はゲーム本体のJSとは分離して扱い、公開設定とゲーム実装を混同しません

## Next recommended task

**Integration担当が `agent/snes-controls-pixel/prototype-sfc.html` の入力/UI部分だけをcanonicalへ移植し、HIRE / FEVER / NPC auto economyを残した統合版を作る**
