# Vighnaharta: Ganesh Festival — gameplay, assets and production plan

Planning revision: 14 September 2026. This document is a proposal, not an implementation or test report. It consolidates the latest user direction: plan the complete game and its assets first, implement afterward, then test. Earlier workspace edits are unfinished and must not be treated as accepted final work. Historical implementation descriptions in earlier documents may be stale.

## 1. The game we are building

Play as Mooshak, the small, quick festival helper guiding preparations for Ganesha's procession. Explore a decorated neighbourhood, help six citizens through six distinct games, and bring the community together for the farewell at the ghat.

The main journey must contain its own enjoyable decisions: choose a path, collect offerings, hop over puddles, guide helpers, open shortcuts and discover small optional tasks. Completing a minigame changes the actual district and adds something to the procession. The player should see what their help accomplished.

Target first-play length: approximately 12–18 minutes, subject to later tuning. Minigames should also be available individually with instant replay. No mandatory trivia gate. Short optional conversations can provide festival context.

## 2. Ganesh Chaturthi identity

The festival theme must be present in the actions, setting, sound and rewards:

- Begin at a decorated mandap where the community is preparing the procession.
- Keep a consistent Ganesha idol design across the mandap, moving platform, portraits and finale. The idol is carried with measured movement; energetic game effects belong to Mooshak, flowers, obstacles and the surrounding celebration.
- Use marigold garlands, mango-leaf torans, diyas, rangoli, modak offerings, fabric canopies, local shopfronts, a community music group and ghat steps.
- Give citizens recurring identities: Aaji Meera at the gate, Madhav at the sweet stall, Tara at the flower bazaar, Rohan with the drummers, Deepak at the crossing and Anaya in the courtyard.
- Use a consistent regional setting rather than a mixture of unrelated costume and architecture. Proposed setting: a stylized Maharashtrian neighbourhood, with English instructions and a small, carefully reviewed set of Marathi festival phrases. Other-language localization can follow.
- Frame rewards as seva, community progress and festival mastery. The world becomes more welcoming and complete with each success.
- End with a player-paced farewell: place lights, gather the procession and choose when to begin the closing scene. No timer or precision challenge during the ceremonial moment.

These are creative production choices. Clothing, instruments, iconography and language need a focused visual/reference review during asset selection; generic fantasy art is not sufficient evidence of cultural accuracy.

## 3. Visual and technical direction

Recommended baseline: keep the existing Phaser + TypeScript project and build a 2.5D world from individually animated objects. Use low-poly 3D models as production source assets where useful, rendering them into consistent directional sprites for this runtime. This avoids committing the project to a full engine migration just to use downloaded models.

Models are valuable because one rigged character can provide consistent views and animation frames. Rendered sprites still need real movement, collision, animation state, depth sorting and interaction. A complete painted district cannot provide those object-level behaviors.

Art direction: rounded, readable silhouettes; warm terracotta, marigold, ivory and teal; restrained purple night shadows; consistent top-left lighting; soft ground shadows rendered separately. Scale the whole cast and scenery against Mooshak and the procession before making all districts.

Use a strict 2:1 dimetric ground grid. Every prop records its ground anchor, footprint and draw order. Moving actors sort by their ground position, independent of visual jump height. Assemble roads, houses, stalls, people, trees, flags, water and effects as separate objects.

Keep React for menus, settings, accessibility and results. Use Phaser scenes/systems for continuous gameplay and a shared EventBus for communication. The plan is to consolidate the current mixture of minigame loops into a consistent lifecycle: ready → play → result → retry/return.

Live 3D is a separate alternative if a freely rotating camera becomes a requirement. It is not included silently in this baseline. Before model conversion work, confirm a usable Blender render/export workflow; if unavailable, use a coherent existing animated 2D pack for generic assets and record the custom-character production dependency.

## 4. Asset sources and intended use

The following sources were researched online. Listing a pack does not mean every file has been downloaded, visually accepted or integrated.

