(()=>{
  'use strict';
  const c=document.getElementById('c');
  const pulse=document.getElementById('touch-pulse');
  const hint=document.getElementById('hint');
  if(c&&pulse){
    c.addEventListener('pointerdown',e=>{
      pulse.style.left=e.clientX+'px';
      pulse.style.top=e.clientY+'px';
      pulse.classList.remove('show');
      void pulse.offsetWidth;
      pulse.classList.add('show');
      hint?.classList.add('is-dim');
    },{passive:true});
    c.addEventListener('pointerup',()=>setTimeout(()=>hint?.classList.remove('is-dim'),700),{passive:true});
  }
})();
