// Deterministic lifecycle/scheduling checks; no substitute for device listening.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const intervals = new Map(), sources = new Set(), events = {};
let timerId = 0, instance, scheduled = 0;
const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {} });
const node = () => ({ connect() {}, disconnect() {} });
class AudioContext {
  constructor() { instance = this; this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 44100; this.destination = node(); }
  createGain() { return { ...node(), gain: param() }; }
  createDynamicsCompressor() { return { ...node(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; }
  createConvolver() { return node(); }
  createBiquadFilter() { return { ...node(), frequency: param() }; }
  createBuffer(channels, length) { const data = Array.from({ length: channels }, () => new Float32Array(length)); return { getChannelData: n => data[n] }; }
  createBufferSource() { return this.source(); }
  createOscillator() { return { ...this.source(), frequency: param() }; }
  source() {
    const source = { ...node(), start(t) { assert(t >= instance.currentTime - 0.001); scheduled++; sources.add(source); }, stop(t) { if (t === undefined) { sources.delete(source); source.onended?.(); } else source.endTime = t; } };
    return source;
  }
  async resume() { this.state = 'running'; this.onstatechange?.(); }
  async suspend() { this.state = 'suspended'; this.onstatechange?.(); }
}
const document = { hidden: false, addEventListener(name, fn) { events[name] = fn; } };
const window = { AudioContext, document, setInterval(fn) { const id = ++timerId; intervals.set(id, fn); return id; }, clearInterval(id) { intervals.delete(id); } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'audio.js'), 'utf8'), { window, globalThis: window });
const audio = window.GuildAudio;
(async () => {
  assert.equal(audio.isMuted, true);
  assert.equal(audio.sfx('coin'), false);
  const results = await Promise.all([audio.enable(), audio.enable()]);
  assert(results.every(Boolean)); assert.equal(intervals.size, 1);
  assert.equal(audio.isMuted, false);
  assert.equal(audio.sfx('step'), true); assert.equal(audio.sfx('step'), false);
  assert.equal(audio.sfx('coin'), true); assert.equal(audio.sfx('coin'), false);
  assert.equal(audio.setMood('fever'), true); assert.equal(audio.setMood('unsupported'), false);
  for (let i = 0; i < 4500; i++) {
    instance.currentTime += 0.04;
    for (const source of [...sources]) if (source.endTime <= instance.currentTime) { sources.delete(source); source.onended?.(); }
    for (const tick of intervals.values()) tick();
  }
  assert(scheduled > 1500, 'full original score and additional loop scheduled');
  assert(sources.size < 40, 'voice count stays bounded over a full score');
  instance.currentTime += 180; for (const tick of intervals.values()) tick();
  assert(sources.size < 70, 'stall does not enqueue missed music');
  await audio.pause(); assert.equal(intervals.size, 0); assert.equal(sources.size, 0);
  await Promise.all([audio.resume(), audio.resume()]); assert.equal(intervals.size, 1);
  document.hidden = true; events.visibilitychange(); await Promise.resolve();
  assert.equal(intervals.size, 0); assert.equal(sources.size, 0);
  document.hidden = false; events.visibilitychange(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(intervals.size, 1);
  for (const name of ['confirm','cancel','upgrade','fever','error']) assert.equal(audio.sfx(name), true);
  assert.equal(await audio.toggle(), true); assert.equal(intervals.size, 0); assert.equal(sources.size, 0);
  assert.equal(await audio.toggle(), false); assert.equal(intervals.size, 1);
  await audio.pause();
  console.log(`PASS: 32-bar score, ${scheduled} scheduled voices, bounded polyphony, throttle, stall recovery, concurrent resume, visibility, mute`);
})().catch(error => { console.error(error); process.exitCode = 1; });
