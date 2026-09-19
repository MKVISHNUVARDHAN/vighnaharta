import unreal

def check_materials(mesh_path):
    mesh = unreal.load_asset(mesh_path)
    if not mesh or not isinstance(mesh, unreal.StaticMesh):
        unreal.log_warning(f"Failed to load mesh: {mesh_path}")
        return
    num_mats = mesh.get_num_sections(0)
    unreal.log_warning(f"=== Materials on {mesh_path} (Sections: {num_mats}) ===")
    for i in range(num_mats):
        mat = mesh.get_material(i)
        unreal.log_warning(f"Section {i}: {mat.get_path_name() if mat else 'None'}")

check_materials("/Game/Hero/Mooshak.Mooshak")
check_materials("/Game/Roads/RoadStraight.RoadStraight")
check_materials("/Game/Weapons/AK47.blaster-a")
check_materials("/Game/Weapons/Flamethrower.Flamethrower")
