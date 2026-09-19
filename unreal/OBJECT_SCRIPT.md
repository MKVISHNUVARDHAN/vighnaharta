# Vighnaharta — object, hold, win/lose, tension script

Fun first. Then clarity. Then tension. Then panic. Then wow.

The player is Mooshak (Mushika), a small brown mouse with huge ears and a long tail. They auto-run toward the ghat. The Rath (Ganesha’s procession) follows on the **center of the same road**. Nothing moves itself out of the Rath’s way. Mooshak must.

## Win and lose (always on screen)

- **WIN:** Open every red **GATE** on the center road, then reach the ghat.
- **LOSE:** The Rath reaches a still-closed gate **3 times**. Each time costs one **BELL**. Three bells gone = the path needed more time.
- Skipping a swing, cart, or basket never fails the run. Skipping a **GATE** can.

## What HOLD SHIFT does (one button, four jobs)

Hold only while a prompt is on an object. The job depends on the object’s **color + shape**.

| See | Color | Hold means | When to release | If you leave it |
|---|---|---|---|---|
| Tall red wall + gold pole on the **center line** | RED | Keep holding until it SNAPS open (~0.2s) | After it snaps (auto) | Rath will stop here. Bell lost. |
| Glowing gold ball **above** the street | GOLD | Swing. Keep holding to stay on the rope | Release when you want to **fly forward** | You just take the slow ground. Safe. |
| Wooden cart with wheels, **right lane** | BROWN | Surf / get dragged | Release or jump to leave | Cart keeps rolling. You can crash. |
| Orange bowl / basket / umbrella | ORANGE | Yank it | Release to throw | It stays. Optional. |

If you hold with **nothing targeted**, nothing happens. Wait for the gold box prompt.

## Placement (why it sits there)

The center strip is the Rath’s ceremonial line. Gates live **only** there, because that is the only line the procession cannot leave.

1. Empty street — teach steer + jump.
2. One orange basket on the right — teach yank.
3. One gold swing overhead — teach hold then release.
4. One brown cart in the right lane — teach dodge or surf.
5. First red gate dead-center — teach “this one matters.”
6. Mixed street after that: basket → swing → cart → gate, repeating.
7. Sidewalks: people and stalls. Not fail objects.
8. Far-left ramp: optional mouse shortcut. Faster, never required.

## How each object behaves

- **Mooshak:** always runs forward. Steer, jump, Tail. Momentum is the reward.
- **Rath:** follows center road. Never attacks. Pauses only at a closed gate.
- **Gate:** locked until Tail snap. Then slides off the road. If Rath arrives first: ceremonial stop, bell −1, gate forced open, you get another chance.
- **Swing:** springy rope. Release at the front of the arc for a launch.
- **Cart:** rolls when you are near. Chaos makes it faster. Surf it for speed.
- **Basket:** light physics. Chaos can drop extras **ahead**, never on you.
- **People:** look up, dodge carts, cheer on Surge. No collision fail.
- **Diyas / Path of Light:** mark where you succeeded. Not obstacles.

## Tension then panic

Distance is real.

- 70m+: safe, city celebrates.
- 25m: “THE RATH IS CLOSE.”
- 15m: red edges, camera peeks back.
- 5m: PURE PANIC — still no crash.
- You skipped a gate: “GATE LEFT BEHIND — THE RATH WILL STOP THERE.” That is the “I must not lose” feeling.

Chaos waves (8–15s) add rolling carts and a dashing devotee. Release waves (3–8s) let you breathe.

## VFX (Niagara, engine templates — not grey cubes)

| Moment | System | Sound |
|---|---|---|
| Perfect / juice | RadialBurst | steel jingle + wood hit |
| Gate snap | SimpleExplosion (small) | latch + bell |
| Tail catch | DirectionalBurst | cloth |
| Seva Surge / start / win | Fountain | surge jingle + tabla swell |
| Rath close | (camera arm longer + crowd louder) | crowd bed |

Particles are Epic Niagara templates (free with the engine). Audio is Kenney CC0 + festival tabla/crowd already in this repo.

## Teaching order (first minute)

WASD → jump → orange yank → gold swing+release → brown cart → red gate snap. Then the real run.
