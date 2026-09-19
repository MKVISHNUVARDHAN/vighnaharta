"""Import licensed CC0 audio and Kenney city meshes already in this repo."""
import os
import unreal

root = os.path.normpath(os.path.join(unreal.Paths.project_dir(), "..", ".."))
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
    unreal.log("Imported " + name)


audio = [
    (os.path.join(root, "public", "assets", "audio", "festival", "tabla-tune.mp3"), "tabla_tune"),
    (os.path.join(root, "public", "assets", "audio", "festival", "india-rhythm.mp3"), "india_rhythm"),
    (os.path.join(root, "public", "assets", "audio", "festival", "crowd-shouting.ogg"), "crowd_shouting"),
    (os.path.join(root, "public", "assets", "audio", "festival", "correct-bell.wav"), "correct_bell"),
    (os.path.join(root, "public", "assets", "audio", "festival", "pleasing-bell.wav"), "pleasing_bell"),
    (os.path.join(root, "public", "assets", "kenney", "impacts", "Audio", "impactWood_medium_000.ogg"), "wood_hit"),
    (os.path.join(root, "public", "assets", "kenney", "impacts", "Audio", "impactWood_heavy_000.ogg"), "wood_heavy"),
    (os.path.join(root, "public", "assets", "kenney", "impacts", "Audio", "impactBell_heavy_000.ogg"), "bell_hit"),
    (os.path.join(root, "public", "assets", "kenney", "rpg-audio", "Audio", "cloth1.ogg"), "cloth"),
    (os.path.join(root, "public", "assets", "kenney", "rpg-audio", "Audio", "creak1.ogg"), "creak"),
    (os.path.join(root, "public", "assets", "kenney", "rpg-audio", "Audio", "metalLatch.ogg"), "latch"),
    (os.path.join(root, "public", "assets", "kenney", "music-jingles", "Audio", "Steel jingles", "jingles_STEEL08.ogg"), "jingle_perfect"),
    (os.path.join(root, "public", "assets", "kenney", "music-jingles", "Audio", "Steel jingles", "jingles_STEEL12.ogg"), "jingle_surge"),
    (os.path.join(root, "public", "assets", "kenney", "rpg-audio", "Audio", "metalPot1.ogg"), "metal_pot"),
    (os.path.join(root, "public", "assets", "kenney", "rpg-audio", "Audio", "knifeSlice.ogg"), "whip"),
    (os.path.join(root, "public", "assets", "kenney", "music-jingles", "Audio", "Steel jingles", "jingles_STEEL00.ogg"), "jingle_start"),
]
for src, name in audio:
    import_file(src, "/Game/Audio", name)

city = os.path.join(root, "public", "assets", "kenney", "commercial", "Models", "FBX format")
for name in ["building-a", "building-b", "building-c", "detail-awning", "detail-parasol-a"]:
    import_file(os.path.join(city, name + ".fbx"), "/Game/City", name.replace("-", "_"))

tree = os.path.join(root, "public", "assets", "kenney", "nature", "Models", "FBX format", "tree_default.fbx")
import_file(tree, "/Game/City", "tree_default")
unreal.log("Cinematic asset import finished.")
