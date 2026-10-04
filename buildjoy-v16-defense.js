'use strict';

// v1.6 defense / gate / guard-sector polish
// Loaded after progression.js. Keeps the current game and tightens defense behavior only.
const DEFENSE_VERSION='v16.7-defense';
const DEFENSE_CORE_CONTEXT=contextAct;

function fourGateDefs(B=bounds()){
  const half=Math.max(18,B.gap*.42);
  return[
    {id:'south',side:'south',x:0,y:B.b,in:{x:0,y:B.b-22},out:{x:0,y:B.b+25},half},
    {id:'north',side:'north',x:0,y:B.t,in:{x:0,y:B.t+22},out:{x:0,y:B.t-25},half},
    {id:'west',side:'west',x:B.l,y:0,in:{x:B.l+22,y:0},out:{x:B.l-25,y:0},half},
    {id:'east',side:'east',x:B.r,y:0,in:{x:B.r-22,y:0},out:{x:B.r+25,y:0},half}
  ];
}
function nearestGateFor(o,tx,ty){
  const B=bounds(),a=inside(o.x,o.y,B),gates=fourGateDefs(B);let best=gates[0],score=Infinity;
  for(const g of gates){const from=a?g.in:g.out,to=a?g.out:g.in;const s=Math.hypot(o.x-from.x,o.y-from.y)+Math.hypot(tx-to.x,ty-to.y);if(s<score){score=s;best=g}}
  return best;
}
route=function(o,tx,ty){
  if(!state.palisade.built||state.palisade.hp<=0)return{x:tx,y:ty};
  const B=bounds(),a=inside(o.x,o.y,B),b=inside(tx,ty,B);if(a===b)return{x:tx,y:ty};
  const g=nearestGateFor(o,tx,ty),from=a?g.in:g.out,to=a?g.out:g.in;
  if(Math.hypot(o.x-from.x,o.y-from.y)>11)return from;
  return to;
};

function pointInGateOpening(x,y,B=bounds(),pad=0){
  for(const g of fourGateDefs(B)){
    const open=Math.max(8,g.half-pad);
    if((g.side==='north'||g.side==='south')&&Math.abs(x-g.x)<open&&Math.abs(y-g.y)<18)return true;
    if((g.side==='east'||g.side==='west')&&Math.abs(y-g.y)<open&&Math.abs(x-g.x)<18)return true;
  }
  return false;
}
wallCollision=function(x,y,r=9){
  if(!state.palisade.built||state.palisade.hp<=0)return false;
  const B=bounds(),th=9;if(pointInGateOpening(x,y,B,r*.35))return false;
  if(x+r>B.l-th&&x-r<B.r+th){if(y+r>B.t-th&&y-r<B.t+th)return true;if(y+r>B.b-th&&y-r<B.b+th)return true}
  if(y+r>B.t-th&&y-r<B.b+th){if(x+r>B.l-th&&x-r<B.l+th)return true;if(x+r>B.r-th&&x-r<B.r+th)return true}
  return false;
};

