(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const menu=$('menu');
  const menuToggle=$('menu-toggle');
  const menuClose=$('menu-close');
  if(!menu||!menuToggle||!menuClose||!window.GUILD_API)return;

  let lastMenuTap=0;
  function isOpen(){return !menu.hidden}
  function syncMenuA11y(){
    const open=isOpen();
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');
    document.body.classList.toggle('menu-open',open);
  }
  function restoreFieldFocus(){
    requestAnimationFrame(()=>{
      if(!isOpen())menuToggle.focus({preventScroll:true});
    });
  }

  menuToggle.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    const now=performance.now();
    if(now-lastMenuTap<180)return;
    lastMenuTap=now;
    window.GUILD_API.action('X');
    syncMenuA11y();
  });

  menuClose.addEventListener('click',()=>{
    syncMenuA11y();
    restoreFieldFocus();
  });

  menu.addEventListener('pointerdown',e=>{
    if(e.target!==menu)return;
    e.preventDefault();
    e.stopPropagation();
    if(isOpen())window.GUILD_API.action('B');
    syncMenuA11y();
    restoreFieldFocus();
  });

  ['right','bottom','menu'].forEach(id=>{
    const el=$(id);
    if(!el)return;
    ['pointerup','click'].forEach(type=>el.addEventListener(type,e=>e.stopPropagation()));
  });

  new MutationObserver(syncMenuA11y).observe(menu,{attributes:true,attributeFilter:['hidden']});
  syncMenuA11y();
})();
