# grok_imple — Unreal Path of Light

**Scope:** Unreal 5.8 contest runtime only (`unreal/PathOfLight`). Not the website. Not the Phaser/React 2D tail prototype. **No code in this file.** This is the plan.

**Ultimate aim (locked):** extreme **fun**, **tension**, **clarity**, visual **wonder**, real **panic**, and the feeling **I must win at any cost**. Those are one game, not six features. If a mechanic does not produce one of those, it is out.

---

## FINAL — both plans, then what we do

Two documents exist. This is the last call.

| | **Plan A** (`grok_imple`) | **Plan B** (5-phase overhaul) |
|---|---|---|
| Game | One mouse. One Tail hold. Four jobs by **color**. Only red gates fail you. | Four actions: sprint + whip + tether + jump. Whip also smashes gates. |
| Clarity | Road teaches in 40 s. HUD = 3 bells + gap bar. | Icons still say SMASH / LEFT CLICK. Two ways to open a gate. |
| Fun | Pendulum swing, cart surf, latch SNAP. Miss changes the next 3 seconds. | Shake / freeze / FOV on every click. Still “pull nearest glow.” |
| Panic / must-win | Rath in the camera. Drums + crowd. Closed gate = shrine **halts**, bell falls. 3 bells = lose. | Heartbeat 240 BPM, fog-death behind you, camera rips off to grow Ganesha. More captions. |
| Wonder | Gobkit Rat + KayKit/Kenney **on the verbs**. Four Niagara looks. DX11. | Fab, Megascans, Lumen, gold energy rope. **This PC is Intel UHD / 8 GB. License forbids Fab.** |
| First work | Identity + HUD + toy tail | Juice the whip (makes the *confused* game crunchier) |
| Verdict | **THIS IS THE GAME** | Steal 6 images. Do not steal controls, renderer, or extra fails. |

**Steal from B only:** title + one line + Enter; bell icons not `BELLS 3/3`; color glow on objects; Rath in peripheral when close; gate **physically splits**; win music swell + petals; act lighting (gold / storm / twilight).

**Never steal from B:** whip-opens-gate; sprint as a win button; golden chest-rope; Lumen/Fab/Sketchfab; heartbeat; darkness-death; camera leaving the spring arm; score/Seva as the reason to retry.

### The game, final

You are **Mooshak**. You run ahead of Ganesha’s Rath. **Hold Tail** (Shift or Right Mouse — one primary):

| See | Hold does | If you ignore it |
|---|---|---|
| **Red** gate, center road | Strain → **SNAP** open | Rath stops. Bell −1. Three times = lose. |
| **Gold** lantern over a gap | Swing, release to fly | Slow ground. Safe. |
| **Brown** cart, right lane | Surf / get dragged | Optional. Safe. |
| **Orange** basket | Yank, release to throw | Optional. Safe. |

Win = every red gate open, then the ghat. Lose = three ceremonial stops. Jump exists. Whip is **not** a win verb.

### What to do, last order (do in this order, stop if time dies)

1. **Clarity (first sitting, no new assets)** — One Tail button. Whip cannot open gates. Delete the HUD novel. Title: *CLEAR THE PATH* + Enter. In-run: 3 bell silhouettes + Rath gap bar. First 40 s of street: empty → orange → gold-over-gap → cart → **one red gate**.
2. **Fun** — Gold = real pendulum + release launch. Brown = faster than run. Orange throw visibly hits something. Red SNAP is a latch beat the world can see.
3. **Panic / I must win** — When Gap is small, spring-arm peeks the Rath (camera stays on the boom). Crowd/tabla/bell get louder. Missed gate = shrine **halts**, one bell mesh falls, `bell_hit`. No heartbeat, no extra text, no fog-death.
4. **Wonder** — Put **already imported** Rat / banners / crates / lanterns / barrels on the verbs. Hide cube mouse, cube gate, sphere Ganesha. Stay DX11. Thin brown tail from the **rear**.
5. **Amazement without nausea** — Duplicate the four Niagara templates (SNAP / fly / yank / surge). Tiny trauma shake + FOV only on SNAP, perfect release, Rath halt. Hit-pause only on SNAP and win.

**Done when:** a stranger, 30 seconds, no voiceover, can say “open the red ones before the shrine,” heart-rate at 5 m, and they hit Enter again.

**Not the work:** website, 2D Phaser, Fab, Lumen, new alleys/bridges, gamepad whip binds, six custom Niagara, cloth crowds.

Say **do Phase A** to start Unreal C++ on step 1.

---

**Question you asked:** is just pulling objects fun? No. Pulling is busywork unless the tail has weight, a beat, and a chase that will punish you if you miss. The Unreal game currently has all three *written down* and almost none of them *felt*.

### The two plans vs that aim

There are two write-ups. Only one becomes the game.

