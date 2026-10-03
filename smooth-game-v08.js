(()=>{'use strict';
const c=document.getElementById('c'),x=c.getContext('2d',{alpha:false}),$=id=>document.getElementById(id);
const G=window.GuildGraphics;
const A=window.GuildAudio||{isMuted:true,enable(){},toggle:async()=>{},sfx(){},setMood(){},pause(){},resume(){}};
let W=innerWidth,H=innerHeight,D=.5,last=performance.now(),T=0,worldSpeed=1,speedTimer=0,fever=0,shake=0,saveClock=0,jobCompletions=0;
const NPC_CAP=200, SAVE='guild-v08-bottom-bar', CAP=1e15;
const S={gold:100,wood:30,food:18,lv:1,timeSand:1};
const P={x:0,y:120,vx:0,vy:0,dir:'down',walk:0},cam={x:0,y:65},parts=[];
const B=[
{id:'guild',x:0,y:0,w:154,h:104,n:'ギルド本部'},
{id:'inn',x:-230,y:110,w:106,h:78,n:'宿屋'},
{id:'quest',x:232,y:92,w:88,h:66,n:'依頼所'},
{id:'forge',x:205,y:-135,w:102,h:74,n:'鍛冶場'},
{id:'store',x:-210,y:-140,w:96,h:70,n:'市場'},
{id:'tower',x:0,y:-205,w:76,h:102,n:'見張り塔'}];
const buildingLv=Object.fromEntries(B.map(b=>[b.id,1]));
const pal=['#b64f43','#4e76a4','#71834f','#8e5b9e','#bd9240','#4b8b87','#9d6752','#6e7f9f'];
const npcs=Array.from({length:6},(_,i)=>makeNpc((i-2.5)*28,96+(i%2)*18,i));
let pointer=null,firstMove=false,selected=B[0],logSeq=0;

const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sx=v=>W/2+v-cam.x,sy=v=>H/2+v-cam.y;
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n);
function resize(){W=innerWidth;H=innerHeight;D=.5;c.width=Math.ceil(W*D);c.height=Math.ceil(H*D);x.setTransform(D,0,0,D,0,0);x.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
function r(a,b,w,h,col){x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))}
function sh(a,b,rx,ry,o=.35){x.fillStyle=`rgba(0,0,0,${o})`;x.beginPath();x.ellipse(a,b,rx,ry,0,0,Math.PI*2);x.fill()}
function toast(s){const root=$('toast-stack');if(!root)return;const d=document.createElement('div');d.className='msg';d.textContent=s;root.appendChild(d);setTimeout(()=>d.remove(),2900)}
function logEvent(s){const t=$('ticker');if(!t)return;logSeq++;t.textContent=s;t.dataset.seq=String(logSeq);t.animate?.([{opacity:.25,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'})}
function makeNpc(px=P.x,py=P.y,i=0){return{x:px,y:py,tx:0,ty:0,dir:'down',v:rnd(12,18),c:pal[i%pal.length],bob:0,carry:false,wait:rnd(.6,1.4),stuck:0}}
function hireCost(){return Math.round(45+Math.pow(npcs.length,1.17)*6)}
function facilityCost(id){const lv=buildingLv[id]||1;return Math.round((70+lv*35)*Math.pow(1.34,lv-1))}
function guildLevel(){return Math.max(1,Math.floor(Object.values(buildingLv).reduce((a,b)=>a+b,0)/B.length))}
function blocked(wx,wy){
 if(wx<-460||wx>460||wy<-330||wy>380)return true;
 if(G?.isTerrainBlocked?.(wx,wy))return true;
 return B.some(b=>wx>b.x-b.w/2-9&&wx<b.x+b.w/2+13&&wy+13>b.y-b.h/2+27&&wy+13<b.y+b.h/2+9)
}
function moveContinuous(dx,dy){
 const nx=P.x+dx,ny=P.y+dy;
 if(!blocked(nx,P.y))P.x=nx; else P.vx=0;
 if(!blocked(P.x,ny))P.y=ny; else P.vy=0
}
function pickJob(n){
 const b=B[1+((Math.random()*(B.length-1))|0)];
 n.tx=b.x+rnd(-42,42);n.ty=b.y+b.h/2+34+rnd(-14,14);
 n.wait=rnd(1.1,2.6);n.stuck=0
}
npcs.forEach(pickJob);

function fire(){
 const a=sx(0),b=sy(82);sh(a,b+11,22,7,.45);r(a-18,b+8,36,5,'#5a3920');
 const q=T*.012;x.fillStyle='#ff7432';x.beginPath();x.moveTo(a-12,b+7);x.quadraticCurveTo(a-17,b-11,a+Math.sin(q)*4,b-27);x.quadraticCurveTo(a+19,b-8,a+10,b+8);x.fill();
 x.fillStyle='#ffd368';x.beginPath();x.moveTo(a-6,b+7);x.quadraticCurveTo(a-5,b-6,a+1,b-16);x.quadraticCurveTo(a+9,b-3,a+5,b+7);x.fill()
}
function update(dt){
 T+=dt*1000;
 if(speedTimer>0){speedTimer=Math.max(0,speedTimer-dt);if(speedTimer===0){worldSpeed=1;updateSpeedUI();logEvent('倍速が切れた。街の時間が通常に戻った')}}
 if(fever>0){fever=Math.max(0,fever-dt);if(fever===0)A.setMood?.('day')}
 const sim=dt*worldSpeed*(fever>0?1.6:1);
 moveContinuous(P.vx*dt,P.vy*dt);
 if(Math.abs(P.vx)+Math.abs(P.vy)>2)P.walk+=dt*10.5;
 cam.x+=(P.x-cam.x)*Math.min(1,dt*4.4);cam.y+=(P.y-55-cam.y)*Math.min(1,dt*4.4);

 const gl=guildLevel();
 S.gold+=sim*(.11+gl*.025+npcs.length*.008);
 S.wood+=sim*(.004+buildingLv.forge*.0015);
 S.food+=sim*(.005+buildingLv.inn*.0017);

 npcs.forEach((n,idx)=>{
  n.bob+=dt*4.8*worldSpeed;
  if(n.wait>0){n.wait-=sim;return}
  const dx=n.tx-n.x,dy=n.ty-n.y,l=Math.hypot(dx,dy)||1;
  if(l<5){
    if(n.carry){
      const q=3+Math.floor(gl*.8)+Math.floor(Math.random()*3);
      S.gold+=q;S.wood+=rnd(.05,.22);S.food+=rnd(.04,.18);n.carry=false;jobCompletions++;
      if(jobCompletions%8===0){S.timeSand++;logEvent('依頼の報酬から「時砂」を1個見つけた')}
      else if(Math.random()<.16)logEvent(`${idx+1}番目の冒険者が帰還　+${q}G`)
    }else if(Math.random()<.38)n.carry=true;
    pickJob(n);return
  }
  n.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  const v=Math.min(l,n.v*sim),mx=dx/l*v,my=dy/l*v;
  const ox=n.x,oy=n.y;
  if(!blocked(n.x+mx,n.y))n.x+=mx;
  if(!blocked(n.x,n.y+my))n.y+=my;
  if(Math.hypot(n.x-ox,n.y-oy)<.2)n.stuck+=sim;else n.stuck=0;
  if(n.stuck>2.4)pickJob(n)
 });
 saveClock+=dt;if(saveClock>=15){saveClock=0;save()}
}
function render(dt){
 x.save();if(shake>0){x.translate(rnd(-shake,shake),rnd(-shake,shake));shake*=.86}
 if(G?.drawTerrain)G.drawTerrain(x,{width:W,height:H,cam,time:T});else{x.fillStyle='#24413d';x.fillRect(0,0,W,H)}
 const props=G?.getPropDrawables?G.getPropDrawables({width:W,height:H,cam,time:T,ctx:x}):[];
 const drawables=[...props,
 ...B.map(b=>({y:b.y+b.h/2,draw:()=>G?.drawBuilding?.(x,{...b,x:sx(b.x),y:sy(b.y)},buildingLv[b.id],T)})),
 ...npcs.map(n=>({y:n.y+14,draw:()=>{const px=sx(n.x),py=sy(n.y);if(px<-40||px>W+40||py<-50||py>H+50)return;G?.drawActor?.(x,{x:px,y:py,dir:n.dir,frame:Math.floor(n.bob)%2,color:n.c,isPlayer:false,carry:n.carry})}})),
 {y:P.y+14,draw:()=>G?.drawActor?.(x,{x:sx(P.x),y:sy(P.y),dir:P.dir,frame:Math.floor(P.walk)%2,color:'#7595a6',isPlayer:true,carry:false})},
 {y:94,draw:fire}];
 drawables.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 if(selected){const px=sx(selected.x),py=sy(selected.y+selected.h/2+14);x.strokeStyle='#e5c570';x.lineWidth=1;x.strokeRect(Math.round(px-12),Math.round(py-5),24,10)}
 G?.drawAtmosphere?.(x,{width:W,height:H,cam,time:T});x.restore();
 $('gold').textContent=fmt(S.gold);$('wood').textContent=fmt(S.wood);$('food').textContent=fmt(S.food);$('level').textContent='Lv.'+guildLevel();
 $('goal-progress').textContent=Math.min(npcs.length,12)+' / 12'; updateContext(false)
}
function loop(now){const dt=Math.min(.034,(now-last)/1000);last=now;update(dt);render(dt);requestAnimationFrame(loop)}requestAnimationFrame(loop);

function buildingAt(clientX,clientY){
 const wx=clientX-W/2+cam.x,wy=clientY-H/2+cam.y;
 return B.find(b=>wx>b.x-b.w/2-22&&wx<b.x+b.w/2+24&&wy>b.y-b.h/2-28&&wy<b.y+b.h/2+28)||null
}
function selectBuilding(b){selected=b;updateContext(true);A.sfx?.('confirm');logEvent(`${b.n}を選択　Lv.${buildingLv[b.id]}`)}
function vector(e){
 const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,dist=Math.hypot(dx,dy),dead=7,max=62,k=dist<dead?0:cl((dist-dead)/(max-dead),0,1),nx=dist?dx/dist:0,ny=dist?dy/dist:0,base=116;
 P.vx=nx*base*k;P.vy=ny*base*k;
 if(Math.abs(P.vx)>Math.abs(P.vy))P.dir=P.vx>0?'right':'left';else if(k>0)P.dir=P.vy>0?'down':'up'
}
c.addEventListener('pointerdown',e=>{if(pointer)return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,drag:false};try{c.setPointerCapture(e.pointerId)}catch(_){};A.enable?.()});
c.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();pointer.lastX=e.clientX;pointer.lastY=e.clientY;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8)pointer.drag=true;vector(e);if(!firstMove){firstMove=true;$('hint').style.opacity='.45'}});
function release(e){if(!pointer||e.pointerId!==pointer.id)return;const tap=!pointer.drag,px=pointer.lastX,py=pointer.lastY;P.vx=P.vy=0;pointer=null;if(tap){const b=buildingAt(px,py);if(b)selectBuilding(b)}}
c.addEventListener('pointerup',release);c.addEventListener('pointercancel',release);c.addEventListener('lostpointercapture',e=>{if(pointer&&e.pointerId===pointer.id){P.vx=P.vy=0;pointer=null}});

