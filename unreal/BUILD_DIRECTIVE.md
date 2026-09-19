# VIGHNAHARTA: PATH OF LIGHT

## FINAL COMPETITION BUILD DIRECTIVE

You are the game director, Unreal gameplay engineer, systems designer, level designer, technical artist, animator, sound designer, VFX designer, optimization engineer and ruthless playtester for:

# VIGHNAHARTA: PATH OF LIGHT

Build a COMPLETE, HIGHLY POLISHED, EXTREMELY FUN 3D arcade game for a Ganesh Chaturthi game-design competition.

This must NOT become a large collection of features.

This must NOT become six minigames.

Forget any previous requirement to preserve:

- Road Rally
- Modak Catch
- Flower Festival
- Dhol Utsav
- Monsoon Crossing
- Rangoli Lightworks

They are NOT requirements.

Only reuse an old idea if it naturally improves the new core game.

---

# 1. WIN CONDITION FOR THE PROJECT

The project succeeds if a first-time player says:

> "Again."

within seconds of seeing the results screen.

Optimize in this order:

FUN

TENSION

GAME FEEL

SURPRISE

REPLAYABILITY

COMPLETENESS

CLARITY

AUDIO

VISUAL WOW

TECHNICAL COMPLEXITY

Do not reverse this order.

Beautiful graphics cannot rescue boring gameplay.

Complex code cannot rescue boring gameplay.

Twenty mechanics cannot rescue boring gameplay.

---

# 2. THE GAME IN ONE SENTENCE

You are Mooshak, racing ahead of Lord Ganesha's moving procession through a chaotic 3D festival city, using your tail as a physics tether to swing, pull, redirect and chain-react obstacles before the procession reaches them.

THAT is the game.

Every feature must reinforce that sentence.

---

# 3. THE SIGNATURE MECHANIC

# THE TAIL TETHER

Mooshak's tail is the central gameplay system.

It is NOT merely a grapple hook.

It interacts physically with the world.

The player can use one Tail button to do different things contextually.

## FIXED HIGH OBJECT

Hold Tail:

attach.

Physics swing.

Release:

launch.

Examples:

garland rope

festival banner

bell rope

wooden beam

awning support.

---

## LIGHT PHYSICS OBJECT

Tap/hold Tail:

grab/yank object.

Examples:

basket

bucket

small box

flower tray

umbrella

light stool.

Release with momentum:

throw/slingshot.

---

## HEAVY MOVABLE OBJECT

Tail:

pull/redirect rather than lift.

Examples:

cart

trolley

small barricade

rolling platform.

Player can run sideways while tethered and alter its direction.

---

## MOVING OBJECT

Tail:

attach and SKI/SURF behind it.

Example:

cart begins rolling downhill.

Player hooks it.

Mooshak gets dragged at high speed.

Player can:

jump

release

launch.

This should be ridiculous and fun.

---

## LEVER / ROPE

Tail:

yank it while passing.

No need to stop.

Example:

Mooshak swings past a rope.

TAIL SNAP.

Flower arch rises.

Road clears.

Player continues moving.

---

## LEDGE

If the player barely misses:

tail automatically catches.

0.6–0.9 second recovery window.

Player presses Jump.

Mooshak flips back up.

Display very briefly:

CLUTCH!

Mistake becomes excitement rather than immediate frustration.

---

# 4. WHY THE TAIL IS THE GAME

One mechanic must create:

TRAVERSAL

PHYSICS

PUZZLES

ACCIDENTS

RECOVERIES

SHORTCUTS

STYLE

COMEDY

SKILL EXPRESSION.

Do not create six disconnected control systems.

Ask constantly:

"Can the Tail make this interesting?"

If yes:

use it.

If no:

question whether the feature belongs in the game.

---

# 5. CONTROLS

Keep input simple.

## DESKTOP

WASD:
movement.

SPACE:
jump.

LEFT MOUSE or SHIFT:
Tail.

Optional:

Mouse:
camera.

Do not require an additional dedicated interaction key unless absolutely necessary.

---

## MOBILE BROWSER

Left side:

virtual joystick.

Right:

JUMP.

Right:

TAIL.

Large buttons.

Thumb friendly.

Landscape orientation.

The same mechanics must work with touch.

---

