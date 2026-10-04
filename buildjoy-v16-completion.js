(()=>{'use strict';
const MAX_REPEAT={hut:18,lantern:24,watchtower:8};
const MIN_ACTIVE={tree:18,rock:12,food:8};
const RESPAWN_MS={tree:12000,rock:14000,food:8000};

function countType(type){return state.buildings.filter(b=>b.type===type).length}
function repeatCap(type){if(type==='hut')return Math.min(MAX_REPEAT.hut,3+settlementLevel()*3);if(type==='lantern')return Math.min(MAX_REPEAT.lantern,4+settlementLevel()*4);if(type==='watchtower')return Math.min(MAX_REPEAT.watchtower,2+settlementLevel());return 99}
function buildingRadius(type){if(type==='lantern')return 24;if(type==='watchtower')return 34;if(type==='hut')return 40;return 42}
function dynamicBuildCandidates(type){const B=bounds(),pad=32,r=buildingRadius(type),step=type==='lantern'?42:58,pts=[];for(let y=B.t+pad;y<=B.b-pad;y+=step){for(let x=B.l+pad;x<=B.r-pad;x+=step){if(Math.abs(x)<52&&Math.abs(y-24)<70)continue;if(Math.abs(x)<38&&y>B.b-80)continue;let ok=true;for(const b of state.buildings){const br=buildingRadius(b.type);if(Math.hypot(x-b.x,y-b.y)<r+br+8){ok=false;break}}if(ok)pts.push({p:[x,y],d:Math.hypot(state.player.x-x,state.player.y-y)})}}return pts.sort((a,b)=>a.d-b.d)}
function completionFreeSlot(type){const p=dynamicBuildCandidates(type)[0];if(!p)return null;return{p:p.p,i:`${type}:${Math.round(p.p[0])}:${Math.round(p.p[1])}:${Date.now()}`}}

const originalBuild=build;
build=function(type){
  A.enable();
  if(type==='palisade')return originalBuild(type);
  const d=BUILD[type];if(!d)return;
  if(rankIndex()<d.unlock){toast(`RANK ${RANKS[d.unlock]}で解禁`);return}
  const existing=state.buildings.filter(b=>b.type===type);
  if(!d.repeat&&existing.length>0){toast(d.name+'は建設済み');return}
  if(d.repeat&&existing.length>=repeatCap(type)){toast(`${d.name} 建設上限 ${existing.length}/${repeatCap(type)} · 城壁を拡張`);return}
  const c=costFor(type,1);if(!hasCost(c)){toast(d.name+' 素材不足 · '+fmtCost(c),true);return}
  const s=completionFreeSlot(type);if(!s){toast('城内に建築スペースがない · 城壁を拡張');return}
  pay(c);const b={id:'b'+Date.now()+Math.random(),type,level:1,slot:s.i,x:s.p[0],y:s.p[1],builtAt:performance.now()};state.buildings.push(b);fxBurst(b.x,b.y,'#d7b26e',20,1.25);toast(`${d.name} 完成 · ${countType(type)}棟`);A.sfx('build');closeSheet();save();updateHud();
};

function patchBuildUI(){
  const grid=document.querySelector('.build-grid');if(!grid)return;
  const wall=grid.querySelector('[data-build="palisade"]');if(wall){grid.prepend(wall);wall.classList.add('defense-primary');const b=wall.querySelector('b');if(b)b.textContent=state.palisade.built?`防壁 / PALISADE Lv.${state.palisade.level}`:'防壁 / PALISADE';const s=wall.querySelector('small');if(s)s.textContent=state.palisade.built?`HP ${Math.ceil(state.palisade.hp)} / ${state.palisade.maxHp} · 領土を守る`:'最優先防衛 · 一度で集落全体を囲う'}
  for(const type of['hut','lantern','watchtower']){const btn=grid.querySelector(`[data-build="${type}"]`);if(!btn)continue;const b=btn.querySelector('b');if(b){const base=BUILD[type]?.name||type.toUpperCase();b.textContent=`${base} ×${countType(type)} / ${repeatCap(type)}`}}
}
const originalUpdateBuildSheet=updateBuildSheet;
updateBuildSheet=function(){originalUpdateBuildSheet();patchBuildUI()};
const originalObjective=updateObjective;
updateObjective=function(){originalObjective();if(state.buildings.some(b=>b.type==='hut')&&!state.palisade.built)$('objective-text').textContent='BUILD → 防壁 / PALISADE を建てて夜に備える'};

function ensureDefenseChip(){if(document.getElementById('defense-chip'))return;const chip=document.createElement('div');chip.id='defense-chip';chip.innerHTML='<small>DEFENSE</small><b id="defense-chip-text">防壁なし</b>';document.body.appendChild(chip)}
function updateDefenseChip(){ensureDefenseChip();const t=document.getElementById('defense-chip-text');if(!t)return;if(!state.palisade.built){t.textContent='防壁なし · BUILDで建設';document.getElementById('defense-chip').classList.add('danger')}else{t.textContent=`WALL Lv.${state.palisade.level} · HP ${Math.max(0,Math.ceil(state.palisade.hp))}/${state.palisade.maxHp}`;document.getElementById('defense-chip').classList.toggle('danger',state.palisade.hp<state.palisade.maxHp*.35)}}
const originalHud=updateHud;
updateHud=function(){originalHud();updateDefenseChip()};

function validRespawnSpot(n){return !(state.palisade.built&&inside(n.x,n.y,bounds()))}
function respawnNearFrontier(n){const B=bounds(),side=Math.floor(Math.random()*4),margin=55+rnd(0,75);if(side===0){n.x=B.l-margin;n.y=rnd(B.t-70,B.b+70)}else if(side===1){n.x=B.r+margin;n.y=rnd(B.t-70,B.b+70)}else if(side===2){n.x=rnd(B.l-80,B.r+80);n.y=B.t-margin}else{n.x=rnd(B.l-80,B.r+80);n.y=B.b+margin}n.x=clamp(n.x,WORLD.minX+35,WORLD.maxX-35);n.y=clamp(n.y,WORLD.minY+35,WORLD.maxY-35)}
function reviveNode(n){if(!validRespawnSpot(n))respawnNearFrontier(n);n.alive=true;n.hp=n.maxHp;n.respawnAt=0;n.starter=false;fxBurst(n.x,n.y,n.type==='tree'?'#5a7d50':n.type==='rock'?'#a4a498':'#8f6a52',8,.7)}
respawnNodes=function(){const now=Date.now();for(const n of state.nodes){if(!n.alive&&n.respawnAt&&n.respawnAt<=now)reviveNode(n)}const active={tree:0,rock:0,food:0};for(const n of state.nodes)if(n.alive)active[n.type]=(active[n.type]||0)+1;for(const type of Object.keys(MIN_ACTIVE)){let need=MIN_ACTIVE[type]-(active[type]||0);if(need<=0)continue;const dead=state.nodes.filter(n=>!n.alive&&n.type===type).sort((a,b)=>(a.respawnAt||0)-(b.respawnAt||0));for(const n of dead){if(need--<=0)break;reviveNode(n)}}};

const originalHitNode=hitNode;
hitNode=function(n,source='player'){if(!n?.alive)return;const before=n.hp;originalHitNode(n,source);if(before>0&&!n.alive){n.respawnAt=Date.now()+RESPAWN_MS[n.type];floatText(n.x,n.y-8,n.type==='food'?'8s':'RESPAWN '+Math.round(RESPAWN_MS[n.type]/1000)+'s','#c9b98f')}};

function addResourceRespawnPulse(dt){addResourceRespawnPulse.acc=(addResourceRespawnPulse.acc||0)+dt;if(addResourceRespawnPulse.acc<1)return;addResourceRespawnPulse.acc=0;respawnNodes()}
const originalLoop=loop;
loop=function(now){const dt=Math.min(.033,(now-last)/1000||0);addResourceRespawnPulse(dt);return originalLoop(now)};

function migrateRepeatSlots(){let changed=false;const seen=new Set();for(const b of state.buildings){if(typeof b.slot==='string'){seen.add(b.slot);continue}const key=`legacy:${b.type}:${Math.round(b.x)}:${Math.round(b.y)}:${b.id}`;b.slot=key;seen.add(key);changed=true}if(changed)save()}
setTimeout(()=>{migrateRepeatSlots();patchBuildUI();updateDefenseChip();updateObjective();respawnNodes()},0);
window.GUILD_COMPLETION=Object.freeze({repeatCap,countType,respawnNodes});
})();