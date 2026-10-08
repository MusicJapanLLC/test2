import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import Stripe from 'stripe';
import {createService} from './service.js';

const env = {APP_URL:'https://game.example', STRIPE_SECRET_KEY:['rk','test','fixture'].join('_'), STRIPE_WEBHOOK_SECRET:'fixture-signing-secret'};
const signer = new Stripe(env.STRIPE_SECRET_KEY);
async function setup(t, options={}) {
  const dir=await mkdtemp(join(tmpdir(),'chief-payments-'));
  const dbPath=join(dir,'payments.sqlite');
  const sessions=new Map(); const attempts=new Map(); let seq=0; let failed=false;
  const fake={webhooks:signer.webhooks, checkout:{sessions:{
    async create(params, opts){
      if(options.delay) await new Promise(r=>setTimeout(r,30));
      if(attempts.has(opts.idempotencyKey)){const previous=attempts.get(opts.idempotencyKey);assert.deepEqual(params,previous.params);return previous;}
      const id='cs_'+ ++seq;
      const s={id,object:'checkout.session',mode:'payment',status:'open',payment_status:'unpaid',livemode:false,currency:'jpy',amount_total:params.line_items[0].price_data.unit_amount,metadata:params.metadata,payment_intent:options.initialPaymentIntentNull?null:'pi_'+seq,url:'https://checkout.stripe.com/c/pay/'+id,
        line_items:{data:[{quantity:1,amount_total:params.line_items[0].price_data.unit_amount,currency:'jpy',price:{unit_amount:params.line_items[0].price_data.unit_amount,currency:'jpy',product:{metadata:params.line_items[0].price_data.product_data.metadata}}}]},params,opts};
      sessions.set(id,s);attempts.set(opts.idempotencyKey,s);if(options.failFirst&&!failed){failed=true;throw new Error('ambiguous network timeout');}return s;
    }, async retrieve(id){if(!sessions.has(id)) throw new Error('no session');return sessions.get(id);}
  }},charges:{async retrieve(id){return options.charges?.[id];}}};
  let service; let base;
  async function start(extra={}) {service=createService({stripe:fake,dbPath,env:{...env,...options.env,...extra}}); await new Promise(r=>service.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+service.server.address().port;}
  await start();
  t.after(async()=>{await stop();await rm(dir,{recursive:true,force:true});});
  async function stop(){await new Promise(r=>service.server.close(r));service.close();}
  async function request(path,{body,token,headers={},method=body!==undefined?'POST':'GET'}={}){const response=await fetch(base+path,{method,headers:{...(body!==undefined?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{}),...headers},body:body!==undefined?JSON.stringify(body):undefined});return {status:response.status,headers:response.headers,...await response.json()};}
  const player=await request('/api/player',{body:{}});
  async function checkout(sku='golden_seal',extra={}){return request('/api/checkout',{body:{sku,requestId:'request-'+Math.random().toString(36).slice(2),...extra},token:player.token});}
  async function webhook(type,object,id='evt_'+Math.random().toString(36).slice(2),bad=false){const payload=JSON.stringify({id,object:'event',type,livemode:object.livemode??false,data:{object}});const signature=bad?'bad':signer.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET});const response=await fetch(base+'/api/webhook',{method:'POST',headers:{'content-type':'application/json','stripe-signature':signature},body:payload});return {status:response.status,...await response.json()};}
  async function paid(sku='golden_seal'){const c=await checkout(sku);const s=sessions.get(c.sessionId);s.status='complete';s.payment_status='paid';if(s.payment_intent===null)s.payment_intent='pi_'+s.id.slice(3);return s;}
  const entitlements=()=>request('/api/entitlements',{token:player.token});
  return {request,player,checkout,webhook,paid,entitlements,sessions,dbPath,stop,start};
}

