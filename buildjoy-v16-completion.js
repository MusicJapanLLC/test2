(()=>{'use strict';
function countType(type){return state.buildings.filter(b=>b.type===type).length}
function patchBuildUI(){
  const grid=document.querySelector('.build-grid');if(!grid)return;
  const wall=grid.querySelector('[data-build="palisade"]');
  if(wall){
    grid.prepend(wall);
    wall.classList.add('defense-primary');
    const b=wall.querySelector('b');if(b)b.textContent=state.palisade.built?`防壁 / PALISADE Lv.${state.palisade.level}`:'防壁 / PALISADE';
    const s=wall.querySelector('small');if(s)s.textContent=state.palisade.built?`HP ${Math.max(0,Math.ceil(state.palisade.hp))} / ${state.palisade.maxHp} · 領土を守る`:'最優先防衛 · 一度で集落全体を囲う';
  }
  for(const type of['hut','lantern','watchtower']){
    const btn=grid.querySelector(`[data-build="${type}"]`);if(!btn)continue;
    const b=btn.querySelector('b');if(b)b.textContent=`${BUILD[type]?.name||type.toUpperCase()} ×${countType(type)} / ${repeatBuildCap(type)}`;
  }
}
const originalUpdateBuildSheet=updateBuildSheet;
updateBuildSheet=function(){originalUpdateBuildSheet();patchBuildUI()};
const originalObjective=updateObjective;
updateObjective=function(){
  originalObjective();
  if(state.buildings.some(b=>b.type==='hut')&&!state.palisade.built)$('objective-text').textContent='BUILD → 防壁 / PALISADE を建てて夜に備える';
};
function ensureDefenseChip(){
  if(document.getElementById('defense-chip'))return;
  const chip=document.createElement('div');chip.id='defense-chip';chip.innerHTML='<small>DEFENSE</small><b id="defense-chip-text">防壁なし</b>';document.body.appendChild(chip);
}
function updateDefenseChip(){
  ensureDefenseChip();const chip=document.getElementById('defense-chip'),t=document.getElementById('defense-chip-text');if(!t)return;
  if(!state.palisade.built){t.textContent='防壁なし · BUILDで建設';chip.classList.add('danger')}
  else{t.textContent=`WALL Lv.${state.palisade.level} · HP ${Math.max(0,Math.ceil(state.palisade.hp))}/${state.palisade.maxHp}`;chip.classList.toggle('danger',state.palisade.hp<state.palisade.maxHp*.35)}
}
const originalHud=updateHud;
updateHud=function(){originalHud();updateDefenseChip()};
function migrateLegacySlots(){let changed=false;for(const b of state.buildings){if(typeof b.slot==='string')continue;b.slot=`legacy:${b.type}:${Math.round(b.x)}:${Math.round(b.y)}:${b.id}`;changed=true}if(changed)save()}
setTimeout(()=>{migrateLegacySlots();patchBuildUI();updateDefenseChip();updateObjective();respawnNodes()},0);
window.GUILD_COMPLETION=Object.freeze({countType,repeatBuildCap,respawnNodes});
})();