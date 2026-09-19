"""Generate 2026 AAA-grade stylized 3D models in Blender 5.2 for Vighnaharta:
- Smooth shading with explicit normals (no faceted warnings)
- Full PBR materials (Metallic, Roughness, Base Color, Emissive) embedded in FBX
- Rich sculptural detail:
  1. GaneshaIdol.fbx (Divine polished gold Ganesha, lotus plinth, crown, modak sweet, fan ears, 4 arms)
  2. Rath.fbx (Carved teakwood temple chariot, gopuram canopy, spoke wheels, brass bells, torches)
  3. RoadblockGate.fbx (Heavy timber barricade, forged iron brackets, red banner, marigold toran, brass latch)
  4. Citizen.fbx (Festive devotee in pleated dhoti, turmeric kurta, crimson shawl, and saffron pheta turban)
  5. Mooshak.fbx (Hero mouse with expressive ears, hero scarf, long tail, paw detail)
"""
import os
import bpy
import math

out_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "festival"))
hero_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "hero"))
os.makedirs(out_dir, exist_ok=True)
os.makedirs(hero_dir, exist_ok=True)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def create_material(name, base_color, metallic=0.0, roughness=0.5, emission=(0, 0, 0, 1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def add_mesh_part(primitive, loc, scale, rot=(0, 0, 0), mat=None, smooth=True, **kwargs):
    if primitive == "uv":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=kwargs.get("segments", 18),
            ring_count=kwargs.get("rings", 12),
            location=loc
        )
    elif primitive == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=kwargs.get("vertices", 14),
            location=loc
        )
    elif primitive == "cone":
        bpy.ops.mesh.primitive_cone_add(
            vertices=kwargs.get("vertices", 14),
            location=loc
        )
    elif primitive == "torus":
        bpy.ops.mesh.primitive_torus_add(
            major_segments=kwargs.get("major", 18),
            minor_segments=kwargs.get("minor", 10),
            location=loc
        )
    else:
        bpy.ops.mesh.primitive_cube_add(location=loc)

    obj = bpy.context.active_object
    obj.scale = scale
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if smooth and obj.data:
        for poly in obj.data.polygons:
            poly.use_smooth = True

    if mat:
        if len(obj.data.materials) == 0:
            obj.data.materials.append(mat)
        else:
            obj.data.materials[0] = mat

    return obj


def export_fbx(name, root_obj, target_dir=out_dir):
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = root_obj
    bpy.ops.object.join()
    root_obj.name = name

    # Ensure all polygons have smooth normals enabled
    if root_obj.data:
        for poly in root_obj.data.polygons:
            poly.use_smooth = True

    dest = os.path.join(target_dir, name + ".fbx")
    bpy.ops.export_scene.fbx(
        filepath=dest,
        use_selection=False,
        apply_scale_options="FBX_SCALE_ALL",
        object_types={"MESH"},
        mesh_smooth_type="FACE",
        axis_forward="-Y",
        axis_up="Z",
    )
    mat_names = [m.name for m in root_obj.data.materials if m]
    print(f"[EXPORTED 2026 ASSET] {dest} ({len(root_obj.data.polygons)} polys, Materials: {mat_names})")


