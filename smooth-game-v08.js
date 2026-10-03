(()=>{'use strict';
const c=document.getElementById('c'),x=c.getContext('2d',{alpha:false}),$=id=>document.getElementById(id);
const G=window.GuildGraphics;
const A=window.GuildAudio||{isMuted:true,enable(){},toggle:async()=>{},sfx(){},setMood(){},pause(){},resume(){}};

let W=innerWidth,H=innerHeight,D=.5,last=performance.now(),T=0,worldSpeed=1,speedTimer=0,fever=0,shake=0,saveClock=0,jobCompletions=0;
const NPC_CAP=200,SAVE='guild-v08-system-save',DB='guild-v08-persist',CAP=1e15;
const S={gold:100,wood:30,food:18,gem:0,timeSand:1,ticket:1,ore:0,herb:0,relic:0,pityEpic:0,pityLegendary:0};
const P={x:0,y:120,vx:0,vy:0,dir:'down',walk:0},cam={x:0,y:65},parts=[];
const BASE_BUILDINGS=[
 {id:'guild',x:0,y:0,w:154,h:104,n:'ギルド本部',fixed:true},
 {id:'inn',x:-230,y:110,w:106,h:78,n:'宿屋',fixed:true},
 {id:'quest',x:232,y:92,w:88,h:66,n:'依頼所',fixed:true},
 {id:'forge',x:205,y:-135,w:102,h:74,n:'鍛冶場',fixed:true},
 {id:'store',x:-210,y:-140,w:96,h:70,n:'市場',fixed:true},
 {id:'tower',x:0,y:-205,w:76,h:102,n:'見張り塔',fixed:true}
];
const BUILD_CATALOG=[
 {id:'workshop',n:'工房',w:96,h:70,gold:260,wood:45,unlock:1,desc:'木材生産 +12%',effect:'wood'},
 {id:'garden',n:'薬草園',w:92,h:66,gold:310,wood:35,unlock:2,desc:'食料生産 +15%',effect:'food'},
 {id:'archive',n:'記録庫',w:104,h:76,gold:480,wood:70,unlock:3,desc:'召喚券ドロップ率UP',effect:'ticket'},
 {id:'shrine',n:'星見の祠',w:86,h:72,gold:760,wood:90,unlock:5,desc:'星晶ドロップ率UP',effect:'gem'}
];
const BUILD_PLOTS=[
 {x:-335,y:245},{x:335,y:245},{x:-350,y:-235},{x:350,y:-235},{x:-120,y:285},{x:120,y:285}
];
let buildings=BASE_BUILDINGS.map(v=>({...v}));
let buildingLv=Object.fromEntries(buildings.map(b=>[b.id,1]));
let constructed=new Set();
const pal=['#b64f43','#4e76a4','#71834f','#8e5b9e','#bd9240','#4b8b87','#9d6752','#6e7f9f'];
const RARITIES={
 Common:{weight:60,color:'#9aa69d',bonus:1.00},
 Rare:{weight:28,color:'#6a9cd8',bonus:1.07},
 Epic:{weight:10,color:'#a879d8',bonus:1.17},
 Legendary:{weight:2,color:'#e0b75d',bonus:1.35}
};
const NAME_POOL=['エナ','トーマ','ミラ','ロウ','シエル','ガルド','リナ','ネオ','フィン','ルカ','ノア','エル'];
let npcs=Array.from({length:6},(_,i)=>makeNpc((i-2.5)*28,96+(i%2)*18,i,'Common'));
let pointer=null,firstMove=false,selected=buildings[0],activeTab=null,logSeq=0,lastSavedAt=0;

const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sx=v=>W/2+v-cam.x,sy=v=>H/2+v-cam.y;
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n);
function resize(){W=innerWidth;H=innerHeight;D=.5;c.width=Math.ceil(W*D);c.height=Math.ceil(H*D);x.setTransform(D,0,0,D,0,0);x.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
function r(a,b,w,h,col){x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))}
function sh(a,b,rx,ry,o=.35){x.fillStyle=`rgba(0,0,0,${o})`;x.beginPath();x.ellipse(a,b,rx,ry,0,0,Math.PI*2);x.fill()}
function toast(s){const root=$('toast-stack');if(!root)return;const d=document.createElement('div');d.className='msg';d.textContent=s;root.appendChild(d);setTimeout(()=>d.remove(),2900)}
function logEvent(s){const t=$('ticker');if(!t)return;logSeq++;t.textContent=s;t.dataset.seq=String(logSeq);t.animate?.([{opacity:.25,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'})}

function makeNpc(px=0,py=0,i=0,rarity='Common',name=null){
 const rr=RARITIES[rarity]||RARITIES.Common;
 return{x:px,y:py,tx:0,ty:0,dir:'down',v:rnd(12,18),c:rr.color,bob:0,carry:false,wait:rnd(.6,1.4),stuck:0,rarity,name:name||NAME_POOL[i%NAME_POOL.length],bonus:rr.bonus}
}
function guildLevel(){return Math.max(1,Math.floor(Object.values(buildingLv).reduce((a,b)=>a+b,0)/Math.max(1,Object.keys(buildingLv).length)))}
function hireCost(){return Math.round(42+Math.pow(npcs.length,1.17)*6)}
function facilityCost(id){const lv=buildingLv[id]||1;return Math.round((70+lv*35)*Math.pow(1.34,lv-1))}
function productionBonus(kind){
 let m=1;
 for(const id of constructed){const cat=BUILD_CATALOG.find(v=>v.id===id);if(cat?.effect===kind)m+=kind==='wood'?.12:kind==='food'?.15:0}
 return m
}
function dropBonus(kind){
 let add=0;
 for(const id of constructed){const cat=BUILD_CATALOG.find(v=>v.id===id);if(cat?.effect===kind)add+=kind==='ticket'?.04:kind==='gem'?.025:0}
 return add
}
function blocked(wx,wy){
 if(wx<-470||wx>470||wy<-345||wy>390)return true;
 if(G?.isTerrainBlocked?.(wx,wy))return true;
 return buildings.some(b=>wx>b.x-b.w/2-9&&wx<b.x+b.w/2+13&&wy+13>b.y-b.h/2+27&&wy+13<b.y+b.h/2+9)
}
function moveContinuous(dx,dy){
 const nx=P.x+dx,ny=P.y+dy;
 if(!blocked(nx,P.y))P.x=nx; else P.vx=0;
 if(!blocked(P.x,ny))P.y=ny; else P.vy=0
}
function pickJob(n){
 const pool=buildings.filter(b=>b.id!=='guild');
 const b=pool[(Math.random()*pool.length)|0]||buildings[0];
 n.tx=b.x+rnd(-44,44);n.ty=b.y+b.h/2+34+rnd(-14,14);n.wait=rnd(1.5,3.4);n.stuck=0
}
npcs.forEach(pickJob);

function rollDrop(){
 const ticketChance=.055+dropBonus('ticket');
 const gemChance=.018+dropBonus('gem');
 const v=Math.random();
 if(v<gemChance){const q=1+(Math.random()<.15?2:0);S.gem+=q;logEvent(`遠征で星晶 ×${q} を発見`);return}
 if(v<gemChance+ticketChance){S.ticket++;logEvent('遠征で召喚券を1枚入手');return}
 if(v<gemChance+ticketChance+.11){S.timeSand++;logEvent('遠征で「時砂」を1個入手');return}
 const m=Math.random();
 if(m<.34){S.ore++;if(Math.random()<.25)logEvent('鉱石を持ち帰った')}
 else if(m<.68){S.herb++;if(Math.random()<.25)logEvent('薬草を持ち帰った')}
 else{S.relic++;if(Math.random()<.15)logEvent('古い遺物を発見した')}
}
function completeQuest(n,idx){
 const gl=guildLevel(),q=Math.max(2,Math.floor((3+gl*.75)*n.bonus+Math.random()*3));
 S.gold+=q;S.wood+=rnd(.04,.18)*productionBonus('wood');S.food+=rnd(.04,.16)*productionBonus('food');
 jobCompletions++;rollDrop();
 if(jobCompletions%6===0)logEvent(`${n.name} が帰還　依頼 ${jobCompletions}件完了　+${q}G`)
}

function fire(){
 const a=sx(0),b=sy(82);sh(a,b+11,22,7,.45);r(a-18,b+8,36,5,'#5a3920');
 const q=T*.012;x.fillStyle='#ff7432';x.beginPath();x.moveTo(a-12,b+7);x.quadraticCurveTo(a-17,b-11,a+Math.sin(q)*4,b-27);x.quadraticCurveTo(a+19,b-8,a+10,b+8);x.fill();
 x.fillStyle='#ffd368';x.beginPath();x.moveTo(a-6,b+7);x.quadraticCurveTo(a-5,b-6,a+1,b-16);x.quadraticCurveTo(a+9,b-3,a+5,b+7);x.fill()
}
function update(dt){
 T+=dt*1000;
 if(speedTimer>0){speedTimer=Math.max(0,speedTimer-dt);if(speedTimer===0){worldSpeed=1;updateSpeedUI();logEvent('倍速が切れた　街の時間が通常に戻った')}}
 if(fever>0){fever=Math.max(0,fever-dt);if(fever===0)A.setMood?.('day')}
 const sim=dt*worldSpeed*(fever>0?1.35:1);
 moveContinuous(P.vx*dt,P.vy*dt);
 if(Math.abs(P.vx)+Math.abs(P.vy)>2)P.walk+=dt*10.5;
 cam.x+=(P.x-cam.x)*Math.min(1,dt*4.4);cam.y+=(P.y-55-cam.y)*Math.min(1,dt*4.4);

 const gl=guildLevel();
 S.gold+=sim*(.035+gl*.008+npcs.length*.0023);
 S.wood+=sim*(.0012+(buildingLv.forge||1)*.0005)*productionBonus('wood');
 S.food+=sim*(.0014+(buildingLv.inn||1)*.00055)*productionBonus('food');

 npcs.forEach((n,idx)=>{
  n.bob+=dt*4.8*worldSpeed;
  if(n.wait>0){n.wait-=sim;return}
  const dx=n.tx-n.x,dy=n.ty-n.y,l=Math.hypot(dx,dy)||1;
  if(l<5){
    if(n.carry){completeQuest(n,idx);n.carry=false}
    else if(Math.random()<.48)n.carry=true;
    pickJob(n);return
  }
  n.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  const v=Math.min(l,n.v*sim),mx=dx/l*v,my=dy/l*v,ox=n.x,oy=n.y;
  if(!blocked(n.x+mx,n.y))n.x+=mx;
  if(!blocked(n.x,n.y+my))n.y+=my;
  if(Math.hypot(n.x-ox,n.y-oy)<.15)n.stuck+=sim;else n.stuck=0;
  if(n.stuck>2.8)pickJob(n)
 });
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)parts.splice(i,1)}
 saveClock+=dt;if(saveClock>=3){saveClock=0;save(true)}
}
function render(dt){
 x.save();if(shake>0){x.translate(rnd(-shake,shake),rnd(-shake,shake));shake*=.86}
 if(G?.drawTerrain)G.drawTerrain(x,{width:W,height:H,cam,time:T});else{x.fillStyle='#24413d';x.fillRect(0,0,W,H)}
 const props=G?.getPropDrawables?G.getPropDrawables({width:W,height:H,cam,time:T,ctx:x}):[];
 const drawables=[...props,
 ...buildings.map(b=>({y:b.y+b.h/2,draw:()=>G?.drawBuilding?.(x,{...b,x:sx(b.x),y:sy(b.y)},buildingLv[b.id]||1,T)})),
 ...npcs.map(n=>({y:n.y+14,draw:()=>{const px=sx(n.x),py=sy(n.y);if(px<-40||px>W+40||py<-50||py>H+50)return;G?.drawActor?.(x,{x:px,y:py,dir:n.dir,frame:Math.floor(n.bob)%2,color:n.c,isPlayer:false,carry:n.carry})}})),
 {y:P.y+14,draw:()=>G?.drawActor?.(x,{x:sx(P.x),y:sy(P.y),dir:P.dir,frame:Math.floor(P.walk)%2,color:'#7595a6',isPlayer:true,carry:false})},
 {y:94,draw:fire}];
 drawables.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 for(const p of parts){x.globalAlpha=cl(p.life,0,1);r(sx(p.x),sy(p.y),p.s,p.s,p.c);x.globalAlpha=1}
 if(selected){const px=sx(selected.x),py=sy(selected.y+selected.h/2+14);x.strokeStyle='#e5c570';x.lineWidth=1;x.strokeRect(Math.round(px-12),Math.round(py-5),24,10)}
 G?.drawAtmosphere?.(x,{width:W,height:H,cam,time:T});x.restore();
 $('gold').textContent=fmt(S.gold);$('wood').textContent=fmt(S.wood);$('food').textContent=fmt(S.food);$('gem').textContent=fmt(S.gem);$('level').textContent='Lv.'+guildLevel();
 $('goal-progress').textContent=Math.min(npcs.length,12)+' / 12';$('party-count').textContent=npcs.length+' / '+NPC_CAP;$('hire-cost').textContent=fmt(hireCost())+'G';
 $('quest-count').textContent=fmt(jobCompletions);$('ticket-count').textContent=fmt(S.ticket);$('gem-count').textContent=fmt(S.gem);
 updateContext(false)
}
function loop(now){const dt=Math.min(.034,(now-last)/1000);last=now;update(dt);render(dt);requestAnimationFrame(loop)}
requestAnimationFrame(loop);

function buildingAt(clientX,clientY){
 const wx=clientX-W/2+cam.x,wy=clientY-H/2+cam.y;
 return buildings.find(b=>wx>b.x-b.w/2-22&&wx<b.x+b.w/2+24&&wy>b.y-b.h/2-28&&wy<b.y+b.h/2+28)||null
}
function selectBuilding(b){selected=b;updateContext(true);A.sfx?.('confirm');logEvent(`${b.n}を選択　Lv.${buildingLv[b.id]||1}`)}
function vector(e){
 const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,dist=Math.hypot(dx,dy),dead=7,max=62,k=dist<dead?0:cl((dist-dead)/(max-dead),0,1),nx=dist?dx/dist:0,ny=dist?dy/dist:0,base=112;
 P.vx=nx*base*k;P.vy=ny*base*k;
 if(Math.abs(P.vx)>Math.abs(P.vy))P.dir=P.vx>0?'right':'left';else if(k>0)P.dir=P.vy>0?'down':'up'
}
c.addEventListener('pointerdown',e=>{if(pointer)return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,drag:false};try{c.setPointerCapture(e.pointerId)}catch(_){};A.enable?.();navigator.storage?.persist?.().catch(()=>{})});
c.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();pointer.lastX=e.clientX;pointer.lastY=e.clientY;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8)pointer.drag=true;vector(e);if(!firstMove){firstMove=true;$('hint').style.opacity='.45'}});
function release(e){if(!pointer||e.pointerId!==pointer.id)return;const tap=!pointer.drag,px=pointer.lastX,py=pointer.lastY;P.vx=P.vy=0;pointer=null;if(tap){const b=buildingAt(px,py);if(b)selectBuilding(b)}}
c.addEventListener('pointerup',release);c.addEventListener('pointercancel',release);c.addEventListener('lostpointercapture',e=>{if(pointer&&e.pointerId===pointer.id){P.vx=P.vy=0;pointer=null}});

