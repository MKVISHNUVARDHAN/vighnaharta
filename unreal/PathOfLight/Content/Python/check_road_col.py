import unreal

mesh = unreal.EditorAssetLibrary.load_asset("/Game/Roads/RoadStraight")
if mesh:
    # Check body setup / collision
    body_setup = mesh.get_editor_property("body_setup")
    print("Body setup:", body_setup)
    if body_setup:
        print("Collision trace flag:", body_setup.get_editor_property("collision_trace_flag"))
