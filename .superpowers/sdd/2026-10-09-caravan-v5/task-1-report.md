# Task 1 — campaign engine

## API contract (ready for UI integration)
`window.Campaign` is World-only, persisted under `Chief.state.campaign`.
Load `chief-campaign.js` after chief-social and before living modules. It installs gameplay hooks itself; do not call its tick again from the animation loop.

- `definitions`: frozen 18-item array. `id`, `index`, `name`, Japanese `biome` label, CSS `color`, `ground`, `description`, `gimmick`, `dialogue` (context key), `weather` (`none/rain/sand/snow/ash/spray/fog/wind/steam`), `goals` metadata (`id,label,target`), `projects` metadata. IDs listed below.
- `current()`: current definition. `state`: persisted normalized campaign object.
- `goals()`: three `{id,label,target,value,done}` entries. The first meadow accepts previous achievements; every subsequent settlement, including a meadow revisit, requires 40 newly harvested resources, two new buildings and one repair. The other two repairs are optional improvements.
- `landmarks()`: three `{id,name,x,y,cost,benefit,repaired,distance,near,affordable}` records. Fixed world positions `(-240,55)`, `(235,70)`, `(0,-235)`; `near` means distance <=66. IDs e.g. `rain-0`. Costs are wood/stone mappings. Interactions work while a menu pauses time, but require physical proximity/home.
- `interact(id)`: `{ok,reason}`; resource payment, repair, sound, particles, event and save on success; no repeated payment.
- `canMove(id)`: `{ok,reason}`; checks valid stage, completion, combat, expeditions, away state, duplicate pending migration. First circuit is sequential. 18 stamps allow any new settlement in any stage.
- `migrate(id,reload=true)`: `{ok,reason,stageId?}`. Copies serial state, validates, writes dedicated `SAVE+'-before-campaign'`, backup and new primary before marking resetting and reloading. No mutations to live state on failure. `reload=false` prepares the saved destination and locks live saving until reload; it does not switch the live map.
- `tick(dt)`: paused/away/resetting-safe, called through updateHumanLife hook.
- `modifiers()`: `{move,work,yield:{wood,stone,food},weather,weatherActive}`; values already applied to movement, worker cycles, player gathering and harvest amounts. Volcano phase 12s, coast tide phase 24s. Repairs counter the slowdown and add bounded benefits.
- `report()`: `{stageId,name,index,settlement,elapsed,goals,completed,stamps,visits,best,history,nextId,campResidents,overflow:{wood,stone,food},modifiers}`. `nextId` is the linear next stage or meadow after a completed circuit. `history` max18 records with `{id,day,visit,completed,buildings,residents}`; visits max1e6 and stamps max18. `best` is maximum completed goal count (3 on clear).
- Events through existing `village-event`: `landmark-repaired` with stageId/landmarkId, `campaign-clear` with stageId, `campaign-departure` with destination stageId. Existing harvest/delivery events stay available.

Required early root integration in chief-config.js (before core load/economy caps): for World only, capResource should normalize nonnegative finite values without truncating overcap. Campaign later installs a bounded addRes and capacity floor for carried supplies. Without this early hook, high warehouse inventories are truncated before this module runs.

## Implementation
18 node distributions, physical movement/work/yield countermeasures, permanent 18 stamps and bounded history. Fresh buildings/wall/nodes while resources, resident IDs/roles/traits/XP/cargo, research/group levels, social, World scenes/discoveries/outposts/jobs entitlements and trophies remain. Active expedition prevents departure. Fallen cargo parcels travel to the new camp. Existing roster sleeps in camp; newly built huts add growth slots. Stage progress survives reload and only fresh actions count after migration. No migration resource rewards.

## Tests
Real-browser checks and regression results below.


## All 18 local rules

| Stage ID | Village | Actual rule |
| --- | --- | --- |
| meadow | 辞令だけは立派な村 | Three optional repair projects improve movement, food yield, work |
| rain | 雨漏り検査村 | Wet roads: movement84%; boardwalk counters to108% |
| desert | 砂しか勝たん区 | Sun: work85%; shade counters to110% |
| snow | ぬくぬく残業町 | Movement88%, work90%; clearing/hearth counter both |
| volcano | 定時噴火工業団地 | Five seconds of ash every12sec: work85%; vent gives110% |
| coast | 出港未定の港 | Tide10/24sec: movement90%; jetty counters to110% |
| bamboo | 竹より背伸び村 | Wood yields125% |
| orchard | おかわり果樹町 | Depleted food nodes respawn in half the time |
| fog | 視界良好という村 | Central65-wide half-width road moves120%; signs expand to150 |
| canyon | 石にも席がある区 | Stone workers and player's rock work at125% |
| marsh | 長靴支給待ち村 | Food yields135%, abundant food distribution |
| wind | 追い風出勤町 | Tailwind travel125%, wind reverses every12sec |
| springs | 湯けむり出張所 | Within120 of camp, recover0.8HP/sec and work115% |
| moon | 夜更かし朝礼村 | Player harvest yields150% at dusk/night |
| river | 橋の向こうも同じ村 | Residents carrying cargo move130% |
| mushroom | きのこ議事堂 | Food harvest also picks up0.3wood, respecting storage/carry caps |
| terrace | 段取り棚田町 | Food harvest north of center yields160% |
| depot | 荷ほどき最終候補地 | Delivery starts an8sec work125% boost |

