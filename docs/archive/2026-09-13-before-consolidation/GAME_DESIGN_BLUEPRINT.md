# VIGHNAHARTA: PATH OF LIGHT

> **Historical design — superseded for the next design discussion.** Read [the six-game gameplay redesign](docs/GAMEPLAY_REDESIGN.md) first. The proposal dated 13 September 2026 responds to the current game's road-following, clarity, interactivity, music, and fun problems. The earlier design below is preserved for context; its “lock” language does not authorise implementation of conflicting mechanics.

## Definitive Game Design Blueprint — Pre-production Lock

> Guide the city. Keep the rhythm. Bring every street to life.

This document replaces the current fixed-answer junction-quiz direction. No further production work should begin until the core loop below is treated as the source of truth.

---

## 1. The actual game

The player is the **Festival Route Keeper** for the final Ganesh Chaturthi procession.

The player does not control Lord Ganesha and the procession cannot be harmed. The player draws and repairs the route ahead, keeps turns in rhythm, reacts to fair logistical Vighnas, chooses risk versus safety, and restores light to the city.

The procession moves continuously. The city changes continuously. The player should make a meaningful choice or reaction every two to four seconds.

The run has two simultaneous goals:

1. **Primary goal:** reach the Visarjan Ghat before the Festival Clock ends.
2. **Mastery goal:** arrive with the highest possible score by preserving Flow, visiting festival locations, banking bonuses, taking precision shortcuts, and discovering rangolis.

The emotional payoff is that the route created during play becomes a giant illuminated rangoli in the final aerial reveal.

---

## 2. What the game is not

- Not a multiple-choice quiz with movement between questions.
- Not a passive procession animation.
- Not a three-lane endless runner wearing festival artwork.
- Not a route that advances without player input.
- Not a trivia lesson or a children's educational game.
- Not a game in which one road is always labeled “correct” and the other two are fake choices.
- Not a combat game, and never a game in which Lord Ganesha takes damage.

The current repeated junction questionnaire is removed from the core loop.

---

## 3. The five player rules

The first run teaches only these rules:

1. Keep the procession moving.
2. Drag a route through connected streets ahead of it.
3. Lock turns on the dhol beat to build Flow.
4. Take harder streets for greater rewards.
5. Reach the Visarjan Ghat before the Festival Clock ends.

Every advanced system is a consequence or extension of these rules.

---

## 4. Core controls

### Mobile

- Touch and drag across connected streets to draw the intended route.
- Continue the drag through a junction to choose a branch.
- Drag sideways within the current street to prepare a lane change around a Vighna.
- Release on the beat ring to lock a turn or route section.
- Tap a large world-space prompt only at a Seva Stop or Bank Flow location.

### Desktop

- Mouse drag performs the same route drawing.
- WASD / arrow keys select the highlighted connected street for accessibility.
- Space or Enter locks the highlighted route on the beat.

No tiny gameplay buttons. No separate control scheme for every system.

---

## 5. The thirty-second gameplay loop

```text
READ AHEAD
    ↓
DRAW 1–3 STREETS
    ↓
CHOOSE SAFE / FESTIVAL / RISK ROUTE
    ↓
LOCK THE TURN ON THE DHOL BEAT
    ↓
REACT TO A VIGHNA OR SHORTCUT
    ↓
LIGHT THE STREET + BUILD FLOW
    ↓
BANK OR GAMBLE THE BONUS
    ↺
```

The player is never waiting for an information panel while nothing happens. When the route is safely planned, the player watches the plan execute for at most one or two seconds before the city creates the next decision.

---

## 6. Route drawing and planning horizon

The player sees a readable planning horizon of roughly two or three junctions. Streets beyond it remain atmospheric rather than interactable.

- Dragging paints a thin ivory preview line.
- A valid connected route snaps gently into the road centre and becomes warm gold.
- Unsafe or temporarily closed streets show physical world warnings: moving barricades, marshal gestures, water level, crowd flow, and shape-coded lamps.
- Releasing commits the next route section.
- The procession follows the committed route automatically.
- The player may redraw any section the procession has not yet entered.
- A route cannot pass through buildings or disconnected geometry.

This creates authorship: the player sees that the city is following their plan.

### Rhythm interaction

The beat ring approaches each major junction. Locking the planned turn near the beat creates:

- Normal: route works, no bonus.
- Good: `+25`, small light pulse.
- Perfect: `+100`, petals, stronger drum hit, Flow increase.

A missed beat never ends the run. It costs mastery, not basic accessibility.

---

## 7. Route choices that are genuinely different

There is no universal “correct” branch.

### Direct route

- Short travel time.
- Wide, predictable streets.
- Few rewards.
- Best for recovering a weak run.

### Festival route

- Longer and more populated.
- Contains pandals, offerings, Dhol Gates, rangoli nodes, and Flow banks.
- Greater score potential but more dynamic congestion.