| Feeling you want | Plan A — this file (one Tail, world teaches, CC0 on verbs, DX11) | Plan B — 4-action / whip / Fab / Lumen / heartbeat overhaul | Winner |
|---|---|---|---|
| **Clarity** | One hold. Color = job. First 40 s of *road*. HUD = 3 bells + gap bar. | Sprint + whip + tether + jump. “LEFT CLICK” / “SMASH” tags. Whip also opens gates. | **A** |
| **Fun** | Swing is a pendulum you *release*. Cart is speed. Snap is a latch beat. Miss changes the next 3 seconds. | Juice every click (shake, 0.01x freeze, FOV, bloom). Whip CRUNCH. Still “click nearest object.” | **A** (B is seasoning on the wrong meal) |
| **Tension / panic / must-win** | Rath in the spring-arm frame. Tabla→crowd→bell. Closed gate = shrine **halts**, a bell *falls off*. Three stops = lose. | 240 BPM heartbeat, red tunnel, darkness-death behind you, camera rips off to grow Ganesha. More text (`THE RATH IS CLOSE`). | **A** (B is irritating, not desperate) |
| **Visual wonder** | Gobkit Rat + KayKit/Kenney **on the verbs**. Festival palette. Four Niagara looks. Warm act lighting. | Megascans, Fab, Sketchfab, Lumen, Nanite, golden energy rope, six custom Niagara, cloth crowds. **Intel UHD / 8 GB cannot hold this.** License also forbids Fab. | **A**, then a thin slice of B’s *look* (act grade, petals) on A’s meshes |

**Merge rule:** steal B’s *feelings and a few images* (bell icons, Rath in peripheral, gate actually splits, music swell on win). Never steal B’s *controls, renderer, or extra fail states*.

---

---

## Direct answer

A first-time player of the Unreal run cannot tell:

- what they must do vs what is optional
- when they win or lose
- why the Rath matters
- which button is the game

That is why it feels cheap and not fun. Something is happening. Nothing is happening *to the player*. Text is doing the job that color, silhouette, camera, and sound should do.

The signature toy is **one hold on the tail**. Four jobs by color. One fail object. A procession that is actually behind you.

Until that sentence is true in the window, extra VFX, extra models, extra HUD lines, and a second “whip attack” button will make it worse.

---

## Verdict on the “4-action / Fab / Lumen” overhaul

That document is **not approved** as the game, and not approved as the build order. Keep the feelings (speed, panic, mastery). Throw away the control scheme, the Fab/Lumen stack, and the score-as-identity.

### Open questions — locked answers

| Question | Answer |
|---|---|
| GPU | **Intel UHD Graphics, ~1 GB, ~8 GB system RAM.** Stay **DX11**. No Lumen, no Virtual Shadow Maps, no Nanite-on-everything. That machine will hitch, then look worse. |
| Fab.com | **No.** Contest asset rule is CC0 / already-in-repo only (KayKit, Kenney, Gobkit Rat, Niagara templates, festival audio). No Megascans, no Fab Indian packs, no Sketchfab with unclear licenses. The models are **already imported**; they are just on the sidewalk instead of on the verbs. |
| Audience / deadline | Still the **Ganesh Chaturthi contest Unreal runtime**. Identity and playability beat renderer flex. |
| Scope | **Do not tackle all 5 overhaul phases.** Do **A then B** from this file (one Tail button + HUD diet + pendulum/cart/snap). Visuals after the verb is a toy. |

### What that pitch gets right

- Start screen should be title + **one line** + Enter. No rules essay.
- In-run HUD should be **3 bell silhouettes + a gap bar**, not `BELLS 3/3`.
- Color on the object (red / gold / brown / orange), not a paragraph.
- Rath must occupy the frame when close. Danger is not a number.
- Gate clear must be a **physical snap**, not a text popup + sparkles.
- Control → Chaos → Release pacing is already in the C++ and should be *heard*, not labeled `CHAOS` on the HUD.
- “Again” comes from “I missed the release / I left a gate,” not from a new mechanic.

### What that pitch gets wrong (this is why the current build is confusing)

| Pitch | Why it dies |
|---|---|
| **4 actions: Sprint + Whip + Tether + Jump** | Nobody knows the game. Identity is **one hold**. Jump exists. Sprint as a second “go faster” button fights the cart/swing toys. |
| **Whip smashes gates open** | The must-do object becomes optional. Unique SNAP is skipped. HUD then has to explain two ways to open a gate. |
| **“LEFT CLICK” / “SMASH” tags** | Still teaching with words. First-time one-word stinger is the max. Color + silhouette do the rest. |
| **Rath never stops, never slows** | False. Lose rule is: Rath **halts** at a closed gate, bell −1, then continues. That halt *is* the panic beat. |
| **“THE RATH IS CLOSE” as a tension tool** | You already hated the text wall. Distance is drums, crowd, spring-arm peek, red *object*, not a caption. |
| **Seva Surge / Flow x12 as the reason to retry** | Extra. Win is **every red gate + ghat**. Score is for stylish people. Do not rebuild the game around a multiplier. |
| **Golden energy rope** | User already rejected a fat chest pole. Tether is a **thin brown tail from the rear** of the rat. |
| **UCameraShakeBase + chromatic aberration + 240 BPM heartbeat + bloom 2.5** | Irritating, not cinematic. Intel UHD will smear. Trauma shake + short FOV on SNAP/perfect/Rath-halt only. |
| **Camera punches at the gate / whips around to face the Rath** | Camera stays a **child of the spring arm**. Peek by rotating the boom. Never `SetWorldLocation` the camera. |
| **Fab / Megascans / Sketchfab Ganesha / DX12 Lumen** | License + this GPU. Out. |
| **GIF icon sequence on the title card** | Still a tutorial overlay. Teach in the first 40 seconds of *road*. |

### Locked player fantasy (one sentence)