Each stage has three world-space repair objects with fixed affordable material costs. No resources are deducted by weather; modifiers affect actual travel/work/credited harvest. Repairs offer immediate counterplay/benefits without additional prerequisites. Discovery/exploration remains the existing World system and IDs are intentionally separate from its region IDs.

## Verification results

- `node tests/campaign-simulation.cjs`: passed 42 real Chromium checks. Entry is actual World HTML, conditional script/early-cap injection only when parallel root integration is absent. Animation is frozen to run deterministic real engine calls; this is a software browser test, not physical phone testing.
- `node tests/transfer-security.cjs`: 19 checks passed; malicious IDs/HTML/autoForge rejected or safely rendered, imported text remains inert, purchase identity preserved, no browser errors.
- `node --check chief-campaign.js` and `chief-transfer.js`: pass.
- Migration failure test injects a primary localStorage failure after backup writes and verifies exact primary/backup rollback, unchanged live serial, and no resetting flag. Successful migration uses saved-state reload; duplicate-click lock is checked.
- High resources(4200wood/3300stone/2300food),30resident IDs/traits/XP/roles/cargo, research, relationships, parcels, World scenes/resources/discoveries/outposts survive actual migration/reload. Thirty residents sleep in camp before huts exist. Fresh houses unlock growth.
- Proximity and duplicate repair guards, exact payment, measured player movement improvement, worker cycle counterplay, new-action goals, paused/away clocks, no stamp repetition and every stage's rule checked. Real serialized migration across all18 stages, back to fresh meadow, plus repeated revisits checks bounded18history/18stamps.

## Known limits / merge notes

- localStorage offers individual atomic writes, not a multi-key transaction. Migration writes durable old-state recovery first and new primary last; caught failures roll back. A browser crash between writes therefore has either the old primary or a complete new primary, with old-state recovery. It never mutates live arrays before successful persistence.
- Supply capacity floor equals inventory carried into the new village; this represents saved supply crates and grants no resources. Rebuilding a warehouse increases storage once its normal capacity exceeds those crates. Spending on the simple building/repair goals frees space for new harvest immediately.
- Camp homes remain assigned to carried residents; new huts add new vacancies. Research and group levels are carried intentionally.
- Root must include the module only in World and preserve the early cap hook, now present in chief-config.js. Module is self-hooked; UI must not call tick a second time.
- `migrate(...,false)` intentionally locks live autosaving and requires reload. Its purpose is testable save preparation; normal UI should use default reload.
- Root owns title/visuals/sound/dialogue and hosting; this task makes no claims about their final visual QA.

### Campaign test output

```json
{
  "checks": 42,
  "results": [
    "18 unique stages; mature old village goals satisfied without replay",
    "away, active/ready expedition, resident reservation, combat and locked destination block migration",
    "failed primary save rolls back backup; no live mutation or reset flag",
    "atomic prepared migration, exact backup, duplicate click locked",
    "reload conserves overcap resources, 30 identities/roles/traits/XP/cargo, research, social, exploration scenes/discoveries/outposts and parcels; fresh map/goals and camp housing",
    "all carried residents sleep in camp with no huts",
    "far repair rejected without payment",
    "near repair pays exact cost",
    "rain boardwalk changes actual movement multiplier",
    "duplicate repair refused",
    "rain repair increases measured player travel",
    "campaign time/goals frozen while paused",
    "campaign time/goals frozen while exploring",
    "desert work repair changes actual worker cycle",
    "snow work repair changes actual worker cycle",
    "volcano work repair changes actual worker cycle",
    "full supply bank cannot destroy carried cargo",
    "fresh construction tracked; housing permits growth",
    "actual post-arrival harvest+build+repair clears stage",
    "clear stamp never repeats",
    "post-arrival actions and repairs persist across reload",
    "bamboo wood yield changes",
    "orchard actual food respawn halved",
    "fog fast route depends on position",
    "fog repair expands actual fast route",
    "canyon stone work distinct",
    "marsh food yield distinct",
    "wind directional travel changes",
    "spring physical healing and nearby work",
    "moon night harvest distinct",
    "river carried transport speed distinct",
    "mushroom food harvest gives actual salvage wood",
    "terrace north geography improves food",
    "depot actual delivery event starts work burst",
    "depot burst bounded and expires",
    "malformed campaign import rejected",
    "malformed campaign import rejected",
    "malformed campaign import rejected",
    "malformed campaign import rejected",
    "actual reload progression through all18 stages; one-time18 stamps; bounded history; meadow revisit fresh actions",
    "repeated circuit revisits keep history18 and stamps18 without reward growth",
    "no browser runtime errors"
  ]
}
```
