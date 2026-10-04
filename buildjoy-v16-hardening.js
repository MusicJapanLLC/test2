'use strict';

// v1.6 defense hardening
// Owner feedback: wall archers were overpowered, watchtower count was too low,
// civilians still got stuck on rebuilt walls, and a clean reset was missing.
const HARDENING_VERSION='v16.8-hardening';
const HARD_CORE_UPDATE_WORKERS=updateWorkers;
const HARD_CORE_CONTEXT=contextAct;

// More watchtowers, but defense still requires actual construction investment.
if(typeof REPEAT_LIMITS==='object'&&REPEAT_LIMITS.watchtower){
  REPEAT_LIMITS.watchtower.base=4;
  REPEAT_LIMITS.watchtower.perWall=2;
  REPEAT_LIMITS.watchtower.max=16;
}

function hardGateById(id,B=bounds()){return fourGateDefs(B).find(g=>g.id===id)||fourGateDefs(B)[0]}
function hardTargetForWorker(w){
  if(w.role==='guard')return null;
  if(isCivilianHomeTime()){
    const h=ensureWorkerHome(w);return h?homePoint(w,h):{x:0,y:35};
  }
  const n=state.nodes.find(n=>n.id===w.targetId&&n.alive);return n?{x:n.x,y:n.y}:null;
}
function hardStartTransit(o,tx,ty,B){
  const originInside=inside(o.x,o.y,B),targetInside=inside(tx,ty,B),g=nearestGateFor(o,tx,ty);
  o._gateTransit={gateId:g.id,originInside,targetInside,stage:'approach',started:performance.now()};
  return o._gateTransit;
}

// Stable gate routing: once an NPC commits to a gate it keeps that gate until it
// has fully crossed the wall. This prevents frame-to-frame gate switching/oscillation.
route=function(o,tx,ty){
  if(!state.palisade.built||state.palisade.hp<=0){if(o&&o._gateTransit)delete o._gateTransit;return{x:tx,y:ty}}
  const B=bounds(),targetInside=inside(tx,ty,B),nowInside=inside(o.x,o.y,B);
  let tr=o._gateTransit;
  if(nowInside===targetInside&&!tr)return{x:tx,y:ty};
  if(!tr||tr.targetInside!==targetInside)tr=hardStartTransit(o,tx,ty,B);
  const g=hardGateById(tr.gateId,B),entry=tr.originInside?g.in:g.out,exit=tr.originInside?g.out:g.in;
  if(tr.stage==='approach'){
    if(Math.hypot(o.x-entry.x,o.y-entry.y)>10)return{x:entry.x,y:entry.y};
    tr.stage='cross';
  }
  const crossed=inside(o.x,o.y,B)===tr.targetInside;
  if(crossed){delete o._gateTransit;return{x:tx,y:ty}}
  // Keep the movement vector perpendicular to the wall while inside the gate throat.
  if(g.side==='north'||g.side==='south')return{x:g.x,y:exit.y};
  return{x:exit.x,y:g.y};
};

function hardNearWall(o,B=bounds()){return Math.min(Math.abs(o.x-B.l),Math.abs(o.x-B.r),Math.abs(o.y-B.t),Math.abs(o.y-B.b))<24}
function hardSnapToGateLane(o,target){
  if(!state.palisade.built||state.palisade.hp<=0)return false;
  const B=bounds(),g=nearestGateFor(o,target.x,target.y),p=inside(o.x,o.y,B)?g.in:g.out;
  o.x=p.x;o.y=p.y;delete o._gateTransit;o._gateWatch=null;
  return true;
}
function hardMaintainWorkerTraffic(dt){
  if(!state.palisade.built||state.palisade.hp<=0){for(const w of state.workers)delete w._gateTransit;return}
  const B=bounds();
  for(const w of state.workers){
    if(w.dead||w.role==='guard')continue;
    const target=hardTargetForWorker(w);if(!target){w._gateWatch=null;continue}
    const crossing=inside(w.x,w.y,B)!==inside(target.x,target.y,B);
    if(!crossing){w._gateWatch=null;delete w._gateTransit;continue}
    // If a worker somehow reaches a solid wall section, force its next waypoint to a gate.
    if(hardNearWall(w,B)&&!pointInGateOpening(w.x,w.y,B,2)){
      const g=nearestGateFor(w,target.x,target.y),p=inside(w.x,w.y,B)?g.in:g.out;
      w._gateTransit={gateId:g.id,originInside:inside(w.x,w.y,B),targetInside:inside(target.x,target.y,B),stage:'approach',started:performance.now()};
      // Gentle correction along the wall rather than teleporting every frame.
      const dx=p.x-w.x,dy=p.y-w.y,d=Math.hypot(dx,dy)||1,step=Math.min(d,workerMoveSpeed(w.role)*dt*1.35);
      w.x+=dx/d*step;w.y+=dy/d*step;
    }
    if(!w._gateWatch)w._gateWatch={x:w.x,y:w.y,t:0,stuck:0};
    const q=w._gateWatch;q.t+=dt;
    if(q.t>=.45){
      const moved=Math.hypot(w.x-q.x,w.y-q.y);q.stuck=moved<2.2?q.stuck+q.t:0;q.x=w.x;q.y=w.y;q.t=0;
      if(q.stuck>1.15){hardSnapToGateLane(w,target);floatText(w.x,w.y-24,'GATE ROUTE','#d7c58c')}
    }
  }
}

updateWorkers=function(dt){HARD_CORE_UPDATE_WORKERS(dt);hardMaintainWorkerTraffic(dt)};

