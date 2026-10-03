# GUILD∞ AI ENTRYPOINT

このリポジトリで旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、**実装前に必ず以下を最新版で読んでください**

1. `BUILDJOY_CORE_V10.md` — ゲーム性の正本
2. `REFERENCE_LIBRARY_V11.md` — **品質/参考/ライセンスの最新正本**
3. `GUILD_RULES.md`
4. `COLLAB.md`
5. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作ゲームには一切触れません

## 最新フィードバック v1.1

Ownerは一つずつ「顔は？性格は？UIは？」と指摘する状態に疲れている

今後はAI側が事前に完成品水準を確認してから出す

必須:
- 防壁1個を置く方式を廃止 → **1回で集落全体の防壁/perimeterを建設**
- キャラを色付き四角形で済ませない
- 顔 / 髪 / 服 / 道具 / 役職差を最低限持つ
- hired workerは `name / personality / role / trait / visual seed / flavor line` を持つ
- Worker UIは顔/名前/性格/役割を見せる
- genericな黒い長方形＋文字だけのUIを減らす
- pixel-frame / icon / active state / hierarchyを作る
- v1.0よりテンポを上げる
- 建設が主役であり、Survivalは補助

## Reference-first rule

Graphics / UX / Character担当は、作業前に `REFERENCE_LIBRARY_V11.md` のMIT/CC0資料を確認する

参考候補:
- Solstice Valley (MIT): browser pixel-RPG architecture / day-night / particles / HUD hierarchy
- Origin 16-bit ARPG (MIT): rarity / loot / progression UI / richer procedural pixel detail
- Shade Puny Characters / MiniWorld Sprites (CC0): coherent character/world family
- 7Soul RPG icons (CC0): UI/inventory icon family

**著作権のある商用ゲーム素材をコピーしない**
参考は品質・情報設計・テンポ・実装手法に限定

第三者assetを入れる場合は `ASSET_CREDITS.md` に title / author / URL / license / local path を必ず記録

## v1.1 Priority

1. whole-perimeter barricade
2. character face/personality/detail
3. worker cards
4. UI quality pass
5. faster movement/gather/build tempo
6. coherent open-source asset family導入
7. autosave/no-shake regression

## Existing gameplay rules still active

- smooth analog drag movement
- auto gather
- abundant resources
- first construction fast
- first worker early
- autosave mandatory
- x1 normal / Hourglass x2-x3 / no free x5/x10
- no screen shake
- population cap 200
- late-game target is the approved rich HD-2D/pixel town

作業完了時は Changed / Files / Tests / Known risks / Merge notes / Reference-license notes を残す
