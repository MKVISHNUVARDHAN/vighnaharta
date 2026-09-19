"""
generate_asura_and_astra_models.py
Generates 3D meshes using Blender 5.2 Python API:
  - Demons (Asuras): AsuraMinion, AsuraBrute, AsuraGate
  - Divine Astras (God Weapons): AstraVajra, AstraTrident, AstraChakra
Exports FBX files directly for Unreal Engine 5 import.
"""

import bpy
import bmesh
import math
import os

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "art", "render", "asuras_and_astras"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def export_active_object(filepath):
    bpy.ops.export_scene.fbx(
        filepath=filepath,
        use_selection=True,
        global_scale=100.0,  # Blender 1m -> UE 100cm
        apply_unit_scale=True,
        apply_scale_options='FBX_SCALE_ALL',
        bake_space_transform=True,
        object_types={'MESH'},
        mesh_smooth_type='FACE'
    )
    print(f"Exported: {filepath}")

def create_material(name, diffuse_color, metallic=0.0, roughness=0.5, emission_color=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = diffuse_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

# ==============================================================================
# 1. ASURA MINION (Horned Demon Soldier)
# ==============================================================================
def create_asura_minion():
    clear_scene()
    bm = bmesh.new()

    # Materials
    mat_skin = create_material("M_Asura_Skin", (0.15, 0.05, 0.05, 1.0), roughness=0.6)
    mat_horn = create_material("M_Asura_Horn", (0.05, 0.05, 0.05, 1.0), roughness=0.3)
    mat_eye = create_material("M_Asura_Eye", (1.0, 0.05, 0.02, 1.0), emission_color=(1.0, 0.1, 0.05, 1.0), emission_strength=5.0)

    # Torso (Muscular upper body)
    bpy.ops.mesh.primitive_cube_add(size=0.6, location=(0, 0, 0.7))
    torso = bpy.context.active_object
    torso.name = "AsuraMinion"
    torso.scale = (0.7, 0.5, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    torso.data.materials.append(mat_skin)

    # Spiked Shoulders (Pauldrons)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.18, depth=0.35, location=(sign * 0.45, 0, 0.95), rotation=(0, sign * math.radians(65), 0))
        sp = bpy.context.active_object
        sp.data.materials.append(mat_horn)
        sp.select_set(True)

    # Arms
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.6, location=(sign * 0.40, 0.15, 0.65), rotation=(math.radians(35), 0, sign * math.radians(15)))
        arm = bpy.context.active_object
        arm.data.materials.append(mat_skin)
        arm.select_set(True)

    # Demon Claws / Daggers
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.45, location=(sign * 0.45, 0.45, 0.5), rotation=(math.radians(80), 0, 0))
        blade = bpy.context.active_object
        blade.data.materials.append(mat_horn)
        blade.select_set(True)

    # Head
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.26, location=(0, 0.05, 1.22))
    head = bpy.context.active_object
    head.scale = (0.85, 0.95, 1.05)
    bpy.ops.object.transform_apply(scale=True)
    head.data.materials.append(mat_skin)
    head.select_set(True)

    # Menacing Horns (Curved outward and upward)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.10, depth=0.55, location=(sign * 0.22, -0.02, 1.48), rotation=(math.radians(-25), sign * math.radians(45), 0))
        horn = bpy.context.active_object
        horn.scale = (0.9, 0.9, 1.1)
        bpy.ops.object.transform_apply(scale=True)
        horn.data.materials.append(mat_horn)
        horn.select_set(True)

    # Glowing Red Eyes
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045, location=(sign * 0.09, 0.26, 1.25))
        eye = bpy.context.active_object
        eye.data.materials.append(mat_eye)
        eye.select_set(True)

    # Legs (Sturdy stance)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.6, location=(sign * 0.20, 0, 0.3), rotation=(0, sign * math.radians(-10), 0))
        leg = bpy.context.active_object
        leg.data.materials.append(mat_skin)
        leg.select_set(True)

    # Join everything into a single mesh
    torso.select_set(True)
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AsuraMinion.fbx"))

