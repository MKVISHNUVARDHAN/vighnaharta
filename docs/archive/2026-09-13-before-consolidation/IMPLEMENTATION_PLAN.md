# VIGHNAHARTA: PATH OF LIGHT — Production Implementation Plan

> **Historical implementation plan.** The current proposed direction and replacement delivery order are in [the gameplay redesign](docs/GAMEPLAY_REDESIGN.md), especially sections 16–18. Discuss that proposal before resuming gameplay implementation. The older two-minute branching-route plan below is preserved as history and does not describe the proposed six-chapter journey.

## Product promise

Build a polished, replayable 2.5D browser arcade game in which the player guides—not controls or endangers—Lord Ganesha's procession through a living festival city. Every few seconds the player dodges a fair environmental Vighna, reads a junction, chooses risk versus safety, and times the turn to the dhol. The traveled route restores light to the city and resolves into a rangoli during the finale.

## Experience pillars

1. **Immediate agency** — first lane input is requested within five seconds; no long tutorial.
2. **Readable pressure** — three lanes, large warning silhouettes, route labels, and 1–2 second junction decisions.
3. **Rhythmic mastery** — generous survival rules with tighter score/Flow timing windows.
4. **Meaningful routes** — safe, festival, shortcut, and multiplier paths have distinct risks and rewards.
5. **Festival transformation** — roads illuminate behind the procession; rain and blackout turn movement into story.
6. **Replay discovery** — persistent personal bests, alternate routes, hidden rangolis, and an unexplored route map.
7. **Respectful spectacle** — the procession is protected and dignified; all hazards are logistical or environmental.

## Runtime architecture

- React owns loading, menu, HUD, settings, results, and route replay.
- Phaser owns the real-time world, input, camera, particles, procedural audio, and gameplay simulation.
- A typed EventBus carries low-frequency UI updates and gameplay notifications.
- Map, difficulty, scoring, obstacles, and rangoli recipes remain data-driven.
- All moving world objects use bottom-center visual anchors and dynamic Y depth.

## Run structure

| Act | Target window | Mechanics | Visual story |
| --- | ---: | --- | --- |
| Dusk | 0–15s | lane tutorial, first fair barricade | pandal departure, ghat objective |
| City Awakens | 15–35s | junction rhythm, festival route | lamps and shopfronts awaken |
| Vighnas | 35–60s | crowd, construction, closing gates | denser street pressure |
| Monsoon / Blackout | 60–95s | puddles, lightning, reduced visibility | procession relights the city |
| Final Push | 95–120s | fastest hazards, final risk choice | waterfront becomes visible |
| Finale | completion | aerial route reveal | giant illuminated rangoli and celebration |

## Gameplay systems

- Continuous pointer/touch route drawing; release commits a glowing world-space path.
- Fair hazard telegraphing, one valid lane minimum, collision slowdown, precision dodge, and Clutch detection.
- Beat clock with visible pulse and Perfect / Good / Normal outcomes.
- Festival Flow meter; an eight-second empowered state changes speed, music, lighting, particles, and scoring.
- Branching junctions with explicit SAFE / FESTIVAL / SHORTCUT / ×2 route language.
- Seeded authored obstacle layouts for consistent contest and leaderboard runs.
- **World-readable choices:** junctions present Safe, Festival, and Shortcut streets physically in the city. The procession waits for a drawn route and never silently chooses one. Knowledge-based Seva decisions are reserved for three later authored story moments, not repeated modal quizzes.
- Additive scoring with bounded temporary multipliers; no retroactive multiplication.
- Persistent personal best, grade, route history, discoveries, and near-PB messaging.

## Art and presentation

- Art bible: premium handcrafted isometric festival diorama; deep indigo night, warm brass/gold light, marigold and vermilion accents, muted teal shadows, wet-road reflections; soft top-left light; crisp silhouettes.
- Reuse the supplied original procession, devotees, buildings, temple, trees, road, rangoli, and barricade assets where they remain readable.
- Supplement with coherent procedural road ribbons, lane glyphs, pools of light, fog, rain, petals, skyline silhouettes, and interface ornament rather than mixing unrelated art styles.
- Use the procession asset at a dignified readable scale; hazards never overlap the deity visually as an attack.

## UX and accessibility

- Gameplay HUD: score, objective/progress, act, combo, Flow, and contextual decision prompt only.
- Responsive desktop and mobile composition, safe-area insets, landscape suggestion without blocking portrait.
- Reduced motion, high contrast, music/SFX volume, mute, visible shape/icon warnings, pause on visibility loss.
- One-click restart, two-action results hierarchy, and a polished miniature city route view.

## Verification gates

1. TypeScript production build passes.
2. No console errors from load, start, input, restart, results, or route view.
3. First meaningful input prompt appears within five seconds.
4. Every authored hazard has a valid response and a warning.
5. Complete run reaches finale and results without soft-locking.
6. Keyboard and swipe inputs both select lanes/routes.
7. Canvas and HUD remain readable at laptop and mobile viewport sizes.
8. Reduced motion, high contrast, audio controls, persistence, and focus pause work.
9. Final route reveal retains the living city behind it.
10. Assets and licenses are documented in `ATTRIBUTIONS.md`.

## Delivery order

1. Ship and feel-test the 30-second District of First Light vertical slice.
2. Extend the proven drawing loop into the complete branching authored run.
3. Add the pressure loop, banking, weather, blackout, three Seva decisions, and full-city finale.
4. Rebuild UI and route replay around the premium visual language.
5. Integrate all coherent supplied assets and document provenance.
6. Build, browser-test, play through, and tune.
