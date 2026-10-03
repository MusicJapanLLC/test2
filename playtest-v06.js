(()=>{'use strict';
const c=document.getElementById('c');
const api=window.GUILD_API;
const hint=document.getElementById('hint');
if(!c||!api)return;

document.body.classList.add('playtest-v06');
if(hint)hint.textContent='タップ：移動　ドラッグ：1マス歩行　建物：調べる　MENU：台帳';

const marker=document.createElement('div');
marker.id='touch-marker';
marker.setAttribute('aria-hidden','true');
document.body.appendChild(marker);

let pointerId=null,startX=0,startY=0,lastX=0,lastY=0,lastStepAt=0,dragged=false;
const DRAG_THRESHOLD=18;
const STEP_CADENCE=150;

function pulse(x,y){
  marker.style.left=x+'px';
  marker.style.top=y+'px';
  marker.classList.remove('show');
  void marker.offsetWidth;
  marker.classList.add('show');
}
function dominantDir(dx,dy){
  if(Math.abs(dx)<DRAG_THRESHOLD&&Math.abs(dy)<DRAG_THRESHOLD)return null;
  return Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
}
function firstInteraction(){
  document.body.classList.add('has-interacted');
  if(hint)setTimeout(()=>hint.classList.add('quiet'),1800);
  if(window.GuildAudio&&typeof GuildAudio.resume==='function')GuildAudio.resume();
}

c.addEventListener('pointerdown',e=>{
  if(pointerId!==null)return;
  pointerId=e.pointerId;
  startX=lastX=e.clientX;startY=lastY=e.clientY;lastStepAt=performance.now();dragged=false;
  firstInteraction();
  pulse(e.clientX,e.clientY);
},{capture:true});

c.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointerId)return;
  const now=performance.now(),dx=e.clientX-lastX,dy=e.clientY-lastY;
  const dir=dominantDir(dx,dy);
  if(!dir)return;
  dragged=true;
  if(now-lastStepAt<STEP_CADENCE)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(api.move(dir)!==false){
    lastStepAt=now;
    lastX=e.clientX;lastY=e.clientY;
    pulse(e.clientX,e.clientY);
  }
},{capture:true,passive:false});

function endPointer(e){
  if(e.pointerId!==pointerId)return;
  pointerId=null;
  if(!dragged&&Math.hypot(e.clientX-startX,e.clientY-startY)<DRAG_THRESHOLD)pulse(e.clientX,e.clientY);
}
c.addEventListener('pointerup',endPointer,{capture:true});
c.addEventListener('pointercancel',endPointer,{capture:true});

// Keyboard keeps the same one-tile semantics; this only adds a cleaner visible hint.
window.addEventListener('keydown',firstInteraction,{once:true});

// Small UX fix: when the menu closes, focus returns to the visible MENU button rather than hidden ABXY hooks.
const menuToggle=document.getElementById('menu-toggle');
const menuClose=document.getElementById('menu-close');
if(menuClose&&menuToggle)menuClose.addEventListener('click',()=>requestAnimationFrame(()=>menuToggle.focus()));

// Keep the field readable after the first few seconds.
setTimeout(()=>{if(hint)hint.classList.add('quiet')},6500);
})();
