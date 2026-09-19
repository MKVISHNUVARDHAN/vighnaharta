# Vighnaharta — six games worth playing

Design proposal for discussion · Revised 13 September 2026 after user feedback · No gameplay implementation in this revision

## 1. Recommendation

Build one festival adventure with six distinct arcade chapters. You play Mooshak and help the city bring Ganesha's procession to the nimarjanam ghat. Each chapter teaches one clear action, develops it, delivers a satisfying climax, and changes the actual city. The procession, helpers, music, decorations, and completed work persist between chapters.

The recommended six are **Road Rally → Modak Catch → Flower Festival → Dhol Utsav → Monsoon Crossing → Rangoli Lightworks**. Finish with an interactive, dignified farewell. Replace the mandatory quiz with action; retain festival facts as optional conversations. This first-game replacement is a proposal to discuss, since the strongest reported dissatisfaction concerns games 2–6.

“Maximum fun” is a design goal to validate with players, not something research or a polished document can certify. All durations, thresholds, physics values, and budgets below are prototype starting points. Promote them to production values only after playtesting.

This is the canonical detailed gameplay design. The root blueprint and implementation plan now link to this version. User-directed flower match-3, audible letter instruments, and modular reactive scenes are recorded requirements; numerical tuning and remaining discussion items are still provisional. See [asset production](ASSET_PRODUCTION.md) for the tool-to-runtime workflow and [implementation order](../IMPLEMENTATION_PLAN.md) for delivery gates.

## 2. What the current project actually does

Evidence: source inspection of `src/game/scenes/GameScene.ts`, `src/game/entities/Procession.ts`, `src/ui/components/ChallengeLayer.tsx`, `src/game/systems/AudioSystem.ts`, and `src/game/scenes/FinaleScene.ts`; visual inspection of `public/assets/festival-journey-map.png`. No live playthrough, audio listening test, performance measurement, or browser error reproduction was performed in this design pass. Reported errors remain to be reproduced during implementation.

| Finding | Evidence and consequence | Design response |
| --- | --- | --- |
| Painted scenery is doing the work of a game world | `buildWorld()` displays a complete festival map and mirrored copies. The image already includes people, drums, boats, lights, and roads. Those painted objects cannot respond independently. | Use the painting as art direction; build foreground roads, NPCs, props, and water as separate world objects. |
| Road appearance and movement are unrelated | `PROCESSION_POINTS` is a handwritten polyline; Mooshak has world-bound collision and direct movement toward clicks. No road corridor is enforced by those movement methods. | A shared authored road definition must drive visible road, navigation, collision, formation width, and stage arrivals. |
| Crew can leave the road | Followers occupy fixed screen-space offsets inside one moving container. Offsets do not follow earlier positions around a bend. | Each follower travels along the route at an individual trailing distance with width-constrained lanes. |
| Walking looks like floating stickers | Mooshak scales/tilts an image; followers bob and rotate whole images. | Directional locomotion, planted contact points, turn anticipation, and separate instrument/cloth animation. |
| Games interrupt the world | Dialogue, rules, and games appear in successive React panels; scenery has little causal connection to individual actions. | Frame each playable arena in its district, retain the living world, and show objectives changing as you act. |
| Game 2 promises a different action | Rules say catch, while the implementation uses pointer hits/swipes on CSS-animated emoji objects; it advertises a time-adding diya without spawning one. | One consistent catch verb, physical trajectories, swept hit detection, and only implemented item types in the rules. |
| Game 3 is internally inconsistent | Intro says weave 18 flowers; `MatchGame` checks 25 (15 assisted). Board replacement is immediate; only one match-resolution pass is performed; initialization does not guarantee a legal move. | Rebuild as complete flower match-3 with special combinations, animated cascades, a concrete arch objective, and validated boards. |
| Game 4 is a memory test | `RhythmGame` validates input order without measuring timing. It requires testing four keys and then watching phrases; identical dhol events obscure distinctions. | Four audible letter/instrument pads, visible note lanes and strike line, one audio clock, and continuous timing feedback. |
| Game 5 has limited motion | The current 7×5 maze uses static walls and puddles; movement changes grid positions. | Moving carts/platforms, telegraphed crossing windows, safe islands, and animated hop/landing physics. |
| Game 6 has little decision-making | Six fixed anchors accept proximity; the canvas redraws in response to drawing/state changes. | A small routing puzzle with visible travelling light and meaningful intersections. |
| Results can contradict objectives | Several timeout branches grant Gold for partial completion. | Complete, Assisted, and Retry must describe the actual outcome. Never silently convert a failed objective into Gold. |
| Music may feel mechanical or inconsistent | Festival accompaniment is synthesized from an interval firing every 310 ms and scheduling at the current audio time. | Authored phrases and stems, advance scheduling, separate buses, and a shared rhythm clock. Audit existing settings wiring. |
| Ending does not show the journey's outcome | `GameScene` passes an empty `paths` array; `FinaleScene` reveals a background, petals, and text. | Carry actual district states, route, cast, and rangoli into a staged ghat arrival and farewell. |

The old README calls this a tested production release while the code and design documents disagree. Those claims should not be used as evidence of readiness.

## 3. Research and the choices it informs

These references establish useful patterns; the proposed festival adaptations and numerical rules are our own design judgments. No referenced commercial game was cloned or imported.

