/* GUILD∞ behavioral regression checks. Run: node tests/playtest.cjs
 * Optional: GUILD_URL=http://127.0.0.1:8080 GUILD_BROWSER=webkit
 * Tests read state through the public API and operate real input / UI.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test-results');
const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const keys = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
let server, browser, base, screenshotFontCSS;
const results = [];
const state = page => page.evaluate(() => window.GUILD_API.getState());
const pos = s => [s.player.x, s.player.y];
const sleep = (page, ms) => page.waitForTimeout(ms);
const move = async (page, dir) => { await page.evaluate(d => window.GUILD_API.move(d), dir); await sleep(page, 220); };
async function fresh(options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  if (options.init) await context.addInitScript(options.init);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'load' });
  if (screenshotFontCSS) { await page.addStyleTag({ content: screenshotFontCSS }); await page.evaluate(() => document.fonts.ready); }
  await page.waitForFunction(() => window.GUILD_API && typeof window.GUILD_API.getState === 'function', null, { timeout: 5000 });
  await sleep(page, 240);
  return { page, context, errors };
}
async function check(name, fn, options) {
  if (process.env.GUILD_TEST_FILTER && !name.toLowerCase().includes(process.env.GUILD_TEST_FILTER.toLowerCase())) return;
  let fixture;
  try {
    fixture = await fresh(options);
    await fn(fixture.page, fixture.errors);
    assert.deepEqual(fixture.errors, [], 'uncaught page errors');
    results.push({ name, status: 'PASS' });
    console.log('PASS ' + name);
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
    console.log('FAIL ' + name + ': ' + e.message);
    if (fixture) await fixture.page.screenshot({ path: path.join(OUT, name.replace(/\W+/g, '-') + '.png') }).catch(() => {});
  } finally { if (fixture) await fixture.context.close(); }
}
async function pathToCorridor(page, steps = 5) {
  const route = await page.evaluate(({ steps, dirs }) => {
    const api = window.GUILD_API, g = api.worldGridSize, p = api.getState().player;
    const queue = [{ x: p.x, y: p.y, path: [] }], seen = new Set([p.x + ',' + p.y]);
    for (let i = 0; i < queue.length && i < 2000; i++) {
      const n = queue[i];
      for (const [d, delta] of Object.entries(dirs)) {
        if (Array.from({ length: steps }, (_, j) => j + 1).every(j => api.canWalk(n.x + delta[0] * g * j, n.y + delta[1] * g * j))) return { path: n.path, dir: d };
      }
      for (const [d, delta] of Object.entries(dirs)) {
        const x = n.x + delta[0] * g, y = n.y + delta[1] * g, key = x + ',' + y;
        if (!seen.has(key) && api.canWalk(x, y)) { seen.add(key); queue.push({ x, y, path: [...n.path, d] }); }
      }
    }
    return null;
  }, { steps, dirs });
  assert(route, 'reachable corridor exists');
  for (const dir of route.path) await move(page, dir);
  return route.dir;
}
async function openMenu(page) { await page.keyboard.press('x'); await sleep(page, 100); assert.equal((await state(page)).menuOpen, true); }
async function closeMenu(page) { await page.keyboard.press('Escape'); await sleep(page, 100); assert.equal((await state(page)).menuOpen, false); }
async function showButton(page, id) {
  if (!(await page.locator(id).isVisible())) await openMenu(page);
  assert(await page.locator(id).isVisible(), id + ' available');
}
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (process.env.GUILD_FONT_CSS) {
    const fontCSSPath = path.resolve(process.env.GUILD_FONT_CSS);
    screenshotFontCSS = fs.readFileSync(fontCSSPath, 'utf8').replace(/url\(([^)]+)\)/g, (_, file) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.resolve(path.dirname(fontCSSPath), file.replace(/["']/g, ''))).toString('base64') + ')');
    screenshotFontCSS += '\nhtml,body,button{font-family:ui-monospace,SFMono-Regular,Menlo,"Noto Sans JP",monospace}';
  }
  if (process.env.GUILD_URL) base = process.env.GUILD_URL;
  else {
    server = http.createServer((req, res) => {
      const name = decodeURIComponent((req.url || '/').split('?')[0]);
      const file = path.resolve(ROOT, '.' + (name === '/' ? '/index.html' : name));
      if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (error, content) => {
        if (error) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
        res.end(content);
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = 'http://127.0.0.1:' + server.address().port;
  }
  if (process.env.GUILD_ENTRY) base += '/' + process.env.GUILD_ENTRY;
  browser = await (process.env.GUILD_BROWSER === 'webkit' ? webkit : chromium).launch({ headless: true, ...(process.env.GUILD_EXECUTABLE ? { executablePath: process.env.GUILD_EXECUTABLE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] } : {}) });
  await check('autostart and economic loop', async page => {
    const a = await state(page);
    assert.equal(await page.evaluate(() => window.GUILD_API.worldGridSize), 24);
    assert.equal(await page.locator('canvas').count(), 1);
    assert(a.npcs > 0 && a.npcs <= 10, 'small existing NPC population');
    await sleep(page, 1000);
    const b = await state(page);
    for (const key of ['gold', 'wood', 'food']) assert(b.resources[key] > a.resources[key], key + ' production');
    assert.equal(b.npcs, a.npcs);
    assert.deepEqual(pos(b), pos(a), 'no spontaneous movement');
  });
  await check('NPC routing and deliveries at world speed ten', async page => {
    await page.evaluate(() => window.GUILD_API.setSpeed(10));
    const initial = await state(page), moved = new Set(); let first;
    for (let sample = 0; sample < 55; sample++) {
      const snapshot = await page.evaluate(() => {
        const api = window.GUILD_API; api.save();
        const key = Object.keys(localStorage).find(key => { try { return Array.isArray(JSON.parse(localStorage.getItem(key)).npcs); } catch (_) { return false; } });
        const data = JSON.parse(localStorage.getItem(key));
        return { npcs: data.npcs, bad: data.npcs.filter(n => !api.canWalk(Math.round(n.x / 24) * 24, Math.round(n.y / 24) * 24)), invalidRoutes: data.npcs.filter(n => Array.isArray(n.route) && n.route.some((p, i, all) => !api.canWalk(p.x, p.y) || (i > 0 && Math.abs(p.x - all[i-1].x) + Math.abs(p.y - all[i-1].y) !== 24))) };
      });
      assert.equal(snapshot.npcs.length, initial.npcs, 'fixed NPC population');
      assert.deepEqual(snapshot.bad, [], 'NPCs remain on walkable grid cells');
      assert.deepEqual(snapshot.invalidRoutes, [], 'paths consist of walkable cardinal tile steps');
      if (!first) first = snapshot.npcs;
      snapshot.npcs.forEach((n, i) => { if (Math.hypot(n.x - first[i].x, n.y - first[i].y) > 12) moved.add(i); });
      await sleep(page, 160);
    }
    const final = await state(page);
    assert.equal(moved.size, initial.npcs, 'every existing NPC moves through the town');
    assert(final.resources.gold - initial.resources.gold > 100, 'deliveries supplement passive income');
    assert(final.resources.wood - initial.resources.wood > 3, 'deliveries return wood');
    assert(final.resources.food > initial.resources.food, 'food economy remains active');
  });
  await check('single input and held grid repeat', async page => {
    const dir = await pathToCorridor(page), a = await state(page);
    await page.keyboard.press(keys[dir]); await sleep(page, 240);
    const b = await state(page), delta = dirs[dir];
    assert.deepEqual(pos(b), [a.player.x + delta[0] * 24, a.player.y + delta[1] * 24], 'one key = exactly one tile');
    await page.keyboard.down(keys[dir]); await sleep(page, 510); await page.keyboard.up(keys[dir]); await sleep(page, 240);
    const c = await state(page), distance = Math.abs(c.player.x - b.player.x) + Math.abs(c.player.y - b.player.y);
    assert(distance >= 48 && distance <= 120, 'held input repeats at measured SFC cadence');
    assert.equal(distance % 24, 0);
    await sleep(page, 400); assert.deepEqual(pos(await state(page)), pos(c), 'release stops all repeats');
  });
  await check('background and blur clear held input', async page => {
    const dir = await pathToCorridor(page);
    await page.keyboard.down(keys[dir]); await sleep(page, 80);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await sleep(page, 240); const stopped = pos(await state(page));
    await sleep(page, 450); assert.deepEqual(pos(await state(page)), stopped, 'blur stops repeat');
    await page.keyboard.up(keys[dir]);
    await page.keyboard.down(keys[opposite[dir]]); await sleep(page, 80);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await sleep(page, 240); const hidden = pos(await state(page));
    await sleep(page, 450); assert.deepEqual(pos(await state(page)), hidden, 'hidden page stops repeat');
    await page.keyboard.up(keys[opposite[dir]]);
  });
  await check('collision and blocked tile protection', async page => {
    const route = await page.evaluate(dirs => {
      const api = window.GUILD_API, p = api.getState().player, g = api.worldGridSize;
      const queue = [{ x: p.x, y: p.y, path: [] }], seen = new Set([p.x + ',' + p.y]);
      for (let i = 0; i < queue.length && i < 2000; i++) {
        const n = queue[i];
        for (const [d, delta] of Object.entries(dirs)) {
          const x = n.x + delta[0] * g, y = n.y + delta[1] * g;
          if (!api.canWalk(x, y)) return { path: n.path, dir: d };
          const key = x + ',' + y;
          if (!seen.has(key)) { seen.add(key); queue.push({ x, y, path: [...n.path, d] }); }
        }
      }
    }, dirs);
    assert(route, 'wall can be reached');
    for (const d of route.path) await move(page, d);
    const a = await state(page); await move(page, route.dir);
    assert.deepEqual(pos(await state(page)), pos(a), 'cannot enter blocked tile');
  });
  await check('menu actions and movement isolation', async page => {
    const dir = await pathToCorridor(page), a = await state(page);
    await openMenu(page); await page.keyboard.press(keys[dir]); await sleep(page, 300);
    assert.deepEqual(pos(await state(page)), pos(a), 'menu input cannot move world player');
    await closeMenu(page); await page.keyboard.press(keys[dir]); await sleep(page, 240);
    assert.notDeepEqual(pos(await state(page)), pos(a), 'movement restores after close');
    await page.evaluate(() => window.GUILD_API.action('Y')); await sleep(page, 100);
    await page.evaluate(() => window.GUILD_API.action('B')); await sleep(page, 100);
    assert.equal((await state(page)).menuOpen, false, 'B closes auxiliary action');
  });
  await check('world speed does not multiply player step', async page => {
    const dir = await pathToCorridor(page, 8), a = await state(page);
    await page.keyboard.down(keys[dir]); await sleep(page, 510); await page.keyboard.up(keys[dir]); await sleep(page, 220);
    const normal = await state(page), normalDistance = Math.abs(normal.player.x - a.player.x) + Math.abs(normal.player.y - a.player.y);
    assert(normalDistance >= 48, 'normal-speed held repeats');
    for (let i = 0; i < normalDistance / 24; i++) await move(page, opposite[dir]);
    await showButton(page, '#speed');
    for (let i = 0; i < 3; i++) await page.locator('#speed').click();
    if ((await state(page)).menuOpen) await closeMenu(page);
    assert.notEqual((await state(page)).speed, a.speed, 'world speed changes');
    const b = await state(page); await page.keyboard.press(keys[dir]); await sleep(page, 240);
    const c = await state(page), delta = dirs[dir];
    assert.deepEqual(pos(c), [b.player.x + delta[0] * 24, b.player.y + delta[1] * 24]);
    await move(page, opposite[dir]);
    const fastStart = await state(page);
    await page.keyboard.down(keys[dir]); await sleep(page, 510); await page.keyboard.up(keys[dir]); await sleep(page, 220);
    const fast = await state(page), fastDistance = Math.abs(fast.player.x - fastStart.player.x) + Math.abs(fast.player.y - fastStart.player.y);
    assert.equal(fastDistance, normalDistance, 'world multiplier cannot change player repeat cadence');
  });
  await check('upgrade preserves fixed NPC population', async page => {
    await showButton(page, '#speed');
    for (let i = 0; i < 3; i++) await page.locator('#speed').click();
    if ((await state(page)).menuOpen) await closeMenu(page);
    await page.waitForFunction(() => window.GUILD_API.getState().resources.gold >= 120, null, { timeout: 15000 });
    await showButton(page, '#upgrade'); const a = await state(page);
    await page.locator('#upgrade').click(); await sleep(page, 250);
    const b = await state(page);
    assert.equal(b.resources.lv, a.resources.lv + 1);
    assert.equal(b.npcs, a.npcs, 'building upgrade never spawns NPCs');
    assert(b.resources.gold < a.resources.gold, 'upgrade spends gold');
  });
  await check('save reload restores player and resources', async page => {
    const dir = await pathToCorridor(page); await move(page, dir);
    const saved = await state(page); await page.evaluate(() => window.GUILD_API.save());
    await page.reload(); await page.waitForFunction(() => window.GUILD_API); await sleep(page, 240);
    const loaded = await state(page);
    assert.deepEqual(pos(loaded), pos(saved)); assert.equal(loaded.npcs, saved.npcs);
    assert.equal(loaded.resources.lv, saved.resources.lv); assert.equal(loaded.speed, saved.speed);
    for (const key of ['gold', 'wood', 'food']) assert(loaded.resources[key] >= saved.resources[key] && loaded.resources[key] < saved.resources[key] + 30, key + ' restored');
  });
  await check('corrupt save recovers safely', async page => {
    await page.evaluate(() => { window.GUILD_API.save(); for (const key of Object.keys(localStorage)) localStorage.setItem(key, '{invalid JSON'); });
    await page.reload(); await page.waitForFunction(() => window.GUILD_API); await sleep(page, 200);
    const s = await state(page); assert(Number.isFinite(s.resources.gold)); assert(s.resources.lv >= 1 && s.resources.lv <= 100);
    assert.equal(await page.evaluate(() => window.GUILD_API.canWalk(window.GUILD_API.getState().player.x, window.GUILD_API.getState().player.y)), true);
  });
  await check('valid JSON save cannot inject invalid state', async page => {
    const validation = await page.evaluate(() => {
      const api = window.GUILD_API; api.save();
      const key = Object.keys(localStorage).find(key => { try { return JSON.parse(localStorage.getItem(key)).resources; } catch (_) { return false; } });
      if (!key) return { missing: true };
      const good = JSON.parse(localStorage.getItem(key));
      const bad = structuredClone(good); bad.resources.gold = 1e100; bad.resources.lv = 1e9;
      localStorage.setItem(key, JSON.stringify(bad)); const rejected = api.load();
      good.player = { x: 999999, y: -999999, dir: 'not-a-direction' };
      if (Array.isArray(good.npcs)) good.npcs = Array.from({ length: 100 }, (_, i) => good.npcs[i % good.npcs.length]);
      localStorage.setItem(key, JSON.stringify(good)); api.load();
      const s = api.getState();
      return { rejected, state: s, walkable: api.canWalk(s.player.x, s.player.y) };
    });
    assert(!validation.missing, 'save record schema found');
    assert.equal(validation.rejected, false, 'invalid resource payload rejected');
    assert(validation.state.resources.gold < 1e15 && validation.state.resources.lv <= 50);
    assert(validation.walkable, 'invalid coordinate cannot strand player');
    assert.equal(validation.state.player.x % 24, 0); assert.equal(validation.state.player.y % 24, 0);
    assert(validation.state.npcs > 0 && validation.state.npcs <= 10, 'save cannot inject extra NPCs');
  });
  await check('unavailable storage remains playable', async page => {
    await page.evaluate(() => { window.GUILD_API.save(); window.GUILD_API.load(); });
    const dir = await pathToCorridor(page), a = await state(page); await move(page, dir);
    assert.notDeepEqual(pos(await state(page)), pos(a));
  }, { init: () => { for (const method of ['getItem', 'setItem', 'removeItem']) Storage.prototype[method] = () => { throw new DOMException('Storage unavailable', 'SecurityError'); }; } });
  await check('touch hold cancellation and multitouch isolation', async page => {
    const dir = await pathToCorridor(page), button = page.locator(`[data-dir="${dir}"], [data-direction="${dir}"], #${dir}, #d-${dir}`).first();
    assert(await button.isVisible());
    const a = await state(page);
    const box = await button.boundingBox(), point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    await sleep(page, 410);
    await button.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', isPrimary: true, bubbles: true });
    await page.mouse.up();
    await sleep(page, 240); const stopped = await state(page);
    assert.notDeepEqual(pos(stopped), pos(a), 'held touch repeats');
    await sleep(page, 350); assert.deepEqual(pos(await state(page)), pos(stopped), 'pointercancel ends hold');
    await page.mouse.down();
    await sleep(page, 100);
    const action = page.locator('[data-action="X"], #action-x, #btn-x').first();
    assert(await action.isVisible());
    await action.tap();
    await sleep(page, 240);
    assert.equal((await state(page)).menuOpen, true, 'second touch opens menu');
    const menuPos = pos(await state(page)); await sleep(page, 350);
    assert.deepEqual(pos(await state(page)), menuPos, 'menu clears first finger movement');
    await page.mouse.up();
  });
  await check('audio enable mute and resume are gesture safe', async page => {
    assert.equal(await page.evaluate(() => window.GuildAudio.isMuted), true, 'starts silent');
    await page.locator('#sound').tap(); await sleep(page, 250);
    assert.equal(await page.evaluate(() => window.GuildAudio.isMuted), false, 'gesture starts audio');
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'true');
    await page.locator('#sound').tap(); await sleep(page, 100);
    assert.equal(await page.evaluate(() => window.GuildAudio.isMuted), true, 'mute stops audio');
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');
    await page.locator('#sound').tap(); await sleep(page, 200);
    assert.equal(await page.evaluate(() => window.GuildAudio.isMuted), false, 'audio reenables');
    await page.evaluate(() => window.GuildAudio.pause()); await sleep(page, 50);
    await page.evaluate(() => window.GuildAudio.resume()); await sleep(page, 100);
    assert.equal(await page.evaluate(() => window.GuildAudio.isMuted), false, 'background resume preserves enabled preference');
  });
  if (process.env.GUILD_BROWSER !== 'webkit') await check('native two finger touch and cancellation', async page => {
    const dir = await pathToCorridor(page), dpad = page.locator(`[data-dir="${dir}"]`), action = page.locator('[data-action="X"]');
    const d = await dpad.boundingBox(), x = await action.boundingBox();
    const first = { x: d.x + d.width / 2, y: d.y + d.height / 2, id: 1 }, second = { x: x.x + x.width / 2, y: x.y + x.height / 2, id: 2 };
    const session = await page.context().newCDPSession(page), a = await state(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] }); await sleep(page, 360);
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await sleep(page, 220);
    const stopped = await state(page); assert.notDeepEqual(pos(stopped), pos(a));
    await sleep(page, 350); assert.deepEqual(pos(await state(page)), pos(stopped), 'native touch cancellation releases repeat');
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] }); await sleep(page, 80);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first, second] }); await sleep(page, 220);
    assert.equal((await state(page)).menuOpen, true, 'second finger opens menu while first holds direction');
    const menuPos = pos(await state(page)); await sleep(page, 350); assert.deepEqual(pos(await state(page)), menuPos);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await session.detach();
  });
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await check('touch controls ' + viewport.width + 'x' + viewport.height, async page => {
      const boxes = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('[data-dir], [data-direction], [data-action], #dpad button, #actions button, #abxy button'));
        return [...new Set(elements)].filter(e => e.offsetWidth && e.offsetHeight).map(e => { const r = e.getBoundingClientRect(); return { id: e.id, text: e.textContent.trim(), x: r.x, y: r.y, width: r.width, height: r.height, circle: getComputedStyle(e).borderRadius === '50%' }; });
      });
      assert(boxes.length >= 8, '4 directions and ABXY are visible');
      for (const b of boxes) { assert(b.width >= 40 && b.height >= 40, b.text + ' touch target'); assert(b.x >= 0 && b.y >= 0 && b.x + b.width <= viewport.width + 1 && b.y + b.height <= viewport.height + 1, b.text + ' within viewport'); }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const overlap = a.circle && b.circle ? Math.hypot(a.x + a.width / 2 - b.x - b.width / 2, a.y + a.height / 2 - b.y - b.height / 2) < (a.width + b.width) / 2 - 1 : a.x < b.x + b.width - 1 && a.x + a.width > b.x + 1 && a.y < b.y + b.height - 1 && a.y + a.height > b.y + 1;
        assert(!overlap, a.text + ' and ' + b.text + ' overlap');
      }
      const dir = await pathToCorridor(page), a = await state(page);
      const button = page.locator(`[data-dir="${dir}"], [data-direction="${dir}"], #${dir}, #d-${dir}`).first();
      assert(await button.isVisible(), dir + ' directional button');
      await button.tap(); await sleep(page, 240);
      const delta = dirs[dir]; assert.deepEqual(pos(await state(page)), [a.player.x + delta[0] * 24, a.player.y + delta[1] * 24], 'touch = one tile');
      await page.screenshot({ path: path.join(OUT, 'viewport-' + viewport.width + 'x' + viewport.height + '.png') });
    }, { viewport });
  }
  fs.writeFileSync(path.join(OUT, 'results-' + (process.env.GUILD_BROWSER || 'chromium') + (process.env.GUILD_TEST_FILTER ? '-' + process.env.GUILD_TEST_FILTER.replace(/\W+/g, '-') : '') + '.json'), JSON.stringify(results, null, 2));
  console.log(results.filter(r => r.status === 'PASS').length + '/' + results.length + ' passed');
  process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) server.close(); });
