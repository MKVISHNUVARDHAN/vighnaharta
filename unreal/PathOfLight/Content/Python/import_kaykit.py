"""Import staged KayKit FBX into /Game/KayKit. Safe to re-run."""
import os
import unreal

src = os.path.normpath(
    os.path.join(
        unreal.Paths.project_dir(),
        "..",
        "..",
        "art",
        "render",
        "kaykit-fbx",
    )
)
dest = "/Game/KayKit"
names = [
    "building_A",
    "building_B",
    "building_C",
    "bench",
    "box_A",
    "bush",
    "streetlight",
]
if not unreal.EditorAssetLibrary.does_directory_exist(dest):
    unreal.EditorAssetLibrary.make_directory(dest)

tasks = []
for name in names:
    fbx = os.path.join(src, name + ".fbx")
    if not os.path.isfile(fbx):
        unreal.log_warning("Missing " + fbx)
        continue
    task = unreal.AssetImportTask()
    task.filename = fbx
    task.destination_path = dest
    task.destination_name = name
    task.automated = True
    task.save = True
    task.replace_existing = True
    task.replace_existing_settings = True
    tasks.append(task)

if tasks:
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks(tasks)
    unreal.log("Imported %d KayKit meshes into %s" % (len(tasks), dest))
else:
    unreal.log_warning("No KayKit FBX files to import.")
