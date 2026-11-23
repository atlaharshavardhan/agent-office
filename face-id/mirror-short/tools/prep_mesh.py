"""Landmark face mesh for the scan scene: hand-placed points on face_34.png, joined by a Delaunay
triangulation, each with its depth so the mesh stays pinned to the 3D head.  -> src/mesh.json"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import Delaunay

R = Path(__file__).resolve().parent.parent
# points picked on a 3x zoom of the crop x=110.., y=370.. of face_34.png
Z = [(300,200),(600,160),(900,200),(200,480),(370,500),(510,470),(720,420),(920,510),(240,610),(400,630),(610,630),(830,600),
     (430,560),(350,880),(540,930),(420,960),(215,760),(900,760),(1000,1000),(340,1100),(440,1060),(640,1130),(470,1180),
     (480,1380),(300,1250),(900,1340),(1130,1150),(1050,560),(700,900)]
P = np.array([(110 + x / 3, 370 + y / 3) for x, y in Z])
dep = np.asarray(Image.open(R / "public/face_depth.png").convert("L").filter(ImageFilter.GaussianBlur(5))).astype(float) / 255
E = set()
for a, b, c in Delaunay(P).simplices:
    for i, j in ((a, b), (b, c), (a, c)):
        if np.hypot(*(P[i] - P[j])) < 210:
            E.add((min(i, j), max(i, j)))
pts = [[round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)] for x, y in P]
json.dump({"pts": pts, "edges": sorted([list(map(int, e)) for e in E])}, open(R / "src/mesh.json", "w"), separators=(",", ":"))
print(len(pts), "points", len(E), "edges")