function wallPerimeterPoints(){
  const B=bounds(),m=25,pts=[],xs=[.12,.26,.40,.60,.74,.88].map(t=>lerp(B.l+m,B.r-m,t)),ys=[.12,.26,.40,.60,.74,.88].map(t=>lerp(B.t+m,B.b-m,t));
  for(const x of xs)if(Math.abs(x)>B.gap*.55)pts.push({x,y:B.t+m,side:'north'});
  for(const y of ys)if(Math.abs(y)>B.gap*.55)pts.push({x:B.r-m,y,side:'east'});
  for(const x of xs.slice().reverse())if(Math.abs(x)>B.gap*.55)pts.push({x,y:B.b-m,side:'south'});
  for(const y of ys.slice().reverse())if(Math.abs(y)>B.gap*.55)pts.push({x:B.l+m,y,side:'west'});
  return pts.length?pts:[{x:0,y:0,side:'center'}];
}
function guardRoster(){return state.workers.filter(w=>w.role==='guard'&&!w.dead)}
function guardAssignment(w){
  const guards=guardRoster(),idx=Math.max(0,guards.findIndex(g=>g.id===w.id)),pts=wallPerimeterPoints(),count=Math.max(1,guards.length);
  const start=Math.floor(idx*pts.length/count),end=Math.max(start,Math.floor((idx+1)*pts.length/count)-1),out=[];
  for(let i=start;i<=end;i++)out.push(pts[i%pts.length]);
  if(out.length===1)out.push(pts[(start+1)%pts.length]);
  return out;
}
function guardThreat(w,assigned){
  const B=bounds(),wallAlive=state.palisade.built&&state.palisade.hp>0;let best=null,score=Infinity;
  for(const e of state.enemies){if(e.dead)continue;const d=dist(w,e);if(wallAlive){const nearAssigned=assigned.some(p=>Math.hypot(e.x-p.x,e.y-p.y)<220),insideEnemy=inside(e.x,e.y,B);if(!insideEnemy&&!nearAssigned)continue}
    let civilianDanger=300;for(const c of state.workers){if(c.dead||c.role==='guard')continue;civilianDanger=Math.min(civilianDanger,dist(e,c))}
    const s=d*.45+civilianDanger; if(s<score){score=s;best=e}
  }
  return best;
}
function guardDefendSector(w,dt){
  const assigned=guardAssignment(w);if(!assigned.length)return false;const target=guardThreat(w,assigned),B=bounds(),wallAlive=state.palisade.built&&state.palisade.hp>0;
  if(target){const targetInside=inside(target.x,target.y,B);w.targetId=target.id;w.hiddenAtHome=false;
    if(!wallAlive||targetInside){w.state='intercept';const d=dist(w,target);if(d>30){move(w,target.x,target.y,workerMoveSpeed('guard')*1.32,dt);return true}if(w.cool<=0){w.cool=.44;w.swing=1;damageEnemy(target,22+(state.buildings.find(b=>b.type==='barracks')?.level||1)*6,w.x,w.y,true)}return true}
    if(dist(w,target)<215){w.state='guard-fire';if(w.cool<=0){w.cool=.58;state.projectiles.push({kind:'arrow',x:w.x,y:w.y-14,tx:target.x,ty:target.y,target,speed:350,damage:18+(state.buildings.find(b=>b.type==='barracks')?.level||1)*5,life:1.4});A.sfx('hit')}return true}
  }
  const p=assigned[(w.guardStep||0)%assigned.length];w.state='sector-patrol';w.targetId=null;w.hiddenAtHome=false;if(move(w,p.x,p.y,workerMoveSpeed('guard')*.98,dt)||dist(w,p)<9)w.guardStep=((w.guardStep||0)+1)%assigned.length;return true;
}

updateWorkers=function(dt){
  if(ROUTINE_lastPhase!==state.phase){if(state.phase==='dusk')toast('DUSK · 村人は帰宅、衛兵は担当区画を警戒');if((state.phase==='dawn'||state.phase==='day')&&(ROUTINE_lastPhase==='night'||ROUTINE_lastPhase==='dusk'))toast('DAWN · 村人が仕事へ戻る');ROUTINE_lastPhase=state.phase}
  const claimed=new Set();for(const w of state.workers)if(w.targetId&&w.role!=='guard')claimed.add(w.targetId);
  for(const w of state.workers){ensureWorkerVitals(w);ensureWorkerHome(w);if(w.dead)continue;w.cool=Math.max(0,(w.cool||0)-dt);w.hit=Math.max(0,(w.hit||0)-dt);
    if(w.role==='guard'){guardDefendSector(w,dt);continue}
    if(isCivilianHomeTime()){const threat=nearestWorkerEnemy(w,30);if(threat&&inside(threat.x,threat.y,bounds())&&workerCombat(w,dt)){w.hiddenAtHome=false;continue}civilianGoHomeFast(w,dt);continue}
    w.hiddenAtHome=false;if(workerCombat(w,dt))continue;const type=workerResourceType(w);let n=state.nodes.find(n=>n.id===w.targetId&&n.alive);
    if(!n){n=nearestNode(w,type,claimed);w.targetId=n?.id||null;if(n)claimed.add(n.id)}if(!n){w.state='idle';continue}
    if(dist(w,n)>31){w.state='moving';const rt=route(w,n.x,n.y);move(w,rt.x,rt.y,workerMoveSpeed(w.role),dt)}else{w.state='working';w.work=(w.work||0)+dt*(.70+.30*state.morale/100);if(w.work>workerCycle(w.role)){w.work=0;const key=resourceStateKey(type),before=state[key];hitNode(n,'worker');recordRemoteYield(w,type,before);if(!n.alive)w.targetId=null}}
  }
  towerCombat(dt);
};

function enemyPriorityForDefense(e){let civilian=999;for(const w of state.workers){if(w.dead||w.role==='guard')continue;civilian=Math.min(civilian,dist(e,w))}return civilian*.86+Math.hypot(e.x,e.y)*.14}
function bestDefenseTarget(origin,range){return state.enemies.filter(e=>!e.dead&&dist(origin,e)<range).sort((a,b)=>enemyPriorityForDefense(a)-enemyPriorityForDefense(b)||dist(origin,a)-dist(origin,b))[0]||null}
function fireDefenseArrow(origin,target,damage,speed=390){state.projectiles.push({kind:'arrow',x:origin.x,y:origin.y-18,tx:target.x,ty:target.y,target,speed,damage,life:1.8});A.sfx('hit')}

