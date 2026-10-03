# GUILD∞ legacy v0.5 — collaboration contract

Updated: 2026-10-04 JST

## 絶対境界

**このbranchは旧作GUILD∞ v0.5の改善専用です**

ChatGPT Workが別系統で制作中の新作には、コード・素材・音源・UI・branch・PRを含めて一切触れません
新作から旧作へコピーもしません
旧作から新作へ変更を持ち込みません

旧作の再開地点は `handoff/work-touch-v05` のWorkタッチ版です
共同作業は `legacy/guild-v05-detail-polish` を基準に分担します

## 本人の最新ディレクション

現行の街グラフィックは**理想に近いので維持**

量より完成度
**「ボリュームは少なくてもいい。細部まで丁寧に作り込む」**

今の最優先

1. 触って気持ちいいスマホ操作
2. UIフォント / 数字 / 日本語ラベルの統一
3. 文字の雑さをなくし、SFCを現代的に再解釈した2Dデジタル感へ揃える
4. 常設A/B/X/Yを外し、世界を見る面積を増やす
5. ゲーム性に合う小さなMENUを作る
6. グラフィック細部を維持・向上
7. BGM / SE / animationの細部

**神は細部に宿る**を品質基準にします

詳細UI指示は `UI_DIRECTION_V06.md`

## 最新操作方針

十字キーは廃止済み
**A/B/X/Yの常設表示も廃止方向**

スマホ
- フィールドをタップ → 目的地へ歩く
- フィールドをドラッグ → 目的地を更新
- 建物をタップ → 入り口まで歩いて調べる
- 必要な操作だけ文脈UIで出す
- 小さなMENU入口を用意する
- safe-area対応
- 誤タップ / スクロール / ズーム / 二重入力を防ぐ

PC
- WASD / 矢印も維持
- 内部action APIは互換のため残してよい

移動そのものは4方向 / 1タイル単位のRPGらしい手触りを残します

## Typography

全UIを「同じゲーム」に見せる

- HUD / menu / button / modal / floating labelで同じフォント体系
- 日本語 / 英字 / 数字のリズムを揃える
- randomなfont-weight / browser既定font / generic pill UIを増やさない
- 数字はtabularで揃える
- 文字サイズ / 字間 / 行間 / weightを共通token化
- 絵文字を主要UIアイコンとして使わない
- 読めることを優先しつつ、SFC/16bitデジタル感を出す

## MENU

現段階では既存情報を整理するための小型pixel-RPG menu

候補
- 街 / TOWN
- 台帳 / LEDGER
- 冒険者 / ROSTER
- 設定 / SYSTEM

新しい巨大システムを発明しない
まず既存情報を美しく整理する

## 参照軸

Romancing SaGa系の「小さなドットでも役割が読める旅情」と、Bravely Default系の「ジオラマ/奥行き/光」を高レベル参照にします

既存作品のキャラクター、固有UI、マップ、音楽、SE、スプライト、文章、ロゴをコピーしません
毎回GUILD∞独自の答えへ変換します

## 今回の役割分担

### Coordinator / Experience lane — ChatGPT
- v0.5描画 / Canvas復旧と実機表示
- UI/UX最終体験設計
- tap / drag操作感
- typography system
- menu architecture
- 情報階層 / 質感 / transition / feedback
- 各lane統合順
- 統合後QA

**Coordinator以外がUI全体を全面置換しない**
必要な差分はPR/handoffで渡す

### Input / Feel lane
- tap / drag movement
- retarget / stop feel
- camera timing
- building tap reliability

### UI / Typography lane
- font rhythm
- HUD copy cleanup
- hide visible ABXY
- MENU entry
- menu panel polish

### Graphics lane
- 高密度ピクセルキャラ
- 2Dなのに立体を感じるポリゴン建築
- 地形 / 影 / 窓灯り / 焚き火 / 霧
- 少数キャラの歩行 / 作業motion品質
- current art baselineを壊さない

### Audio lane
- ケルン / 中世酒場 / 民族音楽を思わせるGUILD∞オリジナルBGM
- day / night / fever差分
- fade-in / fade-out / crossfade
- tap / 決定 / 収益 / 施設成長SE
- Safari WebAudio gesture制約対応

### Economy / Growth lane
- 冒険者雇用 → 依頼 → 帰還 → 資源 → 施設成長
- 序盤の人手 / 設備 / 資源不足
- 発展するほど手間が減る快適化
- 放置帰還時に「街が進んだ」と感じる報告
- 課金/FOMO前提にはしない

### NPC / Life lane
- 受付 / 冒険者 / 職人 / 客の少人数自律行動
- 待機 / 仕事 / 会話 / 帰還の小芝居
- 人数を増やすより1人の存在感を上げる

### QA lane
- iPhone Safari
- portrait / landscape / safe-area
- Canvas表示
- localStorage save/load
- input race / double tap / drag
- MENUとのtouch conflict
- typography clipping / overflow
- 30/60fps負荷
- background / foreground復帰

## Engagementのルール

目標は「気づいたら長く遊んでいた」であって、プレイヤーを罰して拘束することではありません

取り入れる
- 開いて数秒で意味のある変化が見える
- 1操作ごとに映像 / 音 / 数字が自然に返る
- 5秒 / 30秒 / 3分 / 15分の複数の小目標
- 次にやりたいことが1つだけ自然に見える
- 観察しているだけでもNPCや街に小さな変化が起こる
- 工夫すると効率が上がる、理解すると上手くなる

避ける
- ログインしないと損をする脅し
- streak喪失
- 負けを取り返すための無限追跡
- 課金で焦らせるFOMO
- 意味のない通知 / checklist
- 数字だけ増えて見た目が何も変わらない成長

## 作業開始ルール

全員、作業前にこの順で読む

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. `UI_DIRECTION_V06.md`
4. `V05_PRODUCT_DIRECTION.md`
5. 自分の担当Issue / PR / file

担当を宣言してから実装
他担当を勝手に全面置換しない
mainへ直書きしない

## handoff形式

完了時に必ず残す
- Role
- Changed
- Files / Branch
- Tests
- Known risks
- Merge notes
- Next recommended task
