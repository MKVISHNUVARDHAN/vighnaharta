import unreal

# We can check vertex positions of RoadStraight
mesh = unreal.EditorAssetLibrary.load_asset("/Game/Roads/RoadStraight")
# Let's inspect LOD 0 sections or materials
num_sections = mesh.get_num_sections(0)
print(f"Num sections: {num_sections}")
