import unreal

mesh = unreal.EditorAssetLibrary.load_asset("/Game/Roads/RoadStraight")
if mesh:
    bounds = mesh.get_bounds()
    print(f"ROAD_BOUNDS: origin={bounds.origin}, box_extent={bounds.box_extent}, sphere_radius={bounds.sphere_radius}")
else:
    print("ROAD_BOUNDS: RoadStraight not found!")