# ==============================================================================
# 2. ASURA BRUTE (Giant Heavy Rakshasa Warrior)
# ==============================================================================
def create_asura_brute():
    clear_scene()

    mat_skin = create_material("M_Rakshasa_Skin", (0.12, 0.04, 0.08, 1.0), roughness=0.7)
    mat_armor = create_material("M_Rakshasa_Armor", (0.08, 0.08, 0.10, 1.0), metallic=0.6, roughness=0.4)
    mat_gold = create_material("M_Rakshasa_Gold", (0.85, 0.60, 0.15, 1.0), metallic=0.8, roughness=0.3)
    mat_eye = create_material("M_Rakshasa_Eye", (1.0, 0.1, 0.0, 1.0), emission_color=(1.0, 0.15, 0.0, 1.0), emission_strength=8.0)

    # Heavy Muscular Torso
    bpy.ops.mesh.primitive_cube_add(size=0.9, location=(0, 0, 0.95))
    torso = bpy.context.active_object
    torso.name = "AsuraBrute"
    torso.scale = (1.1, 0.8, 1.1)
    bpy.ops.object.transform_apply(scale=True)
    torso.data.materials.append(mat_armor)

    # Heavy Armor Breastplate
    bpy.ops.mesh.primitive_cube_add(size=0.75, location=(0, 0.22, 1.0))
    plate = bpy.context.active_object
    plate.scale = (1.05, 0.3, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    plate.data.materials.append(mat_gold)
    plate.select_set(True)

    # Massive Spiked Shoulders
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(sign * 0.70, 0, 1.35))
        pauldron = bpy.context.active_object
        pauldron.data.materials.append(mat_armor)
        pauldron.select_set(True)

        # 3 Spikes on each shoulder
        for a, ang in enumerate([-35, 0, 35]):
            bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.35, location=(sign * 0.70, 0, 1.45), rotation=(math.radians(ang), sign * math.radians(45), 0))
            sp = bpy.context.active_object
            sp.data.materials.append(mat_gold)
            sp.select_set(True)

    # Giant Arms
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.85, location=(sign * 0.65, 0.15, 0.9), rotation=(math.radians(25), 0, sign * math.radians(12)))
        arm = bpy.context.active_object
        arm.data.materials.append(mat_skin)
        arm.select_set(True)

    # Heavy Spiked War Club / Gada in right hand
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=1.4, location=(0.85, 0.45, 0.8), rotation=(math.radians(40), 0, 0))
    handle = bpy.context.active_object
    handle.data.materials.append(mat_armor)
    handle.select_set(True)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.34, location=(0.85, 0.85, 1.3))
    club_head = bpy.context.active_object
    club_head.data.materials.append(mat_gold)
    club_head.select_set(True)

    # Spikes around the club head
    for ang in range(0, 360, 60):
        rad = math.radians(ang)
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.25, location=(0.85 + math.cos(rad)*0.35, 0.85 + math.sin(rad)*0.35, 1.3), rotation=(0, 0, rad))
        csp = bpy.context.active_object
        csp.data.materials.append(mat_armor)
        csp.select_set(True)

    # Head (Ferocious Rakshasa)
    bpy.ops.mesh.primitive_cube_add(size=0.42, location=(0, 0.08, 1.55))
    head = bpy.context.active_object
    head.scale = (0.95, 1.1, 1.05)
    bpy.ops.object.transform_apply(scale=True)
    head.data.materials.append(mat_skin)
    head.select_set(True)

    # 4 Curved Asura Horns
    for sign in [-1, 1]:
        # Main big horns
        bpy.ops.mesh.primitive_cone_add(radius1=0.14, depth=0.75, location=(sign * 0.28, -0.05, 1.85), rotation=(math.radians(-25), sign * math.radians(55), 0))
        h1 = bpy.context.active_object
        h1.data.materials.append(mat_gold)
        h1.select_set(True)

        # Lower brow horns
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.35, location=(sign * 0.18, 0.22, 1.68), rotation=(math.radians(40), sign * math.radians(35), 0))
        h2 = bpy.context.active_object
        h2.data.materials.append(mat_armor)
        h2.select_set(True)

    # Glowing Red Eyes
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, location=(sign * 0.12, 0.30, 1.58))
        eye = bpy.context.active_object
        eye.data.materials.append(mat_eye)
        eye.select_set(True)

    # Fangs
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.04, depth=0.18, location=(sign * 0.09, 0.28, 1.40), rotation=(math.radians(180), 0, 0))
        fang = bpy.context.active_object
        fang.data.materials.append(mat_gold)
        fang.select_set(True)

    # Powerful Legs
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.24, depth=0.75, location=(sign * 0.32, 0, 0.38), rotation=(0, sign * math.radians(-8), 0))
        leg = bpy.context.active_object
        leg.data.materials.append(mat_armor)
        leg.select_set(True)

    torso.select_set(True)
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AsuraBrute.fbx"))

