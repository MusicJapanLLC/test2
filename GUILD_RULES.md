# GUILD∞ MASTER RULES

Updated: 2026-10-04 01:19 JST

**このファイルがGUILD∞共同開発の最上位ルールです**

すべてのAI / Codex / Claude / ChatGPT / その他の担当は、作業開始前に以下の最新版をこの順で確認してください

1. `GUILD_RULES.md`
2. `PRODUCT_DIRECTION.md`
3. `FEEDBACK_LOG.md`
4. `COLLAB.md`
5. `ART_DIRECTION.md`
6. 現在のPR / branch / 実装

`PRODUCT_DIRECTION.md` と `FEEDBACK_LOG.md` には社長の最新意図が入ります

古い引継ぎや個別チャットと矛盾した場合は、**最新の社長フィードバックを反映したこのルール群を優先**します

---

## 0. 最新ディレクション

GUILD∞の参照軸は

- ロマンシング サガ系の16bit RPG探索感
- ブレイブリーデフォルト系のジオラマ / 立体感

です

ただし模倣ではなく、要素を抽象化してGUILD∞へ再構成します

**GUILD∞独自の答え = 高密度ピクセル × 疑似ポリゴン2D × ギルド経営 × 永久発展する街**

コピー禁止:
- キャラクター
- マップ
- 固有UI
- ロゴ
- 固有名詞
- 音楽 / SE
- スプライト / テクスチャ
- 文章 / シナリオ

---

## 1. プロダクト哲学

### 量より質

ボリュームは少なくてよい

**少ない範囲を異常に丁寧に作ること**

- 1キャラ
- 1歩
- 1建物
- 1ボタン
- 1SE
- 1つのBGM遷移
- 1回の施設強化

まで品質対象です

### 神は細部に宿る

実装判断では以下を重視

- UI余白
- タップ領域
- 入力遅延
- 1マス移動テンポ
- 歩行フレーム
- 方向転換
- カメラ
- 光
- 影
- 霧
- 火の粉
- BGM fade in / fade out / crossfade
- SE音量
- safe-area
- 復帰演出
- 誤タップ防止

### ユーザーファースト

機能数や技術的派手さより、実際に触って快適かを優先

---

## 2. 今回の最優先

1. **高密度ドット絵**
2. **ポリゴン感のある2Dグラフィック**
3. **操作性 / UI**
4. **Audio / 演出の細部**
5. **継続したくなるゲームループ**

NPC人数・敵数・マップ数・システム数を増やして豪華に見せるのは禁止

**人数ではなく、1キャラ・1建物・1画面の質を上げること**

---

## 3. 操作ルール

### 移動
- 基本4方向
- 1入力で1タイル進む
- 押しっぱなし時は一定テンポで次のマスへ進む
- 加速・慣性で滑らせない
- 移動中もドットアニメーションは付ける
- カメラ追従はグリッド感を消さない
- ワールド座標と描画座標を分離

### UI入力
スマホ:
- 左下: **十字キー**
- 右下: **A / B / X / Y**

基本割当:
- A = 決定 / 調べる / インタラクト / 必要に応じ攻撃
- B = キャンセル / 戻る / 必要に応じダッシュ
- X = メニュー
- Y = 補助操作

PC:
- WASD / 矢印 = 移動
- Space / Enter = A
- Escape / Backspace = B

iPhone safe-areaを必ず考慮

`TAP TO START` のブロッキング画面は復活させない
音声アンロックは最初の通常操作で行う

---

## 4. グラフィック必須条件

### キャラクター
- geometric primitiveだけの仮キャラから脱却
- プレイヤー/NPCは明確な高密度ドット
- まず4方向 idle / walk
- NPCを増やす前に既存NPCの質を上げる
- 小さくても職業・個性がシルエットで分かる

### 建物
- polygon / pseudo-3D感を強化
- 屋根、壁、窓、入口、段差、看板を別面として描く
- 正面だけでなく側面も見せるジオラマ構成
- ギルドホールをランドマーク化
- GUILD UPでは人数より建物/街の見た目変化を優先

### 地形
- タイル感を持たせる
- 草、土、石、道、水を明確化
- 少数のプロップで生活感を作る
- 影、霧、焚き火、光源、粒子は奥行き補助
- エフェクト過多でドットを潰さない

### ピクセル表示
- 内部解像度を固定し整数倍拡大する案を優先検証
- `imageSmoothingEnabled=false`
- ピクセル境界をぼかさない

---

## 5. Audio

方向:
- ケルン系BGM（社長表現をそのまま記録）
- 中世ファンタジー酒場
- 民族音楽的な空気
- 長時間聴いて疲れにくい

Audioもゲームシステムの一部として扱う

必須:
- fade in / fade out
- 必要に応じcrossfade
- menu / field / eventで不自然に途切れない
- SEがBGMを邪魔しない
- 決定 / キャンセル / 移動 / 成功音の触感を整える

---

## 6. ゲームループ

中世ファンタジーの冒険者ギルド
プレイヤーはギルドマスター

基本:

