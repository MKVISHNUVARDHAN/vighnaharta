import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()

rat_path = os.path.join(root, "art", "source", "cc0-public", "gobkit", "Rat.glb")
print(f"Importing {rat_path} into /Game/Hero/Rat...")

task = unreal.AssetImportTask()
task.filename = rat_path
task.destination_path = "/Game/Hero"
task.destination_name = "MooshakRat"
task.automated = True
task.save = True
task.replace_existing = True

tools.import_asset_tasks([task])
print("Import completed for MooshakRat!")
