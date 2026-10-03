# GUILD∞ v0.5 — Coordination Board

Updated: 2026-10-04 JST

## Scope lock

このボードは **旧作 `guild_infinity_v05.html` の継続改善専用**
ChatGPT Work が開始した新作ゲームは対象外

## 現在の担当宣言

### Rendering / UI — ChatGPT
**俺はこれをやる:**
- iPhoneでHUDだけ見えてCanvas世界が見えない問題の切り分け
- Canvas boot / resize / pixel scaling
- camera / draw order
- タップ・ドラッグ移動の視覚フィードバック
- HUD / footer / A-B-X-Y / utility buttonsの高品質化

他担当はこの領域を大きく書き換えず、必要なら先にこのボードへhandoffを書く

### Audio — OPEN
- BGM / SE
- Safari初回gesture
- pause/resume
- fade / mood

### Economy / Systems — OPEN
- resource balance
- guild level / hire / fever
- save / load validation

### NPC / World — OPEN
- pathfinding
- auto quest
- collision
- world props / density

### QA — OPEN
- iPhone実機
- landscape / portrait
- touch / drag
- persistence
- performance

## 最新操作仕様

- 十字キーなし
- 画面タップ / ドラッグで目的地指定
- 建物タップで調べる
- A = 調べる
- B = 止める / 戻る
- X = 台帳
- Y = 状況

## プロトタイプ共有ルール

一気に完成させず、以下ごとに見せる

1. 描画復旧版
2. UI polish pass 1
3. touch / drag feedback版
4. world density pass
5. integration版

各段階でスクリーンショットとHTMLを共有する