You are **Mooshak**. You run ahead of Ganesha’s Rath on the festival street and **clear every red gate with your tail** before the shrine arrives.

### Locked verbs (not four minigames)

| Input | Job |
|---|---|
| WASD | Steer / pace. You auto-run forward. |
| Space | Jump. Clutch if you just left a ledge. |
| **Hold Tail** (Shift **or** Right Mouse — one primary, the other is alias) | Latch if a legal target is in cone. Color chooses the job. Hold with nothing = nothing. |
| Release Tail | Gold = fly. Brown = hop off / launch. Orange = throw. Red = SNAP (or auto after the latch fills). |

**Whip is not a win verb.** It must not open red gates. If a smash flourish stays, it is orange/brown comedy only.

### Locked win / lose

- **Win:** every center-line red gate is open, then the ghat.
- **Lose:** Rath reaches a still-closed gate **three times** (three bells). Each miss is a **ceremonial stop** you can *see and hear*.
- Skipping a swing / cart / basket is **safe**. Skipping a gate is **not**.

### What we actually build (same order as below)

1. One Tail button. Kill whip-opens-gate. Kill the HUD novel.
2. Make swing / cart / yank / snap *toys* with weight and a readable first-minute layout.
3. Panic from Rath in the camera + audio Director. No essays.
4. Put Gobkit Rat + KayKit/Kenney on the **verbs**.
5. Duplicate Niagara templates, tiny trauma shake, SNAP hit-pause. Stay DX11.

Say **do Phase A** when you want code. Until then this file is the plan.

### Phases 3–5 of that overhaul (line by line)

| Item | Verdict | What we do instead |
|---|---|---|
| Act I/II/III color grade (gold / storm grey / violet diya) | **Keep, later** | `ApplyLook` already swaps sun/fog by segment. Warm the numbers. Do **not** author cinematic LUTs or Lumen-grade PP. |
| Six custom Niagara systems (petals, gulal, diya, aura, shatter, steam) | **Shrink** | Duplicate the **four engine templates** already loaded. One look per beat (SNAP / fly / yank / surge). No Fluids, no curl-noise authoring pass on Intel UHD. |
| Heartbeat 60→240 BPM + muffled audio + tunnel vignette | **Kill** | Festival panic is **tabla / crowd / bell**, volume vs Gap. Heartbeat is a horror game and it will irritate. |
| Darkness wall that eats the road + `THE RATH HAS PASSED` | **Kill** | Extra fail + more text. The Rath already punishes **closed gates**. Optional: dim the strip *behind* the shrine (fog density), never a new death. |
| Fail cutscene: camera whip to Rath, idol grows, white flash, chant | **Kill the camera steal** | Spring arm stays parent. Rath **halts** at the gate, one bell falls off the shrine, `bell_hit`, short trauma. Then retry is instant. Cheap death teaches. |
| Win: fireworks, petal rain, music swell, score one-stat-at-a-time | **Keep the swell, cut the stats parade** | Ghat, diyas, fountain Niagara, tabla swell, one line. Score is extra, not the ceremony. Camera may **lengthen the boom**, not detach. |
| Dynamic music layers (dhol, synth pad, brass, harmonium) | **Keep as volume stems** | We have `tabla_tune`, `india_rhythm`, `crowd_shouting`, `jingle_surge`, `bell_hit`. Duck/raise those. Do not invent packs we do not own. |
| Golden energy spline tether + spark bursts | **Kill** | Thin **brown** cylinder (or spline) from the **rear** of the rat. Pulse on tension. No tiled gold pipe. |
| Crowd cloth physics, denser people at gates | **Later, cheap** | Far, small, wave harder near the player. No cloth sim on UHD. |
| Narrow alleys, water bridges, rooftop shortcuts, broken road | **Not now** | New level language. Left shortcut already exists. First make the **same 30 segments** readable. |
| Gamepad: RT sprint, B whip, RB tether | **Later, remap** | One Tail hold (trigger). Jump = face button. **No whip-to-win bind.** Rumble on SNAP / halt only. |

### Their “Phase 1+2 first” is the wrong Phase 1

They want to juice **whip hits**, FOV on sprint, and “LEFT CLICK” icons — zero new assets, pure code. That makes the **confused two-verb game crunchier**. It does not make it understandable.

Real first sitting (still zero new downloads):

1. One Tail button. Whip cannot open gates.
2. HUD = 3 bells + gap bar. Delete ROADBLOCK / GATE labels / control dump.
3. First 40 s of road: empty → orange → gold-over-gap → cart → one red gate.
4. SNAP / perfect / Rath-halt get a **tiny** trauma shake + FOV. Not every click.

**Verification that matters:** a stranger, 30 seconds, no text, can say “open the red thing before the shrine.” `stat fps` on this Intel UHD must stay playable. “Camera shake fires on tail whip” is **not** a success test.

---

## What the Unreal game is right now (from the running C++)

This is diagnosis of `unreal/PathOfLight/Source/PathOfLight/TailLab.cpp` / `TailLab.h`, not a guess.

### Identity vs what shipped