const held=new Set();
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){held.add(k);e.preventDefault()}});
addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
setInterval(()=>{if(pointer)return;let dx=0,dy=0;if(held.has('a')||held.has('arrowleft'))dx--;if(held.has('d')||held.has('arrowright'))dx++;if(held.has('w')||held.has('arrowup'))dy--;if(held.has('s')||held.has('arrowdown'))dy++;const l=Math.hypot(dx,dy)||1;P.vx=dx/l*112;P.vy=dy/l*112;if(dx||dy)P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');else P.vx=P.vy=0},16);

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
 const lv=buildingLv[selected.id]||1,q=facilityCost(selected.id);
 $('context-title').textContent=selected.n;$('context-sub').textContent=`Lv.${lv} · 強化 ${fmt(q)}G`;$('context-action').textContent='強化';
 if(announce)$('context-action').setAttribute('aria-label',`${selected.n}を強化`)
}
$('context-action').onclick=()=>{
 if(!selected)return;const q=facilityCost(selected.id);
 if(S.gold<q){logEvent(`${selected.n}の強化には ${fmt(q)}G 必要`);A.sfx?.('cancel');return}
 S.gold-=q;buildingLv[selected.id]=(buildingLv[selected.id]||1)+1;shake=3;A.sfx?.('upgrade');
 for(let i=0;i<18;i++)parts.push({x:selected.x+rnd(-45,45),y:selected.y+rnd(-25,35),vx:rnd(-25,25),vy:rnd(-45,-10),life:rnd(.4,.9),c:'#ffd36d',s:rnd(1,3)});
 logEvent(`${selected.n} Lv.${buildingLv[selected.id]}　街が少し育った`);save()
};
$('hire').onclick=()=>{
 if(npcs.length>=NPC_CAP){logEvent(`冒険者は最大 ${NPC_CAP}人`);A.sfx?.('cancel');return}
 const q=hireCost();if(S.gold<q){logEvent(`雇用には ${fmt(q)}G 必要`);A.sfx?.('cancel');return}
 S.gold-=q;const n=makeNpc(P.x+rnd(-16,16),P.y+rnd(-10,10),npcs.length,'Common');pickJob(n);npcs.push(n);A.sfx?.('confirm');
 logEvent(`冒険者 ${n.name} が加入　${npcs.length} / ${NPC_CAP}`);save()
};

function renderBuildList(){
 const root=$('build-list');if(!root)return;root.innerHTML='';
 BUILD_CATALOG.forEach(cat=>{
  const built=constructed.has(cat.id),locked=guildLevel()<cat.unlock,btn=document.createElement('button');
  btn.className='build-card'+(built?' built':'')+(locked?' locked':'');
  btn.innerHTML=`${cat.n}<small>${built?'建築済み':locked?`GUILD Lv.${cat.unlock}で解放`:`${fmt(cat.gold)}G / ${cat.wood}W　${cat.desc}`}</small>`;
  btn.disabled=built||locked;btn.onclick=()=>construct(cat);root.appendChild(btn)
 })
}
function construct(cat){
 const plot=BUILD_PLOTS.find(p=>!buildings.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<80));
 if(!plot){logEvent('空き区画がない　既存施設を育てよう');return}
 if(S.gold<cat.gold||S.wood<cat.wood){logEvent(`${cat.n}には ${cat.gold}G / ${cat.wood}W 必要`);A.sfx?.('cancel');return}
 S.gold-=cat.gold;S.wood-=cat.wood;
 const b={id:cat.id,n:cat.n,x:plot.x,y:plot.y,w:cat.w,h:cat.h,fixed:false};
 buildings.push(b);buildingLv[cat.id]=1;constructed.add(cat.id);selected=b;shake=4;A.sfx?.('upgrade');
 logEvent(`${cat.n}を新しく建てた　新しい街の機能が解放された`);renderBuildList();updateContext(true);save()
}

