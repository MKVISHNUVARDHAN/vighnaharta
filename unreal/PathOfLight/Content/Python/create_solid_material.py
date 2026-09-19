"""Create an unlit-tinted material so greybox objects can actually change color."""
import os
import unreal

path = "/Game/Materials"
name = "M_Solid"
full = path + "/" + name
lib = unreal.MaterialEditingLibrary
assets = unreal.AssetToolsHelpers.get_asset_tools()

if not unreal.EditorAssetLibrary.does_directory_exist(path):
    unreal.EditorAssetLibrary.make_directory(path)

if unreal.EditorAssetLibrary.does_asset_exist(full):
    mat = unreal.EditorAssetLibrary.load_asset(full)
else:
    mat = assets.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())

lib.delete_all_material_expressions(mat)

color = lib.create_material_expression(mat, unreal.MaterialExpressionVectorParameter, -480, -80)
color.set_editor_property("parameter_name", "Color")
color.set_editor_property("default_value", unreal.LinearColor(1.0, 0.7, 0.2, 1.0))

glow = lib.create_material_expression(mat, unreal.MaterialExpressionScalarParameter, -480, 120)
glow.set_editor_property("parameter_name", "Glow")
glow.set_editor_property("default_value", 0.0)

mul = lib.create_material_expression(mat, unreal.MaterialExpressionMultiply, -160, 80)
lib.connect_material_expressions(color, "RGB", mul, "A")
lib.connect_material_expressions(glow, "", mul, "B")

rough = lib.create_material_expression(mat, unreal.MaterialExpressionConstant, -160, 260)
rough.set_editor_property("r", 0.75)

lib.connect_material_property(color, "RGB", unreal.MaterialProperty.MP_BASE_COLOR)
lib.connect_material_property(mul, "", unreal.MaterialProperty.MP_EMISSIVE_COLOR)
lib.connect_material_property(rough, "", unreal.MaterialProperty.MP_ROUGHNESS)
mat.set_editor_property("two_sided", True)
lib.recompile_material(mat)
unreal.EditorAssetLibrary.save_asset(full)
unreal.log("Saved " + full)

fbx = os.path.normpath(os.path.join(unreal.Paths.project_dir(), "..", "..", "art", "render", "hero", "Mooshak.fbx"))
hero = "/Game/Hero"
if os.path.isfile(fbx):
    if not unreal.EditorAssetLibrary.does_directory_exist(hero):
        unreal.EditorAssetLibrary.make_directory(hero)
    task = unreal.AssetImportTask()
    task.filename = fbx
    task.destination_path = hero
    task.destination_name = "Mooshak"
    task.automated = True
    task.save = True
    task.replace_existing = True
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    unreal.log("Imported Mooshak")

