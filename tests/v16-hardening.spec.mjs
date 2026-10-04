import { test, expect } from '@playwright/test';

const URL='http://127.0.0.1:4173/prototype-buildjoy-v16.html';

test('v1.6 hardening: civilians cross all four gates, wall archers stay off, reset is available', async ({ page }) => {
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto(URL,{waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_HARDENING?.version==='v16.8-hardening');

  const traffic=await page.evaluate(()=>{
    state.palisade={built:true,level:3,hp:980,maxHp:980,builtAt:performance.now()};
    state.cycle=.35;state.phase='day';state.enemies=[];state.projectiles=[];state.buildings=[];state.workers=[];
    const B=bounds();
    const targets=[
      {id:'north-node',x:0,y:B.t-150},{id:'east-node',x:B.r+150,y:0},{id:'south-node',x:0,y:B.b+150},{id:'west-node',x:B.l-150,y:0}
    ];
    state.nodes=targets.map((p,i)=>({id:p.id,x:p.x,y:p.y,type:'tree',hp:9999,maxHp:9999,alive:true,respawnAt:0,starter:false,seed:i}));
    state.workers=targets.map((p,i)=>({id:'wood-'+i,role:'wood',x:(i-1.5)*8,y:0,seed:i,targetId:p.id,work:0,anim:0,cool:0,hp:85,maxHp:85,dead:false,death:0,hit:0}));
    const crossed=[false,false,false,false],crossPoint=[null,null,null,null],wasInside=[true,true,true,true];
    for(let f=0;f<1500;f++){
      updateWorkers(1/60);
      state.workers.forEach((w,i)=>{const now=inside(w.x,w.y,B);if(wasInside[i]&&!now&&!crossed[i]){crossed[i]=true;crossPoint[i]={x:w.x,y:w.y,gate:pointInGateOpening(w.x,w.y,B,0)}}wasInside[i]=now});
    }
    return {crossed,crossPoint,outside:state.workers.map(w=>!inside(w.x,w.y,B)),positions:state.workers.map(w=>({x:w.x,y:w.y})),gates:fourGateDefs(B).map(g=>g.id)};
  });
  expect(traffic.gates.sort()).toEqual(['east','north','south','west']);
  expect(traffic.crossed.every(Boolean)).toBeTruthy();
  expect(traffic.crossPoint.every(p=>p&&p.gate)).toBeTruthy();
  expect(traffic.outside.every(Boolean)).toBeTruthy();

  const defense=await page.evaluate(()=>{
    state.enemies=[];state.projectiles=[];state.buildings=[];const B=bounds();
    state.enemies.push({id:'z',type:'walker',x:B.r+70,y:0,hp:100,maxHp:100,spd:20,dmg:8,anim:0,cool:0,hit:0,dead:false,death:0,seed:0,sunBurn:false,burnFx:0});
    towerCombat(1/60);const withoutTower=state.projectiles.filter(p=>p.kind==='arrow').length;
    state.buildings.push({id:'tower',type:'watchtower',level:2,x:B.r-40,y:0,cool:0,builtAt:performance.now()});towerCombat(1/60);
    const withTower=state.projectiles.filter(p=>p.kind==='arrow').length;
    return {withoutTower,withTower,limit:window.GUILD_HARDENING.watchtowerLimit(),report:window.GUILD_HARDENING.report()};
  });
  expect(defense.withoutTower).toBe(0);
  expect(defense.withTower).toBeGreaterThan(0);
  expect(defense.limit.max).toBe(16);
  expect(defense.report.wallArchers).toBeFalsy();

  await page.click('#dock [data-panel="record"]');
  await expect(page.locator('#reset-game')).toBeVisible();
  await page.click('#reset-game');
  await expect(page.locator('#reset-game')).toHaveText(/もう一度/);

  const reset=await page.evaluate(()=>{
    state.wood=77;save();const before=[localStorage.getItem(SAVE),localStorage.getItem(BACKUP)];window.GUILD_HARDENING.resetNow(false);return{before:before.map(Boolean),after:[localStorage.getItem(SAVE),localStorage.getItem(BACKUP)]};
  });
  expect(reset.before[0]).toBeTruthy();
  expect(reset.after).toEqual([null,null]);
  expect(pageErrors).toEqual([]);
});
