# Existing Unreal game audit — 20 September 2026

Target: `PathOfLight/PathOfLight.uproject`, `/Game/Maps/TailLab`, C++ runtime in `TailLab.cpp`. The separate Desktop/Projects copy is an older Phaser game. Root React sources are another runtime. Neither was modified.

## Reproduced in the original packaged build

- The road is visually missing. Runtime logs report missing `/Game/Roads/RoadStraight`, `M_Road_Straight`, `/Game/Materials/M_Solid`, and KayKit street furniture. These assets are dynamically loaded but their directories were omitted from cooking.
- The run starts without waiting for Enter, despite the menu and launcher instructions.
- At 960×540, the weapon panel, Rath distance gauge, and score panel overlap.
- A run reached the caught/results state. Retrying reloaded the map; window capture then timed out and the test process was stopped. This is not proof of a successful retry playtest.

## Root causes and changes

| System | Finding | Change |
| --- | --- | --- |
| Packaging | Runtime-only asset paths omitted from cook | Include Roads, Materials, KayKit |
| Input | F toggles auto-cast and triggers melee; E changes weapon and casts; Space jumps and casts; duplicate action/key bindings | One binding for jump/start/retry/pause; F casts, T toggles, Q/E select |
| Combat | Manual casting bypasses automatic fire cooldown | Shared cooldown enforced inside FireMagic |
| Projectile collision | Endpoint-only tests skip enemies during long frames | Sweep full traveled segment; process candidates in travel order |
| Piercing | One projectile can damage a surviving enemy on multiple frames | Per-launch target history, reset on pool reuse |
| Explosions | Long frame overshoots the enemy and places explosion beyond it | Resolve blast at the swept impact position |
| Scoring | Kill sites multiply Flow before Award multiplies again; one fiend counts twice | Award base values and count each defeated actor once |
| Rath distance | A kill at a gap above 60m clamps it down to 60m | Use the same 70m cap as bell pickups |
| Enemy timing | Distant brutes charge from the start of the run | Activate movement within 40m of the player |
| Actor lifetime | Cleared enemies and collected pickups keep ticking | Stop their ticks and hide pickup lights |
| Results | Active projectiles can continue changing counters after finish | Deactivate projectiles and block their simulation outside a run |
| Hit stops | Game-time timers at 0.03–0.06 dilation last over a real second | Convert intended brief duration into dilated timer time |
| Feedback | Frequent kill barks overwrite upgrades and state changes | Preserve active messages; longer priority pickup cues |
| Audio | Chain reactions play identical sounds several times in a frame | Brief per-sound coalescing; preserve different cues |
| Visual timing | Cosmetic emissions vary with render frame rate | Time-based emission probabilities |
| Lighting/progression | Storm/twilight thresholds do not match authored segments; twilight starts after finish | Match segments 7/13; apply lighting on region change |
| HUD | Fixed top panels overlap; cue widths guessed from character count | Stack gauge on smaller viewports; measure and fit notification text |

## Existing design and limits

- Four selectable Astras share one run-wide tier (1–4). Weapon pickups switch the selected Astra and raise that shared tier. Switching alone does not reset it. No downgrade code was found.
- One continuous generated road has eighteen sections, three Asura lanes, shrines, bells, and modaks. Success occurs at X=108000; caught or lost bells ends the run.
- Retry opens the map again, recreating run state. The only persisted data is best score. No checkpoint save/restore or multi-level campaign exists in this runtime.
- The visible characters are static meshes with procedural bob/lean, not skeletal animation graphs. Blender import scripts and native meshes are present.
- Legacy tail attachment, cart, lever, secret and recovery scaffolding remains. The active shooter input does not establish tail attachments. No implemented illusion system was found. These are not silently replaced or advertised as functional.
- Mobile streaming, controller input, audible mix quality, full-run balance, wall occlusion, and authored mesh collision/animation quality require further validation. A desktop keyboard test cannot certify them.

## Verification

`GameplayAudit.cpp` provides an opt-in runtime console audit. In a disposable game process, pass `-PathOfLightAudit -ExecCmds="PathOfLight.Audit" -nullrhi -unattended`. It exercises real actors, checks packaged asset availability, repeated casting, pause guards, distant enemy activation, 10-FPS sweeps, pooled hit history, low-FPS explosion placement, score accounting, and completed-run projectile guards. It exits with nonzero status on failure and does not finish/save a run.

Build and playtest outcomes are recorded below after execution. Source inspection and compilation alone do not establish gameplay polish.

- Editor target compiled successfully using the installed UE 5.8 toolchain.
- All 15 actor/runtime checks passed in `UnrealEditor-Cmd -game -nullrhi` (exit 0). This validates logic and uncooked asset loading; it does not measure rendered performance or certify packaged assets.
- Re-run with `./unreal/scripts/test-gameplay.ps1 -Editor`, or omit `-Editor` to test the rebuilt Windows package.
