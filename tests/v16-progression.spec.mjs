import { test, expect } from '@playwright/test';

const URL='http://127.0.0.1:4173/prototype-buildjoy-v16.html';

test('v1.6 progression polish: faster wood, inside guards, group upgrades and work tech', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto(URL,{waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_PROGRESSION?.version==='v16.6-progression');

  await page.evaluate(()=>{
    state.wood=8000;state.stone=8000;state.food=4000;state.iron=100;state.renown=100;
    state.buildings=[];state.workers=[];state.enemies=[];state.projectiles=[];
    state.palisade={built:true,level:2,hp:620,maxHp:620,builtAt:performance.now()};
    state.progression=null;
    updateHud(true);
  });

  const cycles=await page.evaluate(()=>({
    wood:window.GUILD_PROGRESSION.workerCycle('wood'),
    stone:window.GUILD_PROGRESSION.workerCycle('stone'),
    food:window.GUILD_PROGRESSION.workerCycle('food')
  }));
  expect(cycles.wood).toBeLessThan(cycles.stone);
  expect(cycles.wood).toBeLessThan(cycles.food);

  // Repeat buildings exist, but upgrade UI must expose one group card per type, not one card per instance.
  await page.evaluate(()=>{build('hut');build('hut');build('lantern');build('lantern');renderUpgrades()});
  await expect(page.locator('[data-group-upgrade="hut"]')).toHaveCount(1);
  await expect(page.locator('[data-group-upgrade="lantern"]')).toHaveCount(1);
  await expect(page.locator('[data-upgrade-id]')).not.toHaveCount(4);

  const houseUpgrade=await page.evaluate(()=>{
    const before=state.buildings.filter(b=>b.type==='hut').map(b=>b.level);
    const ok=window.GUILD_PROGRESSION.groupUpgrade('hut');
    const after=state.buildings.filter(b=>b.type==='hut').map(b=>b.level);
    build('hut');
    const newest=state.buildings.filter(b=>b.type==='hut').at(-1);
    return {ok,before,after,newLevel:newest.level,group:window.GUILD_PROGRESSION.report().groups.housing};
  });
  expect(houseUpgrade.ok).toBeTruthy();
  expect(houseUpgrade.before.every(v=>v===1)).toBeTruthy();
  expect(houseUpgrade.after.every(v=>v===2)).toBeTruthy();
  expect(houseUpgrade.newLevel).toBe(2);
  expect(houseUpgrade.group).toBe(2);

  const lanternUpgrade=await page.evaluate(()=>{
    const before=state.buildings.filter(b=>b.type==='lantern').map(b=>({level:b.level,r:lanternRadius(b)}));
    const ok=window.GUILD_PROGRESSION.groupUpgrade('lantern');
    const after=state.buildings.filter(b=>b.type==='lantern').map(b=>({level:b.level,r:lanternRadius(b)}));
    return {ok,before,after};
  });
  expect(lanternUpgrade.ok).toBeTruthy();
  expect(lanternUpgrade.after.every(x=>x.level===2)).toBeTruthy();
  expect(lanternUpgrade.after[0].r).toBeGreaterThan(lanternUpgrade.before[0].r);

  // Guards now stay inside the palisade during normal patrol.
  const guard=await page.evaluate(()=>{
    state.enemies=[];state.cycle=.35;state.phase='day';
    const w={id:'guard-inside',role:'guard',x:0,y:0,seed:1,targetId:null,work:0,anim:0,cool:0,hp:120,maxHp:120,dead:false,death:0,hit:0};
    state.workers.push(w);
    let escaped=false;
    for(let i=0;i<900;i++){updateWorkers(1/60);if(!inside(w.x,w.y,bounds()))escaped=true}
    return {state:w.state,inside:inside(w.x,w.y,bounds()),escaped,x:w.x,y:w.y};
  });
  expect(guard.state).toBe('patrol-inside');
  expect(guard.inside).toBeTruthy();
  expect(guard.escaped).toBeFalsy();

  // Production tech has real numerical effects, not just UI labels.
  const tech=await page.evaluate(()=>{
    state.wood=8000;state.stone=8000;state.food=4000;state.iron=100;
    const beforeCycle=window.GUILD_PROGRESSION.workerCycle('wood');
    const beforeYield=window.GUILD_PROGRESSION.report();
    const y0=window.GUILD_PROGRESSION.workerYieldMultiplier('wood');
    const ok=window.GUILD_PROGRESSION.upgradeTech('forestry');
    const afterCycle=window.GUILD_PROGRESSION.workerCycle('wood');
    const y1=window.GUILD_PROGRESSION.workerYieldMultiplier('wood');
    return {ok,beforeCycle,afterCycle,y0,y1,level:window.GUILD_PROGRESSION.report().tech.forestry};
  });
  expect(tech.ok).toBeTruthy();
  expect(tech.level).toBe(1);
  expect(tech.afterCycle).toBeLessThan(tech.beforeCycle);
  expect(tech.y1).toBeGreaterThan(tech.y0);

  expect(pageErrors).toEqual([]);
});
