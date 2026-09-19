import unreal

def check_mats(mesh_path):
    mesh = unreal.load_asset(mesh_path)
    if not mesh: return
    num = mesh.get_num_sections(0)
    for i in range(num):
        m = mesh.get_material(i)
        unreal.log_warning(f"{mesh_path} slot {i}: {m.get_path_name() if m else 'None'}")

for p in [
    "/Game/Astras/AstraVajra.AstraVajra",
    "/Game/Astras/AstraTrident.AstraTrident",
    "/Game/Astras/AstraChakra.AstraChakra",
    "/Game/Demons/AsuraMinion.AsuraMinion",
    "/Game/Demons/AsuraBrute.AsuraBrute",
    "/Game/Demons/AsuraFiend.AsuraFiend",
    "/Game/Demons/AsuraGate.AsuraGate",
    "/Game/Rath/Rath.Rath",
    "/Game/Rath/GaneshaIdol.GaneshaIdol"
]:
    check_mats(p)