# ==============================================================================
# 1. GANESHA IDOL (DIVINE GOLDEN RESPLENDENCE)
# ==============================================================================
def build_ganesha_idol():
    reset_scene()

    # Materials
    m_gold = create_material("M_Divine_Gold", (1.0, 0.78, 0.22, 1.0), metallic=0.92, roughness=0.20)
    m_crown_gold = create_material("M_Crown_Gold", (1.0, 0.85, 0.28, 1.0), metallic=0.96, roughness=0.15)
    m_lotus = create_material("M_Lotus_Plinth", (0.92, 0.32, 0.52, 1.0), metallic=0.0, roughness=0.55)
    m_lotus_trim = create_material("M_Lotus_GoldTrim", (0.98, 0.82, 0.25, 1.0), metallic=0.85, roughness=0.25)
    m_ivory = create_material("M_Ivory_Tusk", (0.96, 0.94, 0.88, 1.0), metallic=0.0, roughness=0.30)
    m_modak = create_material("M_Modak_Sweet", (1.0, 0.85, 0.25, 1.0), metallic=0.05, roughness=0.35, emission=(1.0, 0.82, 0.2, 1.0), emission_strength=1.2)
    m_ruby = create_material("M_Crown_Ruby", (0.95, 0.08, 0.12, 1.0), metallic=0.1, roughness=0.15, emission=(0.95, 0.08, 0.12, 1.0), emission_strength=2.0)
    m_thread = create_material("M_Janeu_Thread", (0.95, 0.90, 0.80, 1.0), metallic=0.2, roughness=0.6)

    # Stepped Lotus Pedestal
    base = add_mesh_part("cyl", (0, 0, 0.12), (0.95, 0.95, 0.12), vertices=16, mat=m_lotus)
    add_mesh_part("cyl", (0, 0, 0.28), (0.82, 0.82, 0.08), vertices=16, mat=m_lotus_trim)
    for i in range(10):
        ang = i * (math.pi * 2.0 / 10.0)
        px = math.cos(ang) * 0.80
        py = math.sin(ang) * 0.80
        add_mesh_part("uv", (px, py, 0.26), (0.14, 0.14, 0.07), rot=(0, 0.35, ang), mat=m_lotus)

    # Padmasana Folded Legs
    add_mesh_part("torus", (0, 0, 0.48), (0.64, 0.64, 0.24), mat=m_gold)
    add_mesh_part("uv", (0.36, 0.28, 0.52), (0.17, 0.13, 0.11), rot=(0, 0.2, 0.45), mat=m_gold)
    add_mesh_part("uv", (0.36, -0.28, 0.52), (0.17, 0.13, 0.11), rot=(0, 0.2, -0.45), mat=m_gold)

    # Potbelly Torso (Lambodara)
    add_mesh_part("uv", (0.02, 0, 0.86), (0.48, 0.44, 0.44), mat=m_gold)
    add_mesh_part("uv", (0.04, 0, 1.18), (0.40, 0.38, 0.34), mat=m_gold)
    # Sacred Thread (Janeu)
    add_mesh_part("torus", (0.06, 0, 1.06), (0.44, 0.40, 0.035), rot=(0.42, 0.35, 0.2), mat=m_thread)

    # Four Divine Arms
    # 1. Lower Right (Abhaya Mudra)
    add_mesh_part("cyl", (0.34, 0.40, 1.04), (0.09, 0.09, 0.25), rot=(-0.6, 0.4, -0.3), mat=m_gold)
    add_mesh_part("uv", (0.38, 0.48, 1.25), (0.08, 0.07, 0.13), rot=(-0.3, 0.2, 0), mat=m_gold)
    # 2. Lower Left (Modak Bowl)
    add_mesh_part("cyl", (0.32, -0.40, 1.00), (0.09, 0.09, 0.25), rot=(0.6, 0.4, 0.3), mat=m_gold)
    add_mesh_part("cyl", (0.38, -0.46, 1.08), (0.13, 0.13, 0.06), mat=m_gold)
    add_mesh_part("cone", (0.38, -0.46, 1.18), (0.09, 0.09, 0.13), mat=m_modak)
    # 3. Upper Right (Ankusha Axe)
    add_mesh_part("cyl", (-0.06, 0.44, 1.30), (0.08, 0.08, 0.28), rot=(-0.4, -0.5, 0), mat=m_gold)
    add_mesh_part("cyl", (-0.08, 0.54, 1.52), (0.03, 0.03, 0.34), rot=(0, 0.6, 0), mat=m_crown_gold)
    add_mesh_part("cube", (-0.08, 0.56, 1.66), (0.04, 0.13, 0.09), mat=m_gold)
    # 4. Upper Left (Pasha Noose)
    add_mesh_part("cyl", (-0.06, -0.44, 1.30), (0.08, 0.08, 0.28), rot=(0.4, -0.5, 0), mat=m_gold)
    add_mesh_part("torus", (-0.08, -0.52, 1.52), (0.15, 0.15, 0.035), mat=m_crown_gold)

    # Elephant Head & Majestic Curved Trunk
    add_mesh_part("uv", (0.15, 0, 1.50), (0.38, 0.36, 0.36), mat=m_gold)
    # Fan Ears
    add_mesh_part("uv", (0.05, 0.40, 1.56), (0.19, 0.04, 0.32), rot=(0.15, 0, 0.35), mat=m_gold)
    add_mesh_part("uv", (0.05, -0.40, 1.56), (0.19, 0.04, 0.32), rot=(-0.15, 0, -0.35), mat=m_gold)
    # Trunk Sweep towards Modak
    add_mesh_part("cyl", (0.38, 0, 1.42), (0.13, 0.13, 0.19), rot=(0.7, 0, 0), mat=m_gold)
    add_mesh_part("cyl", (0.46, -0.09, 1.27), (0.11, 0.11, 0.17), rot=(0.5, 0, -0.5), mat=m_gold)
    add_mesh_part("cyl", (0.44, -0.24, 1.16), (0.09, 0.09, 0.15), rot=(0.2, 0, -1.1), mat=m_gold)
    add_mesh_part("uv", (0.40, -0.34, 1.13), (0.075, 0.075, 0.075), mat=m_gold)

    # Ivory Tusks
    add_mesh_part("cone", (0.40, 0.15, 1.36), (0.038, 0.038, 0.18), rot=(0.6, 0, 0.2), mat=m_ivory)
    add_mesh_part("cone", (0.40, -0.15, 1.36), (0.038, 0.038, 0.09), rot=(0.6, 0, -0.2), mat=m_ivory)

    # Sacred Crown (Kiritamukuta)
    add_mesh_part("cyl", (0.11, 0, 1.80), (0.30, 0.30, 0.20), vertices=16, mat=m_crown_gold)
    add_mesh_part("cone", (0.09, 0, 2.10), (0.25, 0.25, 0.38), vertices=14, mat=m_crown_gold)
    add_mesh_part("uv", (0.08, 0, 2.45), (0.09, 0.09, 0.11), mat=m_ruby)

    export_fbx("GaneshaIdol", base)


