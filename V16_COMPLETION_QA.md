# v1.6 Completion QA

## Repeat construction
- HOUSE can be built 3x without wall upgrade when resources allow
- LANTERN can be built 3x without wall upgrade when resources allow
- WATCHTOWER supports multiple placements after unlock
- each repeat structure occupies a distinct interior position
- repeat cap is visible in BUILD
- when cap/space is reached, message explicitly tells player to expand wall

## Defense discoverability
- PALISADE is first card in BUILD
- PALISADE uses stronger visual treatment than ordinary buildings
- after first HOUSE but before wall, NEXT explicitly says `BUILD → 防壁 / PALISADE`
- persistent DEFENSE chip says `防壁なし · BUILDで建設`
- after wall construction chip shows wall level and HP

## Resource lifecycle
- FOOD respawns ~8s after depletion
- TREE respawns ~12s
- ROCK respawns ~14s
- same patch respawns when still valid
- if wall expansion covers patch, it relocates just outside settlement
- minimum frontier population prevents a dead empty map

## Regression
- player auto combat still works
- residents still defend themselves
- zombies still attack humans
- dawn burn still works
- lantern spawn suppression still works
- autosave still works
- zero screen shake
