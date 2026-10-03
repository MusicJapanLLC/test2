# GUILD∞ Integration / QA lane

このブランチは、見た目や戦闘を横取りせず、共同開発の統合事故を減らすための担当ブランチです

## 担当

### Visual lane
- 高品質ピクセルスプライト
- 建物・地形・ライティング
- 霧・影・天候・昼夜
- 既存の入力ロジックを不用意に書き換えない

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

## 現在の正本

- repository: `MusicJapanLLC/test2`
- base collaboration branch: `game/guild-infinite-hd2d-v03`
- playable entry: `index.html`
- collaboration PR: `#1`

## 統合順

1. まず操作・描画の安定を固定
2. Visual laneを統合
3. Systems laneのSave / Collision / Interactionを統合
4. Combat laneを統合
5. NPC jobs / productionを統合
6. 最後に街の大規模成長・演出を増やす

## 最低限壊してはいけない操作

- 開いた瞬間からゲームループが動く
- 画面ドラッグで主人公移動
- `♪` でBGM開始 / mute
- `×1` から `×2 / ×5 / ×10`
- HIRE
- GUILD UP
- FEVER

## CI

`.github/workflows/guild-ci.yml` で以下を自動検査します

- 必須UI / Canvasの存在
- pointer inputの存在
- `TAP TO START` の再混入防止
- inline JavaScriptの `node --check`
- HTTP配信した `index.html` の最低限の応答確認

## GitHub Pagesについて

現在の `Deploy Guild Infinite` は `actions/configure-pages@v5` で失敗しています
PR #1にも記載されている通り、GitHub AppからPagesの自動有効化ができない状態です
この失敗はゲーム本体のJSとは分離して扱い、公開設定とゲーム実装を混同しません

## 次のIntegration担当タスク

1. `window.GUILD_API` を追加して担当間の接続口を固定
2. Save / LoadをAPI越しに実装
3. Building collisionをAPI越しに実装
4. Combat laneを直接内部変数へ依存させず統合
5. 30 / 60 FPSとNPC 10 / 50 / 100人で性能確認