| Document (`unreal/GAME_IDENTITY.md`) | What the HUD and input actually do |
|---|---|
| One button: **HOLD SHIFT**. Color chooses the job. | **SHIFT = sprint.** Tail is **Right Click / E**. A second verb is **Left Click / F / Q = whip attack**. |
| Win: snap every **red gate**, reach the ghat. Lose: Rath hits a closed gate **3 times**. | Title card dumps WASD, sprint, leap, whip, tether, smash-or-snap, golden lantern, sidewalks. In-run HUD still writes `MUST: snap RED GATES`, `ROADBLOCK … SMASH OR TETHER`, plus `GATE` / `SWING` / `CART` / `YANK` labels on nearby props. |
| Skip swings/carts/baskets = safe. Skip a gate = fail. | Whip can smash a gate from 420 units. So the “must hold the red one” rule is already optional. The unique toy is bypassed. |
| Camera stays on the spring arm. Never world-teleport the camera. | Spring arm exists (`USpringArmComponent`, lag 12, FOV 70). Panic is mostly **DrawRect red edges** + cue strings like `THE RATH IS CLOSE`. |
| Niagara templates for juice. | Templates are loaded (`RadialBurst`, `SimpleExplosion`, `FountainLightweight`, `DirectionalBurst`) and spawned as generic bursts. Same puff for whip, gate, clutch, win. |

### What still looks like a student greybox

Already imported (Content exists):

- `/Game/Hero/Rat` (Gobkit CC0) — used as hero at scale **4.2**, then **squashed every frame** as a fake gallop (`scale 4.2 * (2-Stretch)`). Looks like a rubber toy, not a mouse.
- `/Game/KayKit/*` — stalls, boxes, bushes, streetlights, benches. Used as **sidewalk dressing**.
- `/Game/City/*` — Kenney buildings, awnings, parasols, KayKit dungeon banners/barrels/candles/crates. Used as **sidewalk dressing**.

Still **engine cubes/spheres/cylinders** for the things the player actually looks at:

- **Red gate** = scaled cube (`1.2, 12, 2.4`) + gold cylinder pole + optional banner
- **Gold swing** = candle mesh if present, else sphere, plus a huge pulsing gold sphere
- **Brown cart** = KayKit box + stacked crates + **cylinder wheels**
- **Orange yank** = barrel + sphere lid
- **Devotees** = cube body, sphere head, cube arms/skirt
- **Rath / Ganesha** = cube deck, cube canopy or awning, **sphere idol + sphere ears + cylinder trunk**
- **Toran arches** = three cubes
- **Tether** = thin cylinder, gold-glow, not a tail

So the street *around* the run has free models. The **verbs** and the **hero/Rath** are still primitives. That is why it reads cheap even after import.

### Teaching is a novel

`ALightHUD::DrawHUD` writes, at once:

- title, act name, feel phase (`CONTROL` / `CHAOS` / `RELEASE`)
- bells / seva / flow / Rath meters
- a distance bar
- red screen edges
- `SEVA SURGE`
- a rotating `Cue` paragraph (controls, lantern, carts, gates, “the Rath is close”, “dhol behind you”, “they can see you”…)
- a 430-wide dark box on the focused object with a full sentence of controls
- a hold bar plus `KEEP HOLDING TO SNAP THE GATE`
- world labels `GATE` `SWING` `CART` `YANK` on every nearby prop
- bottom `ROADBLOCK Xm / SMASH OR TETHER`
- a second progress bar

A player who can read all of that still does not *feel* a fail. A player who cannot, drowns.

Cue examples still in the first 20 seconds of a run:

- `WASD: Run freely. SHIFT: Sprint. SPACE: Leap.`
- `LEFT CLICK / F: Tail Whip Attack! RIGHT CLICK / E: Tether.`
- `GOLDEN LANTERN: Hold RIGHT CLICK / E to swing…`
- `CARTS: Left Click to smash, or hold RIGHT CLICK / E to ride.`
- `RED GATE: Whip (Left Click / F) or Tether (Right Click / E) to snap open!`

That is the opposite of `GAME_IDENTITY.md` and `unreal/OBJECT_SCRIPT.md`.

---

## Why “just pull the objects” is not fun

Steve Swink’s game-feel model (Gamasutra, 2007; book *Game Feel*, 2008) is six layers. Pulling in Path of Light currently has **input** and a little **response**. It is missing the rest. [S1]

1. **Input** — one organ of expression. Not five sentences of keys. Mario 64 is mostly *steering Mario*. The hours are in the feel, not the star text. [S1]
2. **Response** — the world answers in under ~100 ms, with weight (accel, damping, hold-time). A binary “attached / not” with a 0.18 s gate fill is a menu, not a tail. [S1][S2]
3. **Context** — objects placed so the motion means something. A swing with no gap, a cart that does not change your speed relative to the Rath, a basket that awards 80 Seva and vanishes from the mind: blank field. Swink: without a wall there is no wall-kick. [S1]
4. **Polish** — hit, sound, camera, deformation *together* on the same frame. Juice is not a Niagara spawn somewhere nearby. [S1][S3]
5. **Metaphor** — it has to *read as a mouse tail on a festival street*, or the brain files it as “grapple on cubes.” [S1]
6. **Rules** — a goal with teeth. Optional toys vs one fail. If whip also opens the gate, the rule is mush. [S1]

Insomniac’s Spider-Man (Ryan Smith): swinging was **the first thing they built**. It had to be a **physics pendulum, not flying**. Hold is accessible; **release timing** (forward vs up) is the skill. Camera **rolls with the line**, FOV kicks on zip, connections between swing / zip / wall-run were iterated for years so momentum never dies. Greybox first, city scale built *around* the swing. [S4]

