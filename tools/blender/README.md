# Blender-only asset pipeline (2026, no old workflows)

All hero models are authored in **Blender 4.2 LTS or 5.x** and shipped as
**GLB**. No FBX-with-loose-textures, no auto-rig magic, no AI-mesh imports.

## 1. File setup (do once per asset family)

- Working space: **Linear Rec.709** (indie-game default). ACEScg only for
  trailer masters in a *separate* file — never bake a view into albedo.
- Display: sRGB, View: **AgX** (or Filmic). Preview HDRI: neutral studio /
  overcast at strength **1.0** so the viewport matches three.js IBL.
- Units: meters, scale 1 unit = 1 m. Origin at **bottom-center** (feet / base)
  so Y-sort / ground contact matches the engine.
- Two UV channels: `UV0` albedo (may tile), `UV1` lightmap (non-overlapping,
  Smart UV Project, island margin 0.02–0.04).

## 2. Modelling (game-ready checklist)

1. Quads, no n-gons (script triangulates on export as safety).
2. Merge doubles, recalc normals outside.
3. Texel density consistent — big wall ≠ small bolt sharing UV space.
4. LODs for hero props if > 15k tris (LOD0 / LOD1, `_LOD1` suffix).
5. Collision proxy named `UCX_<asset>` as a separate box/capsule.

## 3. Materials — Principled BSDF only

| Slot | Rule |
| --- | --- |
| Base Color | sRGB image, values **30–240** (never pure black/white) |
| Metallic | **binary** 0 (cloth/wood/stone) or 1 (brass/copper), Non-Color |
| Roughness | 0.02–1.0, never exactly 0, Non-Color |
| Normal | OpenGL, Non-Color (flip G only for Unreal targets) |
| ORM pack | **R = AO, G = Rough, B = Metal**, Non-Color, via Separate-RGB → G/Rough, B/Metal, R → glTF occlusion slot |
| Emissive | sRGB color + strength; pure-glow props get black base + rough 1.0; strength >1 writes `KHR_materials_emissive_strength` |
| Lightmap | baked Diffuse (no color pass), Linear, 1024 min / 2048 hero |

Diya flame recipe: black base, Emission `#ffb02e`, strength **3.5** → blooms
in-engine while the brass bowl stays photographic.

## 4. Lighting the Blender viewport like the game

The in-game rig is key (warm `#ffb066`, 3.0) + teal rim (`#5ec8d8`, 1.1) +
hemisphere fill + local Lightformer IBL. Mirror it in Blender:

- Key: Sun, warm, low angle from front-right-top.
- Rim: Area/Sun, teal, from back-left.
- World: neutral studio HDRI 1.0 (look-dev), dramatic HDRI 0.3–0.5 only for
  thumbnails — never as the lighting you judge PBR by.

## 5. Export

```
blender --background --python tools/blender/export_glb.py -- assets_blend public/assets/glb
```

- Format **GLB** (mesh + materials + textures in one file).
- Batch script applies transforms, kills n-gons, checks UV1, exports.
- Smoke test: fresh scene, 1 directional (energy 1.0, neutral), 0.5-grey
  plane, grey-sphere reference next to the prop. Grey matches but prop
  doesn't → art issue. Grey washes too → import/color-space flags wrong.

## 6. Engine intake

1. Drop `.glb` in `public/assets/glb/`, load via `useGLTF`, add matching
   Rapier collider from `GreyboxLevel` dimensions (never auto-collider art).
2. Record in `ATTRIBUTIONS.md`: source `.blend`, author, licence, file list.
3. Tick `tools/blender/asset_checklist.json` and keep it beside the blend.