### Precision shortcut

- Appears for a short window.
- Narrow, fast, and visually enclosed.
- Requires an accurate committed path.
- Saves time and awards `THREAD THE NEEDLE`.

### Risk Gate route

- Contains ×2, ×3, or rare ×5 gates.
- Multiplier applies only to the next section or current unbanked bonus.
- Stronger Vighnas and tighter rhythm windows.

The interesting question is not “Which answer does the designer want?” It is “What risk can I handle in the current state of my run?”

---

## 8. Vighnas: what happens and what the player does

Every Vighna has four states:

1. **Tell:** world animation and sound announce the problem.
2. **Read:** at least one safe response is visible.
3. **React:** the player redraws, changes lane, waits briefly, or commits a shortcut.
4. **Consequence:** success or failure changes time, Flow, score, and city behavior.

| Vighna | Telegraph | Player response | Successful result | Failure result |
| --- | --- | --- | --- | --- |
| Barricade closing | marshal whistle, striped gate moving | redraw around it or take timed shortcut | Clutch if it closes behind | two-second halt, Flow reset, reroute |
| Crowd surge | crowd silhouettes and flags move toward road | use open lane or alternate street | precision dodge / cheers | slowdown and lost unbanked bonus |
| Monsoon flooding | ripples and rising reflective water | choose elevated road or exit early | saved time / wet-road bonus | street becomes unusable; backtrack |
| One-way crowd flow | moving arrows made from lanterns and marshal gestures | travel with the flow | speed boost | route rejected before entry |
| Gate closure | visible countdown pulses on arch | commit now, wait, or detour | Thread the Needle | time loss, not damage |
| Power fluctuation | lights flicker in a district | follow diya and volunteer signals | restores district lights | visibility narrows and Flow decays |
| Pandal traffic | crowd density visibly grows | bank Flow, take slower festival route, or bypass | reward node / bank | extra travel time |
| Shortcut opening | shutters lift and green lamp appears | quickly redraw through it | time saved and score | it closes; original route remains valid |

No random unavoidable event may spawn immediately in front of the procession.

---

## 9. Mistakes, wrong paths, and recovery

There is no traditional death screen.

### Minor mistake

Examples: late rhythm input or non-optimal lane.

- Lose some Flow.
- Lose part of the potential bonus.
- Continue immediately.

### Vighna collision or route stall

The procession stops safely before the obstruction.

- `FIND ANOTHER WAY` appears in the world.
- Festival Clock loses two or three seconds.
- Combo resets.
- 20–30% of unbanked points are lost.
- Player redraws from the last clear junction.

### Wrong or impossible path

A road is never secretly wrong. The world must show why it is becoming impossible.

- If the player ignores warnings and commits anyway, the procession reaches a safe holding point.
- Camera pans back to the last junction as the planned line retracts.
- The player redraws the route.
- Backtracking costs time and unbanked score.
- Previously banked points are protected.

This creates a real consequence without disrespect, arbitrary punishment, or a full restart.

---

## 10. Flow and score strategy

### Festival Flow

Flow is a circular rangoli around the score, never a generic rectangular energy bar.

Earn Flow through:

- Perfect turns.
- Continuous movement.
- Precision reroutes.
- Shortcuts.
- Clutches.
- Good Seva decisions.

At 100%, eight seconds of Festival Flow activates:

- ×2 section scoring.
- Full percussion layer.
- Gold route edges and faster illumination.
- More responsive crowds and balconies.
- Petal stream and subtle camera energy.
- Slightly faster route execution.

### Combo banking

Perfect actions create **unbanked celebration points**.

At selected pandals the player chooses:

- Bank now: secure points, reduce multiplier.
- Keep Flow: preserve the multiplier and risk losing a percentage at the next mistake.

This is the main high-score tension. A cautious player finishes reliably; a leaderboard player carries a dangerous large unbanked bonus.

---

## 11. Useful questions without ruining the game

Questions become optional **Seva Decisions** at only three authored moments. They are short, contextual, practical, and visible in the world. The procession slows but does not become a questionnaire screen.

Each Seva Stop presents an animated situation, not trivia. The player chooses an action in three to four seconds. The result changes NPC behavior and grants a gameplay effect.

### Seva Stop 1 — Emergency access

An ambulance light appears behind a dense crowd.

Prompt: **How should the route keeper protect emergency access?**

- Create a clear side corridor. **Best:** volunteers open the lane; gain a Flow Shield.
- Stop in the centre. Causes a delay.
- Send the procession faster. Increases congestion.

Useful lesson: public celebrations must preserve emergency access.

### Seva Stop 2 — Sudden monsoon near electrical decoration

Prompt: **What should volunteers secure first?**