**Translation for Mooshak:**

| If Tail feels like… | It is this |
|---|---|
| Click nearest glowing thing, object despawns, +80 | Busywork. Spreadsheet. |
| Hold gold, body becomes a pendulum, release at the front of the arc *throws you down the street* | Toy. Spider-Man / Monkey Ball. |
| Hitch brown cart, you are *dragged faster than run*, Rath gap opens, jump-off is a launch | Toy with consequence. |
| Yank orange, it *flies into the next gate / cart* and you see the chain | Toy with comedy. |
| Latch red, 0.2 s of strain, **SNAP**, arch splits, road is physically open, bell rings once | The beat. The must. |

Pulling is fun only when **missing it changes the next three seconds**. Right now missing a basket changes a number. Missing a swing does nothing. Missing a gate is supposed to cost a bell, but whip can smash it, and the Rath stop is a text cue plus a ceremonial auto-open. The player never sits in “I must not lose.”

---

## How panic is supposed to work (no essay)

Temple Run / Subway Surfers do not explain the chase. The monster is **behind the camera**, audio rises, the world is a tunnel, fail is instant and readable (fell / hit / caught). SYBO built Subway Surfers on that chase loop plus Jetpack Joyride / Canabalt: **theme is the costume, the verb is run-from-the-thing**. [S5]

Left 4 Dead’s AI Director (Michael Booth, GDC 2009) is the pacing bible for “must win at any cost” without a tutorial dump:

- Measure a simple **intensity** (you got hurt / a threat is near).
- **Build Up** until intensity peaks.
- **Sustain Peak** 3–5 seconds so the moment resolves.
- **Relax** (strip major threats) so the next peak hits.
- Constant combat is fatigue. Constant quiet is boredom. Spikes create drama.
- Music Director rides the same curve. Players *hear* the Tank before they see it. [S6]

Path of Light already *names* Control / Chaos / Release and 70 m / 25 m / 15 m / 5 m bands. Those bands currently fire **strings** (`THE RATH IS CLOSE`, `DHOL BEHIND YOU`, `THEY CAN SEE YOU`) and red DrawRect frames. That is a PowerPoint of panic, not panic.

**What the player should get instead, in order of power:**

1. **Sound first.** Tabla bed when safe. Crowd swell as Gap shrinks. One ceremonial bell when a gate is still closed and the Rath is inside 25 m. No sentence.
2. **Rath in the camera.** Peek-back is already in the design. Use **spring-arm yaw/pitch/FOV**, never detach the camera. When Gap < 15 m the arm lengthens and the Rath occupies the left/right of frame. When Gap < 5 m FOV kicks 8–12°, vignette warms, bloom on the idol. Insomniac: camera sells the speed. [S4]
3. **The fail object is the only red thing on the road.** A closed gate is a wall of saturated red + a gold latch at mouse-height. Everything else is festival, not fail.
4. **One missed gate is a physical stop.** Rath *halts*. Music drops. Bell −1 is a **diegetic bell on the shrine**, not a HUD integer lecture. Then the gate is forced open and the chase resumes. That beat *is* “I must win at any cost.”
5. **Director pacing on the existing FeelPhase.** Chaos = extra rolling carts + denser gold swings (toys, not fails). Release = empty road + music breath. Do not spawn extra red gates in Chaos. Gates are the ceremony, not the director’s toy.

Booth’s warning: clever intensity math got worse. **Simplest worked.** For this game, intensity = `1 / max(GapMeters, 1)` plus a spike when a gate is skipped. Decay when Gap is opening. That is enough. [S6]

---

## Teach one button by color, not by HUD

Portal 2 / Portal (Valve): portalable surfaces are **white**. Non-portalable are not. Fling is taught with a **diving-board silhouette** (pushed-out checker slab over a pit), repeated, before the player is expected to invent it. Gating: you cannot enter the next chamber until the current verb is proven. Playtest, then move chambers. They used an explicit VO *once* for momentum, and avoided it everywhere else. [S7][S8]

Half-Life 2’s Ravenholm sawblade: a dead zombie with a blade in it. Zero words. Ten seconds. [S8]

**Path of Light language (lock this, delete the rest):**

| See (silhouette + color) | Hold Tail means | Release | If you ignore it |
|---|---|---|---|
| Tall **red** wall on the **center line**, gold latch at chest height | Strain until **SNAP** | Auto after snap | Rath will stop. Bell. |
| **Gold** hanging lantern / bell **above** a gap | Pendulum | Front of arc = fly forward | You take the slow ground. Safe. |
| **Brown** wheeled cart in the **right lane** | Hitch / surf | Jump or release to launch | Cart rolls. You can crash. Safe for the ceremony. |
| **Orange** bowl / basket / umbrella **off-center** | Yank | Throw with your velocity | Stays. Optional comedy. |

Rules for the first 40 seconds (Portal gating, not a paragraph):

1. Empty road. Only steer + jump. **No Tail prompt.**
2. One orange basket, right lane, nothing else. Hold does the obvious yank. No text.
3. A **gap** with one gold lantern over it. Ground around the gap is slow or blocked so the swing is the obvious path, not a bonus.
4. One brown cart. You can ignore it. If you hitch, you suddenly outrun the camera for a second — that is the lesson.
5. First **red gate, dead center, blocking the whole ceremonial strip**. Nothing else interactive in that shot. Hold until snap. Rath is already visible in the rear of the frame so the *why* is the shrine, not a caption.

