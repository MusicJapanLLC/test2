# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. `V08_FEEDBACK_2026-10-04.md` ← **最新のユーザー指示。最優先**
4. `VISUAL_TARGET_V06.md`
5. `UI_DIRECTION_V06.md`
6. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## 現在の承認済みビジュアル基準

`legacy/guild-v05-detail-polish` の現行画面を基準にする

- 高密度ドットキャラ
- タイル世界
- polygon / pseudo-3D建築
- 灯り・影・霧
- teal / amber系の落ち着いた色
- Guild Hallが一目で主役と分かる画面
- 人数を増やして誤魔化さず、環境detailで街を濃くする

この見た目を壊して古いWebアプリ風へ戻さない

## v0.8 最新優先順位

1. **ドラッグ移動の操作感**
2. **常設bottom management bar + bottom log/ticker**
3. UI / Typography統一
4. 人口上限200 / speed gating / building-upgrade hooks
5. ドット絵・建物detail
6. Audio polish
7. QA

## v0.8 最新UI / 操作方針

- スマホの通常フィールド移動は **drag steeringのみ**
- plain field tapでdestination auto-walkを開始しない
- drag中は方向を更新し、releaseで短い現在step後に停止
- 十字キーは表示しない
- **A/B/X/Yの常設表示も廃止**
- routine playでfull MENUを開かせない
- GUILD UP / HIRE / facility / recordは下部barから触れる
- runtime logはbottom bar直上へ流す
- 建物tapはcontext選択として残してよい
- 建物強化はbottom UIから実行できる方向へ
- 人口上限は200。ただし200人を常時描画しない
- speedは最大×3、×1超は有限boost item/entitlement必須
- UIフォント / 数字 / 日本語ラベルのリズムを統一する
- genericな丸ボタン、バラバラな文字サイズ、Webアプリ風pillを増やさない
- TAP TO STARTのblocking画面を復活させない

## 役割分担

### Input / Feel
- drag-only field movement
- release / stop feel
- camera timing
- building tap coexistence

### UX / UI / Typography
- persistent bottom dock
- bottom log/ticker
- quick management actions
- compact sheet/tab
- font rhythm

### Graphics
- current art baselineを維持しdetail向上
- character / building / terrain / light

### Systems
- population cap 200
- save/load validation for 200
- speed API [1,2,3]
- finite speed-boost item gating
- building-upgrade state / hooks
- UIやgraphicsを勝手に作り直さない

### Audio
- long-session BGM/SE
- upgrade/hire/menu feedback
- input/gameplayは変更しない

### QA / Investigation
- iPhone 390x844 first
- drag input regression
- bottom dock touch conflict
- text clipping
- pixel blur
- no visible ABXY
- no free ×5/×10

作業開始前に担当を宣言し、完了時は Changed / Files / Tests / Known risks / Merge notes を必ず残す

**最新のユーザー仕様は `V08_FEEDBACK_2026-10-04.md` が正本です**
