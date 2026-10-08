'use strict';

// v1.6 stability/debug pass
// Fix repeat-building, touch freezes and resource respawn without changing Life AI combat.
const STABILITY_VERSION='v16.4-stability';
const REPEAT_TYPES=new Set(['hut','lantern','watchtower']);
const REPEAT_LIMITS={hut:{base:6,perWall:3,max:24},lantern:{base:8,perWall:4,max:32},watchtower:{base:2,perWall:1,max:8}};
const RESPAWN_MS={tree:10000,rock:12000,food:7000};
const MIN_NODE_TOTAL={tree:18,rock:12,food:8};
const FOOTPRINT={hut:26,lantern:10,watchtower:22,warehouse:30,barracks:31,guild:35,lumber:30,quarry:30};

const coreUpdateHud=updateHud;
const coreUpdateBuildSheet=updateBuildSheet;
const coreUpdatePeopleSummary=updatePeopleSummary;
const coreBuild=build;
const coreLoop=loop;
const coreHitNode=hitNode;
let hudLast=0,buildUiLast=0,buildUiSig='',peopleSig='',lastRuntimeError='',lastRuntimeErrorAt=0;

function repeatLimit(type){const cfg=REPEAT_LIMITS[type];if(!cfg)return 1;const wall=Math.max(1,settlementLevel());return Math.min(cfg.max,cfg.base+(wall-1)*cfg.perWall)}
function footprint(type){return FOOTPRINT[type]||28}
function candidateGrid(type){
  const B=bounds(),r=footprint(type),pad=Math.max(18,r+3),step=type==='lantern'?30:type==='watchtower'?48:50,out=[];
  if(type==='lantern'){
    const inset=20,edgeStep=48;
    for(let x=B.l+inset;x<=B.r-inset;x+=edgeStep){out.push({x,y:B.t+inset});if(!(Math.abs(x)<B.gap/2+16))out.push({x,y:B.b-inset})}
    for(let y=B.t+inset+edgeStep;y<=B.b-inset-edgeStep;y+=edgeStep){out.push({x:B.l+inset,y});out.push({x:B.r-inset,y})}
  }
  for(let y=B.t+pad;y<=B.b-pad;y+=step){for(let x=B.l+pad;x<=B.r-pad;x+=step){if(type!=='lantern'&&Math.abs(x)<34&&Math.abs(y-18)<48)continue;if(Math.abs(x)<B.gap/2+15&&y>B.b-58)continue;out.push({x,y})}}
  const seen=new Set();
  return out.filter(p=>{const key=`${Math.round(p.x)}:${Math.round(p.y)}`;if(seen.has(key))return false;seen.add(key);for(const b of state.buildings){const min=r+footprint(b.type)+5;if(Math.hypot(p.x-b.x,p.y-b.y)<min)return false}return true}).sort((a,b)=>Math.hypot(state.player.x-a.x,state.player.y-a.y)-Math.hypot(state.player.x-b.x,state.player.y-b.y));
}
function findBuildSpot(type){return candidateGrid(type)[0]||null}

function reportRuntimeError(err,where='RUNTIME'){
  const msg=(err&&err.message)||String(err),now=Date.now();console.error(`[${STABILITY_VERSION}] ${where}`,err);
  if(msg!==lastRuntimeError||now-lastRuntimeErrorAt>1800){lastRuntimeError=msg;lastRuntimeErrorAt=now;try{toast(`DEBUG ${where} · ${msg.slice(0,70)}`,true)}catch(_){}}
}
function forceUiRefresh(){hudLast=0;buildUiLast=0;buildUiSig='';updateHud(true);updateBuildSheet(true);ensureDefenseChip()}

function buildSafe(type){
  try{
    A.enable();
    if(type==='palisade')return coreBuild(type);
    const d=BUILD[type];if(!d){toast('BUILD ERROR · unknown structure',true);return false}
    if(rankIndex()<d.unlock){toast(`RANK ${RANKS[d.unlock]}で解禁`);return false}
    const existing=state.buildings.filter(b=>b.type===type),repeat=REPEAT_TYPES.has(type)||d.repeat===true;
    if(!repeat&&existing.length){toast(d.name+'は建設済み');return false}
    if(repeat&&existing.length>=repeatLimit(type)){toast(`${d.name} ${existing.length}/${repeatLimit(type)} · 城壁を拡張すると上限UP`);return false}
    const c=costFor(type,1);if(!hasCost(c)){toast(`${d.name} 素材不足 · ${fmtCost(c)}`,true);return false}
    const pos=findBuildSpot(type);if(!pos){toast('城内に空きがない · 城壁を拡張');return false}
    pay(c);
    const b={id:'b'+Date.now()+Math.random(),type,level:1,slot:`stable:${type}:${Math.round(pos.x)}:${Math.round(pos.y)}:${Date.now()}`,x:pos.x,y:pos.y,builtAt:performance.now()};
    state.buildings.push(b);fxBurst(b.x,b.y,'#d7b26e',20,1.25);A.sfx('build');toast(`${d.name} 完成 · ${existing.length+1}/${repeat?repeatLimit(type):1}`);save();forceUiRefresh();return true;
  }catch(err){reportRuntimeError(err,'BUILD '+type);return false}
}
build=buildSafe;

