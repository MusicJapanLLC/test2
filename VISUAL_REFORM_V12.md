# GUILD∞ v1.2 — VISUAL / FX / AUDIO REFORM

Priority order:
1. perceived visual jump
2. action feedback
3. real BGM
4. UI hierarchy
5. preserve systems / autosave

## Non-negotiable visual changes
- player uses actual pixel sprite sheet when available
- workers use sprite-sheet bases when available
- world render gains sprite/textured ground, foliage and layered lighting
- resource nodes get bigger silhouettes and richer shading
- buildings read as buildings from roof/wall/window/trim, not boxes
- construction becomes a 3-stage event
- palisade becomes a full settlement perimeter in one build

## Non-negotiable effects
Gather:
- impact flash
- 8–14 debris particles
- 2–4 resource motes arc to HUD
- floating resource amount
- node depletion burst

Build:
- site marker
- timber/stone dust
- stage 1 foundation
- stage 2 walls
- stage 3 roof/details
- final gold flash and sparkle ring
- no screen shake

Night:
- palette crossfade
- lantern glow stronger
- embers/fireflies
- zombie silhouettes more readable

## Non-negotiable audio
- daytime default track becomes CC0 `Overworld Theme — alternate`
- night/combat becomes CC0 `8-bit - Slay The Evil`
- crossfade rather than abrupt restart
- SFX stay procedural for low latency
- iOS unlock on user gesture

## UI
- keep bottom dock
- replace plain labels with compact icon+label hierarchy
- active BUILD state feels premium, not web-dashboard
- no pill UI
- no visible joystick / ABXY

## Quality test
Owner should be able to compare v1.1 and v1.2 screenshots and say they are different builds without reading a label
