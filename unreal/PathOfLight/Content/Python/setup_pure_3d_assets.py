import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()
mat_lib = unreal.MaterialEditingLibrary

def create_or_load_material(path, name):
    full = f"{path}/{name}"
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)
    if unreal.EditorAssetLibrary.does_asset_exist(full):
        mat = unreal.EditorAssetLibrary.load_asset(full)
    else:
        mat = tools.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())
    mat_lib.delete_all_material_expressions(mat)
    return mat, full

# 1. IMPORT ROAD STRAIGHT WITH SCALE 10.0 (1000cm x 1000cm)
road_fbx = os.path.join(root, "art", "source", "phase2", "roads", "Models", "FBX format", "road-straight.fbx")
road_tex = os.path.join(root, "art", "source", "phase2", "roads", "Models", "FBX format", "Textures", "colormap.png")

if os.path.exists(road_tex):
    print("Importing road colormap texture...")
    task = unreal.AssetImportTask()
    task.filename = road_tex
    task.destination_path = "/Game/Roads"
    task.destination_name = "T_Road_Colormap"
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])

if os.path.exists(road_fbx):
    print("Importing road straight mesh...")
    task = unreal.AssetImportTask()
    task.filename = road_fbx
    task.destination_path = "/Game/Roads"
    task.destination_name = "RoadStraight"
    task.automated = True
    task.save = True
    task.replace_existing = True
    options = unreal.FbxImportUI()
    options.import_mesh = True
    options.import_textures = False
    options.import_materials = False
    options.import_as_skeletal = False
    options.static_mesh_import_data.combine_meshes = True
    options.static_mesh_import_data.generate_lightmap_u_vs = True
    options.static_mesh_import_data.import_uniform_scale = 10.0
    task.options = options
    tools.import_asset_tasks([task])

# Create M_Road_Straight
road_mat, road_mat_path = create_or_load_material("/Game/Roads", "M_Road_Straight")
tex_node = mat_lib.create_material_expression(road_mat, unreal.MaterialExpressionTextureSample, -400, -50)
road_tex_asset = unreal.EditorAssetLibrary.load_asset("/Game/Roads/T_Road_Colormap")
if road_tex_asset:
    tex_node.set_editor_property("texture", road_tex_asset)
mat_lib.connect_material_property(tex_node, "RGB", unreal.MaterialProperty.MP_BASE_COLOR)

rough_node = mat_lib.create_material_expression(road_mat, unreal.MaterialExpressionConstant, -200, 150)
rough_node.set_editor_property("r", 0.75)
mat_lib.connect_material_property(rough_node, "", unreal.MaterialProperty.MP_ROUGHNESS)
mat_lib.recompile_material(road_mat)
unreal.EditorAssetLibrary.save_asset(road_mat_path)

road_mesh = unreal.EditorAssetLibrary.load_asset("/Game/Roads/RoadStraight")
if road_mesh:
    for s in range(road_mesh.get_num_sections(0)):
        road_mesh.set_material(s, road_mat)
    unreal.EditorAssetLibrary.save_asset("/Game/Roads/RoadStraight")
    print("Assigned M_Road_Straight to RoadStraight mesh!")

# 2. IMPORT MOOSHAK RAT DIFFUSE TEXTURE & BUILD M_MOOSHAK
rat_tex_src = os.path.join(root, "art", "source", "cc0-public", "gobkit", "Rat_Texture_0.png")
if os.path.exists(rat_tex_src):
    task = unreal.AssetImportTask()
    task.filename = rat_tex_src
    task.destination_path = "/Game/Hero"
    task.destination_name = "T_Mooshak_BaseColor"
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])

mooshak_mat, mooshak_mat_path = create_or_load_material("/Game/Hero", "M_Mooshak")
m_tex_node = mat_lib.create_material_expression(mooshak_mat, unreal.MaterialExpressionTextureSample, -400, -50)
mooshak_tex_asset = unreal.EditorAssetLibrary.load_asset("/Game/Hero/T_Mooshak_BaseColor")
if mooshak_tex_asset:
    m_tex_node.set_editor_property("texture", mooshak_tex_asset)
mat_lib.connect_material_property(m_tex_node, "RGB", unreal.MaterialProperty.MP_BASE_COLOR)

m_rough = mat_lib.create_material_expression(mooshak_mat, unreal.MaterialExpressionConstant, -200, 150)
m_rough.set_editor_property("r", 0.65)
mat_lib.connect_material_property(m_rough, "", unreal.MaterialProperty.MP_ROUGHNESS)
mat_lib.recompile_material(mooshak_mat)
unreal.EditorAssetLibrary.save_asset(mooshak_mat_path)

mooshak_mesh = unreal.EditorAssetLibrary.load_asset("/Game/Hero/Mooshak")
if mooshak_mesh:
    for s in range(mooshak_mesh.get_num_sections(0)):
        mooshak_mesh.set_material(s, mooshak_mat)
    unreal.EditorAssetLibrary.save_asset("/Game/Hero/Mooshak")
    print("Assigned M_Mooshak to Mooshak mesh!")

