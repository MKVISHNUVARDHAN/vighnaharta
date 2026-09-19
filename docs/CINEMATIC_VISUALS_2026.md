# Cinematic visuals 2026 — what changed and why

## Problem
Greybox look: flat single-sun lighting, pure-color `meshStandardMaterial`
without PBR ranges, bloom threshold 0.8 (whole scene hazed), ACES applied on
the renderer *and* in the composer (double tone-map wash), no IBL so brass
read as brown plastic.

## Research (Sept 2026, current — not old tutorials)
- **three.js post 2026**: `EffectComposer` is legacy WebGL-chain; new
  `RenderPipeline` is node/MRT-based. We stay on composer (WebGL2 target) but
  adopt its rules: **tone map once at the end**, selective bloom
  (threshold ~0.85–1.0, strength 0.8–1.2), SSAO needs depth+normals, AA last,
  `OutputPass`/tone-map last, HalfFloat buffers for HDR.
  Sources: threejs.org WebGPU post-processing manual, threejsroadmap.com
  2026 post-processing guide, pmndrs/postprocessing README (linear workflow,
  `ToneMappingEffect` at end, HalfFloat for HDR).
- **Blender 4.x/5 → glTF**: Principled BSDF metal/rough core; ORM packed
  **R=AO G=Rough B=Metal**, Non-Color, G→Roughness / B→Metallic via
  Separate-RGB, R→occlusion slot; GLB single-file to avoid grey-model bug;
  albedo sRGB, data linear; emissive strength >1 via
  `KHR_materials_emissive_strength`. Views (AgX/ACES) are *preview only* —
  never baked into albedo; game assets stay Linear Rec.709.
  Sources: Blender 4.2 glTF manual, mundobytes PBR export guide,
  StraySpark 2026 game-ready checklist, BitSoul lighting/baking guide,
  Blender 5 ACES pipeline checklist.
- **Look**: teal-orange contrast (warm sunset key vs dusk-teal rim) is the
  standard festival-cinematic pairing; diyas as warm practicals motivate the
  grade instead of a global orange wash.

## What was built
| File | Change |
| --- | --- |
| `src/game3d/systems/CinematicLighting.tsx` | 3-point rig (3.0 warm key w/ 2048 shadows, teal rim 1.1, hemi fill), local Lightformer IBL (no external HDR = no hot-links), 6 flickering diya practicals, 3 additive light shafts, matched Sky+fog |
| `src/game3d/systems/PostProcessing.tsx` | Correct order: selective Bloom (1.0 threshold, mipmapBlur) → warm grade → grain → vignette → clamped CA → single ACES → SMAA; HalfFloat HDR; renderer NoToneMapping to kill double-map |
| `src/game3d/levels/FestivalDressing.tsx` | Visual-only PBR dressing (garland arches, bunting, marigold beds, rangoli) — physics untouched |
| `src/game3d/entities/Mooshak.tsx` | Principled-range fur, vermilion vest, binary-metallic brass bead + tail bell, glossy eyes, ear subsurface fake |
| `src/game3d/World.tsx` | Uses cinematic rig + dressing; PBR ground; single-tone-map handoff |
| `tools/blender/` | Blender-only pipeline: README, `export_glb.py`, `asset_checklist.json` |

## Blender handoff for the "amazing" hero assets
Author Mooshak / Vinayaka / rath / market stalls in Blender per
`tools/blender/README.md`, export with `export_glb.py`, drop in
`public/assets/glb/`, swap each `FestivalDressing`/primitive mesh for
`useGLTF` + existing Rapier collider. Lighting already expects real PBR, so
Blender Principled values transfer 1:1.