# 6. MOVEMENT

Mooshak automatically accelerates while maintaining uninterrupted forward motion.

The player does NOT need a separate sprint button.

Movement should have:

acceleration

momentum

responsive turning

air control

coyote time

jump buffering

variable jump height

slope movement

controlled sliding

forgiving edge detection

excellent animation blending.

Movement needs to feel good at:

slow speed

medium speed

high speed.

---

# 7. MOMENTUM IS THE REWARD

The player's reward for playing well is SPEED.

Do not constantly award abstract buffs.

Clean movement:

increases momentum.

Bad collision:

loses momentum.

Perfect landing:

preserves or slightly increases momentum.

Tail swing released at correct time:

big momentum gain.

Moving-cart surf:

large momentum opportunity.

Mouse shortcut:

maintains maximum momentum.

The player should become better largely through SKILL.

---

# 8. PERFECT LANDING

Detect landing quality using:

vertical velocity

surface angle

movement direction

input direction

impact angle.

BAD:

Mooshak rolls/stumbles briefly.

Momentum loss.

GOOD:

continue naturally.

PERFECT:

strong satisfying impact.

Tiny camera impulse.

Dust/petal burst depending environment.

Distinct:

THUMP.

Small text:

PERFECT.

Speed boost.

Do not freeze gameplay.

---

# 9. THE REAL TENSION SYSTEM

# THE PROCESSION IS ACTUALLY MOVING

Do not use a generic countdown as the main tension mechanic.

The Rath/procession follows the central ceremonial route behind Mooshak.

Display a clean indicator:

PROCESSION

[ Rath ] ━━━━━━━━━━━ [ Mooshak ]

64m

This distance is real gameplay state.

---

# 10. PROCESSION PRESSURE

When Mooshak is fast:

distance increases.

When player struggles:

distance decreases.

At approximately:

70m+
relaxed celebration.

50m:
extra percussion.

35m:
procession becomes audibly closer.

25m:
NPCs begin calling warnings.

15m:
dhol behind player becomes powerful.

10m:
subtle screen edge / positional cues.

5m:

PURE PANIC.

But do NOT make the procession attack or crash.

---

# 11. THREE-BELL FAILURE SYSTEM

Do not instantly end the game on one failure.

If the procession reaches an uncleared gate:

it safely pauses.

A ceremonial bell rings.

PLAYER LOSES ONE BELL.

Example:

🔔 🔔 🔔

After first stop:

🔔 🔔

Player immediately receives another chance.

Second:

🔔

Third failed stop:

the route could not be prepared before the ceremony window.

Run ends.

This gives:

stakes

panic

recovery

drama

without brutal frustration.

Never depict harm to Lord Ganesha or devotees.

---

# 12. PANIC MUST COME IN WAVES

Do NOT keep the game at maximum intensity constantly.

Use an intensity rhythm.

Approximately:

10–20 seconds CONTROL

then

8–15 seconds CHAOS

then

3–8 seconds RELEASE

then build again.

Example:

Player exits a calm alley.

Music drops slightly.

They see open market.

Then:

cart starts rolling

NPC crosses

awning drops

procession audio gets closer.

CHAOS.

Player survives.

They emerge onto roof.

Beautiful sunset.

Two seconds to breathe.

Then next problem.

This rhythm is critical.

Constant panic becomes exhausting.

Contrast creates tension.

---

# 13. BUILD A FESTIVAL DIRECTOR

Implement a lightweight adaptive intensity system.

Track:

player speed

distance from procession

recent collisions

recent perfect actions

Tail success rate

current score chain

recent panic intensity.

Use it to select SAFE predefined events.

If player is struggling:

reduce moving hazards.

provide recovery route.

place easier Tail anchor.

give slightly more distance.

If player is dominating:

activate:

moving carts

crowd crossings

falling flower baskets

fast shortcut

rolling barrels

bonus physics setups.

Never spawn unfair hazards directly on the player.

The system should feel unpredictable but fair.

---

# 14. NO GENERIC ENEMIES

There is no combat.

There are no monsters.

There are no weapons.

The CITY is the challenge.

Interesting danger comes from:

momentum

geometry

crowds

physics

rain

carts

moving props

narrow routes

mistiming.

---

# 15. PHYSICS CHAOS

