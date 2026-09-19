"""Import Blender festival FBX + Poly Haven HDRI (CC0)."""
import os
import unreal

proj = unreal.Paths.project_dir()
fest = os.path.normpath(os.path.join(proj, "..", "..", "art", "render", "festival"))
hdri = os.path.normpath(os.path.join(proj, "..", "..", "art", "source", "cc0-public", "hdris", "kiara_1_dawn_1k.hdr"))
tools = unreal.AssetToolsHelpers.get_asset_tools()


def imp(src, dest, name):
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
    unreal.log("Imported " + name + " -> " + dest)


imp(os.path.join(fest, "Rath.fbx"), "/Game/Rath", "Rath")
imp(os.path.join(fest, "GaneshaIdol.fbx"), "/Game/Rath", "GaneshaIdol")
imp(os.path.join(fest, "RoadblockGate.fbx"), "/Game/City", "RoadblockGate")
imp(os.path.join(fest, "Citizen.fbx"), "/Game/City", "Citizen")
imp(hdri, "/Game/Env", "kiara_1_dawn")
unreal.log("Festival + HDRI import finished")
