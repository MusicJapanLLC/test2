# GUILD∞ AI ENTRYPOINT

旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、実装前に最新版を読む

1. `V13_CORE_REPAIR_AUDIT.md` ← **最新の不具合/雑さ監査と修正方針**
2. `BUILDJOY_CORE_V10.md` ← ゲーム性の基礎
3. `REFERENCE_LIBRARY_V11.md` ← 参考/品質比較用
4. `GUILD_RULES.md`
5. `COLLAB.md`
6. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作には一切触れない

## v1.3 owner feedback

- v1.2で初めてゲームには見えた
- しかしUIがごちゃごちゃ
- 外部素材/他ゲームの文法を前に出しすぎてGUILD∞らしさが薄い
- BGMも借り物感が強い
- Hutが建てられない/建設が信用できない
- 人を雇っても働いている実感がない
- Lanternが1つしか建てられない
- Ownerが一つずつ欠点を指摘する状態を終わらせる

## v1.3 non-negotiable

### UI
Normal playは以下だけを常設:
- DAY/time
- WOOD/STONE/FOOD/PEOPLE
- sound/speed
- bottom ticker
- BUILD / PEOPLE / BAG

巨大brand/rank/objective/save chromeは常設しない
世界を最優先する

### Identity
- runtimeで外部sprite/BGMに依存しない
- 参考資料は品質比較に使うだけ
- visible copyingを避け、GUILD∞独自の色/形/音へ戻す

### Systems
- Hutはrepeatable、1軒ごとにworker capacity +5、global 200
- Lanternはrepeatable
- Lumber Yard / Quarryはunique efficiency buildings
- Palisadeはone-build full perimeter
- workerはpassive counterではなく、実nodeへ歩き、motion付きで採取し、資源を増やす
- 同職workerは可能なら別nodeを選ぶ
- Guardはday patrol / night defense
- ordinary gather tickごとにstorage writeしない
- autosave heartbeat + structural mutation save

### Audio
- borrowed CC0 track runtimeをやめる
- v1.3はoriginal adaptive score
- settlement growthでarrangementが増える
- day/night variation
- SFXは低遅延 procedural

### Feel
- smooth analog drag
- auto gather
- zero screen shake
- build/hire/gatherのlocal FX
- Hourglass x2/x3 only

## QA acceptance

- Hut x3 build
- Lantern x4 build
- first Hut後にPEOPLE unlock
- Woodcutterがtreeへ移動→伐採→Wood増加
- Minerがrockへ移動→Stone増加
- Gathererがforageへ移動→Food増加
- same-role workersのtarget分散
- reloadでbuilding/worker/resource/palisade保持
- borrowed runtime BGMなし
- normal playの大半がworld
- screen shake 0

作業完了時は `Changed / Files / Tests / Known risks / Merge notes` を残す
