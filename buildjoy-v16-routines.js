'use strict';

// v1.6 NPC routines / upgrade polish
// System-only layer on top of v16 stability. No new-game files are touched.
const ROUTINES_VERSION='v16.5-routines';
const ROUTINE_REPEAT_UPGRADES=new Set(['hut','lantern','watchtower']);
const ROUTINE_CORE_BUILD=build;
const ROUTINE_CORE_DRAW_BUILDING=drawBuilding;
const ROUTINE_CORE_DRAW_WORKER=drawWorkerEntity;
const ROUTINE_CORE_UPDATE_WORKERS=updateWorkers;
let ROUTINE_lastPhase=state.phase;

function routineHouseCapacity(h){return 4+(h.level||1)*3}
function routineHomeCounts(){const counts=new Map();for(const w of state.workers){if(w.dead||!w.homeId)continue;counts.set(w.homeId,(counts.get(w.homeId)||0)+1)}return counts}
function ensureWorkerHome(w){
  const huts=state.buildings.filter(b=>b.type==='hut');
  if(!huts.length){w.homeId=null;return null}
  const current=huts.find(h=>h.id===w.homeId);
  if(current)return current;
  const counts=routineHomeCounts();
  const chosen=huts.slice().sort((a,b)=>{
    const ar=(counts.get(a.id)||0)/Math.max(1,routineHouseCapacity(a));
    const br=(counts.get(b.id)||0)/Math.max(1,routineHouseCapacity(b));
    return ar-br||dist(w,a)-dist(w,b);
  })[0];
  w.homeId=chosen.id;
  return chosen;
}
function homePoint(w,h){const s=(w.seed||0)%5;return{x:h.x+(s-2)*3,y:h.y+7+((s%2)*2)}}
function isCivilianHomeTime(){return state.phase==='dusk'||state.phase==='night'}

function exteriorPatrolPoints(){
  if(!state.palisade.built||state.palisade.hp<=0){return[{x:0,y:150},{x:150,y:80},{x:150,y:-80},{x:0,y:-150},{x:-150,y:-80},{x:-150,y:80}]}
  const B=bounds(),m=38,g=Math.max(22,B.gap/2+12);
  return[
    {x:g,y:B.b+m},{x:B.r+m,y:B.b+m},{x:B.r+m,y:0},{x:B.r+m,y:B.t-m},
    {x:0,y:B.t-m},{x:B.l-m,y:B.t-m},{x:B.l-m,y:0},{x:B.l-m,y:B.b+m},{x:-g,y:B.b+m}
  ];
}
function guardPatrol(w,index,dt){
  w.hiddenAtHome=false;
  if(state.palisade.built&&state.palisade.hp>0){
    const B=bounds();
    // Guards explicitly leave through the south gate before entering the exterior patrol loop.
    if(inside(w.x,w.y,B)){
      w.state='patrol-exit';
      const exit={x:0,y:B.b+34};
      move(w,exit.x,exit.y,62,dt);
      return;
    }
  }
  const pts=exteriorPatrolPoints();
  if(!Number.isFinite(w.patrolIndex))w.patrolIndex=index%pts.length;
  const p=pts[w.patrolIndex%pts.length];
  w.state='patrol-outside';
  if(move(w,p.x,p.y,48,dt)||dist(w,p)<10)w.patrolIndex=(w.patrolIndex+1)%pts.length;
}
function civilianGoHome(w,dt){
  const h=ensureWorkerHome(w);w.targetId=null;
  if(!h){w.state='returning-camp';w.hiddenAtHome=false;const rt=route(w,0,35);move(w,rt.x,rt.y,42,dt);return}
  const p=homePoint(w,h),d=dist(w,p);
  if(d>9){w.state='returning-home';w.hiddenAtHome=false;const rt=route(w,p.x,p.y);move(w,rt.x,rt.y,46,dt)}
  else{w.x=p.x;w.y=p.y;w.state='sleeping';w.hiddenAtHome=true;w.hp=Math.min(w.maxHp,w.hp+4*dt)}
}
function workerResourceType(w){return w.role==='wood'?'tree':w.role==='stone'?'rock':'food'}
function resourceStateKey(type){return type==='tree'?'wood':type==='rock'?'stone':'food'}
function recordRemoteYield(w,type,before){
  const key=resourceStateKey(type),delta=Math.max(0,state[key]-before);
  if(!w.totalGathered)w.totalGathered={wood:0,stone:0,food:0};
  if(delta>0){w.totalGathered[key]=(w.totalGathered[key]||0)+delta;w.lastYieldAt=Date.now();w.lastYield=delta;w.lastYieldType=key;updateHud(true)}
  return delta;
}

