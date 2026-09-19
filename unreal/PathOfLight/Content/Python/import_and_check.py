import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()

# 1. Import Rat.glb
rat_path = os.path.join(root, "art", "source", "cc0-public", "gobkit", "Rat.glb")
if os.path.exists(rat_path):
    print(f"Importing {rat_path} into /Game/Hero/Mooshak...")
    task = unreal.AssetImportTask()
    task.filename = rat_path
    task.destination_path = "/Game/Hero"
    task.destination_name = "Mooshak"
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    print("Imported Mooshak!")

# 2. Import road-straight.fbx
road_fbx = os.path.join(root, "art", "source", "phase2", "roads", "Models", "FBX format", "road-straight.fbx")
road_tex = os.path.join(root, "art", "source", "phase2", "roads", "Models", "FBX format", "Textures", "colormap.png")

if os.path.exists(road_tex):
    print(f"Importing road texture {road_tex} into /Game/Roads...")
    task = unreal.AssetImportTask()
    task.filename = road_tex
    task.destination_path = "/Game/Roads"
    task.destination_name = "T_Road_Colormap"
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    print("Imported T_Road_Colormap!")

if os.path.exists(road_fbx):
    print(f"Importing road mesh {road_fbx} into /Game/Roads...")
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
    options.import_materials = True
    options.import_as_skeletal = False
    options.static_mesh_import_data.combine_meshes = True
    options.static_mesh_import_data.generate_lightmap_u_vs = True
    # Scale up Kenney roads if needed (Kenney units are usually meters: 1 unit = 1 meter, UE5 is cm: 100 units = 1 meter)
    options.static_mesh_import_data.import_uniform_scale = 100.0
    task.options = options
    tools.import_asset_tasks([task])
    print("Imported RoadStraight!")

# Now inspect all folders
for folder in ["/Game/Hero", "/Game/Astras", "/Game/Demons", "/Game/Rath", "/Game/Weapons", "/Game/Roads"]:
    unreal.log_warning(f"=== CHECKING {folder} ===")
    assets = unreal.EditorAssetLibrary.list_assets(folder, recursive=True, include_folder=False)
    for a in assets:
        data = unreal.EditorAssetLibrary.find_asset_data(a)
        obj = unreal.load_asset(a)
        cname = obj.get_class().get_name() if obj else "None"
        obj_name = obj.get_name() if obj else "None"
        unreal.log_warning(f"ASSET_INFO: Path='{a}', Name='{obj_name}', Class='{cname}'")