| Reference | Observed pattern | Proposed use |
| --- | --- | --- |
| [Fruit Ninja Classic — Halfbrick](https://www.halfbrick.com/games/fruit-ninja-classic) | A quickly understood target/avoid gesture rule. | Modak Catch uses readable airborne targets and satisfying swipes, with intact offerings arriving in trays. |
| [Candy Crush special combinations — official support](https://candycrush.zendesk.com/hc/en-us/articles/211939685-Creating-and-combining-Special-Candies) | Larger matches create special pieces, which can combine for stronger effects. | Flower Festival follows the requested adjacent-swap match-3 direction, with flower specials, complete cascades, and real arch decoration. |
| [Taiko no Tatsujin — official how to play](https://taiko.namco-ch.net/taiko/en/howto/) | Scrolling notes, distinguishable hit types, and an explicit clear gauge. | Dhol Utsav replaces hidden memory with readable rhythmic performance. |
| [Crossy Road — official site](https://www.crossyroad.com/) | The developer presents a compact arcade hopping game. | Monsoon Crossing explores discrete commitment, moving lanes, and short recovery. These detailed rules are our proposal, not claims from the site. |
| [Flow Free — Big Duck Games](https://www.bigduckgames.com/flowfree) | Connecting matching endpoints under spatial constraints. | Rangoli Lightworks uses shape-marked endpoints and routing; it does not require covering every tile. |

Candidate choices were judged on immediate understanding, tactile response, skill beyond tapping, contrast with neighbouring chapters, a visible festival consequence, and feasibility in the existing web engine. User revision: game 3 must retain the Candy Crush-style flower match-3 idea. Its weak implementation, incomplete cascades, and limited feedback are the problems to fix. Game 4 uses four audible letter pads with visible timing rather than a memory test. Games 5 and 6 need tactile payoffs and meaningful choices, not only more visual effects.

### Code and asset shortlist

| Source | Appropriate reuse | Decision and limitations |
| --- | --- | --- |
| [Phaser examples repository](https://github.com/phaserjs/examples) and [version 3 examples](https://phaser.io/examples/v3/) | Small examples for particles, cameras, input, collision, and paths. | Preferred technical reference. Repository code is MIT; its assets explicitly are not covered for commercial reuse. The examples repository now mentions a Phaser 4 default: pin a Phaser 3-compatible example/version for this project's 3.87 setup. |
| Existing flower match-3 code | Retain flower theme and study the adjacency/match routines; rebuild resolution as an explicit animation/state pipeline. | Bubble-shooter reuse is no longer relevant. Validate legal moves, special creation, complete cascades, and seeded refill rather than importing an unrelated game. |
| [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) | Candidate impacts for wood, baskets, and interface experiments. | Check the downloaded pack's license and record provenance before shipping. Audition for style; generic impacts will not supply convincing festival percussion. |
| Existing supplied individual PNGs | Scale/silhouette prototypes and visual direction. | Keep only assets that can be separated, anchored, and made consistent. Single poses do not constitute animation sets. |
| Built-in image generation plus Phaser animation; original or rights-cleared audio | Reference-based character/prop artwork, directional poses and separate parts; independently sourced percussion and music. | Follow [asset production](ASSET_PRODUCTION.md). Image generation supplies raster art; Phaser supplies behaviour; Web Audio plays suitable recordings or synthesis. No generation or purchases occurred in this documentation phase. |

Technical references: [Glenn Fiedler on fixed timesteps](https://gafferongames.com/post/fix_your_timestep/) informs stable physics; [Chris Wilson's audio scheduling article](https://web.dev/articles/audio-scheduling) informs scheduling against audio time. Neither substitutes for tests on target devices.

## 4. Whole-journey flow

Target first completion: **8–10 minutes**, allowing learning and a retry. A clean run contains roughly 6–7 minutes of challenge play plus transitions and farewell. Standard mode has local challenge pressure but no global countdown that destroys progress. Optional timed replay comes after the core experience works.

| Order | Place / game | Target active time | Player feeling | Persistent result |
| --- | --- | ---: | --- | --- |
| 1 | Welcome Street / Road Rally | 45–60 s | I can move; I am helping | Gate opens, stewards join |
| 2 | Modak Market / Modak Catch | 50 s | I can catch a whole beautiful arc | Offering trays fill and roll into the procession |
| 3 | Garland Bazaar / Flower Festival | 60–90 s | That special flower started a huge cascade | Three arch sections bloom |
| 4 | Dhol Chowk / Dhol Utsav | 60 s | I am playing with the band | Dhol/tasha ensemble joins the route |
| 5 | Monsoon Approach / Monsoon Crossing | 60–90 s | I made that crossing | Volunteers secure the ghat access |
| 6 | Ghat Courtyard / Rangoli Lightworks | 60–90 s | I connected the whole festival | Six light petals illuminate the farewell courtyard |
| Finale | Nimarjanam ghat | 25–35 s | We brought everyone here | The completed city's lights and helpers frame the farewell |

World layout: a single winding main road connects all six stops in order. Chapter arenas sit in widened plazas or service areas beside that road. Only Mooshak uses the temporary crossing/service route in game 5. The shrine and procession use the secured main road throughout. The actual immersion area is downstream of the courtyard, not a temple substituted for a ghat.

Transition contract: finish objective → show its physical result for 1–2 seconds → leave a small medal badge → travel 4–6 seconds along the visible road → frame the next arena over 0.6–0.9 seconds → demonstrate one action → give control. First-time teaching is interactive and at most 8 seconds; repeat visits skip it. Dialogue is one optional subtitled line. Essential instructions remain in the world.

Travel includes optional waving or petal collection without blocking progression. Do not invent another compulsory control scheme between six games. The first act begins within five seconds of Start. Retry returns to the current chapter in two seconds or less, without replaying dialogue.

### Shared rules and scoring

- Each chapter has one primary objective visible throughout. Remaining shots, time, or crossings occupy the second HUD slot. Score/combo is secondary; show no more than three prominent numbers.
- Source objective wording, counters, assists, and completion checks from the same definition.
- Completing the actual objective earns Bronze or better. Each chapter defines Silver and Gold below. Assisted completion is labelled Assisted and excluded from unassisted bests.
- After two failed attempts, offer a specific assist and state its effect before restarting. Never apply it silently. Also permit chapter practice from the menu.
- A bad action causes a small, explained loss, short recovery, or another attempt. The shrine cannot be damaged or used as a collision target.
- Standard progression saves after each chapter. Reload resumes at its next entrance. Mid-challenge reload restarts that challenge with saved prior chapters intact.
- Compare scores within the same chapter, mode, assist setting, and layout seed. Journey mastery can sum Bronze=1, Silver=2, Gold=3 across six chapters; Assisted contributes completion but zero mastery. Completion and mastery are separate displays.
- Pause freezes scoring, challenge simulation, and timers. Resume has a brief count-in for action/rhythm. Hidden-tab time never consumes a run.

## 5. Game 1 — Road Rally

**One-line instruction:** “Steer around the carts. Hop the puddles. Reach the welcome bell.”

An approachable road runner establishes Mooshak, road boundaries, and the waiting crew. Aaji Meera rings the starting bell from the pavement. Mooshak auto-runs along a 45–60 second authored service lane ahead of the procession; steering is lateral relative to the road. The shrine waits until the lane is ready.

- **Controls:** left/right or A/D to steer; Space to hop. Touch: drag sideways in a bottom control area and tap a separate large Hop button. Mouse: move an on-road target laterally and click Hop. Do not overload the same gesture with jump and steering.
- **Loop:** read a cart/puddle → choose a gap or hop → land/collect petals → read the next arrangement. Optional petal lines suggest routes but never obscure hazards.
- **Physics:** three road-relative lane centres with a 140–180 ms transition; transition occupancy is real. Hop lasts about 420 ms with a separate vertical height and ground shadow. Only low puddles are hoppable; tall carts have a clear silhouette. Keyboard repeats cannot trigger several hops; buffer one hop for up to 100 ms before landing.
- **Pacing:** first 10 seconds teach an empty steer and harmless hop. Next 20 seconds combine two choices. Final section gives a generous curved-road run and bell finish. A gap is reachable with the player's actual movement time plus 250 ms margin; no unavoidable full-width blockage.
- **Consequence:** cart contact costs one of three stamina pips, briefly slows Mooshak, and resets the chain; 800 ms protection prevents repeated penalties from the same overlap. Zero pips restarts this chapter. Successful finish rings the bell and stewards pull the barriers aside.
- **Mastery:** Bronze finish; Silver finish with at most one contact; Gold zero contacts and at least 80% of the authored optional petals. Extra petals must remain compatible with a safe route. Assist reduces travel speed 20% and removes one hazard from dense arrangements; targets remain honest.
- **Camera/feedback:** fixed isometric orientation with at least 1.5 seconds of visible road ahead. Feet animate by distance, ears/tail lag behind turns, landing produces a small dust ring. Cart wheels and stewards respond to passage. The “wow” is the first gate opening and a correctly turning crew following the same cleared road.

Do not introduce dash, slide, aiming, traffic signals, or simultaneous rhythm checks here. If the user wants the quiz retained, put a short optional festival conversation before the rally rather than replacing its action time.

## 6. Game 2 — Modak Catch

**One-line instruction:** “Swipe through the sweets to catch them. Leave the spiky husks.”

Madhav's preparation stall launches intact sweets in readable arcs above a broad cloth tray. The swipe is a catching ribbon; captured offerings curve gently into baskets. Nothing is sliced or destroyed.

- **Controls:** press-drag-release on mouse/touch. Keyboard alternative moves a visible catching hoop with arrows; hold Space to catch touched sweets. Tune the hoop for comparable achievable results and separate bests if equivalence cannot be achieved.
- **Goal:** bank 30 offering units in 50 seconds. Normal modak/laddu gives 1; a distinctly shaped golden modak gives 3. Reaching the goal fills the required tray; remaining seconds become an optional celebration wave, skippable without losing completion.
- **Loop:** see an incoming wave → position → sweep several safe sweets → avoid a husk → see the tray fill. Early waves contain only sweets; later mixed waves preserve clear separation. Limit to eight airborne objects at once in the first version.
- **Physics:** projectile positions use velocity and gravity, with 1.3–1.8 second readable flight arcs. Test the complete pointer segment against swept object circles, so fast swipes cannot skip targets. Each object scores once. Visual spin and shadows reflect motion; flight bounds respect HUD and finger occlusion.
- **Risk/reward:** catching 3+ in one held stroke within 700 ms earns a chain bonus to mastery score; every offering still contributes its stated tray units. A spiky husk ends that stroke's bonus and gives a dull cloth deflection, without removing already banked offerings. Missing a sweet loses only its opportunity. No exploding bomb near the shrine.
- **Pacing:** singles → paired arcs → crossing safe fans → mixed waves → a final clearly telegraphed golden fan. Wave layouts are authored and seeded. Fairness uses the swept catching area, not merely distance between object centres.
- **Mastery:** Bronze 30 units; Silver reaches the goal with a chain of at least 3; Gold reaches it with a chain of at least 5 and no husk hits. The chapter resolves as soon as the tray reaches 30, so players never wait after completing the objective. Failure below 30 offers retry. Assist extends to 65 seconds and removes mixed husk waves.
- **Camera/feedback:** close, stable three-quarter stall view; apron and NPC behind the play field, not over it. Catch = ribbon tension, soft basket tap, visible deposit; combo = a rising three-note accent. Filled trays become separate carts in the next travel segment. The final fan turns into a shower of intact offerings landing in baskets.

## 7. Game 3 — Flower Festival

**User direction:** Candy Crush-style flower swapping, special pieces, combinations, and satisfying cascades.

**One-line instruction:** “Swap neighbouring flowers. Make big matches. Fill the three garlands.”

Sakhi Tara's flower table becomes a 6×6 board with five unmistakable flower silhouettes. The board is framed by baskets, hands, thread spools, and the actual arch being decorated. The view stays stable during swaps; flower animations and the changing arch supply the spectacle.

- **Controls:** drag a flower one cell or tap two adjacent flowers. Keyboard arrows move focus; Enter selects then confirms an adjacent swap. Invalid swaps visibly return and do not consume a move. Diagonal swaps are invalid. Lock new swaps during resolution, while keeping pause available.
- **Goal:** collect 15 marigolds, 15 roses, and 15 jasmine in 22 valid moves. Three shape-labelled baskets show exact remaining quantities. Every cleared flower of a target type contributes once, including cascades and specials; extra flowers still contribute score. These are initial tuning values, to validate against authored boards and refill seeds.
- **Basic rules:** a line of 3+ matching types clears. Gravity drops pieces into empty cells; new pieces fall from above; resolve all new matches until the board is stable. No initial accidental matches. Guarantee at least one legal move after resolution; if none exists, reshuffle without spending a move and preserve specials and collected objectives.
- **Four in a row:** create a Garland Sweep at the moved flower's destination, with arrows showing its horizontal clearing direction. Four in a column produces the vertical version. Matching the special later clears its full indicated line.
- **T/L of five or more:** create a Bloom Burst that clears its own 3×3 neighbourhood when activated. Show its radius before the burst.
- **Five in a straight line:** create a Rainbow Lotus. Swap with an ordinary flower to collect every flower of that type. The lotus is not assigned an ordinary colour.
- **Creation precedence:** five-line Lotus, then T/L Burst, then four-line Sweep. Overlapping runs create one highest-priority special per connected match component. Use the moved destination when eligible, otherwise a deterministic matched cell; cascades use a deterministic lowest-row/leftmost tie-break. Do not activate a newly created special as part of the same clear that created it.
- **Special combinations:** swapping two specials always consumes one valid move. Sweep+Sweep clears a row and column through the destination; Sweep+Burst clears three rows and three columns; Burst+Burst clears a 5×5 area; Lotus+ordinary clears that type; Lotus+Sweep/Burst converts ordinary flowers of the partner's type into that special and activates them; Lotus+Lotus clears all pieces. Chain reactions queue each piece once and count each removed flower once. Rules are original implementation choices inspired by familiar match-3 play.
- **Satisfaction sequence:** 120 ms swap → 80 ms anticipation → blossom opening/clear → staggered fall, typically 180–300 ms → soft landing bounce → next cascade. Each cascade raises a short musical accent within a bounded range. A thread ribbon carries collected flowers into the matching real basket, and the arch visibly weaves as each basket fills. Never replace the whole board instantly or obscure it with large praise text.
- **Choices:** take an immediate target match, build a special, combine specials, or clear low on the board to invite a cascade. Target flowers receive subtle basket markers; ordinary flower shapes remain readable underneath. Hints after six idle seconds suggest a legal swap without performing it.
- **Pacing:** first authored swap demonstrates a match; the next opening presents an achievable four-match. At least one special combination should be realistically available in the first journey board. Use several validated board/refill seeds for replay; do not secretly rig a struggling player's refill while presenting it as ordinary play.
- **Mastery:** Bronze all three baskets filled in 22 moves; Silver at least four moves remain; Gold at least seven remain and a special combination used. Validate medal reachability per scored seed. Remaining moves may animate a short skippable flower celebration, but it cannot alter objective success or medal classification. Assist gives five extra moves and is labelled before play. Unfilled baskets mean retry, never hidden Gold.
- **Payoff:** all three finished garlands are lifted into the street arch by animated NPCs. Loose petals settle, cloth swings, and the procession passes beneath the arch just completed by the player.

## 8. Game 4 — Dhol Utsav

**User direction:** every displayed letter must audibly play its own instrument. A key press is a real musical action, even outside the scoring window.

**One-line instruction:** “Press the matching letter when its note reaches the line. Every letter plays a sound.”

Four stable vertical lanes carry large D, F, J, K notes toward one shared horizontal strike line. Four matching pads sit directly below. Each pad also has a distinct shape and instrument illustration. The background shows the same four musicians responding to the player's hits.

| Letter / touch pad | Instrument and syllable | Immediate visible response |
| --- | --- | --- |
| D | Deep dhol bass, DUM | Bass-side mallet strike and drum-skin movement |
| F | Dhol rim, TAK | Rim-side stick snap and narrow ring |
| J | Tasha, TIR | Small-drum stick rebound and bright short accent |
| K | Manjira, TING | Cymbals close, ring, and separate |

- **Controls:** physical D/F/J/K or the matching large touch/click pads. The letters and sounds remain identical in tutorial, performance, and free play. Ignore keyboard autorepeat. Each genuine keydown produces exactly one instrument strike immediately; release rearms it. Brief retrigger overlap is allowed for rolls, within a bounded voice pool.
- **Sound contract:** on input, play the selected instrument immediately, regardless of correct, early, late, or wrong-lane judgment. Never defer the actual player sound to the nearest beat, replace it with a generic success beep, or mute a mistimed performance. Scoring feedback is a separate quiet visual cue. Explicit global mute still applies.
- **Music contract:** an original melodic/accompaniment track plays throughout the performance. Leave musical space for the four playable percussion parts; do not double every playable note automatically in the backing track. Free play supports playing the four instruments over a backing loop without grades. Audio clips/recordings need convincing distinct timbres and rights, not four pitches of one generic click.
- **Tutorial:** invite one press of each letter with no timer, showing and sounding the actual instrument; then teach a short two-lane phrase. After a four-beat count-in, the full song starts. Upcoming notes stay visible; there is no hidden sequence to remember.
- **Chart:** 60 seconds at an initial 100 BPM, 48 authored scored notes. First 16 use D/F; next 16 introduce J; final 16 add K and generously spaced eighth-note pairs. No mandatory simultaneous hits or held notes on the first chart. Show at least two seconds of note approach. Never speed the chart up because the player has a combo.
- **Timing:** map input timestamps to the master audio timeline. Starting windows: Perfect ±70 ms, Good ±140 ms. Judge at most the nearest eligible note in that input's lane. Wrong-lane presses sound but cannot consume a different lane's note; a passed note counts once as Miss. Off-chart presses earn no score and reset the combo during scored performance, so mashing is not rewarded. Practice/free play has no such penalty.
- **Goal:** at least 29/48 notes Good or Perfect. Bronze 29; Silver 39; Gold 44 including at least 30 Perfect. The song continues through misses. Retry begins with a count-in. Assists explicitly offer wider Good windows (±200 ms) or a two-pad arrangement with a separately authored chart and separate bests.
- **Feel:** next-frame pad depression, actual musician strike, skin/cymbal motion, and immediate sound. Show brief Early/Late feedback at the hit line. Do not schedule input sounds through the backing track's look-ahead queue; backing events and live instrument response have different latency needs.
- **Calibration:** provide a tap calibration and manual offset for judgment/display alignment. It cannot remove hardware Bluetooth sound delay; test wired, speaker, and Bluetooth play and preserve a generous accessible mode. Visible notes work in silent play.
- **Payoff:** the played ensemble joins the road crew. During travel their arranged music continues; at the next stop, an optional short free-play button lets the user hear each letter again. Camera and note lanes stay completely steady while scoring.

## 9. Game 5 — Monsoon Crossing

**One-line instruction:** “Wait for a gap. Hop to safety. Open the three ghat latches.”

Replace the static maze with a short crossing course for Mooshak. Kaka Deepak and volunteers guide from safe islands. The main procession stops on dry ground. Three latches secure a separate broad approach for the shrine.

- **Controls:** arrows/WASD or a large D-pad, one hop per press. Tap an adjacent reachable cell as a pointer alternative. Each hop has roughly 180 ms travel plus a short landing settle. Buffer only one next hop so holding a button cannot send Mooshak through the course accidentally.
- **Course:** three crossing sections separated by safe islands. First: slow service carts and one guided awning spring. Second: a broad work raft and optional petal detour. Third: two counter-moving platforms and a dry exit ramp. Each section ends at a permanent latch checkpoint; collected latches stay open after a local mistake.
- **Physics:** actors have ground footprints; hop height is visual elevation plus explicit low-obstacle clearance. Landing and cart collision use swept checks. A supported Mooshak inherits a platform's translation; leaving it removes that support velocity cleanly. Predict the landing against the platform's future position. Keep movement and shadow aligned.
- **Fairness:** show a full crossing cycle from each safe island. New carts enter beyond the play area with at least 1.2 seconds of visible approach. Platform motion is periodic and authored; verify that a viable time-dependent route exists. No reverse direction without anticipation. Safe islands never become hazards.
- **Failure:** a bad landing triggers a nearby volunteer's rescue animation and a return to the latest island in under 1.2 seconds; no drowning animation. Three rescues exhaust the attempt. Latches reached during that attempt remain for its retries in Standard mode; reset all for scored clean replay. A 90-second timer applies only in Challenge replay, not first-run Standard.
- **Goal/mastery:** open all three latches and reach the marked exit. Bronze complete; Silver at most one rescue; Gold no rescues and under 70 seconds of active play. Idle teaching and pause do not count. Assist slows carts/platforms by 25% and widens their safe landing footprints visibly.
- **Camera/payoff:** constant isometric orientation, player in the lower third, next island always visible. Follow advances after progress; it does not bounce per hop. Reflections, platform dip, wet footsteps, and cart wheels react. Final latch prompts volunteers to settle rails and open the broad main road. The shrine travels this secured route, never the hopping platforms.

### Revision: make each crossing feel like a small adventure

Use three authored set pieces rather than many interchangeable traffic rows. Section one threads a gap between slow decorated carts and ends with a springy awning landing. Section two lets Mooshak ride a broad work raft around a bend before choosing an easy landing or an optional petal detour. Section three has two counter-moving platforms and a final dry ramp toward the latch. Keep the final section focused on reading moving supports; do not add traffic lanes on top of that task.

At each latch, Mooshak automatically grabs the handle and pulls it with one short, tactile animation; a volunteer visibly locks a section of the main-road barrier open. The three changes remain visible behind the player. The final pull unfolds the secured ghat approach with a wide reveal after control pauses safely.

Add an optional **three-landing flow chain**: land on three marked safe pads within their individually shown generous windows to release a fan of petals and a short musical flourish. Waiting elsewhere stays safe and never blocks completion; a broken chain loses only that bonus. Decorative pads are placed on already reachable routes. This rewards confident movement without making every player hurry.

Every hop has a small crouch, clean take-off, readable arc, a planted landing, and a surface-specific response: wood flex, awning rebound, raft dip, or wet stone splash. The awning spring is an authored one-hop launch to a visible safe landing, not an uncontrolled extra bounce. Use only one such assisted spring on the first course. Optional detours provide mastery score rather than extra required latches. Keep the core one-hop input and rapid checkpoint recovery; variety comes from surfaces and moving supports.

## 10. Game 6 — Rangoli Lightworks

**One-line instruction:** “Connect matching symbols to light all six petals.”

Anaya lays out a physical courtyard board. Connect three pairs of matching endpoint lamps on a 5×5 board; each pair powers two petals of the large rangoli. This is a small spatial puzzle with an immediate live preview, ending in shared spectacle.

- **Controls:** drag between adjacent tiles; backtrack to erase the active tail. Release keeps an incomplete path visibly unpowered. Tap an existing start to redraw that path; Undo restores the last committed change. Keyboard moves a focus tile; Enter starts/commits and arrows extend; Escape cancels.
- **Rules:** orthogonal paths only; ordinary tiles cannot be shared or crossed, and paths cannot pass through a different endpoint. The one marked raised crossing tile permits independent straight horizontal and vertical channels, as detailed below. Invalid motion stops at the last valid cell with a small feedback pulse; it never silently deletes another route. Pair matching uses colour plus a unique shape. All pairs connected is success; filling every cell is unnecessary.
- **Content:** one quick practice connection, then one authored main board with all three pairs. A central blocked plinth and one marked raised crossing tile produce a deliberate routing decision. Build and solver-check at least three replay layouts. Keep the default board small enough for large touch targets.
- **Loop:** try a route → watch light travel → notice remaining space → undo/redraw → connect the final pair. Light pulses travel on partial paths but cannot power an endpoint until the route is complete. Completed petals remain logically powered unless that path is edited.
- **Goal/mastery:** all six petals powered. Standard has no expiry; optional 90-second target supports replay. Bronze solve; Silver solve within 90 active seconds and at most three committed redraws; Gold within 60 seconds and at most one redraw. Practice is excluded. Assist reveals one valid path; mark Assisted. No timed partial-credit completion.
- **Feedback:** powder edge appears beneath the input, a travelling light demonstrates direction, and each connected pair adds a musical layer and lights two real courtyard sectors. NPCs carry lamps toward those sectors along walkable paths. The last connection triggers a ring of lights spreading through the completed route.
- **Camera:** use a separately composed overhead board view for precision, with a noninteractive isometric courtyard strip showing the effect. Do not rotate a flat isometric painting to pretend it has another angle. After completion, dissolve back to the matching courtyard position and expand toward the ghat.
- **Optional hand tracking:** reserve for a post-completion free-paint celebration. It must not gate game 6 or medals. If retained later, require explicit activation, show tracking confidence, stop drawing on lost tracking, release camera resources on exit, and keep ordinary controls available.

### Revision: make the light puzzle build toward a playable reveal

The final board includes one visible **raised crossing tile**. It has two independent straight channels: horizontal overpass and vertical underpass. It permits those two paths to cross only on this tile; no turn is allowed inside it. All ordinary tiles retain the no-crossing rule. Teach the exception with a two-second animated preview before the main puzzle and verify each board with this exact rule. This creates a satisfying “use the bridge to fit both paths” decision instead of merely tracing an obvious line.

Make each pair a different visible contribution: one lights the step-edge lamps, one illuminates hanging lanterns, one completes the courtyard's petal rim. A test pulse continuously shows where an unfinished connection stops. Completed connections send small light carriers across the courtyard to the actual destinations; these are visual effects, not physical NPCs crossing forbidden terrain.

After all pairs connect, offer a short **conduct-the-light celebration**. Three large pads pulse in a slow, readable sequence; each press releases the stored light along that route with its musical chord. Pressing early still works and never removes completion or changes medals. Players may trigger all three at their own pace or choose Continue for an automatic reveal. This is a finale payoff using already learned tapping, not another compulsory test.

The last release fills the large rangoli from centre to rim, sends a visible wave down the completed road, and prompts the nearby crowd to lift their lamps. Then the camera moves to the ghat. Preserve this calm crescendo after game 5's motion; adding a speed-run hazard to drawing would work against the journey's pacing.

## 11. Nimarjanam finale storyboard

| Time | Camera and action | Sound and agency |
| --- | --- | --- |
| 0–5 s | Main-road tracking shot: the shrine reaches the ghat stopping marker, helpers form a clear corridor. | Fast gameplay percussion settles into the farewell arrangement. |
| 5–10 s | Wider three-quarter view shows trays, garlands, musicians, volunteers, and six lit petals from the actual saved state. | Crowd call/response; captioned. Hold for one voluntary “Offer farewell” action. |
| After action, 0–8 s | Authored carriers move the platform toward the prepared immersion area; a controlled lowering animation and water occlusion depict nimarjanam respectfully. | Dedicated percussion cadence, water movement, optional recorded chant with rights and review. No reaction-time check. |
| Next 8–15 s | Slow pullback follows ripples and reveals the connected city lights and completed rangoli. | Music resolves; petals settle. A second action may skip to results after the meaningful farewell beat. |
| Results | Stable view, six chapter badges, actual completion time, Continue/Replay Chapter. | Soft ending loop; no forced immediate restart. |

No physics ragdoll, idol toss, score explosion over the deity, or claim that one staged sequence represents every local tradition. Specific ritual staging and language need the user's preference before final animation production. For now design a respectful authored immersion rather than claiming the existing text reveal satisfies the requested destination.

## 12. Road, procession, NPC, and physics contract

### One road definition

Author road centreline, left/right boundaries, surface, stop markers, and allowed connections together. Build the render mesh/tiles and navigation corridor from this data. Roads must be visibly wide enough for the shrine plus a clearance margin. No mirrored street painting supplies collision geometry.

Use world coordinates for movement, and the shared 2:1 projection for the new isometric city. Existing painted-image coordinates are not automatically compatible; re-author/validate their placement. Use the inverse projection for pointer input. Camera zoom, CSS scale, and device pixel ratio must not change where a click lands.

### Formation follows distance travelled

For centreline C(s) parameterised by arc length, follower i targets C(s − d_i) plus the local normal times lateral offset l_i. The complete footprint must remain inside the walkable corridor; checking the centre point alone is insufficient.

- Each member has its own progress, facing, animation, and sorting anchor. Never move the entire crew as one fixed formation sprite.
- Use the tangent at each member's own route position. Shrink to fewer columns before a narrow section; restore spacing after all members clear it. Never increase spacing suddenly at a bend.
- Curves must stay inside road boundaries. An unconstrained smoothed spline can cut corners just as a straight segment can. Validate the swept footprint at bends and ramps.
- Reserve space in front of the shrine; followers queue and yield. If a gap is too narrow, stop before it and report the authored-map error. Do not teleport a member across pavement to catch up.
- Keep enough route history for the last follower. Stage arrival is the shrine reaching its authored stop, with the crowd settling behind; Mooshak touching a distant marker cannot teleport the procession forward.
- Pause locomotion when stopped while retaining breathing, cloth, and permitted instrument idle. Walk cycle rate follows distance, not an unrelated repeating timer.
- Ganesha remains stable relative to the carrier platform. Animate carriers, suspension, flags, and garlands; avoid whole-idol squashing or comic rocking.

### World actor behaviours

| Actor | State rules | Reaction |
| --- | --- | --- |
| Mooshak | Idle → anticipate → move/hop → land → recover; only active chapter accepts movement input. | Looks toward next goal, feet plant, ears/tail follow acceleration; facing uses velocity. |
| Carriers | Walk/turn/settle/wait/lower; no arbitrary wandering. | Footsteps and platform movement match speed and farewell staging. |
| Dhol players | Follow route → settle at beat mark → play → rejoin. | Strikes sync to actual musical events, not random bobbing. |
| Flag/dance crew | Follow assigned slot; wider dance motion only in cleared plazas. | Celebrate a successful chapter for 1–2 bars, then resume. |
| Spectators | Idle on sidewalk → anticipate passing crew → wave/cheer → return idle. | React once per passing group, with varied delay and cooldown. |
| Vendors | Work → show challenge cue → respond to player action → celebrate completion. | Physical trays/flowers/ropes change state with gameplay. |
| Stewards | Wait → reserve crossing → guide pedestrians → reopen. | Pedestrians yield at the procession corridor; no uncontrolled crowd collision pile-up. |
| Volunteers | Watch crossing → rescue if needed → reset → secure ghat. | Rescue and bridge changes correspond to actual game 5 events. |

Steering priority: authored boundary → reserved procession corridor → collision/separation → destination → idle variation. Decorative randomness never overrides the first three. Nearby crowd avoidance adjusts speed within permitted paths; it must not push actors off-road.

### Physics and animation ownership

Use a fixed 60 Hz simulation starting point with render interpolation and bounded catch-up. Suspend on visibility loss. Collision uses ground footprints, not transparent sprite rectangles. Render height for a hop separately from ground position. All collision response, score, and completion events fire once per authoritative event.

Arcade-style kinematics are appropriate for roads and characters. Game 2 needs ballistic trajectories and swept catch tests; game 3 needs a deterministic match/special/cascade grid and cosmetic falling motion; game 5 needs moving-platform support. Cosmetic falling flowers and cloth may use simplified springs. Avoid adding a full rigid-body engine to every sprite merely to claim “physics.”

Sprites anchor at bottom-centre/contact point and sort by projected ground Y, even during a jump. Tall buildings require base and upper/occluder layers; a whole procession container cannot interleave correctly with street furniture. Foreground occluders fade when they hide a playable target.

## 13. Camera and screen composition

Stable isometric projection is the main visual language. Changing a camera's zoom cannot reveal missing sides of a 2D asset. True front, side, or overhead scenes require authored matching assets or separate compositions.

| Situation | Composition rule | Motion rule |
| --- | --- | --- |
| Travel | Shrine near lower-middle; next road bend visible; Mooshak cannot drag camera across inaccessible scenery. | Follow an authored route focus with speed-based look-ahead; smoothing expressed in seconds. |
| Road Rally | Playable width fully visible; hazard preview at least 1.5 seconds. | No automatic zoom pulse during a dodge. |
| Modak Catch | Entire flight region above controls and tray. | Fixed camera; mild motion inside objects only. |
| Flower Festival | Full 6×6 board, three basket targets, moves, and arch reaction fit. | Fixed throughout swapping and cascades. |
| Dhol Utsav | Four note lanes, one strike line, D/F/J/K pads fixed in screen space. | No shake, pan, or zoom while scoring. |
| Monsoon Crossing | Current position, next safe island, and incoming traffic fit. | Follow progress smoothly; never follow hop height. |
| Rangoli Lightworks | Overhead board, large cells, courtyard reaction strip. | No camera motion during a stroke. |
| Finale | Establish ghat, medium farewell, wide city reveal. | Slow bounded dolly/zoom; no sudden orbital rotation. |

Starting transition duration 600–900 ms with ease-in/out; input enabled only when the playable transform is stable. Input queues clear on scene transitions. Shake, where appropriate, is at most 2–3 display pixels for 80–120 ms and never on every pickup. Reduced Motion removes shake, punch zooms, and heavy parallax; it preserves essential motion cues.

Landscape uses a broad arena and side reaction spaces. Portrait stacks the same arena above controls rather than cropping its sides. Design at 390×844 and 1366×768 first, then validate 360×640 and 768×1024. Touch controls and board cells target at least 48 CSS pixels. Reserve bottom safe-area space and keep dangerous cues out from under fingers. HUD should occupy roughly 12% or less of playable height.

## 14. Art, assets, and a city that reacts

Visual target: stylised, readable festival diorama, warm marigold/brass against indigo and teal, consistent top-left lighting. Preserve the existing image's atmosphere while reducing small photographic detail in the playfield. Mooshak, road edge, targets, and NPC silhouettes must survive a small phone screen.

The large existing map can serve as a reference, menu illustration, or distant backdrop. Its painted people, water, and drums cannot remain in interactive foreground locations alongside animated duplicates.

| Asset family | Required production pieces | Behaviour and acceptance |
| --- | --- | --- |
| Mooshak | At least four authored directional views; idle, run, hop, land, catch/recover, cheer; roughly 6–8 run frames per direction initially. | Feet stay planted; costume/asymmetrical details do not reverse incorrectly when mirrored. |
| Shrine/carriers | Separate shrine, platform, carrier bodies, feet, poles, hanging garlands; route direction variants and finale staging. | Contact and turns read correctly; shrine stays dignified and coherent across angles. |
| Crew/NPCs | Dhol, tasha, manjira, flag, dancer, vendor, steward, volunteer sets. | Each has idle, locomotion, and role-specific action with contact points. |
| City kit | Straight/bent/wide/narrow roads, curbs, walls, shop bases/tops, plaza paving, ghat steps. | Navigation boundaries agree with the art; pieces tile without perspective jumps. |
| Reactive props | Cart wheels/body, basket empty/partial/full, arch sections, gate leaves, bridge/latches, lamps off/on. | State changes are visible from the normal gameplay camera. |
| Water/weather | Separate surface, reflection masks, shore foam, ripples, platform displacement, rain zones. | Ripples originate at contact; weather never hides incoming hazards. |
| Challenge art | Recognisable sweets/husks, flower shapes, drum symbols, board endpoints, powder paths. | No platform-dependent emoji as final gameplay objects. |

Every asset record includes source/rights, intended display size, ground pivot, footprint, occlusion layer, animation clips and frame contacts, atlas entry, and sound/VFX event markers. Commission or generate assets to this specification after gameplay prototypes prove the need; generating another complete scene painting will not solve interactivity.

Three layers of life: (1) distant clouds/smoke/water, (2) local role-based NPC loops, (3) direct player-caused reactions. Budget attention in that order of importance reversed: player response first. Flags respond to wind and nearby passage, puddles to steps, baskets to deposits, flowers to impacts, and spectators to the successful act. Do not make every prop pulse continuously.

### What “making the scenes” means

The deliverable is a composed, playable district built from independently addressable assets. Raster sprites and textures can still be used in a 2D game, but moving characters need animation frames or articulated parts, props need their own transforms and states, and physical objects need colliders. One complete image containing all of these cannot satisfy the requirement. Distant skyline/backdrop paintings are acceptable where interaction and occlusion are unnecessary.

| Area | Separate things to build | What the player sees react |
| --- | --- | --- |
| Welcome Street | Ground and curbs; hinged gate halves; carts with wheel parts; banners; stewards; buildings split at occluders. | Cart wheels roll, hop landings disturb dust/water, gates open, stewards guide the turning crew. |
| Modak Market | Stall frame; cloth; vendor body/hands; flying sweets; trays with fill states; delivery cart. | Vendor tosses align with spawns, cloth flexes on deposits, baskets fill, helpers roll the offerings onto the route. |
| Garland Bazaar | Flower-table board; individual flower sprites and specials; thread spools; three baskets; segmented arch; Tara and helpers. | Swaps and cascades move individual pieces; threads pull flowers into garlands; helpers lift the finished sections. |
| Dhol Chowk | Four musicians with arms/sticks/cymbals; drum bodies; dancers; flags; four responsive control pads. | Each letter visibly and audibly strikes its own instrument; dancers share music phase; the band walks into formation. |
| Monsoon Approach | Water surface/reflection layers; cart lanes; individual rafts; awning; support ropes; latches; volunteer actors; main-road access sections. | Feet splash, supports move and dip, ropes tension, volunteers rescue, latches open the real procession approach. |
| Rangoli Courtyard and ghat | Board tiles including bridge; lamps and lantern strings; powder trails; rangoli sectors; stairs; shore/water masks; carriers and farewell staging. | Light follows the actual solved routes; lamps activate by sector; the final wave travels through the built city; water responds at immersion. |

Production proof before expanding the city: one 10-second curved-road scene must show Mooshak running, the full crew turning inside the road, a nearby NPC reacting, a cart rolling, a flag moving, and a step making a surface response. Inspect this at the actual gameplay zoom. A still screenshot is insufficient evidence that the scene is ready.

Current delivery status: the first playable redesign is integrated. It includes separate chapter code, code-authored road/collision geometry, trail-following crew, reactive chapter props, procedural music/instruments, and a generated Mooshak run-sheet draft. The asset table remains the production target; most directional characters, articulated NPC parts, modular district pieces, and recorded music are not yet produced. See [implementation status](IMPLEMENTATION_STATUS.md).

## 15. Music, sound, and effects rules

Use original or properly licensed festival recordings with authored arrangements. Procedural synthesis can support UI/placeholder sounds but should not be the only source of drum character. The preferred sound is tactile dhol/tasha/manjira, crowd distance, material impacts, and a restrained melodic identity.

| Moment | Music | Foreground SFX | Mix behaviour |
| --- | --- | --- | --- |
| Arrival/travel | Gentle melodic motif plus footsteps; add recruited ensemble stems after chapter 4. | Wheels, flags, nearby crowd responses. | Crowd remains behind task cues. |
| Road Rally | Light driving percussion. | Hop, dry/wet landing, cart warning, bell. | Warn before contact; duck accompaniment briefly for warnings. |
| Modak Catch | Playful repeating phrase with wave accents. | Air arc, catch ribbon, basket tap, chain accent. | Cap repeated catches; avoid a wall of identical clicks. |
| Flower Festival | Spacious plucked/percussive accompaniment. | Swap, bloom, sweep, special combination, cascading flowers, threading. | Cascade sound grows with size but stays bounded. |
| Dhol Utsav | Authored chart and accompaniment share clock. | Immediate DUM, TAK, TIR, TING for D/F/J/K; visual judgment. | Leave room for played percussion; no unrelated travel beat over cues. |
| Monsoon Crossing | Tense but spacious pulse. | Cart wheel approach, rain, platform creak, latch, rescue. | Position cues horizontally where helpful; also show warnings. |
| Rangoli Lightworks | Calm motif; pair completion adds a layer. | Powder stroke, light travel, soft connected chord. | No alarm clock in Standard mode. |
| Farewell | Resolved ceremonial arrangement. | Water, restrained crowd call/response. | Chant/captions get space; no gameplay combo stingers. |

One master audio transport owns beat phase. A short scheduler tick (starting at 25 ms) schedules about 100 ms ahead against `AudioContext.currentTime`; notes do not depend on callbacks firing exactly on their beat. Visual rhythm is sampled from that clock. Scene transitions crossfade music at musical boundaries where practical, with a short transition cue when immediate input matters.

Independent buses: music, gameplay SFX, ambience, and voice, plus master mute. The visible settings must affect already playing and future sounds. Start unlocks audio through the initial user gesture; failed unlock gets a small enable-audio control while play continues. Mute/unmute must resume coherent music without duplicate loops. Pause cancels/reschedules chart events; resume begins at a known beat.

Use several small variations per common effect and a repetition cooldown. Prioritise warning → player impact → objective success → ambience. Do not pitch-shift chants for combos. Every required audio cue has a visual equivalent. Test silent play, headphones, laptop speakers, and delayed Bluetooth output.

Effects contract: input responds visually on the next rendered frame; outcomes have anticipation, contact, and a short follow-through. Reserve large spectacle for a major cascade, ensemble entrance, bridge opening, and the final rangoli. Cap additive glow and keep particles out of board cells and note lanes. No full-screen white flash on ordinary completion. Reduced Motion and low-quality settings preserve gameplay feedback.

## 16. Production architecture and non-negotiable checks

Keep React for menus, HUD, settings, and accessible controls. Phaser owns real-time challenge simulation, world actors, camera, and effects. A typed event bridge sends state summaries; React intervals/DOM hit testing must not be the authoritative physics or rhythm clock.

Proposed shared owners: JourneyDirector, RoadGraph, ProcessionController, CrowdDirector, InputRouter, AudioDirector, CameraDirector, ChallengeController, SaveData, AssetManifest. Each chapter has its own simulation and data. Avoid one growing `ChallengeLayer.tsx` containing six unrelated timing/input engines.

State machine: Approach → Teach → Ready → Playing → Resolve → Travel; Playing can enter Paused, Retry, or AssistedRetry. Resolve is idempotent. Stop all chapter timers, handlers, tweens, and transient audio on exit. Completed-stage events include run/attempt IDs so late callbacks cannot finish the next stage. Save the objective result and world change together.

Performance targets to measure: 60 fps on the agreed laptop and representative mid-range phone; stable 30 fps fallback when needed. Starting budgets: 30 nearby animated NPCs, 150 active cosmetic particles, texture atlases loaded per district, no continuous React re-render of moving objects. These are provisional caps, not verified performance claims. Reduce background density first; keep collisions, note timing, and essential telegraphs unchanged.

Required implementation verification:

1. Overlay the real road corridor and every actor footprint through the entire route, both turns and stops. Test narrow passages, different crew sizes, low frame rate, pause/resume, and stage retry. Nobody cuts corners or leaves a valid route.
2. Build/typecheck, then complete a browser journey with no uncaught console errors. Repeat Start/retry/results/resume to detect duplicate events, sounds, and leaked scenes.
3. Verify stated objective equals actual completion predicate in all six games; duplicate completion and partial-Gold branches must be impossible.
4. Sweep-test fast catches and moving platforms at multiple render rates. Verify each layout's reachable path and game 3/6 puzzle solution.
5. Measure audio/visual/input alignment; validate pause, mute, sliders, and scene crossfades by listening as well as inspecting code.
6. Complete every chapter on keyboard and touch; verify pointer capture, cancellation, focus loss, browser scrolling prevention, small viewports, and safe areas.
7. Test reduced motion, shape-based readability, silent play, and assist labels. No hidden accessibility mode changes to medals.
8. Reach actual ghat farewell with the route, helpers, decorations, and six chapter results matching the saved run. A city painting plus text is not the completion criterion.

## 17. How we determine whether it is actually fun

Before producing six final art sets, recruit five fresh players with a mix of keyboard and touch use. Observe without coaching, then ask what they were trying to do and whether they want another attempt. A five-person test is directional evidence, not a statistically strong rating.

For each chapter record: time to first meaningful action, first unprompted correct action, attempts to complete, where confusion occurred, optional replay choice, perceived fairness, and a 1–5 enjoyment score. Tag device/input and assist use. Capture local diagnostic events during development; do not silently add external analytics.

Initial gates: at least four of five understand the action after the interactive demonstration; at least four complete within two attempts; median enjoyment at least 4/5; at least three choose to replay a chapter. Any repeated “what do I press?” moment in game 4 is a redesign issue. Any off-road shrine/crew movement is a blocking correctness issue regardless of enjoyment scores.

Tune one variable at a time: preview time, target size, density, timing window, response duration, then reward pacing. If a chapter still feels repetitive in greybox, change the decisions instead of adding particles. If every chapter is high-pressure, insert breathing room into game 3 and game 6 rather than extending cutscenes.

## 18. Implementation overview

The [implementation plan](../IMPLEMENTATION_PLAN.md) contains the actionable delivery sequence; this table is its high-level overview.

| Phase | Concrete deliverable | Exit gate |
| --- | --- | --- |
| A — Agree direction | Six verbs, first-game decision, run length, art treatment, farewell staging. | Shared design decision recorded; unresolved items remain explicit. |
| B — Prove foundation | One modular curved road, shrine plus crew, first reference-based Mooshak walk/hop asset set, reactive cart/spectator/flag, collision debug, camera and audio unlock. | A 10-second in-engine proof passes ground-contact, response, boundary and depth checks. |
| C — Prove feel | Polished 30-second Modak Catch slice and a readable Dhol lesson/short chart. | Catch response and rhythm clarity pass fresh-player tests. |
| D — Prove variety | Greybox Flower Festival, Monsoon Crossing, Rangoli Lightworks, and remaining Road Rally content. | Each has valid layouts, honest objectives, and evidence of replay interest. |
| E — Build the journey | Persistent chapter results, animated district transformations, travel, pause/save/retry, ghat ending. | Entire run completes across input methods without soft locks. |
| F — Final production | Directional art, NPC actions, percussion stems, effects, responsive layout, optimisation. | Visual/audio/device review plus measured performance and playtest gates. |

Discussion decisions: recommended action-based game 1 versus optional retained quiz; review of game 5/6 enhancements; games 3/4 follow the user's flower match-3 and audible-letter direction; 8–10 minute Standard journey; stylised modular art; desired nimarjanam staging and language. This document supplies a concrete starting point for that discussion. Gameplay coding and asset production follow it.
