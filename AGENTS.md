# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `FIVE_PASS_V12.md` ← 最新の品質プロセス
2. `VISUAL_REFORM_V12.md` ← 最新の見た目/FX/BGM正本
3. `BUILDJOY_CORE_V10.md` ← ゲーム性の正本
4. `REFERENCE_LIBRARY_V11.md` ← 参考/ライセンス
5. `ASSET_CREDITS_V12.md` ← v1.2で実際に使う外部資産
6. `GUILD_RULES.md`
7. `COLLAB.md`
8. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## v1.2 owner feedback

v1.1は細部を変えたが、**見た瞬間の品質差が足りない**

Owner要求:
- 「5周」= audit → reference → visual replacement → FX/audio reform → screenshot/compare の5段階を本当に回す
- グラフィックは小修正ではなく置換レベルで変える
- エフェクトを大幅強化
- BGMを仮シンセから実トラックへ改革
- Ownerが一つ一つ品質不足を指摘しなくても済む状態までAI側で比較/却下する

## v1.2 visual rules

- low-resolution logical scene → nearest-neighbor upscale
- sprite-forward renderer
- player: CC0 pixel sprite sheet優先、fallbackあり
- workers: CC0 sprite base優先、identity/role overlay
- terrain: CC0 Puny World familyをprototypeで使用
- richer foreground / foliage / atmosphere / light pools
- buildings: roof / wall / trim / lit windows / material variation
- construction: foundation → wall → roof/detail → finish flash
- palisade: one-build whole perimeter + gate
- no screen shake

## v1.2 FX rules

Gather:
- impact burst
- debris
- resource motes flying toward HUD
- floating value
- depletion burst

Build:
- local dust/timber chips
- staged rise
- finish ring / gold sparkle
- stronger build sound
- ZERO camera shake

Rare drop:
- ring + star burst + distinct sound

Night:
- palette crossfade
- lantern bloom
- firefly/ember atmosphere

## v1.2 audio rules

Prototype music:
- day: CC0 `Overworld Theme — alternate` by Louswan
- night/combat: CC0 `8-bit - Slay The Evil` by HydroGene
- crossfade day/night
- iOS user-gesture unlock
- procedural WebAudio remains for low-latency SFX only

## existing gameplay rules still active

- smooth analog drag movement
- auto gather
- abundant resources
- construction-first casual survival
- first construction fast
- first worker early
- autosave mandatory
- x1 normal / Hourglass x2-x3 / no free x5/x10
- population cap 200
- full perimeter defense

## acceptance

Do not call a visual pass complete unless:
- v1.1/v1.2 screenshots look like obviously different builds
- face/silhouette readable at phone size
- environment no longer reads as colored rectangles
- gather/build effects are obvious but non-nauseating
- BGM is an actual track, not only oscillator notes
- no autosave regression
- no screen shake
- provenance documented

作業完了時は Changed / Files / Tests / Known risks / Merge notes / Reference-license notes を残す
