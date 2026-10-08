'use strict';

// v1.6 progression / economy polish
// Owner feedback: woodcutter speed, guards inside walls, group-wide upgrades,
// and deeper production-efficiency progression. Loaded after routines.js.
const PROGRESSION_VERSION='v16.6-progression';
const PROG_CORE_BUILD=build;
const PROG_CORE_HIT_NODE=hitNode;

const GROUP_TYPES={
  hut:{key:'housing',label:'RESIDENTIAL',max:BUILD.hut.max},
  lantern:{key:'lantern',label:'LANTERN NETWORK',max:BUILD.lantern.max},
  watchtower:{key:'watchtower',label:'WATCHTOWER NETWORK',max:BUILD.watchtower.max}
};
const WORK_TECH={
  forestry:{label:'FORESTRY',jp:'林業技術',max:10,desc:'木こりの伐採速度・WOOD収穫量UP'},
  masonry:{label:'MASONRY',jp:'採石技術',max:10,desc:'採石人の採掘速度・STONE収穫量UP'},
  foraging:{label:'FORAGING',jp:'採集技術',max:10,desc:'採集人の採集速度・FOOD収穫量UP'},
  logistics:{label:'LOGISTICS',jp:'運搬技術',max:8,desc:'全作業員の移動速度UP'},
  tooling:{label:'TOOLING',jp:'工具整備',max:8,desc:'全採取職の作業間隔を短縮'}
};

function ensureProgression(){
  if(!state.progression||typeof state.progression!=='object')state.progression={};
  if(!state.progression.groups)state.progression.groups={};
  if(!state.progression.tech)state.progression.tech={};
  for(const [type,cfg] of Object.entries(GROUP_TYPES)){
    if(!Number.isFinite(state.progression.groups[cfg.key])){
      const levels=state.buildings.filter(b=>b.type===type).map(b=>b.level||1);
      state.progression.groups[cfg.key]=levels.length?Math.max(...levels):1;
    }
    state.progression.groups[cfg.key]=clamp(Math.round(state.progression.groups[cfg.key]),1,cfg.max);
    for(const b of state.buildings.filter(b=>b.type===type))b.level=state.progression.groups[cfg.key];
  }
  for(const [key,cfg] of Object.entries(WORK_TECH)){
    if(document.body.dataset.edition==='chief')cfg.max=25;
    if(!Number.isFinite(state.progression.tech[key]))state.progression.tech[key]=0;
    state.progression.tech[key]=clamp(Math.round(state.progression.tech[key]),0,cfg.max);
  }
}
function groupLevel(type){ensureProgression();const cfg=GROUP_TYPES[type];return cfg?state.progression.groups[cfg.key]:1}
function techLevel(key){ensureProgression();return state.progression.tech[key]||0}
function syncGroup(type){const L=groupLevel(type);for(const b of state.buildings.filter(b=>b.type===type))b.level=L;return L}
function scaleCost(c,m){const out={};for(const [k,v] of Object.entries(c))if(v)out[k]=Math.max(1,Math.ceil(v*m));return out}
function groupUpgradeCost(type,next){
  const count=Math.max(1,state.buildings.filter(b=>b.type===type).length);
  return scaleCost(costFor(type,next),1.22+Math.max(0,count-1)*.16);
}
function techCost(key,next){
  const L=Math.max(1,next),iron=L>=5?Math.floor((L-3)/2):0;
  if(key==='forestry')return{wood:55+L*38,stone:18+L*16,...(iron?{iron}: {})};
  if(key==='masonry')return{wood:28+L*23,stone:65+L*45,...(iron?{iron}: {})};
  if(key==='foraging')return{wood:42+L*26,stone:22+L*15,food:22+L*18,...(iron?{iron}: {})};
  if(key==='logistics')return{wood:70+L*42,stone:48+L*31,food:18+L*15,...(L>=4?{iron:Math.floor(L/3)}:{})};
  return{wood:62+L*34,stone:58+L*34,...(L>=4?{iron:Math.floor(L/3)}:{})};
}
function workerYieldMultiplier(role){
  const tool=techLevel('tooling');
  if(role==='wood')return 1+techLevel('forestry')*.12+tool*.035;
  if(role==='stone')return 1+techLevel('masonry')*.12+tool*.035;
  if(role==='food')return 1+techLevel('foraging')*.10+tool*.03;
  return 1;
}
function workerCycle(role){
  // Woodcutter intentionally becomes the snappiest baseline gatherer.
  const base=role==='wood'?.40:role==='stone'?.52:.58;
  const specific=role==='wood'?techLevel('forestry'):role==='stone'?techLevel('masonry'):techLevel('foraging');
  return base/(1+specific*.07+techLevel('tooling')*.04);
}
function workerMoveSpeed(role){const base=role==='guard'?43:42;return base*(1+techLevel('logistics')*.055)}

