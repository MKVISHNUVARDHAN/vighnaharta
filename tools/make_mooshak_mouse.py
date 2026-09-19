"""Build a readable low-poly mouse (huge ears, snout, long tail) and export FBX."""
import os
import bpy
import math

out_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "hero"))
os.makedirs(out_dir, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)


def mesh(name, primitive, loc, scale, rot=(0, 0, 0)):
    if primitive == "uv":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, location=loc)
    elif primitive == "ico":
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, location=loc)
    elif primitive == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, location=loc)
    else:
        bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


body = mesh("body", "uv", (0, 0, 0.28), (0.38, 0.28, 0.26))
head = mesh("head", "uv", (0.32, 0, 0.42), (0.22, 0.20, 0.20))
snout = mesh("snout", "uv", (0.50, 0, 0.36), (0.12, 0.09, 0.08))
nose = mesh("nose", "uv", (0.60, 0, 0.36), (0.04, 0.04, 0.04))
ear_l = mesh("ear_l", "uv", (0.26, 0.16, 0.62), (0.16, 0.04, 0.20), (0.4, 0, 0.5))
ear_r = mesh("ear_r", "uv", (0.26, -0.16, 0.62), (0.16, 0.04, 0.20), (-0.4, 0, -0.5))
inner_l = mesh("inner_l", "uv", (0.27, 0.17, 0.62), (0.10, 0.02, 0.13), (0.4, 0, 0.5))
inner_r = mesh("inner_r", "uv", (0.27, -0.17, 0.62), (0.10, 0.02, 0.13), (-0.4, 0, -0.5))
eye_l = mesh("eye_l", "uv", (0.42, 0.08, 0.48), (0.04, 0.04, 0.04))
eye_r = mesh("eye_r", "uv", (0.42, -0.08, 0.48), (0.04, 0.04, 0.04))
scarf = mesh("scarf", "cube", (0.12, 0, 0.38), (0.16, 0.22, 0.04))
tail_a = mesh("tail_a", "cyl", (-0.28, 0, 0.22), (0.05, 0.05, 0.22), (1.2, 0, 0))
tail_b = mesh("tail_b", "cyl", (-0.48, 0, 0.34), (0.035, 0.035, 0.20), (0.9, 0, 0))
foot_fl = mesh("foot_fl", "uv", (0.16, 0.12, 0.06), (0.07, 0.05, 0.04))
foot_fr = mesh("foot_fr", "uv", (0.16, -0.12, 0.06), (0.07, 0.05, 0.04))
foot_bl = mesh("foot_bl", "uv", (-0.12, 0.12, 0.06), (0.07, 0.05, 0.04))
foot_br = mesh("foot_br", "uv", (-0.12, -0.12, 0.06), (0.07, 0.05, 0.04))

bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "Mooshak"
dest = os.path.join(out_dir, "Mooshak.fbx")
bpy.ops.export_scene.fbx(
    filepath=dest,
    use_selection=False,
    apply_scale_options="FBX_SCALE_ALL",
    object_types={"MESH"},
    axis_forward="-Y",
    axis_up="Z",
)
print("EXPORTED", dest)
