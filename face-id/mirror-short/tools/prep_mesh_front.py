"""Landmark mesh for the depth scene on the straight-on face: hand-placed points on face_front.png joined by a
Delaunay triangulation, each with its depth (so the mesh stays pinned to the 3D head and nodes can be sized
by how close they are).  -> src/mesh_front.json"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import Delaunay

R = Path(__file__).resolve().parent.parent
# picked on a 2x zoom of the crop x=96.., y=200.. of face_front.png
Z = [(575,470),(380,500),(770,500),(575,600),(300,700),(440,660),(540,700),(640,700),(740,660),(860,700),
     (350,775),(490,780),(660,780),(800,775),(250,620),(900,620),(235,820),(905,820),
     (585,740),(585,860),(585,950),(505,985),(660,985),(350,930),(810,930),(300,1080),(850,1080),
     (455,1120),(700,1120),(575,1085),(575,1165),(260,1010),(880,1010),(330,1230),(810,1230),(450,1330),(700,1330),
     (575,1350),(575,1250)]
P = np.array([(96 + x / 2, 200 + y / 2) for x, y in Z])
dep = np.asarray(Image.open(R / "public/face_front_depth.png").convert("L").filter(ImageFilter.GaussianBlur(8))).astype(float) / 255
E = set()
for a, b, c in Delaunay(P).simplices:
    for i, j in ((a, b), (b, c), (a, c)):
        if np.hypot(*(P[i] - P[j])) < 150:
            E.add((min(i, j), max(i, j)))
pts = [[round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)] for x, y in P]
json.dump({"pts": pts, "edges": sorted([list(map(int, e)) for e in E])}, open(R / "src/mesh_front.json", "w"), separators=(",", ":"))
print(len(pts), "points", len(E), "edges", "depth range", min(p[2] for p in pts), max(p[2] for p in pts))
