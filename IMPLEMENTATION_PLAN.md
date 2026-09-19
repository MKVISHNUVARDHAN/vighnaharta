# Vighnaharta v3 — production master plan

Updated 15 September 2026. This is the authoritative build order for the free-roaming redesign. Older linear-route plans are historical only.

## 1. Product promise

The player is Mooshak, the tiny scout who runs ahead of Vinayaka's nimarjan procession and turns six city problems into six joyful acts of seva. The city is a place to explore, not a corridor between menus. Every completed chapter visibly improves the same city and strengthens the procession until the final ghat farewell.

The emotional rhythm is **wonder → responsibility → rising urgency → collective celebration → tender farewell**.

The play rhythm is **roam → notice a problem → hear human context → learn one verb → master it under pressure → transform the street → watch the procession advance**.

## 2. Non-negotiable world rules

- **Mooshak is free-roaming.** He may explore every connected road, lane, alley, sidewalk, plaza, courtyard and park from the first moment of control. Buildings, deep water and the outside edge are the only hard blockers.
- **Vinayaka stays on the ceremonial road.** The murti, rath, volunteers and crowd follow authored road waypoints and never cut across parks, alleys, buildings or minigame spaces.
- Chapters are completed in story order so the procession has a coherent physical journey. Exploration is never locked; only the next chapter interaction is active.
- The camera follows Mooshak. The procession may wait off-screen and advances only after the current road problem is resolved.
- No invisible “stay near the road” force, rubber band, teleport or punishment is applied to Mooshak.
- Generated/reference JPG imagery is **scenery only**: wall murals, posters, signboards and distant roadside dressing. It is never a player, NPC, cart, hazard, collectible, puzzle piece, platform, button or HUD element.

## 3. City topology and navigation

Build a 30×30 2:1 dimetric city with one readable Y-shaped ceremonial spine and several reconnecting loops. The trunk begins at Welcome Street, branches through the bazaar and monsoon districts, and reunites at the ghat. Side streets reconnect often enough that exploration does not create dead-end frustration.

Each district needs a unique silhouette, colour family, ambient sound and landmark visible from a neighbouring district:

1. **Welcome Street** — saffron gate, handcarts, morning gold.
2. **Modak Market** — copper awnings, sweet stalls, warm orange.
3. **Garland Bazaar** — bamboo arches, flower colour, magenta/green.
4. **Dhol Chowk** — circular plaza, drum banners, teal/red.
5. **Monsoon Approach** — drains, tarps, rain-blue reflections.
6. **Ghat Courtyard** — stone steps, brass lamps, sunset gold.

Navigation uses distant landmarks, a subtle gold footprint trail to the current chapter, and NPC directions/road signs. The trail guides but never fences. Future chapter markers remain visible but dormant. Arrival must require deliberate interaction or a short hold; merely passing nearby must not launch a game.

## 4. Story delivery system

Avoid long exposition cards. Tell the story through player-caused changes, short character moments and environmental evidence.

At dawn the camera travels down the empty ceremonial road, shows six disruptions, reveals the decorated rath waiting, then finds Mooshak beneath a flower cart. Control begins after one sentence: “Run ahead, little Vighnaharta. Help the city make a path.”

Each district has one named anchor character with a verb, want and changing relationship to Mooshak. Dialogue follows ARC: answer a useful question, reinforce what changed, or create anticipation.

- Aaji Meera — organising the welcome; protective, direct.
- Madhav Halwai — preparing offerings; fussy, generous.
- Sakhi Tara — decorating the route; inventive, impatient.
- Rohan Dholi — rallying the pathak; competitive, joyful.
- Kaka Deepak — securing the flooded approach; calm, practical.
- Anaya — lighting the farewell rangoli; observant, tender.

Barks prioritise an urgent cue, reaction to Mooshak, chapter gossip, then ambient life. No bark repeats until its local pool is exhausted. “Ganpati Bappa Morya!” is a celebration response, not constant noise.

Persistent chapter transformations:

- Chapter 1: gate opens and carts remain parked in alleys.
- Chapter 2: filled offering trays appear on stall counters.
- Chapter 3: completed garland hangs across the road.
- Chapter 4: dhol corps joins the procession and changes the music mix.
- Chapter 5: bridge latches lock and the safe road rises above water.
- Chapter 6: diya lines ignite toward the ghat and remain lit.

## 5. The six games

Every game teaches one verb in under ten seconds, has a legible goal, escalating tension, a strong audiovisual payoff and a fair retry. No hidden failure rules.

### 1 — Road Rally: living push-jam

Mooshak walks a compact street grid and pushes direction-locked handcarts into green side alleys. Cart arrows show allowed movement. The rath approaches on the central road with an amber danger band and real seconds countdown.

The first cart is an untimed teaching move; later carts form short dependency chains; the final cart triggers slow motion, bell, opening gate and crowd chant. Timer movement is delta-time based. Assisted mode slows the rath and highlights the next movable cart without solving it.

### 2 — Modak Catch: thali merge

Position and tilt a thali while sweets fall from balconies. Equal tiers merge Boondi → Besan → Pedha → golden Ukadiche Modak. A clearly spiked husk is the only harmful object. Controlled drops grow into a festival shower. A three-second rim meter warns of spills. Golden merge payoff: hit-stop, rising chime, spark ring and crowd response.