// Worker yield tech is applied after the tested resource lifecycle wrapper.
hitNode=function(n,source='player'){
  if(source!=='worker')return PROG_CORE_HIT_NODE(n,source);
  const key=n?.type==='tree'?'wood':n?.type==='rock'?'stone':'food',role=n?.type==='tree'?'wood':n?.type==='rock'?'stone':'food';
  const before=state[key];PROG_CORE_HIT_NODE(n,source);const baseGain=Math.max(0,state[key]-before),mult=workerYieldMultiplier(role);
  if(baseGain>0&&mult>1){const bonus=baseGain*(mult-1);addRes(key,bonus);if(Math.random()<.22)floatText(n.x,n.y-27,'EFF +'+bonus.toFixed(1),'#e7ce84')}
};

function insideGuardPoints(){
  if(!state.palisade.built||state.palisade.hp<=0)return[{x:0,y:75},{x:75,y:35},{x:75,y:-35},{x:0,y:-75},{x:-75,y:-35},{x:-75,y:35}];
  const B=bounds(),m=28,g=Math.max(20,B.gap/2+8);
  return[
    {x:-g,y:B.b-m},{x:g,y:B.b-m},{x:B.r-m,y:B.b-m},{x:B.r-m,y:0},{x:B.r-m,y:B.t+m},
    {x:0,y:B.t+m},{x:B.l+m,y:B.t+m},{x:B.l+m,y:0},{x:B.l+m,y:B.b-m}
  ];
}
function nearestInsideGuardEnemy(w,range){
  const protectedWall=state.palisade.built&&state.palisade.hp>0;let best=null,bd=range;
  for(const e of state.enemies){if(e.dead)continue;if(protectedWall&&!inside(e.x,e.y,bounds()))continue;const d=dist(w,e);if(d<bd){best=e;bd=d}}
  return best;
}
function guardInsideCombat(w,dt){
  const e=nearestInsideGuardEnemy(w,170);if(!e)return false;w.targetId=null;w.state='combat';w.hiddenAtHome=false;const d=dist(w,e);
  if(d>30){move(w,e.x,e.y,workerMoveSpeed('guard')*1.18,dt);return true}
  if(w.cool<=0){w.cool=.62;w.swing=1;const dmg=14+(state.buildings.find(b=>b.type==='barracks')?.level||1)*4;damageEnemy(e,dmg,w.x,w.y,true)}return true;
}
function guardPatrolInside(w,index,dt){
  const pts=insideGuardPoints();if(!Number.isFinite(w.patrolIndex))w.patrolIndex=index%pts.length;const p=pts[w.patrolIndex%pts.length];
  w.state='patrol-inside';w.hiddenAtHome=false;if(move(w,p.x,p.y,workerMoveSpeed('guard'),dt)||dist(w,p)<9)w.patrolIndex=(w.patrolIndex+1)%pts.length;
}
function civilianGoHomeFast(w,dt){
  const h=ensureWorkerHome(w);w.targetId=null;if(!h){w.state='returning-camp';w.hiddenAtHome=false;move(w,0,35,workerMoveSpeed(w.role)*1.28,dt);return}
  const p=homePoint(w,h),d=dist(w,p);if(d>9){w.state='returning-home';w.hiddenAtHome=false;const rt=route(w,p.x,p.y);move(w,rt.x,rt.y,workerMoveSpeed(w.role)*1.38,dt)}else{w.x=p.x;w.y=p.y;w.state='sleeping';w.hiddenAtHome=true;w.hp=Math.min(w.maxHp,w.hp+4*dt)}
}

