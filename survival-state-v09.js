(function(root,factory){
  const api=factory(root||globalThis);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.GuildSurvivalCore=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  const VERSION=90;
  const KEY='guild-v09-survival-save';
  const BACKUP=KEY+'-backup';
  const PHASES=['day','dusk','night','dawn'];
  const DUR={day:150,dusk:20,night:70,dawn:10};
  const ROLES=['木こり','採集','建築','守備'];
  const RECIPES={
    workbench:{name:'作業台',cost:{wood:12},requires:[]},
    barricade:{name:'バリケード',cost:{wood:10},requires:['workbench']},
    bed:{name:'簡易寝床',cost:{wood:16,food:4},requires:['workbench']},
    recruit:{name:'募集所',cost:{wood:24,food:8},requires:['bed']},
    crate:{name:'木箱',cost:{wood:8},requires:['workbench']}
  };
  const clone=v=>JSON.parse(JSON.stringify(v));
  const now=()=>Date.now();
  const rand=(a=0,b=1)=>a+Math.random()*(b-a);

  function nodes(kind,count,minR,maxR,offset=0){
    const out=[];
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2+offset+rand(-.12,.12),r=rand(minR,maxR);
      out.push({id:kind[0]+i,kind,x:Math.cos(a)*r,y:Math.sin(a)*r+20,amount:3,respawn:0});
    }
    return out;
  }
  function fresh(){
    return {
      version:VERSION,day:1,phase:'day',phaseLeft:DUR.day,
      resources:{gold:0,wood:0,food:0,scrap:0,crystal:0,hourglass:0},
      player:{x:0,y:55,hp:100,maxHp:100,weapon:'axe'},
      camp:{hp:100,maxHp:100},buildings:{},barricadeHp:0,
      survivors:[],nodes:[...nodes('tree',18,150,310),...nodes('bush',10,120,270,.3)],
      zombies:[],drops:[],relics:[],survivedNights:0,lastSavedAt:0,
      boost:{speed:1,expiresAt:0}
    };
  }
  function valid(s){return !!(s&&s.version===VERSION&&s.resources&&s.player&&s.camp&&s.buildings&&Array.isArray(s.survivors)&&Array.isArray(s.nodes)&&Array.isArray(s.zombies)&&Array.isArray(s.drops))}
  function storage(){try{return root.localStorage||null}catch(_){return null}}
  function safeParse(v){try{return JSON.parse(v)}catch(_){return null}}
  function emit(type,detail={}){try{if(root.dispatchEvent&&root.CustomEvent)root.dispatchEvent(new root.CustomEvent('guild:v09',{detail:{type,...detail}}))}catch(_){}}
  let S=fresh(),autosaveClock=0;

  function getState(){return clone(S)}
  function save(reason='auto'){
    const st=storage();S.lastSavedAt=now();
    if(st){try{const old=st.getItem(KEY);if(old)st.setItem(BACKUP,old);st.setItem(KEY,JSON.stringify(S))}catch(e){emit('save-error',{reason,error:String(e)});return false}}
    emit('save',{reason,at:S.lastSavedAt});return true;
  }
  function migrateV08(st){
    if(!st)return null;const old=safeParse(st.getItem('guild-infinity-save-v1'));if(!old)return null;
    const n=fresh();if(Number.isFinite(Number(old.hourglass)))n.resources.hourglass=Math.max(0,Number(old.hourglass));return n;
  }
  function load(){
    const st=storage();let loaded=null;
    if(st){loaded=safeParse(st.getItem(KEY));if(!valid(loaded))loaded=safeParse(st.getItem(BACKUP));if(!valid(loaded))loaded=migrateV08(st)}
    S=valid(loaded)?loaded:fresh();restoreBoost();emit('load',{restored:valid(loaded),state:getState()});return getState();
  }
  function reset(){S=fresh();save('reset');emit('reset',{state:getState()});return getState()}
  function critical(type,fn,detail={}){fn();save(type);emit(type,{...detail,state:getState()});return getState()}
  function canPay(cost){return Object.entries(cost).every(([k,v])=>(S.resources[k]||0)>=v)}
  function pay(cost){for(const[k,v]of Object.entries(cost))S.resources[k]-=v}

  function gather(nodeId){
    const n=S.nodes.find(v=>v.id===nodeId);if(!n||n.amount<=0)return {ok:false,reason:'empty-or-missing'};
    if(n.kind==='tree'){
      n.amount--;if(n.amount>0){emit('axe-hit',{nodeId,hp:n.amount});return {ok:true,finished:false}}
      critical('chop-reward',()=>{n.respawn=45;S.resources.wood+=4},{nodeId,reward:{wood:4}});return {ok:true,finished:true};
    }
    if(n.kind==='bush'){
      const q=n.amount;n.amount=0;n.respawn=38;critical('forage-reward',()=>{S.resources.food+=q},{nodeId,reward:{food:q}});return {ok:true,finished:true};
    }
    return {ok:false,reason:'unsupported-node'};
  }
  function build(id){
    const r=RECIPES[id];if(!r)return {ok:false,reason:'unknown-recipe'};if(S.buildings[id])return {ok:false,reason:'already-built'};
    if(r.requires.some(k=>!S.buildings[k]))return {ok:false,reason:'requires',requires:r.requires.filter(k=>!S.buildings[k])};
    if(!canPay(r.cost))return {ok:false,reason:'resources',cost:clone(r.cost)};
    critical('build',()=>{pay(r.cost);S.buildings[id]={level:1,builtAt:now()};if(id==='barricade')S.barricadeHp=100},{id});return {ok:true,id};
  }
  function repairBarricade(){
    if(!S.buildings.barricade)return {ok:false,reason:'not-built'};if(S.barricadeHp>=100)return {ok:false,reason:'full'};if(S.resources.wood<2)return {ok:false,reason:'resources'};
    critical('repair',()=>{S.resources.wood-=2;S.barricadeHp=Math.min(100,S.barricadeHp+20)});return {ok:true,hp:S.barricadeHp};
  }
  function hire(){
    if(!S.buildings.recruit)return {ok:false,reason:'recruit-post'};if(S.resources.food<6)return {ok:false,reason:'resources',cost:{food:6}};
    const s={id:'s'+now()+Math.random().toString(16).slice(2),role:ROLES[S.survivors.length%ROLES.length],hp:60,maxHp:60,workLeft:rand(3,6)};
    critical('hire',()=>{S.resources.food-=6;S.survivors.push(s)},{survivor:clone(s)});return {ok:true,survivor:clone(s)};
  }
  function assignRole(id,role){
    if(!ROLES.includes(role))return {ok:false,reason:'role'};const s=S.survivors.find(v=>v.id===id);if(!s)return {ok:false,reason:'survivor'};
    critical('role-assignment',()=>{s.role=role},{id,role});return {ok:true};
  }
  function spawnWave(){
    const count=Math.min(18,2+S.day*2),wave=[];
    for(let i=0;i<count;i++){const a=i/count*Math.PI*2+rand(-.25,.25),r=370+rand(0,60);wave.push({id:'z'+now()+i,x:Math.cos(a)*r,y:25+Math.sin(a)*r,hp:3+Math.floor(S.day/3),maxHp:3+Math.floor(S.day/3),speed:15+rand(0,8),attackCd:0})}
    S.zombies.push(...wave);emit('night-wave',{count,wave:clone(wave)});return wave;
  }
  function rollDrop(z){
    const r=Math.random(),type=r<.05?'crystal':r<.13?'hourglass':r<.65?'scrap':null;if(type)S.drops.push({id:'d'+now()+Math.random(),x:z.x,y:z.y,type});return type;
  }
  function damageZombie(id,damage=2){
    const z=S.zombies.find(v=>v.id===id);if(!z)return {ok:false,reason:'zombie'};z.hp-=Math.max(0,damage);emit('zombie-hit',{id,damage,hp:z.hp});
    if(z.hp>0)return {ok:true,killed:false,hp:z.hp};const drop=rollDrop(z);S.zombies=S.zombies.filter(v=>v!==z);save('rare-drop');emit('zombie-killed',{id,drop});return {ok:true,killed:true,drop};
  }
  function collectDrop(id){
    const d=S.drops.find(v=>v.id===id);if(!d)return {ok:false,reason:'drop'};
    critical('rare-drop',()=>{S.drops=S.drops.filter(v=>v!==d);if(d.type==='scrap')S.resources.scrap++;if(d.type==='crystal')S.resources.crystal++;if(d.type==='hourglass')S.resources.hourglass++},{drop:clone(d)});return {ok:true,type:d.type};
  }
  function relicDraw(){
    if(S.resources.crystal<5)return {ok:false,reason:'resources',cost:{crystal:5}};
    const r=Math.random(),rarity=r<.03?'LEGENDARY':r<.13?'EPIC':r<.35?'RARE':r<.70?'UNCOMMON':'COMMON',relic={id:'r'+now()+Math.random().toString(16).slice(2),rarity,at:now()};
    critical('gacha',()=>{S.resources.crystal-=5;S.relics.push(relic)},{relic:clone(relic)});return {ok:true,relic:clone(relic)};
  }
  function restoreBoost(){if(S.boost&&S.boost.expiresAt>now()&&[2,3].includes(S.boost.speed))return;S.boost={speed:1,expiresAt:0}}
  function useHourglass(){
    restoreBoost();if(S.resources.hourglass<=0)return {ok:false,reason:'item'};if(S.boost.speed>=3)return {ok:false,reason:'max'};
    critical('speed-item',()=>{S.resources.hourglass--;S.boost.speed++;S.boost.expiresAt=now()+30000},{speed:S.boost.speed});return {ok:true,speed:S.boost.speed,expiresAt:S.boost.expiresAt};
  }
  function nextPhase(){
    const i=(PHASES.indexOf(S.phase)+1)%PHASES.length;S.phase=PHASES[i];S.phaseLeft=DUR[S.phase];if(S.phase==='night')spawnWave();
    if(S.phase==='day'){S.day++;S.survivedNights++;S.zombies=[];S.camp.hp=Math.min(S.camp.maxHp,S.camp.hp+20);if(S.survivedNights%2===0)S.resources.crystal++}
    save('phase-transition');emit('phase',{phase:S.phase,day:S.day});
  }
  function tickSurvivors(dt){
    for(const s of S.survivors){
      s.workLeft=(s.workLeft||0)-dt;if(s.workLeft>0)continue;s.workLeft=5+rand(0,3);
      if(S.phase==='night'){if(s.role==='守備'&&S.zombies.length)damageZombie(S.zombies[0].id,1);continue}
      if(s.role==='木こり')S.resources.wood++;else if(s.role==='採集')S.resources.food++;else if(s.role==='建築'&&S.buildings.barricade&&S.barricadeHp<100)S.barricadeHp=Math.min(100,S.barricadeHp+4);
    }
  }
  function tickNodes(dt){for(const n of S.nodes)if(n.amount<=0&&(n.respawn-=dt)<=0){n.amount=3;n.respawn=0}}
  function tickZombies(dt){
    if(S.phase!=='night')return;
    for(const z of [...S.zombies]){
      const dx=-z.x,dy=25-z.y,l=Math.hypot(dx,dy)||1,target=S.buildings.barricade&&S.barricadeHp>0?88:20;
      if(l>target+5){z.x+=dx/l*z.speed*dt;z.y+=dy/l*z.speed*dt;continue}
      z.attackCd-=dt;if(z.attackCd>0)continue;z.attackCd=1.2;
      if(S.buildings.barricade&&S.barricadeHp>0){S.barricadeHp=Math.max(0,S.barricadeHp-5);emit('barricade-hit',{hp:S.barricadeHp})}
      else{S.camp.hp=Math.max(0,S.camp.hp-6);emit('camp-hit',{hp:S.camp.hp});if(S.camp.hp===0){S.camp.hp=45;S.player.hp=Math.max(20,S.player.hp-30);emit('camp-breached',{playerHp:S.player.hp})}}
    }
  }
  function tick(realDt){
    restoreBoost();const real=Math.max(0,Math.min(.25,Number(realDt)||0)),dt=real*S.boost.speed;S.phaseLeft-=dt;while(S.phaseLeft<=0)nextPhase();
    tickNodes(dt);tickSurvivors(dt);tickZombies(dt);autosaveClock+=real;if(autosaveClock>=2){autosaveClock=0;save('auto')}return getState();
  }
  function objective(){
    if(!S.buildings.workbench)return `WOOD ${S.resources.wood}/12 → 作業台`;if(!S.buildings.barricade)return `WOOD ${S.resources.wood}/10 → バリケード`;
    if(!S.buildings.bed)return `WOOD16 + FOOD4 → 寝床`;if(!S.buildings.recruit)return `WOOD24 + FOOD8 → 募集所`;if(!S.survivors.length)return 'FOOD6 → 最初の生存者を雇用';
    return S.phase==='night'?'夜襲を耐える':'採取 → 建築 → 役割分担';
  }
  const api={VERSION,KEY,BACKUP,PHASES,DUR,ROLES,RECIPES,fresh,getState,load,save,reset,gather,build,repairBarricade,hire,assignRole,damageZombie,collectDrop,relicDraw,useHourglass,tick,objective};
  return Object.freeze(api);
});