// Replace worker simulation so civilians have a home/night rhythm and guards are real exterior patrol NPCs.
updateWorkers=function(dt){
  if(ROUTINE_lastPhase!==state.phase){
    if(state.phase==='dusk')toast('DUSK · 村人は帰宅、衛兵は外周警戒');
    if((state.phase==='dawn'||state.phase==='day')&&(ROUTINE_lastPhase==='night'||ROUTINE_lastPhase==='dusk'))toast('DAWN · 村人が仕事へ戻る');
    ROUTINE_lastPhase=state.phase;
  }
  const claimed=new Set();for(const w of state.workers)if(w.targetId)claimed.add(w.targetId);
  for(let i=0;i<state.workers.length;i++){
    const w=state.workers[i];ensureWorkerVitals(w);ensureWorkerHome(w);if(w.dead)continue;
    w.cool=Math.max(0,(w.cool||0)-dt);w.hit=Math.max(0,(w.hit||0)-dt);

    if(w.role==='guard'){
      if(workerCombat(w,dt))continue;
      guardPatrol(w,i,dt);continue;
    }

    if(isCivilianHomeTime()){
      const threat=nearestWorkerEnemy(w,30);
      if(threat&&workerCombat(w,dt)){w.hiddenAtHome=false;continue}
      civilianGoHome(w,dt);continue;
    }

    w.hiddenAtHome=false;
    if(workerCombat(w,dt))continue;
    const type=workerResourceType(w);
    let n=state.nodes.find(n=>n.id===w.targetId&&n.alive);
    if(!n){n=nearestNode(w,type,claimed);w.targetId=n?.id||null;if(n)claimed.add(n.id)}
    if(!n){w.state='idle';continue}
    if(dist(w,n)>31){w.state='moving';const rt=route(w,n.x,n.y);move(w,rt.x,rt.y,40,dt)}
    else{
      w.state='working';w.work=(w.work||0)+dt*(.68+.32*state.morale/100);
      const cycle=w.role==='stone'?.55:w.role==='wood'?.68:.64;
      if(w.work>cycle){
        w.work=0;const key=resourceStateKey(type),before=state[key];hitNode(n,'worker');recordRemoteYield(w,type,before);if(!n.alive)w.targetId=null;
      }
    }
  }
  towerCombat(dt);
};

drawWorkerEntity=function(w){if(w.hiddenAtHome&&!w.dead)return;ROUTINE_CORE_DRAW_WORKER(w)};

function lanternDetailed(b){
  const x=sx(b.x),y=sy(b.y),L=clamp(b.level||1,1,3);shadow(x,y+16,24+L*4,5,.46);
  if(L>=3){rect(x-8,y+9,16,7,'#6f6b5f');rect(x-6,y+4,12,6,'#8a826f')}
  rect(x-3,y-31-L*4,6,48+L*4,'#704c31');rect(x-1,y-29-L*4,2,43+L*4,'#9d6b3f');
  if(L===1){rect(x-11,y-38,22,10,'#242a2a');rect(x-7,y-36,14,6,'#e4b059')}
  else{
    rect(x-19,y-39-L*3,38,4,'#5f472f');
    for(const side of[-1,1]){const lx=x+side*16;rect(lx-6,y-44-L*3,12,11,'#252b2b');rect(lx-4,y-42-L*3,8,7,L===3?'#ffd078':'#e4b059');if(state.phase==='night'||state.phase==='dusk')glow(lx,y-38-L*3,42+L*12,.16)}
    if(L===3){poly([[x-6,y-46],[x,y-54],[x+6,y-46]],'#b58a50');rect(x-2,y-50,4,6,'#eac978')}
  }
  if(state.phase==='night'||state.phase==='dusk')glow(x,y-32,lanternRadius(b),.10+.025*L);
}
function buildingCelebrationAura(b){
  const until=b.fxUntil||0;if(until<=performance.now())return;
  const t=clamp((until-performance.now())/850,0,1),x=sx(b.x),y=sy(b.y),[w,h]=buildingSize(b.type,b.level||1);
  ctx.save();ctx.globalAlpha=t*.75;ctx.strokeStyle=b.fxKind==='upgrade'?'#ffd77f':'#efbf69';ctx.lineWidth=2;ctx.strokeRect(Math.round(x-w*.62),Math.round(y-h*.72),Math.round(w*1.24),Math.round(h*1.12));ctx.restore();
}
drawBuilding=function(b){if(b.type==='lantern')lanternDetailed(b);else ROUTINE_CORE_DRAW_BUILDING(b);buildingCelebrationAura(b)};

