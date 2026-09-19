import unreal

def inspect_folder(folder):
    unreal.log_warning(f"=== CHECKING {folder} ===")
    assets = unreal.EditorAssetLibrary.list_assets(folder, recursive=True, include_folder=False)
    for a in assets:
        data = unreal.EditorAssetLibrary.find_asset_data(a)
        obj = unreal.load_asset(a)
        cname = obj.get_class().get_name() if obj else "None"
        unreal.log_warning(f"FOUND: {a} -> Class: {cname}, AssetClassPath: {data.asset_class_path.asset_name if data else ''}")

for f in ["/Game/Hero", "/Game/Astras", "/Game/Demons", "/Game/Rath", "/Game/Weapons", "/Game/City", "/Game/Roads"]:
    inspect_folder(f)
