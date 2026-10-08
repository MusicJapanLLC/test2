'use strict';
/* Bounded, active-time village stories; outcomes are applied once by id. */
const Council=(()=>{
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{},arr=v=>Array.isArray(v)?v:[];
 const n=(v,f=0,max=1e9)=>Number.isFinite(v)?clamp(v,0,max):f;
 const templates=[
  {type:'mushroom',title:'キノコ税の導入について',body:'食堂が「キノコは野菜か会議費か」で止まっています。',options:[
   {label:'みんなの鍋に入れる',description:'ごはん12消費 / 支持+5・幸福+6 / 35秒後に木8',cost:{food:12},approval:5,happiness:6,reward:{wood:8},news:'鍋が評判に。お礼の薪が役場に届いた。'},
   {label:'研究予算をつける',description:'木10消費 / 支持+2・幸福+2 / 35秒後にごはん18',cost:{wood:10},approval:2,happiness:2,reward:{food:18},news:'キノコ研究、結論は「食べられる」。食堂に追加納品。'},
   {label:'いったん議事録にする',description:'費用なし / 支持−3・幸福−2 / 35秒後に石4',cost:{},approval:-3,happiness:-2,reward:{stone:4},news:'議事録の重し用に、石だけが届いた。'}]},
  {type:'nightshift',title:'夜勤の呼び名を変えたい',body:'衛兵より「夜勤を星空鑑賞会と呼べば士気が上がる」と陳情。',options:[
   {label:'夜食つき鑑賞会',description:'ごはん16消費 / 支持+6・幸福+5 / 35秒後に石10',cost:{food:16},approval:6,happiness:5,reward:{stone:10},news:'星より夜食が人気。衛兵が道の石を片づけた。'},
   {label:'正式名称は据え置き',description:'木8消費 / 支持+2・幸福+1 / 35秒後に木14',cost:{wood:8},approval:2,happiness:1,reward:{wood:14},news:'まじめな看板が完成。余った材木が返却された。'},
   {label:'各自の心で呼ぶ',description:'費用なし / 支持−2・幸福+1 / 35秒後にごはん4',cost:{},approval:-2,happiness:1,reward:{food:4},news:'呼び名は八つに増えたが、おやつは届いた。'}]},
  {type:'snore',title:'いびきは村の鐘ですか',body:'隣の小屋のいびきが、朝礼よりよく聞こえるそうです。',options:[
   {label:'壁を一枚増やす',description:'木18消費 / 支持+4・幸福+7 / 35秒後に石8',cost:{wood:18},approval:4,happiness:7,reward:{stone:8},news:'防音壁が好評。村人が余った石を寄付した。'},
   {label:'昼寝当番を決める',description:'ごはん8消費 / 支持+3・幸福+3 / 35秒後に木8',cost:{food:8},approval:3,happiness:3,reward:{wood:8},news:'昼寝当番は全員希望。起きた人が薪を運んだ。'},
   {label:'村の名物に認定',description:'費用なし / 支持−4・幸福−2 / 35秒後にごはん6',cost:{},approval:-4,happiness:-2,reward:{food:6},news:'いびき見学に客一人。お土産はおにぎりだった。'}]}
 ];
 const raw=obj(state.council),c=state.council={time:n(raw.time),approval:n(raw.approval,60,100),happiness:n(raw.happiness,65,100),news:arr(raw.news).filter(x=>x&&typeof x.text==='string').slice(-30).map(x=>({id:String(x.id||'news').slice(0,80),text:x.text.slice(0,180),time:n(x.time)})),pending:[],delayed:[],resolved:[...new Set(arr(raw.resolved).filter(x=>typeof x==='string'))].slice(-80),serial:Math.floor(n(raw.serial)),nextLife:n(raw.nextLife,25),nextPetition:n(raw.nextPetition,20),nightBossDay:Math.floor(n(raw.nightBossDay)),defenseMode:['balanced','rally','shelter'].includes(raw.defenseMode)?raw.defenseMode:'balanced',defenseRemaining:n(raw.defenseRemaining,0,12),defenseCooldown:n(raw.defenseCooldown,0,45)};
 const template=type=>templates.find(t=>t.type===type);
 function petition(t,id){return{id,type:t.type,title:t.title,body:t.body,options:t.options.map(o=>({label:o.label,description:o.description}))}}
 for(const p of arr(raw.pending)){if(p&&typeof p.id==='string'&&!c.resolved.includes(p.id)&&template(p.type)){c.pending.push(petition(template(p.type),p.id.slice(0,80)));break}}
 const delayedIds=new Set();for(const d of arr(raw.delayed).slice(0,8)){if(!d||typeof d.id!=='string'||!template(d.type)||!Number.isInteger(d.choice)||d.choice<0||d.choice>2||delayedIds.has(d.id)||!c.resolved.includes(d.id))continue;delayedIds.add(d.id);c.delayed.push({id:d.id,type:d.type,choice:d.choice,remaining:n(d.remaining,35,35)})}
 function news(text){c.news.push({id:'news-'+(++c.serial),text,time:c.time});if(c.news.length>30)c.news.shift()}
 function ensure(worker){const citizen=Citizens.ensure(worker),old=obj(citizen.life),factions=['rice','work','nap'];citizen.life=Object.assign(old,{mood:n(old.mood,65,100),faction:factions.includes(old.faction)?old.faction:factions[citizen.number%3]||'rice',friendId:typeof old.friendId==='string'&&old.friendId!==worker.id&&WorldGame.hasResident(old.friendId)?old.friendId:null,relation:Number.isFinite(old.relation)?clamp(old.relation,-10,10):0});return citizen.life}
 function choose(id,index){const p=c.pending.find(p=>p.id===id);if(!p||c.resolved.includes(id)||!Number.isInteger(index)||index<0||index>2)return false;const effect=template(p.type).options[index];if(!hasCost(effect.cost))return false;c.resolved.push(id);if(c.resolved.length>80)c.resolved.shift();c.pending=c.pending.filter(p=>p.id!==id);pay(effect.cost);c.approval=clamp(c.approval+effect.approval,0,100);c.happiness=clamp(c.happiness+effect.happiness,0,100);c.delayed.push({id,type:p.type,choice:index,remaining:35});for(const worker of state.workers){const life=ensure(worker);life.mood=clamp(life.mood+effect.happiness*.5,0,100)}news('決裁：'+p.title+' → '+effect.label);save();return true}
 function defense(mode){if(WorldGame.away||!['night','dusk'].includes(state.phase)||!['balanced','rally','shelter'].includes(mode)||c.defenseCooldown>0)return false;const cost=mode==='rally'?{food:12}:{};if(!hasCost(cost))return false;pay(cost);c.defenseMode=mode;c.defenseRemaining=12;c.defenseCooldown=45;news(({balanced:'平常運転：いつもの持ち場へ。',rally:'総員奮起：ごはん12で12秒間、村長と衛兵の攻撃+25%。',shelter:'避難優先：12秒間、被害−30%・体力回復。収穫は40%減。'})[mode]);save();return true}
 function lifeEvent(){const residents=state.workers.filter(w=>!w.dead&&!w.expeditionId);if(!residents.length)return;const a=residents[c.serial%residents.length],b=residents[(c.serial+1)%residents.length],life=ensure(a),other=ensure(b),kind=c.serial%3;const name=a.citizen.name,bname=b.citizen.name;if(a!==b){life.friendId=b.id;other.friendId=a.id}let text;
  if(kind===0){life.mood=clamp(life.mood+4,0,100);other.mood=clamp(other.mood+2,0,100);life.relation=clamp(life.relation+1,-10,10);text=a===b?name+'は道具を磨いて上機嫌。':name+'が'+bname+'の荷運びを手伝った。';Citizens.say(a,'そっち持つよ')}
  else if(kind===1){life.mood=clamp(life.mood-3,0,100);life.relation=clamp(life.relation-1,-10,10);text=a===b?name+'、会議の議題が思いつかない。':name+'と'+bname+'、おやつの配分でもめた。';Citizens.say(a,'半分の定義とは')}
  else{life.mood=clamp(life.mood+2,0,100);text=name+'が短い昼寝。本人いわく脳内会議。';Citizens.say(a,'会議中…むにゃ')}
  c.happiness=clamp(c.happiness+(kind===1?-.5:.5),0,100);news(text);
 }
 function tick(dt){if(Pocket.paused()||WorldGame.away||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,300);c.time+=dt;c.defenseCooldown=Math.max(0,c.defenseCooldown-dt);c.defenseRemaining=Math.max(0,c.defenseRemaining-dt);if(c.defenseRemaining===0)c.defenseMode='balanced';if(c.defenseMode==='shelter'){state.player.hp=Math.min(state.player.maxHp,state.player.hp+dt*1.5);for(const worker of state.workers)if(!worker.dead&&!worker.expeditionId)worker.hp=Math.min(worker.maxHp,worker.hp+dt)}
  if(c.time>=c.nextLife){c.nextLife=c.time+25;if(!window.VillageSocial)lifeEvent()}
  if(c.time>=c.nextPetition&&!c.pending.length){const t=templates[Math.floor(c.serial/2)%templates.length],id='petition-'+(++c.serial)+'-'+Math.floor(c.time);c.pending.push(petition(t,id));c.nextPetition=c.time+75;news('陳情到着：'+t.title);toast('陳情が届いた · 村長室で決裁できます');save()}
  const ready=c.delayed.filter(d=>(d.remaining=Math.max(0,d.remaining-dt))===0);if(ready.length){const ids=new Set(ready.map(d=>d.id));c.delayed=c.delayed.filter(d=>!ids.has(d.id));for(const d of ready){const effect=template(d.type).options[d.choice];for(const [k,v] of Object.entries(effect.reward))addRes(k,v);news(effect.news)}save()}
 }
 const human0=updateHumanLife;updateHumanLife=function(dt){human0(dt);tick(dt)};
 const speed0=workerMoveSpeed;workerMoveSpeed=function(role){const worker=Citizens.actor;return speed0(role)*(worker?(.93+ensure(worker).mood*.0012):1)};
 const speedAPI=Citizens.speed;Citizens.speed=function(worker){return speedAPI(worker)*(.93+ensure(worker).mood*.0012)};
 const hit0=hitNode;hitNode=function(node,source){if(WorldGame.away)return hit0(node,source);const key=node?.type==='tree'?'wood':node?.type==='rock'?'stone':'food',before=state[key];const result=hit0(node,source);if(c.defenseMode==='shelter'&&c.defenseRemaining>0)state[key]=before+Math.max(0,state[key]-before)*.6;return result};
 const damage0=damageEnemy;damageEnemy=function(e,dmg,...args){if(!WorldGame.away&&c.defenseMode==='rally'&&c.defenseRemaining>0)dmg*=1.25;return damage0(e,dmg,...args)};
 const playerDamage0=damagePlayer;damagePlayer=function(dmg,...args){return playerDamage0(dmg*(!WorldGame.away&&c.defenseMode==='shelter'&&c.defenseRemaining>0?.7:1),...args)};
 const workerDamage0=damageWorker;damageWorker=function(worker,dmg,...args){return workerDamage0(worker,dmg*(!WorldGame.away&&c.defenseMode==='shelter'&&c.defenseRemaining>0?.7:1),...args)};
 function nightBoss(){if(WorldGame.away||state.phase!=='night'||state.day%5!==0||c.nightBossDay>=state.day)return;c.nightBossDay=state.day;if(!state.enemies.some(e=>e.councilBoss&&!e.dead)){const B=bounds(),hp=210+Math.min(290,state.day*8);state.enemies.push({id:'council-warden-'+state.day,type:'warden',councilBoss:true,x:0,y:Math.max(WORLD.minY+30,B.t-180),hp,maxHp:hp,spd:15,dmg:12,anim:0,cool:2,hit:0,dead:false,death:0,seed:5,sunBurn:false,burnFx:0});news('夜の監査官が来訪。大きな王冠が目印、門で迎え撃とう。');toast('予告：夜の監査官！ 門へゆっくり接近中',true);A.sfx('warning')}save()}
 const phase0=phaseTick;phaseTick=function(dt){phase0(dt);nightBoss()};
 const enemyDraw0=drawEnemy;drawEnemy=function(e){enemyDraw0(e);if(e.councilBoss&&!e.dead){const x=sx(e.x),y=sy(e.y);rect(x-12,y-47,24,5,'#e9bf68');for(const dx of [-12,-2,8])rect(x+dx,y-53,4,7,'#e9bf68')}};
 for(const worker of state.workers)ensure(worker);
 return{get state(){return c},tick,choose,ensure,defense,modes:['balanced','rally','shelter']};
})();window.Council=Council;