function celebrateBuilding(b,kind='build'){
  if(!b)return;b.fxUntil=performance.now()+850;b.fxKind=kind;
  const color=kind==='upgrade'?'#ffd982':'#d7b26e';fxBurst(b.x,b.y,color,26,1.4);floatText(b.x,b.y-38,kind==='upgrade'?`LEVEL ${b.level}!`:'BUILD!','#ffe0a0');A.sfx('build');
  setTimeout(()=>{try{fxBurst(b.x,b.y,color,16,1.05);if(kind==='upgrade')A.sfx('confirm')}catch(_){}},170);
}

// Make every repeatable building upgrade target explicit. This fixes the misleading Lantern "Lv did not change" behavior.
function upgradeBuildingById(id){
  const b=state.buildings.find(x=>x.id===id);if(!b)return false;const d=BUILD[b.type];if(!d||b.level>=d.max)return false;
  const c=costFor(b.type,b.level+1);if(!hasCost(c)){toast('強化素材不足 · '+fmtCost(c),true);return false}
  pay(c);b.level++;b.builtAt=performance.now();celebrateBuilding(b,'upgrade');
  if(b.type==='guild')toast(`GUILD RANK UP · ${rank()}`);else if(b.type==='lantern')toast(`LANTERN Lv.${b.level} · SAFE RADIUS ${Math.round(lanternRadius(b))}`);else toast(`${d.name} Lv.${b.level}`);
  save();forceUiRefresh();return true;
}
upgrade=function(type){const b=state.buildings.find(x=>x.type===type&&x.level<(BUILD[type]?.max||1));return b?upgradeBuildingById(b.id):false};
// IDs can arrive from an imported save. Preserve them as data in quoted HTML
// attributes, including during boot before the progression renderer takes over.
function escapeUpgradeId(id){return String(id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
renderUpgrades=function(){
  const el=$('upgrade-grid');if(!el)return;const cards=[];const indexes={};
  for(const b of state.buildings){const d=BUILD[b.type];if(!d||b.level>=d.max)continue;indexes[b.type]=(indexes[b.type]||0)+1;
    if(!ROUTINE_REPEAT_UPGRADES.has(b.type)&&cards.some(x=>x.type===b.type))continue;
    const c=costFor(b.type,b.level+1);cards.push({id:b.id,type:b.type,name:d.name,index:indexes[b.type],L:b.level,c});
  }
  el.innerHTML=cards.length?cards.map(x=>`<button data-upgrade-id="${escapeUpgradeId(x.id)}" ${hasCost(x.c)?'':'disabled'}><b>${x.name}${ROUTINE_REPEAT_UPGRADES.has(x.type)?` #${x.index}`:''} Lv.${x.L} → ${x.L+1}</b><small>${upgradeBenefit(x.type,x.L+1)}</small><em>${fmtCost(x.c)}</em></button>`).join(''):'<div class="notice">建物を建てると強化が解禁</div>';
  el.querySelectorAll('[data-upgrade-id]').forEach(btn=>btn.onclick=()=>upgradeBuildingById(btn.dataset.upgradeId));
};

// Add satisfying local construction/expansion feedback without camera shake.
build=function(type){
  const beforeIds=new Set(state.buildings.map(b=>b.id)),beforeWall=state.palisade.level;
  const result=ROUTINE_CORE_BUILD(type);
  if(type==='palisade'){
    if(state.palisade.level>beforeWall){fxBurst(0,0,'#d2ab70',46,1.7);floatText(0,-28,state.palisade.level===1?'DEFENSE COMPLETE!':`TERRITORY Lv.${state.palisade.level}!`,'#ffe0a0');A.sfx('build');setTimeout(()=>A.sfx('confirm'),180)}
    return result;
  }
  const added=state.buildings.find(b=>!beforeIds.has(b.id));if(added)celebrateBuilding(added,'build');return result;
};

function repairRoutineState(){for(const w of state.workers){ensureWorkerVitals(w);ensureWorkerHome(w);if(!w.totalGathered)w.totalGathered={wood:0,stone:0,food:0};if(typeof w.hiddenAtHome!=='boolean')w.hiddenAtHome=false}forceUiRefresh()}
repairRoutineState();

window.GUILD_ROUTINES=Object.freeze({
  version:ROUTINES_VERSION,
  assignHomes:repairRoutineState,
  upgradeById:upgradeBuildingById,
  lanternRadiusFor:id=>{const b=state.buildings.find(x=>x.id===id);return b?lanternRadius(b):0},
  patrolPoints:()=>exteriorPatrolPoints().map(p=>({...p})),
  workerReport:()=>state.workers.map(w=>({id:w.id,role:w.role,state:w.state,homeId:w.homeId,hidden:!!w.hiddenAtHome,totalGathered:{...(w.totalGathered||{})}}))
});