The city needs to feel physically playful.

Use Unreal Chaos carefully.

Interactive objects can include:

carts

baskets

flowers

fruit

wooden boxes

umbrellas

pots

empty buckets

festival drums

stools

sign boards

light barricades

fabric

small rolling objects.

---

# 16. CONTROLLED CHAOS

Physics should create:

"WHAT JUST HAPPENED 😂"

not:

"the game broke."

Critical pieces must:

have force caps

reset if lost

avoid permanent route blockage

have safe collision layers

sleep when not active.

Never allow random physics to make the level impossible.

---

# 17. CHAIN REACTIONS

Create handcrafted systemic setups.

Example:

Player yanks rope.

↓

Canopy rotates.

↓

Hits hanging basket.

↓

Basket drops flower petals.

↓

Basket bumps cart.

↓

Cart rolls.

↓

Player Tail-hooks cart.

↓

CART SURF.

↓

Player jumps from cart.

↓

Grabs garland.

↓

Swings over blocked lane.

This should happen seamlessly.

Do not turn it into a cutscene.

---

# 18. MAKE ACCIDENTS USEFUL SOMETIMES

Not every mistake should be punishment.

Example:

Player misses intended jump.

lands on umbrella.

umbrella flips.

player gets launched upward.

accidentally reaches balcony shortcut.

The game should occasionally produce:

"I totally meant to do that."

moments.

These are highly memorable.

---

# 19. THE CITY STRUCTURE

DO NOT BUILD A HUGE OPEN WORLD.

Create ONE continuous 3D route with three strong acts.

Approximately 3–5 minutes total.

# ACT I — FESTIVAL BAZAAR

Mood:

joy

color

discovery.

Teach:

movement

jump

Tail pull

Tail swing

moving objects.

Environment:

market stalls

flowers

modaks

banners

warm sunset.

Player learns:

the city is a playground.

---

# ACT II — MONSOON PANIC

A quick monsoon shower arrives.

Not disaster.

Just sudden festival chaos.

Wind moves:

cloth

umbrellas

decorations.

Rain creates:

wet roads

puddles

slightly changed friction.

Carts begin rolling.

People hurry beneath awnings.

Mooshak can:

surf rolling cart

swing between awnings

use umbrellas as temporary bounce/cover objects

use drainage gaps as mouse routes.

Procession becomes closer.

This is the main panic act.

---

# ACT III — GHAT RUSH

Rain passes.

Twilight.

Diyas begin glowing.

The procession is very close.

Reuse EVERYTHING player learned.

NO major new mechanics.

Fast:

swing

pull

cart surf

jump

shortcut

physics reaction

clutch save

perfect landing.

The final thirty seconds should be mastery.

---

# 20. MOUSE SCALE IS A MAJOR FEATURE

Do not construct normal human-sized levels and shrink the protagonist.

The city must provide two simultaneous realities.

## HUMAN WORLD

roads

stairs

shops

crowds.

## MOOSHAK WORLD

under carts

through drains

behind crates

inside stall supports

beneath tables

through tiny wall holes

along awnings

between flower pots

across ropes.

The player should repeatedly think:

"WAIT, I CAN GO THROUGH THERE?"

---

# 21. SECRET MOOSHAK ROUTES

Every major segment should ideally have:

SAFE ROAD

SKILLED ROUTE

SECRET MOOSHAK ROUTE.

Safe:

easy

slow.

Skill:

faster

requires traversal.

Secret:

very fast

requires observation + Tail mastery.

Do not put giant arrows over every secret.

Let players discover them.

---

# 22. STYLE CHAIN

Reward continuous expressive play.

Call it:

# SEVA FLOW

Not merely collecting coins.

Actions contributing:

perfect landing

Tail swing

cart redirect

clutch save

near miss

secret route

helpful chain reaction

clean traversal.

Build:

×1

×2

×4

×6

×8

×12.

Do not make x12 trivial.

---

# 23. SEVA SURGE

When player maintains maximum Flow:

trigger:

# SEVA SURGE

For approximately 8 seconds:

Mooshak receives golden light trail.

Festival music reaches full arrangement.

Diyas react nearby.

Petals move in his slipstream.

Perfect actions generate stronger score.

Tail targeting becomes slightly more forgiving.

