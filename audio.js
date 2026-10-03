/* GUILD∞ original score: "Lanterns of the First Guild".
 * No samples, copied melodies or external dependencies. Call enable() in a gesture.
 */
(() => {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const SCORE = [
    [76,0,72,74,76,79,76,72], [74,72,69,0,72,71,69,67],
    [69,72,77,76,74,72,69,0], [67,69,72,0,76,74,72,69],
    [67,72,76,79,81,79,76,0], [74,76,79,0,76,74,72,71],
    [71,74,79,78,76,74,71,0], [69,71,74,0,72,71,67,0],
    [69,74,77,76,74,72,69,0], [72,74,77,81,79,77,76,74],
    [76,79,81,83,81,79,76,0], [74,72,71,69,67,69,72,0],
    [77,0,76,72,74,77,81,79], [76,74,72,69,72,74,76,0],
    [71,76,80,83,81,80,76,74], [72,71,68,71,76,0,0,0],
    [81,79,76,0,72,74,76,79], [83,81,79,76,74,72,69,0],
    [81,0,77,79,81,84,81,77], [79,77,76,74,72,0,74,76],
    [79,76,72,0,76,79,84,83], [81,79,76,74,76,0,72,74],
    [83,81,79,0,78,79,83,86], [84,83,81,79,76,74,71,0],
    [77,81,86,84,81,79,77,74], [76,77,81,84,83,81,79,77],
    [76,79,81,84,83,81,79,76], [74,76,79,81,79,76,74,72],
    [77,81,84,83,81,77,76,74], [72,76,81,79,76,72,71,69],
    [71,76,80,83,86,83,80,76], [74,71,68,71,72,0,69,0]
  ];
  const CHORDS = [
    [45,57,60,64], [45,57,60,64], [41,57,60,65], [41,57,60,65],
    [48,55,60,64], [48,55,60,64], [43,55,59,62], [43,55,59,62],
    [38,57,62,65], [38,57,62,65], [45,57,60,64], [45,57,60,64],
    [41,57,60,65], [41,57,60,65], [40,56,59,64], [40,56,59,64]
  ];
  let ctx, master, musicBus, effectBus, noise;
  let muted = true, paused = false, enabled = false, mood = 'day', requestedMood = 'day';
  let timer = null, nextTime = 0, step = 0, enabling = null, epoch = 0, suspending = Promise.resolve();
  const sources = new Set(), lastEffects = new Map();
  const hidden = () => !!root.document?.hidden;
  const ready = () => !!ctx && ctx.state === 'running' && enabled && !muted && !paused && !hidden();
  const hz = midi => 440 * Math.pow(2, (midi - 69) / 12);

  function track(source, nodes) {
    sources.add(source);
    source.onended = () => {
      sources.delete(source);
      for (const node of nodes) { try { node.disconnect(); } catch (_) {} }
    };
  }
  function voice(midi, time, duration, volume, type = 'triangle', bus = musicBus) {
    if (!ctx || midi === 0) return;
    const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(hz(midi), time);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.linearRampToValueAtTime(volume, time + Math.min(0.025, duration / 5));
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.58), time + duration * 0.55);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    track(oscillator, [oscillator, envelope]);
    oscillator.start(time); oscillator.stop(time + duration + 0.015);
  }
  function drum(time, kick, volume) {
    if (kick) {
      const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
      oscillator.frequency.setValueAtTime(105, time);
      oscillator.frequency.exponentialRampToValueAtTime(43, time + 0.1);
      envelope.gain.setValueAtTime(volume, time);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
      oscillator.connect(envelope); envelope.connect(musicBus);
      track(oscillator, [oscillator, envelope]);
      oscillator.start(time); oscillator.stop(time + 0.15);
    } else {
      const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
      source.buffer = noise; filter.type = 'highpass'; filter.frequency.value = 4600;
      envelope.gain.setValueAtTime(volume, time);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      source.connect(filter); filter.connect(envelope); envelope.connect(musicBus);
      track(source, [source, filter, envelope]);
      source.start(time); source.stop(time + 0.065);
    }
  }
  function makeGraph() {
    const AudioContext = root.AudioContext || root.webkitAudioContext;
    if (!AudioContext) return false;
    ctx = new AudioContext({ latencyHint: 'interactive' });
    master = ctx.createGain(); musicBus = ctx.createGain(); effectBus = ctx.createGain();
    master.gain.value = 0.48; musicBus.gain.value = 0.7; effectBus.gain.value = 0.85;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12; limiter.knee.value = 12; limiter.ratio.value = 8;
    limiter.attack.value = 0.004; limiter.release.value = 0.16;
    musicBus.connect(master); effectBus.connect(master); master.connect(limiter); limiter.connect(ctx.destination);
    // A quiet stereo room reflection; dry transients remain crisp on phone speakers.
    const room = ctx.createConvolver(), wet = ctx.createGain(); wet.gain.value = 0.12;
    const length = Math.floor(ctx.sampleRate * 0.55), impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    let seed = 7747;
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        data[i] = ((seed / 4294967296) * 2 - 1) * Math.pow(1 - i / length, 3) * 0.22;
      }
    }
    room.buffer = impulse; musicBus.connect(room); room.connect(wet); wet.connect(master);
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = (seed / 4294967296) * 2 - 1;
    }
    ctx.onstatechange = () => {
      if (ctx.state === 'running') { if (ready()) start(); }
      else stop();
    };
    return true;
  }
  function schedule(time, index) {
    const slot = index % 8, bar = Math.floor(index / 8) % 32;
    if (slot === 0) mood = requestedMood;
    const eighth = 30 / (mood === 'fever' ? 122 : mood === 'night' ? 78 : 94);
    const chord = CHORDS[bar % 16], note = SCORE[bar][slot];
    const quiet = mood === 'night', bright = mood === 'fever';
    voice(note, time, eighth * (note && slot === 0 ? 1.65 : 0.85), quiet ? 0.031 : 0.049, quiet ? 'sine' : 'triangle');
    // Breath between phrases, then a high answering voice in the second half.
    if (bar >= 16 && slot === 6 && note) voice(note - 12, time + eighth * 0.08, eighth * 1.6, 0.012, 'sine');
    if (slot % 2 === 0) voice(chord[0] + (slot === 4 ? 12 : 0), time, eighth * 1.7, 0.047, 'triangle');
    const arpeggio = [1,2,3,2,1,3,2,3][slot];
    voice(chord[arpeggio] + 12, time, eighth * 0.75, quiet ? 0.009 : 0.019, 'sine');
    if (slot === 0) for (let i = 1; i < chord.length; i++) voice(chord[i], time, eighth * 7.7, 0.007, 'sine');
    if (!quiet) {
      if (slot === 0 || slot === 4 || (bright && slot === 6)) drum(time, true, bright ? 0.045 : 0.027);
      if (slot === 2 || slot === 6) drum(time, false, bright ? 0.017 : 0.009);
      if (bright && slot % 2) voice(chord[(slot % 3) + 1] + 24, time, eighth * 0.45, 0.012, 'square');
    }
    return eighth;
  }
  function tick() {
    if (!ready()) return;
    // Do not enqueue all missed notes when a tab or the OS stalls its timers.
    if (nextTime < ctx.currentTime - 0.1) nextTime = ctx.currentTime + 0.025;
    while (nextTime < ctx.currentTime + 0.17) {
      nextTime += schedule(nextTime, step++);
      step %= SCORE.length * 8;
    }
  }
  function start() {
    if (timer !== null || !ready()) return;
    nextTime = ctx.currentTime + 0.035;
    tick(); timer = root.setInterval(tick, 25);
  }
  function stop() {
    if (timer !== null) { root.clearInterval(timer); timer = null; }
    for (const source of [...sources]) { try { source.stop(); } catch (_) {} }
    sources.clear();
  }
  async function enable() {
    if (enabling?.epoch === epoch) return enabling.promise;
    const version = epoch;
    const promise = (async () => {
      try {
        if (!ctx && !makeGraph()) return false;
        await suspending;
        // Must originate in a pointer/key gesture for Safari's first activation.
        if (ctx.state !== 'running') await ctx.resume();
        if (version !== epoch) return false;
        enabled = true; muted = false;
        master.gain.setTargetAtTime(0.48, ctx.currentTime, 0.015);
        if (ready()) start();
        return ctx.state === 'running';
      } catch (_) { if (version === epoch) muted = true; return false; }
    })();
    enabling = { epoch: version, promise };
    try { return await promise; } finally { if (enabling?.promise === promise) enabling = null; }
  }
  async function toggle() {
    if (!enabled || muted) { await enable(); return muted; }
    epoch++; muted = true; stop();
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
    return true;
  }
  function sfx(name) {
    if (!ready()) return false;
    const now = ctx.currentTime, throttle = name === 'step' ? 0.105 : name === 'coin' ? 0.24 : 0.04;
    if (now - (lastEffects.get(name) ?? -Infinity) < throttle) return false;
    lastEffects.set(name, now);
    const sequence = (notes, duration, volume, type = 'triangle', spacing = 0.065) => {
      notes.forEach((note, i) => voice(note, now + i * spacing, duration, volume, type, effectBus));
    };
    switch (name) {
      case 'step': voice(38 + (step % 2) * 3, now, 0.043, 0.022, 'triangle', effectBus); break;
      case 'confirm': sequence([76,83], 0.09, 0.07); break;
      case 'cancel': sequence([69,62], 0.085, 0.05, 'sine'); break;
      case 'coin': sequence([88,95], 0.105, 0.04, 'sine', 0.045); break;
      case 'upgrade': sequence([69,72,76,79,84], 0.24, 0.069, 'triangle', 0.085); break;
      case 'fever': sequence([57,64,69,76,81,88], 0.21, 0.064, 'triangle', 0.07); break;
      case 'error': sequence([51,50], 0.12, 0.047, 'triangle', 0.095); break;
      default: return false;
    }
    return true;
  }
  function setMood(value) {
    if (!['day', 'night', 'fever'].includes(value)) return false;
    requestedMood = value; return true;
  }
  function pause() {
    epoch++; paused = true; stop();
    if (ctx?.state === 'running') suspending = ctx.suspend().catch(() => {});
    return suspending;
  }
  async function resume() {
    paused = false;
    if (!enabled || muted || hidden()) return false;
    return enable();
  }
  root.document?.addEventListener('visibilitychange', () => {
    if (hidden()) {
      epoch++; stop();
      if (ctx?.state === 'running') suspending = ctx.suspend().catch(() => {});
    } else if (enabled && !muted && !paused) enable();
  });
  root.GuildAudio = Object.freeze({
    enable, toggle, setMood, sfx, pause, resume,
    get isMuted() { return muted; },
    get mood() { return requestedMood; }
  });
})();
