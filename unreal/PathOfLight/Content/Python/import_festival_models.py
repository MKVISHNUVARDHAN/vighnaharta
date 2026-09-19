"""Import festival 3D models into Unreal Engine Content directory."""
import os
import unreal

root = os.path.normpath(os.path.join(unreal.Paths.project_dir(), "..", "..", "art", "render", "festival"))
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
    unreal.log(f"[IMPORTED] {name} -> {dest}")


imp("GaneshaIdol", "/Game/Rath")
imp("Rath", "/Game/Rath")
imp("RoadblockGate", "/Game/City")
imp("Citizen", "/Game/City")

hero_src = os.path.normpath(os.path.join(unreal.Paths.project_dir(), "..", "..", "art", "render", "hero", "Mooshak.fbx"))
if os.path.isfile(hero_src):
    task = unreal.AssetImportTask()
    task.filename = hero_src
    task.destination_path = "/Game/Hero"
    task.destination_name = "Mooshak"
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    unreal.log("[IMPORTED] Mooshak -> /Game/Hero")

unreal.log("=== FESTIVAL ASSETS IMPORT FINISHED ===")