function rarityRoll(){
 S.pityEpic++;S.pityLegendary++;
 if(S.pityLegendary>=80){S.pityLegendary=0;S.pityEpic=0;return'Legendary'}
 if(S.pityEpic>=20){S.pityEpic=0;const legendary=Math.random()<.12;if(legendary)S.pityLegendary=0;return legendary?'Legendary':'Epic'}
 let rr=Math.random()*100,acc=0;
 for(const [name,v] of Object.entries(RARITIES)){acc+=v.weight;if(rr<acc){if(name==='Epic')S.pityEpic=0;if(name==='Legendary'){S.pityEpic=0;S.pityLegendary=0}return name}}
 return'Common'
}
function gacha(){
 if(npcs.length>=NPC_CAP){logEvent('冒険者枠が200人で満員');A.sfx?.('cancel');return}
 if(S.ticket>0)S.ticket--;
 else if(S.gem>=50)S.gem-=50;
 else{logEvent('召喚券1枚 または 星晶50が必要');A.sfx?.('cancel');return}
 const rarity=rarityRoll(),idx=Math.floor(Math.random()*NAME_POOL.length),name=NAME_POOL[idx],n=makeNpc(P.x+rnd(-16,16),P.y+rnd(-10,10),npcs.length,rarity,name);
 pickJob(n);npcs.push(n);A.sfx?.(rarity==='Legendary'?'upgrade':'confirm');
 toast(`${rarity.toUpperCase()}　${name}`);logEvent(`${rarity}冒険者 ${name} を召喚　生産補正 ×${n.bonus.toFixed(2)}`);save()
}
$('gacha-pull').onclick=gacha;
$('quest-claim').onclick=()=>{
 if(S.food<2){logEvent('即席依頼には FOOD 2 が必要');return}
 S.food-=2;const q=7+Math.floor(Math.random()*8);S.gold+=q;jobCompletions++;rollDrop();A.sfx?.('confirm');logEvent(`短い依頼が完了　+${q}G`);save()
};

