# GUILD∞ AI ENTRYPOINT

このリポジトリでGUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で、この順に読んでください**

1. `GUILD_RULES.md` — 開発上の最上位ルール
2. `PRODUCT_DIRECTION.md` — 社長の最新プロダクト方針
3. `FEEDBACK_LOG.md` — 逐次フィードバックの最新ログ
4. `COLLAB.md` — 担当境界と共同作業ルール
5. `ART_DIRECTION.md` — 見た目・演出・UI
6. 現在のPR / branch / 実装

**個別チャットだけ読んで作業を開始しないこと**

社長から新しい重要フィードバックが出た場合、Coordinatorは `FEEDBACK_LOG.md` に共有し、必要なら `PRODUCT_DIRECTION.md` / `GUILD_RULES.md` を更新します

## 最優先

1. ドット絵 / 高密度ピクセル
2. ポリゴン感のある2Dグラフィック
3. 操作性 / UI
4. ディテール / 快適性
5. 高いリプレイ性・継続性

機能数より完成度を優先してください

## 現在の方向

- ロマンシング サガ系の16bit探索感を高レベル参考にする
- ブレイブリーデフォルト系のジオラマ / 奥行きを高レベル参考にする
- 既存作品の固有アセット、UI、キャラ、音楽、文章、マップはコピーしない
- GUILD∞独自の `高密度ピクセル × 疑似ポリゴン2D × ギルド経営 × 永久発展する街` にする
- ボリュームは少なくてよい。細部まで丁寧に作る
- BGM / SE / fade / UI transitionもゲーム品質として扱う

## 操作の必須変更

- ヌルヌルしたアナログ移動を最終形にしない
- 4方向の1マス移動を基本にする
- 左下に十字キー
- 右下にA/B/X/Y
- 人をむやみに増やさない
- TAP TO STARTのブロッキング画面を復活させない

## 並行作業

自分の担当以外を勝手に作り直さないでください

担当候補
- 操作係
- グラフィック係
- UI / Audio係
- システム係
- Research / 心理・UX分析係
- QA / 捜査係

Research担当は `PRODUCT_DIRECTION.md` の要件に従い、実ゲームとユーザーレビュー **300件以上** の分析を実装提案へ変換してください

作業開始前に担当を宣言し、完了時は `GUILD_RULES.md` のhandoff形式で報告してください

**ルールの正本は `GUILD_RULES.md`、最新のオーナー意図は `PRODUCT_DIRECTION.md` / `FEEDBACK_LOG.md` です**
