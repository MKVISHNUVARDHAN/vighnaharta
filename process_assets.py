import os
import glob
from collections import deque
from PIL import Image

def remove_background_floodfill(image_path, output_path, tolerance=35):
    print(f"Processing {image_path}...")
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    # Target color is white
    target_color = (255, 255, 255, 255)
    
    # BFS queue for flood fill
    visited = set()
    queue = deque([(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)])
    
    pixels = img.load()
    
    def is_similar(p1, p2, tol):
        return all(abs(p1[i] - p2[i]) <= tol for i in range(3))
    
    transparent = (0, 0, 0, 0)
    
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
            
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        visited.add((x, y))
        
        current_pixel = pixels[x, y]
        if is_similar(current_pixel, target_color, tolerance):
            pixels[x, y] = transparent
            # add neighbors
            queue.append((x+1, y))
            queue.append((x-1, y))
            queue.append((x, y+1))
            queue.append((x, y-1))
            
    # Soften edges slightly (naive anti-aliasing)
    for x in range(1, width-1):
        for y in range(1, height-1):
            if pixels[x, y][3] > 0:  # If opaque
                # Check if it borders a transparent pixel
                borders_transparent = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    if pixels[x+dx, y+dy][3] == 0:
                        borders_transparent = True
                        break
                if borders_transparent:
                    # Semi-transparent edge
                    r, g, b, a = pixels[x, y]
                    pixels[x, y] = (r, g, b, int(a * 0.5))

    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

PUBLIC_DIR = r"C:\Users\vishnu vardhan\OneDrive\Desktop\projects\vighnaharta\public\assets"
SOURCE_DIR = PUBLIC_DIR

assets_to_process = [
    ('building_house_*.jpg', 'building_house.png', 10),
    ('building_temple_*.jpg', 'building_temple.png', 10),
    ('scenery_tree_*.jpg', 'scenery_tree.png', 10),
    ('devotee_flag_*.jpg', 'devotee_flag.png', 10),
    ('devotee_dancer_*.jpg', 'devotee_dancer.png', 10),
    ('road_rangoli_*.jpg', 'road_rangoli.png', 10)
]

for pattern, out_name, tolerance in assets_to_process:
    search_path = os.path.join(SOURCE_DIR, pattern)
    matches = glob.glob(search_path)
    if matches:
        # Get latest
        matches.sort(key=os.path.getmtime, reverse=True)
        in_path = matches[0]
        out_path = os.path.join(PUBLIC_DIR, out_name)
        remove_background_floodfill(in_path, out_path, tolerance)
    else:
        print(f"No matches found for {pattern}")
