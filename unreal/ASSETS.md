# Asset register

The Tail Lab now builds festival models at runtime from engine primitives (Mooshak, Rath/Ganesha silhouette, carts with wheels, citizens, stalls, diyas, petals). KayKit City Bits (CC0) are converted in Blender to FBX and imported to `/Game/KayKit` when the editor import script runs; C++ uses them for stalls/boxes/lights when present and falls back to cubes if not.

| Asset | Source | Author | License | Changes |
|---|---|---|---|---|
| Cube, sphere, cylinder test meshes | Installed Unreal Engine `/Engine/BasicShapes` | Epic Games | Unreal Engine content terms; distributed only as cooked project content | Runtime scaling, festival palette tints, emissive diyas |
| KayKit City Builder Bits | `art/source/kaykit-city/` from [KayKit City Builder Bits 1.0](https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0) | Kay Lousberg | CC0 1.0 | Blender 5.2 glTF → FBX; imported to `/Game/KayKit` |
| Mooshak mouse mesh | Built in Blender 5.2 from primitives (`tools/make_mooshak_mouse.py`) | Project | Original | Huge ears, snout, tail. FBX `art/render/hero/Mooshak.fbx`, imported `/Game/Hero/Mooshak` |
| M_Solid | Created in Unreal Python | Project | Original | Vector Color + Glow so objects are not all one grey |
| Kenney City Kit Commercial buildings/awnings | `public/assets/kenney/commercial` | Kenney | CC0 | Imported `/Game/City` for sidewalk shops. No skyscrapers. |
| Kenney Nature `tree_default` | `public/assets/kenney/nature` | Kenney | CC0 | Sidewalk trees |
| Festival audio (tabla, crowd, bells) | `public/assets/audio/festival` | Project recordings | Project | Music bed + crowd distance + ceremonial bells |
| Kenney Impact / RPG / Steel jingles | `public/assets/kenney/` | Kenney | CC0 | Tail, wood hits, latch, perfect/surge stingers |
| Gobkit Rat (Mooshak hero) | https://gobkit.com/freebies/animalB/Rat.glb | Gobkit / Alsomind | CC0 1.0 | Rigged GLB baked to static FBX in Blender, `/Game/Hero/Rat` |
| Gobkit Marmot | https://gobkit.com/freebies/animalB/Marmot.glb | Gobkit | CC0 1.0 | Extra rodent mesh |
| KayKit Dungeon banners/barrels/candles/crates | [KayKit-Dungeon-Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | Kay Lousberg | CC0 1.0 | Festival street props `/Game/City` |
| Niagara templates | Engine plugin `/Niagara/DefaultAssets/Templates/Systems/` | Epic Games | Unreal Engine content | RadialBurst, SimpleExplosion, Fountain, DirectionalBurst |
| Festival Ganesha / Rath / Gate / Citizen | Blender 5.2 authored (`tools/build_festival_models.py`) → `art/render/festival/*.fbx` | Project | Original | Imported `/Game/Rath` and `/Game/City` |
| kiara_1_dawn HDRI (1K) | [Poly Haven](https://polyhaven.com/a/kiara_1_dawn) | Greg Zaal / Poly Haven | CC0 1.0 | Sky Light cubemap `/Game/Env/kiara_1_dawn` — 1K for Intel UHD |

Final-art import stays gated on a compiled Tail Lab playtest. Every downloaded model must keep source, author, license and modification records here before import. Existing browser-project assets are not assumed to have Unreal redistribution permission.
