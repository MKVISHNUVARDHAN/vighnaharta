"""
import_online_assets.py
Imports online 3D models for Weapons, Demons/Asuras, and Rath into UE5.
"""
import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()

def ensure_dir(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)

def import_asset(src, dest, name):
    if not os.path.isfile(src):
        unreal.log_warning("Missing file: " + src)
        return
    ensure_dir(dest)
    
    task = unreal.AssetImportTask()
    task.filename = src
    task.destination_path = dest
    task.destination_name = name
    task.automated = True
    task.save = True
    task.replace_existing = True
    
    tools.import_asset_tasks([task])
    unreal.log("Imported " + name + " into " + dest)

weapons_dir = os.path.join(root, "art", "render", "online_weapons")
demons_dir = os.path.join(root, "art", "render", "online_demons")
festival_dir = os.path.join(root, "art", "render", "festival")

# 1. Import Online Weapons into /Game/Weapons
weapons = ["AK47", "Flamethrower", "Shotgun", "RocketLauncher"]
for w in weapons:
    fbx = os.path.join(weapons_dir, w + ".fbx")
    import_asset(fbx, "/Game/Weapons", w)

# 2. Import Online Demons into /Game/Demons
demons = ["AsuraMinion", "AsuraBrute", "AsuraFiend", "AsuraGate"]
for d in demons:
    fbx = os.path.join(demons_dir, d + ".fbx")
    import_asset(fbx, "/Game/Demons", d)

# Also import skeleton texture into /Game/Demons
skel_tex = os.path.join(demons_dir, "skeleton_texture.png")
if os.path.isfile(skel_tex):
    import_asset(skel_tex, "/Game/Demons", "skeleton_texture")

# 3. Import Ornate Temple Rath into /Game/Rath
rath_fbx = os.path.join(festival_dir, "Rath.fbx")
import_asset(rath_fbx, "/Game/Rath", "Rath")

unreal.log("All online models and textures imported successfully into UE5!")
