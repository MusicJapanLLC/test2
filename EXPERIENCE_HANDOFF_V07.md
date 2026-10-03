# GUILD∞ legacy v0.5 — Experience handoff v0.7

Role: Experience / Integration

## Visual baseline

社長が承認した `v05_pw.png` 相当の街を基準に固定

維持するもの
- muted teal / amber
- 高密度pixel characters
- polygon / pseudo-3D buildings
- lantern / fire / fog / shadow
- compact HUD
- 少人数NPC

## Changed in v0.7

- permanent ABXYなしを維持
- compact MENUを維持
- tap直後にpixel cursor pulseを追加
- MENU openを短いstep animationに変更
- hintを操作中だけ薄くしてworld visibilityを優先
- typography / spacing / squared panel languageを維持
- canonical game / graphics / audio logicは変更なし

## Files

- `prototype-experience-v07.html`
- `prototype-experience-v07.css`
- `prototype-experience-v07.js`

## Tests

Local standalone buildで以下確認
- JavaScript syntax: pass
- 390 x 844 render: pass
- canvas page errors: 0
- tap movement: player `(0,120)` -> `(72,192)` を確認
- MENU open / close: pass
- ABXY visible UI: none

## Important

ChatGPT Workの新作には触れない
PR #16 Input laneのpointer / retarget実装は勝手に上書きしない
Graphics / Audio / NPC / Economy laneも変更しない

## Next integration

1. Input laneの最新tap/dragを比較
2. 建物tap時のcontext feedbackを追加
3. UI text overflow / safe-area QA
4. 必要部分だけcanonicalへ統合