1. 冒険者を雇う
2. 依頼を受ける
3. 冒険へ送り出す
4. 報酬 / 素材
5. 施設強化
6. 新設備 / 職業 / エリア / 機能
7. ギルドが快適 / 豪華になる
8. 次の小目標へ

短時間でも進む
放置復帰でも成長が分かる

序盤は軽い不便さを残す:
- 人手不足
- 待ち時間
- 施設不足
- 資源不足

発展するほど快適になる

課金機能は現プロトタイプでは不要

---

## 7. 継続性 / Retention

目標:

**少しだけ遊ぶつもりが、自然にもう1回続けたくなる**

参考体験:
- Splatoon
- Clash Royale
- Super Smash Bros.
- short-form videoの「短い満足から次の期待へ繋がるテンポ」

GUILD∞で優先して研究するもの:
- immediate feedback
- flow
- mastery
- competence
- curiosity
- short / medium / long goals
- progress visibility
- return rewards
- collection / discovery
- variable content
- session rhythm
- 「あと1回」「あと1マス」「あと1依頼」

課金圧・偽の緊急性・過剰な損失回避などのダークパターンで継続させるのではなく、**操作の気持ちよさ・成長・発見・テンポ・音・フィードバック**で高い継続性を作る

---

## 8. Research必須手順

### STEP 1 計画
ゲームの仮説を整理

### STEP 2 調査
**実際のゲームとユーザー口コミ / レビューを合計300件以上分析**

対象候補:
- Romancing SaGa 系
- Bravely Default 系
- Splatoon 系
- Clash Royale
- Super Smash Bros. 系
- guild management / idle / town management
- smartphone RPG
- short-form content UXの公開研究

最低分類:
- 継続理由
- 離脱理由
- 操作
- UI
- テンポ
- 成長実感
- 報酬
- BGM / SE
- スマホ体験
- 復帰動機

300件を数えるだけで終わらず、共通パターン→GUILD∞実装仮説へ変換

### STEP 3 分析
心理 / UX / game designから適用可能性を検証

### STEP 4 実装
ボリュームより1ループを磨く

### STEP 5 Debug / QA
- バグ
- iPhone
- 誤タップ
- fps
- Audio
- BGM遷移
- save
- offline return
- grid movement
- UI崩れ
- 長時間時の疲労

### STEP 6 社長レビュー
統合版を一旦社長へ提示
社長の実機フィードバック後に次サイクルへ

---

## 9. 人数ルール

**人をむやみに増やさない**

現フェーズは少人数固定を基本

目標は「10人しかいないのに世界が濃い」状態

---

## 10. 現在の担当分け

### 操作班
Branch: `agent/snes-controls-pixel`
- SFC式1マス移動
- 十字キー
- ABXY入力接続
- 入力テンポ

### グラフィック班
Branch: `agent/hd2d-art`
- 高密度ドットキャラ
- ポリゴン建物
- 地形 / 光 / 影 / 霧
- HD-2D奥行き

### システム班
Branch: `agent/gameplay-economy`
- WORLD_GRID_SIZE
- 座標 / collision
- state
- 現行経済
- offline progression準備

### UI / Audio班
Branch: `agent/ui-audio`
- 十字キー / ABXY
- HUD / menu
- safe-area
- BGM / SE / fade

### Research / 心理・UX班
Branch: `agent/research-reference`
- 300+レビュー分析
- retention pattern抽出
- 実装仮説
- 参考ゲーム / UX研究

### QA / 捜査班
Branch: `game/guild-integration-qa`
- 最新実装確認
- iPhone
- pixel blur
- regression
- CI
- 統合事故防止

---

## 11. 統合順

1. 操作基盤
2. 高密度ドット / ポリゴングラフィック
3. UI / Audio
4. システム整合
5. Research知見を小さく反映
6. iPhone QA
7. 社長レビュー
8. その後に機能拡張

---

## 12. 今はやらない

- NPC大量追加
- ボス大量追加
- ガチャ先行実装
- 複雑な課金
- 大規模シナリオ
- ステージ量産
- 戦闘システム肥大化
- UI仮置きのまま機能を増築
- Audioを最後に雑に追加

---

## 13. 完了時handoff

必ず以下を残す

- Role
- Changed
- Files / Branch
- Tests
- Known risks
- Merge notes
- Next recommended task

---

## 14. 作業開始チェック

- [ ] `GUILD_RULES.md` 最新版を読んだ
- [ ] `PRODUCT_DIRECTION.md` 最新版を読んだ
- [ ] `FEEDBACK_LOG.md` 最新エントリを読んだ
- [ ] `COLLAB.md` 最新版を読んだ
- [ ] `ART_DIRECTION.md` 最新版を読んだ
- [ ] 自分の担当を宣言した
- [ ] 統合先の最新commitを確認した
- [ ] 他班の担当を上書きしない
- [ ] NPCをむやみに増やしていない
- [ ] 固有表現をコピーしていない
- [ ] iPhone操作を壊していない
- [ ] 完了時にPR / 差分 / handoffを共有する

---

## 15. 完成判断

**この小さなプロトタイプを、理由なくもう一回起動したくなるか？**

YESになるまで、機能数よりディテールを磨く
