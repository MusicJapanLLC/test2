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

量より完成度

**「ボリュームは少なくてもいい。細部まで丁寧に作り込む」**

優先順位

1. 触って気持ちいいスマホ操作
2. 高密度2Dピクセル + ポリゴン/ジオラマ的な立体感
3. UIの質感・余白・階層・アニメーション
4. 心地よいケルン/中世酒場/民族音楽系BGMと自然なフェード
5. NPCが少人数でも生きて見える小芝居
6. 小さな成長が街の見た目へ返ってくること
7. 何度も触りたくなる短いゲームループ

**神は細部に宿る**を品質基準にします

## 最新操作方針

十字キーは廃止済み

スマホ
- フィールドをタップ → 目的地へ歩く
- フィールドをドラッグ → 目的地を更新
- 建物をタップ → 入り口まで歩いて調べる
- A/B/X/Yは補助操作のみ、世界を見る面積を奪わない
- safe-area対応
- 操作中に誤タップ/スクロール/ズームが起きない

PC
- WASD / 矢印も維持

移動そのものは24pxグリッド/4方向のRPGらしい手触りを残します

## 参照軸

Romancing SaGa系の「小さなドットでも役割が読める旅情」と、Bravely Default系の「ジオラマ/奥行き/光」を高レベル参照にします

既存作品のキャラクター、固有UI、マップ、音楽、SE、スプライト、文章、ロゴをコピーしません
毎回GUILD∞独自の答えへ変換します

## 今回の役割分担

### Coordinator / Experience lane — ChatGPT（このbranch担当）
**俺はここをやる**
- v0.5の描画/Canvas復旧と実機表示
- UI/UXの最終体験設計
- タップ/ドラッグ操作の快適化
- 情報階層・質感・遷移・フィードバック
- 短時間でも意味がある「あと1回」ループ
- 各laneの統合順管理
- 統合後QA

他laneはこの領域を全面作り直さず、必要な変更は相談/PRで渡してください

### Graphics lane
- 高密度ピクセルキャラ
- 2Dなのに立体を感じるポリゴン建築
- 地形・影・窓灯り・焚き火・霧
- 少数キャラの歩行/作業モーション品質
- `graphics.js`中心

### Audio lane
- ケルン/中世酒場/民族音楽を思わせるGUILD∞オリジナルBGM
- day / night / fever等のアレンジ差分
- fade-in / fade-out / crossfade
- タップ/決定/収益/施設成長SE
- Safari WebAudioのgesture制約対応
- `audio.js`中心

### Economy / Growth lane
- 冒険者雇用 → 依頼 → 帰還 → 資源 → 施設成長
- 序盤の人手/設備/資源不足
- 発展するほど手間が減る快適化
- 放置帰還時に「街が進んだ」と感じる報告
- 課金/FOMO前提にはしない

### NPC / Life lane
- 受付、冒険者、職人、客の少人数自律行動
- 待機/仕事/会話/帰還の小芝居
- 人数を増やすより1人の存在感を上げる

### QA lane
- iPhone Safari
- portrait / landscape / safe-area
- Canvas表示
- localStorage save/load
- input race / double tap / drag
- 30/60fps負荷
- background/foreground復帰

## Engagementのルール

目標は「気づいたら長く遊んでいた」であって、プレイヤーを罰して拘束することではありません

取り入れる
- 開いて数秒で意味のある変化が見える
- 1操作ごとに映像/音/数字が自然に返る
- 5秒 / 30秒 / 3分 / 15分の複数の小目標
- 次にやりたいことが1つだけ自然に見える
- 観察しているだけでもNPCや街に小さな変化が起こる
- 工夫すると効率が上がる、理解すると上手くなる

避ける
- ログインしないと損をする脅し
- streak喪失
- 負けを取り返すための無限追跡
- 課金で焦らせるFOMO
- 意味のない通知/チェックリスト
- 数字だけ増えて見た目が何も変わらない成長

## 作業開始ルール

全員、作業前にこの順で読む

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. `V05_PRODUCT_DIRECTION.md`
4. 自分の担当ファイル / 最新PR

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
