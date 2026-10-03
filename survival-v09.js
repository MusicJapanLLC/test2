(()=>{
'use strict';
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
let W=innerWidth,H=innerHeight,D=1,last=performance.now();
let cam={x:0,y:0},pointer=null,origin={x:0,y:0},drag={x:0,y:0},lastDir=null,lastStep=0;
let selectedBuild=null,selectedTarget=null,saveTimer=0,boostTimer=0,workerTick=0,guardTick=0;
const GRID=24,STEP_MS=125,DAY_SECONDS=180,DAYLIGHT_END=.72,NIGHT_END=1;
const SAVE_KEY='guild-infinity-survival-v09',SAVE_BAK=SAVE_KEY+'-backup',DB='guild-infinity-survival-db',STORE='save';

const state={
 version:1,day:1,cycle:0.03,phase:'dawn',wood:0,stone:0,food:0,scrap:0,gold:0,gem:0,
 hp:100,campHp:100,hourglass:0,ticket:0,blueprint:0,boost:1,boostUntil:0,
 survivedNight:false,waveStarted:false,waveCleared:false,
 player:{x:0,y:110,dir:'down',walk:0},workers:[],buildings:[],nodes:[],zombies:[],lastSaved:0
};
const recipes={
 campfire:{name:'焚き火',wood:8,stone:4,hp:120},workbench:{name:'作業台',wood:16,stone:8,hp:180},
 barricade:{name:'バリケード',wood:12,stone:0,hp:140},shelter:{name:'簡易シェルター',wood:24,stone:10,hp:240}
};
const buildSlots=[[-72,54],[72,54],[-120,-36],[120,-36],[0,-96],[-168,84],[168,84],[0,168]];
const lanes=[{x:-390,y:0,dir:'left'},{x:390,y:0,dir:'right'},{x:0,y:-280,dir:'up'},{x:0,y:310,dir:'down'}];

function resize(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);ctx.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sx=x=>W/2+x-cam.x,sy=y=>H/2+y-cam.y;
function snap(v){return Math.round(v/GRID)*GRID}
function toast(t){$('ticker-text').textContent=t;$('ticker').classList.remove('flash');void $('ticker').offsetWidth;$('ticker').classList.add('flash')}
function phaseInfo(c=state.cycle){if(c<.08)return['dawn','DAWN'];if(c<DAYLIGHT_END-.08)return['day','DAY'];if(c<DAYLIGHT_END)return['dusk','DUSK'];return['night','NIGHT']}
function updateHud(){
 $('wood').textContent=Math.floor(state.wood);$('stone').textContent=Math.floor(state.stone);$('food').textContent=Math.floor(state.food);$('hp').textContent=Math.max(0,Math.floor(state.hp));
 $('day-label').textContent='DAY '+state.day;const [,label]=phaseInfo();$('phase-label').textContent=label;
 const minutes=Math.floor(state.cycle*24*60),hh=String(Math.floor(minutes/60)%24).padStart(2,'0'),mm=String(minutes%60).padStart(2,'0');$('time-label').textContent=hh+':'+mm;
 $('worker-count').textContent=state.workers.length+'/200';$('hourglass').textContent=state.hourglass;$('ticket').textContent=state.ticket;$('blueprint').textContent=state.blueprint;$('gem').textContent=state.gem;$('scrap').textContent=state.scrap;
 $('save-status').textContent=state.lastSaved?'SAVED':'AUTO SAVE';
 const unlocked=state.survivedNight&&state.buildings.some(b=>b.type==='campfire'||b.type==='shelter');$('workers-lock').hidden=unlocked;$('worker-controls').hidden=!unlocked;
}

function seedNodes(){
 if(state.nodes.length)return;
 const fixed=[[-190,-100,'tree'],[-145,150,'tree'],[-260,65,'tree'],[215,-130,'tree'],[260,100,'tree'],[150,190,'tree'],[-30,-210,'tree'],[80,230,'tree'],[-310,-140,'tree'],[315,-30,'tree'],[-100,-165,'rock'],[170,-210,'rock'],[-220,220,'rock'],[285,180,'rock'],[35,250,'rock'],[-285,5,'food'],[290,5,'food'],[-175,-220,'food'],[190,235,'food']];
 state.nodes=fixed.map((v,i)=>({id:'n'+i,x:v[0],y:v[1],type:v[2],hp:v[2]==='tree'?3:v[2]==='rock'?3:1,alive:true}));
}
seedNodes();

function drawPixelTree(n){const x=sx(n.x),y=sy(n.y);ctx.fillStyle='#172824';ctx.fillRect(x-10,y+12,22,6);ctx.fillStyle='#5f4630';ctx.fillRect(x-3,y-3,7,22);ctx.fillStyle='#8a633d';ctx.fillRect(x-2,y-3,2,20);ctx.fillStyle='#213d31';ctx.fillRect(x-15,y-25,30,19);ctx.fillStyle='#2d5140';ctx.fillRect(x-11,y-31,22,13);ctx.fillStyle='#486348';ctx.fillRect(x-6,y-28,8,8)}
function drawRock(n){const x=sx(n.x),y=sy(n.y);ctx.fillStyle='#1b2928';ctx.fillRect(x-14,y+9,28,5);ctx.fillStyle='#59615d';ctx.fillRect(x-10,y-5,20,14);ctx.fillStyle='#777d70';ctx.fillRect(x-6,y-9,12,5);ctx.fillStyle='#93927e';ctx.fillRect(x-6,y-5,6,3)}
function drawFood(n){const x=sx(n.x),y=sy(n.y);ctx.fillStyle='#263d2f';ctx.fillRect(x-12,y,24,12);ctx.fillStyle='#496146';ctx.fillRect(x-9,y-5,18,10);ctx.fillStyle='#b95754';for(const d of[-6,0,6])ctx.fillRect(x+d-1,y+1,3,3)}
function drawCampfire(b){const x=sx(b.x),y=sy(b.y),t=performance.now()*.008;ctx.fillStyle='#302118';ctx.fillRect(x-15,y+7,30,5);ctx.fillStyle='#d64b2f';ctx.beginPath();ctx.moveTo(x-8,y+7);ctx.quadraticCurveTo(x-13,y-10,x+Math.sin(t)*3,y-21);ctx.quadraticCurveTo(x+14,y-5,x+7,y+7);ctx.fill();ctx.fillStyle='#ffbf57';ctx.fillRect(x-3,y-7,6,12);light(x,y,90)}
function drawWorkbench(b){const x=sx(b.x),y=sy(b.y);ctx.fillStyle='#2b2119';ctx.fillRect(x-24,y+11,48,5);ctx.fillStyle='#765033';ctx.fillRect(x-21,y-5,42,16);ctx.fillStyle='#a8784d';ctx.fillRect(x-18,y-4,36,3);ctx.fillStyle='#514033';ctx.fillRect(x-17,y+11,4,14);ctx.fillRect(x+13,y+11,4,14);ctx.fillStyle='#a7aaa2';ctx.fillRect(x-5,y-12,15,4)}
function drawBarricade(b){const x=sx(b.x),y=sy(b.y),ratio=clamp(b.hp/b.maxHp,0,1);ctx.fillStyle='#2b211a';ctx.fillRect(x-31,y+12,62,6);for(let i=-24;i<=24;i+=12){ctx.fillStyle='#724b31';ctx.fillRect(x+i-3,y-17,7,32);ctx.fillStyle='#a37349';ctx.fillRect(x+i-2,y-17,2,28)}ctx.fillStyle='#121616';ctx.fillRect(x-26,y+21,52,4);ctx.fillStyle=ratio>.5?'#6fa063':ratio>.25?'#c3944e':'#b75b4c';ctx.fillRect(x-26,y+21,52*ratio,4)}
function drawShelter(b){const x=sx(b.x),y=sy(b.y);ctx.fillStyle='#1e2b29';ctx.fillRect(x-33,y+20,68,7);ctx.fillStyle='#7b573a';ctx.fillRect(x-28,y-14,56,34);ctx.fillStyle='#b48b59';ctx.beginPath();ctx.moveTo(x-37,y-13);ctx.lineTo(x,y-38);ctx.lineTo(x+37,y-13);ctx.closePath();ctx.fill();ctx.fillStyle='#2a201a';ctx.fillRect(x-7,y+1,14,19)}
function drawBuilding(b){if(b.type==='campfire')drawCampfire(b);else if(b.type==='workbench')drawWorkbench(b);else if(b.type==='barricade')drawBarricade(b);else drawShelter(b)}
function drawZombie(z){const x=sx(z.x),y=sy(z.y);ctx.fillStyle='#13211e';ctx.fillRect(x-8,y+12,18,5);ctx.fillStyle=z.hit>0?'#d8d3ad':'#697c61';ctx.fillRect(x-7,y-15,14,20);ctx.fillStyle='#a6a487';ctx.fillRect(x-5,y-22,10,9);ctx.fillStyle='#301f1e';ctx.fillRect(x-4,y-19,2,2);ctx.fillRect(x+2,y-19,2,2);ctx.fillStyle='#433735';ctx.fillRect(x-6,y+5,4,11);ctx.fillRect(x+2,y+5,4,11);const r=clamp(z.hp/z.maxHp,0,1);ctx.fillStyle='#140f0f';ctx.fillRect(x-11,y-29,22,3);ctx.fillStyle='#a34f43';ctx.fillRect(x-11,y-29,22*r,3)}
function light(x,y,r){ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(x,y,5,x,y,r);g.addColorStop(0,'rgba(255,178,72,.25)');g.addColorStop(1,'rgba(255,130,40,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}

function drawGround(){
 const ph=state.phase;const colors=ph==='night'?['#0d1a20','#17231f']:ph==='dusk'?['#263442','#3c4432']:ph==='dawn'?['#304a4b','#405446']:['#35534a','#425d4c'];
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,colors[0]);grad.addColorStop(1,colors[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const ox=(( -cam.x)%32+32)%32,oy=(( -cam.y)%32+32)%32;ctx.strokeStyle='rgba(160,150,115,.035)';ctx.lineWidth=1;for(let x=ox;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=oy;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 // ruined central marker, not a functional building
 const cx=sx(0),cy=sy(0);ctx.fillStyle='#4d4739';ctx.fillRect(cx-18,cy+9,36,5);ctx.fillStyle='#766c52';ctx.fillRect(cx-13,cy+4,8,5);ctx.fillRect(cx+5,cy+4,8,5);
}

function nearestTarget(){
 const p=state.player;let best=null,dist=999;
 for(const n of state.nodes){if(!n.alive)continue;const d=Math.hypot(p.x-n.x,p.y-n.y);if(d<50&&d<dist){best={kind:n.type,obj:n};dist=d}}
 for(const z of state.zombies){if(z.dead)continue;const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<55&&d<dist){best={kind:'zombie',obj:z};dist=d}}
 for(const b of state.buildings){if(b.type!=='barricade'||b.hp>=b.maxHp)continue;const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<55&&d<dist){best={kind:'repair',obj:b};dist=d}}
 selectedTarget=best;return best;
}
function refreshContext(){const t=nearestTarget();const btn=$('context'),main=$('context-main'),sub=$('context-sub');btn.className='context';if(!t){main.textContent='MOVE';sub.textContent='木・岩・食料・敵に近づく';return}btn.classList.add('active');if(t.kind==='tree'){main.textContent='CHOP';sub.textContent='斧で木を切る'}else if(t.kind==='rock'){main.textContent='MINE';sub.textContent='斧の背で石を砕く'}else if(t.kind==='food'){main.textContent='GATHER';sub.textContent='食料を集める'}else if(t.kind==='zombie'){main.textContent='ATTACK';sub.textContent='斧で攻撃';btn.classList.add('attack')}else{main.textContent='REPAIR';sub.textContent='WOOD 3 で修理'}}

function act(){const t=nearestTarget();if(!t){toast('近くに対象がない');return}GuildAudio?.enable?.();
 if(t.kind==='tree'){t.obj.hp--;state.wood+=3;GuildAudio?.sfx?.('confirm');toast('CHOP · WOOD +3');if(t.obj.hp<=0){t.obj.alive=false;state.wood+=2;toast('木を伐採した · WOOD +5')}}
 else if(t.kind==='rock'){t.obj.hp--;state.stone+=2;GuildAudio?.sfx?.('confirm');toast('MINE · STONE +2');if(t.obj.hp<=0)t.obj.alive=false}
 else if(t.kind==='food'){t.obj.alive=false;state.food+=3;GuildAudio?.sfx?.('coin');toast('GATHER · FOOD +3')}
 else if(t.kind==='zombie'){if(t.obj.cool>0)return;t.obj.hp-=28;t.obj.hit=.12;t.obj.cool=.36;GuildAudio?.sfx?.('confirm');toast('AXE HIT · '+Math.max(0,Math.ceil(t.obj.hp))+' HP');if(t.obj.hp<=0)killZombie(t.obj)}
 else if(t.kind==='repair'){if(state.wood<3){toast('WOODが足りない · 3必要');return}state.wood-=3;t.obj.hp=Math.min(t.obj.maxHp,t.obj.hp+35);GuildAudio?.sfx?.('upgrade');toast('BARRICADE REPAIR +35')}
 save();refreshContext();updateHud();
}

function killZombie(z){z.dead=true;state.scrap+=1;let text='ZOMBIE DOWN · SCRAP +1';const r=Math.random();if(r<.03){state.ticket++;text+=' · SUMMON TICKET'}else if(r<.08){state.hourglass++;text+=' · HOURGLASS'}else if(r<.12){state.gem++;text+=' · GEM'}GuildAudio?.sfx?.('coin');toast(text);save()}

function build(type){const r=recipes[type];if(!r)return;if(state.wood<r.wood||state.stone<r.stone){toast(`${r.name} · 素材不足 WOOD ${r.wood} / STONE ${r.stone}`);return}if(type!=='barricade'&&state.buildings.some(b=>b.type===type)){toast(r.name+' は建設済み');return}
 const used=state.buildings.map(b=>b.slot);let candidates=buildSlots.map((p,i)=>({p,i,d:Math.hypot(state.player.x-p[0],state.player.y-p[1])})).filter(v=>!used.includes(v.i)).sort((a,b)=>a.d-b.d);if(!candidates.length){toast('建築スロットがない');return}const slot=candidates[0];state.wood-=r.wood;state.stone-=r.stone;state.buildings.push({id:'b'+Date.now()+Math.random(),type,slot:slot.i,x:slot.p[0],y:slot.p[1],hp:r.hp,maxHp:r.hp,level:1});GuildAudio?.sfx?.('upgrade');toast(r.name+' を建設した');closePanel();save();updateHud()}

function spawnWave(){if(state.waveStarted)return;state.waveStarted=true;state.waveCleared=false;const count=Math.min(4+state.day*2,18);state.zombies=[];for(let i=0;i<count;i++){const l=lanes[i%lanes.length],j=rnd(-50,50);state.zombies.push({id:'z'+i+'-'+Date.now(),x:l.x+(l.dir==='up'||l.dir==='down'?j:0),y:l.y+(l.dir==='left'||l.dir==='right'?j:0),hp:50+state.day*8,maxHp:50+state.day*8,dead:false,attack:0,cool:0,hit:0,lane:l.dir})}toast('NIGHT WAVE · ZOMBIES '+count);$('warning').hidden=false;$('warning').textContent='夜襲開始 · バリケードを守れ';GuildAudio?.setMood?.('night')}
function targetForZombie(z){const barricades=state.buildings.filter(b=>b.type==='barricade'&&b.hp>0);if(barricades.length){const own=barricades.slice().sort((a,b)=>Math.hypot(z.x-a.x,z.y-a.y)-Math.hypot(z.x-b.x,z.y-b.y))[0];if(Math.hypot(z.x,own.x,z.y,own.y)<500)return {kind:'barricade',obj:own,x:own.x,y:own.y}}
 const camp=state.buildings.find(b=>b.type==='campfire'||b.type==='shelter');return {kind:'camp',obj:camp||null,x:camp?.x||0,y:camp?.y||0}}
function updateZombies(dt){let alive=0;for(const z of state.zombies){if(z.dead)continue;alive++;z.cool=Math.max(0,z.cool-dt);z.hit=Math.max(0,z.hit-dt);z.attack=Math.max(0,z.attack-dt);const t=targetForZombie(z);const dx=t.x-z.x,dy=t.y-z.y,d=Math.hypot(dx,dy)||1;if(d>28){const v=(20+state.day*1.4)*dt;z.x+=dx/d*v;z.y+=dy/d*v}else if(z.attack<=0){z.attack=.9;if(t.kind==='barricade'&&t.obj){t.obj.hp=Math.max(0,t.obj.hp-(8+state.day));toast('バリケード被害 · HP '+Math.ceil(t.obj.hp));if(t.obj.hp<=0)toast('バリケードが破壊された')}else{state.campHp=Math.max(0,state.campHp-(6+state.day));if(state.campHp<=0){state.campHp=50;state.wood=Math.floor(state.wood*.7);state.stone=Math.floor(state.stone*.7);toast('拠点が突破された · 資源の30%を失った')}}}
 if(Math.hypot(z.x-state.player.x,z.y-state.player.y)<25&&z.attack<=.3){state.hp=Math.max(0,state.hp-(5+state.day*.6));if(state.hp<=0){state.hp=55;state.player.x=0;state.player.y=100;toast('倒れた · 拠点で目を覚ました')}}}
 if(state.waveStarted&&alive===0&&!state.waveCleared){state.waveCleared=true;state.survivedNight=true;toast('WAVE CLEARED · 夜を生き延びた');GuildAudio?.sfx?.('upgrade');save()}}

function updateWorkers(dt){if(state.phase==='night')return;workerTick+=dt*state.boost;if(workerTick<1)return;workerTick=0;for(const w of state.workers){if(w.role==='woodcutter')state.wood+=.7;else if(w.role==='miner')state.stone+=.45;else if(w.role==='forager')state.food+=.5}guardTick+=1;if(guardTick>=2){guardTick=0;for(const g of state.workers.filter(w=>w.role==='guard')){const z=state.zombies.find(z=>!z.dead&&Math.hypot(z.x,z.y)<180);if(z){z.hp-=12;if(z.hp<=0)killZombie(z)}}}}
function hire(role){const cost=role==='guard'?8:5;if(state.food<cost){toast('FOODが足りない · '+cost+'必要');return}if(state.workers.length>=200){toast('WORKERS 200/200');return}if(!(state.survivedNight&&state.buildings.some(b=>b.type==='campfire'||b.type==='shelter'))){toast('まだ生存者を雇えない');return}state.food-=cost;state.workers.push({id:'w'+Date.now()+Math.random(),role});GuildAudio?.sfx?.('confirm');toast((role==='guard'?'衛兵':'木こり')+'を雇った');save();updateHud()}

function setPhase(){const [p]=phaseInfo();if(p===state.phase)return;state.phase=p;if(p==='dusk'){toast('DUSK · 夜が近い · バリケードを確認');$('warning').hidden=false;$('warning').textContent='日没警告 · 防衛準備'}else if(p==='night'){spawnWave()}else if(p==='dawn'){state.day++;state.waveStarted=false;state.zombies=[];state.campHp=100;state.nodes.forEach(n=>{if(!n.alive&&Math.random()<.55){n.alive=true;n.hp=n.type==='food'?1:3}});$('warning').hidden=true;toast('DAWN · DAY '+state.day+' · 生き延びた');GuildAudio?.setMood?.('day');save()}else if(p==='day'){$('warning').hidden=true;GuildAudio?.setMood?.('day')}}

function tick(dt){const speed=state.phase==='night'?1:state.boost;state.cycle+=dt/DAY_SECONDS*speed;if(state.cycle>=1)state.cycle-=1;setPhase();if(state.phase==='night')updateZombies(dt);updateWorkers(dt);if(state.boostUntil&&Date.now()>=state.boostUntil){state.boost=1;state.boostUntil=0;toast('砂時計の効果が切れた · ×1');save()}for(const z of state.zombies){z.cool=Math.max(0,z.cool-dt);z.hit=Math.max(0,z.hit-dt)}
 // stable camera: no random shake, gentle but short interpolation only
 cam.x+=(state.player.x-cam.x)*Math.min(1,dt*8);cam.y+=(state.player.y-35-cam.y)*Math.min(1,dt*8);refreshContext();saveTimer+=dt;if(saveTimer>=1.1){saveTimer=0;save()}updateHud()}

function draw(){drawGround();
 const objects=[];for(const n of state.nodes)if(n.alive)objects.push({y:n.y,draw:()=>n.type==='tree'?drawPixelTree(n):n.type==='rock'?drawRock(n):drawFood(n)});for(const b of state.buildings)objects.push({y:b.y+18,draw:()=>drawBuilding(b)});for(const w of state.workers){const idx=state.workers.indexOf(w);w.x??=-20+idx*16;w.y??=85+(idx%3)*12;objects.push({y:w.y,draw:()=>GuildGraphics.drawActor(ctx,{x:sx(w.x),y:sy(w.y),dir:'down',frame:(performance.now()/250)|0,color:w.role==='guard'?'#8b5c52':'#6c8057'})})}
 for(const z of state.zombies)if(!z.dead)objects.push({y:z.y,draw:()=>drawZombie(z)});objects.push({y:state.player.y,draw:()=>GuildGraphics.drawActor(ctx,{x:sx(state.player.x),y:sy(state.player.y),dir:state.player.dir,frame:(state.player.walk/2)|0,color:'#9a684e',isPlayer:true})});objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 // phase overlays
 if(state.phase==='night'){ctx.fillStyle='rgba(6,10,25,.28)';ctx.fillRect(0,0,W,H);for(const b of state.buildings)if(b.type==='campfire')light(sx(b.x),sy(b.y),110)}else if(state.phase==='dusk'){ctx.fillStyle='rgba(65,28,20,.1)';ctx.fillRect(0,0,W,H)}
}

function loop(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;tick(dt);draw();requestAnimationFrame(loop)}

function dragDir(dx,dy){if(Math.hypot(dx,dy)<15)return null;if(Math.abs(dx)>Math.abs(dy))return dx>0?'right':'left';return dy>0?'down':'up'}
function stepPlayer(dir){const dirs={up:[0,-GRID],down:[0,GRID],left:[-GRID,0],right:[GRID,0]},d=dirs[dir];if(!d)return;state.player.dir=dir;state.player.x=clamp(state.player.x+d[0],-360,360);state.player.y=clamp(state.player.y+d[1],-250,285);state.player.walk++;GuildAudio?.sfx?.('step')}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();GuildAudio?.enable?.();pointer=e.pointerId;origin={x:e.clientX,y:e.clientY};drag={x:0,y:0};lastDir=null;lastStep=0;try{canvas.setPointerCapture(pointer)}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();drag={x:e.clientX-origin.x,y:e.clientY-origin.y};const d=dragDir(drag.x,drag.y);if(!d)return;const now=performance.now();if(d!==lastDir||now-lastStep>STEP_MS){lastDir=d;lastStep=now;stepPlayer(d)}});
function endPointer(e){if(pointer===null||e.pointerId!==pointer)return;pointer=null;lastDir=null;save()}
canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);

$('context').onclick=act;
$('build-open').onclick=()=>openPanel('build');$('workers-open').onclick=()=>openPanel('workers');$('bag-open').onclick=()=>openPanel('bag');$('panel-close').onclick=closePanel;
function openPanel(name){$('panel').hidden=false;$('panel-title').textContent=name.toUpperCase();for(const id of['build','workers','bag'])$(id+'-panel').hidden=id!==name}
function closePanel(){$('panel').hidden=true}
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));document.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>hire(b.dataset.hire));
$('use-hourglass').onclick=()=>{if(state.hourglass<=0){toast('砂時計がない');return}if(state.boost>=3){toast('最大×3');return}state.hourglass--;state.boost++;state.boostUntil=Date.now()+30000;toast('HOURGLASS · ×'+state.boost+' / 30秒');GuildAudio?.sfx?.('confirm');save()};
$('save-status').onclick=()=>{save();toast('SAVE COMPLETE · '+new Date(state.lastSaved).toLocaleTimeString('ja-JP'))};

