(()=>{
  'use strict';
  const canvas=document.getElementById('c');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx||ctx.__guildStableTranslate)return;

  // The legacy core uses tiny random ctx.translate() offsets only for screen shake.
  // The owner explicitly reported motion sickness, so v0.9 defaults to ZERO screen shake.
  // Larger translations remain available in case future rendering needs them.
  const originalTranslate=ctx.translate.bind(ctx);
  ctx.translate=(x,y)=>{
    const nx=Number(x)||0, ny=Number(y)||0;
    if(Math.abs(nx)<=12&&Math.abs(ny)<=12)return;
    return originalTranslate(nx,ny);
  };
  ctx.__guildStableTranslate=true;

  document.documentElement.dataset.motion='stable';
  window.GUILD_MOTION=Object.freeze({
    screenShake:false,
    mode:'stable',
    reason:'owner-motion-sickness'
  });
})();
