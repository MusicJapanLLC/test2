/* GUILD∞ original pixel village renderer. Screen coordinates for actors/buildings;
   world coordinates for terrain/props. No population or simulation mutations. */
(()=>{'use strict';
const C={ink:'#171c24',grass:'#344942',grassDeep:'#293f3a',grassLight:'#496051',stone:'#73796e',stoneHi:'#a6a48b',stoneDark:'#465259',cream:'#eed9a0',gold:'#d8aa56',wood:'#755039',woodHi:'#a77a50',woodDark:'#3e302a',slate:'#4c6174',slateHi:'#71889b',slateDark:'#303f51',red:'#8c4941',redHi:'#b96b52',redDark:'#65342f',glow:'#ffd07d',water:'#314d5c'};
// Two world units per authored pixel: exact one pixel after the integration's .5 scale.
const I=v=>Math.round(v/2)*2,R=(c,x,y,w,h,k)=>{c.fillStyle=k;c.fillRect(I(x),I(y),w>0?Math.max(2,I(w)):0,h>0?Math.max(2,I(h)):0)};
function P(c,p,k){c.fillStyle=k;c.beginPath();p.forEach((v,i)=>i?c.lineTo(I(v[0]),I(v[1])):c.moveTo(I(v[0]),I(v[1])));c.closePath();c.fill()}
function hash(a,b=0){let n=Math.imul(a|0,374761393)+Math.imul(b|0,668265263);n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295}
function shadow(c,x,y,w,h=7){R(c,x-w/2+3,y-h/2,w-6,h,'#192e2d80');R(c,x-w/2,y-h/2+2,w,h-4,'#192e2d80')}
function colorShade(hex,n){if(!/^#[0-9a-f]{6}$/i.test(hex||''))hex='#617f8d';return '#'+[1,3,5].map(a=>Math.max(0,Math.min(255,parseInt(hex.slice(a,a+2),16)+n)).toString(16).padStart(2,'0')).join('')}
const sprites={
down:[
'.......rrrr.....','......rHHHHr....','.....rHHHHHHr...','.....HHHHHHHH...','....HHHHHHHHHH..','...hhhhhhhhhhhh.','......bbbb......','.....bssssb.....','.....sesse s....'.replace(' ',''),'.....ssssss.....','......ssss......','....mmccmm......','...mccccccm.....','...tccccccct....','...tccCCCCct....','...ssCCCCss.....','.....CCCCC......','.....CKKCC......','.....KKKKK......','.....ppppp......','.....pp.pp......','.....pp.pp......','....ddd.ddd.....','....ddd.ddd.....'],
up:[
'.......rrrr.....','......rHHHHr....','.....rHHHHHHr...','.....HHHHHHHH...','....HHHHHHHHHH..','...hhhhhhhhhhhh.','.....bbbbbb.....','.....bbbbbb.....','.....bbbbbb.....','.....bbbbbb.....','......bbbb......','....mmccmm......','...mccccccm.....','...tccCCCCct....','...tcCCCCCCt....','...ssCCCCss.....','.....CCCCC......','.....CCCCC......','.....KKKKK......','.....ppppp......','.....pp.pp......','.....pp.pp......','....ddd.ddd.....','....ddd.ddd.....'],
right:[
'........rr......','......rHHH......','.....HHHHHH.....','.....HHHHHH.....','....HHHHHHHH....','...hhhhhhhhhhh..','.....bbbbss.....','.....bbssss.....','.....bbssse.....','.....bbsssss....','......bsss......','.....mmcc.......','....mccccc......','....tCCCCcc.....','....tCCCCcss....','....tCCCCcss....','.....CCCCcc.....','.....CCKKcc.....','.....KKKKK......','.....ppppp......','.....pp.pp......','.....pp.pp......','.....ddd.ddd....','.....ddd.ddd....']};
const spriteCache=new Map();
function actorCanvas(dir,frame,color,isPlayer){const key=[dir,frame,color,isPlayer].join('|');if(spriteCache.has(key))return spriteCache.get(key);
 const a=document.createElement('canvas');a.width=20;a.height=27;const c=a.getContext('2d');c.imageSmoothingEnabled=false;
 const base=sprites[dir==='left'?'right':dir]||sprites.down;
 const palette={r:isPlayer?'#b45442':colorShade(color,20),H:isPlayer?'#dec88d':colorShade(color,-14),h:isPlayer?'#968362':colorShade(color,-44),b:'#493b31',s:'#d7ac80',e:'#253243',m:'#b5bfc1',c:color||'#71889b',C:colorShade(color||'#71889b',-22),K:'#765640',p:'#38424c',d:'#252c34',t:'#bd955d'};
 const pix=(xx,yy,ww,hh,k)=>{c.fillStyle=k;c.fillRect(xx,yy,ww,hh)};
 base.forEach((row,y)=>{for(let xx=0;xx<row.length;xx++){let char=row[xx];if(!palette[char])continue;let shift=0,yy=y;if(y>=20&&frame%2===1){yy+=xx<8?-1:1;shift=xx<8?-1:1}pix(xx+2+shift,yy+1,1,1,palette[char])}});
 if(isPlayer){pix(15,11,1,10,'#d9e0d7');pix(14,18,3,1,'#b99159');pix(15,21,1,3,'#514238');pix(8,18,2,1,C.gold)}
 else{
  // Existing workers have three readable silhouettes, without new population.
  const type=parseInt((color||'#617f8d').slice(1),16)%3;
  if(type===0){c.clearRect(0,0,20,7);pix(7,4,9,3,'#5e4935');pix(8,3,7,2,'#79614a');pix(4,14,3,7,C.woodDark);pix(4,15,2,4,C.woodHi)}
  if(type===1){c.clearRect(0,0,20,7);pix(7,4,9,4,'#97a6a6');pix(8,3,7,2,'#bbc3b9');pix(6,7,11,2,'#596e77');pix(16,15,2,8,'#849595');pix(15,16,4,1,C.gold)}
 }
 if(dir==='left'){const copy=document.createElement('canvas');copy.width=a.width;copy.height=a.height;const cx=copy.getContext('2d');cx.translate(a.width,0);cx.scale(-1,1);cx.drawImage(a,0,0);spriteCache.set(key,copy);return copy}
 spriteCache.set(key,a);return a}
function normalizeDir(d){if(typeof d==='string')return d;if(d===0)return'up';if(d===2)return'down';if(d===3||d===-1)return'left';return'right'}
function drawActor(c,{x,y,dir='down',frame=0,color='#6f8796',isPlayer=false,carry=false}){x=I(x);y=I(y);dir=normalizeDir(dir);shadow(c,x,y+11,isPlayer?30:26,8);const f=Math.floor(frame)%2;c.imageSmoothingEnabled=false;c.drawImage(actorCanvas(dir,f,color,isPlayer),x-20,y-40,40,54);if(carry){R(c,x-24,y-10,14,12,C.woodDark);R(c,x-22,y-8,10,8,C.woodHi);R(c,x-18,y-8,2,8,C.cream)}if(isPlayer){R(c,x-6,y+16,12,2,'#d8aa5670');R(c,x-4,y+18,8,2,'#d8aa5640')}}
function windowLight(c,x,y,w=13,h=15,time=0){R(c,x-2,y-2,w+4,h+4,C.woodDark);R(c,x,y,w,h,C.gold);R(c,x+2,y+2,w-4,h-4,'#ffe2a0');R(c,x+I(w/2),y,2,h,C.wood);R(c,x,y+I(h/2),w,2,C.wood);R(c,x-3,y+h+2,w+6,2,C.woodHi)}
function roof(c,x,y,w,h,palette=[C.slateDark,C.slate,C.slateHi]){
 P(c,[[x-8,y+h],[x+w+10,y+h],[x+w-2,y-4],[x+16,y-8],[x+5,y]],palette[0]);
 // Ridge/back plane and sloping shingle face are separate solid facets.
 P(c,[[x+5,y],[x+16,y-8],[x+w-2,y-4],[x+w-7,y]],palette[2]);
 for(let r=0;r<h;r+=6){const inset=r*.48,left=x+5-inset,ww=w-12+inset*2;R(c,left,y+r,ww,6,r%12?palette[1]:palette[0]);R(c,left,y+r,ww,2,palette[2]);for(let col=0;col<ww-5;col+=12){R(c,left+col+(r%12?6:0),y+r+2,2,4,palette[0])}}
 P(c,[[x+w-7,y],[x+w+3,y-4],[x+w+23,y+h-6],[x+w+11,y+h]],palette[0]);
 for(let yy=4;yy<h;yy+=6)R(c,x+w-4+yy*.52,y+yy,8,2,palette[1]);
 R(c,x-10,y+h,w+24,4,palette[0]);R(c,x-8,y+h,w+20,2,palette[2]);R(c,x+7,y-2,w-10,2,palette[2])}
function banner(c,x,y,col,time=0,lv=1){R(c,x-1,y-2,2,30,C.woodDark);R(c,x,y,10,18,col);R(c,x+1,y+1,8,1,colorShade(col,25));R(c,x+3,y+4,4,2,C.gold);R(c,x+4,y+3,2,5,C.gold);P(c,[[x,y+18],[x+5,y+23],[x+10,y+18]],col);if(lv>=3)R(c,x+3,y+10,4,1,C.gold)}
function sign(c,x,y,id){R(c,x-12,y,24,15,C.ink);R(c,x-11,y+1,22,13,C.wood);R(c,x-10,y+2,20,11,C.woodDark);const k=C.cream;
if(id==='guild'){for(let q=0;q<2;q++){R(c,x-8+q*8,y+5,7,1,k);R(c,x-9+q*8,y+6,1,4,k);R(c,x-3+q*8,y+6,1,4,k);R(c,x-8+q*8,y+10,7,1,k)}}
if(id==='inn'){R(c,x-6,y+5,1,6,k);R(c,x-6,y+8,12,2,k);R(c,x+5,y+7,1,4,k);R(c,x-4,y+6,3,2,k)}
if(id==='quest'){R(c,x-1,y+4,2,5,k);R(c,x-1,y+10,2,1,k)}
if(id==='forge'){R(c,x-5,y+5,10,3,k);R(c,x-1,y+8,2,4,k);R(c,x-6,y+4,4,2,k)}
if(id==='store'){R(c,x-5,y+5,10,5,k);R(c,x-2,y+4,4,7,C.gold);R(c,x-4,y+6,8,1,k)}
if(id==='tower'){P(c,[[x-6,y+11],[x,y+4],[x+6,y+11]],k);R(c,x-1,y+8,2,4,C.ink)}}
function masonry(c,x,y,w,h){R(c,x,y,w,h,'#646e6b');for(let yy=0;yy<h;yy+=7){R(c,x,y+yy,w,1,'#465354');for(let xx=0;xx<w;xx+=13){let off=(yy%14?6:0);R(c,x+xx+off,y+yy,1,7,'#465354');if(hash(xx,yy)>.6)R(c,x+xx+off+2,y+yy+2,8,1,'#889085')}}}
function drawBuilding(c,b,guildLv=1,time=0){const x=I(b.x),y=I(b.y),w=I(b.w),h=I(b.h),id=b.id,l=x-w/2,top=y-h/2,front=y+h/2;
c.save();shadow(c,x+8,front+4,w+30,17);P(c,[[l+w,top+22],[l+w+12,top+15],[l+w+12,front-8],[l+w,front]],C.woodDark);
if(id==='tower'){
 masonry(c,l+5,top+5,w-10,h-5);P(c,[[l+w-5,top+5],[l+w+7,top-2],[l+w+7,front-8],[l+w-5,front]],'#425258');
 R(c,l-2,top-9,w+4,17,'#727c76');for(let i=0;i<w;i+=13)R(c,l+i,top-17,8,12,'#889084');R(c,l-3,top+5,w+6,3,'#a4aa91');
 windowLight(c,x-5,top+25,10,15,time);R(c,x-8,front-25,16,25,C.ink);R(c,x-6,front-23,12,23,C.woodDark);R(c,x-8,front-4,16,4,C.stoneHi);banner(c,l+w+8,top+12,C.red,time,guildLv);
 R(c,x-2,top-41,2,25,C.woodHi);P(c,[[x,top-41],[x+22,top-37],[x+19,top-29],[x,top-30]],C.red);R(c,x+4,top-37,7,2,C.gold);
}else{
 R(c,l,top+24,w,h-24,'#bbad85');R(c,l+3,top+27,w-6,h-30,'#c7b998');masonry(c,l,front-11,w,11);
 for(let i=0;i<=w;i+=I(w/3)){R(c,l+i-2,top+27,5,h-38,C.woodDark);R(c,l+i-1,top+27,1,h-38,C.woodHi)}R(c,l,top+31,w,4,C.woodDark);R(c,l,front-15,w,4,C.woodDark);
 P(c,[[l+5,top+36],[l+30,front-17],[l+35,front-17],[l+10,top+36]],C.wood);P(c,[[l+w-35,front-17],[l+w-30,front-17],[l+w-5,top+36],[l+w-10,top+36]],C.wood);
 let pal=id==='guild'?[C.slateDark,C.slate,C.slateHi]:[C.redDark,C.red,C.redHi];if(id==='forge')pal=['#383e43','#535f63','#7a8882'];roof(c,l,top,w,30,pal);
 R(c,x-12,front-36,24,29,C.woodDark);R(c,x-9,front-33,18,26,'#2c2527');R(c,x-8,front-32,1,24,C.woodHi);R(c,x+6,front-21,2,2,C.gold);
 for(let st=0;st<3;st++){R(c,x-16-st*3,front-7+st*3,32+st*6,3,st%2?C.stoneDark:C.stone);R(c,x-15-st*3,front-7+st*3,30+st*6,1,C.stoneHi)}
 if(id!=='quest'){windowLight(c,l+13,top+41,14,17,time);windowLight(c,l+w-28,top+41,14,17,time)}
 sign(c,x,top+27,id);
 if(id==='guild'){
  banner(c,l+36,top+42,'#384e69',time,guildLv);banner(c,l+w-47,top+42,'#384e69',time,guildLv);
  P(c,[[x-21,top+7],[x,top-16],[x+21,top+7]],C.woodDark);P(c,[[x-17,top+5],[x,top-12],[x+17,top+5]],C.cream);R(c,x-2,top-8,4,12,C.wood);R(c,x-11,top+1,22,3,C.wood);
  if(guildLv>=2){for(const dx of[-w/2+3,w/2-18]){masonry(c,x+dx,top-10,17,43);roof(c,x+dx-1,top-24,19,13,pal);R(c,x+dx+6,top+1,5,11,C.glow)}}
  if(guildLv>=3){R(c,l-4,front-19,4,21,C.gold);R(c,l+w,front-19,4,21,C.gold);banner(c,x-1,top-49,'#384e69',time,guildLv);R(c,l+2,top+33,w-4,2,C.gold)}
 }else if(id==='inn'){
  const a=l+w-23;R(c,a,top-17,13,26,C.stoneDark);masonry(c,a,top-17,13,18);R(c,a-2,top-20,17,4,C.stoneHi);R(c,l+7,front-15,16,6,'#666942');R(c,l+8,front-19,14,5,'#719264');R(c,l+10,front-21,3,3,'#bd8b6c');R(c,l+18,front-20,3,3,'#ddc18c');
  R(c,l+w+9,top+40,1,14,C.woodDark);sign(c,l+w+9,top+45,'inn');
 }else if(id==='forge'){
  masonry(c,l+w-27,top-23,18,44);R(c,l+w-30,top-27,24,5,C.stoneHi);R(c,l+w-26,top-25,16,2,C.ink);
  for(let i=0;i<3;i++){let t=((time*.014+i*7)%23);R(c,l+w-22+Math.sin(time*.001+i)*4,top-28-t,7+i*2,5+i*2,'#a8aea126')}
  R(c,x-8,front-31,16,23,'#b65c36');R(c,x-5,front-27,10,18,C.glow);R(c,x-2,front-23,4,12,'#ffe5a2');R(c,l+w+13,front-9,22,5,C.stoneDark);R(c,l+w+19,front-4,9,7,C.ink);R(c,l+w+8,front-12,31,3,C.stoneHi);
 }else if(id==='store'){
  for(let i=0;i<7;i++){const xx=l-4+i*(w+8)/7;P(c,[[xx,top+39],[xx+(w+8)/7,top+39],[xx+(w+8)/7+4,top+58],[xx-4,top+58]],i%2?'#9d5f49':'#dcc998');R(c,xx-3,top+58,(w+8)/7+6,4,i%2?'#774439':'#b1a67f')}
  R(c,l-6,top+55,2,front-top-48,C.woodDark);R(c,l+w+4,top+55,2,front-top-48,C.woodDark);crate(c,l-12,front-4);crate(c,l+w+12,front-2);R(c,l+5,front-5,25,5,C.wood);for(let i=0;i<4;i++){R(c,l+8+i*5,front-8,4,4,i%2?'#c59656':'#8c993f')}
 }else if(id==='quest'){
  R(c,l+9,top+39,w-18,29,C.woodDark);R(c,l+12,top+42,w-24,23,'#815b40');for(let i=0;i<4;i++){let xx=l+16+i*14,yy=top+45+(i%2)*4;R(c,xx,yy,9,13,'#e2d2a1');R(c,xx+2,yy+3,5,1,'#9c8763');R(c,xx+2,yy+6,4,1,'#9c8763');R(c,xx+4,yy+10,2,2,C.red)}
  R(c,x-7,front-4,14,4,C.wood);R(c,x+7,top+44,1,1,C.gold);
 }
}
// Light pools stay pixel stepped; no smooth radial blur on authored sprites.
if(id!=='quest'&&id!=='store'){R(c,l+9,front+3,w-18,2,'#cda25518');R(c,l+16,front+5,w-32,2,'#cda25510')}
c.restore()}
function crate(c,x,y){R(c,x-8,y-12,16,14,C.woodDark);R(c,x-7,y-11,14,11,C.wood);R(c,x-6,y-10,12,1,C.woodHi);R(c,x-6,y-5,12,1,C.woodDark);R(c,x-5,y-10,2,10,C.woodHi);R(c,x+3,y-10,2,10,C.woodHi)}
const roads=[[0,46,-230,144],[0,46,232,127],[0,46,205,-95],[0,46,-210,-101],[0,0,0,-152]];
function distanceSegment(x,y,a,b,d,e){let vx=d-a,vy=e-b,t=Math.max(0,Math.min(1,((x-a)*vx+(y-b)*vy)/(vx*vx+vy*vy)));return Math.hypot(x-a-t*vx,y-b-t*vy)}
const terrain={canvas:null};
function prepareTerrain(){const a=document.createElement('canvas');a.width=1100;a.height=840;const c=a.getContext('2d');c.fillStyle=C.grass;c.fillRect(0,0,a.width,a.height);c.translate(550,420);
 for(let yy=-420;yy<420;yy+=12)for(let xx=-550;xx<550;xx+=12){let r=hash(xx,yy);R(c,xx,yy,12,12,r>.75?'#3a5046':r<.14?'#30453f':C.grass);if(r>.25&&r<.6){R(c,xx+3,yy+8,2,1,C.grassLight);R(c,xx+9,yy+3,1,2,'#45614f')}}
 for(let yy=-330;yy<355;yy+=8)for(let xx=-460;xx<460;xx+=8){let road=roads.some(a=>distanceSegment(xx+4,yy+4,...a)<21);let plaza=Math.hypot((xx+4)*.95,(yy-68)*1.2)<53;if(!road&&!plaza)continue;let r=hash(xx+99,yy-99);R(c,xx,yy,8,8,'#5f6555');R(c,xx+1,yy+1,7,6,r>.65?'#7b7b61':r<.3?'#696e59':'#72745d');R(c,xx+1,yy+1,6,1,'#98927940');if(r>.82)R(c,xx+4,yy+3,1,2,'#515e54')}
 // Pond with angular stone bank and reflective pixel bands.
 P(c,[[-413,218],[-390,198],[-329,201],[-306,218],[-301,261],[-325,287],[-390,284],[-420,255]],'#5b6b60');P(c,[[-408,221],[-387,203],[-332,207],[-313,222],[-309,259],[-330,279],[-388,277],[-413,252]],C.water);for(let i=0;i<14;i++){let xx=-402+hash(i,14)*83,yy=214+hash(i,19)*56;R(c,xx,yy,6+hash(i,2)*17,1,'#71939b40')}
 for(let i=0;i<90;i++){let xx=I(hash(i,61)*930-465),yy=I(hash(i,44)*690-340);if(roads.some(a=>distanceSegment(xx,yy,...a)<35)||Math.hypot(xx,yy-60)<85)continue;R(c,xx,yy,1,4,'#55745c');R(c,xx-1,yy+2,3,1,'#6c8765');if(i%7===0){R(c,xx-2,yy,2,2,'#c4a270');R(c,xx+2,yy-1,2,2,'#c4a270')}}
 terrain.canvas=a}
function drawTerrain(c,{width,height,cam={x:0,y:0},time=0}){if(!terrain.canvas)prepareTerrain();c.fillStyle=C.grassDeep;c.fillRect(0,0,width,height);c.drawImage(terrain.canvas,I(width/2-cam.x-550),I(height/2-cam.y-420))}
function tree(c,x,y,seed=0){shadow(c,x+3,y+8,40,11);R(c,x-3,y-22,7,29,'#4d4234');R(c,x-1,y-20,2,26,'#88734b');let r=hash(seed,23);const p=r>.65?['#364d42','#51705b','#6f8760']:['#253f3b','#3d5d4f','#57735a'];
 if(seed%5===2){P(c,[[x-12,y-52],[x+10,y-52],[x+23,y-37],[x+25,y-22],[x+12,y-14],[x-19,y-17],[x-26,y-31],[x-22,y-43]],p[0]);P(c,[[x-13,y-48],[x+7,y-48],[x+17,y-36],[x+8,y-25],[x-19,y-27],[x-21,y-37]],p[1]);for(let i=0;i<6;i++)R(c,x-16+(i%3)*11,y-44+Math.floor(i/3)*12,6,3,p[2]);R(c,x+2,y-17,2,12,'#4d4234');return}
 for(let i=0;i<3;i++){let yy=y-48+i*13,ww=14+i*10;P(c,[[x,yy-12],[x-ww/2,yy+1],[x-ww/2-5,yy+9],[x+ww/2+5,yy+9],[x+ww/2,yy+1]],p[0]);P(c,[[x-2,yy-10],[x-ww/2+1,yy+1],[x-ww/2-1,yy+6],[x+2,yy+6]],p[1]);R(c,x-ww/2+3,yy+3,4,1,p[2])}R(c,x-3,y-48,3,2,p[2])}
function lamp(c,x,y,time){shadow(c,x,y+2,14,5);R(c,x-2,y-27,4,30,C.woodDark);R(c,x-1,y-27,1,29,C.woodHi);R(c,x-7,y-32,14,3,C.ink);R(c,x-5,y-29,10,12,C.woodDark);R(c,x-3,y-27,6,8,C.glow);R(c,x-4,y-17,8,2,C.gold);P(c,[[x-7,y-32],[x,y-37],[x+7,y-32]],C.slateDark);R(c,x-13,y-12,26,3,'#eab46c14');R(c,x-18,y-8,36,3,'#eab46c0b')}
const propData=[[-445,-175,'tree'],[-410,-235,'tree'],[-342,-283,'tree'],[-270,-302,'tree'],[-155,-297,'tree'],[105,-297,'tree'],[270,-283,'tree'],[340,-238,'tree'],[435,-143,'tree'],[-442,36,'tree'],[-402,109,'tree'],[-439,175,'tree'],[-415,315,'tree'],[-291,337,'tree'],[-162,311,'tree'],[207,326,'tree'],[323,299,'tree'],[432,219,'tree'],[420,135,'tree'],[417,10,'tree'],[315,-43,'tree'],[-332,-37,'tree'],[-290,45,'tree'],[110,180,'tree'],[139,-158,'tree'],[-92,19,'lamp'],[96,15,'lamp'],[-114,101,'lamp'],[123,112,'lamp'],[-130,-103,'lamp'],[132,-106,'lamp'],[-69,-172,'lamp'],[55,-189,'lamp'],[-275,-80,'crate'],[-249,-79,'crate'],[285,-85,'crate'],[304,-75,'crate']];
function drawProps(c,{width,height,cam={x:0,y:0},time=0,layer='all'}){let ox=width/2-cam.x,oy=height/2-cam.y;for(let i=0;i<propData.length;i++){let[wx,wy,t]=propData[i],xx=I(ox+wx),yy=I(oy+wy);if(xx<-65||xx>width+65||yy<-15||yy>height+90)continue;if(layer==='back'&&wy>30||layer==='front'&&wy<=30)continue;t==='tree'?tree(c,xx,yy,i):t==='lamp'?lamp(c,xx,yy,time):crate(c,xx,yy)}
 // Quiet village furnishings and boundary gate.
 if(layer!=='front'){R(c,ox-43,oy-319,86,6,C.woodDark);for(let a=-38;a<=38;a+=19){R(c,ox+a,oy-335,3,26,C.wood);R(c,ox+a,oy-335,1,26,C.woodHi)}}
}
function getPropDrawables({width,height,cam={x:0,y:0},time=0,ctx=null}){const ox=width/2-cam.x,oy=height/2-cam.y,out=[];
 for(let i=0;i<propData.length;i++){const[wx,wy,t]=propData[i],xx=I(ox+wx),yy=I(oy+wy);if(xx<-65||xx>width+65||yy<-15||yy>height+90)continue;out.push({y:wy+10,worldY:wy,draw:(c=ctx)=>{if(!c)return;t==='tree'?tree(c,xx,yy,i):t==='lamp'?lamp(c,xx,yy,time):crate(c,xx,yy)}})}
 out.push({y:-309,worldY:-319,draw:(c=ctx)=>{if(!c)return;R(c,ox-43,oy-319,86,6,C.woodDark);for(let a=-38;a<=38;a+=19){R(c,ox+a,oy-335,3,26,C.wood);R(c,ox+a,oy-335,1,26,C.woodHi)}}});return out}
const pondBoundary=[[-408,221],[-387,203],[-332,207],[-313,222],[-309,259],[-330,279],[-388,277],[-413,252]];
function insidePolygon(x,y,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[d,e]=p[j];if((b>y)!==(e>y)&&x<(d-a)*(y-b)/(e-b)+a)hit=!hit}return hit}
function isTerrainBlocked(wx,wy){if(insidePolygon(wx,wy,pondBoundary))return true;return propData.some(([x,y,t])=>t==='tree'&&Math.hypot(wx-x,(wy-y-2)*1.4)<13)}
function drawAtmosphere(c,{width,height,cam={x:0,y:0},time=0}){c.save();let x=width/2-cam.x,y=height/2+82-cam.y;const g=c.createRadialGradient(x,y,5,x,y,115);g.addColorStop(0,'#ffbb5c21');g.addColorStop(1,'#ffbb5c00');c.fillStyle=g;c.fillRect(x-115,y-115,230,230);for(let i=0;i<7;i++){let xx=width*hash(i,49)+Math.sin(time*.0002+i)*7,yy=(height*hash(i,64)-time*.004)%height;if(yy<0)yy+=height;R(c,xx,yy,1,1,'#e4d6a238')}c.restore()}
window.GuildGraphics=Object.freeze({drawActor,drawBuilding,drawTerrain,drawProps,getPropDrawables,isTerrainBlocked,drawAtmosphere,palette:C,pixelPitch:2,version:'original-pixel-village-1.0'});
})();
