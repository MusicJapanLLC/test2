# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. `VISUAL_TARGET_V06.md`
4. `UI_DIRECTION_V06.md`
5. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## 現在の承認済みビジュアル基準

`legacy/guild-v05-detail-polish` の現行画面を基準にする

最新コンセプト画像は「完成イメージの方向性資料」として扱い、**当面は左側の街プレイ画面の品質だけを狙う**

- 高密度ドットキャラ
- タイル世界
- polygon / pseudo-3D建築
- 灯り・影・霧
- teal / amber系の落ち着いた色
- Guild Hallが一目で主役と分かる画面
- 少人数NPCでも街が濃く見える環境detail

右側に描かれた依頼一覧 / 冒険者装備 / 施設詳細 / ワールドマップ等は将来像であり、v0.6で先行実装しない

この見た目を壊して古いWebアプリ風へ戻さない

## 最新優先順位

1. 操作感
2. UI / Typography
3. ドット絵・建物detail
4. QA
5. その後に機能拡張

## 最新UI方針

- スマホはフィールドをタップ / ドラッグして移動
- 十字キーは表示しない
- **A/B/X/Yの常設表示も廃止**
- 既存の内部action APIは互換性のため残してよい
- 代わりに小さな `MENU` 入口を用意する
- 建物は直接タップして調べる
- UIフォント / 数字 / 日本語ラベルのリズムを統一する
- SFC/16bit系のデジタル感を出すが、既存ゲームの固有UIはコピーしない
- genericな丸ボタン、バラバラな文字サイズ、Webアプリ風のpillを増やさない
- 人をむやみに増やさない
- TAP TO STARTのブロッキング画面を復活させない

## 役割分担

### Input / Feel
- tap / drag movement
- retarget / stop feel
- camera timing
- building tap reliability

### UI / Typography
- font rhythm
- HUD copy
- MENU
- controller表示整理
- menu panel

### Graphics
- current art baselineを維持しdetail向上
- character / building / terrain / light

### Systems
- save / menu state / compatibility hooks
- UIやgraphicsを勝手に作り直さない

### QA / Investigation
- iPhone safe-area
- touch conflict
- text clipping
- pixel blur
- controller再出現防止

作業開始前に担当を宣言し、完了時は Changed / Files / Tests / Known risks / Merge notes を必ず残す

**詳細なv0.6指示は `VISUAL_TARGET_V06.md` と `UI_DIRECTION_V06.md`**
