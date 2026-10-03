(()=>{'use strict';
const base=document.getElementById('game');
const layer=document.getElementById('world-art-overlay');
if(!base||!layer)return;
const g=layer.getContext('2d');
let W=innerWidth,H=innerHeight,D=Math.min(devicePixelRatio||1,2),last=performance.now();
const cam={x:0,y:42};
const TINY='https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/tiles/tinytown_tilemap.png';
const CHARS='https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/characters/characters_spritesheet.png';
const atlas=new Image(),chars=new Image();
atlas.crossOrigin='anonymous';chars.crossOrigin='anonymous';atlas.src=TINY;chars.src=CHARS;
let atlasReady=false,charsReady=false;
atlas.onload=()=>atlasReady=true;chars.onload=()=>charsReady=true;
function resize(){W=innerWidth;H=innerHeight;D=Math.min(devicePixelRatio||1,2);layer.width=Math.round(W*D);layer.height=Math.round(H*D);layer.style.width=W+'px';layer.style.height=H+'px';g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sx=x=>W/2+x-cam.x,sy=y=>H/2+y-cam.y;
function tile(id,x,y,scale=3,alpha=1){if(!atlasReady)return;g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;g.drawImage(atlas,(id%12)*16,Math.floor(id/12)*16,16,16,Math.round(x),Math.round(y),16*scale,16*scale);g.restore()}
function groundColor(phase){return phase==='night'?'#17261f':phase==='dusk'?'#4b4a34':phase==='dawn'?'#465c49':'#435f4e'}
function erase(x,y,w,h,phase){g.fillStyle=groundColor(phase);g.fillRect(Math.round(x-w/2),Math.round(y-h),Math.round(w),Math.round(h))}
function drawNode(n,phase,index){const X=sx(n.x),Y=sy(n.y);if(n.type==='tree'){erase(X,Y+15,52,68,phase);tile([5,6,7,8][index%4],X-24,Y-42,3)}else if(n.type==='rock'){erase(X,Y+10,42,40,phase);tile(43,X-20,Y-18,2.5)}else{erase(X,Y+8,44,36,phase);tile([17,18,29][index%3],X-24,Y-20,3)}}
function drawHouse(b,phase){const X=sx(b.x),Y=sy(b.y);if(b.type==='hut'){erase(X,Y+24,90,92,phase);tile(63,X-24,Y-48,3);tile(74,X-24,Y,3);tile(85,X,Y,3)}else if(b.type==='lumber'){erase(X,Y+25,105,70,phase);tile(72,X-48,Y-12,3);tile(73,X,Y-12,3);tile(115,X+8,Y-34,2)}else if(b.type==='quarry'){erase(X,Y+24,104,70,phase);tile(48,X-48,Y-12,3);tile(49,X,Y-12,3);tile(119,X+8,Y-38,2)}else if(b.type==='lantern'){erase(X,Y+18,58,76,phase);tile(128,X-20,Y-48,2.5)}}
function wallSegments(b){const rx=b.rx||260,ry=b.ry||178,cx=b.x||0,cy=b.y||45,segs=[];for(let x=-rx;x<=rx;x+=18){segs.push({x:cx+x,y:cy-ry,o:'h',front:false});if(Math.abs(x)>46)segs.push({x:cx+x,y:cy+ry,o:'h',front:true})}for(let y=-ry+18;y<ry;y+=18){segs.push({x:cx-rx,y:cy+y,o:'v',front:false});segs.push({x:cx+rx,y:cy+y,o:'v',front:false})}return segs}
function drawWallBack(b,phase){const r=clamp((b.hp||b.maxHp||1)/(b.maxHp||1),0,1),skip=r<.25?3:r<.55?5:999;wallSegments(b).filter(s=>!s.front).forEach((s,i)=>{if(i%skip===0)return;const X=sx(s.x),Y=sy(s.y);erase(X,Y+8,34,36,phase);tile(s.o==='h'?45:47,X-24,Y-24,3,r<.35?.65:1)})}
function drawWallFront(b,phase){const r=clamp((b.hp||b.maxHp||1)/(b.maxHp||1),0,1),skip=r<.25?3:r<.55?5:999;wallSegments(b).filter(s=>s.front).forEach((s,i)=>{if(i%skip===0)return;const X=sx(s.x),Y=sy(s.y);erase(X,Y+8,34,36,phase);tile(45,X-24,Y-24,3,r<.35?.65:1)});const cy=(b.y||45)+(b.ry||178),X=sx(b.x||0),Y=sy(cy);erase(X,Y+12,110,55,phase);tile(69,X-48,Y-36,3);tile(70,X,Y-36,3);g.fillStyle='#140e09';g.fillRect(Math.round(X-35),Math.round(Y+18),70,4);g.fillStyle=r>.55?'#77a261':r>.25?'#c89b52':'#be5e50';g.fillRect(Math.round(X-35),Math.round(Y+18),Math.round(70*r),4)}
function drawCharAt(x,y,col=0,scale=1.65){if(!charsReady)return false;const X=sx(x),Y=sy(y),size=24*scale;g.imageSmoothingEnabled=false;g.drawImage(chars,col*17,0,16,16,Math.round(X-size/2),Math.round(Y-size*.82),Math.round(size),Math.round(size));return true}
function drawCharacter(obj,index,phase,isPlayer=false){const X=sx(obj.x),Y=sy(obj.y);erase(X,Y+13,isPlayer?38:34,44,phase);const cols=isPlayer?[0]:[4,7,10,13,16,19,22];if(!drawCharAt(obj.x,obj.y,cols[index%cols.length],isPlayer?1.8:1.55)){g.fillStyle=isPlayer?'#b95a43':'#66765c';g.fillRect(Math.round(X-8),Math.round(Y-18),16,24)}}
function drawZombie(z,phase){if(z.dead)return;const X=sx(z.x),Y=sy(z.y);erase(X,Y+12,34,42,phase);g.fillStyle='#657b5e';g.fillRect(Math.round(X-7),Math.round(Y-15),14,20);g.fillStyle='#9ea48b';g.fillRect(Math.round(X-5),Math.round(Y-23),10,9);g.fillStyle='#2e1e1f';g.fillRect(Math.round(X-3),Math.round(Y-20),2,2);g.fillRect(Math.round(X+2),Math.round(Y-20),2,2)}
function render(dt){const api=window.BUILDJOY;if(!api?.getState)return;const s=api.getState();const p=s.player||{x:0,y:115};const t=1-Math.pow(.00003,dt);cam.x=lerp(cam.x,p.x,t);cam.y=lerp(cam.y,p.y-48,t);g.clearRect(0,0,W,H);if(!atlasReady&&!charsReady)return;const phase=s.phase||'day';const wall=(s.buildings||[]).find(b=>b.type==='barricade');if(wall)drawWallBack(wall,phase);const list=[];(s.nodes||[]).forEach((n,i)=>{if(n.alive!==false)list.push({y:n.y,fn:()=>drawNode(n,phase,i)})});(s.buildings||[]).forEach(b=>{if(b.type!=='barricade')list.push({y:b.y+20,fn:()=>drawHouse(b,phase)})});(s.workers||[]).slice(0,18).forEach((w,i)=>list.push({y:w.y+14,fn:()=>drawCharacter(w,i,phase,false)}));(s.zombies||[]).forEach(z=>list.push({y:z.y+14,fn:()=>drawZombie(z,phase)}));list.push({y:p.y+16,fn:()=>drawCharacter(p,0,phase,true)});list.sort((a,b)=>a.y-b.y).forEach(o=>o.fn());if(wall)drawWallFront(wall,phase);if(phase==='night'){g.fillStyle='rgba(6,10,25,.10)';g.fillRect(0,0,W,H)}}
function loop(t){const dt=Math.min(.033,Math.max(.001,(t-last)/1000));last=t;render(dt);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.BUILDJOY_WORLD_ASSETS=Object.freeze({atlas:TINY,characters:CHARS,license:'Kenney Tiny Town / Roguelike Characters — CC0'});
})();
