"""Run once in UnrealEditor-Cmd after compiling the editor target."""
import unreal

level = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
path = "/Game/Maps/TailLab"
if unreal.EditorAssetLibrary.does_asset_exist(path):
    unreal.log("TailLab already exists; preserving authored map.")
else:
    if not level.new_level(path):
        raise RuntimeError("Could not create TailLab")
    actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    actors.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(100, 0, 100))
    if not level.save_current_level():
        raise RuntimeError("Could not save TailLab")
    unreal.log("TailLab saved. Runtime GameMode creates the physics course.")