Then mixed street. Skipped-gate gets **camera shake + bell + Rath halt**, not `YOU LEFT A RED GATE — THE RATH WILL STOP THERE. TURN BACK OR LOSE A BELL.`

Kill in-run:

- `GATE` `SWING` `CART` `YANK` world labels
- the 430-wide instruction box
- `ROADBLOCK … SMASH OR TETHER`
- act/feel novel (`I / FESTIVAL BAZAAR    CONTROL    MUST:…`)
- control dumps
- whip as a gate-opener

Keep in-run (tiny):

- **3 bell silhouettes** (not `BELLS 3 / 3`)
- **Rath gap as a bar** that turns hot without words
- **one-word stinger** only on the new verb the first time it appears (`SNAP` / `FLY` / `SURF` / `YANK`), <0.6 s, then never again

Title card: **ENTER**. One line: *Clear the red gates before the Rath.* That is the whole essay.

---

## Stop looking cheap in UE 5.8

### Models — they are already in the project

Do **not** hunt new packs. License is already CC0. Wire them onto the **verbs**, not only the sidewalk.

| Role | Use this (already imported or in `art/render`) | Do not keep |
|---|---|---|
| Mooshak | `/Game/Hero/Rat` at a **fixed** scale (~4.2). Hide primitive Body/Head/Ears/Tail **or** keep TailA/TailB only as the tether origin. **Stop per-frame squash-stretch of the whole mesh.** Bob/lean on location/rotation only. | Cube mouse, scale-18 experiments, tinting the rat gold during Surge |
| Rath body | Kenney `detail_awning` + `building_*` + wheels that read as wagon | Sphere Ganesha |
| Ganesha idol | Stylized silhouette from primitives is OK **if small and emissive**, or a CC0 diya/statue stand-in. Better a glowing shrine than a sphere-elephant. | Giant sphere head as the hero of the shot |
| Red gate | KayKit dungeon `banner_red` as the cloth + two posts from KayKit/Kenney, **gold latch** as the only emissive. Scale like a *toran / barricade*, not a 12-unit-wide cube wall. | `Cube` scaled (1.2, 12, 2.4) |
| Gold swing | `candle_lit` as the lantern. Rope is the tether visual (thin, brown, from **rear** of the rat, not a fat chest pole). | Extra pulsing sphere the size of a beach ball |
| Cart | `crates_stacked` + `barrel_*` on a KayKit `box_A` deck. Wheels can stay cylinders if they **spin** and sit on the ground. | Sphere cargo |
| Orange yank | `barrel_small` or a bowl-scale crate. Emissive orange only on the rim. | Sphere lid |
| Crowd | Keep cube people **far** and small **or** instance 2–3 Kenney-ish dressed meshes. Close-up cube people kill the shot. | Four cube devotees at 740 Y in every segment |
| Toran | Banners already imported. Two posts + cloth. | Three greybox cubes |

KayKit City Builder Bits: 32+ low-poly, **one 1024 atlas**, CC0, no attribution required, FBX/GLTF, explicitly listed for Unreal. [S9] Kenney City Kit Commercial / Nature: CC0 1.0. Gobkit Rat: CC0 1.0 GLB already converted in `art/render/cc0-fbx/Rat.fbx`.

Import rule (Epic): FBX into Content Browser; collision auto-generate for static dressing; **physics objects (cart, basket, gate latch) need a simple collision** (box/sphere), not complex mesh collision. Nanite is optional on **static** buildings; **do not Nanite** simulated carts/baskets. One `M_Solid` instance with Color+Glow is the festival palette — retint, do not author 40 materials. [S10]

Scale: KayKit/Kenney are meters-ish; Unreal is cm. If a building is a dollhouse or a skyscraper, it is an import scale, not “the pack is bad.” Fix once on the asset, not per spawn.

### VFX — templates are the start, not the finish

Epic’s own Niagara Quick Start: **do not use the template as the shipped look**. Duplicate the template, retarget color/mesh/burst count, attach to the event. Simple Sprite Burst → your dust. Mesh renderer if you want gulal clumps. [S11]

Map **one system to one beat**, palettes locked:

| Beat | Template to duplicate | Change | Never use for |
|---|---|---|---|
| Gate SNAP | `SimpleExplosion` | Tiny, warm gold+red, 0.2 s, at the **latch** | Whip, footsteps, surge |
| Perfect swing release | `DirectionalBurst` | Forward streak, gold, along velocity | Ambient |
| Yank / throw | `RadialBurst` | Orange, at the basket | Gates |
| Surge / win / start | `FountainLightweight` | Petals/gulal, not water | Panic |
| Rath close | **no extra explosion** | Camera + crowd audio only | Particle spam |

Juice It or Lose It (Jonasson & Purho, GDC Europe 2012): a juicy game **responds to everything you do** — tween, particles, trail, **screen shake is powerful and easy to overdo** (“freight train mode” breaks the frame). [S3]

Squirrel Eiserloh (GDC 2016): camera shake is **salt**. None = hits feel weightless. Too much = nausea. Use a **trauma** value (0–1) that decays; shake = trauma² or trauma³; **Perlin**, not random; in 3D prefer **rotational** shake, avoid big translational shake. [S12]

