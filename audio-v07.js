/* GUILD∞ v0.7 original long-session score: Lantern Hollow Nocturne */
(()=>{'use strict';
const root=window;let ctx=null,master=null,music=null,fx=null,timer=null,next=0,step=0,enabled=false,muted=true,paused=false,mood='day',targetMood='day',epoch=0;
const hz=m=>440*Math.pow(2,(m-69)/12);
const melody=[69,72,74,76,74,72,69,67,69,72,76,79,76,74,72,0,67,69,72,74,72,69,67,64,69,74,77,76,74,72,69,0];
const drones=[[45,52,57],[41,48,53],[48,55,60],[43,50,55],[38,45,50],[45,52,57],[41,48,53],[43,50,55]];
function graph(){if(ctx)return true;const A=root.AudioContext||root.webkitAudioContext;if(!A)return false;ctx=new A({latencyHint:'interactive'});master=ctx.createGain();music=ctx.createGain();fx=ctx.createGain();master.gain.value=.0001;music.gain.value=.74;fx.gain.value=.82;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=10;limiter.ratio.value=5;limiter.attack.value=.006;limiter.release.value=.18;music.connect(master);fx.connect(master);master.connect(limiter);limiter.connect(ctx.destination);return true}
function voice(m,t,d,v,type='triangle',bus=music,attack=.018){if(!m||!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz(m),t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+attack);g.gain.exponentialRampToValueAtTime(Math.max(.0001,v*.42),t+d*.58);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(bus);o.start(t);o.stop(t+d+.03)}
function pluck(m,t,v=.024){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='triangle';o.frequency.value=hz(m);f.type='lowpass';f.frequency.value=1400;f.Q.value=.6;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.19);o.connect(f);f.connect(g);g.connect(music);o.start(t);o.stop(t+.21)}
function scheduleBeat(t,i){const slot=i%8,bar=Math.floor(i/8),night=mood==='night',hot=mood==='fever',beat=30/(hot?112:night?74:82),note=melody[i%melody.length],ch=drones[bar%drones.length];if(slot===0)mood=targetMood;
  if(note)voice(note,t,beat*(slot===0?1.35:.78),night?.021:.034,night?'sine':'triangle',music,.026);
  if(slot%2===0)pluck(ch[1]+12,t,night?.010:.017);
  if(slot===0||slot===4){voice(ch[0],t,beat*3.7,night?.024:.034,'sine');voice(ch[2],t,beat*3.2,night?.008:.012,'sine')}
  if(hot&&slot%2===1)pluck(ch[2]+24,t,.013);
  return beat}
function tick(){if(!ctx||muted||paused||ctx.state!=='running'||document.hidden)return;if(next<ctx.currentTime-.1)next=ctx.currentTime+.03;while(next<ctx.currentTime+.18){next+=scheduleBeat(next,step++);step%=256}}
function start(){if(timer!==null)return;next=ctx.currentTime+.05;tick();timer=setInterval(tick,25)}function stop(){if(timer!==null){clearInterval(timer);timer=null}}
async function enable(){const v=++epoch;if(!graph())return false;try{if(ctx.state!=='running')await ctx.resume();if(v!==epoch)return false;enabled=true;muted=false;paused=false;master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(Math.max(.0001,master.gain.value),ctx.currentTime);master.gain.exponentialRampToValueAtTime(.38,ctx.currentTime+1.6);start();return true}catch(_){return false}}
async function toggle(){if(!enabled||muted)return enable();muted=true;epoch++;if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.0001,ctx.currentTime,.12)}setTimeout(stop,650);return true}
function sfx(name){if(!ctx||muted||ctx.state!=='running')return false;const t=ctx.currentTime,seq={step:[48],confirm:[76,83],cancel:[69,62],coin:[88,95],upgrade:[69,72,76,79,84],fever:[57,64,69,76,81,88]}[name];if(!seq)return false;seq.forEach((m,i)=>voice(m,t+i*.055,name==='upgrade'||name==='fever'?.18:.075,name==='step'?.012:.045,name==='cancel'?'sine':'triangle',fx,.008));return true}
function setMood(v){if(!['day','night','fever'].includes(v))return false;targetMood=v;return true}
function pause(){paused=true;epoch++;stop();if(ctx?.state==='running')return ctx.suspend().catch(()=>{});return Promise.resolve()}
async function resume(){paused=false;if(!enabled||muted||document.hidden)return false;try{if(ctx.state!=='running')await ctx.resume();master.gain.setTargetAtTime(.38,ctx.currentTime,.09);start();return true}catch(_){return false}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume()});
root.GuildAudio=Object.freeze({enable,toggle,setMood,sfx,pause,resume,get isMuted(){return muted},get mood(){return targetMood},version:'v07-lantern-hollow'});
})();
