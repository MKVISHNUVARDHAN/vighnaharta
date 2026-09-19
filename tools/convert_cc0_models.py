"""Convert downloaded CC0 GLB files to FBX for Unreal."""
import os
import bpy

src_root = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "source", "cc0-public"))
out_root = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "cc0-fbx"))
os.makedirs(out_root, exist_ok=True)

jobs = [
    (os.path.join(src_root, "gobkit", "Rat.glb"), "Rat"),
    (os.path.join(src_root, "gobkit", "Marmot.glb"), "Marmot"),
    (os.path.join(src_root, "kaykit-dungeon", "banner_red.gltf.glb"), "banner_red"),
    (os.path.join(src_root, "kaykit-dungeon", "banner_patternA_yellow.gltf.glb"), "banner_yellow"),
    (os.path.join(src_root, "kaykit-dungeon", "barrel_large.gltf.glb"), "barrel_large"),
    (os.path.join(src_root, "kaykit-dungeon", "barrel_small.gltf.glb"), "barrel_small"),
    (os.path.join(src_root, "kaykit-dungeon", "candle_lit.gltf.glb"), "candle_lit"),
    (os.path.join(src_root, "kaykit-dungeon", "crates_stacked.gltf.glb"), "crates_stacked"),
]


def convert(src, name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=src)
    for obj in list(bpy.context.scene.objects):
        if obj.type == "MESH":
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type == "ARMATURE":
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception:
                        pass
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not meshes:
        print("NO MESH", name)
        return
    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    dest = os.path.join(out_root, name + ".fbx")
    bpy.ops.export_scene.fbx(
        filepath=dest,
        use_selection=True,
        apply_scale_options="FBX_SCALE_ALL",
        object_types={"MESH"},
        axis_forward="-Y",
        axis_up="Z",
    )
    print("EXPORTED", dest)


for src, name in jobs:
    if os.path.isfile(src):
        convert(src, name)
    else:
        print("MISSING", src)