Speed becomes exhilarating.

BUT:

Festival Director also activates the harder variant of upcoming events.

Power + danger.

Do NOT make player invincible.

---

# 24. THE PATH OF LIGHT

Every major act of Seva creates a subtle golden light pulse.

It moves along the ground behind Mooshak.

Successful sections gradually form:

THE PATH OF LIGHT.

This is not simply a shader everywhere.

It should visually mark:

where the player succeeded.

At the finale:

the city route behind the player glows subtly from accumulated actions.

This connects gameplay to the title.

---

# 25. DO NOT FORCE OLD MINI-GAMES INTO THIS

Specifically:

Do not add Suika.

Do not add Guitar Hero UI.

Do not add laser puzzle scenes.

Do not add separate Frogger scenes.

Do not add Rush Hour puzzles.

Do not add sand simulation simply because an old design contained them.

ONLY reuse a festival object if it improves the Tail/momentum/physics game.

Example:

Flower garland?

YES if swingable.

Dhol?

YES as reactive sound/world object.

Modak?

YES as a movement trail.

Rangoli?

YES visually.

Not as mandatory separate games.

---

# 26. STORY PRESENTATION

No long exposition.

Opening should be under approximately 12 seconds.

Suggested sequence:

Sunset.

Festival city.

The Rath begins moving.

Mooshak stands ahead.

A sudden gust knocks one festival banner loose.

It catches a stack of baskets.

A cart begins rolling.

NPC:

"Mooshak! The route!"

Camera drops behind him.

TEXT:

RUN AHEAD.

CLEAR THE VIGHNAS.

Control.

Story happens WHILE PLAYING.

---

# 27. ENVIRONMENTAL STORY

As player progresses:

people recognize Mooshak.

NPCs point.

vendors react.

children cheer.

musicians join procession.

diyas light.

decorations become orderly.

The city becomes visibly more prepared.

Do not explain this through text.

SHOW IT.

---

# 28. NPC REACTIONS

Nearby people should react to physics.

Cart rolls near vendor:

vendor jumps away.

Mooshak flies over someone:

they look upward.

Bucket clangs:

people look toward sound.

Perfect chain:

people cheer.

Seva Surge:

petals thrown.

Mouse uses hidden gap:

child NPC points excitedly.

These interactions make the world feel alive.

---

# 29. CITY INTERACTIVITY

Create a hierarchy.

## HERO INTERACTIVE

full physics / special reactions.

## SIMPLE INTERACTIVE

animation or one-shot response.

## DECORATIVE

static.

Do NOT simulate every object.

Aim to make the street FEEL interactive rather than making every plate physically simulated.

---

# 30. SOUND IS HALF THE GAME

Do not leave sound until the end.

Every physical object should sound materially different.

Examples:

wood cart:
deep rolling + wooden clunk.

brass pot:
metallic ring.

bucket:
CLANG.

flower basket:
soft rustle.

cloth:
flutter.

umbrella:
FWUMP.

puddle:
splash.

Tail attach:
snap/whoosh.

Tail tension:
subtle rope strain.

perfect release:
whip.

landing:
impact based on surface.

---

# 31. UNREAL METASOUNDS

Use MetaSounds where practical for responsive procedural layers.

Dynamic festival soundtrack layers:

ambient crowd

tanpura-like tonal bed

manjira

dhol

tasha

bells

celebration layer.

Do not simply crossfade full MP3 tracks.

Performance changes music.

---

# 32. PROCESSION AUDIO CREATES FEAR

The player should sometimes know the procession is close WITHOUT looking at HUD.

Use positional sound.

Far:

distant dhol.

Closer:

stronger bass.

Very close:

crowd

bells

dhol reflections from buildings.

If the player turns camera:

they should occasionally SEE the Rath approaching far behind.

That produces panic.

---

# 33. MUSIC AND ACTION

Whenever possible, gameplay SFX should rhythmically complement music.

Example:

TAIL SNAP

on beat.

Cart collision:

DHUM.

Perfect landing:

bass accent.

Seva Flow milestone:

tasha fill.

Do not force strict rhythm gameplay.

The player should simply FEEL musical.

---

# 34. VISUAL DIRECTION

Do NOT chase photorealism.

Target:

