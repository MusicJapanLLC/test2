(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const api=()=>window.GUILD_API;
  const ux=()=>window.GUILD_V08;
  const audio=()=>window.GuildAudio;

  const META_KEY='guild-infinity-meta-v2';
  const META_BACKUP_KEY='guild-infinity-meta-v2-backup';
  const CORE_KEY='guild-infinity-save-v1';
  const CORE_BACKUP_KEY='guild-infinity-save-v1-backup';
  const DB_NAME='guild-infinity-save-db';
  const DB_STORE='snapshots';

  const defaultMeta=()=>({
    version:2,
    gems:20,
    hourglass:1,
    summonTickets:1,
    blueprints:1,
    buildings:[],
    collection:[],
    pity:0,
    boost:{speed:1,expiresAt:0},
    lastSavedAt:0,
    lastDropAt:0
  });

  let M=defaultMeta();
  let saveBusy=false;
  let questFallbackCooldown=0;

  const safeParse=s=>{try{return JSON.parse(s)}catch(_){return null}};
  const validMeta=m=>m&&m.version===2&&['gems','hourglass','summonTickets','blueprints','pity','lastSavedAt'].every(k=>Number.isFinite(Number(m[k])))&&Array.isArray(m.buildings)&&Array.isArray(m.collection)&&m.boost&&Number.isFinite(Number(m.boost.speed))&&Number.isFinite(Number(m.boost.expiresAt));

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window))return reject(new Error('no indexedDB'));
      const r=indexedDB.open(DB_NAME,1);
      r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('db open'));
    });
  }
  async function idbPut(key,value){try{const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();return true}catch(_){return false}}
  async function idbGet(key){try{const db=await openDb();const value=await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly');const r=tx.objectStore(DB_STORE).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return value??null}catch(_){return null}}

  function mirrorStatus(text){const el=$('meta-save-mirror');if(el)el.textContent=text}
  function timeText(ts){if(!ts)return'--:--:--';try{return new Date(ts).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(_){return'--:--:--'}}

  function renderMeta(){
    $('meta-gems')&&($('meta-gems').textContent=Math.floor(M.gems));
    $('meta-gems-roster')&&($('meta-gems-roster').textContent=Math.floor(M.gems));
    $('meta-hourglass')&&($('meta-hourglass').textContent=Math.floor(M.hourglass));
    $('meta-ticket')&&($('meta-ticket').textContent=Math.floor(M.summonTickets));
    $('meta-blueprint')&&($('meta-blueprint').textContent=Math.floor(M.blueprints));
    $('meta-last-save')&&($('meta-last-save').textContent=timeText(M.lastSavedAt));
    const list=$('meta-built-list');
    if(list){
      list.textContent=M.buildings.length?'建設済み: '+M.buildings.map(b=>`${buildingName(b.type)} Lv.${b.level}`).join(' / '):'建設済み: なし';
    }
    const speed=$('speed');
    if(speed){
      const active=M.boost.expiresAt>Date.now()&&M.boost.speed>1;
      speed.textContent='×'+(active?M.boost.speed:1);
      speed.classList.toggle('speed-active',active);
    }
  }

  function buildingName(type){return({herb:'薬草園',training:'訓練所',workshop:'工房',trade:'交易所'})[type]||type}

  async function writeMirror(){
    const ok1=await idbPut(META_KEY,JSON.stringify(M));
    let core='';try{core=localStorage.getItem(CORE_KEY)||''}catch(_){}
    const ok2=core?await idbPut(CORE_KEY,core):true;
    mirrorStatus(ok1&&ok2?'OK':'LOCAL ONLY');
  }

  async function saveAll(reason='auto'){
    if(saveBusy)return false;
    saveBusy=true;
    try{
      try{
        const prevMeta=localStorage.getItem(META_KEY);if(prevMeta)localStorage.setItem(META_BACKUP_KEY,prevMeta);
        const prevCore=localStorage.getItem(CORE_KEY);if(prevCore)localStorage.setItem(CORE_BACKUP_KEY,prevCore);
      }catch(_){}
      api()?.save?.();
      M.lastSavedAt=Date.now();
      try{localStorage.setItem(META_KEY,JSON.stringify(M))}catch(_){}
      renderMeta();
      if(reason!=='heartbeat')ux()?.flashLog?.('AUTO SAVE · '+timeText(M.lastSavedAt));
      writeMirror();
      return true;
    }finally{saveBusy=false}
  }

  async function recoverCore(){
    const a=api();if(!a?.load)return false;
    if(a.load())return true;
    let backup='';try{backup=localStorage.getItem(CORE_BACKUP_KEY)||''}catch(_){}
    if(backup){try{localStorage.setItem(CORE_KEY,backup);if(a.load())return true}catch(_){}}
    const mirror=await idbGet(CORE_KEY);
    if(mirror){try{localStorage.setItem(CORE_KEY,mirror);if(a.load())return true}catch(_){}}
    return false;
  }

  async function loadMeta(){
    let raw=null;try{raw=localStorage.getItem(META_KEY)}catch(_){}
    let parsed=safeParse(raw);
    if(!validMeta(parsed)){
      try{parsed=safeParse(localStorage.getItem(META_BACKUP_KEY))}catch(_){}
    }
    if(!validMeta(parsed)){
      parsed=safeParse(await idbGet(META_KEY));
    }
    if(validMeta(parsed))M={...defaultMeta(),...parsed,boost:{...defaultMeta().boost,...parsed.boost}};
    await recoverCore();
    renderMeta();
    restoreBoost();
  }

  function mutate(fn,message){
    fn(M);renderMeta();saveAll('mutation');
    if(message)ux()?.flashLog?.(message);
  }

  function restoreBoost(){
    const now=Date.now();
    if(M.boost.expiresAt>now&&[2,3].includes(M.boost.speed)){
      api()?.setSpeed?.(M.boost.speed);
    }else{
      M.boost={speed:1,expiresAt:0};api()?.setSpeed?.(1);saveAll('heartbeat');
    }
  }

  function useHourglass(){
    const now=Date.now();
    const current=M.boost.expiresAt>now?M.boost.speed:1;
    if(M.hourglass<=0){ux()?.flashLog?.('砂時計がない · 依頼DROPや報酬で入手');audio()?.sfx?.('cancel');return false}
    const next=current>=3?3:current+1;
    if(current===3){ux()?.flashLog?.('倍速は最大×3');audio()?.sfx?.('cancel');return false}
    mutate(m=>{m.hourglass-=1;m.boost.speed=next;m.boost.expiresAt=Date.now()+30000},`砂時計を使用 · ×${next} / 30秒`);
    api()?.setSpeed?.(next);audio()?.sfx?.('confirm');return true;
  }

  function rarityRoll(){
    const r=Math.random()*100;
    if(r<3)return'SSR';if(r<15)return'SR';if(r<45)return'R';return'N';
  }
  const names={N:['見習い剣士','旅商人の娘','村の斥候'],R:['蒼帽の弓手','薬草師リナ','傭兵ダグ'],SR:['月影の魔術師','白銀の騎士','火守の錬金術師'],SSR:['星喰いの賢者','黎明の剣聖','金灯の聖女']};
  function drawGacha(){
    if(M.summonTickets<=0&&M.gems<10){ux()?.flashLog?.('召喚券 または 星晶10 が必要');audio()?.sfx?.('cancel');return}
    let paidBy='ticket';
    mutate(m=>{if(m.summonTickets>0)m.summonTickets--;else{m.gems-=10;paidBy='gem'};m.pity++});
    let rarity=rarityRoll();
    if(M.pity>=30&&['N','R'].includes(rarity))rarity='SR';
    if(rarity==='SSR')M.pity=0;
    const pool=names[rarity],name=pool[(Math.random()*pool.length)|0];
    M.collection.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),type:'adventurer',name,rarity,at:Date.now()});
    if(M.collection.length>300)M.collection=M.collection.slice(-300);
    const out=$('meta-gacha-result');if(out)out.textContent=`${rarity} · ${name}`;
    audio()?.sfx?.(rarity==='SSR'?'upgrade':'confirm');
    ux()?.flashLog?.(`${rarity} ${name} を召喚 · ${paidBy==='ticket'?'召喚券':'星晶'}消費`);
    saveAll('mutation');renderMeta();
  }

  function build(type){
    if(!['herb','training','workshop','trade'].includes(type))return;
    const existing=M.buildings.find(b=>b.type===type);
    if(existing){ux()?.flashLog?.(`${buildingName(type)} は建設済み · Lv.${existing.level}`);audio()?.sfx?.('cancel');return}
    if(M.blueprints<1){ux()?.flashLog?.('建築設計図が足りない');audio()?.sfx?.('cancel');return}
    mutate(m=>{m.blueprints-=1;m.buildings.push({type,level:1,builtAt:Date.now()})},`${buildingName(type)} を建設した`);
    audio()?.sfx?.('upgrade');
  }

  function grantDrop(source='quest'){
    const r=Math.random();let text='';
    if(r<.05){M.blueprints++;text='RARE DROP · 建築設計図 +1'}
    else if(r<.12){M.summonTickets++;text='DROP · 召喚券 +1'}
    else if(r<.24){M.hourglass++;text='DROP · 砂時計 +1'}
    else if(r<.36){const n=1+((Math.random()*3)|0);M.gems+=n;text=`DROP · 星晶 +${n}`}
    if(text){M.lastDropAt=Date.now();renderMeta();saveAll('mutation');ux()?.flashLog?.(text);audio()?.sfx?.('coin')}
    return !!text;
  }

  // Prefer an explicit quest-complete event when the Systems lane provides it.
  window.addEventListener('guild:questcomplete',()=>grantDrop('event'));
  // Current core fallback: visible Quest complete messages are still usable as a prototype hook.
  const source=$('log');
  if(source){new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes){const t=node.textContent||'';if(/Quest complete/i.test(t)&&Date.now()-questFallbackCooldown>700){questFallbackCooldown=Date.now();grantDrop('log')}}}).observe(source,{childList:true})}

  $('meta-gacha')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();drawGacha()});
  document.querySelectorAll('[data-build-type]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();build(btn.dataset.buildType)}));

  // Replace the temporary x1 lock from the UX layer with item-gated x2/x3.
  const speed=$('speed');
  if(speed){speed.onclick=e=>{e.preventDefault();e.stopPropagation();useHourglass()}}

  // Continuous autosave: core + progression state.
  setInterval(()=>saveAll('heartbeat'),1200);
  setInterval(()=>{
    if(M.boost.expiresAt&&Date.now()>=M.boost.expiresAt){
      M.boost={speed:1,expiresAt:0};api()?.setSpeed?.(1);renderMeta();saveAll('mutation');ux()?.flashLog?.('砂時計の効果が切れた · ×1');
    }
  },500);
  addEventListener('pagehide',()=>saveAll('lifecycle'));
  addEventListener('beforeunload',()=>{try{api()?.save?.();M.lastSavedAt=Date.now();localStorage.setItem(META_KEY,JSON.stringify(M))}catch(_){}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveAll('lifecycle')});
  document.addEventListener('freeze',()=>saveAll('lifecycle'));

  window.GUILD_PROGRESS=Object.freeze({
    getState:()=>JSON.parse(JSON.stringify(M)),
    save:()=>saveAll('manual'),
    build,
    drawGacha,
    useHourglass,
    grantDrop
  });

  loadMeta().then(()=>{renderMeta();ux()?.flashLog?.('AUTO SAVE ONLINE · 進行状況を復元')});
})();
