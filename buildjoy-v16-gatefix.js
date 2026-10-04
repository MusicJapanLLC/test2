'use strict';

// Deterministic worker gate traversal. Loaded after hardening.js.
const GATEFIX_VERSION='v16.9-gatefix';

function gfStep(o,tx,ty,speed,dt){
  const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy),step=Math.max(0,speed*dt);
  if(d<=step+1.5){o.x=tx;o.y=ty;o.anim=(o.anim||0)+dt*7;return true}
  if(d>0){o.x+=dx/d*step;o.y+=dy/d*step;o.anim=(o.anim||0)+dt*7}
  return false;
}
function gfBegin(w,tx,ty,B){
  const g=nearestGateFor(w,tx,ty),originInside=inside(w.x,w.y,B),targetInside=inside(tx,ty,B);
  w._gateTransit={gateId:g.id,originInside,targetInside,stage:'approach'};return w._gateTransit;
}
function gfMove(w,tx,ty,speed,dt){
  if(!state.palisade.built||state.palisade.hp<=0){delete w._gateTransit;return gfStep(w,tx,ty,speed,dt)}
  const B=bounds(),nowInside=inside(w.x,w.y,B),targetInside=inside(tx,ty,B);let tr=w._gateTransit;
  if(nowInside===targetInside&&!tr)return gfStep(w,tx,ty,speed,dt);
  if(!tr||tr.targetInside!==targetInside)tr=gfBegin(w,tx,ty,B);
  const g=hardGateById(tr.gateId,B),entry=tr.originInside?g.in:g.out,exit=tr.originInside?g.out:g.in;
  if(tr.stage==='approach'){
    if(gfStep(w,entry.x,entry.y,speed*1.08,dt)){tr.stage='cross';w.x=entry.x;w.y=entry.y}
    return false;
  }
  if(gfStep(w,exit.x,exit.y,speed*1.18,dt)){
    w.x=exit.x;w.y=exit.y;delete w._gateTransit;return false;
  }
  return false;
}
function gfGoHome(w,dt){
  const h=ensureWorkerHome(w);w.targetId=null;
  if(!h){w.state='returning-camp';w.hiddenAtHome=false;gfMove(w,0,35,workerMoveSpeed(w.role)*1.3,dt);return}
  const p=homePoint(w,h),d=dist(w,p);
  if(d>9){w.state='returning-home';w.hiddenAtHome=false;gfMove(w,p.x,p.y,workerMoveSpeed(w.role)*1.4,dt)}
  else{w.x=p.x;w.y=p.y;delete w._gateTransit;w.state='sleeping';w.hiddenAtHome=true;w.hp=Math.min(w.maxHp,w.hp+4*dt)}
}

// Replace only the civilian movement path; combat, guard sectors, yields and tower logic stay intact.
updateWorkers=function(dt){
  if(ROUTINE_lastPhase!==state.phase){
    if(state.phase==='dusk')toast('DUSK · 村人は4ゲートから帰宅、衛兵は担当区画を警戒');
    if((state.phase==='dawn'||state.phase==='day')&&(ROUTINE_lastPhase==='night'||ROUTINE_lastPhase==='dusk'))toast('DAWN · 村人が4ゲートから仕事へ戻る');
    ROUTINE_lastPhase=state.phase;
  }
  const claimed=new Set();for(const w of state.workers)if(w.targetId&&w.role!=='guard')claimed.add(w.targetId);
  for(const w of state.workers){
    ensureWorkerVitals(w);ensureWorkerHome(w);if(w.dead)continue;w.cool=Math.max(0,(w.cool||0)-dt);w.hit=Math.max(0,(w.hit||0)-dt);
    if(w.role==='guard'){guardDefendSector(w,dt);continue}
    if(isCivilianHomeTime()){
      const threat=nearestWorkerEnemy(w,30);if(threat&&inside(threat.x,threat.y,bounds())&&workerCombat(w,dt)){w.hiddenAtHome=false;continue}
      gfGoHome(w,dt);continue;
    }
    w.hiddenAtHome=false;if(workerCombat(w,dt))continue;
    const type=workerResourceType(w);let n=state.nodes.find(n=>n.id===w.targetId&&n.alive);
    if(!n){n=nearestNode(w,type,claimed);w.targetId=n?.id||null;if(n)claimed.add(n.id)}
    if(!n){delete w._gateTransit;w.state='idle';continue}
    if(dist(w,n)>31){w.state='moving';gfMove(w,n.x,n.y,workerMoveSpeed(w.role),dt)}
    else{
      delete w._gateTransit;w.state='working';w.work=(w.work||0)+dt*(.70+.30*state.morale/100);
      if(w.work>workerCycle(w.role)){w.work=0;const key=resourceStateKey(type),before=state[key];hitNode(n,'worker');recordRemoteYield(w,type,before);if(!n.alive)w.targetId=null}
    }
  }
  towerCombat(dt);
};

window.GUILD_GATEFIX=Object.freeze({version:GATEFIX_VERSION,move:(w,x,y,s,dt)=>gfMove(w,x,y,s,dt)});