# ==============================================================================
# 3. ASURA GATE (Mahishasura Fortress Demon Gate)
# ==============================================================================
def create_asura_gate():
    clear_scene()

    mat_stone = create_material("M_Gate_Stone", (0.10, 0.09, 0.12, 1.0), roughness=0.8)
    mat_iron = create_material("M_Gate_Iron", (0.05, 0.05, 0.06, 1.0), metallic=0.7, roughness=0.3)
    mat_gold = create_material("M_Gate_Gold", (0.85, 0.55, 0.12, 1.0), metallic=0.85, roughness=0.25)
    mat_eye = create_material("M_Gate_Eye", (1.0, 0.08, 0.02, 1.0), emission_color=(1.0, 0.1, 0.05, 1.0), emission_strength=10.0)

    # Base Arch Frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.2))
    arch = bpy.context.active_object
    arch.name = "AsuraGate"
    arch.scale = (0.5, 3.8, 0.4)
    bpy.ops.object.transform_apply(scale=True)
    arch.data.materials.append(mat_stone)

    # Side Fortress Pillars (Left and Right)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=2.4, location=(0, sign * 1.85, 1.2), vertices=8)
        col = bpy.context.active_object
        col.data.materials.append(mat_stone)
        col.select_set(True)

        # Pillar Capital / Spikes
        bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.8, location=(0, sign * 1.85, 2.7))
        cap = bpy.context.active_object
        cap.data.materials.append(mat_gold)
        cap.select_set(True)

    # Central Demonic Skull Crest
    bpy.ops.mesh.primitive_cube_add(size=0.8, location=(0.15, 0, 1.6))
    skull = bpy.context.active_object
    skull.scale = (0.6, 0.9, 0.95)
    bpy.ops.object.transform_apply(scale=True)
    skull.data.materials.append(mat_stone)
    skull.select_set(True)

    # Massive Buffalo / Demon Horns Curving Across the Arch
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.18, depth=1.6, location=(0.15, sign * 0.9, 2.1), rotation=(0, sign * math.radians(75), sign * math.radians(20)))
        horn = bpy.context.active_object
        horn.data.materials.append(mat_gold)
        horn.select_set(True)

    # Glowing Demon Eyes in the Skull Crest
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(0.35, sign * 0.22, 1.7))
        eye = bpy.context.active_object
        eye.data.materials.append(mat_eye)
        eye.select_set(True)

    # Spiked Demon Portcullis / Iron Teeth Hanging Down
    for i in range(-5, 6):
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.7, location=(0, i * 0.32, 0.75), rotation=(math.radians(180), 0, 0))
        tooth = bpy.context.active_object
        tooth.data.materials.append(mat_iron)
        tooth.select_set(True)

    arch.select_set(True)
    bpy.context.view_layer.objects.active = arch
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AsuraGate.fbx"))

# ==============================================================================
# 4. ASTRA VAJRA (Indra's Celestial Thunderbolt)
# ==============================================================================
def create_astra_vajra():
    clear_scene()

    mat_gold = create_material("M_Vajra_Gold", (0.95, 0.82, 0.25, 1.0), metallic=0.9, roughness=0.15, emission_color=(0.95, 0.85, 0.3, 1.0), emission_strength=2.0)
    mat_cyan = create_material("M_Vajra_Lightning", (0.2, 0.85, 1.0, 1.0), emission_color=(0.2, 0.85, 1.0, 1.0), emission_strength=6.0)

    # Central Sphere / Handle
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0, 0, 0))
    core = bpy.context.active_object
    core.name = "AstraVajra"
    core.data.materials.append(mat_cyan)

    # Central Grip Ribs
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.4, location=(0, 0, 0), rotation=(0, math.radians(90), 0))
    grip = bpy.context.active_object
    grip.data.materials.append(mat_gold)
    grip.select_set(True)

    # Double-headed Diamond Prongs (Along X-axis)
    for sign in [-1, 1]:
        # Lotus Ring Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.12, location=(sign * 0.25, 0, 0), rotation=(0, math.radians(90), 0))
        base = bpy.context.active_object
        base.data.materials.append(mat_gold)
        base.select_set(True)

        # Central Piercing Spike
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.6, location=(sign * 0.55, 0, 0), rotation=(0, sign * math.radians(90), 0))
        spike = bpy.context.active_object
        spike.data.materials.append(mat_cyan)
        spike.select_set(True)

        # 4 Outer Curved Prongs
        for ang in range(0, 360, 90):
            rad = math.radians(ang)
            y = math.cos(rad) * 0.15
            z = math.sin(rad) * 0.15
            bpy.ops.mesh.primitive_cone_add(radius1=0.06, depth=0.5, location=(sign * 0.48, y, z), rotation=(0, sign * math.radians(80), rad))
            prong = bpy.context.active_object
            prong.data.materials.append(mat_gold)
            prong.select_set(True)

    core.select_set(True)
    bpy.context.view_layer.objects.active = core
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AstraVajra.fbx"))

