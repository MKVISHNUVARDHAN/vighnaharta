"""Import generated weapon sounds and existing impacts into /Game/Audio."""
import os
import unreal

proj = unreal.Paths.project_dir()
root = os.path.normpath(os.path.join(proj, "..", ".."))
tools = unreal.AssetToolsHelpers.get_asset_tools()

def ensure(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)

def import_file(src, dest, name):
    if not os.path.isfile(src):
        unreal.log_warning("Missing " + src)
        return
    ensure(dest)
    task = unreal.AssetImportTask()
    task.filename = src
    task.destination_path = dest
    task.destination_name = name
    task.automated = True
    task.save = True
    task.replace_existing = True
    tools.import_asset_tasks([task])
    unreal.log("Imported " + name + " into " + dest)

weapon_audio_dir = os.path.join(root, "public", "assets", "audio", "weapons")
weapons = [
    "ak47_shot",
    "flame_loop",
    "shotgun_blast",
    "rocket_launch",
    "rocket_boom",
    "rath_grind",
    "alarm_pulse",
]

for name in weapons:
    wav_path = os.path.join(weapon_audio_dir, name + ".wav")
    import_file(wav_path, "/Game/Audio", name)

# Also ensure essential impacts
impacts_dir = os.path.join(root, "public", "assets", "kenney", "impacts", "Audio")
impacts = [
    (os.path.join(impacts_dir, "impactWood_medium_000.ogg"), "wood_hit"),
    (os.path.join(impacts_dir, "impactWood_heavy_000.ogg"), "wood_heavy"),
    (os.path.join(impacts_dir, "impactBell_heavy_000.ogg"), "bell_hit"),
]
for src, name in impacts:
    import_file(src, "/Game/Audio", name)

unreal.log("Weapon and impact sounds import complete!")
