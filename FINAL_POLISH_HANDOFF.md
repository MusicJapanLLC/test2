# GUILD∞ touch prototype handoff / v0.5

## Latest ownership — 2026-10-04 01:05 JST
社長が明示した担当境界：Workは独立した新作を制作。他のチャットは既存GUILD∞の改善を継続する
このブランチはWorkが旧作を途中まで触ったスナップショットであり、完成版／承認済みデザインではない
新作のコード・素材・音源・設計へ他のチャットは変更を加えず、旧作へ新作を混ぜないこと
旧作担当はここからタップ／ドラッグ移動、画面表示、UIの質感改善を引き継ぎ、GitHubで担当宣言・連携を続ける

## Role
社長指示による統合・最終QA責任者。Graphics / Audio / Input & Systems / QA に担当を分け、既存v0.3の経済・施設・演出を維持して統合
開始時GUILD_RULES → COLLAB → ART_DIRECTION → 当時のSTYLE_BIBLEを読了。共有先でSTYLE_BIBLEが削除された218e401に追従し、GUILD_RULESを正本として維持

## Changed
- 4方向24pxグリッド移動、140ms歩行、一定テンポの長押し、方向別ドット歩行
- 最新本人変更を反映し、スマホはフィールドタップ/ドラッグで目的地を指定。建物は入口まで歩いて調べる。PCはグリッドキー入力
- 十字キーを通常画面から撤去し、補助ABXYをコンパクトな下部列へ配置。safe-area/押下表現/縦横対応
- A=調べる/決定、B=移動停止/戻る、X=台帳、Y=街の状況
- ピクセルアトラスとNPC職業別シルエット、屋根/壁/側面/階段/窓/旗を持つ6ランドマーク
- ギルド設備の段階的な見た目変化、タイル道路/森/池/灯り、人物・樹木・施設の共通depth sort
- 建物/池/木の幹と街境界の衝突判定
- 既存10人を施設に分散して開始。NPCは歩けるセルをA*で移動し、設備の前まで依頼往復
- ×1/2/5/10・FEVERは経済の速度を変え、プレイヤーの歩行速度を変えない
- GUILD UPはNPCを増やさず設備を成長。HIREは10人までの明示募集のみ、満員時にGoldを消費しない
- オリジナル32小節WebAudio楽曲、昼/夜/FEVER編曲、SE、音量圧縮、残響、音数上限、バックグラウンド停止
- BGMは♪のユーザー操作で開始。blocking start画面なし
- 15秒自動保存/終了時保存/再読込復帰。version1の保存データを検証し、不正値・破損・保存拒否で進行不能にしない
- upgrade costを有限に保つ。Lv50でゲーム進行を打ち切らない
- 低解像度Canvas(.5 viewport)を2倍表示、smoothing=false。独自スプライトを2ワールド単位のピクセルで描画

## Files / Branch
Branch `game/guild-final-polish-v05` → shared `game/guild-infinite-hd2d-v03`
Runtime: index.html / style.css / game.js / graphics.js / audio.js
Tests: tests/playtest.cjs / audio.test.cjs / .github/workflows/guild-ci.yml
Export: `npm run build` → dist/guild_infinity_v05.html （単一HTMLでオフライン実行可能）

## Shared interfaces
`GUILD_API.getState()` / move(dir) / action(A|B|X|Y) / canWalk(x,y) / save() / load() / setSpeed(1|2|5|10) / spawnAdventurer() / worldGridSize=24
追加API: touchMove(worldX,worldY) / worldToScreen(worldX,worldY) / getState().destination
getState returns resources{gold,wood,food,lv}, player{x,y,dir}, npcs=count, speed, fever, menuOpen
`GUILD_INPUT`互換: GRID / step(dx,dy) / button(name) / getPlayer() / onA,B,X,Y
`guild:button` on window and `guild:action` on document. Hookがtrueを返す場合は既定のABXY処理を置き換える
`GuildGraphics` は状態を変更しないrenderer。`GuildAudio` は音声のみを所有

## Tests — prior checks and latest touch state
- Node構文check通過
- 十字キー版はChromiumで16項目の全体回帰通過。これは最新タップ版の全項目合格を意味しない
- 最新タップ版：単一HTMLをChromium file://で起動、例外なし、目的地96,120へ到着、通常十字キーなしを確認。詳細結果はQA_RESULTS.mdを参照（存在する場合）
- NPC focused追加チェック通過:10人全員が移動、A*経路は4方向24pxかつ歩行可能、×10でGold/Wood/Food増加、人数不変
- audio mock tests通過: 2,921 scheduled voices, polyphony/throttle/stall recovery/concurrent resume/mute/visibility
- nativeCanvasで6施設/4段階/4方向/2歩行フレーム描画を検証
- 390x844 / 844x390 で各コントローラー40px以上、重なり・はみ出しなし

## Known risks
- 実機iPhoneでの音量・音色・ノッチsafe-areaの最終確認は未実施
- WebKitはdownload済みだがホストのGTK/GStreamer等不足で起動未確認。Chromiumのmobile emulationはSafari実機確認の代替ではない
- 既存GitHub Pages有効化権限の問題はこの変更では解決していない。公開成功は未確認
- HTML exportをfile://で開く場合、localStorageの可否はブラウザに依存。保存不可でも遊べる
- 戦闘/ボス/インベントリ/シナリオは最新正本に従い今回追加していない

## Merge notes
- 他担当のブランチは削除・強制更新しない
- agent/snes-controls-pixelの24px step/ABXY/GUILD_INPUT案を確認し、互換APIを残した。入力系を二重起動しない
- assist/pixel-sprite-kitは独立した候補素材。今回rendererに別spriteを上書きしていない。追加する場合はgraphics.jsの描画API内で行う
- 旧PR#2のCIはtitle/ドラッグpointermove/単一script前提で不適合。今回の実動作テストを利用し、古いCOLLAB/RULESを復活させない
- 台帳は入力を止めるが、既存NPC経済は進行を継続

## Next recommended task
旧作担当が画面を表示してタップ／ドラッグを試す。UIのチープな質感改善を担当分担し、最新タップ入力に合わせた全回帰を行う。iPhone実機で歩行テンポ、音量、safe-areaを確認する