**For this camera (already a child of `USpringArmComponent`):**

- Add trauma on SNAP, clutch, Rath halt, perfect release.
- Decay in ~0.15–0.25 s.
- Rotate the boom slightly; do not `SetWorldLocation` the camera.
- FOV kick +4 to +12 on those same beats, return with ease-out.
- Hit-pause (time dilation 0.15 for **2–4 frames**, already used on win) on **gate snap only**. Not on every yank.
- Offer / keep shake small. Festival game, not a shooter.

Post-process already has bloom 0.85, vignette 0.45, warm gamma. That is **already a lot**. Cheap “ultra” is bloom + random bursts + red frame + gold tint on the rat. Dial bloom down when panic FOV kicks in so it does not smear.

Lumen/Nanite: a 3-minute arcade street does not need Nanite on every crate. Static KayKit buildings: Nanite on if they are dense. Movable props: off. Niagara Fluids: **do not**. GPU particles from the four templates are the budget.

### Audio already in `/Game/Audio`

Use it as the Director, not as stingers on every Award():

- `tabla_tune` / `india_rhythm` — safe bed
- `crowd_shouting` — volume vs Gap
- `bell_hit` — ceremonial stop and gate snap only (one shot, not layered 3 times)
- `latch` — snap
- `cloth` — tail catch
- `wood_hit` / `whip` — cart/basket impact
- `jingle_perfect` — perfect release only
- `jingle_surge` — surge / win

If the player can mute the HUD and still know “gate coming / Rath close / I snapped it / I lost a bell,” audio is done.

---

## The plan (order is the point)

`unreal/BUILD_DIRECTIVE.md` already ranks: **Fun → Tension → Game feel → Surprise → Replay → Completeness → Clarity → Audio → Visual wow → Tech**. Do not reverse it. Beautiful Niagara cannot rescue a whip+tether identity crisis.

### Phase A — Identity (playable in one sitting)

1. **One Tail button.** Hold = attach if a legal target is in cone. Release = the job. Map it to **Shift and/or Right Mouse** (pick one primary, the other is alias). **Delete whip-opens-gate.** Whip, if it stays at all, is cosmetic on orange/brown only and never clears a red gate.
2. **SHIFT is not sprint** unless sprint is a tiny assist. Identity doc already said HOLD SHIFT is Tail. The current sprint+whip+tether trio is why nobody knows the game.
3. **HUD diet.** Title: one sentence + ENTER. In-run: 3 bells, gap bar, first-time one-word stinger. Delete labels, ROADBLOCK, act novel, control dump, 430-wide help box.
4. **Win/lose in the world.** Closed red gate blocks the center. Rath stops, bell rings, shrine loses a hanging bell mesh. Three gone = lose line. All gates open + ghat = win line. No extra score screens of Perfects/Clutch/Secrets/Chains on the title card.

**Exit test:** a stranger, no voiceover, can answer “what do I do?” after 20 seconds.

### Phase B — Tail is a toy (still greybox-OK)

5. **Gold swing:** real pendulum (rope length, gravity, release at front of arc = +X launch). Put a **gap** under the first one. Release early = dump into the pit/slow ground. This is the Mario jump of the game (Insomniac’s words for swinging). [S4]
6. **Brown cart:** hitch sets movement to cart velocity. Cart is faster than run. Release/jump launches. Missing it is safe. Hitting it without hitch is a stumble, not a fail.
7. **Orange yank:** hold = attach, release = impulse along look/velocity. First basket is in a place where the throw **visibly hits something** (a standing crate, a hanging pot). Seva is a spark, not the reason.
8. **Red SNAP:** hold ~0.2 s with strain (tether taut, latch emissive, tiny trauma). Then gate **slides or splits off the ceremonial line**. Cannot whip it. Cannot ignore it.

**Exit test:** you catch yourself “noodling” on swings (Swink’s happy-accident test) even with cubes. [S1]

### Phase C — Panic from the Rath

9. Intensity from Gap + skipped-gate spike. Build / peak / relax on Chaos carts and swing density. Never on extra fail gates.
10. Sound and spring-arm do the 25 m / 15 m / 5 m bands. Words only if a playtest still fails.
11. Skipped gate: camera peek at the closed gate, Rath halt, one bell. Then resume.

**Exit test:** heart rate at 5 m without reading the HUD.

### Phase D — Replace the cheap meshes (assets already here)

12. Hero = Gobkit Rat, **no squash of the mesh scale**, tail tether from rear, thin brown. Hide primitive body.
13. Gate / lantern / cart / basket / toran / sidewalk as in the table above. Fix import scale once.
14. Crowd: fewer, further, or one better mesh. Rath: wagon + shrine glow, not sphere-Ganesha as the close-up.

**Exit test:** a screenshot of the **gate** and the **mouse** reads festival, not PrimitiveDebug.

### Phase E — Juice that is cinematic, not irritating

15. Duplicate the four Niagara templates into `/Game/FX/` with festival palettes. One system per beat.
16. Trauma shake + short FOV on SNAP / perfect / Rath halt. Hit-pause only on SNAP and win.
17. Post-process: keep warm; reduce bloom if panic FOV is on. No extra radial blur.
18. Audio Director as above.

**Exit test:** mute HUD, game still readable. Turn shake down, game still readable. Nobody says “my eyes.”

### Phase F — only after A–E