# ==============================================================================
# 2. RATH (MAJESTIC TEMPLE CHARIOT)
# ==============================================================================
def build_rath_chariot():
    reset_scene()

    # Materials
    m_teak = create_material("M_Carved_Teak", (0.32, 0.13, 0.05, 1.0), metallic=0.0, roughness=0.48)
    m_brass = create_material("M_Brass_Temple", (0.96, 0.76, 0.24, 1.0), metallic=0.94, roughness=0.18)
    m_saffron = create_material("M_Festival_Saffron", (0.98, 0.46, 0.08, 1.0), metallic=0.0, roughness=0.70)
    m_crimson = create_material("M_Festival_Crimson", (0.88, 0.12, 0.06, 1.0), metallic=0.0, roughness=0.65)
    m_iron_wheel = create_material("M_Chariot_Iron", (0.16, 0.16, 0.18, 1.0), metallic=0.88, roughness=0.40)
    m_flame = create_material("M_Diya_Flame", (1.0, 0.85, 0.2, 1.0), metallic=0.0, roughness=0.2, emission=(1.0, 0.65, 0.1, 1.0), emission_strength=4.5)

    # Heavy Carved Teak Chassis
    chassis = add_mesh_part("cube", (0, 0, 0.52), (2.25, 1.65, 0.32), mat=m_teak)
    add_mesh_part("cube", (0, 0, 0.90), (2.05, 1.48, 0.15), mat=m_teak)
    add_mesh_part("cube", (2.15, 0, 0.68), (0.38, 1.15, 0.22), mat=m_teak)

    # 4 Ornate Multi-Spoke Chariot Wheels
    wheel_offsets = [
        (1.25, 1.70, 0.68),
        (-1.25, 1.70, 0.68),
        (1.25, -1.70, 0.68),
        (-1.25, -1.70, 0.68),
    ]
    for wx, wy, wz in wheel_offsets:
        rot_y = (1.57, 0, 0)
        # Heavy outer rim
        add_mesh_part("torus", (wx, wy, wz), (0.68, 0.68, 0.11), rot=rot_y, mat=m_iron_wheel)
        # Brass hub
        add_mesh_part("cyl", (wx, wy, wz), (0.24, 0.24, 0.26), rot=rot_y, vertices=14, mat=m_brass)
        # 6 Carved Spokes
        for s in range(6):
            s_ang = s * (math.pi / 3.0)
            add_mesh_part("cube", (wx, wy, wz), (0.58, 0.07, 0.06), rot=(s_ang, 1.57, 0), mat=m_teak)

    # 4 Carved Temple Pillars
    pillar_locs = [
        (1.55, 1.18, 2.15),
        (-1.55, 1.18, 2.15),
        (1.55, -1.18, 2.15),
        (-1.55, -1.18, 2.15),
    ]
    for px, py, pz in pillar_locs:
        add_mesh_part("cube", (px, py, 1.08), (0.24, 0.24, 0.16), mat=m_brass)
        add_mesh_part("cyl", (px, py, pz), (0.13, 0.13, 1.12), vertices=12, mat=m_teak)
        add_mesh_part("cube", (px, py, 3.20), (0.26, 0.26, 0.14), mat=m_brass)

    # 3-Tier Gopuram Pagoda Canopy
    # Tier 1
    add_mesh_part("cube", (0, 0, 3.36), (2.00, 1.60, 0.18), mat=m_teak)
    add_mesh_part("cone", (0, 0, 3.80), (2.15, 1.75, 0.58), vertices=4, rot=(0, 0, 0.785), mat=m_crimson)
    # Tier 2
    add_mesh_part("cube", (0, 0, 4.22), (1.50, 1.20, 0.15), mat=m_teak)
    add_mesh_part("cone", (0, 0, 4.68), (1.60, 1.30, 0.62), vertices=4, rot=(0, 0, 0.785), mat=m_saffron)
    # Tier 3 (Pinnacle & Golden Kalash)
    add_mesh_part("cone", (0, 0, 5.32), (0.95, 0.80, 0.78), vertices=4, rot=(0, 0, 0.785), mat=m_crimson)
    add_mesh_part("uv", (0, 0, 5.92), (0.36, 0.36, 0.36), mat=m_brass)
    add_mesh_part("cone", (0, 0, 6.38), (0.19, 0.19, 0.36), vertices=12, mat=m_brass)

    # 4 Hanging Brass Temple Bells with Clappers
    for px, py, _ in pillar_locs:
        bx = px * 0.90
        by = py * 0.90
        add_mesh_part("cyl", (bx, by, 3.02), (0.025, 0.025, 0.16), mat=m_brass)
        add_mesh_part("cone", (bx, by, 2.82), (0.11, 0.11, 0.15), rot=(3.14, 0, 0), mat=m_brass)
        add_mesh_part("uv", (bx, by, 2.72), (0.045, 0.045, 0.045), mat=m_brass)

    # Front Brass Diya Torches with Flickering Flames
    for dy in (1.25, -1.25):
        add_mesh_part("cyl", (1.85, dy, 1.28), (0.08, 0.08, 0.36), mat=m_brass)
        add_mesh_part("uv", (1.85, dy, 1.58), (0.22, 0.22, 0.11), mat=m_brass)
        add_mesh_part("cone", (1.85, dy, 1.78), (0.09, 0.09, 0.20), mat=m_flame)

    export_fbx("Rath", chassis)


