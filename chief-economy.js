'use strict';
const Chief=(()=>{
 const defaults={version:1,time:0,charter:0,contracts:0,forge:null,autoForge:false,serial:0,monument:0,voiceAt:0,earnedIron:0};
 const migrated=!state.chief;state.chief={...defaults,...(state.chief||{})};const c=state.chief;
 for(const key of ['time','charter','contracts','serial','monument','earnedIron'])if(!Number.isFinite(c[key])||c[key]<0)c[key]=0;
 c.charter=Math.min(20,Math.floor(c.charter));c.monument=Math.min(12,Math.floor(c.monument));
 if(migrated)state.renown+=Math.max(0,state.hourglass||0)*2;
 state.hourglass=0;state.boost=1;state.boostUntil=0;
 if(c.forge&&(!Number.isFinite(c.forge.remaining)||c.forge.remaining<0))c.forge=null;
 BUILD.warehouse.unlock=0;BUILD.warehouse.max=20;BUILD.lumber.max=12;BUILD.quarry.max=12;
 BUILD.hut.max=12;BUILD.lantern.max=8;BUILD.watchtower.max=10;
 GROUP_TYPES.hut.max=12;GROUP_TYPES.lantern.max=8;GROUP_TYPES.watchtower.max=10;
 for(const cfg of Object.values(WORK_TECH))cfg.max=25;
 BUILD.forge={name:'製鉄所',base:{wood:70,stone:50},repeat:false,max:12,unlock:0};
 const labels=['迷子の商隊へ納品','隣村の謎の祭り','城門の定期点検','村長像の試作品','食堂の買い出し','段ボールではない城'];
 let combo=0,comboUntil=0,actor=null;
 capacity=function(){const L=state.buildings.find(b=>b.type==='warehouse')?.level||0;return{wood:300+220*L+c.charter*45,stone:240+170*L+c.charter*35,food:220+130*L+c.charter*25}};
 const oldCost=costFor;costFor=function(type,L=1){const out=oldCost(type,L);if(L>3&&type!=='palisade'&&type!=='guild')out.iron=Math.max(out.iron||0,Math.floor((L-2)*1.25));if(L>1)for(const k of ['wood','stone','food'])if(out[k])out[k]=Math.min(out[k],Math.floor(capacity()[k]*.85));return out};
 const groupCost=groupUpgradeCost;groupUpgradeCost=function(type,next){const c=groupCost(type,next);for(const k of ['wood','stone','food'])if(c[k])c[k]=Math.min(c[k],Math.floor(capacity()[k]*.85));return c};
 workerCycle=role=>(role==='wood'?1.5:role==='stone'?1.8:1.65)/(1+.018*techLevel('tooling'));
 workerYieldMultiplier=role=>1+Math.min(.65,techLevel(role==='wood'?'forestry':role==='stone'?'masonry':'foraging')*.022);
 workerMoveSpeed=role=>(role==='guard'?43:42)*(1+.015*techLevel('logistics'));
 techCost=function(key,L){const b={forestry:[50,22],masonry:[28,50],foraging:[38,24],logistics:[48,32],tooling:[36,40]}[key];return{wood:Math.ceil(b[0]+L*20),stone:Math.ceil(b[1]+L*16),...(L>=4?{iron:Math.floor(L/3)}:{})}};
 const cap0=capResource;capResource=function(type){cap0(type)};
 function forgeCost(){return{wood:12,stone:18}}
 function startForge(){if(c.forge||!state.buildings.some(b=>b.type==='forge')||!hasCost(forgeCost()))return false;pay(forgeCost());const L=state.buildings.find(b=>b.type==='forge').level;c.forge={remaining:Math.max(4,12/(1+(L-1)*.12)),quantity:1};A.sfx('mine');save();return true}
 function contract(){const id=c.contracts,tier=Math.floor(id/6),kind=id%6,cap=capacity(),grow=1+tier*.3;let cost=kind===0?{wood:75,food:25}:kind===1?{food:65,stone:30}:kind===2?{wood:55,stone:65}:kind===3?{wood:80,stone:45}:kind===4?{food:85,wood:30}:{stone:95,wood:40};for(const k of Object.keys(cost))cost[k]=Math.min(Math.floor(cap[k]*.72),Math.ceil(cost[k]*grow));return{id,name:labels[kind],cost,renown:2+Math.min(6,tier)}}
 function fulfill(expected){const job=contract();if(expected!==job.id||!hasCost(job.cost))return false;pay(job.cost);state.renown+=job.renown;c.contracts++;A.sfx('rare');toast('納品完了！ 名声 +'+job.renown);save();return true}
 function charterCost(){const L=c.charter+1;return{wood:90+L*55,stone:65+L*40,iron:1+L,renown:3+Math.floor(L*.65)}}
 function charter(){if(c.charter>=20||!hasCost(charterCost()))return false;pay(charterCost());c.charter++;const hp=120+c.charter*4;state.player.maxHp=hp;state.player.hp=Math.min(hp,state.player.hp+4);A.sfx('build');toast('開拓章 '+c.charter+' · 保管量と村長の体力が上昇');save();return true}
 function monumentCost(){const L=c.monument+1;return{wood:80+L*35,stone:100+L*45,iron:L*2,renown:L*3}}
 function monument(){if(c.monument>=12||!hasCost(monumentCost()))return false;pay(monumentCost());c.monument++;state.morale=Math.min(100,state.morale+8);A.sfx('rare');toast('村長像 Lv.'+c.monument+' · 本人だけ大満足');save();return true}
 function gatherMultiplier(source,type){const work=source==='worker',role=type==='tree'?'wood':type==='rock'?'stone':'food';const tech=work?workerYieldMultiplier(role)-1:0;const L=(type==='food'?0:state.buildings.find(b=>b.type===(type==='tree'?'lumber':'quarry'))?.level)||0;const trait=work&&actor&&window.Citizens?Citizens.yieldBonus(actor,role):0;const skill=work&&actor?Math.min(.35,((actor.citizen?.level||1)-1)*.018):0;return Math.max(.5,Math.min(2.2,1+tech+L*.025+(state.pocket.policies.harvest||0)*.06+trait+skill))}
 hitNode=function(n,source='player'){if(!n?.alive)return;const key=n.type==='tree'?'wood':n.type==='rock'?'stone':'food',work=source==='worker',hauling=work&&actor&&window.Logistics;if(!hauling&&state[key]>=capacity()[key])return;let gain=(work?(n.type==='tree'?.85:n.type==='rock'?.72:.8):(n.type==='rock'?1.05:1.3))*gatherMultiplier(source,n.type);
  if(!work){combo=c.time<comboUntil?combo+1:1;comboUntil=c.time+2.2;gain*=1+Math.min(.15,combo*.01);if(Pocket.rally>0)gain*=2;state.pocket.gathered+=gain;n.pocketHit=Pocket.clock}
  if(hauling){gain*=Logistics.harvestFactor;if(window.Council&&Council.state.defenseMode==='shelter'&&Council.state.defenseRemaining>0)gain*=.6}
  const before=state[key];let actual;if(hauling)actual=Logistics.harvest(actor,key,gain,n);else{addRes(key,gain);actual=state[key]-before}if(actual<=0)return;n.hp-=work?1:2;if(actual>0){if(work&&actor&&window.Citizens)Citizens.gain(actor,.7);if(!work||dist(state.player,n)<130){floatText(n.x,n.y-22,'+'+actual.toFixed(1),COLORS[key]);fxBurst(n.x,n.y,COLORS[key],work?2:5,.7);A.sfx(n.type==='tree'?'chop':n.type==='rock'?'mine':'pickup')}}
  if(n.hp<=0){n.alive=false;n.respawnAt=Date.now()+(n.type==='tree'?16000:n.type==='rock'?19000:13000);autoTarget=null;fxBurst(n.x,n.y,COLORS[key],10,1.1)}
 };
 playerGather=function(dt){respawnNodes();if(input.mag>.2){autoTarget=null;playerWork=0;return}if(!autoTarget||!autoTarget.alive||dist(state.player,autoTarget)>48){autoTarget=state.nodes.filter(n=>n.alive&&state[n.type==='tree'?'wood':n.type==='rock'?'stone':'food']<capacity()[n.type==='tree'?'wood':n.type==='rock'?'stone':'food']).sort((a,b)=>dist(state.player,a)-dist(state.player,b)).find(n=>dist(state.player,n)<48)||null}if(!autoTarget){playerWork=0;return}playerWork+=dt;if(playerWork>.52){playerWork=0;state.player.swing=1;hitNode(autoTarget,'player')}};
 function tick(dt){c.time+=dt;if(c.forge){c.forge.remaining-=dt;if(c.forge.remaining<=0){state.iron+=c.forge.quantity;c.earnedIron+=c.forge.quantity;c.forge=null;A.sfx('rare');toast('製鉄完了 · 鉄 +1');save()}}if(c.autoForge&&!c.forge&&state.wood>=60&&state.stone>=60)startForge();if(c.time>comboUntil)combo=0;
  const enemies=state.enemies.some(e=>!e.dead&&dist(e,state.player)<260),outside=!inside(state.player.x,state.player.y,bounds());const stageMusic=({rain:'rain',desert:'dunes',snow:'frost',volcano:'volcano',coast:'port',bamboo:'bamboo',orchard:'bamboo',fog:'rain',canyon:'canyon',marsh:'marsh',wind:'ramble',springs:'springs',moon:'night',river:'port',mushroom:'forest',terrace:'bamboo',depot:'finale'})[window.Campaign?.current().id];const scene=window.WorldGame?.away?WorldGame.state.region:Pocket.rally>0?'parade':enemies?'siege':state.phase==='night'||state.phase==='dusk'?'night':stageMusic?stageMusic:outside&&dist(state.player,{x:0,y:0})>300?'ramble':state.buildings.length>=3||state.day%2===0?'work':'morning';A.setScene(scene);
 }
 const life=updateHumanLife;updateHumanLife=function(dt){life(dt);tick(dt)};
 const up=upgradeBenefit;upgradeBenefit=function(type,L){if(type==='forge')return`石18＋木12 → 鉄1 · ${Math.max(4,12/(1+(L-1)*.12)).toFixed(1)}秒`;if(type==='warehouse')return'資源の保管量を拡張 · 最大Lv20';return up(type,L)};
 return{version:'2.1',state:c,tick,startForge,forgeCost,contract,fulfill,charter,charterCost,monument,monumentCost,gatherMultiplier,get combo(){return combo},setActor(w){actor=w},migrated};
})();window.Chief=Chief;
for(const k of ['wood','stone','food'])capResource(k);