function showTab(tab){
 const panel=$('tab-panel');
 if(activeTab===tab&&!panel.hidden){panel.hidden=true;activeTab=null;document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));return}
 activeTab=tab;panel.hidden=false;
 document.querySelectorAll('.tab-view').forEach(v=>v.hidden=v.dataset.view!==tab);
 document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
 if(tab==='build')renderBuildList();
 if(tab==='record')updateSaveUI()
}
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn=>btn.onclick=()=>showTab(btn.dataset.tab));
$('manual-save').onclick=()=>{save();logEvent('街の状態を保存した')};

function snapshot(){
 return{
  v:80,savedAt:Date.now(),S:{...S},P:{x:P.x,y:P.y,dir:P.dir},jobCompletions,
  buildingLv:{...buildingLv},constructed:[...constructed],
  buildings:buildings.map(b=>({...b})),
  npcs:npcs.slice(0,NPC_CAP).map(n=>({x:n.x,y:n.y,c:n.c,rarity:n.rarity,name:n.name,bonus:n.bonus}))
 }
}
function updateSaveUI(){
 if($('last-save'))$('last-save').textContent=lastSavedAt?new Date(lastSavedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'未保存'
}
function openDB(){return new Promise((resolve,reject)=>{try{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('save');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)}catch(e){reject(e)}})}
async function idbPut(data){try{const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction('save','readwrite');tx.objectStore('save').put(data,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(_){}}
async function idbGet(){try{const db=await openDB(),data=await new Promise((resolve,reject)=>{const tx=db.transaction('save','readonly'),req=tx.objectStore('save').get('current');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();return data}catch(_){return null}}
function save(quiet=false){
 const data=snapshot();lastSavedAt=data.savedAt;
 try{localStorage.setItem(SAVE,JSON.stringify(data))}catch(_){}
 idbPut(data);updateSaveUI();
 if(!quiet)logEvent('AUTO SAVE　街を保存した')
}
function validNum(v,a,b){return typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b}
function applySave(s,source='local'){
 if(!s||s.v!==80)return false;
 if(s.S){
  for(const k of ['gold','wood','food','gem','timeSand','ticket','ore','herb','relic','pityEpic','pityLegendary']){
   const val=+s.S[k];if(Number.isFinite(val))S[k]=cl(val,0,CAP)
  }
 }
 if(Array.isArray(s.buildings)&&s.buildings.length>=BASE_BUILDINGS.length){
  buildings=s.buildings.filter(b=>b&&typeof b.id==='string'&&validNum(+b.x,-600,600)&&validNum(+b.y,-500,500)).slice(0,BASE_BUILDINGS.length+BUILD_PLOTS.length).map(b=>({...b,x:+b.x,y:+b.y}));
 }
 buildingLv={...Object.fromEntries(buildings.map(b=>[b.id,1]))};
 if(s.buildingLv)for(const [k,v] of Object.entries(s.buildingLv)){if(Number.isFinite(+v))buildingLv[k]=cl(Math.floor(+v),1,99)}
 constructed=new Set(Array.isArray(s.constructed)?s.constructed.filter(id=>BUILD_CATALOG.some(c=>c.id===id)):[]);
 if(s.P&&validNum(+s.P.x,-470,470)&&validNum(+s.P.y,-345,390)){P.x=+s.P.x;P.y=+s.P.y;P.dir=['up','down','left','right'].includes(s.P.dir)?s.P.dir:'down'}
 if(Array.isArray(s.npcs)&&s.npcs.length){
  npcs.length=0;s.npcs.slice(0,NPC_CAP).forEach((v,i)=>{
   if(!validNum(+v.x,-1000,1000)||!validNum(+v.y,-1000,1000))return;
   const rarity=RARITIES[v.rarity]?v.rarity:'Common',n=makeNpc(+v.x,+v.y,i,rarity,typeof v.name==='string'?v.name:null);
   if(/^#[0-9a-f]{6}$/i.test(v.c||''))n.c=v.c;if(Number.isFinite(+v.bonus))n.bonus=cl(+v.bonus,1,2);pickJob(n);npcs.push(n)
  })
 }
 jobCompletions=cl(Math.floor(+s.jobCompletions||0),0,1e9);lastSavedAt=+s.savedAt||Date.now();worldSpeed=1;speedTimer=0;
 selected=buildings[0]||null;cam.x=P.x;cam.y=P.y-55;updateSpeedUI();updateContext(false);renderBuildList();updateSaveUI();
 if(source==='idb')logEvent('バックアップセーブから復元した');
 return true
}
function applyOffline(savedAt){
 if(!validNum(savedAt,1,Date.now()+60000))return;const sec=cl((Date.now()-savedAt)/1000,0,4*3600);if(sec<30)return;
 const gl=guildLevel(),gain=sec*(.035+gl*.008+npcs.length*.0023)*.2;S.gold=cl(S.gold+gain,0,CAP);S.wood=cl(S.wood+sec*(.0012+(buildingLv.forge||1)*.0005)*.15,0,CAP);S.food=cl(S.food+sec*(.0014+(buildingLv.inn||1)*.00055)*.15,0,CAP);
 setTimeout(()=>logEvent(`留守中の収益　+${fmt(gain)}G`),240)
}
async function load(){
 let local=null;try{local=JSON.parse(localStorage.getItem(SAVE)||'null')}catch(_){}
 if(local&&applySave(local,'local'))applyOffline(+local.savedAt);
 const remote=await idbGet();
 if(remote&&(!local||(+remote.savedAt||0)>(+local.savedAt||0)+500)){applySave(remote,'idb');applyOffline(+remote.savedAt)}
 else if(!local&&!remote)logEvent('新しいギルドを開始　AUTO SAVE 有効')
}
load();
setInterval(()=>save(true),3000);
addEventListener('pagehide',()=>save(true));addEventListener('beforeunload',()=>save(true));
document.addEventListener('visibilitychange',()=>{P.vx=P.vy=0;last=performance.now();if(document.hidden){save(true);A.pause?.()}else{A.resume?.();save(true)}});
window.addEventListener('freeze',()=>save(true),{capture:true});
window.GUILD_API=Object.freeze({getState:()=>({resources:{...S},player:{x:P.x,y:P.y,dir:P.dir},npcs:npcs.length,npcCap:NPC_CAP,speed:worldSpeed,speedTimer,selected:selected?.id,buildingLv:{...buildingLv},constructed:[...constructed],control:'smooth-drag',autosave:'3s+action+background+indexeddb'}),save,load,selectBuilding,construct,gacha});
updateSpeedUI();updateContext(false);renderBuildList();updateSaveUI();
logEvent('v0.8　AUTO SAVE / 200人 / 建築 / レア召喚 / 時砂倍速を統合');
})();