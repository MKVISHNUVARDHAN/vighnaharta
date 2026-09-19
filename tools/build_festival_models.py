"""Generate high-quality low-poly 3D models in Blender for Vighnaharta:
1. GaneshaIdol.fbx — Iconic seated 4-armed Ganesha with crown, trunk, ears, modak, lotus plinth
2. Rath.fbx — Grand festival temple chariot with carved pillars, gopuram canopy, bells, ornate wheels
3. RoadblockGate.fbx — Heavy timber barricade gate with iron studs, red banners, toran, brass latch
4. Citizen.fbx — Stylized festival devotee in traditional kurta, dhoti, and ceremonial turban
"""
import os
import bpy
import math

out_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "festival"))
os.makedirs(out_dir, exist_ok=True)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def add_part(primitive, loc, scale, rot=(0, 0, 0), **kwargs):
    if primitive == "uv":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=kwargs.get("segments", 14),
            ring_count=kwargs.get("rings", 10),
            location=loc
        )
    elif primitive == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=kwargs.get("vertices", 12),
            location=loc
        )
    elif primitive == "cone":
        bpy.ops.mesh.primitive_cone_add(
            vertices=kwargs.get("vertices", 12),
            location=loc
        )
    elif primitive == "torus":
        bpy.ops.mesh.primitive_torus_add(
            major_segments=16,
            minor_segments=8,
            location=loc
        )
    else:
        bpy.ops.mesh.primitive_cube_add(location=loc)

    obj = bpy.context.active_object
    obj.scale = scale
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


def export_model(name, root_obj):
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = root_obj
    bpy.ops.object.join()
    root_obj.name = name
    dest = os.path.join(out_dir, name + ".fbx")
    bpy.ops.export_scene.fbx(
        filepath=dest,
        use_selection=False,
        apply_scale_options="FBX_SCALE_ALL",
        object_types={"MESH"},
        axis_forward="-Y",
        axis_up="Z",
    )
    print(f"[EXPORTED] {dest} ({len(root_obj.data.polygons)} polys)")