// Replace routine update once more: same life cycle/remote ledger, tuned production,
// but guards stay inside the palisade and civilians return faster at dusk.
updateWorkers=function(dt){
  if(ROUTINE_lastPhase!==state.phase){if(state.phase==='dusk')toast('DUSK · 村人は帰宅、衛兵は城内警戒');if((state.phase==='dawn'||state.phase==='day')&&(ROUTINE_lastPhase==='night'||ROUTINE_lastPhase==='dusk'))toast('DAWN · 村人が仕事へ戻る');ROUTINE_lastPhase=state.phase}
  const claimed=new Set();for(const w of state.workers)if(w.targetId)claimed.add(w.targetId);
  for(let i=0;i<state.workers.length;i++){
    const w=state.workers[i];ensureWorkerVitals(w);ensureWorkerHome(w);if(w.dead)continue;w.cool=Math.max(0,(w.cool||0)-dt);w.hit=Math.max(0,(w.hit||0)-dt);
    if(w.role==='guard'){if(guardInsideCombat(w,dt))continue;guardPatrolInside(w,i,dt);continue}
    if(isCivilianHomeTime()){
      const threat=nearestWorkerEnemy(w,30);if(threat&&inside(threat.x,threat.y,bounds())&&workerCombat(w,dt)){w.hiddenAtHome=false;continue}
      civilianGoHomeFast(w,dt);continue;
    }
    w.hiddenAtHome=false;if(workerCombat(w,dt))continue;
    const type=workerResourceType(w);let n=state.nodes.find(n=>n.id===w.targetId&&n.alive);
    if(!n){n=nearestNode(w,type,claimed);w.targetId=n?.id||null;if(n)claimed.add(n.id)}
    if(!n){w.state='idle';continue}
    if(dist(w,n)>31){w.state='moving';const rt=route(w,n.x,n.y);move(w,rt.x,rt.y,workerMoveSpeed(w.role),dt)}
    else{w.state='working';w.work=(w.work||0)+dt*(.70+.30*state.morale/100);if(w.work>workerCycle(w.role)){w.work=0;const key=resourceStateKey(type),before=state[key];hitNode(n,'worker');recordRemoteYield(w,type,before);if(!n.alive)w.targetId=null}}
  }
  towerCombat(dt);
};

function groupUpgrade(type){
  ensureProgression();const cfg=GROUP_TYPES[type],current=groupLevel(type);if(!cfg||current>=cfg.max)return false;
  const next=current+1,c=groupUpgradeCost(type,next);if(!hasCost(c)){toast('全体強化素材不足 · '+fmtCost(c),true);return false}
  pay(c);state.progression.groups[cfg.key]=next;syncGroup(type);for(const b of state.buildings.filter(b=>b.type===type))celebrateBuilding(b,'upgrade');
  toast(`${cfg.label} ALL Lv.${next} · ${state.buildings.filter(b=>b.type===type).length}棟へ適用`);A.sfx('confirm');save();forceUiRefresh();return true;
}
function upgradeTech(key){
  ensureProgression();const cfg=WORK_TECH[key],current=techLevel(key);if(!cfg||current>=cfg.max)return false;const next=current+1,c=techCost(key,next);
  if(!hasCost(c)){toast(cfg.jp+' 素材不足 · '+fmtCost(c),true);return false}pay(c);state.progression.tech[key]=next;floatText(state.player.x,state.player.y-38,`${cfg.label} Lv.${next}!`,'#ffe09a');fxBurst(state.player.x,state.player.y,'#d8b66c',22,1.15);toast(`${cfg.jp} Lv.${next} · ${cfg.desc}`);A.sfx('confirm');save();forceUiRefresh();return true;
}
function globalBenefit(type,L){if(type==='hut')return`全HOUSE人口枠 Lv.${L} / 新設HOUSEにも適用`;if(type==='lantern')return`全LANTERN安全圏UP / 半径 ${Math.round(130+L*38)}`;return`全WATCHTOWER 射程・威力・連射 Lv.${L}`}