# STYLIZED CINEMATIC INDIAN FESTIVAL

High-quality but readable.

Reference qualities:

strong silhouettes

rich saturation

clear traversal objects

soft cinematic lighting

expressive animation

beautiful depth.

Palette:

marigold orange

saffron

red

brass

turquoise

pink

warm wood

wet blue-gray road

golden diya light.

---

# 35. LIGHTING PROGRESSION

ACT I:

golden sunset.

ACT II:

storm cloud + rain but still colorful.

ACT III:

post-rain twilight.

FINALE:

deep blue/purple evening with warm lamps.

This creates visual progression during one short run.

---

# 36. HERO VISUAL MOMENTS

Mandatory visual memories:

1. First high-speed Tail swing.

2. Cart surfing through market.

3. Physics chain reaction showering flower petals.

4. Sudden monsoon arrival.

5. Near-failure Tail clutch.

6. Seva Surge.

7. Rath seen close behind player.

8. Entire diya-lit Ghat approach.

9. Camera turns around and reveals transformed city.

---

# 37. MODELS

Models must look coherent and intentional.

Do NOT produce random asset soup.

Use existing legally permitted models where they meet quality.

Use Blender MCP for:

customization

optimization

retopology

UV adjustments

material normalization

animation cleanup

rigging

custom hero modeling

LOD preparation

collision meshes.

---

# 38. ASSET SOURCING STRATEGY

Do not manually model generic objects if a strong licensed model already exists.

Search for:

Indian-style buildings

market stalls

carts

baskets

pots

vegetation

umbrellas

fabric props

crowd bases

street props

boats

crates.

Record everything in:

ASSETS.md

For each:

Asset

Source

Author

License

Changes.

Never use assets with unclear permission.

---

# 39. CUSTOM HERO ASSETS

Spend custom effort on things the player remembers:

MOOSHAK

RATH

respectful GANESHA centerpiece

signature carts

festival arch

hero ghat

important garlands

Tail animation.

Generic crate #14 does not deserve custom modelling.

---

# 40. MOOSHAK QUALITY BAR

Mooshak is the star.

He requires:

strong silhouette

cute face readable at gameplay distance

large expressive ears

excellent tail

responsive body animation

speed lean

anticipation

landing squash

clutch animation

swing animation

cart surfing pose

small idle personality.

No uncanny realism.

---

# 41. MOOSHAK TAIL TECH

The tail needs both:

visual rig

gameplay tether representation.

Use:

skeletal animation

SplineMesh / Cable-like visual where useful

physics constraint calculations

IK / Control Rig where useful.

Do not let exact physical tail simulation make controls unreliable.

GAMEPLAY FEEL wins over realism.

The Tail should snap convincingly toward valid anchors even if some hidden assistance is used.

---

# 42. TARGET ASSIST

Tail interaction must work at speed.

Implement contextual targeting cone.

Score potential targets using:

camera direction

distance

player velocity

target type

angle.

Show subtle highlight only when needed.

The player should feel skilled.

Do not require pixel-perfect aiming at 50 km/h.

---

# 43. CAMERA

Third-person elevated chase camera.

At low speed:

closer.

At high speed:

slightly wider FOV.

Tail swing:

camera anticipates trajectory.

Big launch:

camera pulls back subtly.

Never:

constant camera shake.

Never:

camera clipping through stalls.

Never:

cinematic camera fighting the player.

---

# 44. SCORE

One main number:

# SEVA SCORE

Score from:

clearing Vighnas

speed

Flow

perfect landings

Tail skill

secret routes

close calls

unbroken procession

remaining bells.

Keep scoring explainable.

---

# 45. RESULTS

Show:

VIGHNAHARTA
PATH OF LIGHT

SEVA
38,420

NEW BEST

Procession Stops: 0

Max Flow: ×12

Perfect Landings: 14

Tail Saves: 3

Secret Routes: 4/6

Physics Chains: 5

Time: 03:19

Rank:

GOLD

Buttons:

AGAIN

HOW TO PLAY

Replay must happen quickly.

---

# 46. FAILURE

Do not make failure tedious.

If all three bells are lost:

quick camera of procession safely paused.

Text:

THE PATH NEEDED MORE TIME.

Show score.

RETRY.

Player should be back in gameplay quickly.

