# GUILD∞ v0.6 — VISUAL TARGET / EXECUTION SPEC

Updated: 2026-10-04 JST

この文書は旧GUILD∞専用です
ChatGPT Workが別で作っている新作には一切触れません

## 0. 今回の結論

最新のコンセプト画像は **完成イメージの方向性資料** として使います

ただし、今すぐ画像全体を実装する指示ではありません

### 今回の実装対象

**コンセプト画像の「左側の街プレイ画面」の品質感だけを当面のVisual Targetにする**

目標:
- 高密度ピクセルキャラクター
- 立体的なギルド本部 / 民家 / 階段 / 柵
- 夜の青とランタンの暖色が共存する街
- タイル/石畳/段差/樹木/小物による密度
- 街の奥行きが読めるdepth sort
- 上部HUDはゲーム画面を邪魔せず、一目で資源とLvを読める
- 画面をタップ/ドラッグして歩くこと自体が気持ちいい

### 今回は実装しない

コンセプト画像右側に描かれた以下は**将来UIの参考**であり、v0.6では作らない

- 依頼掲示板の大規模一覧
- 冒険者管理の装備画面
- 施設強化の詳細画面
- ワールドマップ
- 複雑な会話システム
- 大量キャラ/装備/アイコン

これらを先行実装してはいけません

**v0.6の成功条件は「街を歩く画面が、触って気持ちよく、見て気持ちいい」こと**

---

## 1. Visual baseline

現在の `legacy/guild-v05-detail-polish` のスクリーンショット/実装を壊さない

残すもの
- teal / dark greenの夜色
- amber / lanternの暖色
- high-density pixel character
- polygon / pseudo-3D building
- Guild Hallを中央ランドマークにする考え方
- 少人数NPC
- fog / light / shadow
- SFC的な読みやすさ

増やすのは**量ではなく解像度と細部**

---

## 2. Graphics lane — exact task

Branch: `legacy/agent-graphics-detail-v06`

### Do
1. Guild Hallを最優先で仕上げる
   - 屋根面 / 正面 / 側面 / 柱 / 窓 / 扉 / 看板を別レイヤーとして読ませる
   - lantern lightを局所的に置く
   - 入口の階段/段差を明確化
2. 地面を最低4種に分ける
   - stone road
   - packed dirt
   - grass
   - building edge / step
3. propsは少数精鋭
   - lamp
   - crate
   - fence
   - tree
   - sign
4. player/NPCは人数を増やさず、輪郭・髪・服・職業差を上げる
5. foreground / midground / backgroundを分ける
6. shadowはキャラと建物の接地に使い、blurでドットを潰さない

### Do not
- NPC追加で画面を埋める
- 新しい大規模施設システムを作る
- UI/fontを触る
- movementを触る
- Work新作を触る

### Acceptance
- 390x844でGuild Hallが一目で主役と分かる
- キャラが背景に埋もれない
- 同じNPC数でも現状より街が濃く見える
- screenshot比較で道路/建物/灯りの3層が明確

---

## 3. Input / Feel lane — exact task

Branch: `legacy/agent-input-feel-v06`

### Do
1. tap destination
   - 1タップで確実に目的地更新
   - 目的地markerは小さく短時間
2. drag retarget
   - 指をドラッグ中、destinationを更新
   - UI上のdragはfield inputに流さない
3. stop feel
   - 指示キャンセル/到着で曖昧に滑らない
   - 1タイル移動のテンポを維持
4. building tap
   - 建物tap → 最寄り入口へroute → 到着 → interaction
5. camera
   - player追従はするが、1マス感を消すほどヌルヌルさせない

### Do not
- 十字キー復活
- visible ABXY復活
- graphics変更
- UI design変更
- NPC追加

### Acceptance
- iPhone縦画面で10回連続tapして10回目的地が更新される
- 3回以上連続drag retargetしても誤停止しない
- MENU / HUD操作でplayerが勝手に動かない
- 建物tapが最低5回連続で入口interactionまで成立

---

## 4. UI / Typography lane — exact task

Branch: `legacy/agent-ui-typography-v06`
PR: #25

### Do
1. visible ABXY rowは出さない
2. 右上は `♪ / ×1 / MENU` 程度のcompact utilities
3. MENUから既存のギルド台帳を開く
4. HUD / MENU / button / Japanese labelのfont rhythmを統一
5. 数字はtabular alignment
6. worldを隠すlarge bottom controllerを作らない
7. rounded mobile-web button感を減らす
8. 2D digital / 16bit-inspiredなframe / border / spacingを使う

### Typography tokens
- TITLE: 18–24px相当 / tracking広め
- HUD VALUE: 12–16px相当 / tabular / weight高め
- HUD LABEL: 7–9px相当 / uppercase or short Japanese
- BODY: 11–13px相当
- MICRO: 7–9px相当

フォントファイル追加を前提にしない
system mono fallbackでも階層とspacingを揃える

### Acceptance
- screenshot内で「ここだけ別フォント」に見える箇所がない
- GOLD/WOOD/FOOD/Lvが1秒で読める
- MENU開閉が1tap
- ABXYが通常画面に見えない
- 390x844で文字切れなし

---

## 5. QA lane — exact task

Branch: `legacy/agent-qa-v06`

### Mandatory matrix

#### Portrait 390x844
- world visible
- HUD readable
- no ABXY
- MENU accessible
- bottom management does not cover player route
- safe-area OK

#### Landscape 844x390
- utility buttons do not overlap HUD
- MENU panel fits
- player movement input has usable field area

#### Input
- tap destination x10
- drag retarget x5
- building tap x5
- MENU open/close x5
- sound toggle x3
- speed toggle x4

#### Regression
- no blocking TAP TO START
- NPC count unchanged
- save/load works
- BGM still unlocks by user gesture
- pixel smoothing remains off
- Work new game untouched

Report failures as:
`branch / device-size / steps / expected / actual / screenshot or console`

---

## 6. Systems lane

v0.6では原則**新システムを増やさない**

必要な作業だけ
- UI/menu state互換
- tap/building interaction hook
- save/load regression
- collision regression
- existing economy regression

依頼一覧・装備・world mapなどの新規大画面は作らない

---

## 7. Merge order

1. UI/Typography #25 の方向確認
2. Input/Feel
3. Graphics Detail
4. Systems compatibility only
5. QA full pass
6. integration branchへまとめる

同じファイルを複数laneが同時に全面置換しない
必要なshared changeは先にIssueコメントで宣言する

---

## 8. Final v0.6 acceptance

v0.6で確認する質問は5つだけ

1. 開いた瞬間に「ちゃんとゲーム」に見えるか
2. 10秒歩くだけで操作が嫌にならないか
3. 文字とUIがチープなWebアプリに見えないか
4. NPC10人以下でも街が生きて見えるか
5. 次の5分を遊びたくなるか

この5つを通るまで、右側の大規模システムへ進まない
