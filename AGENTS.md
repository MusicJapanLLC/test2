# GUILD∞ LEGACY v0.5 — AI ENTRYPOINT

このブランチ `legacy/guild-v05-continuation` は、これまで作ってきた旧作 GUILD∞ v0.5 を改善し続けるための専用ラインです

## 最重要

- ChatGPT Work が別途作り始めた新作ゲームには一切触れない
- このブランチでは旧作 v0.5 だけを改善する
- 新作側のファイル・ブランチ・仕様を流用や上書きの対象にしない
- 作業開始前に自分の担当を明言し、他担当の領域を勝手に作り直さない

## 最新操作方針

- 十字キーは廃止
- 主移動は画面タップ / ドラッグで目的地指定
- 建物タップで調べる
- A / B / X / Y は補助操作として残す
- TAP TO START のブロッキング画面は復活させない

## 作品方向

- ロマンシング サガ系16bit RPGの旅情・小さなキャラの存在感を高レベル参照
- ブレイブリーデフォルト系のジオラマ・奥行き・光を高レベル参照
- 固有アセット、固有UI、音楽、キャラ、マップ、文章はコピーしない
- GUILD∞独自の `ドットRPG × ジオラマ疑似3D × 永久発展するギルド都市` を続ける

## 現在の役割分担

### ChatGPT / Rendering & UI lane
担当宣言: **旧v0.5の描画復旧 + UI質感改善**
- Canvas描画 / iPhone表示
- カメラ / レイヤー順
- タップ・ドラッグ時の視覚フィードバック
- HUD / action buttons / panelの質感
- 本体が必ず見える状態の維持

### Audio lane
- BGM / SE
- Safari AudioContext
- フェード / 音量 / 状態切替

### Economy / Systems lane
- Gold / Wood / Food
- Guild Level
- Hire / Fever
- Save / Load

### NPC / World lane
- NPC経路探索
- 自動クエスト
- 建物 / 地形 collision
- 人数をむやみに増やさず生活感を上げる

### QA lane
- iPhone実機
- タップ / ドラッグ
- FPS / Canvas
- 保存復帰
- 他担当差分の競合検査

## 作業ルール

1. 自分の担当を宣言
2. 最新v0.5を読む
3. 自分の担当だけを変更
4. プロトタイプを小刻みに共有
5. QA後に統合

新作へ触らないことが最優先です
