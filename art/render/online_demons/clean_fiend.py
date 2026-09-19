import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
fbx_in = r"c:\Users\vishnu vardhan\OneDrive\Desktop\projects\vighnaharta\art\render\online_demons\AsuraFiend.fbx"
fbx_out = r"c:\Users\vishnu vardhan\OneDrive\Desktop\projects\vighnaharta\art\render\online_demons\AsuraFiend_Clean.fbx"

bpy.ops.import_scene.fbx(filepath=fbx_in)

# Find meshes and armatures
meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
armatures = [obj for obj in bpy.data.objects if obj.type == 'ARMATURE']

# Apply armature modifiers and delete armatures
for m in meshes:
    bpy.context.view_layer.objects.active = m
    for mod in list(m.modifiers):
        if mod.type == 'ARMATURE':
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception as e:
                m.modifiers.remove(mod)

for a in armatures:
    bpy.data.objects.remove(a, do_unlink=True)

# Clear all vertex groups and animation data
for m in meshes:
    m.vertex_groups.clear()
    m.animation_data_clear()

# Select all meshes and join
bpy.ops.object.select_all(action='DESELECT')
for m in meshes:
    m.select_set(True)

if meshes:
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    meshes[0].name = "AsuraFiend"

bpy.ops.export_scene.fbx(
    filepath=fbx_out,
    use_selection=True,
    mesh_smooth_type='FACE',
    bake_anim=False,
    add_leaf_bones=False
)
print("Successfully created AsuraFiend_Clean.fbx as static mesh")
