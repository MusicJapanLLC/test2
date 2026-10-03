# GUILD∞ LEGACY — AI ENTRYPOINT

**STOP: このbranch群は旧GUILD∞専用です**

ChatGPT Work が新しく作っている新作ゲームには一切触れないでください

旧作を触るAI / Codex / Claude / ChatGPTは、実装前に必ず以下を読むこと

1. `GUILD_RULES.md`
2. `COLLAB.md`
3. 現在の `legacy/guild-infinity-v05-ui`
4. 自分の担当PR / Issue

## 最新方針

- 旧作だけを改善する
- Workが途中まで触ったHD-2D / drag-input路線から再開
- 十字キー廃止
- ABXY常設廃止
- blocking start screen禁止
- 開いた瞬間からワールド描画
- mobileはdrag movement / dynamic drag joystick
- UIのチープなWeb感を大幅改善
- 高密度ドット + polygon建物 + 光/影/霧
- NPCをむやみに増やさない

## branch境界

旧作の作業は `legacy/*` のみ

推奨lane
- `legacy/agent-input-ui-polish`
- `legacy/agent-graphics-polish`
- `legacy/agent-systems`
- `legacy/agent-qa`

統合先は `legacy/guild-infinity-v05-ui`

新作側のbranch / file / PRへ変更を送らないこと

## 完了報告

必ず以下を書く
- Changed
- Files / Branch
- Tests
- Known risks
- Merge notes

**最新の正本は `GUILD_RULES.md`**
