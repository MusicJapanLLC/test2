import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html=readFileSync('prototype-v09-survival.html','utf8');
const js=readFileSync('survival-game-v09.js','utf8');
const css=readFileSync('ui-v09-survival.css','utf8');

const check=(name,fn)=>{try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}};

check('starts with zero workers',()=>assert(/workers:\[\]/.test(js)));
check('starts with no built town',()=>assert(/built:\{\}/.test(js)));
check('axe harvest exists',()=>assert(/harvestNode/.test(js)&&/斧/.test(js)));
check('zombie combat exists',()=>assert(/attackZombie/.test(js)&&/spawnWave/.test(js)));
check('day night cycle exists',()=>assert(/phase:'day'/.test(js)&&/STATE\.phase='night'/.test(js)));
check('barricade exists',()=>assert(/barricade/.test(js)&&/barricadeHP/.test(js)));
check('new building construction exists',()=>assert(/buildBuilding/.test(js)&&/BUILD_SITES/.test(js)));
check('worker cap 200',()=>assert(/NPC_CAP=200/.test(js)));
check('speed item max x3',()=>assert(/worldSpeed=3/.test(js)&&!/worldSpeed=4|worldSpeed=5|worldSpeed=10/.test(js)));
check('premium-like drops',()=>assert(/crystal/.test(js)&&/ticket/.test(js)&&/timeSand/.test(js)));
check('gacha rarity exists',()=>assert(/SSR/.test(js)&&/SR/.test(js)&&/rarity/.test(js)));
check('autosave 2 seconds',()=>assert(/setInterval\(\(\)=>saveNow\('interval'\),2000\)/.test(js)));
check('autosave important lifecycle',()=>assert(/pagehide/.test(js)&&/beforeunload/.test(js)&&/visibilitychange/.test(js)));
check('two slot save fallback',()=>assert(/SAVE_BACKUP/.test(js)&&/バックアップセーブ/.test(js)));
check('bottom UI exists',()=>assert(/id="ticker"/.test(html)&&/id="context"/.test(html)&&/id="nav"/.test(html)));
check('pixel renderer',()=>assert(/image-rendering:pixelated/.test(css)));
check('no TAP TO START',()=>assert(!/TAP TO START/i.test(html+js)));
check('no permanent ABXY',()=>assert(!/id="action-[ABXY]"/.test(html)));

if(!process.exitCode) console.log('GUILD∞ v0.9 survival smoke suite PASS');