No 30-second cutscene.

---

# 47. FINALE

When player clears final gate:

pressure ENDS.

HUD fades.

Music reduces.

Mooshak reaches the ghat.

Camera turns around.

Show:

city

lit diyas

repaired route

NPCs

flowers

Path of Light

procession approaching safely.

Everything the player did should feel visible.

Then respectful ceremony at the ghat.

No arcade jokes during this part.

One final interaction:

Mooshak lights a small diya / releases petals.

Then:

GANPATI BAPPA MORYA

पुढच्या वर्षी लवकर या

THEN results.

---

# 48. FIRST 60 SECOND SCRIPT

This must be handcrafted.

0–5 seconds:

immediate control.

5–12:

simple running.

12–18:

first jump.

18–25:

player Tail-yanks tiny barrier.

25–32:

player sees first overhead garland.

Tail swing.

Launch.

32–40:

cart starts rolling unexpectedly.

Player can:

avoid it

or

Tail-hook it.

40–48:

cart surf.

48–55:

jump from cart.

55–60:

perfect landing.

Music grows.

Procession distance appears:

48m.

Player realizes:

OH. I HAVE TO MOVE.

If these 60 seconds aren't extremely fun:

STOP CONTENT DEVELOPMENT.

FIX THEM.

---

# 49. FUN TEST

The greybox should already make testers laugh or retry.

Build first:

flat street

ramps

cart

bucket

rope

mouse tunnel

ledge.

No festival art.

Test:

movement

jump

Tail

swing

cart surf

clutch

procession.

If people don't enjoy it:

do NOT build pretty buildings.

---

# 50. 10-MINUTE TEST

Give greybox to someone.

Do not explain controls beyond:

move

jump

Tail.

Observe.

Need to see:

experimentation.

Player intentionally hits objects.

Player attempts second Tail swing.

Player deliberately hooks cart again.

Player tests hidden gap.

Player retries after failure.

If they don't:

mechanic needs work.

---

# 51. UNREAL ENGINE

Use Unreal Engine 5 as authoritative game runtime.

Prefer:

Blueprints for rapid iteration.

C++ only where useful.

Recommended Unreal systems:

Enhanced Input

Chaos Physics

Niagara

Animation Blueprints

Control Rig

MetaSounds

Spline components

Level Instances / Packed Level Actors

Data Assets

Object Pooling

Gameplay Tags where useful.

Do not build enterprise architecture for a four-minute game.

---

# 52. GRAPHICS FEATURES

Use high-end features ONLY if stable.

Pixel Streaming high profile may use:

strong dynamic lighting

higher effects

better shadows

better reflections.

Do NOT blindly enable every UE feature.

Performance stability > checkbox features.

Test:

Lumen

Virtual Shadow Maps

Nanite

individually.

Keep them only where they materially improve image quality within performance budget.

---

# 53. TWO QUALITY PROFILES

## PIXEL STREAMING HIGH

Primary visual version.

Target:

1080p

stable 60 FPS where hardware allows.

Higher:

VFX

lighting

crowd density

shadows.

---

## MOBILE/NATIVE SCALABLE

Optional native Android fallback.

Reduced:

shadow quality

crowd count

particle count

reflection quality

post processing.

Gameplay must stay identical.

---

# 54. BROWSER DELIVERY WITH UNREAL

The primary browser submission uses:

# UNREAL PIXEL STREAMING

Architecture:

Browser
↓
Custom Pixel Streaming frontend
↓
WebRTC
↓
Signalling / networking
↓
GPU host
↓
Packaged Unreal game.

The game itself renders on the GPU host.

The browser receives video/audio and sends controls.

---

# 55. DO NOT SHARE ONE GAME INSTANCE BETWEEN PLAYERS

Each player should get an independent game session.

Do not allow multiple campus players to simultaneously control the same Unreal instance.

Use:

1 PLAYER
=
1 ACTIVE UNREAL SESSION.

For competition deployment, a small fixed pool is acceptable initially.

If all sessions are occupied:

show a clean queue screen.

Do not let inputs mix between players.

---

# 56. PIXEL STREAMING FRONTEND

Build a clean webpage.

Desktop:

stream fills viewport.

keyboard/mouse captured.

Mobile:

stream fills landscape viewport.

overlay:

