"""Fine 3D web for the depth scene on the straight-on face.
Points: a regular latitude / longitude grid over the face and ears (no neck), each with its depth, joined along
the grid lines.  Also stores depth profiles (rows across the face) for the scan line.
-> src/mesh_front.json"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

R = Path(__file__).resolve().parent.parent
F = json.load(open(R / "src/front.json"))
dep_i = Image.open(R / "public/face_front_depth.png").convert("L")
dep = np.asarray(dep_i.filter(ImageFilter.GaussianBlur(8))).astype(float) / 255
raw = np.asarray(dep_i).astype(float) / 255
ir = np.asarray(Image.open(R / "public/face_front_ir.png").convert("L").filter(ImageFilter.GaussianBlur(4))).astype(float) / 255
H, W = dep.shape
# the face and ears, no neck: everything above the jaw line (which rises toward the ears); hair is excluded by the
# infrared brightness
yy, xx = np.arange(H)[:, None], np.arange(W)[None, :]
NX, NY = F["nose"][0], F["nose"][1]
from scipy import ndimage
skin = (raw > 0.10) & (ir > 0.38)
skin = ndimage.binary_fill_holes(ndimage.binary_closing(skin, iterations=14))          # bridge brows, eyes and stubble
skin &= (raw > 0.10) & (yy < 902 - 0.0019 * (xx - NX) ** 2)
# a regular grid wrapped round the head like lines of latitude and longitude (as in the reference picture):
# columns bunch up toward the sides and rows bend, so the web reads as a curved surface, with a node at every crossing
CY, RX, RY, STEP = NY - 60, 262.0, 345.0, 0.088
us = np.arange(-1.45, 1.451, STEP); vs = np.arange(-1.2, 1.201, STEP)
idx = {}; pts = []
for a, v in enumerate(vs):
    for b, u in enumerate(us):
        x = NX + RX * np.sin(u) * (0.72 + 0.28 * np.cos(v)); y = CY + RY * np.sin(v) + 46 * (1 - np.cos(u)) * np.sin(v) - 14 * (1 - np.cos(u))
        if 0 <= int(x) < W and 0 <= int(y) < H and skin[int(y), int(x)]:
            idx[(a, b)] = len(pts); pts.append((x, y))
P = np.array(pts)
E = set(); T = []          # T: grid cells (as two triangles) = the area the web covers (the scan is clipped to it)
for (a, b), k in idx.items():
    for q in ((a, b + 1), (a + 1, b)):
        if q in idx: E.add((min(k, idx[q]), max(k, idx[q])))
    if (a, b + 1) in idx and (a + 1, b) in idx and (a + 1, b + 1) in idx:
        T.append([k, idx[(a, b + 1)], idx[(a + 1, b + 1)]]); T.append([k, idx[(a + 1, b + 1)], idx[(a + 1, b)]])
out_pts = [[round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)] for x, y in P]
X0, DX, Y0, DY = 150, 8, 300, 8
rows = [[round(float(dep[y, x]) if raw[y, x] > 0.1 else 0, 3) for x in range(X0, 610, DX)] for y in range(Y0, F["chin"] + 20, DY)]
json.dump({"pts": out_pts, "edges": sorted([list(map(int, e)) for e in E]), "tris": T, "prof": {"x0": X0, "dx": DX, "y0": Y0, "dy": DY, "rows": rows}},
          open(R / "src/mesh_front.json", "w"), separators=(",", ":"))
print(len(out_pts), "points", len(E), "edges", len(rows), "profile rows")