# ==============================================================================
# 3. ROADBLOCK GATE (HEAVY FESTIVAL BARRICADE)
# ==============================================================================
def build_roadblock_gate():
    reset_scene()

    # Materials
    m_timber = create_material("M_Barricade_Timber", (0.28, 0.16, 0.08, 1.0), metallic=0.0, roughness=0.82)
    m_iron = create_material("M_Iron_Brackets", (0.14, 0.14, 0.16, 1.0), metallic=0.86, roughness=0.42)
    m_cloth = create_material("M_Red_Banner", (0.92, 0.10, 0.06, 1.0), metallic=0.0, roughness=0.72)
    m_marigold = create_material("M_Marigold_Bloom", (1.0, 0.65, 0.04, 1.0), metallic=0.0, roughness=0.45, emission=(1.0, 0.65, 0.04, 1.0), emission_strength=1.5)
    m_latch = create_material("M_Brass_Latch", (0.98, 0.82, 0.20, 1.0), metallic=0.92, roughness=0.22, emission=(0.98, 0.82, 0.20, 1.0), emission_strength=2.2)

    # Dual Heavy Boundary Posts
    post_l = add_mesh_part("cube", (0, -2.45, 1.55), (0.48, 0.48, 1.55), mat=m_timber)
    add_mesh_part("cube", (0, 2.45, 1.55), (0.48, 0.48, 1.55), mat=m_timber)
    add_mesh_part("cone", (0, -2.45, 3.25), (0.36, 0.36, 0.36), vertices=8, mat=m_iron)
    add_mesh_part("cone", (0, 2.45, 3.25), (0.36, 0.36, 0.36), vertices=8, mat=m_iron)

    # 3 Heavy Horizontal Timber Beams
    add_mesh_part("cube", (0, 0, 0.72), (0.30, 2.35, 0.24), mat=m_timber)
    add_mesh_part("cube", (0, 0, 1.55), (0.30, 2.35, 0.24), mat=m_timber)
    add_mesh_part("cube", (0, 0, 2.38), (0.30, 2.35, 0.24), mat=m_timber)

    # Forged Iron Corner Brackets
    for y_sign in (-1, 1):
        for z_h in (0.72, 1.55, 2.38):
            add_mesh_part("cube", (0.16, y_sign * 2.35, z_h), (0.05, 0.18, 0.28), mat=m_iron)

    # X-Crossbracing
    add_mesh_part("cube", (0.08, -1.05, 1.55), (0.18, 1.35, 0.15), rot=(0, 0.52, 0), mat=m_timber)
    add_mesh_part("cube", (-0.08, -1.05, 1.55), (0.18, 1.35, 0.15), rot=(0, -0.52, 0), mat=m_timber)
    add_mesh_part("cube", (0.08, 1.05, 1.55), (0.18, 1.35, 0.15), rot=(0, -0.52, 0), mat=m_timber)
    add_mesh_part("cube", (-0.08, 1.05, 1.55), (0.18, 1.35, 0.15), rot=(0, 0.52, 0), mat=m_timber)

    # Red Festival Warning Cloth Canvas Banner in center
    add_mesh_part("cube", (0.14, 0, 1.55), (0.04, 1.75, 0.68), mat=m_cloth)

    # Heavy Glowing Brass Latch (Clear visual target for Whip / Tether!)
    add_mesh_part("cyl", (0.24, 0, 1.55), (0.19, 0.19, 0.11), rot=(0, 1.57, 0), mat=m_latch)
    add_mesh_part("torus", (0.28, 0, 1.70), (0.15, 0.15, 0.045), rot=(0, 1.57, 0), mat=m_latch)
    add_mesh_part("cube", (0.26, 0, 1.38), (0.09, 0.17, 0.19), mat=m_latch)

    # Hanging Toran Marigold Garland
    for g in range(11):
        gx = 0.18
        gy = -2.1 + g * 0.42
        gz = 2.22 - abs(math.sin(g * 0.65)) * 0.14
        add_mesh_part("uv", (gx, gy, gz), (0.095, 0.095, 0.095), mat=m_marigold)

    export_fbx("RoadblockGate", post_l)


