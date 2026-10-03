(()=>{'use strict';
const c=document.getElementById('c');
const api=window.GUILD_API;
if(!c||!api)return;

// Input/Feel lane only: preserve tap-to-route, but turn an intentional drag
// into discrete one-tile steps so the character reads like a classic 2D RPG.
let pointerId=null,lastX=0,lastY=0,lastStepAt=0,dragMode=false;
const START_THRESHOLD=20;
const STEP_THRESHOLD=18;
const STEP_CADENCE=145;

function dominantDir(dx,dy){
  if(Math.abs(dx)<STEP_THRESHOLD&&Math.abs(dy)<STEP_THRESHOLD)return null;
  return Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
}

c.addEventListener('pointerdown',e=>{
  if(pointerId!==null)return;
  pointerId=e.pointerId;
  lastX=e.clientX;
  lastY=e.clientY;
  lastStepAt=performance.now();
  dragMode=false;
},{capture:true});

c.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointerId)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;
  if(!dragMode&&Math.hypot(dx,dy)>=START_THRESHOLD)dragMode=true;
  if(!dragMode)return;

  const dir=dominantDir(dx,dy);
  const now=performance.now();
  if(!dir||now-lastStepAt<STEP_CADENCE){
    // Once a gesture is clearly a drag, prevent the older retarget-every-85ms
    // pointermove handler from turning it into analog-feeling path spam.
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }

  e.preventDefault();
  e.stopImmediatePropagation();
  if(api.move(dir)!==false){
    lastX=e.clientX;
    lastY=e.clientY;
    lastStepAt=now;
    if(navigator.vibrate)try{navigator.vibrate(4)}catch(_){ }
  }
},{capture:true,passive:false});

function end(e){
  if(e.pointerId!==pointerId)return;
  pointerId=null;
  dragMode=false;
}
c.addEventListener('pointerup',end,{capture:true});
c.addEventListener('pointercancel',end,{capture:true});
c.addEventListener('lostpointercapture',end,{capture:true});
})();
