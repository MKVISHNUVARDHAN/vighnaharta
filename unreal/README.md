# Vighnaharta: Path of Light — Unreal 3D game

This is the native Unreal Engine 5.8 project with Mooshak, four Astras, Asura enemies, weapon shrines, bells, and the Rath chase. The React app at the repository root and the other Desktop/Projects copy are separate prototypes.

Read [the current gameplay audit](GAMEPLAY_AUDIT.md) for reproduced problems, fixes, and remaining verification. The historical Tail Lab description below predates the current shooter implementation and must not be used as its current feature list.

## Launch and controls

From the repository root, run `./unreal/scripts/run-game.ps1` to launch the packaged Windows game. Source changes require a rebuild and cook before this executable includes them.

Enter starts/retries; A/D or arrows steer; Space jumps; 1–4 or Q/E select Astras; T toggles auto-cast; F, mouse buttons, or Shift cast; Escape/P pauses; R restarts. Weapon shrines select their Astra and raise the shared run tier, capped at four. Run state resets on restart; only best score persists.

## Build and regression checks

`./unreal/scripts/build-local.ps1` compiles the editor, preserves an existing TailLab map, then builds and cooks the Windows package. The cook must include dynamically loaded Roads, Materials, KayKit, Hero, City, Rath, Env, Demons, Astras, Weapons, and Audio assets.

The development build offers isolated checks using `-PathOfLightAudit -ExecCmds="PathOfLight.Audit" -nullrhi -unattended`. Run this in a disposable process. Look for `GAMEPLAY_AUDIT COMPLETE: 0 failures`; exit status is nonzero on failure. These checks complement visual and audible playtests.

---

## Historical implementation and streaming notes

# Vighnaharta: Path of Light — Unreal Tail Lab

This is the new **Unreal Engine 5.8.2** project for the supplied competition directive. The React project at the repository root is the earlier browser prototype; it is not the authoritative runtime for this build.

## Current status

**Editor target now compiles on this machine.** That is not a packaged stream or a finished competition game.

- UnrealBuildTool compiles `PathOfLightEditor` Win64 Development with VS 2022 14.44 and Windows SDK 10.0.22621. See `reports/editor-build.txt`.
- Play the Tail Lab from the editor with `/Game/Maps/TailLab -game`. Full Windows packaging and Pixel Streaming still need a separate cook.
- The UE5.8 signalling server and reference browser frontend built successfully with Node 24.16.0. The local HTTP player-page smoke test passed; the temporary test server was then stopped. See `reports/streaming-setup-local.txt` and `reports/signalling-smoke.txt`. This does not verify an Unreal video stream.
- Hardware reports Intel UHD Graphics. Encoder compatibility, frame rate and latency are unverified.
- User selected local deployment; no GPU hosting account, public URL, TURN service or external network test is configured.
- Do not begin final art production until a packaged game streams successfully and the Tail Lab is playtested.

## Implemented source, awaiting compilation and playtest

The compact runtime builds a continuous primitive test road with side ramps, low passages, anchors, light physics props, moving carts and clearable gates. The runner has automatic forward movement, steering, variable jump release, coyote time and jump buffering. A contextual targeting cone and visibility check choose Tail targets. Tension preserves tangential velocity at fixed anchors; dynamic objects receive capped forces; moving carts pull the runner; levers clear safely. A missed street edge offers a short recovery opportunity.

The prototype also contains procession distance, recoverable gate stops, three bells, pressure waves, Flow scoring, a timed Surge, basic results, local best score and immediate retry. These are initial implementations; none is claimed to meet the fun or polish bar yet. The three act labels and wet-friction section are test scaffolding, not finished environments. The renderer uses temporary engine primitives, not custom Blender models.

Not implemented: final models/animation, sound and MetaSounds, rain/VFX, handcrafted first minute, chain reactions, secret-route scoring, Path of Light, ceremonial finale, custom touch frontend, queue/session pool, external streaming validation. The repeated greybox sections are test fixtures, not the final level design.

## Prerequisites

Install Visual Studio 2022 Build Tools with C++ desktop tools and a Windows SDK. The installed UE5.8 configuration specifies:

- Windows SDK minimum `10.0.19041.0`, preferred `10.0.22621.0`.
- Preferred VS2022 MSVC family `14.44`; versions earlier than `14.44.35211` in that family are banned by this engine.

These requirements are read from `Engine/Config/Windows/Windows_SDK.json`. Use the Visual Studio Installer to select C++ build tools and the Windows 11 SDK 22621 component; `PathOfLight/.vsconfig` records the components for a Visual Studio installation. Compilation may need additional fixes after SDK validation passes; the current build failed before compiling C++.

Codex cannot cross the Windows UAC boundary in this session. Open **PowerShell as Administrator** and run:

```powershell
& 'C:\Users\vishnu vardhan\OneDrive\Desktop\projects\vighnaharta\unreal\scripts\install-unreal-toolchain.ps1'
```

## Local build and stream

Run from the repository root in PowerShell:

```powershell
./unreal/scripts/build-local.ps1
./unreal/scripts/setup-streaming.ps1
./unreal/scripts/test-signalling.ps1
./unreal/scripts/start-local.ps1
```

`build-local.ps1` compiles the editor target, creates `/Game/Maps/TailLab` with the Unreal Python editor API, then builds/cooks/packages Windows. It stops on failure. It never overwrites an existing authored map.

`setup-streaming.ps1` obtains Epic's UE5.8 infrastructure and runs its npm dependency installation and `build:all:cjs` script using installed Node 22.15+ (Node 24 is present here). This avoids upstream's older bundled Node 22.14. `start-local.ps1` requires both the packaged executable and the compiled signalling server before starting anything. It runs a 1280×720 offscreen stream on localhost:8080 and stops its child processes when interrupted. Start at 720p to measure this machine before trying 1080p.

The signal server is configured with **max_players=1** per streamer. This rejects a second subscriber; it is not a queue or a multi-instance session broker. Do not expose this local test as the public contest deployment. A public pool needs one Unreal process per allocated player, a proper admission/queue service, HTTPS and appropriate STUN/TURN configuration.

Controls: Enter starts; WASD steers/adjusts pace; Space jumps; hold Shift or left mouse for Tail; release launches; R retries; Escape pauses. The bundled stock streaming frontend is for deployment diagnostics only. Custom mobile controls and the polished frontend are still pending.

## Required acceptance evidence

1. Compiler, map generation and Windows packaging all pass.
2. Local browser receives actual Unreal video and audio, and keyboard controls work.
3. Second subscriber cannot control the same process.
4. Movement, anchor swing, pull, cart surf, clutch, three-bell failure, successful finish and retry are manually exercised.
5. Ten-minute human playtest confirms players voluntarily retry.
6. Add touch frontend; test Android and iOS landscape controls including focus loss/reconnect.
7. Only then arrange the public GPU host and test mobile data/campus Wi-Fi latency.

## Sources and assets

The directive is preserved in `BUILD_DIRECTIVE.md`. `ASSETS.md` records the temporary engine meshes. Future artwork must be free, legally usable online models with source, author and license recorded before import. Blender is reserved for strictly necessary cleanup.

- [Epic Pixel Streaming getting started](https://dev.epicgames.com/documentation/unreal-engine/getting-started-with-pixel-streaming-in-unreal-engine)
- [Epic streaming infrastructure, UE5.8](https://github.com/EpicGamesExt/PixelStreamingInfrastructure/tree/UE5.8)

Infrastructure checkout used during preparation: `d00debf347bb06bd5f3df552ab0b8e412e43b374`. The launch flags were checked against that revision's `SignallingWebServer/src/index.ts`.