test('anonymous requests cannot read entitlements or buy',async t=>{const f=await setup(t);assert.equal((await f.request('/api/entitlements')).status,401);assert.equal((await f.request('/api/checkout',{body:{sku:'golden_seal',requestId:'r'}})).status,401);});
test('player secrets are random and stored only as hashes; recovery restores original identity',async t=>{const f=await setup(t);assert.equal(f.player.status,201);assert.match(f.player.token,/^[A-Za-z0-9_-]{43}$/);assert.equal(f.player.recoveryCode,f.player.token);const db=new DatabaseSync(f.dbPath);const row=db.prepare('SELECT * FROM players').get();assert.equal(JSON.stringify(row).includes(f.player.token),false);assert.match(row.token_hash,/^[a-f0-9]{64}$/);db.close();const another=await f.request('/api/player',{body:{}});assert.notEqual(another.playerId,f.player.playerId);const restored=await f.request('/api/restore',{body:{recoveryCode:f.player.recoveryCode}});assert.equal(restored.playerId,f.player.playerId);assert.equal(restored.token,f.player.token);assert.equal((await f.request('/api/restore',{body:{recoveryCode:'wrong'}})).status,404);});
test('catalog uses exact server prices and checkout ignores client amounts and redirects',async t=>{const f=await setup(t);const c=await f.request('/api/catalog');assert.equal(c.mode,'test');assert.deepEqual(c.products.map(p=>[p.sku,p.amount,p.currency]),[['supporter',300,'jpy'],['golden_seal',980,'jpy'],['mayor_mech',1980,'jpy']]);assert.equal((await f.checkout('invalid')).status,400);const bought=await f.checkout('golden_seal',{amount:1,success_url:'https://evil.example'});assert.equal(bought.status,200);const s=f.sessions.get(bought.sessionId);assert.equal(s.amount_total,980);assert.equal(s.params.success_url,'https://game.example/?checkout=success');assert.equal(s.params.cancel_url,'https://game.example/?checkout=cancelled');assert.equal(s.params.payment_method_types,undefined);assert.equal(s.params.automatic_tax,undefined);assert.match(s.params.integration_identifier,/^chief_world_[a-z]{8}$/);});
test('parallel identical purchases share one durable Checkout session',async t=>{const f=await setup(t,{delay:true});const results=await Promise.all([f.checkout(),f.checkout(),f.checkout()]);assert.ok(results.every(r=>r.status===200));assert.equal(new Set(results.map(r=>r.sessionId)).size,1);assert.equal(f.sessions.size,1);await f.stop();await f.start();assert.equal((await f.checkout()).sessionId,results[0].sessionId);});
test('expired Checkout can be replaced without treating cancel redirect as ownership',async t=>{const f=await setup(t);const first=await f.checkout();assert.deepEqual((await f.entitlements()).entitlements,[]);f.sessions.get(first.sessionId).status='expired';const next=await f.checkout();assert.notEqual(next.sessionId,first.sessionId);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('unpaid completion grants nothing; asynchronous paid success grants once',async t=>{const f=await setup(t);const c=await f.checkout();const s=f.sessions.get(c.sessionId);assert.equal((await f.webhook('checkout.session.completed',s)).status,200);assert.deepEqual((await f.entitlements()).entitlements,[]);s.status='complete';s.payment_status='paid';assert.equal((await f.webhook('checkout.session.async_payment_succeeded',s)).status,200);assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);});
test('SDK rejects invalid signatures before any grant',async t=>{const f=await setup(t);const s=await f.paid();assert.equal((await f.webhook('checkout.session.completed',s,'evt_bad',true)).status,400);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('paid completion, duplicate event and distinct event for same session fulfill exactly once',async t=>{const f=await setup(t);const s=await f.paid();for(const id of ['evt_1','evt_1','evt_2']) assert.equal((await f.webhook('checkout.session.completed',s,id)).status,200);assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);assert.equal((await f.checkout()).status,409);const db=new DatabaseSync(f.dbPath);assert.equal(db.prepare("SELECT count(*) n FROM orders WHERE status='paid'").get().n,1);db.close();});
for(const [name,change] of [['wrong amount',s=>s.amount_total=1],['wrong currency',s=>s.currency='usd'],['wrong mode',s=>s.livemode=true],['fabricated order',s=>s.metadata.orderId='unknown'],['wrong sku',s=>s.metadata.sku='supporter'],['wrong line item',s=>s.line_items.data[0].price.unit_amount=1]]) test(name+' rejects fulfillment',async t=>{const f=await setup(t);const s=await f.paid();change(s);assert.equal((await f.webhook('checkout.session.completed',s)).status,400);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('full refund revokes and repeated success cannot regrant',async t=>{const f=await setup(t);const s=await f.paid();await f.webhook('checkout.session.completed',s);assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);await f.webhook('charge.refunded',{id:'ch_1',payment_intent:s.payment_intent,amount:980,amount_refunded:980,currency:'jpy',livemode:false});await f.webhook('checkout.session.completed',s);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('refund before success leaves a durable tombstone across restart',async t=>{const f=await setup(t);const s=await f.paid();await f.webhook('charge.refunded',{id:'ch_1',payment_intent:s.payment_intent,amount:980,amount_refunded:980,currency:'jpy',livemode:false});await f.stop();await f.start();assert.equal((await f.webhook('checkout.session.completed',s)).status,200);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('partial refund retains access until cumulative refund is full',async t=>{const f=await setup(t);const s=await f.paid();await f.webhook('checkout.session.completed',s);await f.webhook('charge.refunded',{id:'ch_1',payment_intent:s.payment_intent,amount:980,amount_refunded:300,currency:'jpy',livemode:false});assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);await f.webhook('charge.refunded',{id:'ch_1',payment_intent:s.payment_intent,amount:980,amount_refunded:980,currency:'jpy',livemode:false});assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('successful refund.updated uses authoritative cumulative charge refund',async t=>{const f=await setup(t,{charges:{ch_full:{id:'ch_full',payment_intent:'pi_1',amount:980,amount_refunded:980,currency:'jpy',livemode:false}}});const s=await f.paid();await f.webhook('checkout.session.completed',s);await f.webhook('refund.updated',{id:'re_1',charge:'ch_full',payment_intent:s.payment_intent,amount:980,status:'pending',livemode:false});assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);await f.webhook('refund.updated',{id:'re_1',charge:'ch_full',payment_intent:s.payment_intent,amount:980,status:'succeeded',livemode:false});assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('dispute before fulfillment prevents later grant',async t=>{const f=await setup(t);const s=await f.paid();await f.webhook('charge.dispute.created',{id:'dp_1',payment_intent:s.payment_intent,livemode:false});await f.webhook('checkout.session.completed',s);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('entitlements survive restart and restore after local identity reset',async t=>{const f=await setup(t);await f.webhook('checkout.session.completed',await f.paid('mayor_mech'));await f.stop();await f.start();assert.deepEqual((await f.entitlements()).entitlements,['mayor_mech']);const reset=await f.request('/api/player',{body:{}});assert.deepEqual((await f.request('/api/entitlements',{token:reset.token})).entitlements,[]);assert.deepEqual((await f.request('/api/restore',{body:{recoveryCode:f.player.token}})).entitlements,['mayor_mech']);});
for(const [label,config] of [['missing credentials',{STRIPE_SECRET_KEY:'',STRIPE_WEBHOOK_SECRET:''}],['live without explicit gate',{STRIPE_SECRET_KEY:['rk','live','fixture'].join('_')}],['missing webhook secret',{STRIPE_WEBHOOK_SECRET:''}]])test(label+' uses honest preview with no checkout',async t=>{const f=await setup(t,{env:config});assert.equal((await f.request('/api/catalog')).mode,'preview');assert.equal((await f.checkout()).status,503);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('test ownership never becomes live ownership',async t=>{const f=await setup(t);await f.webhook('checkout.session.completed',await f.paid());await f.stop();await f.start({STRIPE_SECRET_KEY:['rk','live','fixture'].join('_'),LIVE_PAYMENTS_ENABLED:'true'});assert.equal((await f.request('/api/health')).mode,'live');assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('CORS only accepts configured origins and writes enforce JSON and body cap',async t=>{const f=await setup(t);assert.equal((await f.request('/api/player',{body:{},headers:{origin:'https://evil.example'}})).status,403);const allowed=await f.request('/api/catalog',{headers:{origin:'https://game.example'}});assert.equal(allowed.headers.get('access-control-allow-origin'),'https://game.example');assert.equal((await f.request('/api/player',{body:{},headers:{'content-type':'text/plain'}})).status,415);assert.equal((await f.request('/api/player',{body:{large:'x'.repeat(70000)}})).status,413);});
test('restore brute force hits bounded rate limit',async t=>{const f=await setup(t);let last;for(let i=0;i<25;i++)last=await f.request('/api/restore',{body:{recoveryCode:'bad'}});assert.equal(last.status,429);});
test('unpaid fabricated order metadata is rejected',async t=>{const f=await setup(t);const c=await f.checkout();const s=f.sessions.get(c.sessionId);s.metadata.orderId='fabricated';assert.equal((await f.webhook('checkout.session.completed',s)).status,400);assert.deepEqual((await f.entitlements()).entitlements,[]);});
test('ambiguous Stripe failure retries same order and exact parameters after restart',async t=>{const f=await setup(t,{failFirst:true});assert.equal((await f.checkout('supporter',{requestId:'durable-retry'})).status,503);await f.stop();await f.start();const retried=await f.checkout('supporter',{requestId:'durable-retry'});assert.equal(retried.status,200);assert.equal(f.sessions.size,1);});
test('request IDs cannot be reused for a different SKU',async t=>{const f=await setup(t);assert.equal((await f.checkout('supporter',{requestId:'same-request'})).status,200);assert.equal((await f.checkout('mayor_mech',{requestId:'same-request'})).status,409);assert.equal(f.sessions.size,1);});
test('an unresolved order beyond Stripe idempotency retention cannot create another charge',async t=>{const f=await setup(t,{failFirst:true});await f.checkout();const db=new DatabaseSync(f.dbPath);db.prepare('UPDATE orders SET created_at=?').run(Date.now()-24*60*60*1000);db.close();assert.equal((await f.checkout()).status,409);assert.equal(f.sessions.size,1);});
test('failed asynchronous payment closes the pending order without granting',async t=>{const f=await setup(t);const c=await f.checkout();const s=f.sessions.get(c.sessionId);s.status='complete';await f.webhook('checkout.session.async_payment_failed',s);assert.deepEqual((await f.entitlements()).entitlements,[]);const replacement=await f.checkout();assert.equal(replacement.status,200);assert.notEqual(replacement.sessionId,c.sessionId);});
test('retrieved payment intent must match the intent associated with the order',async t=>{const f=await setup(t);const s=await f.paid();s.payment_intent='pi_other';assert.equal((await f.webhook('checkout.session.completed',s)).status,400);assert.deepEqual((await f.entitlements()).entitlements,[]);});

test('expired original request consistently rejects while a fresh request can replace it',async t=>{
  const f=await setup(t);const first=await f.checkout('golden_seal',{requestId:'original-request'});
  f.sessions.get(first.sessionId).status='expired';
  for(let i=0;i<2;i++){const retry=await f.checkout('golden_seal',{requestId:'original-request'});assert.equal(retry.status,409);assert.equal(retry.error,'request_expired');assert.equal(retry.url,undefined);}
  const replacement=await f.checkout('golden_seal',{requestId:'fresh-request'});assert.equal(replacement.status,200);assert.notEqual(replacement.sessionId,first.sessionId);
  const oldRetry=await f.checkout('golden_seal',{requestId:'original-request'});assert.equal(oldRetry.status,409);assert.equal(oldRetry.error,'request_expired');
  assert.deepEqual((await f.entitlements()).entitlements,[]);
});
test('a null creation-time payment intent is first associated only by paid fulfillment',async t=>{
  const f=await setup(t,{initialPaymentIntentNull:true});const c=await f.checkout();const s=f.sessions.get(c.sessionId);
  const db=new DatabaseSync(f.dbPath);assert.equal(s.payment_intent,null);assert.equal(db.prepare('SELECT payment_intent FROM orders').get().payment_intent,null);
  await f.webhook('checkout.session.completed',s);assert.deepEqual((await f.entitlements()).entitlements,[]);
  s.payment_intent='pi_late_association';s.status='complete';s.payment_status='paid';
  for(const id of ['evt_late_paid','evt_late_paid','evt_late_repeat'])assert.equal((await f.webhook('checkout.session.completed',s,id)).status,200);
  assert.deepEqual((await f.entitlements()).entitlements,['golden_seal']);assert.equal(db.prepare('SELECT payment_intent FROM orders').get().payment_intent,'pi_late_association');db.close();
});
test('refund tombstone before first payment-intent association blocks fulfillment and replays',async t=>{
  const f=await setup(t,{initialPaymentIntentNull:true});const c=await f.checkout();const s=f.sessions.get(c.sessionId);assert.equal(s.payment_intent,null);
  await f.webhook('charge.refunded',{id:'ch_before_association',payment_intent:'pi_late_refunded',amount:980,amount_refunded:980,currency:'jpy',livemode:false});
  await f.stop();await f.start();s.payment_intent='pi_late_refunded';s.status='complete';s.payment_status='paid';
  for(const id of ['evt_refunded_late','evt_refunded_late','evt_refunded_replay'])assert.equal((await f.webhook('checkout.session.completed',s,id)).status,200);
  assert.deepEqual((await f.entitlements()).entitlements,[]);const db=new DatabaseSync(f.dbPath);const order=db.prepare('SELECT payment_intent,status FROM orders').get();assert.equal(order.payment_intent,'pi_late_refunded');assert.equal(order.status,'revoked');db.close();
});
test('fixed Checkout redirects retain nested APP_URL path and query while ignoring client URLs',async t=>{
  const f=await setup(t,{env:{APP_URL:'https://raw.githack.com/MusicJapanLLC/test2/COMMIT/prototype-chief-world-standalone.html?lang=ja&checkout=old#town'}});
  const unauth=await f.request('/api/checkout',{body:{sku:'golden_seal',requestId:'no-auth',success_url:'https://evil.example'}});assert.equal(unauth.status,401);
  const c=await f.checkout('golden_seal',{success_url:'https://evil.example/pay',cancel_url:'https://evil.example/cancel',APP_URL:'https://evil.example'});assert.equal(c.status,200);
  const params=f.sessions.get(c.sessionId).params;
  assert.equal(params.success_url,'https://raw.githack.com/MusicJapanLLC/test2/COMMIT/prototype-chief-world-standalone.html?lang=ja&checkout=success#town');
  assert.equal(params.cancel_url,'https://raw.githack.com/MusicJapanLLC/test2/COMMIT/prototype-chief-world-standalone.html?lang=ja&checkout=cancelled#town');
  assert.equal(f.sessions.size,1);
});
test('catalog and hosted Checkout describe the actual permanent combat and cosmetic benefits',async t=>{
  const f=await setup(t);const catalog=await f.request('/api/catalog');
  const descriptions=Object.fromEntries(catalog.products.map(p=>[p.sku,p.description]));
  assert.match(descriptions.supporter,/王冠/);assert.match(descriptions.supporter,/太っ腹村長/);assert.match(descriptions.supporter,/攻撃力は変わりません/);
  assert.match(descriptions.golden_seal,/攻撃力4倍/);assert.match(descriptions.golden_seal,/黄金の波動/);
  assert.match(descriptions.mayor_mech,/15秒間/);assert.match(descriptions.mayor_mech,/攻撃力6倍/);assert.match(descriptions.mayor_mech,/被ダメージ80%軽減/);assert.match(descriptions.mayor_mech,/45秒ごと/);assert.match(descriptions.mayor_mech,/重複しません/);
  for(const p of catalog.products){assert.match(p.description,/永久/);assert.doesNotMatch(p.description,/建設|育成|生産/);const c=await f.checkout(p.sku);assert.equal(f.sessions.get(c.sessionId).params.line_items[0].price_data.product_data.description,p.description);}
});
