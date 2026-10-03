# OLD GUILD∞ v0.5 — PARALLEL WORK RULES

Updated: 2026-10-04 JST

## 最重要境界

この作業レーンは **旧GUILD∞（guild_infinity_v05 / 灯の街）だけ** を改善するためのものです

ChatGPT Work が現在新規に制作している別ゲームには **一切触れないこと**
新作のファイル、ブランチ、設計、アセット、コードを編集・統合・参照元化しないこと

旧作の再開点は `guild_infinity_v05.html` 相当の実装
最新操作方針は **画面タップ / ドラッグで目的地指定** です
十字キーを旧作の主操作として復活させないこと

## 作業開始時の宣言

各担当は必ず最初に GitHub 上で

> 私は【担当名】を担当します。ほかの領域は触りません

と宣言してから着手すること

担当が被った場合は、先に宣言した担当を優先し、後続は別タスクへ移動すること

## 現在の分担

### UI / UX担当 — ChatGPT 本チャット
- HUD
- タップ/ドラッグ移動の視覚フィードバック
- 管理ボタン
- A/B/X/Y補助UI
- ギルド台帳
- iPhone safe-area
- チープな質感の解消

### Graphics担当
- キャラのドット品質
- 建物
- 地形
- 光・影・霧
- 奥行き

### Systems担当
- route finding
- collision
- save/load
- economy
- NPC state

### Audio担当
- BGM
- SE
- fade
- ambient sound

### QA / Integration担当
- iPhone
- JS runtime
- regression
- 新作との混線防止
- TAP TO START 再混入防止

## 統合ルール
- 人口をむやみに増やさない
- 新機能を増やすより既存体験の品質を上げる
- UI担当は経済/経路探索を書き換えない
- Graphics担当は入力APIを書き換えない
- Systems担当は見た目を勝手に刷新しない
- 新作へ cherry-pick / merge / copy しない

## プロトタイプ
各担当はまとまった変更ごとに、ユーザーがすぐ開けるプロトタイプを出すこと
完成まで隠さず、途中経過を見せる
