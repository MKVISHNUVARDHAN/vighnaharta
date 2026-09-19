import unreal
assets = unreal.EditorAssetLibrary.list_assets("/Game/Hero", recursive=True, include_folder=False)
for a in assets:
    obj = unreal.load_asset(a)
    unreal.log_warning(f"HERO ASSET: {a} (Class: {obj.get_class().get_name() if obj else 'None'})")