function resourceRespawnPoint(n){if(!(state.palisade.built&&inside(n.x,n.y,bounds())))return;const B=bounds(),side=Math.floor(Math.random()*4),margin=50+rnd(0,70);if(side===0){n.x=B.l-margin;n.y=rnd(B.t-60,B.b+60)}else if(side===1){n.x=B.r+margin;n.y=rnd(B.t-60,B.b+60)}else if(side===2){n.x=rnd(B.l-70,B.r+70);n.y=B.t-margin}else{n.x=rnd(B.l-70,B.r+70);n.y=B.b+margin}n.x=clamp(n.x,WORLD.minX+35,WORLD.maxX-35);n.y=clamp(n.y,WORLD.minY+35,WORLD.maxY-35)}
function reviveResource(n){resourceRespawnPoint(n);n.alive=true;n.hp=n.maxHp||(n.type==='tree'?18:n.type==='rock'?26:12);n.maxHp=n.maxHp||n.hp;n.respawnAt=0;n.starter=false;fxBurst(n.x,n.y,n.type==='tree'?'#5a7d50':n.type==='rock'?'#a4a498':'#8f6a52',7,.7)}
function makeFrontierNode(type){const B=bounds(),side=Math.floor(Math.random()*4),margin=75+rnd(0,150);let x=0,y=0;if(side===0){x=B.l-margin;y=rnd(B.t-100,B.b+100)}else if(side===1){x=B.r+margin;y=rnd(B.t-100,B.b+100)}else if(side===2){x=rnd(B.l-120,B.r+120);y=B.t-margin}else{x=rnd(B.l-120,B.r+120);y=B.b+margin}x=clamp(x,WORLD.minX+35,WORLD.maxX-35);y=clamp(y,WORLD.minY+35,WORLD.maxY-35);const hp=type==='tree'?18:type==='rock'?26:12;return{id:`repair-${type}-${Date.now()}-${Math.random()}`,x,y,type,hp,maxHp:hp,alive:true,respawnAt:0,starter:false,seed:Math.random()}}
function repairResourceLifecycle(){if(window.WorldGame?.away)return;
  const now=Date.now(),total={tree:0,rock:0,food:0};
  for(const n of state.nodes){if(!RESPAWN_MS[n.type])continue;total[n.type]++;if(n.alive)continue;if(!Number.isFinite(n.respawnAt)||n.respawnAt<=0)n.respawnAt=now+RESPAWN_MS[n.type];if(n.respawnAt<=now)reviveResource(n)}
  for(const type of Object.keys(MIN_NODE_TOTAL)){while((total[type]||0)<MIN_NODE_TOTAL[type]){state.nodes.push(makeFrontierNode(type));total[type]=(total[type]||0)+1}}
}
respawnNodes=repairResourceLifecycle;
hitNode=function(n,source='player'){if(!n?.alive)return;const wasAlive=n.alive;coreHitNode(n,source);if(wasAlive&&!n.alive){n.respawnAt=Date.now()+RESPAWN_MS[n.type];floatText(n.x,n.y-9,`${Math.round(RESPAWN_MS[n.type]/1000)}s`,'#d5c59e')}};