19. Optional left shortcut, monsoon wet friction, ghat finale diyas, Seva Surge as extra — they already exist. They are not the problem.
20. Do not add combat, minigames, more buttons, more HUD, Fab packs, or Sketchfab with unclear licenses.

---

## What not to touch

- Root Vite/Phaser/React app, `src/`, `public/`, `index.html`
- 2D tail lab / isometric prototype
- Pixel Streaming / signalling unless the contest package needs it later
- New mechanics, new fail types, paid Indian stall packs

When someone says “update the game,” they mean **this Unreal map** (`/Game/Maps/TailLab`, GameMode `LightGameMode`).

---

## One-week build order (people, not code)

| Day | Outcome on screen |
|---|---|
| 1 | One Tail button. Whip cannot open gates. HUD is bells + gap bar. |
| 2 | First 40 s is empty → orange → gold-over-gap → cart → red gate. No sentences. |
| 3 | Swing is a pendulum with a gap. Cart is a speed toy. Snap is a latch beat. |
| 4 | Rath halt + bell mesh + audio Director. Peek on spring arm. |
| 5 | Rat hero stable. Red gate is banners+posts. Lantern is candle. Cart is crates. |
| 6 | Four duplicated Niagara systems, trauma shake, SNAP hit-pause. |
| 7 | Playtest with someone who has not read this file. If they need the old HUD, the silhouettes failed — fix color/scale, do not put the text back. |

Success is the sentence in the build directive: the player hits **Again** on the results screen.

---

## Sources

- [S1] Steve Swink, “Game Feel: The Secret Ingredient,” Gamasutra / Game Developer, 23 Nov 2007. https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient — six-layer model (input, response, context, polish, metaphor, rules); Mario 64 as a feel game; Miyamoto’s garden.
- [S2] Steve Swink, *Game Feel: A Game Designer’s Guide to Virtual Sensation*, Morgan Kaufmann / CRC, 2008. https://www.taylorfrancis.com/books/mono/10.1201/9781482267334/game-feel-steve-swink — 100 ms control threshold is widely cited from this line of work (see also GameJuice summary: https://gamejuice.co.uk/articles/swink-6-components-game-feel).
- [S3] Martin Jonasson & Petri Purho, “Juice It or Lose It,” GDC Europe 2012. https://www.youtube.com/watch?v=Fy0aCDmgnxg — juice = cascading response for tiny input; screen shake is powerful and easy to ruin.
- [S4] Ryan Smith (Insomniac), “Don't mean a thing if you ain't got that swing… in Spider-Man,” Game Developer, 29 Oct 2018. https://www.gamedeveloper.com/design/don-t-mean-a-thing-if-you-ain-t-got-that-swing-in-i-spider-man-i- — pendulum not flying; hold accessible / release skill; camera roll + FOV; greybox first; city built around swing.
- [S5] Unity case story, SYBO / Kiloo, Subway Surfers. https://unity.com/showcase/case-stories/sybokiloo-subwaysurfers — chase-runner loop; Temple Run + Jetpack Joyride + Canabalt as the gameplay parents, Disney-ish look as costume.
- [S6] Michael Booth, “The AI Systems of Left 4 Dead,” GDC 2009. Slides: https://cdn.akamai.steamstatic.com/apps/valve/2009/GDC2009_ReplayableCooperativeGameDesign_Left4Dead.pdf — intensity, build / sustain / relax; simplest damage-based intensity won; music director.
- [S7] Valve / Christopher Chin on Portal 2 fling teaching (pushed-out checker slab, gating, playtest). Discussed in “PRO DESIGN TIPS - Teaching: Portal 2.” https://www.youtube.com/watch?v=O8xnnutD7-o
- [S8] Portal 2 visual language: white = portalable; Game Developer design review. https://www.gamedeveloper.com/design/portal-2-game-design-review-part-1 — and Extra Credits / “Half-Life 2’s Invisible Tutorial” on zero-word teaching. https://www.youtube.com/watch?v=MMggqenxuZc
- [S9] Kay Lousberg, KayKit City Builder Bits, CC0 1.0, Unreal-compatible FBX/GLTF, single atlas. https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0
- [S10] Epic, Importing assets into Unreal Engine. https://dev.epicgames.com/documentation/unreal-engine/importing-assets-directly-into-unreal-engine
- [S11] Epic, Niagara Quick Start (UE 5.8): start from a **template**, then change renderer/color/count; attach to the event. https://dev.epicgames.com/documentation/en-us/unreal-engine/quick-start-for-niagara-effects-in-unreal-engine
- [S12] Squirrel Eiserloh, “Math for Game Programmers: Juicing Your Cameras With Math,” GDC 2016. https://www.youtube.com/watch?v=tu-Qe66AvtY — trauma decay, shake = trauma², Perlin, rotational shake in 3D.

Local truth this plan is aimed at:

- `unreal/GAME_IDENTITY.md`
- `unreal/OBJECT_SCRIPT.md`
- `unreal/BUILD_DIRECTIVE.md`
- `unreal/ASSETS.md`
- `unreal/PathOfLight/Source/PathOfLight/TailLab.cpp` (HUD, input, primitives, Niagara paths, Rat scale 4.2)
- Imported content: `/Game/Hero/Rat`, `/Game/KayKit/*`, `/Game/City/*`, `/Game/Audio/*`
