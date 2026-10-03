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
    envelope.gain.linearRampToValueAtTime(volume, time + Math.min(0.03, duration / 5));
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.54), time + duration * 0.58);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    track(oscillator, [oscillator, envelope]);
    oscillator.start(time); oscillator.stop(time + duration + 0.02);
  }
  function drum(time, kick, volume) {
    if (kick) {
      const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
      oscillator.frequency.setValueAtTime(96, time);
      oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.11);
      envelope.gain.setValueAtTime(volume, time);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
      oscillator.connect(envelope); envelope.connect(musicBus);
      track(oscillator, [oscillator, envelope]);
      oscillator.start(time); oscillator.stop(time + 0.16);
    } else {
      const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
      source.buffer = noise; filter.type = 'highpass'; filter.frequency.value = 5000;
      envelope.gain.setValueAtTime(volume, time);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.048);
      source.connect(filter); filter.connect(envelope); envelope.connect(musicBus);
      track(source, [source, filter, envelope]);
      source.start(time); source.stop(time + 0.06);
    }
  }
  function makeGraph() {
    const AudioContext = root.AudioContext || root.webkitAudioContext;
    if (!AudioContext) return false;
    ctx = new AudioContext({ latencyHint: 'interactive' });
    master = ctx.createGain(); musicBus = ctx.createGain(); effectBus = ctx.createGain();
    // v0.6: quieter long-session mix for iPhone speakers. Music stays behind the town.
    master.gain.value = 0.42; musicBus.gain.value = 0.58; effectBus.gain.value = 0.72;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14; limiter.knee.value = 14; limiter.ratio.value = 7;
    limiter.attack.value = 0.006; limiter.release.value = 0.2;
    musicBus.connect(master); effectBus.connect(master); master.connect(limiter); limiter.connect(ctx.destination);
    // Small room only. Avoid the washed-out "cheap mobile RPG" reverb tail.
    const room = ctx.createConvolver(), wet = ctx.createGain(); wet.gain.value = 0.085;
    const length = Math.floor(ctx.sampleRate * 0.48), impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    let seed = 7747;
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        data[i] = ((seed / 4294967296) * 2 - 1) * Math.pow(1 - i / length, 3.4) * 0.18;
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
    const eighth = 30 / (mood === 'fever' ? 118 : mood === 'night' ? 76 : 90);
    const chord = CHORDS[bar % 16], note = SCORE[bar][slot];
    const quiet = mood === 'night', bright = mood === 'fever';
    // Melody is intentionally restrained. It should feel like a place, not a ringtone.
    voice(note, time, eighth * (note && slot === 0 ? 1.7 : 0.88), quiet ? 0.022 : bright ? 0.039 : 0.034, quiet ? 'sine' : 'triangle');
    if (bar >= 16 && slot === 6 && note) voice(note - 12, time + eighth * 0.08, eighth * 1.65, 0.008, 'sine');
    if (slot % 2 === 0) voice(chord[0] + (slot === 4 ? 12 : 0), time, eighth * 1.75, quiet ? 0.025 : 0.032, 'triangle');
    const arpeggio = [1,2,3,2,1,3,2,3][slot];
    voice(chord[arpeggio] + 12, time, eighth * 0.8, quiet ? 0.006 : 0.012, 'sine');
    if (slot === 0) for (let i = 1; i < chord.length; i++) voice(chord[i], time, eighth * 7.7, quiet ? 0.0035 : 0.005, 'sine');
    if (!quiet) {
      if (slot === 0 || slot === 4 || (bright && slot === 6)) drum(time, true, bright ? 0.029 : 0.018);
      if (slot === 2 || slot === 6) drum(time, false, bright ? 0.011 : 0.006);
      if (bright && slot % 2) voice(chord[(slot % 3) + 1] + 24, time, eighth * 0.45, 0.007, 'square');
    }
    return eighth;
  }
  function tick() {
    if (!ready()) return;
    if (nextTime < ctx.currentTime - 0.1) nextTime = ctx.currentTime + 0.025;
    while (nextTime < ctx.currentTime + 0.17) {
      nextTime += schedule(nextTime, step++);
      step %= SCORE.length * 8;
    }
  }
  function start() {
    if (timer !== null || !ready()) return;
    nextTime = ctx.currentTime + 0.04;
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
        if (ctx.state !== 'running') await ctx.resume();
        if (version !== epoch) return false;
        enabled = true; muted = false;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
        master.gain.setTargetAtTime(0.42, ctx.currentTime, 0.06);
        if (ready()) start();
        return ctx.state === 'running';
      } catch (_) { if (version === epoch) muted = true; return false; }
    })();
    enabling = { epoch: version, promise };
    try { return await promise; } finally { if (enabling?.promise === promise) enabling = null; }
  }
  async function toggle() {
    if (!enabled || muted) { await enable(); return muted; }
    epoch++; muted = true;
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.055);
    }
    // Give the short fade a moment before killing scheduled voices.
    root.setTimeout(stop, 90);
    return true;
  }
  function sfx(name) {
    if (!ready()) return false;
    const now = ctx.currentTime, throttle = name === 'step' ? 0.12 : name === 'coin' ? 0.25 : 0.05;
    if (now - (lastEffects.get(name) ?? -Infinity) < throttle) return false;
    lastEffects.set(name, now);
    const sequence = (notes, duration, volume, type = 'triangle', spacing = 0.065) => {
      notes.forEach((note, i) => voice(note, now + i * spacing, duration, volume, type, effectBus));
    };
    switch (name) {
      case 'step': voice(38 + (step % 2) * 3, now, 0.04, 0.013, 'triangle', effectBus); break;
      case 'confirm': sequence([76,83], 0.085, 0.048); break;
      case 'cancel': sequence([69,62], 0.08, 0.034, 'sine'); break;
      case 'coin': sequence([88,95], 0.095, 0.028, 'sine', 0.045); break;
      case 'upgrade': sequence([69,72,76,79,84], 0.22, 0.046, 'triangle', 0.08); break;
      case 'fever': sequence([57,64,69,76,81,88], 0.2, 0.043, 'triangle', 0.065); break;
      case 'menuOpen': sequence([64,71,76], 0.075, 0.026, 'triangle', 0.045); break;
      case 'menuClose': sequence([72,67], 0.07, 0.021, 'sine', 0.05); break;
      case 'error': sequence([51,50], 0.11, 0.03, 'triangle', 0.09); break;
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
