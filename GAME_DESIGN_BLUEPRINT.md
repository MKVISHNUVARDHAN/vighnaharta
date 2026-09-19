# Vighnaharta — current design entry point

Updated 15 September 2026. This file is the concise entry point to the current specification.

Read [the full gameplay design](docs/GAMEPLAY_REDESIGN.md), [asset production](docs/ASSET_PRODUCTION.md), and [the implementation plan](IMPLEMENTATION_PLAN.md) together. Detailed mechanics live in the gameplay document to avoid duplicate rules drifting apart.

## User-directed requirements

- Six satisfying games form a coherent journey to nimarjanam.
- Game 3 is flower match-3 in the Candy Crush style: adjacent swaps, specials, combinations, gravity, and complete cascades.
- Game 4 plays a distinct instrument immediately for each D/F/J/K press, alongside music; timing determines judgment, not whether the instrument sounds.
- Games 5 and 6 need satisfying actions, meaningful choices, and visible payoffs.
- Vinayaka and the crew follow the ceremonial road; followers use individual trailing positions constrained by road width. Mooshak is free to roam every connected walkable city space from the first moment of control.
- Scenes use independently animated characters, props, surfaces, and effects. A single complete background image does not fulfil the interactive-world requirement.
- Generated/reference images may appear only as roadside scenery, murals, posters or distant dressing. Interactive gameplay uses independently controllable licensed sprites, geometry and effects.
- Continue the existing Phaser/TypeScript browser project. Image generation supplies artwork; Phaser supplies animation, interaction, and physics; Web Audio supplies sound and music playback.

## Current six-chapter proposal

Road Rally → Modak Catch → Flower Festival → Dhol Utsav → Monsoon Crossing → Rangoli Lightworks → ghat farewell.

The authoritative [production master plan](IMPLEMENTATION_PLAN.md) defines city topology, story rhythm, mechanics, camera, audio, NPC response, persistence and final verification gates.

## Remaining discussion items

The action-based replacement of game 1's quiz, exact first-run length, and local ritual/language staging remain proposals. Four audible pads and flower match-3 are already user-directed; do not ask for those decisions again.

The six redesigned chapters and the first generated animation asset are now integrated as a playable prototype. The detailed design remains the behaviour reference; see [implementation status](docs/IMPLEMENTATION_STATUS.md) for verified and remaining work.

[Earlier blueprint archive](docs/archive/2026-09-13-before-consolidation/GAME_DESIGN_BLUEPRINT.md) is historical context, not an alternative active specification.
