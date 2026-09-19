import unreal
assets = unreal.EditorAssetLibrary.list_assets("/Game/Weapons", recursive=True, include_folder=False)
for a in assets:
    obj = unreal.load_asset(a)
    unreal.log_warning(f"WEAPON ASSET: {a} (Class: {obj.get_class().get_name() if obj else 'None'})")

demon_assets = unreal.EditorAssetLibrary.list_assets("/Game/Demons", recursive=True, include_folder=False)
for d in demon_assets:
    obj = unreal.load_asset(d)
    unreal.log_warning(f"DEMON ASSET: {d} (Class: {obj.get_class().get_name() if obj else 'None'})")

rath_assets = unreal.EditorAssetLibrary.list_assets("/Game/Rath", recursive=True, include_folder=False)
for r in rath_assets:
    obj = unreal.load_asset(r)
    unreal.log_warning(f"RATH ASSET: {r} (Class: {obj.get_class().get_name() if obj else 'None'})")
