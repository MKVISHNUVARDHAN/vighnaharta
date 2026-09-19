"""
Vighnaharta — Blender 4.2 LTS / 5.x → GLB batch exporter.
Run inside Blender (Scripting workspace or background):

    blender --background --python tools/blender/export_glb.py -- <blend-dir> <out-dir>

What it enforces (2026 game-ready checklist):
- applies all transforms (Ctrl+A equivalent), recalculates normals outside
- merges doubles, triangulates n-gons for web safety
- exports GLB (binary: mesh + PBR + textures in ONE file, no grey-model bug)
- Y-up, +Z forward off; Principled BSDF materials preserved
- ORM note: pack Occlusion=R / Roughness=G / Metallic=B, tag Non-Color,
  route G→Roughness, B→Metallic via Separate-RGB, R→occlusion slot.
"""
import os
import sys
import bpy


def clean_object(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    # Apply location / rotation / scale (checklist item: scale applied)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    # Mesh fixes
    if obj.type == 'MESH':
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles()
        bpy.ops.mesh.tris_convert()          # kill n-gons for web
        bpy.ops.mesh.normals_make_consistent(inside=False)
        # Smart UV for the lightmap channel if missing
        mesh = obj.data
        if len(mesh.uv_layers) < 2:
            bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.03)
        bpy.ops.object.mode_set(mode='OBJECT')


def export_all(blend_dir: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    blends = [f for f in os.listdir(blend_dir) if f.endswith('.blend')]
    if not blends:
        print(f'[export_glb] no .blend files in {blend_dir}')
        return
    for fname in blends:
        path = os.path.join(blend_dir, fname)
        bpy.ops.wm.open_mainfile(filepath=path)
        for obj in list(bpy.data.objects):
            if obj.type in ('MESH', 'ARMATURE') and not obj.name.startswith('_'):
                try:
                    clean_object(obj)
                except Exception as e:  # noqa: BLE001 — log and continue
                    print(f'[export_glb] clean failed for {obj.name}: {e}')
        asset = os.path.splitext(fname)[0]
        out = os.path.join(out_dir, asset + '.glb')
        bpy.ops.export_scene.gltf(
            filepath=out,
            export_format='GLB',          # single file: no missing textures
            use_selection=False,
            export_yup=True,
            export_apply=True,
            export_normals=True,
            export_materials='EXPORT',
            export_image_format='AUTO',   # reuse packed ORM as-is
            export_texcoords=True,
            export_attributes=True,
        )
        print(f'[export_glb] wrote {out}')


if __name__ == '__main__':
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    blend_dir = args[0] if len(args) > 0 else 'assets_blend'
    out_dir = args[1] if len(args) > 1 else 'public/assets/glb'
    export_all(blend_dir, out_dir)
