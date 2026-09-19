import unreal

def print_bounds(path):
    mesh = unreal.load_asset(path)
    if mesh and isinstance(mesh, unreal.StaticMesh):
        bounds = mesh.get_bounds()
        box = bounds.box_extent
        unreal.log_warning(f"BOUNDS of {path}: Origin={bounds.origin}, BoxExtent={box} (TotalSize = X:{box.x*2:.1f}, Y:{box.y*2:.1f}, Z:{box.z*2:.1f})")
    else:
        unreal.log_warning(f"Failed to get bounds for {path}")

print_bounds("/Game/Roads/RoadStraight.RoadStraight")
print_bounds("/Game/Hero/Mooshak.Mooshak")
print_bounds("/Game/Rath/Rath.Rath")
print_bounds("/Game/Rath/GaneshaIdol.GaneshaIdol")
print_bounds("/Game/Astras/AstraVajra.AstraVajra")
print_bounds("/Game/Astras/AstraTrident.AstraTrident")
print_bounds("/Game/Astras/AstraChakra.AstraChakra")
print_bounds("/Game/Demons/AsuraMinion.AsuraMinion")
print_bounds("/Game/Demons/AsuraBrute.AsuraBrute")
print_bounds("/Game/Demons/AsuraGate.AsuraGate")
