'use strict';
/* World settlement campaign. Geography is rebuilt; people and their ledgers travel. */
const Campaign=(()=>{
 if(!document.body.dataset.world)return null;
 const keys=['wood','stone','food'],num=(v,max=1e12)=>Number.isFinite(v)?clamp(v,0,max):0;
 const rows=[
  ['meadow','辞令だけは立派な村','草原','#b8ca7f','#455f42','最初の村。辞令の面積だけは首都級。','標識で運搬、共同畑で食料、作業台で仕事が育つ。',['道案内板','共同畑','共同作業台'],[30,20,14]],
  ['rain','雨漏り検査村','雨','#8ec9ca','#365951','屋根の検査をしていたら、空にも穴が見つかった。','雨道は移動84%。木道で108%へ。雨樽と乾燥小屋で収穫・仕事を改善。',['公共木道','雨樽農園','乾燥小屋'],[37,17,20]],
  ['desert','砂しか勝たん区','砂漠','#dfb974','#827047','砂の在庫だけ、議会を通さず増えている。','日差しで作業85%。日よけで110%へ。井戸と風よけで食料・移動を改善。',['風よけ柵','共同井戸','日よけ役場'],[19,32,12]],
  ['snow','ぬくぬく残業町','雪','#c8e0e6','#50656a','暖房の申請書が、先に暖を取っている。','雪道は移動88%、作業90%。除雪と暖炉で解消。温室で食料増。',['除雪の詰所','雪国温室','共同暖炉'],[32,24,12]],
  ['volcano','定時噴火工業団地','火山','#eaa17b','#584c49','噴火には定時がある。会議にはない。','12秒周期の灰で作業85%。排煙塔で安定。採石と運搬も改良。',['耐熱運搬路','石材選別場','排煙塔'],[22,38,13]],
  ['coast','出港未定の港','海','#95ccde','#526b65','出港予定は未定。歓迎の横断幕だけ完成した。','満潮は運搬90%。桟橋で110%へ。漁場と乾いた作業場が働く。',['積荷の桟橋','共同漁場','防潮作業場'],[27,21,24]],
  ['bamboo','竹より背伸び村','竹林','#acd281','#465b3f','竹の成長に、役職が追いつかない。','木の収穫25%増。運搬路と作業台で竹の出荷を助ける。',['竹の運搬路','竹林菜園','竹割り作業台'],[48,15,17]],
  ['orchard','おかわり果樹町','果樹園','#edb48f','#616545','実が落ちるたび、おかわりの決議が通る。','食料の再生時間が半分。畑を直すと収穫量も増える。',['収穫の小道','接ぎ木の畑','果実の作業台'],[26,16,39]],
  ['fog','視界良好という村','霧','#c2c9c4','#52625a','見通しだけは明るい、と議事録にある。','中央の縦道は移動20%増。道標を直すと速い道が広がる。',['霧の道標','見える菜園','見える作業台'],[31,24,20]],
  ['canyon','石にも席がある区','峡谷','#d6b18d','#786049','石の出席率が、たいへんよい。','石の採集作業25%増。選別場で石の収穫も増える。',['峡谷の運搬路','石材選別場','石工の作業台'],[18,46,16]],
  ['marsh','長靴支給待ち村','湿原','#9dc4a0','#3d5b50','長靴の支給には長靴で来てください。','湿原の食料35%増。木道を直すと移動も快適になる。',['湿原の木道','水辺の菜園','乾いた作業台'],[25,18,37]],
  ['wind','追い風出勤町','風の丘','#c9d6ac','#626e4c','風向き次第で、出勤が早まる。','12秒ごとに風向きが変わる。追い風方向の移動25%増。',['風よけの道','風車の菜園','風車の作業台'],[30,27,19]],
  ['springs','湯けむり出張所','温泉','#d9c9ad','#64664f','入浴中も、公務ということになった。','焚き火の120歩以内で体力回復。近くの作業も15%増。',['湯上がりの道','温泉菜園','休憩の作業台'],[27,31,21]],
  ['moon','夜更かし朝礼村','月夜','#adb8dc','#41485c','朝礼は月が高い時間に行います。','夜の村長の収穫50%増。灯りと畑が夜勤を助ける。',['月明かりの道','月見の畑','夜勤の作業台'],[33,26,25]],
  ['river','橋の向こうも同じ村','川辺','#a4ced9','#536960','橋を渡っても、担当課は同じだった。','荷物を持った住民の帰り道が30%速い。橋で納品がはかどる。',['橋の運搬路','川辺の畑','荷づくり作業台'],[30,22,25]],
  ['mushroom','きのこ議事堂','きのこ森','#d2afa3','#585343','きのこにも傘の持ち込み許可が出た。','食料を採ると、倒木の木材も少し一緒に拾う。',['きのこの小道','菌床の畑','きのこ作業台'],[24,17,43]],
  ['terrace','段取り棚田町','棚田','#cbd190','#606e47','段取りの段だけ、現地に完成している。','北の棚田で食料の収穫60%増。近くの食料を探してみよう。',['棚田の坂道','棚田の水門','段取り作業台'],[24,24,35]],
  ['depot','荷ほどき最終候補地','集積地','#d7c19d','#696454','最終候補が、また最終候補になった。','納品のあと8秒間、村の作業が25%速くなる。',['集積所の道','食料の仕分け場','荷ほどき作業台'],[30,30,28]]
 ];
 const definitions=rows.map((r,index)=>({id:r[0],name:r[1],biome:r[2],color:r[3],ground:r[4],description:r[5],gimmick:r[6],index,dialogue:['meadow','rain','desert','snow','volcano','coast','wood','food','meadow','stone','clay','wind','hotspring','night','coast','mushroom','food','finale'][index],weather:['none','rain','sand','snow','ash','spray','none','none','fog','sand','rain','wind','steam','none','spray','none','rain','none'][index],nodeCounts:r[8],goals:index?[
  {id:'harvest',label:'到着後に資源を40採る',target:40},{id:'build',label:'新しい建物を2棟建てる',target:2},{id:'landmarks',label:'地域の設備を1か所直す',target:1}
 ]:[{id:'build',label:'建物を3棟建てる',target:3},{id:'people',label:'住民を3人迎える',target:3},{id:'wall',label:'防壁を建てる',target:1}],projects:r[7].map((name,i)=>({id:r[0]+'-'+i,name,x:[-240,235,0][i],y:[55,70,-235][i],cost:[{wood:26,stone:12},{wood:18,stone:22},{wood:34,stone:24}][i],benefit:[index===1?'雨道を克服・移動108%':index===3?'除雪・移動105%':index===5?'満潮を克服・移動110%':index===8?'速い中央道が左右150歩に広がる':'運搬と歩行が10%速くなる',[4,9].includes(index)?'石の採集量が25%増える':'食料の採集量が25%増える',index===2?'日差しを克服・作業110%':index===3?'暖房・作業110%':index===4?'灰を除いて常時作業110%':'作業が10%速くなる'][i]}))}));
 for(const d of definitions){for(const p of d.projects){Object.freeze(p.cost);Object.freeze(p)}d.projects=Object.freeze(d.projects);d.goals=Object.freeze(d.goals.map(Object.freeze));Object.freeze(d.nodeCounts);Object.freeze(d)}Object.freeze(definitions);
 const def=id=>definitions.find(d=>d.id===id),raw=Chief.state.campaign||{};
 function normalize(r){const id=def(r.stageId)?r.stageId:'meadow',obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};r=obj(r);const c={version:1,stageId:id,settlement:Math.floor(num(r.settlement,1e6)),elapsed:num(r.elapsed),arrivalDay:num(r.arrivalDay)||state.day,harvest:num(r.harvest),built:Math.floor(num(r.built,1000)),completed:!!r.completed,momentumRemaining:num(r.momentumRemaining,8),stamps:[],repairs:{},visits:{},best:{},history:[],campIds:[],supply:{}};
  c.stamps=[...new Set((Array.isArray(r.stamps)?r.stamps:[]).filter(x=>def(x)))].slice(0,definitions.length);for(const d of definitions){c.visits[d.id]=Math.floor(num(obj(r.visits)[d.id],1e6));c.best[d.id]=Math.floor(num(obj(r.best)[d.id],3));for(const p of d.projects)if(d.id===id)c.repairs[p.id]=obj(r.repairs)[p.id]===true}if(!c.visits[id])c.visits[id]=1;
  c.campIds=[...new Set((Array.isArray(r.campIds)?r.campIds:[]).filter(id=>typeof id==='string'&&state.workers.some(w=>w.id===id)))].slice(0,300);
  for(const k of keys)c.supply[k]=num(obj(r.supply)[k]);
  c.history=(Array.isArray(r.history)?r.history:[]).filter(h=>h&&def(h.id)).slice(-18).map(h=>({id:h.id,day:Math.floor(num(h.day)),visit:Math.floor(num(h.visit,1e6)),completed:!!h.completed,buildings:Math.floor(num(h.buildings,1000)),residents:Math.floor(num(h.residents,300))}));return c;
 }
 const c=Chief.state.campaign=normalize(raw);let moving=false;
 const current=()=>def(c.stageId),active=()=>!WorldGame.away&&!Pocket.paused()&&document.body.dataset.resetting!=='true';
 function goals(){const entries=c.settlement>0&&c.stageId==='meadow'?definitions[1].goals:current().goals;return entries.map(g=>{const value=g.id==='harvest'?c.harvest:g.id==='build'?(c.settlement===0?state.buildings.length:c.built):g.id==='people'?state.workers.filter(w=>!w.dead).length:g.id==='wall'?(state.palisade.built||state.stats.bestWall>0?1:0):current().projects.filter(p=>c.repairs[p.id]).length;return{...g,value:Math.min(g.target,value),done:value>=g.target}})}
 function complete(){if(c.completed||!goals().every(g=>g.done))return;c.completed=true;c.best[c.stageId]=3;if(!c.stamps.includes(c.stageId))c.stamps.push(c.stageId);Logistics.emit('campaign-clear',null,{stageId:c.stageId});toast(current().name+' · 開拓印を押した！ 世界から次の村へ');save()}
 // Wind follows the current job destination, including off-center warehouses/homes.
 function workDestination(w){
  if(w.state==='returning-camp')return{x:0,y:35};
  if(w.state==='returning-home'){const h=state.buildings.find(b=>b.type==='hut'&&b.id===w.homeId)||(w.homeId==='caravan-camp'?{x:0,y:30}:null);return h?homePoint(w,h):null}
  if(w.state==='hauling'||w.cargoMode==='returning'||w.cargoMode==='blocked')return Logistics.depot();
  return state.nodes.find(n=>n.id===w.targetId&&n.alive)||null;
 }
 function modifiers(subject=state.player){if(WorldGame.away)return{move:1,work:1,yield:{wood:1,stone:1,food:1},weather:'none',weatherActive:false};const d=current(),fixed=i=>c.repairs[d.id+'-'+i],wave=c.elapsed%24<10,ash=c.elapsed%12<5;let move=1,work=1;
  if(d.id==='rain')move=fixed(0)?1.08:.84;else if(d.id==='snow'){move=fixed(0)?1.05:.88;work=fixed(2)?1.1:.9}else if(d.id==='desert')work=fixed(2)?1.1:.85;else if(d.id==='volcano')work=fixed(2)?1.1:ash?.85:1.05;else if(d.id==='coast')move=fixed(0)?1.1:wave?.9:1;
  if(d.id==='fog')move=Math.abs(subject.x)<(fixed(0)?150:65)?1.2:1;
  if(d.id==='wind'){const direction=c.elapsed%24<12?1:-1,destination=subject===state.player?null:workDestination(subject),dx=subject===state.player?input.x:destination?destination.x-subject.x:0;if(dx*direction>0)move=1.25}
  if(d.id==='river'&&subject!==state.player&&Logistics.cargoTotal(subject)>0)move=1.3;
  if(d.id==='springs'&&dist(subject,{x:0,y:30})<120)work=1.15;
  if(d.id==='canyon'&&(subject.role==='stone'||subject===state.player&&autoTarget?.type==='rock'))work=1.25;
  if(d.id==='depot'&&c.momentumRemaining>0)work=1.25;
  if(fixed(0)&&!['rain','snow','coast','fog'].includes(d.id))move*=1.1;if(fixed(2)&&!['snow','desert','volcano'].includes(d.id))work*=1.1;const yieldRates={wood:1,stone:1,food:1};if(d.id==='bamboo')yieldRates.wood=1.25;if(d.id==='marsh')yieldRates.food=1.35;
  if(d.id==='moon'&&['night','dusk'].includes(state.phase)&&subject===state.player)for(const k of keys)yieldRates[k]=1.5;
  if(d.id==='terrace'&&subject.y<0)yieldRates.food=1.6;
  if(fixed(1))yieldRates[['volcano','canyon'].includes(d.id)?'stone':'food']*=1.25;return{move,work,yield:yieldRates,weather:d.weather,weatherActive:d.id==='volcano'?ash:d.id==='coast'?wave:d.weather!=='none'};
 }
 function landmarks(){return current().projects.map(p=>({...p,cost:{...p.cost},repaired:!!c.repairs[p.id],distance:Math.round(dist(state.player,p)),near:!WorldGame.away&&dist(state.player,p)<=66,affordable:hasCost(p.cost)}))}
 function interact(id){const p=landmarks().find(p=>p.id===id);if(!p)return{ok:false,reason:'この村の設備ではない'};if(WorldGame.away||document.body.dataset.resetting==='true')return{ok:false,reason:'村へ戻ってから修理しよう'};if(p.repaired)return{ok:false,reason:'修理済み'};if(!p.near)return{ok:false,reason:'設備から66歩以内で修理しよう'};if(!p.affordable)return{ok:false,reason:'修理の資源が足りない'};pay(p.cost);c.repairs[id]=true;Logistics.emit('landmark-repaired',null,{stageId:c.stageId,landmarkId:id});A.sfx('build');fxBurst(p.x,p.y,current().color,15);toast(p.name+'完成 · '+p.benefit);complete();save();return{ok:true,reason:p.benefit}}
 function canMove(id){const destination=def(id);if(moving||document.body.dataset.resetting==='true')return{ok:false,reason:'引っ越しの保存中'};if(!destination)return{ok:false,reason:'行き先が見つからない'};if(WorldGame.away)return{ok:false,reason:'探索から村へ帰ろう'};if(WorldGame.state.expeditions.length||state.workers.some(w=>w.expeditionId))return{ok:false,reason:'遠征隊の報告を受け取り、全員を村へ戻そう'};if(state.player.down>0||state.enemies.some(e=>!e.dead)||state.projectiles.some(p=>p.kind==='spit'))return{ok:false,reason:'村の戦闘が終わってから出発しよう'};const cleared=c.completed||goals().every(g=>g.done);if(!cleared)return{ok:false,reason:'今の村の目標を3つ達成しよう'};const next=definitions[current().index+1];if(c.stamps.length<definitions.length&&id!==next?.id)return{ok:false,reason:'次の開拓地から順に訪ねよう'};return{ok:true,reason:c.stamps.length>=definitions.length?'同じ土地に新しい村を作れる':'次の開拓地へ出発できる'}}
 function freshNodes(d,visit){const out=[],add=(type,x,y,starter=false)=>{const hp=type==='tree'?18:type==='rock'?26:12;out.push({id:'camp-'+visit+'-'+out.length,type,x,y,hp,maxHp:hp,alive:true,respawnAt:0,starter,seed:out.length*.137%1})};for(const [i,type]of ['tree','rock','food'].entries()){add(type,-70+i*70,170,true);add(type,-105+i*90,225,true);for(let j=0;j<d.nodeCounts[i];j++){const angle=j*2.399+i*1.7+d.index*.5,ring=255+(j%5)*58;add(type,Math.cos(angle)*ring,Math.sin(angle)*ring*.85)}}return out}
 function migrate(id,reload=true){const allowed=canMove(id);if(!allowed.ok)return allowed;moving=true;let oldPrimary,oldBackup,oldBefore;const beforeKey=SAVE+'-before-campaign';try{
   const original=serial(),next=JSON.parse(original),d=def(id),oldCampaign=JSON.parse(JSON.stringify(c));oldCampaign.completed=true;if(!oldCampaign.stamps.includes(c.stageId))oldCampaign.stamps.push(c.stageId);oldCampaign.best[c.stageId]=3;
   oldCampaign.history.push({id:c.stageId,day:state.day,visit:c.visits[c.stageId],completed:true,buildings:state.buildings.length,residents:state.workers.length});oldCampaign.history=oldCampaign.history.slice(-18);
   Object.assign(oldCampaign,{stageId:id,settlement:Math.min(1e6,c.settlement+1),elapsed:0,arrivalDay:state.day,harvest:0,built:0,momentumRemaining:0,completed:false,repairs:{},campIds:next.workers.map(w=>w.id).slice(0,300),supply:Object.fromEntries(keys.map(k=>[k,num(next[k])]))});oldCampaign.visits[id]=Math.min(1e6,(oldCampaign.visits[id]||0)+1);next.chief.campaign=oldCampaign;
   next.buildings=[];next.nodes=freshNodes(d,oldCampaign.settlement);next.palisade={built:false,level:0,hp:0,maxHp:0,builtAt:0};next.enemies=[];next.projectiles=[];next.cycle=.17;next.phase='day';next.player={...next.player,x:0,y:120,vx:0,vy:0,swing:0};
   for(const [i,w]of next.workers.entries()){Object.assign(w,{x:(i%9-4)*9,y:38+Math.floor(i/9)*3,targetId:null,homeId:null,state:'idle',hiddenAtHome:false,work:0,cargoMode:keys.some(k=>w.cargo?.[k]>0)?'returning':'working'});delete w._gateTransit;delete w.say;delete w.sayUntil}
   // Fallen parcels travel as baggage too; they must remain reachable in the new camp.
   for(const p of next.chief.logistics?.parcels||[]){p.x=0;p.y=50}if(next.chief.social)next.chief.social.active=null;
   if(window.VillageTransfer)VillageTransfer.validate(next);const text=JSON.stringify(next);
   oldPrimary=localStorage.getItem(SAVE);oldBackup=localStorage.getItem(BACKUP);oldBefore=localStorage.getItem(beforeKey);
   try{localStorage.setItem(beforeKey,original);localStorage.setItem(BACKUP,original);localStorage.setItem(SAVE,text);if(localStorage.getItem(SAVE)!==text)throw Error('write verification failed')}
   catch(error){for(const [key,value]of [[SAVE,oldPrimary],[BACKUP,oldBackup],[beforeKey,oldBefore]])try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch{}throw error}
   document.body.dataset.resetting='true';Logistics.emit('campaign-departure',null,{stageId:id});if(reload)location.reload();return{ok:true,reason:d.name+'へ出発',stageId:id};
  }catch(error){moving=false;return{ok:false,reason:'保存できなかった。空き容量を確認してもう一度。'}}
 }
 function tick(dt){if(!active()||!Number.isFinite(dt)||dt<=0)return;c.elapsed=Math.min(1e12,c.elapsed+Math.min(dt,300));c.momentumRemaining=Math.max(0,c.momentumRemaining-dt);if(c.stageId==='springs'){for(const w of [state.player,...state.workers])if(!w.dead&&!w.expeditionId&&dist(w,{x:0,y:30})<120&&w.hp<w.maxHp)w.hp=Math.min(w.maxHp,w.hp+Math.min(dt,1)*.8)}c.best[c.stageId]=Math.max(c.best[c.stageId]||0,goals().filter(g=>g.done).length);complete()}
 function report(){const d=current();return{stageId:c.stageId,name:d.name,index:d.index,settlement:c.settlement,elapsed:c.elapsed,goals:goals(),completed:c.completed||goals().every(g=>g.done),stamps:[...c.stamps],visits:{...c.visits},best:{...c.best},history:c.history.map(h=>({...h})),nextId:definitions[d.index+1]?.id||(c.stamps.length===definitions.length?'meadow':null),campResidents:c.campIds.length,overflow:Object.fromEntries(keys.map(k=>[k,Math.max(0,state[k]-baseCapacity()[k])])),modifiers:modifiers()}}
 // Finite carried supplies remain a capacity floor until spent; no resources are granted.
 const baseCapacity=capacity;capacity=function(){const out=baseCapacity();for(const k of keys)out[k]=Math.max(out[k],c.supply[k]);return out};
 capResource=function(k){if(keys.includes(k))state[k]=Math.max(0,Number.isFinite(state[k])?state[k]:0)};
 const add0=addRes;addRes=function(k,n){if(keys.includes(k)&&n>0){const amount=Math.min(n,Math.max(0,capacity()[k]-state[k]));return add0(k,amount)}return add0(k,n)};
 // Camp slots preserve the old roster; new houses alone create additional vacancies.
 const houses0=houseCapacity;houseCapacity=function(){return houses0()+c.campIds.length};maxWorkers=function(){return Math.min(300,c.campIds.length+Math.min(POP_CAP[rankIndex()],houses0()))};
 const home0=ensureWorkerHome;ensureWorkerHome=function(w){if(c.campIds.includes(w.id)&&!state.buildings.some(b=>b.type==='hut'&&b.id===w.homeId)){w.homeId='caravan-camp';return{id:'caravan-camp',type:'hut',x:0,y:30,level:1}}return home0(w)};
 const move0=movement;movement=function(dt){return move0(dt*modifiers().move)};
 const workerSpeed0=workerMoveSpeed;workerMoveSpeed=function(role){return workerSpeed0(role)*modifiers(Citizens.actor||state.player).move};
 const cycle0=workerCycle;workerCycle=function(role){return cycle0(role)/modifiers(Citizens.actor||state.player).work};
 const gather0=playerGather;playerGather=function(dt){return gather0(dt*modifiers().work)};
 let gathering=null;const yield0=addRes;addRes=function(k,n){return yield0(k,n*(gathering?modifiers().yield[k]||1:1))};const harvest0=Logistics.harvest;Logistics.harvest=function(w,k,n,node){return harvest0(w,k,n*modifiers(w).yield[k],node)};
 const hit0=hitNode;hitNode=function(n,source='player'){if(WorldGame.away)return hit0(n,source);const k=n?.type==='tree'?'wood':n?.type==='rock'?'stone':'food',before=keys.reduce((sum,key)=>sum+state[key],0),wasAlive=n?.alive;gathering=k;try{const result=hit0(n,source);if(wasAlive&&!n.alive&&c.stageId==='orchard'&&k==='food')n.respawnAt=Date.now()+Math.max(0,n.respawnAt-Date.now())*.5;
   if(c.stageId==='mushroom'&&k==='food'&&wasAlive){if(source==='worker'&&Citizens.actor)Logistics.harvest(Citizens.actor,'wood',.3,n);else if(state.food>before-keys.filter(key=>key!=='food').reduce((sum,key)=>sum+state[key],0))addRes('wood',.3)}return result}finally{gathering=null;if(source!=='worker')c.harvest=Math.min(1e12,c.harvest+Math.max(0,keys.reduce((sum,key)=>sum+state[key],0)-before))}};
 window.addEventListener('village-event',e=>{if(WorldGame.away)return;if(e.detail?.type==='harvest')c.harvest=Math.min(1e12,c.harvest+num(e.detail.amount,100));if(e.detail?.type==='delivery'&&c.stageId==='depot')c.momentumRemaining=8});

 const build0=build;build=function(...args){const count=state.buildings.length,result=build0(...args);if(!WorldGame.away&&state.buildings.length>count){c.built=Math.min(1000,c.built+state.buildings.length-count);complete();save()}return result};
 const reset0=hardResetGame;hardResetGame=function(...args){try{localStorage.removeItem(SAVE+'-before-campaign')}catch{}return reset0(...args)};
 const human0=updateHumanLife;updateHumanLife=function(dt){const result=human0(dt);tick(dt);return result};
 return{definitions,state:c,current,goals,landmarks,interact,canMove,migrate,tick,modifiers,report};
})();window.Campaign=Campaign;
