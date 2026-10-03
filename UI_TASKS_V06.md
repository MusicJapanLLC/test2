# GUILD∞ v0.6 polish lanes

## Lane A — Input / Feel
Owns only:
- tap / drag movement feel
- destination retargeting
- stop behavior
- camera follow timing
- building tap reliability

Must not redesign HUD or graphics

## Lane B — UI / Typography
Owns only:
- consistent digital / mono typography
- HUD spacing and labels
- hide visible ABXY row while keeping compatibility hooks
- compact MENU entry
- menu panel hierarchy
- text cleanup

Must not change economy, NPC count, movement algorithm, or graphics renderer

## Lane C — Graphics
Owns only:
- character/building/terrain detail
- polygon / pseudo-3D treatment
- light/shadow/fog/depth

Must not change input or UI behavior

## Lane D — Systems
Owns only:
- save/menu state
- compatibility hooks
- performance/state separation

Must not redesign UI or renderer

## Lane E — QA
Checks all lanes against:
- iPhone portrait/landscape
- safe-area
- touch conflict
- text clipping
- controller row hidden
- no blocking start screen
- sharp pixel rendering
- no NPC inflation

All lanes target the legacy game only
