# Vighnaharta — artwork to playable assets

Updated 13 September 2026. Production workflow for the [six-game design](GAMEPLAY_REDESIGN.md). Status: in progress. The first generated Mooshak run sheet is prepared and integrated; remaining asset families are production targets.

## 1. Tools and responsibilities

| Tool / system | Responsibility | Output |
| --- | --- | --- |
| Built-in image generation | New raster artwork and reference-based edits/variants using existing inspected assets. | Individual transparent character poses, prop parts, flowers, materials, and background art. |
| Phaser 3 + TypeScript, already in this project | Sprite animation, articulated parts, world transforms, road following, physics, particles, cameras, and gameplay response. | The playable browser world. |
| Code-authored geometry and effects | Exact road corridors, collision footprints, light paths, masks, simple UI shapes, shadows, and trajectories. | Deterministic geometry matching the game rules. |
| Web Audio | Immediate instrument playback, scheduled accompaniment, mixing, and calibration. | Audible music and sound connected to play. |
| Browser inspection and testing | Visual, audio, interaction, and performance verification. | Evidence that an asset works at actual play scale. |

Unity is not part of this implementation plan. No Unity project, external animation service, ControlNet setup, or automatic character-rigging tool is assumed available. Image generation supplies artwork; the animation and gameplay work still has to be authored. Audio needs separate synthesis or suitable recordings, not image generation.

## 2. Existing assets: reuse before generating

Keep originals unchanged. Inspect each candidate individually before editing or treating it as an animation reference; filenames and previous descriptions do not prove that its alpha, perspective, or separation are correct.

| Existing file/family in `public/assets` | Intended use | Missing work |
| --- | --- | --- |
| `mooshak-scout.png` | Character identity and candidate idle pose. | Directional walk/hop/land/recover poses; consistent frame canvas and foot anchors. |
| `ganesha.png` | Shrine identity and candidate stable shrine layer. | Inspect whether platform/carriers are baked in; prepare separate layers and consistent route/farewell views as needed. |
| `devotee.png`, `devotee_flag.png`, `devotee_dancer.png` | Crew identity references. | Walking directions, role-specific action frames or articulated parts; separate instruments/flags where needed. |
| Building and tree PNGs | Candidate reusable environment pieces. | Footprints, bottom pivots, foreground occluders, style/scale checks, variants only where needed. |
| `barricade.png`, `road_tile.png`, `road_rangoli.png` | Candidate prop/material references. | Verify projection; split movable parts; align road appearance to authored geometry. |
| `festival-journey-map.png`, `district-night-v2.png`, `city-expansion.jpg` | Atmosphere/layout references and possible distant art. | Rebuild interactive foreground as separate objects; cannot extract hidden surfaces or motion automatically from the painting. |

Duplicating one pose creates another copy, not a walk cycle. Repeated crowds still need grounded locomotion and route slots. Mirroring a complete scene does not create a new navigable district.

## 3. Art direction and references

World asset style: stylised festival diorama, orthographic 2:1 isometric projection, warm top-left light, marigold/brass/vermilion against indigo and teal, clean silhouettes at phone scale. Preserve the existing characters' identity and costume while simplifying distracting microdetail.

Use this consistent direction for world sprites. Flower-board pieces, letter-pad symbols, and the overhead rangoli board use their own fixed gameplay-facing projection; do not force isometric perspective onto a flat puzzle board. Produce a small reference sheet of scale, palette, character identity, and view conventions before expanding a family.

Avoid baked floor shadows on movable sprites; render ground shadows separately. Preserve useful self-shading. New images should have actual alpha transparency, not a drawn checkerboard. Do not rely on an automatic background-removal step to rescue a poor silhouette.

## 4. Generation workflow