# ==============================================================================
# 1. GANESHA IDOL
# ==============================================================================
def build_ganesha():
    reset_scene()

    # Pedestal (Lotus Plinth)
    plinth_base = add_part("cyl", (0, 0, 0.15), (0.9, 0.9, 0.15), vertices=16)
    add_part("cyl", (0, 0, 0.35), (0.75, 0.75, 0.08), vertices=16)
    # Lotus petal rim
    for i in range(8):
        ang = i * (math.pi / 4.0)
        px = math.cos(ang) * 0.78
        py = math.sin(ang) * 0.78
        add_part("uv", (px, py, 0.32), (0.12, 0.12, 0.06), rot=(0, 0.4, ang))

    # Folded Legs (Padmasana)
    add_part("torus", (0, 0, 0.52), (0.62, 0.62, 0.22))
    add_part("uv", (0.35, 0.25, 0.55), (0.16, 0.12, 0.10), rot=(0, 0.2, 0.5))
    add_part("uv", (0.35, -0.25, 0.55), (0.16, 0.12, 0.10), rot=(0, 0.2, -0.5))

    # Potbelly Torso (Lambodara)
    add_part("uv", (0.02, 0, 0.85), (0.46, 0.42, 0.42))
    # Upper chest
    add_part("uv", (0.04, 0, 1.15), (0.38, 0.36, 0.32))
    # Sacred Thread (Janeu)
    add_part("torus", (0.06, 0, 1.05), (0.42, 0.38, 0.035), rot=(0.4, 0.35, 0.2))

    # Four Arms
    # 1. Lower Right (Abhaya Mudra - Blessing hand)
    add_part("cyl", (0.32, 0.38, 1.02), (0.09, 0.09, 0.24), rot=(-0.6, 0.4, -0.3))
    add_part("uv", (0.36, 0.46, 1.22), (0.08, 0.07, 0.12), rot=(-0.3, 0.2, 0))

    # 2. Lower Left (Holding Bowl of Modak Sweets)
    add_part("cyl", (0.30, -0.38, 0.98), (0.09, 0.09, 0.24), rot=(0.6, 0.4, 0.3))
    # Modak bowl
    add_part("cyl", (0.36, -0.44, 1.06), (0.12, 0.12, 0.06))
    # Modak sweet (pointed teardrop shape)
    add_part("cone", (0.36, -0.44, 1.16), (0.08, 0.08, 0.12))

    # 3. Upper Right (Holding Ankusha - Axe)
    add_part("cyl", (-0.05, 0.42, 1.28), (0.08, 0.08, 0.26), rot=(-0.4, -0.5, 0))
    add_part("cyl", (-0.08, 0.52, 1.48), (0.03, 0.03, 0.32), rot=(0, 0.6, 0))
    add_part("cube", (-0.08, 0.54, 1.62), (0.04, 0.12, 0.08))

    # 4. Upper Left (Holding Pasha - Sacred Noose)
    add_part("cyl", (-0.05, -0.42, 1.28), (0.08, 0.08, 0.26), rot=(0.4, -0.5, 0))
    add_part("torus", (-0.08, -0.50, 1.48), (0.14, 0.14, 0.03))

    # Elephant Head
    add_part("uv", (0.14, 0, 1.48), (0.36, 0.34, 0.34))

    # Graceful Large Fan Ears
    add_part("uv", (0.04, 0.38, 1.54), (0.18, 0.04, 0.30), rot=(0.15, 0, 0.35))
    add_part("uv", (0.04, -0.38, 1.54), (0.18, 0.04, 0.30), rot=(-0.15, 0, -0.35))

    # Curved Elephant Trunk (iconic sweep towards the modak bowl on the left)
    add_part("cyl", (0.36, 0, 1.40), (0.12, 0.12, 0.18), rot=(0.7, 0, 0))
    add_part("cyl", (0.44, -0.08, 1.25), (0.10, 0.10, 0.16), rot=(0.5, 0, -0.5))
    add_part("cyl", (0.42, -0.22, 1.15), (0.08, 0.08, 0.14), rot=(0.2, 0, -1.1))
    add_part("uv", (0.38, -0.32, 1.12), (0.07, 0.07, 0.07))

    # Tusks
    add_part("cone", (0.38, 0.14, 1.34), (0.035, 0.035, 0.16), rot=(0.6, 0, 0.2))  # Left whole tusk
    add_part("cone", (0.38, -0.14, 1.34), (0.035, 0.035, 0.08), rot=(0.6, 0, -0.2)) # Right broken tusk

    # Eyes & Brow
    add_part("uv", (0.38, 0.14, 1.52), (0.035, 0.035, 0.035))
    add_part("uv", (0.38, -0.14, 1.52), (0.035, 0.035, 0.035))

    # Sacred Crown (Kiritamukuta)
    add_part("cyl", (0.10, 0, 1.76), (0.28, 0.28, 0.18), vertices=14)
    add_part("cone", (0.08, 0, 2.05), (0.24, 0.24, 0.35), vertices=12)
    add_part("uv", (0.07, 0, 2.38), (0.08, 0.08, 0.10)) # Kalash jewel on crown

    export_model("GaneshaIdol", plinth_base)


