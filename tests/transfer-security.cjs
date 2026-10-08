const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const marker='<img src="missing-transfer-security" onerror="window.reviewImportMarker=1">';
const attribute='">'+marker+'<i data-x="';
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=path.join(root,req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end()}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 let checks=0;const errors=[];const check=(ok,message)=>{assert(ok,message);checks++;console.log('PASS',message)};
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0});
  await page.goto('http://127.0.0.1:'+server.address().port+'/prototype-chief-world.html');
  await page.waitForFunction(()=>window.VillageTransfer&&window.LivingUI);
  // Confirm this browser really runs the benign payload; a disabled-script fixture
  // would otherwise give a false sense of security for the import tests below.
  await page.evaluate(marker=>{const el=document.createElement('div');el.id='security-control';el.innerHTML=marker;document.body.append(el)},marker);
  await page.waitForFunction(()=>window.reviewImportMarker===1,null,{polling:20});
  check(await page.evaluate(()=>{document.getElementById('security-control').remove();delete window.reviewImportMarker;return true}),'execution-marker positive control fires in the real browser');
  const packed=await page.evaluate(()=>{
   state.workers=[];state.enemies=[];state.projectiles=[];state.phase='day';state.cycle=.25;
   for(let i=0;i<2;i++){const w={id:'security-'+i,role:'wood',x:i*20,y:90,seed:i,anim:0,work:0,hp:85,maxHp:85,cool:0};Citizens.ensure(w);Logistics.ensure(w);Council.ensure(w);state.workers.push(w)}
   localStorage.setItem('chief-world-purchase-identity-v1','destination-identity');save();return VillageTransfer.pack();
  });
  const reload=async()=>{await page.reload();await page.waitForFunction(()=>window.VillageTransfer&&window.LivingUI)};
  const inert=async(message)=>{
   // Give image errors/event handlers a turn to run, and independently require
   // that the parsed DOM contains no injected event attributes or images.
   await page.waitForTimeout(100);
   check(await page.evaluate(()=>!window.reviewImportMarker&&!document.querySelector('[onerror],img[src="missing-transfer-security"]')),message);
  };
  const building=JSON.parse(packed);building.save.buildings.push({id:attribute,type:'lumber',level:1,x:50,y:50});
  await page.evaluate(data=>VillageTransfer.install(VillageTransfer.parse(JSON.stringify(data)),false),building);
  await reload();await page.evaluate(()=>{openPanel('build');forceUiRefresh()});
  await inert('building ID parse → install → reload → build panel remains inert');
  check(await page.evaluate(id=>[...document.querySelectorAll('[data-upgrade-id]')].some(el=>el.dataset.upgradeId===id),attribute),'escaped building attribute preserves the exact original ID');
  check(await page.evaluate(id=>{state.wood=300;state.stone=240;state.iron=50;forceUiRefresh();const button=[...document.querySelectorAll('[data-upgrade-id]')].find(el=>el.dataset.upgradeId===id);button.click();return state.buildings.find(b=>b.id===id).level===2},attribute),'building with punctuation in its ID still upgrades through its actual button');
  const rejected=await page.evaluate(({packed,attribute})=>{
   const snapshot=()=>JSON.stringify({storage:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),state:serial()});
   const before=snapshot();let cases=0;
   for(const bad of [attribute,'false',1,0,null,{},[]]){
    const data=JSON.parse(packed);data.save.chief.autoForge=bad;
    for(const run of [()=>VillageTransfer.parse(JSON.stringify(data)),()=>VillageTransfer.install(data.save,false)]){let rejected=false;try{run()}catch{rejected=true}if(!rejected)throw Error('accepted non-boolean autoForge '+JSON.stringify(bad));if(snapshot()!==before)throw Error('rejection mutated destination');cases++}
   }
   return cases;
  },{packed,attribute});
  check(rejected===14,'14 non-boolean autoForge parse/install attempts reject atomically, including primary, backup, pre-import, identity and current state');
  await reload();await page.evaluate(()=>{openPanel('record');forceUiRefresh()});
  await inert('rejected autoForge execution payload cannot execute after reload and opening office');
  // Existing text escaping and owner-specific numeric normalization must survive
  // a realistic imported save too, including Japanese punctuation and markup.
  const text=JSON.parse(packed),name='村民「麦 & 石」 '+marker;
  text.save.workers[0].id=attribute;text.save.workers[0].citizen.name=name;
  text.save.chief.social.journal=[{id:'entry',time:0,workerIds:[attribute],type:'conversation',text:name}];
  text.save.world.log=[{text:name,time:0}];
  text.save.council.pending=[{id:attribute,title:name,body:name,options:[{label:name,description:name}]}];
  text.save.council.news=[{text:name,time:0}];
  text.save.world.resources.hardwood=marker;text.save.world.collected.hardwood=marker;text.save.world.outposts.forest=marker;text.save.world.shipments.forest=marker;
  text.save.pocket.tokens=marker;text.save.pocket.policies.harvest=marker;
  text.save.progression.tech.forestry=marker;text.save.chief.contracts=marker;text.save.chief.charter=marker;text.save.chief.monument=marker;
  await page.evaluate(data=>VillageTransfer.install(VillageTransfer.parse(JSON.stringify(data)),false),text);
  await reload();
  for(const panel of ['build','people','record','world']){
   await page.evaluate(panel=>{openPanel(panel);forceUiRefresh()},panel);
   await inert('imported text and normalized numeric fields remain inert in '+panel+' panel');
  }
  await page.evaluate(()=>{openPanel('people');document.querySelector('[data-living-tab="handbook"]').click();document.querySelector('[data-living-person]').click()});
  await inert('resident handbook and expanded history keep imported names, IDs and journal as text');
  check(await page.evaluate(name=>document.getElementById('living-people').textContent.includes(name)&&state.workers[0].citizen.name===name,name),'Japanese text and literal markup are preserved without blanket filtering');
  await page.evaluate(()=>{openPanel('world');document.querySelector('[data-tab="journal"]').click()});
  await inert('World journal displays imported log as inert text');
  // Missing is the older save representation; actual booleans are the current one.
  for(const value of [false,true,'missing']){
   const data=JSON.parse(packed);if(value==='missing')delete data.save.chief.autoForge;else data.save.chief.autoForge=value;
   await page.evaluate(data=>VillageTransfer.install(VillageTransfer.parse(JSON.stringify(data)),false),data);await reload();
   check(await page.evaluate(expected=>{openPanel('record');return Chief.state.autoForge===expected&&document.querySelector('[data-chief="auto"]').getAttribute('aria-pressed')===String(expected)},value===true),'valid autoForge '+value+' imports and reloads with correct boolean control');
  }
  // Defense in depth for a previously stored malformed scalar (outside importer).
  await page.evaluate(attribute=>{Chief.state.autoForge=attribute;ChiefUI.render(true)},attribute);
  await inert('office attribute itself never interpolates a raw autoForge string');
  check(await page.evaluate(()=>localStorage.getItem('chief-world-purchase-identity-v1')==='destination-identity'),'all imports preserve destination purchase identity');
  check(errors.length===0,'no browser exceptions: '+JSON.stringify(errors));
  console.log(checks+' transfer security checks passed');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