1. Identify the exact gameplay need and the existing reference. Write its intended display size, direction, pose/parts, pivot, and animation method before prompting.
2. Inspect the local image. Label whether it is an identity/style reference or an edit target. Keep costume, proportions, accessories, lighting, and camera consistent.
3. Use the built-in image-generation tool for new raster assets and edits. Request transparent output directly. For several assets, make bounded calls by asset/variant; do not expect one huge sheet to deliver perfectly consistent animation automatically.
4. Review silhouette, hands/feet, identity, direction, alpha, and style. Revise a specific defect at a time. AI-generated consecutive frames may drift; no automatic production-readiness claim is allowed.
5. Save accepted project outputs under versioned project paths. Preserve originals and retain the prompt/reference record. Proposed directories below are conventions, not folders already populated with new art.
6. Prepare the atlas and animation metadata. Keep frames on a common logical canvas; independent tight cropping without offsets causes visual jitter. Packing can trim transparent padding only if trim offsets are retained.
7. Integrate a small animation or reactive prop in Phaser. Preview in motion against light/dark ground and alongside existing assets at intended zoom.
8. Reject/rework art that needs excessive deformation to imitate missing motion. Produce missing poses/parts or use a simpler coherent action. Expand the family only after the sample passes.

Image edits use the image-generation tool; deterministic atlas packing and metadata preparation are separate build work. Do not assume the legacy Python image-processing script is the default editing pipeline. Built-in generation does not need the user to supply an API key; do not silently switch to an API/CLI workflow if it fails.

## 5. Animation method by asset

| Asset | Method | What must actually move |
| --- | --- | --- |
| Mooshak | Frame animation for locomotion/hops, small secondary part motion where feasible. | Feet, body weight, ears/tail; ground anchor remains stable. |
| Shrine and carriers | Stable shrine plus separately animated carriers/platform attachments. | Carrier legs/arms and restrained suspension; shrine is not squashed as a cartoon response. |
| Drummer/cymbal player | Separate arms, sticks and cymbals around authored pivots, or consistent action frames. | The selected instrument receives a real strike on each key press. |
| Cart/gate/raft | Separate rigid pieces with code-driven transforms. | Wheels rotate by travel distance; gate rotates about hinge; raft translates/dips and carries supported actors. |
| Flowers | Individual pieces, authored specials, code-controlled swap/fall/clear and light squash. | Every tile follows the match resolution; only cosmetic petals leave the board. |
| Flags/garlands | Segmented sprites or modest mesh/part deformation. | Wind motion and passage reactions; no uncontrolled distortion of the entire scene. |
| Water/light/rain | Layered textures/masks plus procedural motion and particles. | Contact ripples, shore occlusion, timed illumination; essential warnings stay visible. |

Phaser tweens are suitable for gate opening and UI feedback. Tweens alone do not produce believable walking by scaling a single complete person. Physics remains independent of visual bounce and decorative deformation.

## 6. First production batch

Produce the smallest useful proof: Mooshak, a road bend, one moving cart, one reacting spectator, one flag, and the existing shrine/crew with correct formation movement.

- Mooshak: first prove a six-frame walk loop in one needed direction plus idle, take-off, airborne, landing, and recovery poses. Extend to the four required route views after identity and contact tests pass. Do not mirror asymmetric costume details blindly.
- Road: author a curved corridor with consistent paving and matching collider boundaries in code; art decorates validated geometry.
- Cart: body and wheels; a collision footprint underneath; wheel rotation linked to distance.
- Spectator/flag: idle and wave action, flag movement, cooldown so reaction does not loop every frame.
- Procession: reuse inspected shrine art and candidate crew while proving independent trailing paths. Upgrade directional animation before calling the scene final.

Acceptance: a 10-second in-engine sequence shows a grounded walk/hop, a crew turn fully inside the road, prop occlusion, a rolling cart, a spectator reaction, and a surface response. Check at actual gameplay size, not only a large still image. This is the first visual proof, before producing all six districts.

## 7. Six-area asset batches

