# UI / Typography v0.6 handoff contract

Base: `legacy/guild-v05-detail-polish`

Target branch: `legacy/agent-ui-typography-v06`

## Required changes
- preserve the current screenshot-level visual baseline
- unify HUD/button/menu typography
- remove visible ABXY controller row from the normal mobile screen
- retain hidden compatibility action hooks for existing JS
- add one compact MENU control
- MENU opens existing ledger/menu instead of inventing a new system
- simplify Japanese labels and remove mixed/random font sizing
- do not change movement, economy, NPC count, renderer, audio, or save format

## Acceptance
- no JS null-reference from hidden compatibility buttons
- mobile field tap/drag continues to work
- MENU opens/closes
- no control overlaps iPhone safe area
- text does not clip at 390x844
- English/numeric HUD and Japanese menu feel visually related
