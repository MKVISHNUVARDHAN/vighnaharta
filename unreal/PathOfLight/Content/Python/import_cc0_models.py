"""Import Gobkit Rat and KayKit dungeon props converted to FBX."""
import os
import unreal

root = os.path.normpath(os.path.join(unreal.Paths.project_dir(), "..", "..", "art", "render", "cc0-fbx"))
tools = unreal.AssetToolsHelpers.get_asset_tools()


def imp(name, dest):
    src = os.path.join(root, name + ".fbx")
    if not os.path.isfile(src):
        unreal.log_warning("Missing " + src)
        return
    if not unreal.EditorAssetLibrary.does_directory_exist(dest):
        unreal.EditorAssetLibrary.make_directory(dest)
    task = unreal.AssetImportTask()
    task.filename = src
    task.destination_path = dest
    task.destination_name = name
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    unreal.log("Imported " + name)


imp("Rat", "/Game/Hero")
imp("Marmot", "/Game/Hero")
for n in ["banner_red", "banner_yellow", "barrel_large", "barrel_small", "candle_lit", "crates_stacked"]:
    imp(n, "/Game/City")
unreal.log("CC0 model import finished")
