(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const c=$('c');
  const api=()=>window.GUILD_API;
  const audio=()=>window.GuildAudio;
  const logSource=$('log');
  const logbar=$('v08-logbar');
  const logtext=$('v08-logtext');
  const sheet=$('v08-sheet');
  const tabs=[...document.querySelectorAll('[data-v08-tab]')];
  const panels=[...document.querySelectorAll('[data-v08-panel]')];
  const rosterDisplay=$('v08-roster-display');
  const rosterSummary=$('v08-roster-summary');
  const guildSummary=$('v08-guild-summary');
  const saveStatus=$('v08-save-status');
  const speedBtn=$('speed');
  const pulse=$('touch-pulse');
  const hint=$('hint');

  function flashLog(text){
    if(!text)return;
    logtext.textContent=text.replace(/\s+/g,' ').trim();
    logbar.classList.remove('flash');
    void logbar.offsetWidth;
    logbar.classList.add('flash');
  }

  if(logSource){
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType===1&&node.textContent)flashLog(node.textContent);
        }
      }
    });
    observer.observe(logSource,{childList:true});
  }

  function refresh(){
    const state=api()?.getState?.();
    if(!state)return;
    const current=Number(state.npcs)||0;
    if(rosterDisplay)rosterDisplay.textContent=`${current} / 200`;
    if(rosterSummary)rosterSummary.textContent=`${current} / 200`;
    if(guildSummary)guildSummary.textContent=`Lv.${state.resources?.lv??1}`;
  }
  setInterval(refresh,250);
  refresh();

  function setPanel(name,forceOpen){
    const active=tabs.find(btn=>btn.dataset.v08Tab===name);
    const wasActive=active?.classList.contains('is-active');
    tabs.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.v08Tab===name));
    panels.forEach(panel=>panel.classList.toggle('is-active',panel.dataset.v08Panel===name));
    const shouldOpen=forceOpen===true?true:forceOpen===false?false:(!wasActive||sheet.hidden);
    sheet.hidden=!shouldOpen;
    audio()?.sfx?.(shouldOpen?'confirm':'cancel');
  }

  tabs.forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    setPanel(btn.dataset.v08Tab);
  }));

  document.querySelectorAll('[data-building]').forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    const id=btn.dataset.building;
    if(id==='guild'){
      $('upgrade')?.click();
      flashLog('ギルド本部の強化を実行');
      return;
    }
    const buildingApi=api()?.upgradeBuilding;
    if(typeof buildingApi==='function'){
      const ok=buildingApi(id);
      flashLog(ok?`${btn.querySelector('b')?.textContent||id} を強化した`:'素材が足りない');
    }else{
      flashLog('施設強化APIを接続中 · 次のsystems差分で有効化');
      audio()?.sfx?.('cancel');
    }
  }));

  $('menu-save')?.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    const ok=api()?.save?.();
    if(saveStatus)saveStatus.textContent=ok?'SAVED':'SAVE ERROR';
    flashLog(ok?'街の状態を記録した':'保存できませんでした');
    audio()?.sfx?.(ok?'confirm':'error');
  });

  // v0.8 user rule: no permanently free x5/x10.
  // Until the systems lane exposes the finite Hourglass entitlement, keep world speed locked at x1.
  if(speedBtn){
    api()?.setSpeed?.(1);
    speedBtn.textContent='×1';
    speedBtn.onclick=e=>{
      e?.preventDefault?.();e?.stopPropagation?.();
      api()?.setSpeed?.(1);
      speedBtn.textContent='×1';
      flashLog('倍速には「砂時計」が必要 · 最大×3');
      audio()?.sfx?.('cancel');
    };
  }

  // v0.8 drag steering override.
  // Capture phase prevents the canonical tap-to-destination listener from receiving plain field input.
  let pointer=null,ox=0,oy=0,dir=null,lastStep=0,moved=false;
  const DEAD=13, REPEAT=118;
  function direction(dx,dy){
    if(Math.hypot(dx,dy)<DEAD)return null;
    if(Math.abs(dx)>=Math.abs(dy))return dx>0?'right':'left';
    return dy>0?'down':'up';
  }
  function pulseAt(x,y){
    if(!pulse)return;
    pulse.style.left=x+'px';pulse.style.top=y+'px';
    pulse.classList.remove('show');void pulse.offsetWidth;pulse.classList.add('show');
  }
  function step(now,force=false){
    if(!dir)return;
    if(force||now-lastStep>=REPEAT){
      lastStep=now;
      api()?.move?.(dir);
    }
  }
  function onDown(e){
    if(pointer!==null)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    pointer=e.pointerId;ox=e.clientX;oy=e.clientY;dir=null;moved=false;lastStep=0;
    hint?.classList.add('is-dim');
    pulseAt(ox,oy);
    try{c.setPointerCapture(pointer)}catch(_){ }
  }
  function onMove(e){
    if(e.pointerId!==pointer)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const next=direction(e.clientX-ox,e.clientY-oy);
    if(!next)return;
    moved=true;
    if(next!==dir){dir=next;step(performance.now(),true)}
    else step(performance.now());
  }
  function finish(e){
    if(pointer===null||(e?.pointerId!==undefined&&e.pointerId!==pointer))return;
    e?.preventDefault?.();
    e?.stopImmediatePropagation?.();
    pointer=null;dir=null;
    setTimeout(()=>hint?.classList.remove('is-dim'),450);
    if(!moved)flashLog('移動はドラッグ · 建物管理は下の「施設」から');
  }
  if(c){
    c.addEventListener('pointerdown',onDown,true);
    c.addEventListener('pointermove',onMove,true);
    c.addEventListener('pointerup',finish,true);
    c.addEventListener('pointercancel',finish,true);
    c.addEventListener('lostpointercapture',finish,true);
  }

  // Never let dock interaction leak into the world input layer.
  $('v08-dock')?.addEventListener('pointerdown',e=>e.stopPropagation(),true);
  $('v08-dock')?.addEventListener('pointermove',e=>e.stopPropagation(),true);
  $('v08-dock')?.addEventListener('pointerup',e=>e.stopPropagation(),true);

  window.GUILD_V08=Object.freeze({
    version:'0.8-ux-bottomdock-drag-alpha',
    setPanel,
    flashLog,
    refresh
  });

  flashLog('v0.8 · DRAG TO WALK · 管理は下のバーへ');
})();
