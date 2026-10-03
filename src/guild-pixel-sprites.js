/* GUILD∞ pixel sprite kit
 * Reads GUILD_RULES.md / ART_DIRECTION.md assumptions:
 * - true pixel matrix, not geometric placeholder people
 * - 4 directions
 * - idle / walk
 * - small silhouettes that still read by role
 * - no copied game assets
 */
(function(global){
  'use strict';

  const W=16,H=24;
  const blank=()=>Array.from({length:H},()=>Array(W).fill('.'));
  const px=(m,x,y,c)=>{if(x>=0&&x<W&&y>=0&&y<H)m[y][x]=c};
  const rect=(m,x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)px(m,xx,yy,c)};
  const line=(m,x0,y0,x1,y1,c)=>{
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
    let err=dx+dy;
    while(true){px(m,x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}
  };

  const PALETTES={
    guildmaster:{outline:'#211813',hair:'#5a3a28',skin:'#d7ad83',skin2:'#b98663',cloth:'#324554',cloth2:'#596d7b',accent:'#d4b465',metal:'#d9d5c7',boot:'#3b2c24'},
    warrior:{outline:'#201715',hair:'#3c2b25',skin:'#d8ad82',skin2:'#b98563',cloth:'#7b2f2f',cloth2:'#a2473f',accent:'#d8bd72',metal:'#c7c9cb',boot:'#302622'},
    mage:{outline:'#191728',hair:'#58435f',skin:'#d3a981',skin2:'#af7d60',cloth:'#4c3d78',cloth2:'#7661a3',accent:'#bda4df',metal:'#c7cad6',boot:'#2e2837'},
    scout:{outline:'#172019',hair:'#5f482c',skin:'#d5aa7f',skin2:'#ad7b5b',cloth:'#42603b',cloth2:'#67835a',accent:'#c5a95a',metal:'#bfc3b8',boot:'#2b3127'}
  };

  function drawHead(m,dir,p){
    rect(m,5,3,6,6,'o');
    rect(m,6,4,4,4,'s');
    if(dir==='up'){
      rect(m,5,3,6,4,'h');
      px(m,5,6,'h');px(m,10,6,'h');
    }else if(dir==='down'){
      rect(m,5,3,6,2,'h');
      px(m,5,5,'h');px(m,10,5,'h');
      px(m,7,6,'o');px(m,9,6,'o');
      px(m,8,7,'2');
    }else if(dir==='left'){
      rect(m,5,3,6,2,'h');px(m,5,5,'h');px(m,5,6,'h');px(m,7,6,'o');px(m,6,7,'2');
    }else{
      rect(m,5,3,6,2,'h');px(m,10,5,'h');px(m,10,6,'h');px(m,9,6,'o');px(m,9,7,'2');
    }
  }

  function drawBody(m,dir,frame,role){
    const bob=frame===1?1:0;
    rect(m,4,9+bob,8,8,'o');
    rect(m,5,9+bob,6,7,'c');
    rect(m,5,10+bob,6,2,'C');
    rect(m,6,12+bob,4,1,'a');

    // shoulders / arms
    if(dir==='left'){
      rect(m,2,10+bob,3,7,'o');rect(m,3,11+bob,2,5,'c');
      rect(m,11,11+bob,2,5,'o');rect(m,11,12+bob,1,3,'c');
    }else if(dir==='right'){
      rect(m,11,10+bob,3,7,'o');rect(m,11,11+bob,2,5,'c');
      rect(m,3,11+bob,2,5,'o');rect(m,4,12+bob,1,3,'c');
    }else{
      rect(m,2,10+bob,3,6,'o');rect(m,3,11+bob,2,4,'c');
      rect(m,11,10+bob,3,6,'o');rect(m,11,11+bob,2,4,'c');
    }

    // legs, alternate only one pixel so movement stays SNES-like rather than floaty
    const l=frame===1?1:0,r=frame===1?0:1;
    rect(m,5-l,17+bob,3,5,'o');rect(m,6-l,17+bob,2,4,'b');
    rect(m,8+r,17+bob,3,5,'o');rect(m,8+r,17+bob,2,4,'b');
    rect(m,4-l,21+bob,4,2,'o');rect(m,9+r,21+bob,4,2,'o');

    // role silhouette accessories
    if(role==='guildmaster'){
      rect(m,3,8+bob,10,2,'a');
      line(m,12,11+bob,14,18+bob,'m');
      px(m,14,18+bob,'a');
    }else if(role==='warrior'){
      rect(m,4,9+bob,8,2,'m');
      line(m,13,9+bob,15,18+bob,'m');
      line(m,14,9+bob,12,18+bob,'m');
    }else if(role==='mage'){
      rect(m,4,8+bob,8,2,'A');
      px(m,3,9+bob,'A');px(m,12,9+bob,'A');
      line(m,13,10+bob,14,20+bob,'a');
      px(m,14,9+bob,'A');
    }else if(role==='scout'){
      line(m,12,9+bob,14,16+bob,'a');
      line(m,13,9+bob,15,16+bob,'a');
      px(m,3,13+bob,'a');
    }
  }

  function buildFrame(dir='down',frame=0,role='guildmaster'){
    const m=blank();
    drawHead(m,dir,PALETTES[role]||PALETTES.guildmaster);
    drawBody(m,dir,frame,role);
    return m.map(r=>r.join(''));
  }

  const cache=new Map();
  function getFrame(dir='down',frame=0,role='guildmaster'){
    const key=`${role}:${dir}:${frame}`;
    if(!cache.has(key))cache.set(key,buildFrame(dir,frame,role));
    return cache.get(key);
  }

  function drawPixelMatrix(ctx,matrix,x,y,scale,palette,flip=false){
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    const map={o:palette.outline,h:palette.hair,s:palette.skin,'2':palette.skin2,c:palette.cloth,C:palette.cloth2,a:palette.accent,A:palette.accent,m:palette.metal,b:palette.boot};
    for(let yy=0;yy<matrix.length;yy++){
      const row=matrix[yy];
      for(let xx=0;xx<row.length;xx++){
        const ch=row[xx],color=map[ch];
        if(!color)continue;
        const dx=(flip?(row.length-1-xx):xx)*scale;
        ctx.fillStyle=color;
        ctx.fillRect(Math.round(x+dx),Math.round(y+yy*scale),scale,scale);
      }
    }
    ctx.restore();
  }

  function drawShadow(ctx,x,y,scale=2,alpha=.28){
    ctx.save();
    ctx.fillStyle=`rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(Math.round(x+8*scale),Math.round(y+23*scale),6*scale,2.2*scale,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawCharacter(ctx,x,y,opt={}){
    const role=opt.role||'guildmaster';
    const dir=opt.dir||'down';
    const moving=!!opt.moving;
    const tick=opt.tick||0;
    const frame=moving?Math.floor(tick/140)%2:0;
    const scale=Math.max(1,Math.floor(opt.scale||2));
    const palette=Object.assign({},PALETTES[role]||PALETTES.guildmaster,opt.palette||{});
    drawShadow(ctx,x,y,scale,opt.shadowAlpha??.28);
    drawPixelMatrix(ctx,getFrame(dir,frame,role),x,y,scale,palette,false);
  }

  function previewRoles(ctx,x,y,opt={}){
    const roles=['guildmaster','warrior','mage','scout'];
    roles.forEach((role,i)=>drawCharacter(ctx,x+i*44,y,{role,dir:opt.dir||'down',moving:!!opt.moving,tick:opt.tick||0,scale:opt.scale||2}));
  }

  global.GuildPixelSprites={
    width:W,
    height:H,
    palettes:PALETTES,
    getFrame,
    drawPixelMatrix,
    drawCharacter,
    previewRoles
  };
})(window);
