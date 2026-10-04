# GUILD∞ AI ENTRYPOINT

旧GUILD∞を触るAI / Codex / Claude / ChatGPTは、実装前に最新版を読む

1. `V15_MIDGAME_COMBAT.md` ← **最新の最優先仕様**
2. `V14_SETTLEMENT_GROWTH.md` ← 城内/城外・城壁/門の基礎
3. `V13_CORE_REPAIR_AUDIT.md` ← UI/Worker/Identityの基礎
4. `BUILDJOY_CORE_V10.md` ← construction-firstの原則
5. `GUILD_RULES.md`
6. `COLLAB.md`
7. 自分の担当Issue / PR

ChatGPT Workが別で作っている新作には一切触れない

## v1.5 owner feedback

- DAY 5で資源が数千まで膨らみ、経済が崩壊している
- 難易度が低すぎる
- 敵が弱く、見た目も動きもおもちゃっぽい
- 攻撃 / ダメージ / 死亡の手応えが足りない
- やり込み要素と上限解放が足りない
- Guild Hall / Watchtowerなど建築物を増やしたい

## v1.5 non-negotiable

### Economy
- base storage cap: WOOD 240 / STONE 160 / FOOD 140
- Warehouse Lvでstorage capを拡張
- worker yieldをv1.4より大幅に下げる
- workers/buildingsは毎朝FOOD維持費
- FOOD不足はMorale低下 → worker効率低下
- legacy v1.4の異常在庫はmigration時に新capへnormalize

### Progression / ceiling
- Guild Hall Lv0–5で RANK E → D → C → B → A → S
- population rank cap: 40 / 70 / 100 / 150 / 200 / 300
- Palisade max Lv6
- Hut max Lv5
- Warehouse / Watchtower / Barracks / Guild Hall max Lv5
- higher rank unlocks higher wall levels

### Buildings
- Hut: housing
- Warehouse: storage cap
- Lumber Yard: wood efficiency
- Quarry: stone efficiency
- Watchtower: automatic projectile attack
- Barracks: Guard unlock + Guard damage
- Guild Hall: rank / population / wall ceiling unlock
- Lantern: repeatable light
- Palisade: territory / HP / build area

### Combat
- 4 waves each night
- Walker from Day 1
- Runner from Day 3
- Brute from Day 5
- Spitter from Day 7
- enemy HP/speed/damage scales by day and wave
- Watchtower fires arrows
- Spitter fires ranged projectile at wall
- hit flash
- damage numbers
- local knockback-lite
- slash effect
- death fall/fade + particles
- health bars on damaged/near enemies
- NO screen shake

### Difficulty
- first nights surviveable, but visible
- Day 3 should require some defense planning
- Day 5 should punish an undefended settlement
- breach must matter
- construction/build progression remains primary; not hardcore survival

### Preserve
- smooth analog drag
- outside gather / inside build
- real wall collision / gate routing
- workers actually walk/work
- autosave heartbeat
- original adaptive BGM
- simple normal-play UI
- no borrowed runtime assets

## QA acceptance

- Day 5 no longer naturally sits at thousands of WOOD/STONE without Warehouse progression
- Warehouse level visibly changes caps
- Guild Hall rank-up changes population/wall ceiling
- Watchtower visibly fires projectiles
- Barracks unlocks Guards
- Runner/Brute/Spitter appear on correct days
- damage number + hit flash + death FX visible
- wall can be broken by ignored high-day waves
- no wall tunneling regression
- reload preserves new building levels/rank/resources
- screen shake = 0

作業完了時は `Changed / Files / Tests / Known risks / Merge notes` を残す