virtual joystick

Jump

Tail.

Include:

mute

fullscreen

connection state

retry.

No Unreal branding clutter.

No developer controls.

---

# 57. NETWORKING

Configure:

signalling

WebRTC

STUN/TURN where required.

Test using an external mobile network, NOT merely localhost/Wi-Fi.

The real test:

phone on mobile data

opens public contest URL

plays game.

Also test:

college Wi-Fi

desktop Chrome

mobile Chrome

mobile Safari.

---

# 58. PIXEL STREAMING LATENCY

This is a movement game.

LATENCY MATTERS.

Host the GPU geographically close to expected Indian players/judges.

Prefer direct low-latency peer path where networking allows.

Measure:

input-to-frame response.

If Tail/jump feels delayed:

fix streaming configuration before adding content.

---

# 59. BROWSER DELIVERY IS AN EARLY QUALITY GATE

DO NOT wait until final day to test Pixel Streaming.

Before major art production:

package a greybox Unreal build.

stream it publicly.

open it from:

laptop browser

Android browser.

Verify:

movement

jump

Tail

sound

restart

touch.

If this pipeline is not reliable:

solve it immediately.

A beautiful game that judges cannot open loses.

---

# 60. BACKUP DISTRIBUTION

Also create:

Windows packaged build.

Optionally:

Android APK if time permits.

These are backups/bonus distributions.

The competition browser URL remains primary.

---

# 61. PERFORMANCE AND PIXEL STREAMING

Optimize host GPU workload.

Target stable frame pacing.

Use:

LODs

instancing

culled crowds

texture budgets

limited dynamic physics

pooled Niagara

optimized skeletal meshes

reasonable post processing.

Pixel Streaming does not mean performance is free.

---

# 62. COMPLETE GAME BEFORE EXTRA CONTENT

Before adding a fourth clever city event, verify:

Main menu works.

Play works.

Run can finish.

Run can fail.

Score works.

Finale works.

Results work.

Retry works.

Browser link works.

Mobile controls work.

No blocker bug.

Only then add more.

---

# 63. PRODUCTION ORDER

## GATE 0 — DEPLOYMENT

Create minimal UE project.

Package.

Pixel Stream.

Verify laptop/mobile.

---

## GATE 1 — FUN

Greybox:

movement

jump

Tail tether

Tail swing

cart pull

cart surf

ledge save.

No art.

Must be fun.

---

## GATE 2 — TENSION

Add:

procession

distance

three bells

adaptive intensity.

Must produce panic.

---

## GATE 3 — 60 SECOND SLICE

Create polished first street.

Real Mooshak.

Real audio.

Physics.

First chain reaction.

Must make testers retry.

---

## GATE 4 — COMPLETE LOOP

Build:

three acts

final approach

finale

score

restart.

Now the game is COMPLETE.

---

## GATE 5 — VISUAL QUALITY

Replace generic models.

Blender cleanup.

Lighting.

materials.

VFX.

city dressing.

---

## GATE 6 — AUDIO QUALITY

Finish dynamic mix.

Prop SFX.

Procession spatial audio.

---

## GATE 7 — POLISH

Fix:

camera

animation

collision

tutorial

confusion

stream latency

mobile controls.

---

# 64. CUT LIST

If deadline pressure appears, REMOVE:

extra districts

online accounts

inventory

skill trees

quests

NPC dialogue system

procedural city generation

complex leaderboard backend

extra weather

additional mechanics

cinematics.

NEVER REMOVE:

Tail

good movement

procession pressure

physics

first minute

complete ending

score

retry

browser delivery.

---

# 65. CONTEST NORTH STAR

The judge should remember:

> "That Ganesh festival game where you're tiny Mooshak and your tail is basically a physics grappling rope. I hooked onto a runaway cart, got dragged through the bazaar, flew off a flower garland and barely cleared the road before the procession arrived."

THAT is the target.

Not:

> "They had six minigames."

Not:

> "It had a lot of features."

Not:

> "The graphics were nice."

Build ONE memorable game.

---

# 66. FINAL RULE

Every development decision must answer:

DOES THIS MAKE THE NEXT 10 SECONDS MORE FUN?

If not:

don't add it.

Start with deployment verification and the ugly Tail-Tether greybox NOW.