# ==============================================================================
# 4. CITIZEN (FESTIVAL DEVOTEE WITH VIBRANT CLOTHING)
# ==============================================================================
def build_citizen_devotee():
    reset_scene()

    # Materials
    m_skin = create_material("M_Skin_Tone", (0.82, 0.60, 0.44, 1.0), metallic=0.0, roughness=0.52)
    m_dhoti = create_material("M_Dhoti_Cotton", (0.95, 0.94, 0.90, 1.0), metallic=0.0, roughness=0.85)
    m_kurta = create_material("M_Kurta_Turmeric", (0.98, 0.72, 0.12, 1.0), metallic=0.0, roughness=0.68)
    m_shawl = create_material("M_Shawl_Crimson", (0.88, 0.12, 0.08, 1.0), metallic=0.0, roughness=0.65)
    m_pheta = create_material("M_Pheta_Saffron", (0.98, 0.42, 0.06, 1.0), metallic=0.0, roughness=0.60)
    m_gold_lace = create_material("M_Pheta_GoldLace", (0.98, 0.82, 0.25, 1.0), metallic=0.88, roughness=0.25)

    # Dhoti Legs & Feet
    leg_l = add_mesh_part("cyl", (0, -0.15, 0.52), (0.15, 0.15, 0.52), vertices=12, mat=m_dhoti)
    add_mesh_part("cyl", (0, 0.15, 0.52), (0.15, 0.15, 0.52), vertices=12, mat=m_dhoti)
    add_mesh_part("uv", (0.09, -0.15, 0.06), (0.13, 0.09, 0.06), mat=m_skin)
    add_mesh_part("uv", (0.09, 0.15, 0.06), (0.13, 0.09, 0.06), mat=m_skin)

    # Turmeric Kurta Torso
    add_mesh_part("cyl", (0, 0, 1.18), (0.28, 0.22, 0.40), vertices=12, mat=m_kurta)
    add_mesh_part("cube", (0, 0, 0.92), (0.30, 0.26, 0.22), mat=m_kurta)

    # Crimson Festive Shawl (Angavastram)
    add_mesh_part("torus", (0, 0, 1.28), (0.30, 0.26, 0.065), rot=(0.45, 0.35, 0), mat=m_shawl)

    # Cheering Arms (Raised in Celebration)
    add_mesh_part("cyl", (0, -0.34, 1.48), (0.075, 0.075, 0.28), rot=(-0.4, 0, 0.4), mat=m_kurta)
    add_mesh_part("cyl", (0.06, -0.44, 1.86), (0.065, 0.065, 0.26), rot=(-0.6, 0.3, 0), mat=m_skin)
    add_mesh_part("uv", (0.07, -0.46, 2.06), (0.075, 0.065, 0.065), mat=m_skin)

    add_mesh_part("cyl", (0, 0.34, 1.48), (0.075, 0.075, 0.28), rot=(0.4, 0, -0.4), mat=m_kurta)
    add_mesh_part("cyl", (0.06, 0.44, 1.86), (0.065, 0.065, 0.26), rot=(0.6, 0.3, 0), mat=m_skin)
    add_mesh_part("uv", (0.07, 0.44, 2.06), (0.075, 0.065, 0.065), mat=m_skin)

    # Neck & Head
    add_mesh_part("cyl", (0, 0, 1.52), (0.09, 0.09, 0.08), mat=m_skin)
    add_mesh_part("uv", (0, 0, 1.72), (0.17, 0.16, 0.19), mat=m_skin)

    # Traditional Festive Pheta Turban
    add_mesh_part("torus", (0, 0, 1.82), (0.23, 0.21, 0.13), rot=(0.1, 0, 0), mat=m_pheta)
    add_mesh_part("uv", (0, 0, 1.90), (0.21, 0.19, 0.13), mat=m_pheta)
    # Turban Pleated Fan Crest (Turra)
    add_mesh_part("cube", (0.09, 0.13, 2.02), (0.04, 0.15, 0.18), rot=(0, 0.3, 0.4), mat=m_gold_lace)

    export_fbx("Citizen", leg_l)


