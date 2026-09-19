import os
import bpy

src = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "source", "kaykit-city"))
out = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "kaykit-fbx"))
os.makedirs(out, exist_ok=True)

files = [
    "building_A.gltf",
    "building_B.gltf",
    "building_C.gltf",
    "bench.gltf",
    "box_A.gltf",
    "bush.gltf",
    "streetlight.gltf",
]

for name in files:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path = os.path.join(src, name)
    bpy.ops.import_scene.gltf(filepath=path)
    dest = os.path.join(out, os.path.splitext(name)[0] + ".fbx")
    bpy.ops.export_scene.fbx(
        filepath=dest,
        use_selection=False,
        apply_scale_options="FBX_SCALE_ALL",
        object_types={"MESH", "EMPTY", "ARMATURE"},
    )
    print("EXPORTED", dest)
