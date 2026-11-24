"""Fine 3D web for the depth scene on the straight-on face.
Points: a jittered grid over the visible face plus hand-placed landmarks, each with its depth, joined by a
Delaunay triangulation (long edges dropped).  Also stores depth profiles (rows across the face) for the scan line.
-> src/mesh_front.json"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import Delaunay

R = Path(__file__).resolve().parent.parent
F = json.load(open(R / "src/front.json"))
dep_i = Image.open(R / "public/face_front_depth.png").convert("L")
dep = np.asarray(dep_i.filter(ImageFilter.GaussianBlur(8))).astype(float) / 255
raw = np.asarray(dep_i).astype(float) / 255
ir = np.asarray(Image.open(R / "public/face_front_ir.png").convert("L").filter(ImageFilter.GaussianBlur(4))).astype(float) / 255
H, W = dep.shape
skin = (raw > 0.12) & (ir > 0.40) & (np.arange(H)[:, None] < F["chin"] + 6)
Z = [(575,470),(380,500),(770,500),(575,600),(300,700),(440,660),(540,700),(640,700),(740,660),(860,700),
     (350,775),(490,780),(660,780),(800,775),(585,740),(585,860),(585,950),(505,985),(660,985),(350,930),(810,930),
     (455,1120),(700,1120),(575,1085),(575,1165),(575,1250),(575,1350)]
pts = [(96 + x / 2, 200 + y / 2) for x, y in Z]
rng = np.random.default_rng(4); S = 30
for gy in np.arange(300, F["chin"] + 6, S * 0.87):
    for k, gx in enumerate(np.arange(170, 610, S)):
        x = gx + (S / 2 if int(gy / (S * 0.87)) % 2 else 0) + rng.uniform(-5, 5); y = gy + rng.uniform(-5, 5)
        if 0 <= int(x) < W and skin[int(y), int(x)] and min(np.hypot(x - px, y - py) for px, py in pts) > 15:
            pts.append((x, y))
P = np.array(pts)
E = set()
for a, b, c in Delaunay(P).simplices:
    for i, j in ((a, b), (b, c), (a, c)):
        if np.hypot(*(P[i] - P[j])) < 62:
            E.add((min(i, j), max(i, j)))
out_pts = [[round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)] for x, y in P]
X0, DX, Y0, DY = 150, 8, 300, 8
rows = [[round(float(dep[y, x]) if raw[y, x] > 0.1 else 0, 3) for x in range(X0, 610, DX)] for y in range(Y0, F["chin"] + 20, DY)]
json.dump({"pts": out_pts, "edges": sorted([list(map(int, e)) for e in E]), "prof": {"x0": X0, "dx": DX, "y0": Y0, "dy": DY, "rows": rows}},
          open(R / "src/mesh_front.json", "w"), separators=(",", ":"))
print(len(out_pts), "points", len(E), "edges", len(rows), "profile rows")