| Source | Confirmed content | Intended use | Adaptation / limitation |
| --- | --- | --- | --- |
| [KayKit City Builder Bits](https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0) | CC0 modular 3D assets; repository includes buildings, benches, boxes and model formats | Generic street structure, furniture and background props | Choose compatible silhouettes; add local facades, roofs, shop signs and festival trim. Reject modern forms that do not fit. |
| [KayKit Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | Rigged characters, 75 advertised animations, CC0; actual character GLB files verified | Animation/rig reference and potential generic character base | Fantasy armour, weapons and robes are unsuitable as final festival clothing. Retargeting and outfit changes require work. |
| [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | 3D nature assets; 330 files; CC0 | Trees, rocks and riverbank foliage | Recolor and render using the shared camera; choose locally plausible species/shapes. |
| [Kenney Food Kit](https://kenney.nl/assets/food-kit) | 3D food/kitchen assets; 200 files; CC0 | Supporting market and kitchen props | Do not present generic sweets as modaks. Select actual suitable props and create missing offerings. |
| [Kenney UI Pack](https://kenney.nl/assets/ui-pack) | 430 UI files; CC0 | Common buttons, bars and control surfaces | Apply the festival palette, typography and ornaments consistently. |
| [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | 80 effect textures; CC0 | Pickup glows, sparks, dust and success effects | Custom flower petals and water contact effects supplement the pack. |
| [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) | 130 audio files; CC0 | Footsteps, prop contact, landings and collision feedback | Audition each sound; these are not a replacement for dhol/tasha recordings. |
| [Kenney Isometric Roads](https://kenney.nl/assets/isometric-roads) | 95 2D files; CC0 | Fallback road tiles and layout reference | Use only if their scale and style fit the selected rendered-model art. |
| [eturner game-assets library](https://github.com/eturner58/game-assets) | Searchable catalogs plus committed Kenney art, models and audio | Machine-searchable discovery and selected-file acquisition | Third-party mirror: preserve original creator/license provenance. LimeZu entries are metadata only. |
| [Quaternius](https://quaternius.com/index.html) | Candidate character, animation, animal and environment packs | Secondary source when the primary family lacks an asset | Older pack/FAQ pages say CC0; the [newer license page](https://quaternius.com/license.html) has QAL terms. Record the actual selected release and included license. No Mooshak-ready model is verified yet. |

Acquisition priority: direct creator repositories → official pack downloads → verified mirrors with original provenance. GitHub ZIP/raw-file retrieval can be handled by the agent. Some official download flows may require browser interaction; do not promise universal unattended access.

## 5. Custom festival asset inventory

These assets are explicitly part of the production scope, not assumed to exist in the generic packs.

| Asset family | Initial scope | Required movement / variants |
| --- | --- | --- |
| Mooshak | One distinctive hero with consistent proportions and a small festival accessory | Idle, run, take-off, airborne, landing, dash, recovery, celebrate; four route-facing views initially; additional views if movement needs them |
| Ganesha and platform | One consistent idol, mandap placement, wheeled/carried platform and canopy | Separate carriers, wheels where applicable, cloth, flowers and lamps; stable idol silhouette |
| Festival people | Six named citizens and 4–6 reusable crowd appearances | Idle, walk, wave, clap; instrument players need actual arm/stick strikes; variation through outfits and palette |
| Architecture | Mandap, three shopfront families, house facade variants, gateway and ghat steps | Separate doors, shutters, signs, hanging decorations; gate opens on its hinge |
| Decoration kit | Torans, garland segments, banners, flags, diyas, hanging lamps and rangoli decals | Wind loops, ignition and placement states; no text baked into reusable art |
| Offering kit | Modak, laddu, trays, baskets and wrapped delivery parcels | Normal/golden gameplay variants, airborne rotations, catch bursts and filled-tray states |
| Music kit | Dhol, tasha, cymbals/manjira, sticks and straps | Distinct strike/rebound actions and corresponding sound recordings |
| Interactive props | Handcart, barricade, latch, raft, stepping stones and bridge pieces | Wheels roll, harmless practice obstacles break, gates open, rafts carry actors, supports react to landings |
| Puzzle kit | Four normal flower pieces, four special indicators, light endpoints and crossing tile | Swap, fall, bloom, chain clear, flowing light and lamp ignition |

Reuse the current project art only after checking silhouette, alpha, identity, scale and animation consistency. Large existing paintings may remain as menu art or distant background references. Custom raster generation, if used later, produces isolated assets/reference sheets; it must not be assumed to generate a rigged model or a temporally consistent walk cycle automatically.

## 6. Main adventure loop

Loop: explore → notice a need → navigate a short challenge → help a citizen → play the district game → see the improvement → continue with the procession.

- Responsive walking and a short dash/hop with visible recovery. Ground collision and animation remain independent.
- Keyboard movement plus pointer destination movement; touch controls are designed explicitly for small screens.
- Optional offering trails encourage turning, hopping and choosing routes. Scoring comes from actual interactions.
- Use road constraints, readable prop footprints and a route-following procession. The camera keeps Mooshak and the next meaningful destination understandable.
- Offer deliberate interaction at a citizen/entrance instead of interrupting the player at a large invisible radius.
- Add short optional acts of help: retrieve a dropped garland, deliver a tray, open a shortcut or guide a helper. They reuse the same verbs and props.
- Success changes a district persistently. The procession gains decorations, offerings, music, access and lights.
- Pause, sound settings, replay, restart and return-to-menu must work consistently. Save completed districts, medals and settings locally; store assisted records separately.

## 7. Six games and their festival payoffs

| Game | Play and escalation | Asset/animation requirements | Visible result in the city |
| --- | --- | --- | --- |
| Road Rally | Steer, hop puddles, dodge carts and collect petals. Begin with readable single obstacles, then combine patterns while preserving a safe route. | Mooshak run/jump, separate cart wheels, puddle ripples, lane landmarks, bell and pickup effects | Welcome gate opens; volunteer route markers appear |
| Modak Catch | Swipe airborne sweets, avoid visibly distinct husks, chain quick catches and fill trays. Use readable trajectories and a satisfying catch response. | Recognizable modak/laddu forms, rotated variants, baskets, a swipe trail, crumbs/petals and tray-fill states | Offering trays fill and helpers join the procession |
| Flower Festival | Swap neighbours, make matches, create special blooms and trigger cascading clears. Objectives are shown as garland baskets; invalid swaps return cleanly. | Four matching flower designs, special pieces, swap/fall/clear animation, basket meters and assembling garlands | Garlands visibly grow across the bazaar arch |
| Dhol Utsav | Four keys/touch pads play four audible instruments. Teach the beat, develop patterns, then finish with a short ensemble flourish. | Drummers with real strike motion, instrument-specific samples, readable approaching notes and timing feedback | Music layers and animated musicians join the procession |
| Monsoon Crossing | Hop through cart gaps, ride rafts and reach permanent checkpoints. Later sections combine movement directions and wider timing decisions. | Moving rafts/carts, grounded hops, floating motion, splash/ripple effects, volunteers and bridge/latch states | A safe access route opens toward the ghat |
| Rangoli Lightworks | Connect matching lights with a clear crossing rule. Use a small authored sequence of solvable layouts; preview progress and allow undo/redraw. | Distinct symbols and colors, continuous path graphics, crossing-layer treatment, diyas and petal illumination | Courtyard rangoli lights up and enables the farewell |

Each game has a concise playable introduction, a clear success target, explicit failure/recovery where relevant, a result summary, medal criteria and an immediate retry. Targets and durations are tuning proposals until playtested. Progression should reward helping; mastery medals add replay value without blocking the ceremony behind gold performance.

## 8. Animation, sound and feedback plan

Movement: planted feet, correct facing, a stable ground anchor, acceleration/deceleration and subtle anticipation. Jump: shadow stays on the ground, body follows the arc, landing produces a brief reaction. Props: actual wheels, hinges and raft support behavior. Crowd: timed waves/claps with offsets so the whole group does not move in lockstep.

Success feedback combines a short sound, an object reaction, restrained particles and a readable score/objective update. Important warnings never rely on color alone. Camera shake, flashes and decorative motion respect reduced-motion settings.

Audio has separate music and effect levels plus mute. Plan licensed or original dhol, tasha, cymbal and bell samples; source and audition them before claiming an authentic ensemble. The rhythm game's chart and music use a common timing reference. Duck other accompaniment during that game so competing rhythms do not obscure timing. Footsteps, water, carts, pickups, warnings and celebrations each have distinct roles.

## 9. Agent-managed asset pipeline

1. Select a small compatible set from the researched sources, with a reference/contact sheet showing intended scale and palette.
2. Record source URL, creator, release/commit, original filename and license for every accepted asset. Download only necessary files and dependencies.
3. Keep originals outside the public game bundle. Inspect model geometry, textures, rig, clips and orientation; distinguish verified capabilities from advertised ones.
4. Customize cultural hero assets and generic props according to the inventory. Use one camera, light setup and common logical sprite canvas.
5. Render directional animations; pack texture atlases with pivots, trim offsets, frame names and animation timing. Define colliders from gameplay footprints rather than image bounds.
6. Give each runtime asset a manifest entry including source metadata, SHA-256, derived files, dimensions, pivot, animations and intended use.
7. Integrate each asset as a game object with a defined behavior and lifecycle.
8. After implementation, verify motion, clipping, loading, collisions and the complete play loop. Only then expand or revise the asset batch.

Proposed folders: `art/source/` for originals, `art/render/` for conversion work, `public/assets/festival/` for optimized runtime files, and `docs/assets/manifest.json` for provenance. These are planned conventions, not a claim that the files already exist.

## 10. Delivery order

1. **Complete planning:** this master plan, chosen setting, source shortlist, asset inventory, scene responsibilities and outstanding dependencies.
2. **Asset selection and preparation:** choose the exact packs/files, settle the art direction, produce the hero/prop reference sheet and confirm conversion tools. No bulk library dump into the game.
3. **One complete playable section:** a road bend, Mooshak, the procession, one citizen, a cart, decorations, the welcome gate and Road Rally. Include feedback, touch controls, failure/retry and the persistent gate-opening payoff.
4. **Verify that implemented section:** controls, readable motion, depth, camera, collisions, loading and restart. Revise it before repeating its patterns across six areas.
5. **Build the remaining games:** Modak Catch and Flower Festival; Dhol Utsav; Monsoon Crossing; Rangoli Lightworks. Produce each district's custom assets with its mechanics rather than building all art blindly up front.
6. **Connect the full adventure:** persistent district transformations, progression, saved records, direct arcade access and the farewell sequence.
7. **Final playtest and polish:** complete all six games, retry each, leave/re-enter safely, verify sound settings and assisted records, check small-screen layouts and measure frame pacing/loading on representative devices.

Initial performance targets: 60 fps desktop, a stable 30 fps floor on the selected lower-end mobile target, and a small first-play download with later districts loaded on demand. These are acceptance goals, not measured results. Load only needed animation families and avoid shipping raw source models when the runtime uses derived sprites.

## 11. Completion criteria

- The main journey is worth playing between minigames and visibly reacts to the player's help.
- Ganesha, Mooshak, citizens, architecture, offerings and music form one recognizable festival world.
- Every moving character has suitable animation; each interactive prop has its own collision and state.
- All six games have clear controls, achievable goals, correct scoring, working completion and immediate replay.
- The final ceremony is reachable without exceptional arcade skill.
- Final assets have known origins/licenses and match the shared visual direction.
- Desktop and touch playthroughs finish without blocked progress, broken layouts or runaway audio/timers.

Open production dependencies: final Mooshak/hero-art source, custom Ganesha/platform treatment, culturally suitable character outfits, percussion recordings, exact model conversion tooling and the representative mobile device. These must be resolved during asset preparation and recorded explicitly; generic packs do not automatically satisfy them.
