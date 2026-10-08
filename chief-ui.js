'use strict';
(()=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={wood:'木',stone:'石',food:'食料',iron:'鉄',renown:'名声'};
 const cost=o=>Object.entries(o).map(([k,v])=>`${labels[k]||k} ${v}`).join(' / ');
 fmtCost=cost;$('utility').remove();$('game').setAttribute('aria-label','村長、正気ですか？ ドラッグして移動');
 const brand=document.createElement('div');brand.id='chief-brand';brand.innerHTML='<b>村長、正気ですか？</b><span>CHIEF, REALLY? <i>21</i></span>';document.body.prepend(brand);
 const iron=document.createElement('span');iron.innerHTML='<small>鉄</small><b id="chief-iron">0</b><em>製鉄所で生産</em>';$('resources').insertBefore(iron,$('resources').lastElementChild);
 ['木材','石材','ごはん','鉄','住民'].forEach((s,i)=>$('resources').children[i].querySelector('small').textContent=s);
 $('objective').querySelector('small').textContent='次の一手';
 const music=document.createElement('div');music.id='chief-music';document.body.append(music);
 const forge=document.createElement('button');forge.dataset.build='forge';forge.innerHTML='<span>▣</span><b>製鉄所</b><small>木12 + 石18 → 鉄1<br>納品・研究・開拓の先へ</small><em id="cost-forge"></em>';forge.onclick=()=>build('forge');document.querySelector('.build-grid').prepend(forge);
 const bureau=document.createElement('div');bureau.id='chief-bureau';$('panel-record').prepend(bureau);
 const roster=document.createElement('div');roster.id='chief-roster';$('panel-people').append(roster);
 const navNames={build:['建てる','道具も人生も強化'],people:['住民','クセの強い仲間たち'],record:['村長室','製鉄 / 納品 / 開拓']};
 for(const [k,[a,b]]of Object.entries(navNames)){const n=document.querySelector(`[data-panel="${k}"]`);n.querySelector('b').textContent=a;if(k!=='people')n.querySelector('small').textContent=b}
 for(const cfg of Object.values(WORK_TECH)){cfg.label=cfg.jp;if(['林業技術','採石技術','採集技術'].includes(cfg.jp))cfg.desc='担当の収穫量を段階的に強化 · 最大Lv25'}
 GROUP_TYPES.hut.label='住宅組合';GROUP_TYPES.lantern.label='灯火組合';GROUP_TYPES.watchtower.label='見張り組合';
 let tab='office',signature='',stamp=0;
 const tabs=document.createElement('div');tabs.className='chief-tabs';tabs.innerHTML='<button data-chief-tab="office" class="selected">村の経営</button><button data-chief-tab="journal">方針と実績</button>';$('panel-record').prepend(tabs);
 function showTab(){bureau.hidden=tab!=='office';for(const id of ['village-card','unlock-list'])if($(id))$(id).hidden=tab!=='journal';document.querySelector('.record-grid').hidden=tab!=='journal';tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.chiefTab===tab))}
 tabs.onclick=e=>{const b=e.target.closest('[data-chief-tab]');if(b){tab=b.dataset.chiefTab;showTab()}};
 function render(force=false){
  if(!currentPanel)return;const c=Chief.state,job=Chief.contract(),f=state.buildings.find(b=>b.type==='forge');
  const sig=JSON.stringify([currentPanel,Math.floor(state.wood),Math.floor(state.stone),Math.floor(state.food),state.iron,state.renown,state.pocket.tokens,state.pocket.policies,c.charter,c.contracts,c.monument,c.autoForge,Math.ceil(c.forge?.remaining||0),state.workers.map(w=>[w.id,w.role,w.citizen?.level,Math.floor(w.citizen?.xp||0),Math.max(0,Math.ceil(10-(c.time-w.citizen?.trainedAt)))])]);
  if(!force&&sig===signature)return;signature=sig;
  if(currentPanel==='record'){
   if($('pocket-help'))$('pocket-help').textContent='ドラッグで移動 / 止まると自動採集 / 号令で採集強化 / 製鉄所で鉄をつくる / 納品で名声 / メニュー中は時間停止 / CHIEF, REALLY? v2.1';
   bureau.innerHTML=`<div class="chief-intro"><small>役場からのお知らせ</small><h2>村長、仕事が溜まってます</h2><p>余った資源は、鉄・納品・開拓へ<br>村は育つ　村長の器は、まだ不明</p></div>
   <article class="chief-order furnace"><div class="chief-order-head"><span class="pixel-icon">▥</span><div><small>IRONWORKS / 製鉄所 Lv.${f?.level||0}</small><h3>${c.forge?'ただいま、石を焼いています':'鉄不足？ 焼けばいい'}</h3></div></div><p>木12 + 石18 → <strong>鉄1</strong> / ${f?Math.max(4,12/(1+(f.level-1)*.12)).toFixed(0):12}秒<br>ゲームを開いている間に進行 · メニュー中は停止</p>${c.forge?`<div class="chief-meter"><i style="width:${Math.max(0,100-c.forge.remaining/12*100)}%"></i></div><small>${document.body.dataset.world==='true'?'メニューを閉じると再開 / 探索中も進行':'村に戻ると再開'} / あと ${Math.ceil(c.forge.remaining)}秒</small>`:''}<div class="chief-actions"><button data-chief="forge" ${!f||c.forge||!hasCost(Chief.forgeCost())?'disabled':''}>${!f?'先に製鉄所を建てる':c.forge?'製鉄中':'鉄を1個つくる'}</button><button data-chief="auto" aria-pressed="${!!c.autoForge}" ${!f?'disabled':''}>自動製鉄 ${c.autoForge?'中':'する'}</button></div><small>自動製鉄は木・石が各60以上の時だけ稼働</small></article>
   <article class="chief-order"><small>配達依頼 #${c.contracts+1} / 完了 ${c.contracts}件</small><h3>${job.name}</h3><p>${cost(job.cost)}<br><strong>報酬：名声 +${job.renown}</strong></p><button data-chief="deliver" data-id="${job.id}" ${!hasCost(job.cost)?'disabled':''}>荷物を渡す</button></article>
   <article class="chief-order"><small>開拓章 ${c.charter} / 20</small><h3>村は、まだ大きくなる</h3><p>全資源の保管量 +25〜45 / 村長の最大体力 +4<br>${c.charter<20?cost(Chief.charterCost()):'全章達成！ 倉庫・研究・住民育成も続けられる'}</p><button data-chief="charter" ${c.charter>=20||!hasCost(Chief.charterCost())?'disabled':''}>${c.charter>=20?'開拓完了':'次の開拓章へ'}</button></article>
   <article class="chief-order monument"><small>完全に趣味 / 村長像 Lv.${c.monument} / 12</small><h3>税金の使い道、これです</h3><p>広場の像が立派に / 士気 +8<br>${c.monument<12?cost(Chief.monumentCost()):'完成　誰も頼んでない超大作'}</p><button data-chief="monument" ${c.monument>=12||!hasCost(Chief.monumentCost())?'disabled':''}>像を無駄に立派にする</button></article>`;
   bureau.querySelectorAll('[data-chief]').forEach(b=>b.onclick=()=>{const k=b.dataset.chief;if(k==='forge')Chief.startForge();if(k==='auto'){c.autoForge=!c.autoForge;save()}if(k==='deliver')Chief.fulfill(Number(b.dataset.id));if(k==='charter')Chief.charter();if(k==='monument')Chief.monument();forceUiRefresh();render(true)});showTab();
  }
  if(currentPanel==='people'){
   roster.innerHTML='<div class="chief-intro"><small>村民名簿 / 全員クセあり</small><h2>適材適所、たぶんね</h2><p>働くと経験値が増加 / 最大Lv20<br>性格と仕事の相性で収穫量が変わる</p></div>'+state.workers.filter(w=>!w.dead).map(w=>{const n=Citizens.ensure(w),t=Citizens.trait(w),cd=Math.max(0,Math.ceil(10-(c.time-n.trainedAt)));return`<article class="citizen"><div class="citizen-head"><div class="citizen-face trait-${n.trait}" style="--shirt:${t.color}"><i></i></div><div><h3>${esc(n.name)} <small>Lv.${n.level}</small></h3><b style="color:${t.color}">${t.name}</b> / ${ROLE_NAMES[w.role]}<p>「${t.quote}」</p></div></div><small>${t.desc}</small><div class="chief-meter"><i style="width:${n.level>=20?100:n.xp/Citizens.nextXP(w)*100}%"></i></div><small>${n.level>=20?'この道の達人':`経験値 ${Math.floor(n.xp)} / ${Citizens.nextXP(w)}`}</small><div class="chief-actions"><label>配属<select data-role="${esc(w.id)}" aria-label="${esc(n.name)}の仕事">${Object.entries(ROLE_NAMES).map(([r,name])=>`<option value="${r}" ${w.role===r?'selected':''} ${r==='guard'&&!state.buildings.some(b=>b.type==='barracks')?'disabled':''}>${name}</option>`).join('')}</select></label><button data-train="${esc(w.id)}" ${cd||n.level>=20||!hasCost(Citizens.trainCost(w))?'disabled':''}>${cd?'研修あと'+cd+'秒':n.level>=20?'達人認定':'研修 +32 XP'}<small>${cost(Citizens.trainCost(w))}</small></button></div></article>`}).join('');
   roster.querySelectorAll('[data-role]').forEach(s=>s.onchange=()=>{Citizens.reassign(s.dataset.role,s.value);render(true)});roster.querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>{Citizens.train(b.dataset.train);forceUiRefresh();render(true)});
  }
 }
 const oldOpen=openPanel;openPanel=function(name){const previous=currentPanel;oldOpen(name);$('sheet-title').textContent=navNames[name][0];$('sheet-kicker').textContent='村長、正気ですか？ / 村営事務所';const help=$('pocket-help');if(help)help.innerHTML='ドラッグで移動 / 近くで止まると自動採集<br>号令で5秒間、採集強化と敵の押し返し<br>鉄は製鉄所で 木12 + 石18 → 鉄1<br>納品で名声 → 開拓章・研究・村長像へ<br>メニュー・別タブ中は時間停止 / 自動保存<br>CHIEF, REALLY? / v2.1';render(true);showTab();if(previous!==name)$('sheet').scrollTop=0};
 const oldHud=updateHud;updateHud=function(...args){oldHud(...args);$('chief-iron').textContent=state.iron;$('chief-music').textContent='♫ '+A.report().title;const n=performance.now();if(n-stamp>250){stamp=n;render()}};
 updateObjective=function(){$('pocket-progress').textContent=`開拓記録 ${state.pocket.claimed.length}/9 · 落とし物 ${state.pocket.caches.length}/6`;$('chain-chip').hidden=Chief.combo<3;$('chain-chip').textContent=`いい調子！ ${Chief.combo}連続`;let s=!state.buildings.some(b=>b.type==='hut')?'木を集めて、小屋を建てる':!state.workers.length?'住民を雇う → ひとりで頑張りすぎない':!state.buildings.some(b=>b.type==='forge')?'木70・石50で製鉄所を建てる':!Chief.state.earnedIron?'村長室で「鉄を1個つくる」':Chief.state.contracts===0?'余った資源を納品 → 名声を獲得':`開拓章 ${Chief.state.charter}/20 · 村長室で村を育てる`;$('objective-text').textContent=s};
 window.ChiefUI={render};updateHud(true);save();
})();