# ==============================================================================
# 2. RATH (CEREMONIAL CHARIOT)
# ==============================================================================
def build_rath():
    reset_scene()

    # Heavy timber base chassis
    chassis = add_part("cube", (0, 0, 0.50), (2.2, 1.6, 0.30))
    # Stepped upper deck
    add_part("cube", (0, 0, 0.88), (2.0, 1.45, 0.14))
    # Front decorative prow
    add_part("cube", (2.1, 0, 0.65), (0.35, 1.1, 0.20))
    add_part("cone", (2.4, 0, 0.65), (0.45, 0.55, 0.40), rot=(0, 1.57, 0))

    # 4 Large multi-spoke chariot wheels
    wheel_offsets = [
        (1.2, 1.65, 0.65),
        (-1.2, 1.65, 0.65),
        (1.2, -1.65, 0.65),
        (-1.2, -1.65, 0.65),
    ]
    for wx, wy, wz in wheel_offsets:
        rot_y = (1.57, 0, 0)
        # Outer rim
        add_part("torus", (wx, wy, wz), (0.65, 0.65, 0.10), rot=rot_y)
        # Hub
        add_part("cyl", (wx, wy, wz), (0.22, 0.22, 0.24), rot=rot_y, vertices=12)
        # 6 Spokes
        for s in range(6):
            s_ang = s * (math.pi / 3.0)
            add_part("cube", (wx, wy, wz), (0.55, 0.06, 0.05), rot=(s_ang, 1.57, 0))

    # 4 Ornate Carved Temple Pillars
    pillar_locs = [
        (1.5, 1.15, 2.1),
        (-1.5, 1.15, 2.1),
        (1.5, -1.15, 2.1),
        (-1.5, -1.15, 2.1),
    ]
    for px, py, pz in pillar_locs:
        # Base plinth
        add_part("cube", (px, py, 1.05), (0.22, 0.22, 0.15))
        # Main pillar column
        add_part("cyl", (px, py, pz), (0.12, 0.12, 1.10), vertices=10)
        # Carved capital
        add_part("cube", (px, py, 3.15), (0.24, 0.24, 0.12))

    # Temple Canopy / Mandapam (Tiered Pagoda Roof)
    # Tier 1 roof
    add_part("cube", (0, 0, 3.32), (1.95, 1.55, 0.16))
    add_part("cone", (0, 0, 3.75), (2.10, 1.70, 0.55), vertices=4, rot=(0, 0, 0.785))
    # Tier 2 roof
    add_part("cube", (0, 0, 4.15), (1.45, 1.15, 0.14))
    add_part("cone", (0, 0, 4.60), (1.55, 1.25, 0.60), vertices=4, rot=(0, 0, 0.785))
    # Tier 3 (Pinnacle spire)
    add_part("cone", (0, 0, 5.25), (0.90, 0.75, 0.75), vertices=4, rot=(0, 0, 0.785))
    # Golden Kalash dome on top
    add_part("uv", (0, 0, 5.85), (0.35, 0.35, 0.35))
    add_part("cone", (0, 0, 6.30), (0.18, 0.18, 0.35), vertices=10)

    # 4 Hanging Temple Bells under the canopy
    for px, py, _ in pillar_locs:
        bx = px * 0.9
        by = py * 0.9
        add_part("cyl", (bx, by, 3.0), (0.02, 0.02, 0.15))
        add_part("cone", (bx, by, 2.8), (0.10, 0.10, 0.14), rot=(3.14, 0, 0))
        add_part("uv", (bx, by, 2.70), (0.04, 0.04, 0.04))

    # Brass Diya Torches (Front Left and Right)
    for dy in (1.2, -1.2):
        add_part("cyl", (1.8, dy, 1.25), (0.08, 0.08, 0.35))
        add_part("uv", (1.8, dy, 1.55), (0.20, 0.20, 0.10))
        add_part("cone", (1.8, dy, 1.75), (0.08, 0.08, 0.18)) # Flame

    export_model("Rath", chassis)


# ==============================================================================
# 3. ROADBLOCK GATE (HEAVY TIMBER & FESTIVAL BARRICADE)
# ==============================================================================
def build_roadblock():
    reset_scene()

    # Left & Right Heavy Gate Boundary Posts
    post_l = add_part("cube", (0, -2.4, 1.5), (0.45, 0.45, 1.5))
    post_r = add_part("cube", (0, 2.4, 1.5), (0.45, 0.45, 1.5))
    # Carved post finials
    add_part("cone", (0, -2.4, 3.2), (0.35, 0.35, 0.35), vertices=8)
    add_part("cone", (0, 2.4, 3.2), (0.35, 0.35, 0.35), vertices=8)

    # Heavy Horizontal Beams
    add_part("cube", (0, 0, 0.7), (0.28, 2.3, 0.22))
    add_part("cube", (0, 0, 1.5), (0.28, 2.3, 0.22))
    add_part("cube", (0, 0, 2.3), (0.28, 2.3, 0.22))

    # Diagonal Crossbraces (X-bracing for authentic barricade look)
    add_part("cube", (0.08, -1.0, 1.5), (0.16, 1.3, 0.14), rot=(0, 0.52, 0))
    add_part("cube", (-0.08, -1.0, 1.5), (0.16, 1.3, 0.14), rot=(0, -0.52, 0))
    add_part("cube", (0.08, 1.0, 1.5), (0.16, 1.3, 0.14), rot=(0, -0.52, 0))
    add_part("cube", (-0.08, 1.0, 1.5), (0.16, 1.3, 0.14), rot=(0, 0.52, 0))

    # Red Festival Warning Cloth Canvas Banner in center
    add_part("cube", (0.12, 0, 1.5), (0.04, 1.7, 0.65))

    # Heavy Brass Latch / Padlock (Target for Tail Whip / Tether!)
    add_part("cyl", (0.22, 0, 1.5), (0.18, 0.18, 0.10), rot=(0, 1.57, 0))
    add_part("torus", (0.26, 0, 1.65), (0.14, 0.14, 0.04), rot=(0, 1.57, 0))
    add_part("cube", (0.24, 0, 1.35), (0.08, 0.16, 0.18))

    # Hanging Toran Marigold Garland along top
    for g in range(9):
        gx = 0.16
        gy = -2.0 + g * 0.5
        add_part("uv", (gx, gy, 2.15 - abs(math.sin(g * 0.7)) * 0.12), (0.09, 0.09, 0.09))

    # Festive flags on posts
    add_part("cube", (0, -2.4, 3.7), (0.04, 0.55, 0.35), rot=(0, 0, 0.2))
    add_part("cube", (0, 2.4, 3.7), (0.04, 0.55, 0.35), rot=(0, 0, -0.2))

    export_model("RoadblockGate", post_l)


