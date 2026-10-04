import { test, expect } from '@playwright/test';

const URL='http://127.0.0.1:4173/prototype-buildjoy-v16.html';

test('v1.6 defense hardening: four gates, sector guards, stronger watchtowers and no wall archers', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto(URL,{waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_DEFENSE?.version==='v16.7-defense'&&window.GUILD_HARDENING?.version==='v16.8-hardening');

  const gateResult=await page.evaluate(()=>{
    state.palisade={built:true,level:2,hp:620,maxHp:620,builtAt:performance.now()};
    const B=bounds(),g=window.GUILD_DEFENSE.gates();
    return {
      ids:g.map(x=>x.id),
      openings:g.map(x=>!wallCollision(x.x,x.y,7)),
      solid:[wallCollision(B.l+55,B.t,7),wallCollision(B.r-55,B.b,7),wallCollision(B.l,B.t+55,7),wallCollision(B.r,B.b-55,7)],
      routes:[route({x:0,y:0},0,B.t-150),route({x:0,y:0},B.r+150,0),route({x:0,y:0},0,B.b+150),route({x:0,y:0},B.l-150,0)]
    };
  });
  expect(gateResult.ids.sort()).toEqual(['east','north','south','west']);
  expect(gateResult.openings.every(Boolean)).toBeTruthy();
  expect(gateResult.solid.every(Boolean)).toBeTruthy();
  expect(gateResult.routes[0].y).toBeLessThan(0);
  expect(gateResult.routes[1].x).toBeGreaterThan(0);
  expect(gateResult.routes[2].y).toBeGreaterThan(0);
  expect(gateResult.routes[3].x).toBeLessThan(0);

  const guardCoverage=await page.evaluate(()=>{
    state.workers=[];state.enemies=[];state.projectiles=[];state.phase='day';state.cycle=.35;
    for(let i=0;i<4;i++)state.workers.push({id:'guard-'+i,role:'guard',x:0,y:0,seed:i,targetId:null,work:0,anim:0,cool:0,hp:120,maxHp:120,dead:false,death:0,hit:0});
    const assignments=state.workers.map(w=>window.GUILD_DEFENSE.guardAssignment(w.id));
    let escaped=false;
    for(let i=0;i<720;i++){updateWorkers(1/60);for(const w of state.workers)if(!inside(w.x,w.y,bounds()))escaped=true}
    return {escaped,states:state.workers.map(w=>w.state),assignments:assignments.map(a=>a.map(p=>p.side))};
  });
  expect(guardCoverage.escaped).toBeFalsy();
  expect(guardCoverage.states.every(s=>s==='sector-patrol')).toBeTruthy();
  expect(new Set(guardCoverage.assignments.map(a=>a.join(','))).size).toBe(4);

  const guardFire=await page.evaluate(()=>{
    state.enemies=[];state.projectiles=[];const g=state.workers[0],a=window.GUILD_DEFENSE.guardAssignment(g.id)[0];
    g.x=a.x;g.y=a.y;g.cool=0;const B=bounds();let ex=a.x,ey=a.y;
    if(a.side==='north')ey=B.t-52;if(a.side==='south')ey=B.b+52;if(a.side==='west')ex=B.l-52;if(a.side==='east')ex=B.r+52;
    state.enemies.push({id:'edge-z',type:'walker',x:ex,y:ey,hp:120,maxHp:120,spd:20,dmg:8,anim:0,cool:0,hit:0,dead:false,death:0,seed:0,sunBurn:false,burnFx:0});
    updateWorkers(1/60);return {state:g.state,arrows:state.projectiles.filter(p=>p.kind==='arrow').length};
  });
  expect(guardFire.state).toBe('guard-fire');
  expect(guardFire.arrows).toBeGreaterThan(0);

  const towerOnly=await page.evaluate(()=>{
    state.projectiles=[];state.enemies=[];state.buildings=state.buildings.filter(b=>b.type!=='watchtower');
    const B=bounds(),enemy={id:'tower-z',type:'brute',x:B.r+80,y:0,hp:200,maxHp:200,spd:18,dmg:20,anim:0,cool:0,hit:0,dead:false,death:0,seed:0,sunBurn:false,burnFx:0};state.enemies.push(enemy);
    const tower={id:'tw-test',type:'watchtower',level:2,x:B.r-40,y:0,cool:0,builtAt:performance.now()};state.buildings.push(tower);towerCombat(1/60);
    const towerArrow=state.projectiles.find(p=>p.kind==='arrow');
    state.projectiles=[];state.buildings=state.buildings.filter(b=>b.id!=='tw-test');towerCombat(1/60);
    return {towerDamage:towerArrow?.damage||0,wallArrowCount:state.projectiles.filter(p=>p.kind==='arrow').length,limit:window.GUILD_HARDENING.watchtowerLimit()};
  });
  expect(towerOnly.towerDamage).toBeGreaterThanOrEqual(44);
  expect(towerOnly.wallArrowCount).toBe(0);
  expect(towerOnly.limit.max).toBeGreaterThan(8);

  const repairResult=await page.evaluate(()=>{
    const B=bounds(),w=state.workers.find(x=>x.role==='guard')||state.workers[0];
    w.role='wood';w.x=B.r;w.y=0;w.targetId=null;state.nodes[0].alive=true;state.nodes[0].x=B.r+150;state.nodes[0].y=0;w.targetId=state.nodes[0].id;
    state.palisade.hp=0;state.palisade.maxHp=620;state.wood=50;state.player.x=B.r;state.player.y=0;contextAct();
    return {hp:state.palisade.hp,x:w.x,y:w.y,blocked:wallCollision(w.x,w.y,9),next:route(w,state.nodes[0].x,state.nodes[0].y)};
  });
  expect(repairResult.hp).toBeGreaterThan(0);
  expect(repairResult.blocked).toBeFalsy();
  expect(Math.abs(repairResult.next.x-repairResult.x)+Math.abs(repairResult.next.y-repairResult.y)).toBeGreaterThan(0);

  expect(pageErrors).toEqual([]);
});
