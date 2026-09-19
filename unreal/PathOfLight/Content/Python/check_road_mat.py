import unreal

mat = unreal.load_asset("/Game/Roads/colormap.colormap")
if mat:
    unreal.log_warning(f"Road colormap class: {mat.get_class().get_name()}")
    # Check parent material
    if isinstance(mat, unreal.MaterialInstanceConstant):
        unreal.log_warning(f"Parent: {mat.parent.get_path_name() if mat.parent else 'None'}")
        for p in mat.texture_parameter_values:
            unreal.log_warning(f"Tex Param: {p.parameter_info.name} -> {p.parameter_value.get_name() if p.parameter_value else 'None'}")
