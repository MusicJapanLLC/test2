'use strict';
// Code-drawn original art. Cosmetic animation never modifies simulation coordinates.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const oldGround=drawGround,oldBuilding=drawBuilding,oldNode=drawNode,oldPerson=drawPerson;
 const visible=(x,y,pad=90)=>sx(x)>-pad&&sx(x)<W+pad&&sy(y)>-pad&&sy(y)<H+pad;
 const time=()=>reduced?0:performance.now()/1000;
 const grass=[];for(let i=0;i<650;i++)grass.push({x:((i*137.37)%1800)-900,y:((i*97.13)%1480)-720,k:i%7});
 drawGround=function(){
  oldGround();const night=state.phase==='night',t=time();
  // Meandering woodland paths and tiny grass tufts provide spatial memory.
  ctx.save();ctx.lineWidth=22;ctx.lineCap='round';ctx.strokeStyle=night?'#655b3a20':'#b2a66f28';ctx.beginPath();ctx.moveTo(sx(-600),sy(100));ctx.bezierCurveTo(sx(-180),sy(80),sx(80),sy(-60),sx(600),sy(180));ctx.stroke();
  for(const g of grass){if(!visible(g.x,g.y,10))continue;const x=sx(g.x),y=sy(g.y),s=Math.sin(t*.8+g.x)*1.2;ctx.fillStyle=night?'#5a775232':g.k<2?'#b0c78044':'#1e472e45';ctx.fillRect(x,y,2,3+g.k);ctx.fillRect(x-2+s,y-2,2,4);if(g.k===0){rect(x+3,y-2,2,2,night?'#abbc6155':'#e6ce8077')}}
  // River at the southern frontier, outside the initial settlement.
  const river=sy(660);if(river>-100&&river<H+100){ctx.fillStyle=night?'#173f46':'#477a79';ctx.fillRect(0,river,W,95);for(let i=0;i<35;i++){const x=((i*83+t*8)% (W+100))-50;rect(x,river+8+(i*17)%73,12+i%3*8,1,night?'#6bafa33b':'#b5d3bd55')}}
  for(const c of Pocket.caches){if(!visible(c.x,c.y))continue;const x=sx(c.x),y=sy(c.y),done=state.pocket.caches.includes(c.id);shadow(x,y+10,26,7,.3);rect(x-13,y-6,26,18,done?'#4a533d':'#8d6338');rect(x-15,y-10,30,9,done?'#616c4c':'#c39a51');rect(x-2,y-8,4,19,done?'#7b855b':'#f2da88');if(!done){const bob=Math.sin(t*2)*3;rect(x-2,y-28+bob,4,8,'#fff3bd');rect(x-2,y-17+bob,4,3,'#fff3bd');glow(x,y,37,.06)}}ctx.restore();
 };
 drawNode=function(n){if(!visible(n.x,n.y))return;const x=sx(n.x),y=sy(n.y),t=time();ctx.save();const hit=Pocket.clock-(n.pocketHit||-100);if(hit>=0&&hit<.22&&!reduced){ctx.translate(x,y);ctx.rotate(Math.sin(hit*38)*.08*(1-hit/.22));ctx.translate(-x,-y)}
  oldNode(n);
  if(n.type==='tree'){const v=Math.floor((n.seed||0)*3);poly([[x-22,y-25],[x-14,y-46],[x+2,y-59],[x+20,y-41],[x+25,y-21],[x+4,y-15]],['#355b3c','#416443','#305940'][v]);poly([[x-14,y-40],[x-3,y-54],[x+13,y-44],[x+15,y-36],[x+3,y-31]],'#789052');rect(x-3,y-11,3,30,'#aa8150');rect(x-9,y+17,19,3,'#493e2b');for(let i=0;i<4;i++)rect(x-14+i*8,y-27+(i%2)*5,4,2,'#8ba35b70')}
  else if(n.type==='rock'){poly([[x-10,y-7],[x-1,y-16],[x+11,y-8],[x+6,y-4],[x-3,y-4]],'#b5b6a0');rect(x+6,y+2,6,2,'#414f4b');rect(x-9,y+7,3,2,'#9ba48c')}
  else{for(let i=0;i<5;i++){rect(x-10+i*5,y-4+(i%2)*4,4,4,'#e58965');rect(x-10+i*5,y-5+(i%2)*4,2,1,'#ffe0a0')}}
  if(n.hp<n.maxHp){rect(x-13,y+24,26,3,'#183124');rect(x-13,y+24,26*n.hp/n.maxHp,3,'#d9d08a')}
  ctx.restore();
 };
 drawBuilding=function(b){if(!visible(b.x,b.y,140))return;const x=sx(b.x),y=sy(b.y),L=b.level||1;oldBuilding(b);const [w,h]=buildingSize(b.type,L);if(['hut','warehouse','barracks','guild'].includes(b.type)){
  rect(x+w/2-8,y-h/4,8,h/2,'#3a4132');rect(x-w/2,y+h/4,w,3,'#ba986040');rect(x-9,y+18,18,3,'#8b7954');
  for(let j=0;j<3;j++)rect(x-w/2+5,y-h/4+8+j*6,w-14,1,'#d9b07720');
  rect(x+w*.25,y-h*.53,7,16,'#545449');rect(x+w*.25-1,y-h*.53,9,3,'#a09671');
  if(!reduced){for(let i=0;i<3;i++){const f=(time()*.35+i/3)%1;ctx.globalAlpha=(1-f)*.2;rect(x+w*.25+Math.sin(time()+i)*6,y-h*.53-f*26,5+f*7,5+f*6,'#eee0c0');ctx.globalAlpha=1}}
  if(state.phase==='night'||state.phase==='dusk')glow(x,y-3,45+L*4,.09);
 }
 if(b.type==='lumber'){for(let i=0;i<4;i++){rect(x-24+i*12,y+16,10,8,'#ac8050');rect(x-22+i*12,y+18,6,4,'#dfbc79')}}
 if(b.type==='watchtower'){rect(x-4,y-h*.5-5,8,8,'#dec398');rect(x-5,y-h*.5-8,10,4,'#6f8990')}
 if(dist(state.player,b)<95){ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='#122a20';ctx.fillText(`${BUILD[b.type]?.name||''} ${L}`,x+1,y+34);ctx.fillStyle='#f0e5b8';ctx.fillText(`${BUILD[b.type]?.name||''} ${L}`,x,y+33)}
 };
 drawPerson=function(o,role='wood',enemy=false){if(!visible(o.x,o.y,65))return;const x=sx(o.x),y=sy(o.y),t=time(),bob=reduced?0:Math.abs(Math.sin(o.anim||0))*1.2;ctx.save();if(enemy){oldPerson(o,role,true);if(o.type==='runner'){rect(x-8,y-27,16,4,'#b86c4e');rect(x+6,y-24,5,2,'#e6a06f')}else if(o.type==='brute'){rect(x-11,y-29,22,5,'#a78c55');rect(x-5,y-34,11,5,'#dec080')}else if(o.type==='warden'){rect(x-12,y-39,24,6,'#c09b54');for(let i=-1;i<=1;i++)rect(x+i*8-2,y-45,4,8,'#f1ce74')}ctx.restore();return}
 const moving=Math.abs(o.vx||0)+Math.abs(o.vy||0)>5||o.state==='moving'||o.state==='returning-home',walk=moving||o.anim?Math.sin((o.anim||o.walk||0)*2)*2:0;
 shadow(x,y+17,21,5,.35);rect(x-7,y+7+walk,5,9,'#283d37');rect(x+2,y+7-walk,5,9,'#283d37');rect(x-8,y+14+walk,7,3,'#4e4935');rect(x+2,y+14-walk,7,3,'#4e4935');
 const cloth=role==='guard'?'#738c97':role==='food'?'#8a9f62':role==='stone'?'#ac9373':'#bd8a55';rect(x-8,y-7+bob,16,16,cloth);rect(x-3,y-6+bob,6,12,'#ead7a2');rect(x-9,y+7,18,3,'#65523b');
 rect(x-9,y-23+bob,18,16,'#deb88a');rect(x-7,y-22+bob,14,12,'#f1d1a1');rect(x-5,y-17+bob,2,3,'#2e382e');rect(x+4,y-17+bob,2,3,'#2e382e');rect(x-1,y-10+bob,4,1,'#966b53');
 if(role==='guard'){rect(x-11,y-26+bob,22,7,'#7c9598');rect(x-2,y-30+bob,4,5,'#d2b56f');rect(x+11,y-15,3,31,'#9d8253');poly([[x+12,y-21],[x+8,y-13],[x+16,y-13]],'#dfdfbb')}
 else{rect(x-10,y-28+bob,20,6,role==='stone'?'#d0b266':'#70573b');rect(x-13,y-23+bob,26,3,role==='stone'?'#ecd58b':'#ad9758');const working=o.state==='working',a=working?Math.sin(t*11)*.7:0;ctx.save();ctx.translate(x+10,y-5);ctx.rotate(a);rect(0,0,3,17,'#86643e');rect(-2,-3,11,6,role==='food'?'#af764c':'#bbcebd');ctx.restore()}
 ctx.restore();
 };
 const originalDraw=draw;draw=function(){originalDraw();const x=sx(state.player.x),y=sy(state.player.y),t=time();
  // A small pennant identifies the player without a permanent giant arrow.
  poly([[x-4,y-42],[x+5,y-42],[x+.5,y-36]],'#f8df8e');
  if(Pocket.rally>0){ctx.strokeStyle='#ffe2a87a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+14,35+Math.sin(t*5)*4,13,0,0,Math.PI*2);ctx.stroke()}
  let spoken=false;
  for(const w of state.workers){if(w.dead||w.hiddenAtHome||!visible(w.x,w.y))continue;if(w.sayUntil>Pocket.clock&&!spoken){bubble(w,w.say);spoken=true}else if(Math.floor(Pocket.clock)%14===0&&dist(w,state.player)<130&&!w._pocketSpoke){w._pocketSpoke=true;w.say=['これ労災おりる？','木にも都合がある','定時って概念ある？','村長も働いてる…','石、重くない？','福利厚生：焚き火'][Math.floor((w.seed||0)+Pocket.clock/14)%6];w.sayUntil=Pocket.clock+3}else if(Math.floor(Pocket.clock)%14!==0)w._pocketSpoke=false}
  if(pointer!==null&&!Pocket.paused()){ctx.save();ctx.strokeStyle='#f1e7b652';ctx.lineWidth=2;ctx.beginPath();ctx.arc(origin.x,origin.y,34,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f1e7b677';ctx.beginPath();ctx.arc(origin.x+input.x*26,origin.y+input.y*26,10,0,Math.PI*2);ctx.fill();ctx.restore()}
 };
 function bubble(w,text){const x=sx(w.x),y=sy(w.y)-51;ctx.font='10px monospace';const width=ctx.measureText(text).width+16;ctx.fillStyle='#f5edcc';ctx.fillRect(x-width/2,y-13,width,21);poly([[x-3,y+8],[x+4,y+8],[x,y+12]],'#f5edcc');ctx.textAlign='center';ctx.fillStyle='#354333';ctx.fillText(text,x,y+1)}
})();
