import unreal

for p in [
    "/Game/Weapons/AK47.blaster-a",
    "/Game/Weapons/Flamethrower.Flamethrower",
    "/Game/Weapons/RocketLauncher.RocketLauncher",
    "/Game/Weapons/Shotgun.blaster-d",
    "/Game/KayKit/building_A.building_A",
    "/Game/KayKit/box_A.box_A",
    "/Game/City/Citizen.Citizen",
    "/Game/City/RoadblockGate.RoadblockGate"
]:
    mesh = unreal.load_asset(p)
    if mesh and isinstance(mesh, unreal.StaticMesh):
        bounds = mesh.get_bounds()
        box = bounds.box_extent
        unreal.log_warning(f"BOUNDS of {p}: Origin={bounds.origin}, TotalSize = X:{box.x*2:.1f}, Y:{box.y*2:.1f}, Z:{box.z*2:.1f}")
    else:
        unreal.log_warning(f"Could not load {p}")
