const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=path.join(root,req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end()}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 let checks=0;const errors=[];const check=(ok,message)=>{assert(ok,message);checks++;console.log('PASS',message)};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&m.text().includes('v1.6'))errors.push(m.text())});
  await page.addInitScript(()=>{requestAnimationFrame=()=>0});
  await page.goto('http://127.0.0.1:'+server.address().port+'/prototype-chief-world.html');
  await page.waitForFunction(()=>window.VillageTransfer&&window.LivingUI);
  await page.evaluate(()=>{
   state.workers=[];state.enemies=[];state.projectiles=[];state.phase='day';state.cycle=.25;
   state.player.x=0;state.player.y=100;cam.x=0;cam.y=65;
   for(let i=0;i<3;i++){const w={id:'fix-'+i,role:i%2?'stone':'wood',x:-30+i*30,y:90,seed:i,anim:0,work:0,hp:85,maxHp:85,cool:0};Citizens.ensure(w);Logistics.ensure(w);Council.ensure(w);state.workers.push(w)}
   state.workers[0].cargo.wood=7.25;state.workers[0].harvested.wood=17.25;state.workers[0].delivered.wood=10;
   VillageSocial.state.relations={'fix-0':[{id:'fix-1',score:3,at:0}],'fix-1':[{id:'fix-0',score:3,at:0}]};
   VillageSocial.state.journal=[{id:'kept-entry',time:0,workerIds:['fix-0','fix-1'],type:'conversation',text:'荷物を一緒に届けた。'}];
   localStorage.setItem('chief-world-purchase-identity-v1','keep-local-identity');save();
  });
  const packed=await page.evaluate(()=>VillageTransfer.pack());
  const paths=['progression','progression.groups','progression.tech','pocket.policies','pocket.claimed','pocket.caches','chief.forge','chief.logistics','chief.logistics.harvested','chief.logistics.delivered','chief.logistics.recent','chief.logistics.parcels','chief.social','chief.social.cooldowns','chief.social.relations','chief.social.relations.fix-0','chief.social.used','chief.social.used.work','chief.social.journal','chief.social.journal.0.workerIds','chief.social.active','chief.living','chief.living.awards','chief.living.progress','workers.0.citizen','workers.0.citizen.life','workers.0.cargo','workers.0.harvested','workers.0.delivered','workers.0.totalGathered','world.resources','world.collected','world.outposts','world.shipments','world.home','world.scenes','world.scenes.forest','world.scenes.forest.nodes','world.scenes.forest.enemies','world.expeditions','world.log','world.bosses','world.visited','council','council.news','council.pending','council.delayed','council.resolved'];
  const rejected=await page.evaluate(({packed,paths})=>{
   const storage=()=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
   const beforeStorage=storage(),beforeState=serial();let cases=0;
   for(const path of paths)for(const bad of [1,'bad',true]){
    const data=JSON.parse(packed),keys=path.split('.');let owner=data.save;for(const key of keys.slice(0,-1))owner=owner[key];owner[keys.at(-1)]=bad;
    for(const run of [()=>VillageTransfer.parse(JSON.stringify(data)),()=>VillageTransfer.install(data.save,false)]){let rejected=false;try{run()}catch{rejected=true}if(!rejected)throw Error('accepted '+path+' = '+bad)}
    if(storage()!==beforeStorage||serial()!==beforeState)throw Error('mutated on rejection '+path);cases++;
   }
   for(const [path,bad] of [['progression.groups',[]],['progression.tech',null],['world.scenes.forest.nodes',{}],['chief.social.relations.fix-0',{}],['chief.logistics.parcels',[1]],['chief.social.journal',[1]]]){
    const data=JSON.parse(packed),keys=path.split('.');let owner=data.save;for(const key of keys.slice(0,-1))owner=owner[key];owner[keys.at(-1)]=bad;let rejected=false;try{VillageTransfer.parse(JSON.stringify(data))}catch{rejected=true}if(!rejected)throw Error('accepted '+path);cases++;
   }
   return {cases,unchanged:storage()===beforeStorage&&serial()===beforeState};
  },{packed,paths});
  check(rejected.cases===150&&rejected.unchanged,'150 malformed nested containers rejected before writes; primary/backup/identity/current state unchanged');
  const target=await page.evaluate(()=>({cargo:state.workers[0].cargo,harvested:state.workers[0].harvested,delivered:state.workers[0].delivered,relations:VillageSocial.state.relations,journal:VillageSocial.state.journal}));
  await page.evaluate(packed=>{state.wood=7;save();VillageTransfer.install(VillageTransfer.parse(packed),false)},packed);
  await page.reload();await page.waitForFunction(()=>window.LivingUI);
  check(await page.evaluate(target=>JSON.stringify({cargo:state.workers[0].cargo,harvested:state.workers[0].harvested,delivered:state.workers[0].delivered,relations:VillageSocial.state.relations,journal:VillageSocial.state.journal})===JSON.stringify(target),target),'current World export reload preserves cargo, totals, relations and journal');
  check(await page.evaluate(()=>localStorage.getItem('chief-world-purchase-identity-v1')==='keep-local-identity'&&JSON.parse(localStorage.getItem('guild-chief-world-v3-before-import')).wood===7),'valid install preserves identity and pre-import village');
  const migrated=JSON.parse(packed);delete migrated.save.progression;for(const k of ['logistics','social','living'])delete migrated.save.chief[k];delete migrated.save.council;for(const w of migrated.save.workers)for(const k of ['cargo','harvested','delivered','citizen'])delete w[k];
  await page.evaluate(data=>VillageTransfer.install(VillageTransfer.parse(JSON.stringify(data)),false),migrated);
  await page.reload();await page.waitForFunction(()=>window.LivingUI);
  check(await page.evaluate(()=>state.workers.length===3&&typeof state.progression.groups==='object'&&typeof state.progression.tech==='object'&&Logistics.cargoTotal(state.workers[0])===0),'older v3 World save missing additive fields migrates and actually reloads');
  await page.evaluate(()=>{
   state.workers=state.workers.slice(0,2);LivingUI.scan();state.workers=state.workers.slice(0,1);LivingUI.scan();
  });
  check(await page.evaluate(()=>LivingUI.trophies.find(t=>t.id==='team').value===2&&!LivingUI.trophies.find(t=>t.id==='team').earned),'unearned resident high-water progress survives loss');
  await page.evaluate(packed=>VillageTransfer.install(VillageTransfer.parse(packed),false),packed);
  await page.reload();await page.waitForFunction(()=>window.LivingUI);
  const resources=await page.evaluate(()=>{LivingUI.scan();const resources=[state.wood,state.stone,state.food,state.iron,state.renown];state.workers.pop();VillageSocial.state.relations={};LivingUI.scan();save();openPanel('record');$('living-record-tools').querySelector('[data-living-view="trophies"]').click();return resources});
  for(const id of ['team','friend'])check(await page.evaluate(id=>{const t=LivingUI.trophies.find(t=>t.id===id),card=document.querySelector('[data-living-title="'+id+'"]').closest('article');return t.earned&&t.value===t.goal&&card.querySelector('.chief-meter i').style.width==='100%'&&card.querySelector('span').textContent===t.goal+' / '+t.goal},id),id+' trophy remains completed after live condition falls');
  check(await page.evaluate(resources=>JSON.stringify([state.wood,state.stone,state.food,state.iron,state.renown])===JSON.stringify(resources),resources),'trophy scanning and losses grant no resources');
  await page.reload();await page.waitForFunction(()=>window.LivingUI);
  check(await page.evaluate(()=>['team','friend'].every(id=>{const t=LivingUI.trophies.find(t=>t.id===id);return t.earned&&t.value===t.goal})), 'team/friend completion persists reload');
  // Earned flags from pre-progress saves migrate to full goal.
  const oldAwards=JSON.parse(packed);oldAwards.save.chief.living={awards:{team:true,friend:true}};oldAwards.save.workers=oldAwards.save.workers.slice(0,1);oldAwards.save.chief.social.relations={};
  await page.evaluate(data=>VillageTransfer.install(VillageTransfer.parse(JSON.stringify(data)),false),oldAwards);
  await page.reload();await page.waitForFunction(()=>window.LivingUI);
  check(await page.evaluate(()=>LivingUI.state.progress.team===3&&LivingUI.state.progress.friend===1),'old earned flags migrate to completed bounded progress');
  // Two real nearby residents, one actual conversation pair. RAF disabled keeps fixtures deterministic.
  await page.evaluate(packed=>VillageTransfer.install(VillageTransfer.parse(packed),false),packed);
  await page.reload();await page.waitForFunction(()=>window.LivingFX);
  for(const size of [{width:390,height:844},{width:360,height:640},{width:844,height:390}]){
   await page.setViewportSize(size);await page.reload();await page.waitForFunction(()=>window.LivingFX);
   await page.evaluate(()=>{closeSheet();state.player.x=0;state.player.y=100;cam.x=0;cam.y=65;const a=state.workers[0],b=state.workers[1];a.x=-30;a.y=90;b.x=12;b.y=95;VillageSocial.state.active=null;VillageSocial.state.nextAt=0;VillageSocial.state.cooldowns={};LivingUI.celebrate('納品祭り！','8便到着 / みんなの足どり +10%・20秒','festival');if(!VillageSocial.startConversation(a,b,'cargo'))throw Error('conversation did not start');draw();drawEffects(.1)});
   check(await page.evaluate(()=>!$('living-celebration').hidden&&$('living-dialogue').hidden&&$('living-combo').hidden&&!!VillageSocial.state.active&&(()=>{const r=$('living-celebration').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()),size.width+'×'+size.height+' celebration suppresses a newly started conversation');
   if(process.env.LIVING_FIX_SCREENSHOTS){fs.mkdirSync(process.env.LIVING_FIX_SCREENSHOTS,{recursive:true});await page.screenshot({animations:'disabled',path:path.join(process.env.LIVING_FIX_SCREENSHOTS,'celebration-'+size.width+'x'+size.height+'.png')})}
   await page.evaluate(()=>{$('living-celebration').hidden=true;const n=state.nodes[0];n.alive=true;n.hp=10000;state.wood=0;for(let i=0;i<25;i++){Chief.state.time+=.1;hitNode(n)}draw();drawEffects(.1)});
   check(await page.evaluate(()=>!$('living-combo').hidden&&$('living-dialogue').hidden&&(()=>{const r=$('living-combo').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()),size.width+'×'+size.height+' combo value/meter has priority over dialogue');
   if(process.env.LIVING_FIX_SCREENSHOTS)await page.screenshot({animations:'disabled',path:path.join(process.env.LIVING_FIX_SCREENSHOTS,'combo-'+size.width+'x'+size.height+'.png')});
   await page.evaluate(()=>{Chief.tick(3);draw()});
   check(await page.evaluate(()=>$('living-dialogue').hidden),size.width+'×'+size.height+' expired combo cannot briefly overlap dialogue before effect refresh');
   await page.evaluate(()=>{drawEffects(.1);draw()});
   check(await page.evaluate(()=>{const el=$('living-dialogue'),b=el.getBoundingClientRect();return !el.hidden&&b.left>=0&&b.top>=0&&b.right<=innerWidth&&b.bottom<=innerHeight&&!!el.querySelector('b').textContent&&!!el.querySelector('span').textContent&&document.querySelectorAll('#living-dialogue').length===1}),size.width+'×'+size.height+' unobscured single dialogue name/text fits viewport');
   if(process.env.LIVING_FIX_SCREENSHOTS)await page.screenshot({animations:'disabled',path:path.join(process.env.LIVING_FIX_SCREENSHOTS,'conversation-'+size.width+'x'+size.height+'.png')});
   check(await page.evaluate(()=>{return document.documentElement.scrollWidth<=innerWidth&&$('living-workchip').getBoundingClientRect().height>=44&&LivingFX.report().texts<=24&&LivingFX.report().rings<=16&&LivingFX.report().receipts<=24&&fx.length<=160}),size.width+'×'+size.height+' controls stay 44px and visual effects bounded');
  }
  check(errors.length===0,'no uncaught browser or loader errors: '+JSON.stringify(errors));
  console.log(checks+' focused checks passed');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
