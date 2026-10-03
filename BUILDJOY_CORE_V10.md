# GUILD∞ v1.0 — BUILDJOY CORE

Updated: 2026-10-04 JST
Scope: old/legacy GUILD∞ only

**ChatGPT Workの別新作には触れない**

## 0. Product reset

v0.9のゴリゴリSurvival寄りは弱める

主役は **建設を広げていく気持ちよさ**

Survivalは夜に少し緊張感を足す補助ループ

### Core loop

1. 主人公が滑らかに歩く
2. 木 / 石 / 食料の近くへ行く
3. 主人公が自動で採取モーションを始める
4. 素材が気持ちよく飛び出し、音と数字で増える
5. 建物を置く
6. 建物が目に見えて街を広げる
7. 人を雇う
8. 人に採取を任せる
9. 夜に少数のゾンビが来る
10. バリケード / 衛兵で軽く守る
11. 朝になり、また建設を広げる

**サバイバルの面倒さではなく、拡張の快感を作る**

---

## 1. Movement

マス移動を廃止

Mobile:
- field pointer down
- drag vector = movement vector
- continuous analog movement
- acceleration / deceleration short and smooth
- release = short deceleration then stop
- no destination tap walk
- no permanent joystick art
- no visible ABXY

Target feel:
- 60fps前提の滑らかなcamera + player movement
- character sprite itself can remain pixel-art / stepped animation
- world positionはfloatで保持
- rendering時だけpixel-snappedでもよい

**キャラ移動は滑らか、絵はドット** を両立する

---

## 2. Resource abundance

v0.9は木 / 石が少なすぎてストレス

v1.0 minimum visible density on a normal phone viewport:
- trees: 8–14 visible / surrounding world 24+
- rocks: 5–9 visible / surrounding world 16+
- food/forage: 3–6 visible

Nodes:
- respawn after a short prototype timer
- depletion should not leave the player wandering empty-handed for long
- no long travel before first construction

### Initial yield target
- tree hit: Wood +2 to +3
- rock hit: Stone +1 to +2
- forage: Food +2 to +4

First useful building should be reachable within **30–60 seconds**

---

## 3. Automatic gathering

Routine gather button mash is removed

When player is close enough to a resource node:
- movement can slow/stop automatically
- player faces target
- axe/mining/gather animation loops
- each work cycle produces resource
- small particle burst
- floating `+WOOD` / `+STONE`
- SFX every work cycle with throttle
- node disappears when depleted
- target next nearby node only if player is still within auto-work area

Player can interrupt instantly by dragging away

Context action remains for:
- zombie attack if needed
- repair
- special interaction

But **normal tree/rock harvesting is automatic**

---

## 4. Construction-first progression

Do not require hardcore crafting chains

### Remove from first 10 min core
- mandatory Workbench gate
- multi-stage crafting recipes
- excessive survival meters
- tool durability

### First buildings

1. `開拓旗 / CAMP MARKER`
   - starting anchor / free or very cheap

2. `小屋 / HUT`
   - worker capacity +1
   - Wood 12 / Stone 4

3. `木材所 / LUMBER YARD`
   - hired woodcutters work faster
   - Wood 18 / Stone 6

4. `採石所 / QUARRY`
   - miners work faster
   - Wood 14 / Stone 12

5. `防壁 / BARRICADE`
   - light night defense
   - Wood 10

6. `灯火塔 / LANTERN POST`
   - visual expansion / small night buff
   - Wood 8 / Stone 3

Later:
- inn
- forge
- market
- guild hall
- watch tower
- the approved polished v0.5 town becomes late progression

Every building must visibly alter the town

---

## 5. Workers

Start:
- player 1
- hired workers 0

But worker unlock should be early enough to create relief, not after a punishing survival wall

Suggested:
- build first Hut -> hiring unlocks
- Food is hiring/upkeep resource
- first worker should be possible in 2–4 minutes

Roles:
- Woodcutter
- Miner
- Gatherer
- Guard

Population cap remains 200

Simulation population and rendered actors remain decoupled

---

## 6. Day / night / zombies

Night remains, but it is **casual pressure**

Day:
- 70–78% of cycle
- gathering/building focus

Dusk:
- short clear warning
- music shifts
- lamp glow becomes stronger

Night:
- first nights: 2–4 slow zombies
- zombies target outskirts / barricade / settlement anchor
- failure should cost some resources or damage structures, not instantly wipe the save
- player can help with axe
- Guard / barricade reduce attention burden

Dawn:
- reward / relief cue
- small survival bonus

No screen shake

---

## 7. Game feel

This is a top priority, equal to systems

Every core action should have:

Gather:
- sprite motion
- local hit particles
- small resource arc/pop
- floating text
- crisp SFX

Build:
- 0.3–0.7 sec construction animation
- dust / spark / timber particles
- building rises / fades in by stages
- short satisfying sound
- no camera shake

Hire:
- entrance animation
- short fanfare
- ticker/log

Rare drop:
- stronger but short visual + sound accent

Night:
- color/music transition, not nausea effects

---

## 8. Music / tempo

Current music/effects feel too flat

Audio lane should deliver:
- day loop with a slightly clearer pulse
- dusk cue
- night variation
- dawn relief phrase
- gather/build/hire/drop sounds with distinct identity
- phone-speaker friendly mix

Tempo should support the construction loop, not feel like background wallpaper

No low-frequency rumble or aggressive stingers every few seconds

---

## 9. Persistence

Autosave remains mandatory

- heartbeat 1–2 sec
- mutation save
- visibility/pagehide/beforeunload
- primary + backup + IndexedDB mirror where supported
- boot restore before normal play

Persist:
- player position
- resources
- nodes / respawn times
- buildings / placement / level
- workers / roles
- day/time
- structure HP
- inventory / drops / gacha
- speed boost state

---

## 10. Speed / drops / gacha

Keep prior rules

- free normal speed = x1
- maximum x3
- x2/x3 requires Hourglass / timed item
- no free permanent x5/x10

Drops:
- Hourglass
- Summon Ticket
- Blueprint
- Gem
- rare cosmetic/build material hooks later

Gacha remains secondary collection content
Do not let gacha replace construction progression

---

## 11. Team lanes

### Systems
- smooth-state-compatible simulation
- node abundance / respawn
- auto gathering state
- building placement / effects
- workers / automation
- day/night / casual zombie pressure
- save

### Input / Feel
- analog drag
- acceleration / deceleration
- auto-target gather interruption
- combat/repair coexistence

### Graphics
- abundant readable nodes
- gather animations
- build stages
- early camp -> town progression
- preserve current approved HD-2D/pixel language

### UX
- bottom log
- BUILD always accessible
- worker panel
- context only for special actions
- no routine gather button spam

### Audio
- stronger day pulse
- chop/mine/pickup/build/hire/drop/night/dawn

### Economy
- first building 30–60 sec
- first worker 2–4 min
- night pressure light
- construction costs tuned for flow

### QA
- 390x844 first
- smooth movement
- no resource starvation
- auto gather
- no shake
- autosave/reload
- first building under 60 sec target

---

## 12. Acceptance for next alpha

1. 木と石が十分多い
2. 斧を振るために毎回ボタンを押さなくていい
3. 移動がマスではなく滑らか
4. 30–60秒で最初の建設ができる
5. 建設時に見た目/音/エフェクトで気持ちいい
6. 作業台を作るまで何もできない状態ではない
7. 夜はあるが、面倒なSurvival管理が主役になっていない
8. reloadしても進行が残る
9. screen shake = 0
10. 『次の建物を建てたい』が継続動機になる