- Raise and isolate electrical connections. **Best:** blackout duration is reduced.
- Add more decorative lights. Wastes time.
- Move crowds under the wiring. Unsafe and creates a reroute.

Useful lesson: electrical safety during rain.

### Seva Stop 3 — Ghat stewardship

Flower and offering collection points appear near the waterfront.

Prompt: **Where should natural offerings be guided?**

- Marked collection/compost station. **Best:** unlock Clean Ghat bonus and final rangoli petal.
- Mixed roadside waste pile. Loses style score.
- Leave them in the traffic lane. Creates congestion.

Useful lesson: responsible festival waste handling.

### Seva design rules

- Never ask dates, definitions, or textbook trivia.
- Never use a modal that covers the city.
- The best answer produces an immediate visible world improvement.
- A weaker answer creates a recoverable logistical consequence, not moral scolding.
- Questions do not repeat every junction.
- Seva Stops together occupy less than fifteen seconds of a three-minute run.

---

## 12. NPC plan

NPCs are gameplay communication, not background noise.

### Procession group

- Lead route marshal: points toward committed route and reacts to warnings.
- Dhol players: visually mark the beat and increase animation with Flow.
- Lamp bearers: define the safe illuminated radius during blackout.
- Flower carriers: generate petals only for strong actions.
- Volunteers: open corridors, bank Flow, and resolve Seva outcomes.
- Procession platform: dignified focal point, always protected and never a collision body.

### City NPCs

- Balcony residents: appear and light lamps as streets awaken.
- Vendors: close awnings in rain and create readable market congestion.
- Families and crowd clusters: move in authored flows and create lane pressure.
- Traffic marshals/police volunteers: telegraph road closures using gestures and lantern shapes.
- Pandal stewards: operate Bank Flow and Seva Stops.
- Emergency vehicle: used once for the emergency-access Seva event.
- Ghat volunteers: guide the final approach and eco-stewardship decision.

NPCs react to the player's performance:

- High Flow: cheering, synchronized flags, faster diya lighting.
- Mistake: concerned pause, marshal redirects, music thins.
- Blackout: residents light lamps progressively behind the route.
- Finale: all previously visited districts participate in the reveal.

---

## 13. First-run timeline

### 0:00–0:10 — Before the first beat

- Dark city ambience.
- Diyas illuminate one by one.
- Camera reveals the procession and distant ghat.
- `TAP TO BEGIN`.

### 0:10–0:25 — Learn by doing

- `DRAG A PATH` appears inside the first street.
- Player draws through one junction.
- Large forgiving beat ring teaches the first Perfect.
- First street illuminates behind the procession.

### 0:25–0:55 — City awakens

- Route horizon expands to three junctions.
- Direct and festival branches become readable through physical design.
- First simple crowd Vighna.
- First optional Dhol Gate.

### 0:55–1:15 — First surprise

- Three subtle rangoli nodes become available.
- Completing them triggers a sub-one-second aerial reveal.
- First Bank Flow decision.

### 1:15–1:45 — Pressure

- Barricade, shortcut window, and crowd direction interact.
- First Seva Stop occurs as a natural city event.
- A possible Clutch establishes memorable stakes.

### 1:45–2:15 — Monsoon and blackout

- Rain changes road availability.
- Electrical-safety Seva decision.
- Power fails; HUD recedes.
- Player relights streets through movement.

### 2:15–2:45 — Final push

- Rain clears.
- Music rebuilds.
- Safe finish versus final high-value rangoli route.
- Ghat stewardship Seva choice.

### 2:45–3:00 — Payoff

- Arrival, quiet pause, aerial camera lift.
- Full route forms giant rangoli.
- `GANPATI BAPPA MORYA`.
- Living-city results screen and immediate Run Again.

---

## 14. Scoring clarity

Every reward appears at its world location and immediately joins either banked or unbanked score.

| Action | Value |
| --- | ---: |
| Clear junction | +100 |
| Good turn | +25 |
| Perfect turn | +100 |
| Offering location | +250 |
| Dhol Gate | +400 |
| Precision shortcut | +350 plus time saved |
| Clutch | +750 |
| Rangoli | +2,500 |
| Hidden rangoli | +5,000 |
| Seva decision | visible gameplay benefit plus style bonus |
| Backtrack | time loss plus 20–30% unbanked loss |

Final score communicates four sources:

```text
SPEED + SKILL + STYLE + COURAGE
```

Results must show how many points came from each source and one actionable improvement hint.

---

## 15. City and art direction

### Locked art bible

**Premium stylized 2.5D isometric Indian festival city; contemporary urban architecture; sophisticated indie-game rendering; deep indigo/navy shadows; warm diya gold, marigold, controlled vermilion, ivory, muted teal; wet asphalt reflections; crisp silhouettes; soft top-left cinematic light; subtle ambient occlusion and haze; culturally respectful; readable at mobile game scale.**