towerCombat=function(dt){
  for(const b of state.buildings.filter(b=>b.type==='watchtower')){b.cool=Math.max(0,(b.cool||0)-dt);if(b.cool>0)continue;const L=b.level||1,range=220+L*38,z=bestDefenseTarget(b,range);if(!z)continue;b.cool=Math.max(.22,.68-L*.075);fireDefenseArrow({x:b.x,y:b.y-22},z,22+L*11,430+L*18)}
  wallArcherCombat(dt);
};
function wallArcherCombat(dt){
  if(!state.palisade.built||state.palisade.hp<=0||state.palisade.level<2)return;
  if(!Number.isFinite(state.palisade.archerCool))state.palisade.archerCool=0;state.palisade.archerCool=Math.max(0,state.palisade.archerCool-dt);if(state.palisade.archerCool>0)return;
  const B=bounds(),L=state.palisade.level,posts=[{x:0,y:B.t+3},{x:B.r-3,y:0},{x:0,y:B.b-3},{x:B.l+3,y:0}];let best=null,post=null,score=Infinity;
  for(const p of posts){const z=bestDefenseTarget(p,185+L*20);if(!z)continue;const s=enemyPriorityForDefense(z);if(s<score){score=s;best=z;post=p}}
  if(!best)return;state.palisade.archerCool=Math.max(.32,.92-L*.085);fireDefenseArrow(post,best,10+L*5,400+L*15);
}

// Repairing a destroyed wall should never trap workers: snap anyone touching the rebuilt edge to the nearest gate lane.
function normalizeWallCrossers(){if(!state.palisade.built||state.palisade.hp<=0)return;const B=bounds();for(const w of state.workers){if(w.dead)continue;const nearEdge=Math.min(Math.abs(w.x-B.l),Math.abs(w.x-B.r),Math.abs(w.y-B.t),Math.abs(w.y-B.b))<15;if(!nearEdge)continue;const target=w.role==='guard'?{x:0,y:0}:(state.nodes.find(n=>n.id===w.targetId&&n.alive)||{x:w.x,y:w.y});const g=nearestGateFor(w,target.x,target.y),side=inside(w.x,w.y,B)?g.in:g.out;w.x=side.x;w.y=side.y}}
contextAct=function(){const before=state.palisade.hp;DEFENSE_CORE_CONTEXT();if(before<=0&&state.palisade.hp>0)normalizeWallCrossers()};
const contextBtn=$('context');if(contextBtn)contextBtn.onclick=contextAct;

// Four visible openings match collision/routing exactly.
drawWall=function(){
  if(!state.palisade.built)return;const B=bounds(),L=state.palisade.level,stone=L>=4,gates=fourGateDefs(B),half=gates[0].half;
  for(let x=B.l;x<=B.r;x+=14){if(Math.abs(x)>half)drawWallSeg(x,B.t,stone);if(Math.abs(x)>half)drawWallSeg(x,B.b,stone)}
  for(let y=B.t+14;y<B.b;y+=14){if(Math.abs(y)>half)drawWallSeg(B.l,y,stone);if(Math.abs(y)>half)drawWallSeg(B.r,y,stone)}
  for(const g of gates){const gx=sx(g.x),gy=sy(g.y),c=stone?'#777970':'#61402a',beam=stone?'#a3a398':'#9a6b43';if(g.side==='north'||g.side==='south'){rect(gx-g.half-5,gy-19,10,36,c);rect(gx+g.half-5,gy-19,10,36,c);rect(gx-g.half+5,gy-13,g.half*2-10,4,beam)}else{rect(gx-19,gy-g.half-5,36,10,c);rect(gx-19,gy+g.half-5,36,10,c);rect(gx-13,gy-g.half+5,4,g.half*2-10,beam)}}
  if(L>=2)for(const p of[{x:0,y:B.t+3},{x:B.r-3,y:0},{x:0,y:B.b-3},{x:B.l+3,y:0}]){const x=sx(p.x),y=sy(p.y);rect(x-5,y-18,10,10,'#4b3828');rect(x-2,y-22,4,7,'#d8bd78')}
};

function defenseReport(){const guards=guardRoster();return{version:DEFENSE_VERSION,gates:fourGateDefs().map(g=>g.id),guardCount:guards.length,assignments:guards.map(g=>({id:g.id,points:guardAssignment(g).length,state:g.state})),wallArchers:state.palisade.level>=2,watchtowers:state.buildings.filter(b=>b.type==='watchtower').map(b=>({level:b.level,damage:22+(b.level||1)*11,range:220+(b.level||1)*38}))}}
window.GUILD_DEFENSE=Object.freeze({version:DEFENSE_VERSION,report:defenseReport,gates:()=>fourGateDefs().map(g=>({...g})),guardAssignment:id=>{const g=state.workers.find(w=>w.id===id);return g?guardAssignment(g).map(p=>({...p})):[]},wallCollision:(x,y,r=9)=>wallCollision(x,y,r),normalizeWallCrossers});