# 3. BUILD GANESHA GOLD MATERIAL
ganesha_mat, ganesha_mat_path = create_or_load_material("/Game/Rath", "M_Ganesha_Gold")
g_color = mat_lib.create_material_expression(ganesha_mat, unreal.MaterialExpressionConstant3Vector, -400, -100)
g_color.set_editor_property("constant", unreal.LinearColor(1.0, 0.78, 0.22, 1.0))
mat_lib.connect_material_property(g_color, "", unreal.MaterialProperty.MP_BASE_COLOR)

g_metal = mat_lib.create_material_expression(ganesha_mat, unreal.MaterialExpressionConstant, -400, 50)
g_metal.set_editor_property("r", 1.0)
mat_lib.connect_material_property(g_metal, "", unreal.MaterialProperty.MP_METALLIC)

g_rough = mat_lib.create_material_expression(ganesha_mat, unreal.MaterialExpressionConstant, -400, 150)
g_rough.set_editor_property("r", 0.22)
mat_lib.connect_material_property(g_rough, "", unreal.MaterialProperty.MP_ROUGHNESS)

g_emiss = mat_lib.create_material_expression(ganesha_mat, unreal.MaterialExpressionConstant3Vector, -400, 250)
g_emiss.set_editor_property("constant", unreal.LinearColor(0.28, 0.18, 0.05, 1.0))
mat_lib.connect_material_property(g_emiss, "", unreal.MaterialProperty.MP_EMISSIVE_COLOR)
mat_lib.recompile_material(ganesha_mat)
unreal.EditorAssetLibrary.save_asset(ganesha_mat_path)

ganesha_mesh = unreal.EditorAssetLibrary.load_asset("/Game/Rath/GaneshaIdol")
if ganesha_mesh:
    for s in range(ganesha_mesh.get_num_sections(0)):
        ganesha_mesh.set_material(s, ganesha_mat)
    unreal.EditorAssetLibrary.save_asset("/Game/Rath/GaneshaIdol")
    print("Assigned M_Ganesha_Gold to GaneshaIdol mesh!")

# 4. BUILD RATH MATERIALS (TEAK WOOD, GOLD TRIM, SACRED CANOPY)
rath_wood, rath_wood_path = create_or_load_material("/Game/Rath", "M_Rath_TeakWood")
w_col = mat_lib.create_material_expression(rath_wood, unreal.MaterialExpressionConstant3Vector, -400, -100)
w_col.set_editor_property("constant", unreal.LinearColor(0.38, 0.17, 0.07, 1.0))
mat_lib.connect_material_property(w_col, "", unreal.MaterialProperty.MP_BASE_COLOR)
w_rough = mat_lib.create_material_expression(rath_wood, unreal.MaterialExpressionConstant, -400, 100)
w_rough.set_editor_property("r", 0.38)
mat_lib.connect_material_property(w_rough, "", unreal.MaterialProperty.MP_ROUGHNESS)
mat_lib.recompile_material(rath_wood)
unreal.EditorAssetLibrary.save_asset(rath_wood_path)

rath_canopy, rath_canopy_path = create_or_load_material("/Game/Rath", "M_Rath_Canopy")
c_col = mat_lib.create_material_expression(rath_canopy, unreal.MaterialExpressionConstant3Vector, -400, -100)
c_col.set_editor_property("constant", unreal.LinearColor(0.88, 0.18, 0.06, 1.0))
mat_lib.connect_material_property(c_col, "", unreal.MaterialProperty.MP_BASE_COLOR)
c_rough = mat_lib.create_material_expression(rath_canopy, unreal.MaterialExpressionConstant, -400, 100)
c_rough.set_editor_property("r", 0.85)
mat_lib.connect_material_property(c_rough, "", unreal.MaterialProperty.MP_ROUGHNESS)
mat_lib.recompile_material(rath_canopy)
unreal.EditorAssetLibrary.save_asset(rath_canopy_path)

rath_mesh = unreal.EditorAssetLibrary.load_asset("/Game/Rath/Rath")
if rath_mesh:
    num_sections = rath_mesh.get_num_sections(0)
    for s in range(num_sections):
        # alternate wood, gold trim, canopy
        if s == 0:
            rath_mesh.set_material(s, rath_wood)
        elif s == 1:
            rath_mesh.set_material(s, rath_canopy)
        elif s == 2:
            rath_mesh.set_material(s, ganesha_mat) # gold trim
        else:
            rath_mesh.set_material(s, rath_wood)
    unreal.EditorAssetLibrary.save_asset("/Game/Rath/Rath")
    print("Assigned materials to Rath mesh!")

print("=== ALL PURE 3D ASSETS CONFIGURED SUCCESSFULLY ===")
