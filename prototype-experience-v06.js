(()=>{
  'use strict';
  const byId=id=>document.getElementById(id);
  const trigger=byId('menu-trigger');
  const menu=byId('menu');
  const close=byId('menu-close');
  const tabs=[...document.querySelectorAll('[data-menu-tab]')];
  const panels=[...document.querySelectorAll('[data-menu-panel]')];

  function setTab(name){
    tabs.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.menuTab===name));
    panels.forEach(panel=>panel.classList.toggle('is-active',panel.dataset.menuPanel===name));
  }

  function refreshMenu(){
    const api=window.GUILD_API;
    if(!api||typeof api.getState!=='function')return;
    const state=api.getState();
    const count=byId('prototype-roster-count');
    if(count)count.textContent=`${state.npcs} / 10`;
  }

  trigger?.addEventListener('click',e=>{
    e.preventDefault();
    refreshMenu();
    window.GUILD_API?.action?.('X');
  });

  tabs.forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault();
    setTab(btn.dataset.menuTab);
    window.GuildAudio?.sfx?.('confirm');
  }));

  close?.addEventListener('click',()=>setTimeout(()=>trigger?.focus(),0));

  const observer=new MutationObserver(()=>{
    if(!menu?.hidden)refreshMenu();
  });
  if(menu)observer.observe(menu,{attributes:true,attributeFilter:['hidden']});

  setTab('town');
})();
