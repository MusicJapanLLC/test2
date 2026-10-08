# World v3 design record

Formal title: 村長、世界まで行くんですか？

Three directions considered: permanent absurd equipment, consumable festivals, visual patronage. This release combines permanent equipment with optional visual patronage. Consumables and subscriptions are excluded so purchase restoration and player expectations stay simple. Entire regional progression remains free.

The game joins three loops: walk and stop to gather, return with regional discoveries, and make village decisions whose consequences arrive later. Expeditions use existing residents, so a player's staffing choice has an immediate cost in village production. Named personalities, mood and relationships make residents worth observing. This is a design hypothesis, not evidence that the game is clinically addictive or guaranteed to retain players.

The motivation reference is Przybylski, Rigby and Ryan's [2010 paper](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf), which considers competence, autonomy and relatedness. Our application is a readable next goal, a choice of activities, and recognisable residents. No reward expires while the game is closed; there are no paid random draws.

## Visual and interaction direction

Olive village HUD, parchment travel ledger, ochre seals, two-pixel snapping, bundled DotGothic16 subset. Four bottom actions: building, residents, world, mayor's office. The world sheet contains map, expedition, collection and shop tabs. Optional shop is not an interruption. Stop-to-gather and thumb drag remain the core controls. Menus pause simulation.

Map colors distinguish forest, stone canyon, marsh, volcano and harbor. The generated art was a mood reference only; actual game assets are code-drawn. No image is misrepresented as a playable screenshot. The entry uses eleven original procedural music patterns and synthetic character phonemes; no SUNO recording was obtained or bundled.

## Plugin record

- GitHub: existing MusicJapanLLC/test2, additive branch and draft review, no move to another website builder
- Linear: [MUS-14](https://linear.app/music-japan-llc/issue/MUS-14) parent, MUS-15 through MUS-25 scoped implementation/verification work
- MagicPath: project458939046660575232, component458941755971239936, Japanese font fixed in revision458946704864059392. Interactive map/expedition/shop prototype, explicitly labelled as design-only. Editable source is world-magicpath-prototype.tsx and WorldPrototype.css. Font license is assets/chief/OFL-DotGothic16.txt
- Figma: [file created](https://www.figma.com/design/6qWupduZSCMpIgZTFTmOHF), then Starter MCP quota prevented inspecting or writing frames. The file is blank, not a completed design handoff
- Higgsfield: image request blocked because the connection requires Basic or higher. Native image generation produced the displayed reference instead
- Hugging Face: connector model_search unavailable. Primary [pixel-art-xl model card](https://huggingface.co/nerijs/pixel-art-xl) lists CreativeML Open RAIL-M; researched only, no model or its output used in game assets. License metadata alone is not treated as an unconditional rights clearance
- Context7: Stripe Node primary documentation for exact raw-body webhook verification and idempotency
- Stripe: company account read-only discovery and hosted one-time Checkout planner accepted. No live account products, links, charges or customer records created. Anonymous CLI sandbox attempt required email and did not provision keys

## Commerce behavior

Planned one-time JPY catalog: supporter300, golden_seal980, mayor_mech1980. Golden seal multiplies mayor combat by4 with a pulse. Mech grants15 seconds at6x plus80% incoming damage reduction and can activate every45 active seconds. Multipliers do not stack; worker production stays normal. Supporter grants a crown and honorary title.

Default public build is preview. It does not process payments or grant pretend purchases. Configured client obtains entitlements from a separate durable payment server, not a redirect URL or local village save. Recovery identity is separate from village resets. Offline/error revalidation removes unverifiable effects. Client-side gameplay can still be modified by a user with browser tools; secure payment authority is not an anticheat claim.
