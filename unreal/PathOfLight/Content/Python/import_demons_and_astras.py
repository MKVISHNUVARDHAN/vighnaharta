"""
import_demons_and_astras.py
Imports Asura demonic enemy meshes and Divine Astra weapon meshes into /Game/Demons and /Game/Astras.
"""
import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()

def ensure_dir(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)

def import_fbx(src, dest, name):
    if not os.path.isfile(src):
        unreal.log_warning("Missing FBX: " + src)
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

fbx_dir = os.path.join(root, "art", "render", "asuras_and_astras")

# Import Demonic Asura models into /Game/Demons
asuras = ["AsuraMinion", "AsuraBrute", "AsuraGate"]
for name in asuras:
    fbx_path = os.path.join(fbx_dir, name + ".fbx")
    import_fbx(fbx_path, "/Game/Demons", name)

# Import Divine Astra models into /Game/Astras
astras = ["AstraVajra", "AstraTrident", "AstraChakra"]
for name in astras:
    fbx_path = os.path.join(fbx_dir, name + ".fbx")
    import_fbx(fbx_path, "/Game/Astras", name)

unreal.log("All Asura and Astra 3D assets imported successfully!")