function serial(){return JSON.stringify({...state,zombies:[]})}
function dbOpen(){return new Promise((res,rej)=>{if(!indexedDB)return rej();const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>q.result.createObjectStore(STORE);q.onsuccess=()=>res(q.result);q.onerror=rej})}
async function mirror(raw){try{const db=await dbOpen();const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(raw,'latest');tx.oncomplete=()=>db.close()}catch(_){}}
function save(){try{const prev=localStorage.getItem(SAVE_KEY);if(prev)localStorage.setItem(SAVE_BAK,prev);state.lastSaved=Date.now();const raw=serial();localStorage.setItem(SAVE_KEY,raw);mirror(raw);return true}catch(_){return false}}
function valid(s){return s&&s.version===1&&s.player&&Array.isArray(s.nodes)&&Array.isArray(s.buildings)&&Array.isArray(s.workers)&&Number.isFinite(s.cycle)}
async function load(){let s=null;for(const k of[SAVE_KEY,SAVE_BAK]){try{s=JSON.parse(localStorage.getItem(k)||'null')}catch(_){s=null}if(valid(s))break}s&&Object.assign(state,s);state.zombies=[];state.waveStarted=false;state.phase=phaseInfo(state.cycle)[0];seedNodes();updateHud();toast(s?'AUTO SAVE RESTORED':'NEW SURVIVAL · 斧で木を切れ')}
addEventListener('pagehide',save);addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});

load().then(()=>{GuildAudio?.setMood?.(state.phase==='night'?'night':'day');updateHud();requestAnimationFrame(loop)});
})();
