"""Acquire selected CC0 assets and render static glTF models to 2:1 dimetric sprites.
Run: python scripts/prepare_festival_assets.py
Requires numpy, Pillow and trimesh. Never executes downloaded code.
"""
from pathlib import Path
import urllib.request,json,hashlib,zipfile,io,concurrent.futures
import numpy as np
from PIL import Image,ImageDraw
import trimesh
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'art/source/kaykit-city'
OUT=ROOT/'public/assets/festival'
SRC.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
COMMIT='63976910ca04d16f0fc531b9c614244be8128713'
REPO='https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0'
RAW=f'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0/{COMMIT}/'
PREFIX='addons/kaykit_city_builder_bits/Assets/gltf/'
MODELS=['building_A','building_B','building_C','bench','box_A','bush','streetlight']
manifest=[]
def fetch(url,path):
 if not path.exists():
  with urllib.request.urlopen(url,timeout=60) as response: path.write_bytes(response.read())
 return path
names=['citybits_texture.png']+[n+ext for n in MODELS for ext in ['.gltf','.bin']]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 list(pool.map(lambda n:fetch(RAW+PREFIX+n,SRC/n),names))
fetch(RAW+'LICENSE.txt',SRC/'LICENSE.txt')
# Static model rasterization. Camera basis projects X/Z ground axes at precisely 2:1.
right=np.array([1.,0.,-1.]);right/=np.linalg.norm(right)
forward=np.array([1.,1.41421356237,1.]);forward/=np.linalg.norm(forward)
up=np.cross(forward,right)
light=np.array([-1.,3.,2.]);light/=np.linalg.norm(light)
for name in MODELS:
 scene=trimesh.load(SRC/(name+'.gltf'),force='scene')
 triangles=[]
 for node in scene.graph.nodes_geometry:
  transform,key=scene.graph[node]; mesh=scene.geometry[key]
  vertices=trimesh.transform_points(mesh.vertices,transform)
  normals=trimesh.triangles.normals(vertices[mesh.faces])[0]
  if hasattr(mesh.visual,'uv') and mesh.visual.uv is not None:
   colors=mesh.visual.to_color().vertex_colors
  else: colors=mesh.visual.vertex_colors
  for idx,face in enumerate(mesh.faces):
   v=vertices[face]; color=colors[face,:3].mean(axis=0)
   shade=.63+.37*max(0,float(normals[idx]@light))
   triangles.append((v@forward,np.column_stack((v@right,-v@up)),tuple(np.clip(color*shade,0,255).astype(int))+(255,)))
 coords=np.concatenate([x[1] for x in triangles]);low=coords.min(axis=0);high=coords.max(axis=0)
 scale=480/max(high-low);size=np.ceil((high-low)*scale+24).astype(int)
 image=Image.new('RGBA',tuple(size*2));draw=ImageDraw.Draw(image)
 for depth,points,color in sorted(triangles,key=lambda t:float(t[0].mean())):
  draw.polygon([tuple(p) for p in ((points-low)*scale+12)*2],fill=color)
 image=image.resize(tuple(size),Image.Resampling.LANCZOS)
 output=OUT/(name+'.png');image.save(output)
 # Ground origin projected into image, independent of silhouette cropping.
 pivot=((-low*scale+12)/size).tolist()
 manifest.append({'id':name,'file':'/assets/festival/'+output.name,'source':REPO,'commit':COMMIT,'creator':'Kay Lousberg','license':'CC0-1.0','originalFile':PREFIX+name+'.gltf','sha256':hashlib.sha256((SRC/(name+'.gltf')).read_bytes()).hexdigest(),'outputSha256':hashlib.sha256(output.read_bytes()).hexdigest(),'dimensions':size.tolist(),'pivot':pivot,'animation':'static model; runtime prop transforms'})
 print('rendered',name,size.tolist(),flush=True)
packs=[('particles','https://kenney.nl/media/pages/assets/particle-pack/f8fe0f8cb8-1677578741/kenney_particle-pack.zip','https://kenney.nl/assets/particle-pack'),('impacts','https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip','https://kenney.nl/assets/impact-sounds')]
for pack,url,source in packs:
 archive=fetch(url,ROOT/'art/source'/f'kenney-{pack}.zip')
 with zipfile.ZipFile(archive) as z:
  candidates=[n for n in z.namelist() if n.lower().endswith('.png' if pack=='particles' else '.ogg')]
  wanted=[n for n in candidates if ('star_01' in n or 'spark_01' in n)] if pack=='particles' else [n for n in candidates if 'wood' in n.lower()][:3]
  if not wanted:wanted=candidates[:2]
  for n in wanted:
   dest=OUT/('audio' if pack=='impacts' else '')/Path(n).name;dest.parent.mkdir(exist_ok=True);dest.write_bytes(z.read(n))
   manifest.append({'id':dest.stem,'file':'/assets/festival/'+('audio/' if pack=='impacts' else '')+dest.name,'source':source,'creator':'Kenney','license':'CC0-1.0','originalFile':n,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
  for n in z.namelist():
   if 'license' in n.lower() and not n.endswith('/'):(ROOT/'art/source'/f'kenney-{pack}-license.txt').write_bytes(z.read(n))
(ROOT/'docs/assets/manifest.json').write_text(json.dumps(manifest,indent=2))
print('Prepared',len(manifest),'assets',flush=True)
