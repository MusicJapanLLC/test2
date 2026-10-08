/* Choose and sanitize a private world save before the legacy loader runs. */
(()=>{'use strict';
 const key=document.body.dataset.save||'guild-chief-world-v3',marker=key+'-imported';
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 function read(name){try{const raw=localStorage.getItem(name),s=JSON.parse(raw);if(!object(s)||s.version!==16)return null;return s}catch{return null}}
 function prepare(s){
  for(const k of ['nodes','buildings','workers','enemies','projectiles'])s[k]=(Array.isArray(s[k])?s[k]:[]).filter(object);
  const seen=new Set();s.workers=s.workers.filter((w,i)=>{if(typeof w.id!=='string'||!w.id)w.id='world-citizen-'+i;if(seen.has(w.id))return false;seen.add(w.id);if(!object(w.citizen))delete w.citizen;return true});
  // Optional module records are normalized by their owners after the core boots.
  for(const k of ['world','council'])if(!object(s[k]))delete s[k];
  return s;
 }
 try{
  delete document.body.dataset.importSave;
  let selected=read(key)||read(key+'-backup');
  if(!selected&&!localStorage.getItem(marker)){
   for(const candidate of ['guild-chief-v21','guild-chief-v21-backup','guild-pocket-v2','guild-pocket-v2-backup']){
    selected=read(candidate);if(selected){document.body.dataset.importSave=candidate;break}
   }
  }
  if(selected)localStorage.setItem(key,JSON.stringify(prepare(selected)));
  localStorage.setItem(marker,'1');
 }catch{ /* Core retains its primary/backup fallback when storage is unavailable. */ }
})();