# ==============================================================================
# 4. CITIZEN (FESTIVAL DEVOTEE)
# ==============================================================================
def build_citizen():
    reset_scene()

    # Dhoti / Legs
    leg_l = add_part("cyl", (0, -0.15, 0.50), (0.14, 0.14, 0.50), vertices=10)
    add_part("cyl", (0, 0.15, 0.50), (0.14, 0.14, 0.50), vertices=10)
    add_part("uv", (0.08, -0.15, 0.06), (0.12, 0.08, 0.06)) # Foot L
    add_part("uv", (0.08, 0.15, 0.06), (0.12, 0.08, 0.06))  # Foot R

    # Kurta (Tunic) Torso
    add_part("cyl", (0, 0, 1.15), (0.26, 0.20, 0.38), vertices=10)
    add_part("cube", (0, 0, 0.90), (0.28, 0.24, 0.20)) # Kurta skirt

    # Angavastram (Festive Shawl across chest)
    add_part("torus", (0, 0, 1.25), (0.28, 0.24, 0.06), rot=(0.45, 0.35, 0))

    # Cheering Arms (Raised in celebration)
    # Left Arm
    add_part("cyl", (0, -0.32, 1.45), (0.07, 0.07, 0.26), rot=(-0.4, 0, 0.4))
    add_part("cyl", (0.05, -0.42, 1.82), (0.06, 0.06, 0.24), rot=(-0.6, 0.3, 0))
    add_part("uv", (0.06, -0.44, 2.02), (0.07, 0.06, 0.06)) # Hand L

    # Right Arm
    add_part("cyl", (0, 0.32, 1.45), (0.07, 0.07, 0.26), rot=(0.4, 0, -0.4))
    add_part("cyl", (0.05, 0.42, 1.82), (0.06, 0.06, 0.24), rot=(0.6, 0.3, 0))
    add_part("uv", (0.06, 0.42, 2.02), (0.07, 0.06, 0.06)) # Hand R

    # Neck & Head
    add_part("cyl", (0, 0, 1.48), (0.09, 0.09, 0.08))
    add_part("uv", (0, 0, 1.68), (0.16, 0.15, 0.18))

    # Traditional Festive Turban (Pheta / Pagri)
    add_part("torus", (0, 0, 1.78), (0.22, 0.20, 0.12), rot=(0.1, 0, 0))
    add_part("uv", (0, 0, 1.86), (0.20, 0.18, 0.12))
    # Turban Pleated Top Crown (Turra / Crest)
    add_part("cube", (0.08, 0.12, 1.98), (0.04, 0.14, 0.16), rot=(0, 0.3, 0.4))

    export_model("Citizen", leg_l)


if __name__ == "__main__":
    print("=== BUILDING VIGHNAHARTA FESTIVAL 3D ASSETS IN BLENDER ===")
    build_ganesha()
    build_rath()
    build_roadblock()
    build_citizen()
    print("=== ALL FESTIVAL ASSETS CREATED SUCCESSFULLY ===")
