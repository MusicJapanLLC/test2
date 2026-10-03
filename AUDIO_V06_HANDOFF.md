# GUILD∞ LEGACY v0.6 — Audio handoff

Role: Audio only
Branch: `legacy/agent-audio-v06`
Base: `legacy/guild-v05-detail-polish`

## Changed
- long-session master/music/effect gainを下げてiPhone speakerで疲れにくく調整
- room/reverb tailを短くしてcheap mobile RPG感を抑制
- day/night/feverのtempo差を少し穏やかに変更
- melody/bass/arpeggio/drumを全体的に整理し、街の環境音楽として後ろへ下げた
- step/confirm/cancel/coin/upgrade/feverのSEを相対的に小さく整理
- audio enable/muteに短いfadeを追加
- `menuOpen` / `menuClose` SFX hookを追加（integration側が必要時だけ呼ぶ）

## Not changed
- graphics
- movement/pathfinding
- UI layout/typography
- economy
- NPC count
- save schema
- ChatGPT Work new game

## Tests / review
- WebAudio APIの既存構成を維持
- Safari gesture unlock pathを維持
- visibility pause/resume pathを維持
- 実機iPhoneでは最終volume確認が必要

## Merge notes
- visible差分はないため、graphics/inputと衝突しない
- integration時は `audio.js` のみ採用可能
- `menuOpen/menuClose` を使う場合はUX laneから `GuildAudio.sfx(...)` を呼ぶ
