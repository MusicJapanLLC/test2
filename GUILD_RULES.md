# GUILD∞ LEGACY — MASTER RULES

Updated: 2026-10-04 JST

## 0. 最重要境界

**このルールは、これまで共同開発してきた旧GUILD∞だけに適用します**

ChatGPT Work が新しく作り始めた新作ゲームは別プロジェクトです

- 新作ゲームのファイル / branch / 実装には一切触れない
- 新作からコードや仕様を持ち込まない
- 新作へ旧GUILD∞の変更をpushしない
- 旧作の作業は `legacy/guild-infinity-v05-ui` を基準に、`legacy/*` 配下の担当branchで行う
- 判断に迷ったら新作側ではなく旧作側を止めて確認する

**目的は、今まで作ってきた「しょーもないけど嫌いじゃない旧GUILD∞」を継続改善すること**

---

## 1. Workの旧作作業を引き継ぐ

旧作の現在の基準は、Workが途中まで触ったHD-2D / input系の流れを継承します

優先順位

1. 画面が必ず見えて、そのまま動く
2. 操作性
3. UIの質感
4. ドット絵 / 建物 / 背景の質
5. その後にゲーム機能

### 非交渉事項

- **TAP TO START等のブロッキング開始画面は禁止**
- 開いた瞬間からワールド描画とゲームループを開始
- 音声だけ最初の通常操作でunlockしてよい
- 十字キー / ABXY路線は廃止
- 永久表示のゲームパッドUIは置かない
- スマホは **ドラッグ移動 / dynamic drag joystick** を基本にする
- WASD / 矢印はPC fallbackとして維持可能
- iPhone safe-area対応
- `imageSmoothingEnabled=false` を維持

---

## 2. 操作方針

### Mobile

画面のゲーム領域を指でドラッグすると移動する

- touch開始位置を原点にする
- 指の相対移動量を移動ベクトルへ変換
- 指を離すと即停止
- 移動開始時だけ薄いガイドを表示してよい
- 常設スティックは表示しない
- UIボタン上のタッチは移動入力へ流さない
- 意図しないスクロール / zoom / text selectionを防ぐ

### PC

- WASD / 矢印 = 移動
- Shift = 一時加速（必要なら）
- Enter / Space = context action

### Feel

今回はSFCの1マス移動へ寄せるのではなく、Workが触った **ドラッグ移動 + HD-2D街歩き** を磨く

ヌルヌルすぎて操作が曖昧にならないよう、加速・減速は短く、止まりは明確にする

---

## 3. UI方針

現状の安いWeb UI感を消すことを最優先にします

- 大きな丸ボタンを常設しすぎない
- genericなグラデーションpillを減らす
- 薄い金属 / 黒曜石 / ギルド台帳を思わせる独自フレーム
- 細い境界線、階層、余白で高級感を作る
- GOLD / WOOD / FOOD / GUILDは常時確認できるが主張しすぎない
- GUILD UP / HIRE / FEVER は1つのcompact command panelに整理
- ACTIONは近接時だけ強く見せる
- UIは世界を隠さない
- iPhoneで押せるサイズは守る

**WebサイトのUIではなく、ゲームのHUDとして作る**

---

## 4. グラフィック

方向性は旧作のまま

**高密度ドットキャラクター × ポリゴン/疑似3D建築 × HD-2D的な光と奥行き**

参考軸
- 16bit JRPGの読みやすいドット感
- ジオラマを覗き込むような奥行き

ただし既存作品の固有アセット、UI、マップ、音楽、キャラをコピーしない

### 優先

- 主人公のシルエットと歩行
- 少数NPCの質
- Guild Hallの立体感
- 道 / 草 / 木 / 石 / 水の地形差
- 遠景 / 中景 / 前景
- 影 / 光 / 霧 / 火の粉

### 人数

人をむやみに増やさない

画面密度不足は、人口ではなく
- props
- 建築detail
- 光
- motion
- environment
で補う

---

## 5. 旧作の役割分担

全員 `legacy/guild-infinity-v05-ui` の最新状態を確認してから担当branchを作る

### Visual / Graphics
推奨: `legacy/agent-graphics-polish`
- ドットキャラ
- 建物polygon
- 地形
- 光 / 影 / 霧 / depth

### Input / UI
推奨: `legacy/agent-input-ui-polish`
- drag movement
- touch reliability
- HUD
- command panel
- context action

### Systems
推奨: `legacy/agent-systems`
- collision
- save/load
- quest state
- state separation

### QA / Investigation
推奨: `legacy/agent-qa`
- iPhone Safari
- blocking overlay regression
- touch conflict
- JS/runtime
- pixel blur
- UI占有率

同じファイルを同時に直接上書きしない
完成した差分はPRで `legacy/guild-infinity-v05-ui` に戻す

---

## 6. 旧作で守るもの

- autonomous adventurer economy
- GOLD / WOOD / FOOD
- GUILD UP / HIRE / FEVER
- HD-2D rendering direction
- player walking around the guild settlement
- BGM / SFX
- world-space coordinates
- Y sorting
- sharp pixel rendering

機能を増やすより、まず既存部分を気持ちよくする

---

## 7. 作業開始チェック

- [ ] これは旧GUILD∞の作業か
- [ ] Workの新作には一切触れていないか
- [ ] `legacy/guild-infinity-v05-ui` の最新commitを確認したか
- [ ] 最新 `GUILD_RULES.md` を読んだか
- [ ] 自分の担当範囲を宣言したか
- [ ] 十字キー / ABXYを復活させていないか
- [ ] blocking start screenを復活させていないか
- [ ] UIを画面に増やすだけの改善になっていないか
- [ ] NPCをむやみに増やしていないか
- [ ] 他担当の変更を消していないか
- [ ] 完了時に Changed / Files / Tests / Risks / Merge notes を残したか
