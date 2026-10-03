# v0.8 save schema

Key: `guild-v08-system-save`
Version: `80`

Persisted:
- resources: gold / wood / food / gem / timeSand / ticket / materials / pity counters
- player x/y/direction
- quest completion count
- building list
- facility levels
- constructed facility IDs
- up to 200 NPCs: x/y/color/rarity/name/bonus
- savedAt

Persistence layers:
- localStorage (sync restore)
- IndexedDB `guild-v08-persist` object store `save` key `current` (mirror/backup)

Save cadence/triggers:
- every 3 sec
- critical actions
- pagehide
- beforeunload
- visibilitychange
- freeze where supported

Speed state is intentionally reset to x1 on restore so a timed boost cannot become permanent after reload
