# Legacy GUILD∞ — Input / UI handoff

## Changed
- blocking start screenなしで即時描画
- 十字キー / ABXY常設UIを廃止
- 画面ドラッグによるdynamic drag movementへ変更
- drag中だけ薄い入力guideを表示
- 指を離すと即停止
- WASD / arrows fallback
- HUDをgeneric mobile web UIからcompact game HUDへ変更
- GUILD / HIRE / FEVERを小型command panelへ整理
- ACTIONは建物近接時だけ強調
- 音声は最初の通常操作でunlock
- NPC人数は8人固定で追加しない

## Files
- `legacy-v05.html`
- `legacy-v05.css`
- `legacy-v05.js`
- branch: `legacy/agent-input-ui-polish`

## Tests
- inline / standalone JS syntaxをNodeで確認済み
- blocking TAP TO STARTなし
- permanent joystick / D-padなし
- `window.GUILD_API.version = 0.5-legacy-ui-drag`
- headless Chromium screenshotは実行環境のGPU/ANGLE制約で未完了
- iPhone実機は未確認のため社長確認が必要

## Known risks
- 実機Safariのpointer capture / safe-area最終確認が必要
- 現在はcollision未実装
- spriteはまだ最終品質ではない

## Merge notes
- 統合先は `legacy/guild-infinity-v05-ui`
- Workの新作ゲームには一切変更を送らない
- graphics / systems / QAはそれぞれの `legacy/agent-*` branchで継続する
- `GUILD_RULES.md` の旧作境界を必ず維持する