| Area | Artwork to generate/reuse | Engine-authored reaction |
| --- | --- | --- |
| Welcome Street | Gates, cart parts, banners, steward actions, road materials. | Hinge opening, wheels, hop dust/splash, crew turning. |
| Modak Market | Sweets/husks, vendor action parts, cloth, trays, baskets. | Ballistic waves, catches, cloth response, fill states and delivery. |
| Garland Bazaar | Five flower identities, Sweep/Burst/Lotus specials, baskets, thread, segmented arch, helpers. | Swap, cascade, special combinations, basket deposits and garland lift. |
| Dhol Chowk | Four instrument/performer sets, hand/stick/cymbal pieces, dancers. | D/F/J/K strike their individual instruments immediately; chart and band share beat phase. |
| Monsoon Approach | Rafts, awning, ropes, latches, volunteers, wet materials, ghat approach parts. | Support motion, spring landing, rescue, latch and approach opening. |
| Courtyard/ghat | Endpoint lamps, crossing tile, powder motifs, lanterns, rangoli sectors, carrier farewell views. | Route pulses, raised crossing, sector lighting, voluntary final chords, immersion staging. |

These are bounded asset sets, not six full-scene image requests. Each completed area must still show the main road and the consequences of prior chapters.

## 8. Example prompt briefs for future generation

**Mooshak reference-based pose:** Use the supplied Mooshak image as the identity reference. Preserve its charcoal-grey fur, saffron costume, proportions, and facial features. Produce a full-body isometric walking contact pose facing the specified route direction, with warm top-left light and the same stylised diorama finish. Isolated actual transparent background; no ground, floor shadow, text, or extra props. Keep the whole body inside the frame. This is one animation pose, not a scene.

**Drummer parts:** Use the inspected devotee reference for identity and costume. Produce a coherent isometric dhol player with separated body, upper/forearms, hands, sticks, and drum pieces at the same scale and lighting. Include overlap at joints, unobscured parts, and sufficient spacing for extraction. No baked ground shadow, lettering, or additional performers. Verify that the art can actually articulate before acceptance; a visually attractive exploded sheet alone is insufficient.

**Flower piece:** One recognisable marigold game piece, face-on for a match-3 board, warm stylised shading, clear scalloped silhouette, actual transparent background. Keep the centre readable at a 48 CSS-pixel tile size. No board, words, glow obscuring edges, or scene. Use matching lighting and visual weight for the other flower types.

Exact pose names, reference paths, scales, and output IDs must be filled in when running production. These briefs are not records of completed generation calls.

## 9. Files, metadata, and acceptance

Proposed runtime path convention: `public/assets/v2/<family>/<asset-id>.png`. Animation atlas JSON belongs beside its image. Keep prompts, reference filenames, generation method, accepted versions, and rights records in a companion manifest under `docs/assets/` when production starts.

Each manifest entry needs: asset ID, source/reference files, output file, version/status, projection/direction, logical frame size, trim offset, ground or joint pivot, world display scale, collision footprint reference, depth/occluder layer, animation clips and frame timing, contact events, and provenance. Mark draft values as draft rather than inventing measured pivots.

Quality gates:

- Identity and proportions remain stable throughout an animation; no extra limbs or changing costume.
- Correct alpha, no halo/checkerboard, no clipping; atlas frames retain stable anchors.
- Ground contact and directional facing remain consistent around road bends.
- Collision is based on the ground footprint; jump height and cloth do not move it incorrectly.
- Each interactive object is separately controllable; no painted duplicate beneath it.
- Every letter press has the matching immediate sound and musician action, subject to mute.
- Every chapter's visual outcome uses its actual logical state, including retry and reload.
- Rendering and memory fit measured device budgets; no unbounded particle or audio accumulation.

See [implementation order](../IMPLEMENTATION_PLAN.md) for when to produce each batch and [provenance](../ATTRIBUTIONS.md) for recording imports and generated outputs.
