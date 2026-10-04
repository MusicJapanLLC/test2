import { test, expect } from '@playwright/test';

const URL='http://127.0.0.1:4173/prototype-buildjoy-v16.html';

test('v1.6 repeat building, menu touch, respawn and reload stay stable', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto(URL,{waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_DEBUG?.version==='v16.4-stability');

  const diag=await page.evaluate(()=>window.GUILD_DEBUG.diagnostics());
  expect(diag.hutSpots).toBeGreaterThanOrEqual(3);
  expect(diag.lanternSpots).toBeGreaterThanOrEqual(3);
  expect(diag.buttons).toBeGreaterThanOrEqual(9);

  await page.evaluate(()=>{
    state.wood=1500;state.stone=1200;state.food=800;state.iron=20;state.renown=20;
    updateHud(true);
  });

  await page.click('#dock [data-panel="build"]');
  await expect(page.locator('#sheet')).toBeVisible();
  await expect(page.locator('.build-grid button').first()).toHaveAttribute('data-build','palisade');

  for(let i=0;i<3;i++) await page.click('[data-build="hut"]');
  const huts=await page.evaluate(()=>state.buildings.filter(b=>b.type==='hut').length);
  expect(huts).toBe(3);

  for(let i=0;i<3;i++) await page.click('[data-build="lantern"]');
  const lanterns=await page.evaluate(()=>state.buildings.filter(b=>b.type==='lantern').length);
  expect(lanterns).toBe(3);

  // Touch several different build systems; none may kill the animation loop.
  await page.click('[data-build="lumber"]');
  await page.click('[data-build="quarry"]');
  await page.click('[data-build="guild"]');
  await page.click('[data-build="palisade"]');

  const cycleA=await page.evaluate(()=>state.cycle);
  await page.waitForTimeout(650);
  const cycleB=await page.evaluate(()=>state.cycle);
  expect(cycleB).not.toBe(cycleA);

  // Expired nodes must revive; old dead nodes with no timer must receive a timer.
  const respawn=await page.evaluate(()=>{
    const tree=state.nodes.find(n=>n.type==='tree');
    tree.alive=false;tree.hp=0;tree.respawnAt=Date.now()-1;
    respawnNodes();
    const treeAlive=tree.alive&&tree.hp>0;
    const rock=state.nodes.find(n=>n.type==='rock');
    rock.alive=false;rock.hp=0;rock.respawnAt=0;
    respawnNodes();
    const rockTimer=Number.isFinite(rock.respawnAt)&&rock.respawnAt>Date.now();
    rock.respawnAt=Date.now()-1;respawnNodes();
    return {treeAlive,rockTimer,rockAlive:rock.alive&&rock.hp>0};
  });
  expect(respawn.treeAlive).toBeTruthy();
  expect(respawn.rockTimer).toBeTruthy();
  expect(respawn.rockAlive).toBeTruthy();

  await page.evaluate(()=>save());
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.GUILD_DEBUG?.version==='v16.4-stability');
  const persisted=await page.evaluate(()=>({
    huts:state.buildings.filter(b=>b.type==='hut').length,
    lanterns:state.buildings.filter(b=>b.type==='lantern').length
  }));
  expect(persisted.huts).toBeGreaterThanOrEqual(3);
  expect(persisted.lanterns).toBeGreaterThanOrEqual(3);
  expect(pageErrors).toEqual([]);
});
