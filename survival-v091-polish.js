(()=>{'use strict';
const c=document.getElementById('game'),ctx=c.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
let W=innerWidth,H=innerHeight,last=performance.now(),time=0,pointer=null,target=null,saveTimer=0;
const DPR=.5,SAVE='guild-v091-polish',BACK='guild-v091-polish-backup',CAP=1e9,NPC_MAX=200;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n),now=()=>Date.now();
const state={v:91,day:1,phase:'day',phaseElapsed:0,dayDuration:120,nightDuration:58,speed:1,speedLeft:0,res:{wood:0,food:2,gold:0,crystal:0,ticket:0,sand:0},core:100,kills:0,harvested:0,pity:0,built:{},lv:{},crew:[],collection:[],revision:0,savedAt:0};
const player={x:0,y:118,vx:0,vy:0,dir:'down',walk:0,hp:5};
// Motion-sickness fix: camera only moves outside this dead zone and is quantized to authored pixel units.
const camera={x:0,y:55};
const CAM_DEAD_X=48,CAM_DEAD_Y=34,CAM_SNAP=2;
const BUILDINGS=[
{id:'workbench',name:'作業台',x:-90,y:12,w:88,h:62,cost:{wood:12},desc:'雇用と仕事割当を解放',unlock:()=>true,type:'shop'},
{id:'barricade',name:'木のバリケード',x:0,y:210,w:122,h:52,cost:{wood:18},desc:'夜襲の最前線。壊れるまで拠点を守る',unlock:()=>state.built.workbench,type:'wall'},
{id:'hut',name:'宿舎',x:116,y:18,w:98,h:72,cost:{wood:26,food:5},desc:'人員上限を増やす',unlock:()=>state.built.workbench,type:'hut'},
{id:'forge',name:'鍛冶場',x:171,y:-105,w:104,h:74,cost:{wood:40,gold:20},desc:'斧と防衛力を強化',unlock:()=>state.built.hut,type:'forge'},
{id:'quest',name:'依頼所',x:-171,y:-108,w:98,h:72,cost:{wood:32,gold:15},desc:'遠征とレア報酬を解放',unlock:()=>state.built.hut,type:'quest'},
{id:'guild',name:'ギルド本部',x:0,y:-132,w:148,h:104,cost:{wood:85,food:20,gold:60},desc:'街の中核。高レア人員ボーナス',unlock:()=>state.built.forge&&state.built.quest,type:'guild'},
{id:'watch',name:'見張り塔',x:230,y:150,w:72,h:100,cost:{wood:60,gold:40},desc:'夜襲への備えと防衛力',unlock:()=>state.built.guild,type:'tower'}
];
const trees=[[-215,155],[-260,75],[-245,-40],[-205,-195],[-122,-236],[108,-232],[230,-170],[268,-50],[248,94],[188,212],[-152,240],[-278,222]].map((p,i)=>({id:'t'+i,type:'tree',x:p[0],y:p[1],hp:3,max:3,respawn:0}));
const berries=[[-145,91],[151,108],[-92,-164],[92,-169]].map((p,i)=>({id:'b'+i,type:'berry',x:p[0],y:p[1],hp:2,max:2,respawn:0}));
const nodes=[...trees,...berries];
let zombies=[],waveSpawned=false,barricadeHp=0,barricadeMax=0;

function resize(){W=innerWidth;H=innerHeight;c.width=Math.ceil(W*DPR);c.height=Math.ceil(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
const sx=x=>Math.round((W/2+x-camera.x)/2)*2,sy=y=>Math.round((H/2+y-camera.y)/2)*2;
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function ellipse(x,y,rx,ry,col){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x1,y1,x2,y2,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x1),Math.round(y1));ctx.lineTo(Math.round(x2),Math.round(y2));ctx.stroke()}
function log(msg){const t=$('ticker');t.textContent=msg;t.animate?.([{opacity:.45},{opacity:1}],{duration:160,easing:'ease-out'})}
function saveFlash(){const e=$('saveState');e.classList.add('flash');setTimeout(()=>e.classList.remove('flash'),170)}
function costText(cost){return Object.entries(cost).map(([k,v])=>`${{wood:'木',food:'食',gold:'G'}[k]||k} ${v}`).join(' / ')}
function canPay(cost){return Object.entries(cost).every(([k,v])=>(state.res[k]||0)>=v)}
function pay(cost){for(const [k,v] of Object.entries(cost))state.res[k]=Math.max(0,(state.res[k]||0)-v)}
function add(k,v){state.res[k]=clamp((state.res[k]||0)+v,0,CAP)}
function lv(id){return Math.max(1,state.lv[id]||1)}
function cap(){return Math.min(NPC_MAX,state.built.hut?8+lv('hut')*8:state.built.workbench?4:0)}
function defense(){return (state.built.barricade?lv('barricade')*8:0)+(state.built.watch?lv('watch')*5:0)+(state.built.forge?lv('forge')*2:0)}
function efficiency(){return 1+state.collection.reduce((a,u)=>a+(u.rarity==='SSR'?.08:u.rarity==='SR'?.035:u.rarity==='R'?.012:0),0)}
function site(id){return BUILDINGS.find(b=>b.id===id)}
function built(){return BUILDINGS.filter(b=>state.built[b.id])}

function drawTerrain(){
  rect(0,0,W,H,state.phase==='night'?'#1b2b33':'#30473d');
  const ox=sx(-520),oy=sy(-410);rect(ox,oy,1040,820,state.phase==='night'?'#22383a':'#354e43');
  for(let yy=-320;yy<=320;yy+=16)for(let xx=-400;xx<=400;xx+=16){const h=Math.abs((xx*17+yy*31)%97);if(h<24){rect(sx(xx),sy(yy),2,6,state.phase==='night'?'#2b4743':'#496352');if(h<8)rect(sx(xx+4),sy(yy+2),2,2,'#8a815c')}}
  // Worn camp clearing and paths, intentionally sparse at start.
  ellipse(sx(0),sy(74),115,70,state.phase==='night'?'#2b3430':'#5d5b45');
  line(sx(0),sy(74),sx(0),sy(218),28,state.phase==='night'?'#31362f':'#66614a');
  line(sx(-95),sy(14),sx(0),sy(74),22,state.phase==='night'?'#31362f':'#66614a');
}
function drawTree(n){if(n.respawn>now())return;const x=sx(n.x),y=sy(n.y),r=n.hp/n.max;ellipse(x,y+13,19,6,'#14252288');rect(x-4,y-11,8,28,'#654930');rect(x-2,y-9,3,26,'#96704b');const c=r>.66?'#46604b':r>.33?'#65704d':'#756747';rect(x-19,y-33,38,14,c);rect(x-13,y-42,26,12,'#5f7656');rect(x-23,y-27,46,11,'#385442')}
function drawBerry(n){if(n.respawn>now())return;const x=sx(n.x),y=sy(n.y);ellipse(x,y+7,14,5,'#15241f88');rect(x-14,y-9,28,17,'#426048');rect(x-10,y-15,20,10,'#557a54');for(const [dx,dy] of [[-7,-6],[1,-8],[8,0],[-2,2]])rect(x+dx,y+dy,3,3,'#b95d6f')}
function roof(x,y,w,col){rect(x-w/2+4,y-28,w-8,16,col);rect(x-w/2,y-22,w,12,col);rect(x-w/2+8,y-32,w-16,4,'#9a8056')}
function building(b){const x=sx(b.x),y=sy(b.y),w=b.w,h=b.h,l=lv(b.id);ellipse(x+5,y+h/2-2,w*.52,9,'#14201f88');
  if(b.type==='wall'){rect(x-w/2,y-8,w,18,'#5d4633');for(let i=-w/2+4;i<w/2;i+=12){rect(x+i,y-16,8,27,'#76573d');rect(x+i,y-18,8,3,'#9c744a')}return}
  if(b.type==='tower'){rect(x-w/2+9,y-h/2+12,w-18,h-14,'#596461');rect(x-w/2+4,y-h/2,w-8,20,'#79807a');rect(x-8,y+h/2-29,16,29,'#302c2a');rect(x-2,y-h/2-25,4,25,'#705037');rect(x+2,y-h/2-23,24,9,'#84473f');return}
  const wall=b.type==='forge'?'#7c7567':'#b6a77f';rect(x-w/2,y-h/2+22,w,h-22,wall);roof(x,y-h/2+20,w,b.type==='guild'?'#40566a':b.type==='forge'?'#464d50':'#82483f');
  rect(x-11,y+h/2-35,22,35,'#3c2f2a');rect(x-8,y+h/2-32,16,32,'#251f20');rect(x-7,y-h/2+31,14,12,'#d5a657');rect(x-5,y-h/2+33,10,8,'#f2d188');
  if(b.type==='guild'){rect(x-w/2+20,y-h/2+36,10,27,'#40566a');rect(x+w/2-30,y-h/2+36,10,27,'#40566a')}
  if(l>1){ctx.fillStyle='#e1bd6a';ctx.font='7px '+getComputedStyle(document.body).fontFamily;ctx.textAlign='center';ctx.fillText('LV '+l,x,y-h/2-7)}
}
function ghost(b){const x=sx(b.x),y=sy(b.y);ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=b.unlock()?'#d9b55e':'#6f786f';ctx.setLineDash([4,4]);ctx.strokeRect(Math.round(x-b.w/2),Math.round(y-b.h/2),b.w,b.h);ctx.setLineDash([]);rect(x-17,y-5,34,10,'#0d2122cc');ctx.fillStyle=b.unlock()?'#e2bf69':'#8c958b';ctx.font='7px '+getComputedStyle(document.body).fontFamily;ctx.textAlign='center';ctx.fillText('建設',x,y+2);ctx.restore()}
function actor(x,y,dir,color,isPlayer=false,walk=0){x=sx(x);y=sy(y);ellipse(x,y+12,isPlayer?15:12,5,'#14201f88');const bob=Math.floor(walk)%2?2:0;rect(x-7,y-29-bob,14,10,isPlayer?'#c7b98e':color);rect(x-8,y-19-bob,16,17,color);rect(x-6,y-2-bob,5,12,'#343d42');rect(x+2,y-2+(bob?0:2),5,10,'#343d42');if(isPlayer){rect(x+8,y-15,2,19,'#d2d7ce');rect(x+7,y+2,5,2,'#aa7d48');rect(x+9,y+4,2,5,'#4a3d35')}}
function zombie(z){actor(z.x,z.y,z.dir,'#657d56',false,z.walk);const x=sx(z.x),y=sy(z.y);rect(x-10,y-38,20,3,'#3b2021');rect(x-10,y-38,20*(z.hp/z.max),3,'#c9615e')}
function drawCamp(){const x=sx(0),y=sy(78);ellipse(x,y+14,26,8,'#15201d88');rect(x-23,y+9,46,5,'#5b3c27');const f=Math.sin(time*.006)*2;ctx.fillStyle='#ec6d32';ctx.beginPath();ctx.moveTo(x-12,y+8);ctx.quadraticCurveTo(x-15,y-8,x+f,y-27);ctx.quadraticCurveTo(x+16,y-7,x+10,y+8);ctx.fill();ctx.fillStyle='#ffd06b';ctx.beginPath();ctx.moveTo(x-5,y+8);ctx.quadraticCurveTo(x-5,y-5,x+1,y-17);ctx.quadraticCurveTo(x+8,y-3,x+5,y+8);ctx.fill()}
function render(){drawTerrain();const list=[];for(const n of nodes)if(n.respawn<=now())list.push({y:n.y+14,fn:()=>n.type==='tree'?drawTree(n):drawBerry(n)});for(const b of BUILDINGS)list.push({y:b.y+b.h/2,fn:()=>state.built[b.id]?building(b):ghost(b)});for(const w of state.crew)list.push({y:w.y+14,fn:()=>actor(w.x,w.y,w.dir,w.color,false,w.walk)});for(const z of zombies)list.push({y:z.y+14,fn:()=>zombie(z)});list.push({y:92,fn:drawCamp});list.push({y:player.y+14,fn:()=>actor(player.x,player.y,player.dir,'#748fa0',true,player.walk)});list.sort((a,b)=>a.y-b.y).forEach(o=>o.fn());
  if(state.phase==='night'){ctx.fillStyle='rgba(8,14,31,.30)';ctx.fillRect(0,0,W,H);const g=ctx.createRadialGradient(sx(0),sy(78),15,sx(0),sy(78),145);g.addColorStop(0,'rgba(255,182,91,.22)');g.addColorStop(1,'rgba(255,182,91,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
}
function updateCamera(){
  const desiredX=player.x,desiredY=player.y-55,dx=desiredX-camera.x,dy=desiredY-camera.y;
  if(dx>CAM_DEAD_X)camera.x+=dx-CAM_DEAD_X;else if(dx<-CAM_DEAD_X)camera.x+=dx+CAM_DEAD_X;
  if(dy>CAM_DEAD_Y)camera.y+=dy-CAM_DEAD_Y;else if(dy<-CAM_DEAD_Y)camera.y+=dy+CAM_DEAD_Y;
  camera.x=Math.round(camera.x/CAM_SNAP)*CAM_SNAP;camera.y=Math.round(camera.y/CAM_SNAP)*CAM_SNAP;
}
function blocked(x,y){if(x<-345||x>345||y<-286||y>302)return true;for(const b of built())if(b.id!=='barricade'&&x>b.x-b.w/2-10&&x<b.x+b.w/2+10&&y+12>b.y-b.h/2+25&&y+12<b.y+b.h/2+8)return true;return false}
function move(dx,dy){const nx=player.x+dx,ny=player.y+dy;if(!blocked(nx,player.y))player.x=nx;else player.vx=0;if(!blocked(player.x,ny))player.y=ny;else player.vy=0}
function nearest(){let best=null,d0=1e9;for(const n of nodes){if(n.respawn>now())continue;const d=Math.hypot(player.x-n.x,player.y-n.y);if(d<58&&d<d0){best={kind:n.type,node:n};d0=d}}for(const z of zombies){const d=Math.hypot(player.x-z.x,player.y-z.y);if(d<64&&d<d0){best={kind:'zombie',z};d0=d}}for(const b of BUILDINGS){const d=Math.hypot(player.x-b.x,player.y-b.y);if(d<93&&d<d0){best={kind:state.built[b.id]?'building':'site',b};d0=d}}return best}
function actionTarget(){target=nearest();const k=$('contextKicker'),t=$('contextTitle'),s=$('contextSub'),a=$('action');a.disabled=false;if(!target){k.textContent='FIELD';t.textContent='周囲を探索';s.textContent='木・食料・建設予定地に近づく';a.textContent='---';a.disabled=true;return}
  if(target.kind==='tree'){k.textContent='RESOURCE';t.textContent='木';s.textContent=`耐久 ${target.node.hp}/${target.node.max} · 斧で伐採`;a.textContent='伐採';return}
  if(target.kind==='berry'){k.textContent='RESOURCE';t.textContent='ベリー';s.textContent=`採取 ${target.node.hp}/${target.node.max}`;a.textContent='採取';return}
  if(target.kind==='zombie'){k.textContent='ENEMY';t.textContent='ゾンビ';s.textContent=`HP ${target.z.hp}/${target.z.max} · 斧で攻撃`;a.textContent='攻撃';return}
  if(target.kind==='site'){k.textContent='BUILD SITE';t.textContent=target.b.name;s.textContent=`${costText(target.b.cost)} · ${target.b.desc}`;a.textContent=target.b.unlock()?'建てる':'LOCK';a.disabled=!target.b.unlock();return}
  k.textContent='FACILITY';t.textContent=`${target.b.name} Lv.${lv(target.b.id)}`;s.textContent=target.b.desc;a.textContent='強化';
}
function harvest(n){n.hp--;state.harvested++;if(n.type==='tree'){add('wood',1);log('斧で木材 +1')}else{add('food',1);log('ベリーを採取　食料 +1')}if(n.hp<=0){n.respawn=now()+(n.type==='tree'?24000:17000);n.hp=n.max}save('harvest')}
function build(b){if(!b.unlock()){log('まだ建てられない');return}if(!canPay(b.cost)){log(`素材不足　${costText(b.cost)}`);return}pay(b.cost);state.built[b.id]=true;state.lv[b.id]=1;if(b.id==='barricade'){barricadeMax=75;barricadeHp=75}log(`${b.name} を建設した`);save('build')}
function upgrade(b){const L=lv(b.id),cost={wood:Math.ceil(12*L*1.55),gold:Math.ceil(5*L*1.45)};if(!canPay(cost)){log(`強化素材不足　${costText(cost)}`);return}pay(cost);state.lv[b.id]=L+1;if(b.id==='barricade'){barricadeMax=50+state.lv[b.id]*25;barricadeHp=barricadeMax}log(`${b.name} → Lv.${state.lv[b.id]}`);save('upgrade')}
function attack(z){z.hp--;if(z.hp<=0){state.kills++;const i=zombies.indexOf(z);if(i>=0)zombies.splice(i,1);const r=Math.random();if(r<.05){add('sand',1);log('ゾンビ撃破　時砂を拾った')}else if(r<.13){add('ticket',1);log('ゾンビ撃破　召喚券を拾った')}else if(r<.31){add('crystal',1);log('ゾンビ撃破　星晶 +1')}else{add('gold',2);log('ゾンビ撃破　2G')}save('kill')}else log('斧で攻撃')}
function onAction(){if(!target)return;if(target.kind==='tree'||target.kind==='berry')harvest(target.node);else if(target.kind==='zombie')attack(target.z);else if(target.kind==='site')build(target.b);else if(target.kind==='building')upgrade(target.b)}
function crewColor(r){return r==='SSR'?'#c69a50':r==='SR'?'#8e6aae':r==='R'?'#5a8798':'#6e7b75'}
function makeCrew(i,rarity='N'){return{id:'c'+Date.now()+'-'+i,x:rnd(-26,26),y:rnd(88,135),dir:'down',walk:0,state:'idle',cool:rnd(0,2),rarity,color:crewColor(rarity)}}
function hire(){if(!state.built.workbench){log('先に作業台が必要');return}if(state.crew.length>=cap()){log(`人員上限 ${cap()}人`);return}const cost={food:2+Math.floor(state.crew.length/4),gold:Math.floor(state.crew.length/6)};if(!canPay(cost)){log(`雇用資源不足　${costText(cost)}`);return}pay(cost);state.crew.push(makeCrew(state.crew.length));log('新しい人員を雇った');save('hire')}
function workerTick(dt){if(state.phase!=='day')return;for(const w of state.crew){w.cool-=dt*state.speed;if(w.cool>0)continue;w.cool=rnd(1.7,3.2);const n=nodes.filter(v=>v.respawn<=now()).sort(()=>Math.random()-.5)[0];if(!n)continue;const dx=n.x-w.x,dy=n.y-w.y,l=Math.hypot(dx,dy)||1;w.x+=dx/l*18;w.y+=dy/l*18;w.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');w.walk+=1;const e=efficiency();if(Math.hypot(w.x-n.x,w.y-n.y)<45){if(n.type==='tree')add('wood',.45*e);else add('food',.24*e)}}}
function spawnWave(){if(waveSpawned)return;waveSpawned=true;const count=Math.min(20,2+Math.floor(state.day*.7));zombies=[];for(let i=0;i<count;i++){const side=i%4,m=315;let x=0,y=0;if(side===0){x=rnd(-m,m);y=-280}else if(side===1){x=335;y=rnd(-250,270)}else if(side===2){x=rnd(-m,m);y=296}else{x=-335;y=rnd(-250,270)}const hp=2+Math.floor(state.day/3);zombies.push({id:'z'+state.day+'-'+i,x,y,hp,max:hp,dir:'down',walk:0,atk:0})}log(`夜襲！ ゾンビ ${count}体　バリケードを守れ`);save('wave')}
function zombieTick(dt){if(state.phase!=='night')return;for(const z of zombies){const dx=-z.x,dy=78-z.y,l=Math.hypot(dx,dy)||1;z.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');z.walk+=dt*5;if(l>30){const v=(12+state.day*.15)*dt*state.speed;z.x+=dx/l*v;z.y+=dy/l*v}else{z.atk-=dt;if(z.atk<=0){z.atk=1.25;const dmg=Math.max(1,4-Math.floor(defense()/12));if(state.built.barricade&&barricadeHp>0){barricadeHp=Math.max(0,barricadeHp-dmg);if(!barricadeHp)log('バリケードが破壊された！')}else{state.core=Math.max(0,state.core-dmg);log(`拠点にダメージ -${dmg}`)}save('damage')}}}}
function phaseChange(){if(state.phase==='day'){state.phase='night';state.phaseElapsed=0;waveSpawned=false;spawnWave()}else{state.phase='day';state.phaseElapsed=0;state.day++;zombies=[];waveSpawned=false;if(state.built.barricade){barricadeMax=50+lv('barricade')*25;barricadeHp=barricadeMax}add('gold',5+state.day*2);log(`朝になった　DAY ${state.day}　生存報酬 +${5+state.day*2}G`)}save('phase')}
function useSpeed(){if(state.res.sand<=0){log('倍速には時砂が必要');return}if(state.speed>=3){log('速度は最大 ×3');return}state.res.sand--;state.speed++;state.speedLeft=30;log(`時砂を使用　×${state.speed} / 30秒`);save('speed')}
function summon(){if(state.res.ticket>0)state.res.ticket--;else if(state.res.crystal>=5)state.res.crystal-=5;else{log('召喚券1枚 または 星晶5個が必要');return}state.pity++;const r=Math.random();let rarity='N';if(state.pity>=20){rarity=Math.random()<.18?'SSR':'SR';state.pity=0}else if(r<.02)rarity='SSR';else if(r<.10)rarity='SR';else if(r<.35)rarity='R';const names=['リオ','ミナ','ガレス','ノア','セラ','ユアン','フィン','エマ','ロウ','ニア'];const unit={name:names[(Math.random()*names.length)|0],rarity};state.collection.push(unit);if(state.built.workbench&&state.crew.length<cap())state.crew.push(makeCrew(state.crew.length,rarity));log(`${rarity} ${unit.name} が加入した`);save('summon')}
function serialize(){return{v:91,revision:++state.revision,savedAt:Date.now(),state:{day:state.day,phase:state.phase,phaseElapsed:state.phaseElapsed,res:{...state.res},core:state.core,kills:state.kills,harvested:state.harvested,pity:state.pity,built:{...state.built},lv:{...state.lv},collection:state.collection},player:{x:player.x,y:player.y,dir:player.dir},crew:state.crew.slice(0,NPC_MAX),nodes:nodes.map(n=>({id:n.id,hp:n.hp,respawn:n.respawn})),zombies,waveSpawned,barricadeHp,barricadeMax}}
function save(reason='auto'){try{const payload=JSON.stringify(serialize()),old=localStorage.getItem(SAVE);if(old)localStorage.setItem(BACK,old);localStorage.setItem(SAVE,payload);state.savedAt=Date.now();saveFlash();return true}catch(e){console.warn('save failed',reason,e);return false}}
function parse(s){try{return JSON.parse(s)}catch{return null}}
function restore(s){if(!s||s.v!==91||!s.state)return false;const q=s.state;state.day=Math.max(1,Math.floor(+q.day||1));state.phase=q.phase==='night'?'night':'day';state.phaseElapsed=Math.max(0,+q.phaseElapsed||0);for(const k of ['wood','food','gold','crystal','ticket','sand'])state.res[k]=clamp(+(q.res?.[k]||0),0,CAP);state.core=clamp(+q.core||100,0,100);state.kills=Math.max(0,+q.kills||0);state.harvested=Math.max(0,+q.harvested||0);state.pity=clamp(+q.pity||0,0,99);state.built=q.built&&typeof q.built==='object'?{...q.built}:{};state.lv=q.lv&&typeof q.lv==='object'?{...q.lv}:{};state.collection=Array.isArray(q.collection)?q.collection.slice(0,500):[];if(s.player){player.x=clamp(+s.player.x||0,-340,340);player.y=clamp(+s.player.y||118,-280,300);player.dir=s.player.dir||'down'}state.crew=Array.isArray(s.crew)?s.crew.slice(0,NPC_MAX).map((w,i)=>({...makeCrew(i,w.rarity||'N'),...w})):[];if(Array.isArray(s.nodes))for(const qn of s.nodes){const n=nodes.find(v=>v.id===qn.id);if(n){n.hp=clamp(+qn.hp||n.max,1,n.max);n.respawn=Math.max(0,+qn.respawn||0)}}zombies=Array.isArray(s.zombies)?s.zombies.slice(0,30):[];waveSpawned=!!s.waveSpawned;barricadeHp=Math.max(0,+s.barricadeHp||0);barricadeMax=Math.max(0,+s.barricadeMax||0);camera.x=player.x;camera.y=player.y-55;return true}
function load(){if(restore(parse(localStorage.getItem(SAVE)))){log('オートセーブから再開した');return true}if(restore(parse(localStorage.getItem(BACK)))){log('バックアップから復旧した');return true}return false}
function mission(){let m='木を12集めて作業台を建てる';if(state.built.workbench&&!state.built.barricade)m='夜までにバリケードを建てる';else if(state.built.barricade&&state.crew.length===0)m='食料を集めて最初の人員を雇う';else if(state.crew.length>0&&!state.built.hut)m='宿舎を建てて人員上限を増やす';else if(state.built.hut&&!state.built.forge)m='鍛冶場を建てて斧を強化する';else if(state.built.forge&&!state.built.quest)m='依頼所を建ててレア報酬を解放する';else if(state.built.quest&&!state.built.guild)m='ギルド本部を建てる';else if(state.built.guild)m='街を育て、夜襲を越えてDAYを進める';$('missionText').textContent=m}
function ui(){for(const k of ['wood','food','gold'])$(k).textContent=fmt(state.res[k]);$('coreHp').textContent=Math.ceil(state.core);$('coreHp').classList.toggle('danger',state.core<35);$('crystal').textContent=fmt(state.res.crystal);$('ticket').textContent=fmt(state.res.ticket);$('sand').textContent=fmt(state.res.sand);$('dayLabel').textContent=String(state.day).padStart(2,'0');$('phaseLabel').textContent=state.phase==='day'?'DAY':'NIGHT';const total=state.phase==='day'?state.dayDuration:state.nightDuration,left=Math.max(0,total-state.phaseElapsed);$('clock').textContent=`${state.phase==='day'?'昼':'夜'} ${Math.floor(left/60)}:${Math.floor(left%60).toString().padStart(2,'0')}`;$('speed').textContent=state.speed===1?`×1 砂${state.res.sand}`:`×${state.speed} ${Math.ceil(state.speedLeft)}s`;document.body.classList.toggle('night',state.phase==='night');mission();actionTarget()}
function update(dt){time+=dt*1000;if(state.speedLeft>0){state.speedLeft=Math.max(0,state.speedLeft-dt);if(!state.speedLeft){state.speed=1;log('時砂の効果が切れた');save('speed-end')}}const sim=dt*state.speed;state.phaseElapsed+=sim;if(state.phaseElapsed>=(state.phase==='day'?state.dayDuration:state.nightDuration))phaseChange();move(player.vx*dt,player.vy*dt);if(Math.abs(player.vx)+Math.abs(player.vy)>3)player.walk+=dt*11;updateCamera();workerTick(dt);zombieTick(dt);if(state.core<=0){state.core=55;state.phase='day';state.phaseElapsed=0;zombies=[];add('wood',-Math.min(state.res.wood,6));log('拠点壊滅…木材を失い、朝から再建する');save('defeat')}saveTimer+=dt;if(saveTimer>=1.5){saveTimer=0;save('heartbeat')}}
function loop(t){const dt=Math.min(.033,(t-last)/1000);last=t;update(dt);render();ui();requestAnimationFrame(loop)}
function vector(e){const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,d=Math.hypot(dx,dy),dead=8,max=70,k=d<dead?0:clamp((d-dead)/(max-dead),0,1),nx=d?dx/d:0,ny=d?dy/d:0,base=118;player.vx=nx*base*k;player.vy=ny*base*k;if(Math.abs(player.vx)>Math.abs(player.vy))player.dir=player.vx>0?'right':'left';else if(k>0)player.dir=player.vy>0?'down':'up'}
c.addEventListener('pointerdown',e=>{if(pointer)return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};try{c.setPointerCapture(e.pointerId)}catch{}});
c.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();vector(e)});
function release(e){if(!pointer||e.pointerId!==pointer.id)return;player.vx=player.vy=0;pointer=null}
c.addEventListener('pointerup',release);c.addEventListener('pointercancel',release);
$('action').addEventListener('pointerdown',e=>{e.preventDefault();onAction()});$('speed').addEventListener('pointerdown',e=>{e.preventDefault();useSpeed()});
function showSheet(tab){const title=$('sheetTitle'),body=$('sheetBody');$('sheet').hidden=false;let html='';if(tab==='build'){title.textContent='建築';html='<p class="sheetNote">素材を集めて、何もない野営地を自分の街に変えていく</p><div class="sheetGrid">'+BUILDINGS.map(b=>`<div class="sheetRow"><div><b>${b.name} ${state.built[b.id]?`Lv.${lv(b.id)}`:''}</b><small>${b.desc}<br>${state.built[b.id]?'強化可能':costText(b.cost)}</small></div><button data-build="${b.id}" ${!b.unlock()&&!state.built[b.id]?'disabled':''}>${state.built[b.id]?'強化':'建設'}</button></div>`).join('')+'</div>'}
else if(tab==='crew'){title.textContent='人員';html=`<p class="sheetNote">作業台完成後に雇用可能。昼は自動で採取する</p><div class="sheetRow"><div><b>人員 ${state.crew.length} / ${cap()}</b><small>SSR/SR人員は全体効率に補正</small></div><button id="hireBtn" ${!state.built.workbench?'disabled':''}>雇う</button></div>`}
else if(tab==='bag'){title.textContent='バッグ';html=`<p class="sheetNote">夜襲や依頼から手に入る希少アイテム</p><div class="sheetGrid"><div class="sheetRow"><div><b>◇ 星晶 ${state.res.crystal}</b><small>5個で召喚1回</small></div><span></span></div><div class="sheetRow"><div><b>召喚券 ${state.res.ticket}</b><small>1枚で召喚1回</small></div><span></span></div><div class="sheetRow"><div><b>時砂 ${state.res.sand}</b><small>30秒の倍速。最大×3</small></div><span></span></div></div>`}
else if(tab==='summon'){title.textContent='召喚';html=`<p class="sheetNote">N 65% / R 25% / SR 8% / SSR 2% · 20回でSR以上保証</p><div class="sheetRow"><div><b>召喚</b><small>券1枚 または 星晶5個</small></div><button id="summonBtn">召喚する</button></div><div class="sheetGrid" style="margin-top:7px">${state.collection.slice(-8).reverse().map(u=>`<div class="sheetRow"><div><b class="rarity-${u.rarity}">${u.rarity} ${u.name}</b><small>コレクション加入済み</small></div><span></span></div>`).join('')}</div>`}
else{title.textContent='目標';html=`<p class="sheetNote">DAY ${state.day} · ${state.phase==='day'?'昼':'夜'} · 撃破 ${state.kills} · 採取 ${state.harvested}</p><div class="sheetRow"><div><b>${$('missionText').textContent}</b><small>街は最初から存在しない。採取・建築・雇用・防衛で育てる</small></div><span></span></div>`}
body.innerHTML=html;body.querySelectorAll('[data-build]').forEach(btn=>btn.onclick=()=>{const b=site(btn.dataset.build);state.built[b.id]?upgrade(b):build(b);showSheet('build')});const h=$('hireBtn');if(h)h.onclick=()=>{hire();showSheet('crew')};const s=$('summonBtn');if(s)s.onclick=()=>{summon();showSheet('summon')}}
document.querySelectorAll('.dock button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();showSheet(b.dataset.tab)}));$('sheetClose').onclick=()=>{$('sheet').hidden=true};$('sheet').addEventListener('pointerdown',e=>{if(e.target===$('sheet'))$('sheet').hidden=true});$('sound').onclick=()=>{$('sound').textContent=$('sound').textContent.includes('OFF')?'♪ ON':'♪ OFF'};
setInterval(()=>save('interval'),2000);addEventListener('pagehide',()=>save('pagehide'));addEventListener('beforeunload',()=>save('beforeunload'));document.addEventListener('visibilitychange',()=>{player.vx=player.vy=0;last=performance.now();if(document.hidden)save('hidden')});
const q=new URLSearchParams(location.search);if(q.get('demo')){localStorage.removeItem(SAVE);localStorage.removeItem(BACK);if(q.get('demo')==='fortified'||q.get('demo')==='night'){Object.assign(state.res,{wood:31,food:12,gold:26,crystal:4,ticket:1,sand:2});state.built={workbench:true,barricade:true,hut:true};state.lv={workbench:1,barricade:2,hut:1};barricadeMax=100;barricadeHp=84;state.crew=[makeCrew(0,'R'),makeCrew(1,'N'),makeCrew(2,'SR')]}if(q.get('demo')==='night'){state.phase='night';state.day=4;state.phaseElapsed=8;spawnWave()}}
else load();
if(!localStorage.getItem(SAVE))save('initial');requestAnimationFrame(loop);log(state.crew.length?'前回の続きから再開':'斧一本から開始　木を集めて作業台を建てよう');
window.GUILD_V091={state:()=>JSON.parse(JSON.stringify({day:state.day,phase:state.phase,res:state.res,core:state.core,crew:state.crew.length,cap:cap(),built:state.built,kills:state.kills,speed:state.speed})),save:()=>save('api'),load,hire,summon};
})();
