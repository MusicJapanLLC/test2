# GUILD∞ legacy — Experience prototype v0.6 handoff

## Role

Experience / Integration lane

**担当する**
- final HUD composition
- typography system
- menu architecture
- world-first mobile UI
- integration review
- final iPhone UX QA

**担当しない / 上書きしない**
- Graphics laneのcharacter/building/world描画
- Audio laneのBGM/SE生成
- Economy/NPC logic
- PR #16のpointer / drag core implementation
- ChatGPT Workの新作

## Prototype files

- `prototype-experience-v06.html`
- `prototype-experience-v06.css`
- `prototype-experience-v06.js`

Canonical `index.html`, `style.css`, `game.js`, `graphics.js`, `audio.js` はこのpassでは変更していません

## Changed

1. 常設ABXYを非表示
2. MENUをworld UIの唯一のsecondary entryに追加
3. GUILD UP / HIRE / FEVERをMENU > 街へ移す比較設計
4. 街 / 台帳 / 冒険者 / 設定の4-section menu
5. typography / numeric rhythm / border / spacing / panel materialを共通化
6. internal A/B/X/Y hooksを維持し、existing game.js compatibilityを残す
7. current high-density pixel + polygon art baselineをそのまま利用

## Interaction principle

通常時
- tap / drag world
- tap building
- MENU
- BGM / speed

世界を触る操作をUIより優先する

## Tests

- prototypeのinline JS syntax: `node --check` pass
- required IDs retained: `upgrade`, `hire`, `fever`, `cost`, `roster`, `fever-time`, `menu-status`, `menu-save`, `menu-close`, `action-X/Y/A/B`
- `#bottom` management actions are descendants of MENU in the standalone prototype design
- controller DOM is retained only for compatibility and hidden visually

## Known risks

- iPhone Safariの実機touchは社長確認待ち
- final font assetはまだ選定していない。現在はsystem-safe mono/Japanese fallback + spacing/materialで方向確認
- PR #16 Input laneの最新drag feelは、承認後に加算統合する

## Merge notes

このprototypeをcanonicalへ丸ごとコピーしない

推奨統合順
1. 社長がUI/menu方向を確認
2. PR #16からinput feelのみ統合
3. approved typography/menu layerをcanonicalへ移植
4. Graphics / Audioの最新差分をrebase
5. iPhone QA

## Latest user baseline

2026-10-04の本人スクリーンショットにある
- high-density pixel town
- teal / amber palette
- polygon building
- lantern / fire lighting

をvisual baselineとして維持する
