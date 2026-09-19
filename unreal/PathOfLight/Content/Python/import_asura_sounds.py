"""
import_asura_sounds.py
Imports asura_growl, asura_death, astra_vajra, astra_trishul, astra_chakra into /Game/Audio.
"""
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

mythic_audio_dir = os.path.join(root, "public", "assets", "audio", "mythic")
sounds = [
    "asura_growl",
    "asura_death",
    "astra_vajra",
    "astra_trishul",
    "astra_chakra",
]

for name in sounds:
    wav_path = os.path.join(mythic_audio_dir, name + ".wav")
    import_file(wav_path, "/Game/Audio", name)

unreal.log("Asura and Astra sounds imported successfully!")
