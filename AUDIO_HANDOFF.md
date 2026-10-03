# Audio lane handoff

## Role / Changed

Original composition **Lanterns of the First Guild**, a 32-bar fantasy town theme
with lead, bass, broken chords, sustained harmony and restrained percussion
Night uses softer voices and slower tempo; fever adds upper voices and stronger rhythm
All sounds synthesize locally with WebAudio; no outside assets or copied music

## Files

- `audio.js`: standalone production module
- `audio.test.cjs`: deterministic scheduler/lifecycle verification

## Merge notes / API

Load `audio.js` before the game script and remove the old WebAudio functions / BGM interval

```js
// Directly inside the existing sound button's click handler:
await GuildAudio.toggle();
soundButton.textContent = GuildAudio.isMuted ? '×' : '♪';

GuildAudio.sfx('step'); // Once a tile move succeeds
GuildAudio.sfx('confirm'); // A / menu confirmation
GuildAudio.sfx('cancel'); // B / menu close
GuildAudio.sfx('error'); // Insufficient resources / failed action
GuildAudio.sfx('coin'); // Resource reward; internally throttled
GuildAudio.sfx('upgrade');
GuildAudio.setMood('fever');
GuildAudio.sfx('fever');
GuildAudio.setMood('day'); // When fever finishes
```

`enable()` returns `Promise<boolean>` and must first run from a user gesture
`toggle()` returns `Promise<boolean>` containing the new `isMuted` state
`setMood('day' | 'night' | 'fever')` changes the arrangement at the next bar
`pause()` / `resume()` return promises and keep one scheduler
`sfx(name)` returns whether a sound was accepted
Footstep and coin sounds are throttled independently
Visibility pause/resume is built in and respects manual pause and mute

## Tests

`node audio.test.cjs` passes: 2,921 voices over a full score plus a loop,
bounded active voices, no stalled-timer catch-up burst, repeated resume,
visibility transitions, mute, footstep / coin throttles and all action cues
`node --check audio.js` passes

## Known risks / Next recommended task

WebAudio mock checks verify scheduling and lifecycle, not speaker quality
Listen on a physical iPhone and verify unlock after first click / background return
Review BGM level against the final sound effects during actual play