function buildUiSignature(){const buildings=state.buildings.map(b=>`${b.type}:${b.level}`).sort().join('|');return `${rankIndex()}|${Math.floor(state.wood)}|${Math.floor(state.stone)}|${Math.floor(state.food)}|${state.iron}|${state.renown}|${state.palisade.level}|${Math.round(state.palisade.hp)}|${buildings}`}
function decorateBuildUi(){
  const grid=document.querySelector('.build-grid');if(!grid)return;
  const wall=grid.querySelector('[data-build="palisade"]');if(wall){if(grid.firstElementChild!==wall)grid.prepend(wall);wall.classList.add('defense-primary');const title=wall.querySelector('b'),small=wall.querySelector('small');if(title)title.textContent=state.palisade.built?`防壁 / PALISADE Lv.${state.palisade.level}`:'防壁 / PALISADE';if(small)small.textContent=state.palisade.built?`HP ${Math.max(0,Math.ceil(state.palisade.hp))}/${state.palisade.maxHp} · 領土防衛`:'最優先防衛 · 一度で集落全体を囲う'}
  for(const type of REPEAT_TYPES){const btn=grid.querySelector(`[data-build="${type}"]`);if(!btn)continue;const title=btn.querySelector('b'),count=state.buildings.filter(b=>b.type===type).length;if(title)title.textContent=`${BUILD[type].name} ×${count}/${repeatLimit(type)}`;btn.classList.remove('locked')}
}
updateBuildSheet=function(force=false){const now=performance.now(),sig=buildUiSignature();if(!force&&sig===buildUiSig&&now-buildUiLast<500)return;if(!force&&now-buildUiLast<220)return;buildUiLast=now;buildUiSig=sig;coreUpdateBuildSheet();decorateBuildUi()};
updatePeopleSummary=function(){const sig=state.workers.map(w=>`${w.role}:${w.dead?'d':'a'}`).sort().join('|');if(sig===peopleSig)return;peopleSig=sig;coreUpdatePeopleSummary()};
function ensureDefenseChip(){let chip=document.getElementById('defense-chip');if(!chip){chip=document.createElement('div');chip.id='defense-chip';chip.innerHTML='<small>DEFENSE</small><b id="defense-chip-text">防壁なし</b>';document.body.appendChild(chip)}const text=document.getElementById('defense-chip-text');if(!state.palisade.built){text.textContent='防壁なし · BUILDで建設';chip.classList.add('danger')}else{text.textContent=`WALL Lv.${state.palisade.level} · HP ${Math.max(0,Math.ceil(state.palisade.hp))}/${state.palisade.maxHp}`;chip.classList.toggle('danger',state.palisade.hp<state.palisade.maxHp*.35)}}
updateHud=function(force=false){const now=performance.now();if(!force&&now-hudLast<100)return;hudLast=now;coreUpdateHud();ensureDefenseChip()};

loop=function(now){try{return coreLoop(now)}catch(err){reportRuntimeError(err,'FRAME');requestAnimationFrame(loop)}};
window.addEventListener('error',e=>reportRuntimeError(e.error||e.message,'JS'));
window.addEventListener('unhandledrejection',e=>reportRuntimeError(e.reason,'PROMISE'));
function safeHandler(fn,label){return function(e){try{return fn.call(this,e)}catch(err){reportRuntimeError(err,label);return false}}}
document.querySelectorAll('[data-build]').forEach(btn=>{btn.onclick=safeHandler(()=>build(btn.dataset.build),'BUILD TOUCH')});
document.querySelectorAll('[data-hire]').forEach(btn=>{btn.onclick=safeHandler(()=>hire(btn.dataset.hire),'HIRE TOUCH')});
document.querySelectorAll('#dock [data-panel]').forEach(btn=>{btn.onclick=safeHandler(()=>{openPanel(btn.dataset.panel);if(btn.dataset.panel==='build')updateBuildSheet(true)},'PANEL TOUCH')});
const closeBtn=document.getElementById('sheet-close');if(closeBtn)closeBtn.onclick=safeHandler(()=>{closeSheet();A.sfx('cancel')},'CLOSE TOUCH');

function runDiagnostics(){const B=bounds(),hutSpots=candidateGrid('hut').length,lanternSpots=candidateGrid('lantern').length,buttons=[...document.querySelectorAll('[data-build]')].length,result={version:STABILITY_VERSION,hutSpots,lanternSpots,buttons,wall:`${B.l},${B.t},${B.r},${B.b}`,nodes:state.nodes.length};console.info('[GUILD DEBUG]',result);if(hutSpots<2)reportRuntimeError(new Error('HOUSE placement capacity too low'),'SELFTEST');if(lanternSpots<3)reportRuntimeError(new Error('LANTERN placement capacity too low'),'SELFTEST');if(buttons<9)reportRuntimeError(new Error('BUILD buttons missing'),'SELFTEST');return result}
repairResourceLifecycle();forceUiRefresh();setInterval(repairResourceLifecycle,1000);setTimeout(runDiagnostics,60);
window.GUILD_DEBUG=Object.freeze({version:STABILITY_VERSION,diagnostics:runDiagnostics,candidateCount:type=>candidateGrid(type).length,repeatLimit,forceUiRefresh,repairResources:repairResourceLifecycle});
