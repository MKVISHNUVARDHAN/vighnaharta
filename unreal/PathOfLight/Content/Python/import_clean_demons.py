import os
import unreal

tools = unreal.AssetToolsHelpers.get_asset_tools()
proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
demons_dir = os.path.join(root, "art", "render", "online_demons")

def import_clean(name, fbx_name):
    src = os.path.join(demons_dir, fbx_name)
    task = unreal.AssetImportTask()
    task.filename = src
    task.destination_path = "/Game/Demons"
    task.destination_name = name
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    unreal.log("Imported " + name)

import_clean("AsuraMinion", "AsuraMinion_Clean.fbx")
import_clean("AsuraBrute", "AsuraBrute_Clean.fbx")
import_clean("AsuraFiend", "AsuraFiend_Clean.fbx")