# ==============================================================================
# 5. MOOSHAK HERO MOUSE (DETAILED PBR HERO ASSET)
# ==============================================================================
def build_mooshak_hero():
    reset_scene()

    # Materials
    m_fur = create_material("M_Mooshak_Fur", (0.55, 0.45, 0.38, 1.0), metallic=0.0, roughness=0.75)
    m_inner_ear = create_material("M_Mooshak_InnerEar", (0.92, 0.58, 0.62, 1.0), metallic=0.0, roughness=0.6)
    m_scarf = create_material("M_Hero_Scarf", (0.98, 0.45, 0.08, 1.0), metallic=0.0, roughness=0.65, emission=(0.98, 0.45, 0.08, 1.0), emission_strength=0.4)
    m_eye = create_material("M_Eye_Obsidian", (0.08, 0.08, 0.08, 1.0), metallic=0.9, roughness=0.08)
    m_nose = create_material("M_Nose_Pink", (0.88, 0.48, 0.52, 1.0), metallic=0.0, roughness=0.45)

    body = add_mesh_part("uv", (0, 0, 0.30), (0.42, 0.30, 0.28), mat=m_fur)
    add_mesh_part("uv", (0.34, 0, 0.44), (0.24, 0.22, 0.22), mat=m_fur) # Head
    add_mesh_part("uv", (0.54, 0, 0.38), (0.14, 0.10, 0.09), mat=m_fur) # Snout
    add_mesh_part("uv", (0.64, 0, 0.38), (0.045, 0.045, 0.045), mat=m_nose) # Nose

    # Big Expressive Mouse Ears
    add_mesh_part("uv", (0.28, 0.18, 0.66), (0.18, 0.04, 0.22), rot=(0.4, 0, 0.5), mat=m_fur)
    add_mesh_part("uv", (0.28, -0.18, 0.66), (0.18, 0.04, 0.22), rot=(-0.4, 0, -0.5), mat=m_fur)
    # Inner Pink Lining
    add_mesh_part("uv", (0.29, 0.19, 0.66), (0.12, 0.02, 0.15), rot=(0.4, 0, 0.5), mat=m_inner_ear)
    add_mesh_part("uv", (0.29, -0.19, 0.66), (0.12, 0.02, 0.15), rot=(-0.4, 0, -0.5), mat=m_inner_ear)

    # Eyes
    add_mesh_part("uv", (0.45, 0.09, 0.50), (0.045, 0.045, 0.045), mat=m_eye)
    add_mesh_part("uv", (0.45, -0.09, 0.50), (0.045, 0.045, 0.045), mat=m_eye)

    # Dynamic Hero Scarf
    add_mesh_part("cube", (0.14, 0, 0.40), (0.18, 0.24, 0.05), mat=m_scarf)
    add_mesh_part("cube", (-0.10, 0.18, 0.38), (0.28, 0.08, 0.04), rot=(0.2, 0.3, 0.6), mat=m_scarf)

    # Long Expressive Tail
    add_mesh_part("cyl", (-0.30, 0, 0.24), (0.055, 0.055, 0.24), rot=(1.2, 0, 0), mat=m_fur)
    add_mesh_part("cyl", (-0.52, 0, 0.36), (0.040, 0.040, 0.22), rot=(0.9, 0, 0), mat=m_fur)

    # Paws
    add_mesh_part("uv", (0.18, 0.14, 0.07), (0.08, 0.06, 0.05), mat=m_fur)
    add_mesh_part("uv", (0.18, -0.14, 0.07), (0.08, 0.06, 0.05), mat=m_fur)
    add_mesh_part("uv", (-0.14, 0.14, 0.07), (0.08, 0.06, 0.05), mat=m_fur)
    add_mesh_part("uv", (-0.14, -0.14, 0.07), (0.08, 0.06, 0.05), mat=m_fur)

    export_fbx("Mooshak", body, target_dir=hero_dir)


if __name__ == "__main__":
    print("=== BUILDING 2026 AAA FESTIVAL 3D ASSETS IN BLENDER ===")
    build_ganesha_idol()
    build_rath_chariot()
    build_roadblock_gate()
    build_citizen_devotee()
    build_mooshak_hero()
    print("=== ALL 2026 ASSETS SUCCESSFULLY GENERATED AND EXPORTED ===")
