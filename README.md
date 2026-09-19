# Vighnaharta: Path of Light

> **17 September 2026 — new authoritative direction:** the single Tail-Tether game is now being prepared in Unreal Engine 5.8. See [Unreal project status and local deployment](unreal/README.md) and [the competition directive](unreal/BUILD_DIRECTIVE.md). The Unreal game is not playable yet: compilation is blocked by the missing Windows SDK/toolchain. The streaming web server and reference frontend build and pass a local HTTP smoke test. The older browser prototype and historical chapter notes below are retained for reference; the six minigames are no longer requirements.

A browser festival adventure about helping Ganesha's procession reach the nimarjanam ghat.

**Status: V3 free-roaming redesign in active development.** The production plan was updated 15 September 2026. Mooshak roams the connected city while Vinayaka and the procession remain on the ceremonial road. Road Rally and Modak Catch are being rebuilt first; later chapters still contain interim prototype implementations until their planned replacements land.

## Current project and intended game

The runtime combines an isometric city grid, independently moving actors and persistent chapter reactions. Generated/reference images are restricted to roadside or wall scenery and are not gameplay objects.

| Chapter | Current design direction |
| --- | --- |
| 1 — Road Rally | Direction-locked cart pushing under an approaching-rath timer. |
| 2 — Modak Catch | Physics stacking and equal-tier sweet merging on a thali. |
| 3 — Flower Festival | Planned flowing-petal garland simulation; current build is interim. |
| 4 — Dhol Utsav | Planned audio-clock sawal-jawab; current build is interim. |
| 5 — Monsoon Crossing | Planned vector-current and buoyancy crossing; current build is interim. |
| 6 — Rangoli Lightworks | Planned brass mirror/prism optics; current build is interim. |
| Farewell | The actual procession reaches the ghat for an authored nimarjanam sequence. |

Target Standard journey: 8–10 minutes, with chapter saves and retries. This is a tuning target, not a measured current duration.

## Documentation

- [Gameplay design and behaviour rules](docs/GAMEPLAY_REDESIGN.md): all six games, cameras, physics, NPCs, sound, world reactions, research, and playtest gates.
- [Asset production workflow](docs/ASSET_PRODUCTION.md): existing-image reuse, image generation, sprite/part animation, scene assembly, and quality checks.
- [Implementation plan](IMPLEMENTATION_PLAN.md): ordered work and acceptance criteria.
- [Design entry point](GAME_DESIGN_BLUEPRINT.md): current decisions and remaining discussion items.
- [Asset provenance and dependencies](ATTRIBUTIONS.md): current records and future attribution requirements.
- [Archived earlier documents](docs/archive/2026-09-13-before-consolidation/README.md): historical context only; their behaviour and release claims are superseded.

## Tools and architecture

The repository uses Phaser 3, TypeScript, React 18, Zustand, Vite, and Tailwind. Phaser owns world simulation, movement, animation, collisions, and cameras; React owns menus and HUD. The intended redesign moves authoritative challenge timing and physics out of React overlays. Web Audio supplies playback, mixing, and timing.

The built-in image-generation tool supplied the integrated Mooshak run-sheet draft from the existing character reference. It does not generate game logic or automatically rig characters. Phaser animates and controls it. Unity is not part of this project.

Existing `public/assets` images are candidates for reuse/reference. Distant backdrops can remain paintings; interactive streets, characters, instruments, carts, platforms, lamps, and water require independent objects or layers. New generated frames require consistency and animation checks.

## Run locally

Install a Node.js environment compatible with the installed dependencies, then:

```sh
npm install
npm run dev
```

Vite is configured for port 3000; use the actual local URL printed by the server if that port is occupied.

```sh
npm run build
npm run preview
```

`build` runs TypeScript checking and Vite bundling. A successful build does not validate gameplay, audio, or touch behaviour. The package also defines a lint command; this documentation update has not verified its configuration or execution.

## Verification status

The TypeScript/Vite production build and an initial browser run through Road Rally and Modak Catch pass after fixing one duplicate-key warning. The entire six-chapter run, audio feel, touch devices, gameplay balance, accessibility modes, and performance budgets still need full verification before a release can be called complete.