Every generated asset prompt must include this exact style description plus:

`isometric perspective, 2.5D, orthographic, top-down isometric view, isolated on bright plain white background, clean silhouette, light from top-left, no perspective vanishing point, no cast ground shadow`

### Asset policy

Existing assets are references, not an obligation. An asset is used only if it matches the locked perspective, scale, palette, and material style. Inconsistent assets must be regenerated rather than forced into the scene.

### Required coherent asset families

1. Modular three-lane road tiles: straight, bend, T, four-way, bridge, alley, ghat approach.
2. Wet-road overlays: dry, damp, rain, shallow flood.
3. Festival structures: arch, pandal, Dhol Gate, multiplier gate, Bank Flow pavilion.
4. Contemporary buildings: homes, shops, balconies, temple frontage, market stalls.
5. Gameplay props: barricades, carts, cones, lantern arrows, diya lines, waste station.
6. NPC sets: procession roles, crowds, marshals, vendors, residents, ghat volunteers.
7. VFX: route brush, light propagation, petals, rain, lightning, fog, rangoli geometry.
8. Finale city plate and route-compatible aerial rangoli overlay.

All sprites use bottom-centre pivots and metadata for Y-sorting. Terrain uses a strict 2:1 dimetric grid. No freehand guessed road angles.

---

## 16. Audio plan

- 124 BPM master grid.
- Six synchronized adaptive stems: ambience, dhol, tasha, bells, bass, cinematic melody.
- Flow adds layers rather than simply increasing volume.
- Blackout removes layers to rain, pulse, and distant dhol.
- Final push restores stems one at a time.
- Original composition only; no devotional melody sampling and no chants.

Every important input has a micro-sound: route brush, snap, beat lock, Flow rise, bank, shortcut, warning, Clutch, rangoli, and PB.

---

## 17. Technical architecture

- Phaser owns the world, route graph, path preview, entity movement, NPC behavior, audio clock, cameras, weather, lighting, and particles.
- React owns loading, menu, settings, results, and route replay only.
- Zustand holds persistent settings and personal bests.
- EventBus carries low-frequency state across Phaser and React.
- Map data stores a Cartesian road graph; rendering converts it using strict 2:1 isometric projection.
- Every moving entity is bottom-centre anchored and dynamically Y-sorted.
- Object pools handle crowds, petals, rain, and temporary props.

The current screen-space hand-drawn road ribbons must be replaced. They cannot deliver a convincing isometric city.

---

## 18. Production sequence and gates

### Phase A — Core-feel vertical slice

Build one thirty-second district with:

- route drawing,
- continuous procession,
- one beat-locked junction,
- one fair barricade reroute,
- one shortcut,
- one Flow activation,
- real modular isometric road art.

Do not build the full city until this slice is fun with placeholder NPCs.

**Gate:** five new players understand the objective and draw a route within five seconds without verbal explanation. At least three voluntarily replay the slice.

### Phase B — Consequence and strategy

- Backtracking and unbanked loss.
- Bank Flow.
- Risk gates.
- Personal-best ghost.
- First hidden rangoli.

**Gate:** players can explain why their score changed and can name one choice they would change next run.

### Phase C — Living city

- NPC roles and reactions.
- City illumination propagation.
- Pandal and festival locations.
- Three Seva Stops.

**Gate:** observers can understand at least two Vighnas from world animation without reading UI text.

### Phase D — Story transformation

- Monsoon.
- Blackout.
- Final push.
- Ghat approach.
- Aerial rangoli finale.

**Gate:** first-time players identify blackout and finale as memorable peaks rather than cutscenes.

### Phase E — Competition polish

- Adaptive original audio.
- Mobile performance and touch tuning.
- Accessibility.
- Results and route viewer.
- Browser QA and demo capture.

---

## 19. Non-negotiable playtest questions

1. Can the player state the goal after five seconds?
2. Do they draw a valid route without being told where to click?
3. Does the procession ever move without a committed player route?
4. Can they predict what a Vighna will do before it blocks them?
5. Does every failure feel attributable and recoverable?
6. Do they understand banked versus unbanked score?
7. Do they notice a difference between safe, festival, and risk routes?
8. Does Festival Flow change the feeling of play, not merely the HUD?
9. Are Seva decisions useful, brief, and integrated into the city?
10. Do they want to press Run Again, and can they say what they will attempt differently?

If these fail, additional polish or content is not allowed to hide the problem. Fix the loop first.

---

## 20. Final design decision

The game is a **continuous isometric route-drawing arcade strategy game with rhythm mastery and a living festival city**.

The core pleasure is:

```text
I planned that path.
The city challenged it.
I saved the procession at the last moment.
The street came alive because of me.
I can make a better, more beautiful route next time.
```

Seva questions support that fantasy three times per run. They do not replace it.