### 3 — Flower Festival: flowing garland maker

Replace generic match-3 with tactile petal flow. Aim coloured petal streams into a circular mould; same-colour contact binds into links. Three links form the road garland. Escalation moves from one nozzle to alternating colours and a counter-steerable wind pulse. Overflow is visible early; bound links physically appear on the street arch.

### 4 — Dhol Utsav: sawal-jawab

D/F/J/K always produce four distinct immediate instruments. The Tasha master plays a short call; the player answers its rhythmic shape. Timing uses the Web Audio clock, never visual frame time. Escalate through 95 BPM teaching, 135 BPM crowd response and a short 175 BPM kallol finale. Perfect downbeats move flags and add gulal; misses lower josh but never mute input.

### 5 — Monsoon Crossing: current-and-buoyancy rescue

Cross moving debris to reach three brass latches that secure the raised road for the rath. Platforms drift in readable vector flow; small supports sink through yellow/orange/red states. A short umbrella glide allows correction, not unlimited flight. Each latch is a checkpoint; falling resets in under three seconds and never erases progress.

### 6 — Rangoli Lightworks: sacred optics

Rotate brass mirrors, prisms and flower-water filters to route one central flame into six rangoli petals. Beams update continuously. The wind countdown begins only after five petals are lit so learning is not rushed. Completion darkens the courtyard for one breath, then ignites all ghat diyas in a travelling wave.

## 6. VFX, lighting and sound language

VFX are layered by meaning:

- **micro:** foot dust, wheel flecks, hover glow, pitch variation;
- **action:** push squash, merge ring, petal trail, drum shockwave, splash arc, beam bloom;
- **chapter:** 50–80 ms hit-stop, camera punch, crowd swell, persistent transformation;
- **finale:** restrained sunset rays, petal field, bells and chant.

Use additive light and particles only to clarify action or celebrate mastery. Never cover hazards, puzzle bounds or prompts. Shake uses trauma decay and obeys reduced-motion settings.

Audio uses ambient, tension and climax stems; repeated SFX detune within ±7%. Dhol/Tasha hits sound immediately. Animalese chirps use per-character pitch ranges. Chant recordings require explicit licence/provenance; until then use an openly licensed source or labelled procedural placeholder.

## 7. Asset policy

Prefer coherent downloaded sprite packs over invented approximations. Every import gets source URL, creator, licence, modifications and exact file list in `ATTRIBUTIONS.md` before integration.

- one consistent 2:1 angle and top-left light direction;
- bottom-centre pivots for people and props;
- readable silhouettes at final size;
- transparent PNG/WebP for interactives;
- no hot-links, uncertain licences or copied commercial art;
- no style mixing within a district unless it is deliberately a mural/poster;
- decorative generated imagery only beside roads/on walls, tagged `scenery-only`.

## 8. Architecture

- Phaser owns world simulation, collisions, cameras, minigames and time-critical effects.
- React owns menus, rules, settings and results.
- A typed EventBus carries chapter start/result and HUD summaries.
- `CityMap` owns topology and walkability.
- `ProcessionRoute` owns the road spline and formation slots.
- `JourneyDirector` owns Roam → Invite → Teach → Play → Resolve → Transform → Advance.
- Each challenge returns one idempotent result with chapter, attempt, medal and stats.
- Completion and environment transformation persist together.

## 9. Build order

1. Freeze this plan and remove conflicting linear-route claims.
2. Stabilise isometric conversion, walkability, camera bounds, free roam and road-only procession.
3. Make chapter discovery intentional; add landmarks, contextual barks and persistent transformations.
4. Finish Road Rally as the clarity/tension/VFX/audio quality bar.
5. Finish Modak Catch to the same bar.
6. Replace Flower Festival with petal-flow simulation.
7. Replace Dhol Utsav with audio-clock sawal-jawab.
8. Replace Monsoon Crossing with vector current and buoyancy.
9. Replace Rangoli Lightworks with mirror/prism raycasting.
10. Rebuild the in-world prologue and authored ghat finale.
11. Complete asset, lighting, sound, accessibility and performance polish.
12. Only then run the full verification pass.

## 10. Final verification gates

Testing happens after the build pass, as requested.

- Mooshak can roam away from the route immediately without pushback.
- Vinayaka and every procession member stay on the authored road through every bend.
- All six games teach their verb and expose fair fail states.
- Each chapter transforms the city and advances the procession exactly once.
- Keyboard, pointer and touch complete the journey.
- Silent play, reduced motion and high contrast preserve essential information.
- No generated/reference scenery JPG is gameplay content.
- TypeScript/build pass and browser console stays clean through start, retry, completion and finale.
- First playthrough target is 12–18 minutes; retry returns to action within three seconds.
- Five fresh-player observations: 4/5 understand each goal, 4/5 finish without developer help, 4/5 replay one chapter voluntarily.

Research basis: current Phaser documentation supports isometric tilemaps and the Arcade/Matter split; narrative-design guidance supports player-reactive barks, goal reinforcement and environmental changes over exposition. Verify every downloaded asset's licence at integration time.
