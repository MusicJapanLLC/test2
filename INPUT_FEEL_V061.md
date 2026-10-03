# OLD GUILD∞ v0.6.1 — Input Feel

Owner: Input / Feel lane

## Latest user direction
- 1マスずつの操作感は撤回
- 地面タップ先への自動移動を主操作から撤回
- 最初期のヌルヌル移動感へ戻す
- touch + drag direction = hero keeps walking while finger is held
- building tapだけ convenienceとして残す

## Current implementation
`input-feel-v06.js`
- invisible drag pad: touch anywhere and drag
- 11px deadzone
- continuous direction feed every ~34ms
- diagonal gestures alternate horizontal / vertical directions so four-direction sprites feel less stiff
- releasing finger stops new movement commands
- ground tap does nothing
- direct building tap still routes to the building and inspects it

## Important limitation
The current core `game.js` still moves the player internally in 24px grid steps
This lane makes the interaction continuous, but the next Systems pass must expose true fractional-position continuous movement + collision

## Do not touch
- UI/Typography
- Graphics
- Audio
- Economy / NPC count
- ChatGPT Work new game
