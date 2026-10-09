/* Original procedural score and character phonemes. No third-party recordings. */
(()=>{'use strict';
const scores={
 morning:{title:'朝礼は踊ってから',bpm:104,root:57,scale:[0,2,4,7,9],lead:'triangle',bass:'triangle',melody:[0,null,2,4,3,null,2,1,0,2,4,null,3,1,null,null]},
 work:{title:'働いたら負けではない',bpm:118,root:53,scale:[0,2,4,5,7,9],lead:'square',bass:'triangle',melody:[0,2,null,4,2,1,0,null,3,4,5,null,4,2,1,null]},
 ramble:{title:'迷子も業務のうち',bpm:92,root:60,scale:[0,2,5,7,9],lead:'sine',bass:'triangle',melody:[0,null,3,null,2,1,null,0,4,null,3,2,null,1,2,null]},
 night:{title:'夜勤は聞いてない',bpm:76,root:45,scale:[0,2,3,7,10],lead:'triangle',bass:'sine',melody:[4,null,null,2,3,null,1,null,0,null,2,null,1,null,null,null]},
 siege:{title:'労基より先にゾンビ',bpm:138,root:50,scale:[0,2,3,5,7,10],lead:'square',bass:'triangle',melody:[0,0,3,null,2,2,4,3,0,2,5,4,3,2,1,null]},
 parade:{title:'村長だけがノリノリ',bpm:132,root:60,scale:[0,2,4,7,9],lead:'square',bass:'triangle',melody:[0,2,4,4,3,null,2,3,4,2,3,1,0,2,0,null]}
};
if(document.body.dataset.world)Object.assign(scores,{
 forest:{title:'迷いの森にも出張手当',bpm:96,root:55,scale:[0,2,5,7,9],lead:'triangle',bass:'sine',melody:[0,3,null,2,4,null,1,0,2,null,4,3,null,1,2,null]},
 canyon:{title:'石頭たちの労働歌',bpm:108,root:48,scale:[0,3,5,7,10],lead:'square',bass:'triangle',melody:[0,null,0,2,3,2,null,1,0,0,4,null,3,2,1,null]},
 marsh:{title:'沼の会議は終わらない',bpm:82,root:58,scale:[0,2,3,7,9],lead:'sine',bass:'sine',melody:[4,null,1,null,0,2,null,3,1,null,4,2,null,0,null,1]},
 volcano:{title:'判子を押すまで噴火禁止',bpm:128,root:46,scale:[0,2,3,5,7],lead:'square',bass:'triangle',melody:[0,0,2,3,0,4,3,null,0,2,3,4,3,2,1,null]},
 port:{title:'船酔い村長の旅支度',bpm:112,root:60,scale:[0,2,4,7,9],lead:'triangle',bass:'triangle',melody:[0,2,3,null,4,3,2,0,1,3,4,null,3,2,0,null]}
});
if(document.body.dataset.world)Object.assign(scores,{
 rain:{title:'屋根より先に雨が来る',bpm:90,root:56,scale:[0,2,5,7,9],lead:'sine',bass:'triangle',melody:[0,null,2,3,null,2,1,null,4,3,null,2,1,null,0,null]},
 dunes:{title:'砂も出勤している',bpm:106,root:50,scale:[0,1,4,5,7,8],lead:'triangle',bass:'triangle',melody:[0,1,3,null,4,3,2,null,1,2,4,3,2,null,1,0]},
 frost:{title:'雪だるまの雇用契約',bpm:84,root:62,scale:[0,2,4,7,9],lead:'sine',bass:'sine',melody:[4,null,2,0,null,1,2,null,3,null,4,2,1,null,0,null]},
 bamboo:{title:'竹だけ昇進が早い',bpm:121,root:57,scale:[0,3,5,7,10],lead:'triangle',bass:'triangle',melody:[0,3,null,2,0,1,2,null,4,2,1,0,2,3,1,null]},
 springs:{title:'湯あたりも公務',bpm:78,root:53,scale:[0,2,4,7,9],lead:'sine',bass:'triangle',melody:[0,null,2,null,3,4,null,2,1,null,0,null,2,1,0,null]},
 finale:{title:'荷ほどきするとは言ってない',bpm:126,root:60,scale:[0,2,4,5,7,9],lead:'triangle',bass:'triangle',melody:[0,2,4,null,5,4,3,2,0,1,3,5,4,2,1,0]}
});
let ac,bus,music,fx,timer,scene='morning',step=0,next=0,active=0,enabled=false,lastVoice=-9;const gates={};
function init(){if(ac)return true;const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;ac=new C();bus=ac.createGain();music=ac.createGain();fx=ac.createGain();const c=ac.createDynamicsCompressor();c.threshold.value=-18;c.ratio.value=4;bus.gain.value=.48;music.gain.value=.7;fx.gain.value=.7;music.connect(bus);fx.connect(bus);bus.connect(c);c.connect(ac.destination);return true}
function note(midi,t,d,vol,type='triangle',target=music,cut=2200){if(!ac||active>=36)return;active++;const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type=type;o.frequency.value=440*Math.pow(2,(midi-69)/12);f.type='lowpass';f.frequency.value=cut;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(f);f.connect(g);g.connect(target);o.onended=()=>{active--;o.disconnect();f.disconnect();g.disconnect()};o.start(t);o.stop(t+d+.025)}
function drum(t,deep=false){note(deep?36:82,t,deep?.10:.026,deep?.03:.006,deep?'sine':'triangle',music,deep?400:1800)}
function schedule(){if(!enabled||!ac||ac.state!=='running')return;if(next<ac.currentTime-.1)next=ac.currentTime+.03;const s=scores[scene],eighth=30/s.bpm;while(next<ac.currentTime+.18){const phrase=Math.floor(step/32)%4,i=step%32,bar=Math.floor(i/8),slot=i%8,degree=[0,3,4,2][bar]%s.scale.length,base=s.root+s.scale[degree]-12;
 if(slot===0||slot===4)note(base+(slot===4?7:0),next,eighth*1.4,.032,s.bass,music,800);
 const n=s.melody[i%16];if(n!==null&&!(phrase===2&&slot===7)){const oct=scene==='night'?12:phrase===3?12:24;note(s.root+s.scale[(n+(i>=16?1:0)+(phrase===1?2:0))%s.scale.length]+oct,next,eighth*(scene==='night'?1.5:.8),scene==='siege'?.022:.024,s.lead,music,s.lead==='square'?1400:2600)}
 if(slot%2===0&&scene!=='night')note(s.root+s.scale[(slot/2+bar)%s.scale.length]+12,next,eighth*.7,.009,'triangle');
 if(scene==='work'||scene==='parade'||scene==='siege'){if(slot%4===0)drum(next,true);if(slot%2===1)drum(next)}else if(scene==='morning'&&slot===6)drum(next);
 if(scene==='night'&&slot===0)note(s.root+s.scale[degree]+12,next,eighth*6,.014,'sine');next+=eighth;step++}}
async function enable(){if(!init())return false;try{await ac.resume();enabled=true;if(!timer){next=ac.currentTime+.04;timer=setInterval(schedule,40)}return true}catch{return false}}
function setScene(id){if(!scores[id]||scene===id)return;scene=id;step=0;if(ac){next=ac.currentTime+.04;music.gain.cancelScheduledValues(ac.currentTime);music.gain.setTargetAtTime(.15,ac.currentTime,.08);music.gain.setTargetAtTime(.7,ac.currentTime+.22,.18)}}
function sfx(name){if(!enabled||!ac||ac.state!=='running')return;const t=ac.currentTime;if(t-(gates[name]||-1)<(name==='hit'?.13:.07))return;gates[name]=t;const n=(m,d=.1,v=.055,delay=0,type='triangle')=>note(m,t+delay,d,v,type,fx,2000);
 if(name==='chop'){n(44,.055,.05);n(32,.09,.025,.02)}else if(name==='mine'){n(85,.04,.023);n(62,.12,.025,.025)}else if(name==='hit'){n(36,.07,.045);n(48,.04,.018)}else if(name==='pickup'){n(79,.08,.018);n(86,.08,.018,.04)}else if(name==='warning'){n(43,.18,.035);n(42,.18,.03,.18)}else if(name==='cancel'){n(62,.09,.023)}else{const seq=name==='dawn'?[60,64,67,72]:name==='rare'?[72,79,84,91]:name==='build'?[48,55,60,67]:[67,72,79];seq.forEach((m,i)=>n(m,.16,.035,i*.07))}}
function voice(index=0,excited=false){if(document.body.dataset.world&&window.VillageAudio)return VillageAudio.murmur('trait-'+index,excited?'joy':'talk');if(!enabled||!ac||ac.state!=='running'||ac.currentTime-lastVoice<1.3)return;lastVoice=ac.currentTime;const roots=[61,48,73,55,68,43],r=roots[index%6],syllables=excited?4:2;for(let i=0;i<syllables;i++){const t=ac.currentTime+i*.095;note(r+(i%2?3:-2),t,.075,.027,index%2?'triangle':'sawtooth',fx,650+index*150);note(r+12,t,.045,.008,'sine',fx,1500)}}
document.addEventListener('pointerdown',enable,{passive:true});document.addEventListener('keydown',enable,{passive:true});document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend().catch(()=>{});else if(enabled)ac.resume().catch(()=>{})});
window.FrontierAudio=Object.freeze({enable,setMood:()=>{},setScene,sfx,voice,report:()=>({scene,title:scores[scene].title,enabled,context:ac?.state||'locked',active,tracks:Object.keys(scores).length}),...(document.body.dataset.world?{engine:()=>({context:ac,output:fx,music})}:{}),get isMuted(){return !enabled}});
})();