# ==============================================================================
# 5. ASTRA TRISHUL (Lord Shiva's Holy Trident)
# ==============================================================================
def create_astra_trishul():
    clear_scene()

    mat_gold = create_material("M_Trishul_Gold", (1.0, 0.85, 0.30, 1.0), metallic=0.9, roughness=0.15)
    mat_glow = create_material("M_Trishul_Glow", (0.3, 0.85, 1.0, 1.0), emission_color=(0.3, 0.85, 1.0, 1.0), emission_strength=4.5)

    # Central Shaft Collar
    bpy.ops.mesh.primitive_cylinder_add(radius=0.10, depth=0.8, location=(-0.3, 0, 0), rotation=(0, math.radians(90), 0))
    shaft = bpy.context.active_object
    shaft.name = "AstraTrident"
    shaft.data.materials.append(mat_gold)

    # Crescent Moon Motif Base
    bpy.ops.mesh.primitive_torus_add(major_radius=0.32, minor_radius=0.06, location=(0.12, 0, 0), rotation=(0, math.radians(90), 0))
    crescent = bpy.context.active_object
    crescent.scale = (1.0, 1.0, 0.45)
    bpy.ops.object.transform_apply(scale=True)
    crescent.data.materials.append(mat_gold)
    crescent.select_set(True)

    # Central Majestic Spear Point
    bpy.ops.mesh.primitive_cone_add(radius1=0.14, depth=0.95, location=(0.55, 0, 0), rotation=(0, math.radians(90), 0))
    blade_center = bpy.context.active_object
    blade_center.scale = (1.2, 0.5, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    blade_center.data.materials.append(mat_glow)
    blade_center.select_set(True)

    # Left & Right Curved Prongs
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.10, depth=0.85, location=(0.42, sign * 0.32, 0), rotation=(0, math.radians(82), sign * math.radians(16)))
        blade_side = bpy.context.active_object
        blade_side.scale = (1.1, 0.45, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        blade_side.data.materials.append(mat_gold)
        blade_side.select_set(True)

    # Sacred Damaru (Hourglass drum) in center
    bpy.ops.mesh.primitive_cone_add(radius1=0.12, radius2=0.04, depth=0.22, location=(0, 0, 0.18), rotation=(0, 0, 0))
    d1 = bpy.context.active_object
    d1.data.materials.append(mat_gold)
    d1.select_set(True)

    bpy.ops.mesh.primitive_cone_add(radius1=0.04, radius2=0.12, depth=0.22, location=(0, 0, 0.38), rotation=(0, 0, 0))
    d2 = bpy.context.active_object
    d2.data.materials.append(mat_gold)
    d2.select_set(True)

    shaft.select_set(True)
    bpy.context.view_layer.objects.active = shaft
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AstraTrident.fbx"))

# ==============================================================================
# 6. ASTRA CHAKRA (Brahmastra / Sudarshana Solar Disc)
# ==============================================================================
def create_astra_chakra():
    clear_scene()

    mat_gold = create_material("M_Chakra_Gold", (1.0, 0.88, 0.35, 1.0), metallic=0.95, roughness=0.12, emission_color=(1.0, 0.85, 0.25, 1.0), emission_strength=2.5)
    mat_solar = create_material("M_Chakra_Solar", (1.0, 0.45, 0.08, 1.0), emission_color=(1.0, 0.45, 0.08, 1.0), emission_strength=7.0)

    # Central Lotus Hub
    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.14, location=(0, 0, 0))
    hub = bpy.context.active_object
    hub.name = "AstraChakra"
    hub.data.materials.append(mat_solar)

    # Ornate Outer Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.75, minor_radius=0.08, location=(0, 0, 0))
    ring = bpy.context.active_object
    ring.data.materials.append(mat_gold)
    ring.select_set(True)

    # 8 Radiant Spokes
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.75, location=(math.cos(rad)*0.38, math.sin(rad)*0.38, 0), rotation=(math.radians(90), 0, rad))
        spoke = bpy.context.active_object
        spoke.data.materials.append(mat_gold)
        spoke.select_set(True)

    # 12 Serrated Solar Blades around circumference
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        x = math.cos(rad) * 0.88
        y = math.sin(rad) * 0.88
        bpy.ops.mesh.primitive_cone_add(radius1=0.12, depth=0.45, location=(x, y, 0), rotation=(0, math.radians(90), rad + math.radians(35)))
        blade = bpy.context.active_object
        blade.scale = (0.4, 1.0, 1.2)
        bpy.ops.object.transform_apply(scale=True)
        blade.data.materials.append(mat_solar)
        blade.select_set(True)

    hub.select_set(True)
    bpy.context.view_layer.objects.active = hub
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()

    export_active_object(os.path.join(OUTPUT_DIR, "AstraChakra.fbx"))

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
if __name__ == "__main__":
    print("Generating Asura and Astra models...")
    create_asura_minion()
    create_asura_brute()
    create_asura_gate()
    create_astra_vajra()
    create_astra_trishul()
    create_astra_chakra()
    print("All models generated successfully!")
