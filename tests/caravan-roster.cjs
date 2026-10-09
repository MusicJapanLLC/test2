/* Scoped final-review regression: full supported roster survives real migration/reload. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  const server = http.createServer((req, res) => {
    if (req.url !== '/prototype-chief-world-standalone.html') {
      res.writeHead(404).end();
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(path.join(root, 'prototype-chief-world-standalone.html')));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/tmp/chromium',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => { requestAnimationFrame = () => 0; });
    await page.goto(`http://127.0.0.1:${server.address().port}/prototype-chief-world-standalone.html`);
    const before = await page.evaluate(() => {
      state.workers = Array.from({ length: 300 }, (_, i) => ({
        id: 'roster-' + i, role: 'wood', x: 0, y: 40, seed: i % 4,
        hp: 85, maxHp: 85, dead: false, cool: 0, anim: 0, work: 0,
        cargo: { wood: 0, stone: 0, food: 0 },
        citizen: { number: i, name: '住民' + i, trait: i % 6, level: 1, xp: 0, total: 0, chatAt: 1000 }
      }));
      for (const worker of state.workers) {
        Logistics.ensure(worker);
        Council.ensure(worker);
      }
      VillageSocial.state.time = 100;
      VillageSocial.state.relations = {};
      VillageSocial.state.cooldowns = {};
      for (let i = 0; i < 300; i++) {
        VillageSocial.state.relations['roster-' + i] = [1, 2, 3].map(offset => ({
          id: 'roster-' + ((i + offset) % 300), score: 5 - offset, at: 99
        }));
        VillageSocial.state.cooldowns['roster-' + i] = 105;
      }
      Campaign.state.completed = true;
      state.enemies = [];
      state.projectiles = [];
      state.player.down = 0;
      const snapshot = JSON.parse(JSON.stringify({
        workers: state.workers.map(worker => worker.id),
        relations: VillageSocial.state.relations,
        cooldowns: VillageSocial.state.cooldowns
      }));
      return { ...snapshot, migration: Campaign.migrate('rain', false) };
    });
    assert.equal(before.migration.ok, true);
    await page.reload();
    const after = await page.evaluate(() => ({
      stage: Campaign.current().id,
      workers: state.workers.map(worker => worker.id),
      relations: VillageSocial.state.relations,
      cooldowns: VillageSocial.state.cooldowns
    }));
    assert.equal(after.stage, 'rain');
    assert.deepEqual(after.workers, before.workers);
    assert.deepEqual(after.relations, before.relations);
    assert.deepEqual(after.cooldowns, before.cooldowns);
    assert.deepEqual(errors, []);
    const result = {
      checks: 6,
      description: 'Actual standalone migration/reload retains all 300 resident IDs, 300 relationship owners with three ties each, and 300 cooldown owners.',
      before: { residents: before.workers.length, relationshipOwners: Object.keys(before.relations).length, cooldownOwners: Object.keys(before.cooldowns).length },
      after: { stage: after.stage, residents: after.workers.length, relationshipOwners: Object.keys(after.relations).length, cooldownOwners: Object.keys(after.cooldowns).length },
      lastOwner: { id: 'roster-299', relationships: after.relations['roster-299'], cooldown: after.cooldowns['roster-299'] },
      errors,
      notes: 'Focused Chromium fixture with animation frozen; real serializer, validator, storage and boot normalization. No broad suite or production mutation.'
    };
    fs.mkdirSync(path.join(root, 'qa/caravan-v5'), { recursive: true });
    fs.writeFileSync(path.join(root, 'qa/caravan-v5/roster-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
