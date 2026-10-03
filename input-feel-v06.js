(()=>{'use strict';
const c=document.getElementById('c');
const api=window.GUILD_API;
if(!c||!api)return;

// OLD GUILD∞ v0.6 — Input/Feel lane
// Latest user direction: no tap-to-route as the primary movement, no one-tile drag cadence.
// Touch anywhere, drag in a direction, and the hero keeps walking while the finger is held.
// The current game core is still grid-based, so this layer continuously feeds direction
// into the existing movement API until Systems lands true sub-tile continuous movement.

const DEADZONE=11;
const COMMAND_CADENCE=34;
const TAP_MAX_MS=260;
const TAP_SLOP=12;
const buildings=[
  {id:'guild',x:0,y:0,w:154,h:104},
  {id:'inn',x:-230,y:110,w:106,h:78},
  {id:'quest',x:232,y:92,w:88,h:66},
  {id:'forge',x:205,y:-135,w:102,h:74},
  {id:'store',x:-210,y:-140,w:96,h:70},
  {id:'tower',x:0,y:-205,w:76,h:102}
];

let pointerId=null;
let originX=0,originY=0,currentX=0,currentY=0;
let downAt=0,lastCommandAt=0;
let dragging=false;
let raf=0;
let axisPhase=0;

function stopLoop(){
  if(raf)cancelAnimationFrame(raf);
  raf=0;
}

function directionFromVector(dx,dy){
  const ax=Math.abs(dx),ay=Math.abs(dy);
  if(Math.hypot(dx,dy)<DEADZONE)return null;

  // For diagonals, alternate axes instead of hard-locking to one direction.
  // This makes the existing four-direction sprite feel much closer to analog movement.
  if(ax>DEADZONE&&ay>DEADZONE&&Math.min(ax,ay)/Math.max(ax,ay)>.42){
    axisPhase=(axisPhase+1)%3;
    const preferHorizontal=ax>=ay;
    const horizontal=dx>0?'right':'left';
    const vertical=dy>0?'down':'up';
    if(axisPhase===0)return preferHorizontal?vertical:horizontal;
    return preferHorizontal?horizontal:vertical;
  }
  return ax>=ay?(dx>0?'right':'left'):(dy>0?'down':'up');
}

function pump(now){
  if(pointerId===null)return;
  const dx=currentX-originX,dy=currentY-originY;
  const dir=directionFromVector(dx,dy);
  if(dir&&now-lastCommandAt>=COMMAND_CADENCE){
    api.move(dir);
    lastCommandAt=now;
  }
  raf=requestAnimationFrame(pump);
}

function worldPointForBuildingTap(clientX,clientY){
  for(const b of buildings){
    const s=api.worldToScreen(b.x,b.y);
    const left=s.x-b.w/2-16,right=s.x+b.w/2+20;
    const top=s.y-b.h/2-24,bottom=s.y+b.h/2+28;
    if(clientX>=left&&clientX<=right&&clientY>=top&&clientY<=bottom){
      return {x:b.x,y:b.y};
    }
  }
  return null;
}

c.addEventListener('pointerdown',e=>{
  if(pointerId!==null)return;
  pointerId=e.pointerId;
  originX=currentX=e.clientX;
  originY=currentY=e.clientY;
  downAt=performance.now();
  lastCommandAt=0;
  dragging=false;
  axisPhase=0;
  try{c.setPointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();
  e.stopImmediatePropagation();
  stopLoop();
  raf=requestAnimationFrame(pump);
},{capture:true,passive:false});

c.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointerId)return;
  currentX=e.clientX;
  currentY=e.clientY;
  if(!dragging&&Math.hypot(currentX-originX,currentY-originY)>=DEADZONE)dragging=true;
  e.preventDefault();
  e.stopImmediatePropagation();
},{capture:true,passive:false});

function endPointer(e,cancelled=false){
  if(e.pointerId!==pointerId)return;
  const elapsed=performance.now()-downAt;
  const dist=Math.hypot(currentX-originX,currentY-originY);
  const wasTap=!cancelled&&!dragging&&elapsed<=TAP_MAX_MS&&dist<=TAP_SLOP;
  const tapX=currentX,tapY=currentY;

  pointerId=null;
  dragging=false;
  stopLoop();

  // Do not restore ground tap-to-route. Only a direct building tap keeps the old
  // convenience of walking to that building and inspecting it on arrival.
  if(wasTap){
    const hit=worldPointForBuildingTap(tapX,tapY);
    if(hit)api.touchMove(hit.x,hit.y);
  }

  e.preventDefault();
  e.stopImmediatePropagation();
}

c.addEventListener('pointerup',e=>endPointer(e,false),{capture:true,passive:false});
c.addEventListener('pointercancel',e=>endPointer(e,true),{capture:true,passive:false});
c.addEventListener('lostpointercapture',e=>{if(e.pointerId===pointerId){pointerId=null;dragging=false;stopLoop()}},{capture:true});

addEventListener('blur',()=>{pointerId=null;dragging=false;stopLoop()});
})();
