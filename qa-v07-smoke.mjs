import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html = readFileSync('prototype-v07-smooth.html','utf8');
const game = readFileSync('smooth-game-v07.js','utf8');
const audio = readFileSync('audio-v07.js','utf8');
const ui = readFileSync('ui-v06.css','utf8');

const check = (name, fn) => {
  try { fn(); console.log(`PASS ${name}`); }
  catch (error) { console.error(`FAIL ${name}: ${error.message}`); process.exitCode = 1; }
};

check('no TAP TO START',()=>assert(!/TAP TO START/i.test(html+game)));
check('no permanent ABXY controller',()=>assert(!/<nav[^>]+id=["']controller["'][^>]*(?!hidden)/i.test(html) || /id=["']controller["'][^>]*hidden/i.test(html)));
check('no tap-to-destination route system',()=>assert(!/touchMove\(|findRoute\(|autoRoute|destination\s*=/.test(game)));
check('smooth pointer movement exists',()=>{assert(/pointermove/.test(game));assert(/P\.vx/.test(game));assert(/P\.vy/.test(game));});
check('release stops movement',()=>assert(/P\.vx=P\.vy=0/.test(game)));
check('building tap inspect remains',()=>assert(/function inspect\(/.test(game)));
check('menu exists',()=>{assert(/id=["']menu-toggle["']/.test(html));assert(/id=["']menu["']/.test(html));});
check('audio v0.7 wired',()=>assert(/audio-v07\.js/.test(html)));
check('audio fade behavior present',()=>assert(/exponentialRampToValueAtTime|setTargetAtTime/.test(audio)));
check('offline save timestamp present',()=>{assert(/savedAt/.test(game));assert(/localStorage/.test(game));});
check('NPC cap remains 10',()=>assert(/slice\(0,10\)|>=10/.test(game)));
check('pixel rendering retained',()=>assert(/image-rendering:\s*pixelated/.test(readFileSync('style.css','utf8'))));
check('ABXY hidden in v0.6 UI layer',()=>assert(/#controller\{display:none!important\}/.test(ui)));

if (!process.exitCode) console.log('GUILD∞ v0.7 smoke suite PASS');