// Watchtowers remain strong; the automatic wall-mounted archers are removed entirely.
towerCombat=function(dt){
  for(const b of state.buildings.filter(b=>b.type==='watchtower')){
    b.cool=Math.max(0,(b.cool||0)-dt);if(b.cool>0)continue;
    const L=b.level||1,range=220+L*38,z=bestDefenseTarget(b,range);if(!z)continue;
    b.cool=Math.max(.22,.68-L*.075);fireDefenseArrow({x:b.x,y:b.y-22},z,22+L*11,430+L*18);
  }
};

// Keep four visible gates, but remove the former wall-archer posts from the wall art.
drawWall=function(){
  if(!state.palisade.built)return;const B=bounds(),L=state.palisade.level,stone=L>=4,gates=fourGateDefs(B),half=gates[0].half;
  for(let x=B.l;x<=B.r;x+=14){if(Math.abs(x)>half)drawWallSeg(x,B.t,stone);if(Math.abs(x)>half)drawWallSeg(x,B.b,stone)}
  for(let y=B.t+14;y<B.b;y+=14){if(Math.abs(y)>half)drawWallSeg(B.l,y,stone);if(Math.abs(y)>half)drawWallSeg(B.r,y,stone)}
  for(const g of gates){
    const gx=sx(g.x),gy=sy(g.y),c=stone?'#777970':'#61402a',beam=stone?'#a3a398':'#9a6b43';
    if(g.side==='north'||g.side==='south'){
      rect(gx-g.half-5,gy-19,10,36,c);rect(gx+g.half-5,gy-19,10,36,c);rect(gx-g.half+5,gy-13,g.half*2-10,4,beam);
    }else{
      rect(gx-19,gy-g.half-5,36,10,c);rect(gx-19,gy+g.half-5,36,10,c);rect(gx-13,gy-g.half+5,4,g.half*2-10,beam);
    }
  }
};

function hardNormalizeAfterRepair(){
  if(!state.palisade.built||state.palisade.hp<=0)return;
  const B=bounds();
  for(const w of state.workers){
    if(w.dead||w.role==='guard')continue;const target=hardTargetForWorker(w)||{x:0,y:0};
    const embedded=wallCollision(w.x,w.y,7)||(hardNearWall(w,B)&&!pointInGateOpening(w.x,w.y,B,1));
    if(embedded)hardSnapToGateLane(w,target);
  }
  if(wallCollision(state.player.x,state.player.y,8)){
    const g=nearestGateFor(state.player,0,0),p=inside(state.player.x,state.player.y,B)?g.in:g.out;state.player.x=p.x;state.player.y=p.y;
  }
}
contextAct=function(){
  const before=state.palisade.hp;HARD_CORE_CONTEXT();
  if(before<=0&&state.palisade.hp>0){hardNormalizeAfterRepair();toast('防壁修復 · 4ゲートの通路を再確保')}
};
const hardContextBtn=$('context');if(hardContextBtn)hardContextBtn.onclick=contextAct;

function hardInstallUi(){
  const wallDesc=$('wall-desc');if(wallDesc)wallDesc.textContent='北・東・南・西の4ゲート · 全て通行可能';
  const ticker=$('ticker-text');if(ticker)ticker.textContent='DEFENSE HARDENING · 4 GATES / MORE WATCHTOWERS / NO WALL ARCHERS';
  const panel=$('panel-record');if(panel&&!$('reset-game')){
    const wrap=document.createElement('div');wrap.style.cssText='margin:14px 0 4px;padding:12px;border:1px solid #6c4d43;background:#221b19';
    const label=document.createElement('div');label.textContent='SYSTEM';label.style.cssText='font:800 9px monospace;letter-spacing:.16em;color:#9f8f76;margin-bottom:8px';
    const btn=document.createElement('button');btn.id='reset-game';btn.type='button';btn.textContent='RESET SAVE DATA';btn.style.cssText='width:100%;padding:12px;border:1px solid #9b5e50;background:#3a201d;color:#f1c2ad;font:900 11px monospace;letter-spacing:.08em';
    const note=document.createElement('small');note.textContent='現在の街・住民・進行を最初からやり直す';note.style.cssText='display:block;margin-top:7px;color:#9d8d7c;font:9px monospace';
    wrap.append(label,btn,note);panel.appendChild(wrap);
    let armUntil=0;
    btn.onclick=()=>{const now=Date.now();if(now>armUntil){armUntil=now+4000;btn.textContent='もう一度押すと完全RESET';btn.style.background='#5a2822';setTimeout(()=>{if(Date.now()>armUntil&&btn.isConnected){btn.textContent='RESET SAVE DATA';btn.style.background='#3a201d'}},4100);return}hardResetGame(true)};
  }
}
function hardResetGame(reload=true){
  try{localStorage.removeItem(SAVE);localStorage.removeItem(BACKUP)}catch(_){ }
  if(reload)location.reload();return true;
}

hardInstallUi();forceUiRefresh();
window.GUILD_HARDENING=Object.freeze({
  version:HARDENING_VERSION,
  resetNow:hardResetGame,
  watchtowerLimit:()=>({base:REPEAT_LIMITS.watchtower.base,perWall:REPEAT_LIMITS.watchtower.perWall,max:REPEAT_LIMITS.watchtower.max,current:repeatLimit('watchtower')}),
  normalizeTraffic:hardNormalizeAfterRepair,
  route:(o,x,y)=>route(o,x,y),
  report:()=>({version:HARDENING_VERSION,wallArchers:false,gates:fourGateDefs().map(g=>g.id),watchtowerMax:REPEAT_LIMITS.watchtower.max})
});