renderUpgrades=function(){
  ensureProgression();const el=$('upgrade-grid');if(!el)return;const html=[];
  html.push('<div class="notice">街全体アップグレード · 同種建物すべてに一括適用</div>');
  for(const type of ['hut','lantern','watchtower']){
    const count=state.buildings.filter(b=>b.type===type).length;if(!count)continue;const cfg=GROUP_TYPES[type],L=groupLevel(type);
    if(L>=cfg.max){html.push(`<button disabled><b>${cfg.label} ALL Lv.${L} MAX</b><small>${globalBenefit(type,L)}</small><em>${count}棟</em></button>`);continue}
    const c=groupUpgradeCost(type,L+1);html.push(`<button data-group-upgrade="${type}" ${hasCost(c)?'':'disabled'}><b>${cfg.label} ALL Lv.${L} → ${L+1}</b><small>${globalBenefit(type,L+1)}</small><em>${fmtCost(c)} · ${count}棟</em></button>`)
  }
  html.push('<div class="notice">生産技術 · 最大Lv.'+(document.body.dataset.edition==='chief'?'25':'8〜10')+'</div>');
  for(const [key,cfg] of Object.entries(WORK_TECH)){
    const L=techLevel(key);if(L>=cfg.max){html.push(`<button disabled><b>${cfg.label} Lv.${L} MAX</b><small>${cfg.jp} · ${cfg.desc}</small><em>MASTERED</em></button>`);continue}
    const c=techCost(key,L+1);html.push(`<button data-tech-upgrade="${key}" ${hasCost(c)?'':'disabled'}><b>${cfg.label} Lv.${L} → ${L+1}</b><small>${cfg.jp} · ${cfg.desc}</small><em>${fmtCost(c)}</em></button>`)
  }
  const skip=new Set(Object.keys(GROUP_TYPES));
  for(const b of state.buildings){if(skip.has(b.type))continue;const d=BUILD[b.type];if(!d||b.level>=d.max)continue;const c=costFor(b.type,b.level+1);html.push(`<button data-upgrade-id="${escapeUpgradeId(b.id)}" ${hasCost(c)?'':'disabled'}><b>${d.name} Lv.${b.level} → ${b.level+1}</b><small>${upgradeBenefit(b.type,b.level+1)}</small><em>${fmtCost(c)}</em></button>`)}
  el.innerHTML=html.join('');el.querySelectorAll('[data-group-upgrade]').forEach(btn=>btn.onclick=()=>groupUpgrade(btn.dataset.groupUpgrade));el.querySelectorAll('[data-tech-upgrade]').forEach(btn=>btn.onclick=()=>upgradeTech(btn.dataset.techUpgrade));el.querySelectorAll('[data-upgrade-id]').forEach(btn=>btn.onclick=()=>upgradeBuildingById(btn.dataset.upgradeId));
};

// New repeatable buildings inherit the current global tier automatically.
build=function(type){const before=new Set(state.buildings.map(b=>b.id)),result=PROG_CORE_BUILD(type);if(GROUP_TYPES[type]){const added=state.buildings.find(b=>!before.has(b.id)&&b.type===type);if(added){added.level=groupLevel(type);save();forceUiRefresh()}}return result};

function progressionReport(){ensureProgression();return{version:PROGRESSION_VERSION,groups:{...state.progression.groups},tech:{...state.progression.tech},woodCycle:workerCycle('wood'),stoneCycle:workerCycle('stone'),guardMode:'inside'}}
ensureProgression();syncGroup('hut');syncGroup('lantern');syncGroup('watchtower');save();forceUiRefresh();
window.GUILD_PROGRESSION=Object.freeze({version:PROGRESSION_VERSION,report:progressionReport,groupUpgrade,upgradeTech,workerCycle,workerYieldMultiplier,insideGuardPoints:()=>insideGuardPoints().map(p=>({...p}))});
