import { test, expect } from '@playwright/test';

const URL='http://127.0.0.1:4173/prototype-buildjoy-v16.html';

test('v1.6 NPC routines stay stable under progression/defense polish', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto(URL,{waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_ROUTINES?.version==='v16.5-routines'&&window.GUILD_PROGRESSION?.version==='v16.6-progression'&&window.GUILD_DEFENSE?.version==='v16.7-defense');

  await page.evaluate(()=>{
    state.wood=5000;state.stone=5000;state.food=5000;state.iron=50;state.renown=50;
    state.buildings=[];state.workers=[];state.enemies=[];state.projectiles=[];state.progression=null;
    state.palisade={built:true,level:2,hp:620,maxHp:620,builtAt:performance.now()};
    updateHud(true);
  });

  await page.click('#dock [data-panel="build"]');
  await page.click('[data-build="hut"]');
  await page.click('[data-build="lantern"]');

  const lanternBefore=await page.evaluate(()=>{
    const b=state.buildings.find(x=>x.type==='lantern');
    return {level:b.level,radius:window.GUILD_ROUTINES.lanternRadiusFor(b.id)};
  });
  expect(lanternBefore.level).toBe(1);

  await page.evaluate(()=>renderUpgrades());
  await page.click('[data-group-upgrade="lantern"]');
  const lanternAfter=await page.evaluate(()=>{
    const b=state.buildings.find(x=>x.type==='lantern');
    return {level:b.level,radius:window.GUILD_ROUTINES.lanternRadiusFor(b.id),fx:b.fxUntil>performance.now()};
  });
  expect(lanternAfter.level).toBe(2);
  expect(lanternAfter.radius).toBeGreaterThan(lanternBefore.radius);
  expect(lanternAfter.fx).toBeTruthy();

  const civilian=await page.evaluate(()=>{
    const hut=state.buildings.find(b=>b.type==='hut');
    const w={id:'test-civilian',role:'wood',x:hut.x+38,y:hut.y+20,seed:2,targetId:null,work:0,anim:0,cool:0,hp:85,maxHp:85,dead:false,death:0,hit:0};
    state.workers.push(w);state.enemies=[];state.cycle=.84;state.phase='night';
    for(let i=0;i<180;i++)updateWorkers(1/60);
    return {state:w.state,hidden:w.hiddenAtHome,homeId:w.homeId,hutId:hut.id,d:Math.hypot(w.x-hut.x,w.y-(hut.y+7))};
  });
  expect(civilian.homeId).toBe(civilian.hutId);
  expect(civilian.state).toBe('sleeping');
  expect(civilian.hidden).toBeTruthy();
  expect(civilian.d).toBeLessThan(20);

  const guardPatrol=await page.evaluate(()=>{
    state.enemies=[];state.projectiles=[];state.cycle=.35;state.phase='day';
    const w={id:'test-guard',role:'guard',x:0,y:0,seed:1,targetId:null,work:0,anim:0,cool:0,hp:120,maxHp:120,dead:false,death:0,hit:0};
    state.workers.push(w);let escaped=false;
    for(let i=0;i<600;i++){updateWorkers(1/60);if(!inside(w.x,w.y,bounds()))escaped=true}
    return {x:w.x,y:w.y,state:w.state,inside:inside(w.x,w.y,bounds()),escaped};
  });
  expect(guardPatrol.state).toBe('sector-patrol');
  expect(guardPatrol.inside).toBeTruthy();
  expect(guardPatrol.escaped).toBeFalsy();

  const remoteYield=await page.evaluate(()=>{
    state.enemies=[];state.cycle=.35;state.phase='day';state.wood=0;
    const w=state.workers.find(x=>x.id==='test-civilian');
    w.hiddenAtHome=false;w.state='idle';w.homeId=state.buildings.find(b=>b.type==='hut').id;
    const tree=state.nodes.find(n=>n.type==='tree'&&n.alive)||state.nodes.find(n=>n.type==='tree');
    tree.alive=true;tree.hp=tree.maxHp;tree.x=650;tree.y=500;tree.respawnAt=0;
    w.x=646;w.y=500;w.targetId=tree.id;w.work=0;
    state.player.x=0;state.player.y=0;
    for(let i=0;i<120;i++)updateWorkers(1/60);
    return {wood:state.wood,total:w.totalGathered?.wood||0,lastYield:w.lastYield||0,state:w.state};
  });
  expect(remoteYield.wood).toBeGreaterThan(0);
  expect(remoteYield.total).toBeGreaterThan(0);
  expect(remoteYield.lastYield).toBeGreaterThan(0);

  const buildFx=await page.evaluate(()=>{
    state.wood=5000;state.stone=5000;
    const before=new Set(state.buildings.map(b=>b.id));
    build('hut');
    const b=state.buildings.find(x=>!before.has(x.id));
    return {exists:!!b,fx:!!b&&b.fxUntil>performance.now(),kind:b?.fxKind,fxCount:fx.length};
  });
  expect(buildFx.exists).toBeTruthy();
  expect(buildFx.fx).toBeTruthy();
  expect(buildFx.kind).toBe('build');
  expect(buildFx.fxCount).toBeGreaterThan(0);

  expect(pageErrors).toEqual([]);
});
