import {createServer} from 'node:http';
import {randomBytes, randomUUID, createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import Stripe from 'stripe';

export const CATALOG = Object.freeze([
  {sku:'supporter',name:'村長への差し入れ',amount:300,currency:'jpy',description:'王冠と「太っ腹村長」の称号を永久解放。村長の攻撃力は変わりません。'},
  {sku:'golden_seal',name:'黄金の決裁印',amount:980,currency:'jpy',description:'村長の攻撃力4倍と黄金の波動を永久解放。'},
  {sku:'mayor_mech',name:'村長ロボ',amount:1980,currency:'jpy',description:'村長ロボを永久解放。45秒ごとに起動でき、15秒間、村長の攻撃力6倍・被ダメージ80%軽減。黄金の決裁印の倍率とは重複しません。'}
].map(Object.freeze));
const hash = value => createHash('sha256').update(value).digest('hex');
const idOf = value => typeof value==='string' ? value : value?.id;
class ApiError extends Error {constructor(status,code){super(code);this.status=status;this.code=code;}}
const fail = (status,code) => {throw new ApiError(status,code);};

export function createService({stripe,dbPath,env=process.env}={}) {
  const key=env.STRIPE_SECRET_KEY||'';
  const keyMode=/^(?:rk|sk)_test_/.test(key)?'test':/^(?:rk|sk)_live_/.test(key)?'live':'preview';
  const mode=keyMode!=='preview' && env.STRIPE_WEBHOOK_SECRET && (keyMode!=='live'||env.LIVE_PAYMENTS_ENABLED==='true') ? keyMode : 'preview';
  const app=new URL(env.APP_URL||'http://localhost:8080');
  if(!['http:','https:'].includes(app.protocol)||app.username||app.password) throw new Error('Invalid APP_URL');
  if(mode==='live'&&app.protocol!=='https:') throw new Error('Live APP_URL must use HTTPS');
  const successUrl=new URL(app.href), cancelUrl=new URL(app.href);
  successUrl.searchParams.set('checkout','success');
  cancelUrl.searchParams.set('checkout','cancelled');
  const origins=new Set([app.origin,...(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean)]);
  for(const origin of origins) if(new URL(origin).origin!==origin) throw new Error('ALLOWED_ORIGINS must contain exact origins');
  const client=stripe||(mode!=='preview'?new Stripe(key,{apiVersion:'2026-09-30.endive',timeout:15000,maxNetworkRetries:2}):null);
  const path=dbPath||env.DATABASE_PATH||'./data/payments.sqlite';
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true,mode:0o700});
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,token_hash TEXT UNIQUE NOT NULL,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,player_id TEXT NOT NULL REFERENCES players(id),sku TEXT NOT NULL,mode TEXT NOT NULL,amount INTEGER NOT NULL,request_id TEXT NOT NULL,status TEXT NOT NULL,created_at INTEGER NOT NULL,session_id TEXT UNIQUE,session_url TEXT,payment_intent TEXT UNIQUE,UNIQUE(player_id,request_id,mode));
    CREATE UNIQUE INDEX IF NOT EXISTS pending_purchase ON orders(player_id,sku,mode) WHERE status IN ('creating','pending');
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,type TEXT NOT NULL,processed_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS revocations(payment_intent TEXT NOT NULL,mode TEXT NOT NULL,reason TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(payment_intent,mode));`);
  const sql=(text,...params)=>db.prepare(text).get(...params);
  const run=(text,...params)=>db.prepare(text).run(...params);
  function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}
  const entitlementList=player=>mode==='preview'?[]:db.prepare("SELECT DISTINCT sku FROM orders WHERE player_id=? AND mode=? AND status='paid' ORDER BY sku").all(player,mode).map(r=>r.sku);
  const limits=new Map();
  function limit(key,max){const now=Date.now();for(const [k,v] of limits)if(v.until<=now)limits.delete(k);let row=limits.get(key);if(!row){if(limits.size>=4096)fail(429,'rate_limited');row={count:0,until:now+60000};limits.set(key,row);}if(++row.count>max)fail(429,'rate_limited');}
  function authenticate(req){const value=/^Bearer ([A-Za-z0-9_-]{43})$/.exec(req.headers.authorization||'')?.[1];if(!value)fail(401,'unauthorized');const player=sql('SELECT id FROM players WHERE token_hash=?',hash(value));if(!player)fail(401,'unauthorized');return player.id;}
  const inflight=new Map();
  async function checkout(player,body){
    if(mode==='preview')fail(503,'payments_unconfigured');
    const product=CATALOG.find(p=>p.sku===body.sku);if(!product)fail(400,'invalid_sku');
    if(typeof body.requestId!=='string'||! /^[A-Za-z0-9_-]{1,128}$/.test(body.requestId))fail(400,'invalid_request_id');
    if(entitlementList(player).includes(product.sku))fail(409,'already_owned');
    const existingRequest=sql('SELECT * FROM orders WHERE player_id=? AND request_id=? AND mode=?',player,body.requestId,mode);
    if(existingRequest&&existingRequest.sku!==product.sku)fail(409,'request_id_conflict');
    if(existingRequest?.status==='expired')fail(409,'request_expired');
    const lock=player+':'+product.sku;
    if(inflight.has(lock))return inflight.get(lock);
    if(inflight.size>=256)fail(503,'checkout_busy');
    const promise=(async()=>{
      let order=sql("SELECT * FROM orders WHERE player_id=? AND sku=? AND mode=? AND status IN ('creating','pending')",player,product.sku,mode);
      if(order?.session_id){const session=await client.checkout.sessions.retrieve(order.session_id);if(session.status==='expired'){run("UPDATE orders SET status='expired' WHERE id=? AND status='pending'",order.id);if(existingRequest?.id===order.id)fail(409,'request_expired');order=null;}else{return {url:order.session_url,sessionId:order.session_id};}}
      if(existingRequest&& !order){if(existingRequest.status==='expired')fail(409,'request_expired');if(existingRequest.session_id)return {url:existingRequest.session_url,sessionId:existingRequest.session_id};}
      if(!order){order=transaction(()=>{let value=sql("SELECT * FROM orders WHERE player_id=? AND sku=? AND mode=? AND status IN ('creating','pending')",player,product.sku,mode);if(!value){const id=randomUUID();run("INSERT INTO orders(id,player_id,sku,mode,amount,request_id,status,created_at) VALUES(?,?,?,?,?,?,'creating',?)",id,player,product.sku,mode,product.amount,body.requestId,Date.now());value=sql('SELECT * FROM orders WHERE id=?',id);}return value;});}
      // Stripe discards idempotency keys after 24h. Never retry an unresolved old order into a new charge.
      if(!order.session_id&&Date.now()-order.created_at>23*60*60*1000)fail(409,'order_requires_reconciliation');
      // Stable identifier across retries, derived from a stored order ID instead of changing request parameters.
      const stableSuffix=Array.from(hash(order.id).slice(0,8),c=>String.fromCharCode(97+parseInt(c,16))).join('');
      const session=await client.checkout.sessions.create({mode:'payment',integration_identifier:'chief_world_'+stableSuffix,
        line_items:[{quantity:1,price_data:{currency:'jpy',unit_amount:product.amount,product_data:{name:product.name,description:product.description,metadata:{sku:product.sku}}}}],
        metadata:{orderId:order.id,sku:product.sku},payment_intent_data:{metadata:{orderId:order.id,sku:product.sku}},
        success_url:successUrl.href,cancel_url:cancelUrl.href}, {idempotencyKey:'chief-order-'+order.id});
      if(typeof session.id!=='string'||typeof session.url!=='string'||new URL(session.url).protocol!=='https:'||new URL(session.url).hostname!=='checkout.stripe.com')fail(502,'invalid_checkout_response');
      run("UPDATE orders SET session_id=?,session_url=?,payment_intent=?,status='pending' WHERE id=? AND status='creating'",session.id,session.url,idOf(session.payment_intent)||null,order.id);
      return {url:session.url,sessionId:session.id};
    })();
    inflight.set(lock,promise);try{return await promise;}finally{inflight.delete(lock);}
  }
  function validateSession(session,order){
    const items=session.line_items?.data;
    if(!order||(order.payment_intent&&order.payment_intent!==idOf(session.payment_intent))||order.session_id!==session.id||order.mode!==mode||session.mode!=='payment'||session.metadata?.orderId!==order.id||session.metadata?.sku!==order.sku||session.amount_total!==order.amount||session.currency!=='jpy'||session.livemode!==(mode==='live')||!idOf(session.payment_intent))fail(400,'invalid_payment');
    if(!items||items.length!==1||items[0].quantity!==1||items[0].amount_total!==order.amount||items[0].currency!=='jpy'||items[0].price?.unit_amount!==order.amount||items[0].price?.currency!=='jpy'||items[0].price?.product?.metadata?.sku!==order.sku)fail(400,'invalid_line_item');
  }
  async function processEvent(event){
    if(typeof event.id!=='string'||!event.data?.object)fail(400,'invalid_event');
    if(event.livemode!==(mode==='live'))fail(400,'wrong_mode');
    if(sql('SELECT id FROM events WHERE id=?',event.id))return;
    const object=event.data.object;
    let paid=null, revoke=null, closed=null;
    if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type)){
      const order=sql('SELECT * FROM orders WHERE session_id=?',object.id);
      if(!order||object.metadata?.orderId!==order.id||object.metadata?.sku!==order.sku||object.amount_total!==order.amount||object.currency!=='jpy'||object.livemode!==(mode==='live'))fail(400,'invalid_payment');
      if(['checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type))closed=order.id;
      else if(object.payment_status==='paid'){
        const session=await client.checkout.sessions.retrieve(object.id,{expand:['line_items.data.price.product']});
        validateSession(session,order);
        if(session.payment_status!=='paid')fail(400,'payment_not_paid');
        paid={order,session};
      }
    }else if(event.type==='charge.refunded'){
      if(object.livemode!==(mode==='live'))fail(400,'wrong_mode');
      if(Number.isInteger(object.amount)&&object.amount>0&&object.amount_refunded>=object.amount)revoke={pi:idOf(object.payment_intent),reason:'full_refund'};
    }else if(event.type==='refund.updated'&&object.status==='succeeded'){
      const charge=await client.charges.retrieve(idOf(object.charge));
      if(!charge||charge.livemode!==(mode==='live'))fail(400,'invalid_refund');
      if(charge.amount>0&&charge.amount_refunded>=charge.amount)revoke={pi:idOf(charge.payment_intent),reason:'full_refund'};
    }else if(event.type==='charge.dispute.created'){
      if(object.livemode!==(mode==='live'))fail(400,'wrong_mode');
      revoke={pi:idOf(object.payment_intent),reason:'dispute'};
    }
    if(revoke&&!revoke.pi)fail(400,'invalid_payment_intent');
    transaction(()=>{
      if(sql('SELECT id FROM events WHERE id=?',event.id))return;
      if(closed)run("UPDATE orders SET status='expired' WHERE id=? AND status='pending'",closed);
      if(revoke){run('INSERT OR IGNORE INTO revocations VALUES(?,?,?,?)',revoke.pi,mode,revoke.reason,Date.now());run("UPDATE orders SET status='revoked' WHERE payment_intent=? AND mode=?",revoke.pi,mode);}
      if(paid){const pi=idOf(paid.session.payment_intent);const revoked=sql('SELECT payment_intent FROM revocations WHERE payment_intent=? AND mode=?',pi,mode);run("UPDATE orders SET payment_intent=?,status=CASE WHEN status='revoked' OR ? THEN 'revoked' ELSE 'paid' END WHERE id=?",pi,revoked?1:0,paid.order.id);}
      run('INSERT INTO events VALUES(?,?,?)',event.id,event.type,Date.now());
    });
  }
  async function rawBody(req){if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))fail(415,'json_required');let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>65536)fail(413,'body_too_large');chunks.push(chunk);}return Buffer.concat(chunks);}
  const server=createServer(async(req,res)=>{
    function send(status,value){res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
    res.setHeader('cache-control','no-store');res.setHeader('x-content-type-options','nosniff');
    try{
      const origin=req.headers.origin;if(origin&&!origins.has(origin))fail(403,'origin_forbidden');
      if(origin){res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');res.setHeader('access-control-allow-methods','GET, POST, OPTIONS');res.setHeader('access-control-allow-headers','Authorization, Content-Type');}
      if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
      const route=new URL(req.url,'http://localhost').pathname;
      if(req.method==='GET'&&route==='/api/health'){send(200,{status:'ok',mode});return;}
      if(req.method==='GET'&&route==='/api/catalog'){send(200,{mode,products:CATALOG});return;}
      if(req.method==='GET'&&route==='/api/entitlements'){const player=authenticate(req);limit('read:'+player,120);send(200,{entitlements:entitlementList(player),mode});return;}
      if(req.method!=='POST'||!['/api/player','/api/restore','/api/checkout','/api/webhook'].includes(route))fail(404,'not_found');
      if(route==='/api/webhook'){
        if(mode==='preview'||!client)fail(503,'payments_unconfigured');
        const raw=await rawBody(req);let event;
        try{event=client.webhooks.constructEvent(raw,req.headers['stripe-signature'],env.STRIPE_WEBHOOK_SECRET);}catch{fail(400,'invalid_signature');}
        await processEvent(event);send(200,{received:true});return;
      }
      limit(route+':'+req.socket.remoteAddress,route==='/api/restore'?20:60);
      const player=route==='/api/checkout'?authenticate(req):null;
      const raw=await rawBody(req);let body;try{body=JSON.parse(raw.toString());}catch{fail(400,'invalid_json');}if(!body||typeof body!=='object'||Array.isArray(body))fail(400,'invalid_json');
      if(route==='/api/player'){const token=randomBytes(32).toString('base64url');const playerId=randomUUID();run('INSERT INTO players VALUES(?,?,?)',playerId,hash(token),Date.now());send(201,{token,recoveryCode:token,playerId});return;}
      if(route==='/api/restore'){const token=body.recoveryCode;const restored=typeof token==='string'&& /^[A-Za-z0-9_-]{43}$/.test(token)?sql('SELECT id FROM players WHERE token_hash=?',hash(token)):null;if(!restored)fail(404,'account_not_found');send(200,{token,playerId:restored.id,entitlements:entitlementList(restored.id),mode});return;}
      limit('buy:'+player,30);send(200,await checkout(player,body));
    }catch(error){send(error instanceof ApiError?error.status:503,{error:error instanceof ApiError?error.code:'service_unavailable'});}
  });
  server.requestTimeout=20000;server.headersTimeout=15000;
  return {server,close(){db.close();}};
}
