# GUILD∞ AI ENTRYPOINT

旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、実装前に最新版を読む

1. `V14_SETTLEMENT_GROWTH.md` ← **最新仕様 / 最優先**
2. `V13_CORE_REPAIR_AUDIT.md` ← core quality baseline
3. `BUILDJOY_CORE_V10.md` ← game loop baseline
4. `GUILD_RULES.md`
5. `COLLAB.md`
6. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作には一切触れない

## v1.4 owner feedback

- v1.3で初めて「ちゃんとゲーム」になった
- ただし街の中に木/石が多すぎて城外へ行く意味がない
- 防壁を建ててもプレイヤー/兵が壁をすり抜ける
- 敵が来る頻度が低すぎる
- 小屋が城壁外に建つことがある
- 城壁を増築したい
- 家/城壁にlevel systemが欲しい
- level upで見た目/HP/収容/エフェクトが変わるべき

## v1.4 non-negotiable

### Settlement zoning
- starter resourcesは序盤だけ城内近傍にあってよい
- 防壁完成後、城内resourceは整理し、respawnは城外へ
- city interior = building/people space
- wilderness = resource space
- player/workerが城外へ出る理由を作る

### Wall collision / gate
- wall HP > 0 の間はwall segmentをplayerが通過できない
- gateだけが正規出入口
- workerは城外jobへ行く時gate経由
- guardはwallが生きている間は基本城内側から防衛
- zombieはwallを破るまで内部へ素通りしない

### Building placement
- Hut / Lumber / Quarry / Lanternはcurrent settlement bounds内だけに建設
- build slot不足時はwall expansionへ誘導
- Hut repeatable
- Lantern repeatable
- Lumber / Quarry unique

### Levels
- Palisade Lv1–Lv4
  - area拡張
  - HP増加
  - build slots増加
  - visual material change
- Hut Lv1–Lv3
  - appearance change
  - worker capacity増加
  - stronger upgrade FX

### Enemy pacing
- day/night cycle短縮
- nightは単発spawnではなくmultiple waves
- first nightから敵の存在を明確に見せる
- hard wipeではなく軽いpressureは維持

### Existing quality rules
- normal UIはv1.3の簡素さを維持
- original GUILD∞ art/BGM baseline
- smooth analog drag
- auto gather
- no screen shake
- autosave mandatory
- Hourglass x2/x3 only

## QA acceptance

- Palisade完成後、城内にresourceがrespawnしない
- gate以外のwall collision 10/10
- workerがgateから城外へ出て採取する
- Hut x3が全て城内
- Lantern x4が全て城内
- Palisade Lv1→Lv2→Lv3で外周が明確に広がる
- Hut Lv1→Lv2→Lv3で見た目が変わる
- first nightにmultiple wavesが来る
- enemyはwallを破るまで城内へ入らない
- reloadでlevel/placement/wall/resources/workers保持

作業完了時は `Changed / Files / Tests / Known risks / Merge notes` を残す
