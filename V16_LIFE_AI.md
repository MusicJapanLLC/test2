# GUILD∞ v1.6 — LIFE / COMBAT AI PASS

Date: 2026-10-04 JST
Scope: old GUILD∞ only

Latest owner feedback is system-first and must be implemented before more feature sprawl

## Required now
- mining feels faster
- player attacks nearby zombies automatically
- every resident has HP and can defend themselves
- guards actively intercept enemies
- zombies choose real living targets: exposed player / exposed residents / breached-settlement residents
- zombies can damage and kill residents
- dawn sunlight ignites surviving zombies; burn damage kills them over time rather than despawning instantly
- lanterns create zombie spawn-suppression light zones
- lantern suppression is local radius based so one cheap lantern does not disable the entire night system
- no screen shake

## NPC rules
Every worker stores at least:
- hp / maxHp
- dead / death fade
- combat cooldown
- job state / target

Non-guard residents:
- continue their normal job
- if a zombie reaches self-defense range they stop working and fight back
- after danger passes they return to work

Guards:
- wider aggro range
- move toward enemies
- stronger damage

Zombies:
- if an exposed human is reachable outside the intact wall, attack that human
- if wall blocks humans, attack wall
- after breach, prioritize nearby humans
- Spitter uses ranged attacks against current reachable target

Player:
- auto-attacks nearest enemy in melee range
- can still move while auto-combat handles attacks
- HP is persistent
- if downed, retreat to settlement center with a morale penalty instead of wiping the save

## Dawn
At night -> dawn transition:
- remaining zombies gain `sunBurn`
- local orange fire particles / damage ticks
- movement slows while burning
- HP drains continuously until death
- no instant despawn

## Lantern spawn suppression
Each Lantern owns a light radius based on level
- spawn candidate inside any lantern radius is rejected and retried
- if enough perimeter is covered, wave size can be reduced to zero
- ticker reports how many spawns light prevented

## Mining feel
- player auto-work interval target: ~0.32 sec
- rock hit removes more node HP per cycle
- miner worker cycle faster than generic gatherer
- keep resource yield bounded by storage caps to avoid reintroducing inflation
