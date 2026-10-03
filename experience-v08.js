(()=>{'use strict';
const $=id=>document.getElementById(id),log=$('log');
function note(text){const d=document.createElement('div');d.className='msg';d.textContent=text;log?.appendChild(d);setTimeout(()=>d.remove(),4000)}

// Low-frequency record/settings stay behind one bottom item; everyday management never requires the modal.
$('record')?.addEventListener('click',()=>$('menu-toggle')?.click());

// Facility selection/upgrade is waiting for the Systems lane API. Do not duplicate the private building state here.
$('facility')?.addEventListener('click',()=>{const api=window.GUILD_API;if(api?.getSelectedBuilding){const b=api.getSelectedBuilding();if(b){showFacility(b);return}}note('強化したい建物を軽くタップ｜施設強化APIをSystems laneと接続中')});
$('facility-upgrade')?.addEventListener('click',()=>{const api=window.GUILD_API;if(api?.upgradeBuilding&&api?.getSelectedBuilding){const b=api.getSelectedBuilding();if(b)api.upgradeBuilding(b.id)}else note('施設強化はSystems laneのAPI接続待ち')});
function showFacility(b){$('facility-name').textContent=b.name||b.id||'施設';$('facility-level').textContent='Lv.'+(b.level||1);$('facility-strip').hidden=false;$('facility')?.classList.add('hot')}
window.addEventListener('guild:buildingSelected',e=>showFacility(e.detail||{}));
window.addEventListener('guild:buildingUpdated',e=>showFacility(e.detail||{}));

// Prevent the legacy free x1/x2/x5/x10 cycle from leaking into this owner-facing UX prototype.
// Systems lane will replace this with the owner-requested consumable-gated x2/x3 API.
$('speed')?.addEventListener('click',e=>{if(!window.GUILD_API?.useSpeedItem){e.preventDefault();e.stopImmediatePropagation();note('倍速には「時の砂」が必要｜最大 ×3');}},true);

// Keep the visible bottom-bar language consistent even while Systems still reports the old cap internally.
// We intentionally do not fake the number: the 200-cap migration belongs to Systems and is specified in V08_DIRECTION.md.
})();
