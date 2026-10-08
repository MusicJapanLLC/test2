'use strict';
const Citizens=(()=>{
 const traits=[
 {name:'几帳面',color:'#88a5a3',wood:-.06,stone:.22,food:0,speed:.98,combat:1,quote:'石の向き、揃えていい？',desc:'採石 +22% · 伐採 −6%'},
 {name:'脳筋',color:'#c97c54',wood:.22,stone:0,food:-.05,speed:1,combat:1.18,quote:'だいたい斧で直る',desc:'伐採 +22% · 戦闘 +18% · 採集 −5%'},
 {name:'食いしん坊',color:'#b3b16d',wood:0,stone:0,food:.25,speed:.92,combat:1,quote:'これ、経費のごはん？',desc:'食料 +25% · 移動 −8%'},
 {name:'せっかち',color:'#dcac63',wood:-.08,stone:-.08,food:-.08,speed:1.22,combat:1,quote:'まだ？ もう行ったけど',desc:'移動 +22% · 収穫 −8%'},
 {name:'ビビり',color:'#b69eb5',wood:.06,stone:.06,food:.06,speed:1.12,combat:.85,quote:'勇気は在庫切れです',desc:'収穫 +6% · 移動 +12% · 戦闘 −15%'},
 {name:'夜の住人',color:'#8195b9',wood:0,stone:0,food:0,speed:1,combat:1.15,quote:'朝礼は夜にして',desc:'戦闘 +15% · 夜の移動 +15%'}
 ];
 const names=['ポン','ヌボ','モチ','ゴン','ネム','マメ','カブ','ムギ','タロ','ボブ','チビ','ヤギ'];
 function ensure(w){if(!w.citizen){const id=Chief.state.serial++;w.citizen={number:id,name:names[id%names.length]+(id>=names.length?Math.floor(id/names.length)+1:''),trait:id%traits.length,level:1,xp:0,trainedAt:-100,chatAt:Chief.state.time+3+id%9,total:0};w.pocketName=w.citizen.name}const n=w.citizen;n.trait=clamp(Math.floor(n.trait)||0,0,5);n.level=clamp(Math.floor(n.level)||1,1,20);n.xp=Math.max(0,Number(n.xp)||0);return n}
 function trait(w){return traits[ensure(w).trait]}
 function nextXP(w){return 22+ensure(w).level*ensure(w).level*4}
 function gain(w,amount){const n=ensure(w);if(n.level>=20)return;n.xp+=amount;n.total=(n.total||0)+amount;while(n.level<20&&n.xp>=nextXP(w)){n.xp-=nextXP(w);n.level++;say(w,'上達した！ Lv.'+n.level,true);if(dist(w,state.player)<170)fxBurst(w.x,w.y,'#efdc87',10)}if(n.level>=20)n.xp=0}
 function yieldBonus(w,role){return trait(w)[role]||0}
 function speed(w){return trait(w).speed*(ensure(w).trait===5&&['night','dusk'].includes(state.phase)?1.15:1)}
 function trainCost(w){const L=ensure(w).level;return{wood:10+L*4,food:14+L*6}}
 function train(id){const w=state.workers.find(w=>w.id===id&&!w.dead);if(!w||ensure(w).level>=20||Chief.state.time-w.citizen.trainedAt<10||!hasCost(trainCost(w)))return false;pay(trainCost(w));w.citizen.trainedAt=Chief.state.time;gain(w,32);A.voice(w.citizen.trait,true);save();return true}
 function reassign(id,role){const w=state.workers.find(w=>w.id===id&&!w.dead);if(!w||!ROLE_NAMES[role]||(role==='guard'&&!state.buildings.some(b=>b.type==='barracks')))return false;const health=clamp(w.hp/w.maxHp,0,1);w.role=role;w.maxHp=role==='guard'?120:85;w.hp=w.maxHp*health;w.targetId=null;if(window.Logistics){w.work=0;if(Logistics.cargoTotal(w)>0)w.cargoMode='returning'}delete w._gateTransit;save();return true}
 let speakingUntil=0;
 function say(w,text,excited=false){if(Chief.state.time<speakingUntil||dist(w,state.player)>170||w.hiddenAtHome)return;speakingUntil=Chief.state.time+3;w.say=text;w.sayUntil=Pocket.clock+3;A.voice(ensure(w).trait,excited)}
 const baseSpeed=workerMoveSpeed;workerMoveSpeed=role=>baseSpeed(role)*(Citizens.actor?speed(Citizens.actor):1);
 const oldHire=hire;hire=function(role){const count=state.workers.length;oldHire(role);if(state.workers.length>count){const w=state.workers.at(-1);ensure(w);if(window.Logistics)Logistics.ensure(w);say(w,trait(w).quote,true);save()}};
 const oldDamage=damageEnemy;damageEnemy=function(e,dmg,ax,ay,guard){const w=Citizens.actor;if(w)dmg*=trait(w).combat*(1+(ensure(w).level-1)*.015);return oldDamage(e,dmg,ax,ay,guard)};
 updateWorkers=function(dt){const claimed=new Set();for(const w of state.workers)if(w.targetId&&w.role!=='guard')claimed.add(w.targetId);
  for(const w of state.workers){ensure(w);ensureWorkerVitals(w);ensureWorkerHome(w);if(w.dead)continue;Citizens.actor=w;Chief.setActor(w);w.cool=Math.max(0,(w.cool||0)-dt);w.hit=Math.max(0,(w.hit||0)-dt);
   if(!window.WorldGame&&Chief.state.time>=w.citizen.chatAt){w.citizen.chatAt=Chief.state.time+14+w.citizen.number%8;say(w,trait(w).quote)}
   if(w.role==='guard'){const first=state.projectiles.length;guardDefendSector(w,dt);for(const p of state.projectiles.slice(first))if(p.kind==='arrow')p.damage*=trait(w).combat*(1+(ensure(w).level-1)*.015);if(state.enemies.some(e=>!e.dead&&dist(w,e)<220))gain(w,dt*.4);continue}
   if(isCivilianHomeTime()){gfGoHome(w,dt);continue}
   w.hiddenAtHome=false;if(workerCombat(w,dt))continue;
   const type=workerResourceType(w),key=resourceStateKey(type);if(state[key]>=capacity()[key]-.01){w.state='storage-full';w.targetId=null;continue}
   let n=state.nodes.find(n=>n.id===w.targetId&&n.alive);if(!n){n=nearestNode(w,type,claimed);w.targetId=n?.id||null;if(n)claimed.add(n.id)}if(!n){w.state='idle';continue}
   if(dist(w,n)>31){w.state='moving';gfMove(w,n.x,n.y,workerMoveSpeed(w.role),dt)}else{delete w._gateTransit;w.state='working';w.work=(w.work||0)+dt*(.7+.3*state.morale/100);if(w.work>=workerCycle(w.role)){w.work=0;hitNode(n,'worker');if(!n.alive)w.targetId=null}}
  }
  Citizens.actor=null;Chief.setActor(null);towerCombat(dt);
 };
 for(const w of state.workers)ensure(w);
 return{traits,ensure,trait,nextXP,gain,yieldBonus,speed,trainCost,train,reassign,say,actor:null};
})();window.Citizens=Citizens;