const held=new Set();
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){held.add(k);e.preventDefault()}});
addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
setInterval(()=>{if(pointer)return;let dx=0,dy=0;if(held.has('a')||held.has('arrowleft'))dx--;if(held.has('d')||held.has('arrowright'))dx++;if(held.has('w')||held.has('arrowup'))dy--;if(held.has('s')||held.has('arrowdown'))dy++;const l=Math.hypot(dx,dy)||1;P.vx=dx/l*116;P.vy=dy/l*116;if(dx||dy)P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');else P.vx=P.vy=0},16);

$('sound').onclick=async()=>{await A.toggle?.();$('sound').textContent=A.isMuted?'♪ OFF':'♪ ON'};
function updateSpeedUI(){const b=$('speed');b.textContent=worldSpeed===1?`×1 ◇${S.timeSand}`:`×${worldSpeed} ${Math.ceil(speedTimer)}s`}
$('speed').onclick=()=>{
 if(worldSpeed===1){
   if(S.timeSand<1){logEvent('倍速には「時砂」が必要　依頼報酬で入手できる');A.sfx?.('cancel');return}
   S.timeSand--;worldSpeed=2;speedTimer=60;A.sfx?.('confirm');logEvent('時砂を使用　60秒だけ ×2')
 }else if(worldSpeed===2){
   if(S.timeSand<1){logEvent('×3には追加の「時砂」が必要');A.sfx?.('cancel');return}
   S.timeSand--;worldSpeed=3;speedTimer=Math.max(speedTimer,45);A.sfx?.('confirm');logEvent('時砂を追加使用　最大速度 ×3')
 }else{worldSpeed=1;speedTimer=0;logEvent('倍速を解除した')}
 updateSpeedUI();save()
};

function updateContext(announce=true){
 if(!selected)return;
 const lv=buildingLv[selected.id],q=facilityCost(selected.id);
 $('context-title').textContent=selected.n;
 $('context-sub').textContent=`Lv.${lv} · 強化 ${fmt(q)}G`;
 $('context-action').textContent='強化';
 if(announce)$('context-action').setAttribute('aria-label',`${selected.n}を強化`)
}
$('context-action').onclick=()=>{
 if(!selected)return;const q=facilityCost(selected.id);
 if(S.gold<q){logEvent(`${selected.n}の強化には ${fmt(q)}G 必要`);A.sfx?.('cancel');return}
 S.gold-=q;buildingLv[selected.id]++;shake=3;A.sfx?.('upgrade');
 logEvent(`${selected.n} Lv.${buildingLv[selected.id]}　街が少し育った`);save()
};
$('hire').onclick=()=>{
 if(npcs.length>=NPC_CAP){logEvent(`冒険者は最大 ${NPC_CAP}人`);A.sfx?.('cancel');return}
 const q=hireCost();if(S.gold<q){logEvent(`雇用には ${fmt(q)}G 必要`);A.sfx?.('cancel');return}
 S.gold-=q;const n=makeNpc(P.x+rnd(-16,16),P.y+rnd(-10,10),npcs.length);pickJob(n);npcs.push(n);A.sfx?.('confirm');
 logEvent(`冒険者が加入　${npcs.length} / ${NPC_CAP}　雇用費 ${fmt(q)}G`);save()
};
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.nav-btn[data-tab]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 const tab=btn.dataset.tab;
 if(tab==='quest')logEvent(`依頼状況　完了 ${jobCompletions}件　時砂 ${S.timeSand}個`);
 if(tab==='party')logEvent(`冒険者 ${npcs.length} / ${NPC_CAP}　次の雇用 ${fmt(hireCost())}G`);
 if(tab==='facility'){const i=(B.indexOf(selected)+1)%B.length;selectBuilding(B[i])}
 if(tab==='record'){save();logEvent('街の記録を保存した');A.sfx?.('confirm')}
});
function save(){try{localStorage.setItem(SAVE,JSON.stringify({v:80,savedAt:Date.now(),S:{...S},P:{x:P.x,y:P.y,dir:P.dir},buildingLv,worldSpeed:1,npcs:npcs.slice(0,NPC_CAP).map(n=>({x:n.x,y:n.y,c:n.c})),jobCompletions}))}catch(_){}}
const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
function applyOffline(savedAt){if(!finite(savedAt,1,Date.now()+60000))return;const sec=cl((Date.now()-savedAt)/1000,0,4*3600);if(sec<30)return;const gl=guildLevel(),gain=sec*(.11+gl*.025+npcs.length*.008)*.22;S.gold=cl(S.gold+gain,0,CAP);S.wood=cl(S.wood+sec*(.004+buildingLv.forge*.0015)*.18,0,CAP);S.food=cl(S.food+sec*(.005+buildingLv.inn*.0017)*.18,0,CAP);setTimeout(()=>logEvent(`留守中の収益　+${fmt(gain)}G`),220)}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');if(!s||s.v!==80)return;if(s.S){S.gold=cl(+s.S.gold||100,0,CAP);S.wood=cl(+s.S.wood||30,0,CAP);S.food=cl(+s.S.food||18,0,CAP);S.timeSand=cl(Math.floor(+s.S.timeSand||0),0,9999)}if(s.P&&finite(+s.P.x,-460,460)&&finite(+s.P.y,-330,380)){P.x=+s.P.x;P.y=+s.P.y;P.dir=['up','down','left','right'].includes(s.P.dir)?s.P.dir:'down'}if(s.buildingLv)B.forEach(b=>buildingLv[b.id]=cl(Math.floor(+s.buildingLv[b.id]||1),1,99));if(Array.isArray(s.npcs)){const valid=s.npcs.slice(0,NPC_CAP).filter(v=>finite(+v.x,-1000,1000)&&finite(+v.y,-1000,1000));if(valid.length){npcs.length=0;valid.forEach((v,i)=>{const n=makeNpc(+v.x,+v.y,i);n.c=/^#[0-9a-f]{6}$/i.test(v.c)?v.c:pal[i%pal.length];pickJob(n);npcs.push(n)})}}jobCompletions=cl(Math.floor(+s.jobCompletions||0),0,1e9);cam.x=P.x;cam.y=P.y-55;applyOffline(+s.savedAt)}catch(_){}}
load();updateSpeedUI();updateContext(false);
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{P.vx=P.vy=0;last=performance.now();if(document.hidden){save();A.pause?.()}else A.resume?.()});
window.GUILD_API=Object.freeze({getState:()=>({resources:{...S},player:{x:P.x,y:P.y,dir:P.dir},npcs:npcs.length,npcCap:NPC_CAP,speed:worldSpeed,speedTimer,selected:selected?.id,buildingLv:{...buildingLv},control:'smooth-drag'}),save,load,selectBuilding});
logEvent('v0.8　ドラッグ移動 / 下部メニュー / 建物強化を統合');
})();