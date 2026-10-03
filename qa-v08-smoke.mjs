import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html=readFileSync('prototype-v08.html','utf8');
const css=readFileSync('ui-v08.css','utf8');
const game=readFileSync('game-v08.js','utf8');
const audio=readFileSync('audio-v07.js','utf8');
const core=readFileSync('style.css','utf8');
const check=(name,fn)=>{try{fn();console.log(`PASS ${name}`)}catch(e){console.error(`FAIL ${name}: ${e.message}`);process.exitCode=1}};

check('no blocking start screen',()=>assert(!/TAP TO START/i.test(html+game)));
check('bottom dock exists',()=>assert(/id="bottom-dock"/.test(html)));
check('ticker exists',()=>assert(/id="event-ticker"/.test(html)&&/id="ticker-text"/.test(html)));
check('quick actions always present',()=>{assert(/id="upgrade"/.test(html));assert(/id="hire"/.test(html));assert(/id="fever"/.test(html));});
check('no permanent D-pad or ABXY',()=>assert(!/id="controller"|class="dpad"|action-A|action-B|action-X|action-Y/.test(html)));
check('smooth drag movement',()=>{assert(/pointermove/.test(game));assert(/function vector\(/.test(game));assert(/P\.vx/.test(game)&&/P\.vy/.test(game));});
check('no tap-to-destination routing',()=>assert(!/findRoute|autoRoute|destination\s*=|touchMove\(/.test(game)));
check('release stops movement',()=>assert(/P\.vx=P\.vy=0/.test(game)));
check('roster cap is 200',()=>assert(/ROSTER_CAP=200/.test(game)));
check('visible actor cap protects readability',()=>assert(/VISIBLE_CAP=24/.test(game)));
check('facility upgrade system exists',()=>{assert(/facilityCost/.test(game));assert(/upgradeBuilding/.test(game));assert(/buildingLv/.test(game));});
check('speed item is gated and max x3',()=>{assert(/S\.boostItems--/.test(game));assert(/boostSpeed>=3/.test(game));assert(/boostSpeed\+\+/.test(game));});
check('speed returns to x1',()=>assert(/boostSpeed=1/.test(game)&&/boostTime===0/.test(game)));
check('bottom sheet is partial overlay',()=>assert(/max-height:min\(42vh,330px\)/.test(css)));
check('single digital font rhythm',()=>assert(/--font-game/.test(css)&&/font-family:var\(--font-game\)/.test(css)));
check('pixel rendering retained',()=>assert(/image-rendering:pixelated/.test(core)));
check('long-session audio still wired',()=>assert(/audio-v07\.js/.test(html)&&/exponentialRampToValueAtTime|setTargetAtTime/.test(audio)));

if(!process.exitCode) console.log('GUILD∞ v0.8 bottom-first smoke suite PASS');
