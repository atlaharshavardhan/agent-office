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
# the real jaw line, read from the depth image: in each column, the row where the depth drops from the jaw to the neck
gyd = np.gradient(ndimage.gaussian_filter(raw, 3), axis=0)
JX = np.arange(NX - 158, NX + 159)
JY = ndimage.gaussian_filter1d(np.array([770 + gyd[770:900, x].argmin() for x in JX], float), 9) - 4
jaw = np.full(W, 0.0); jaw[JX] = JY
for x in range(W):                                   # beyond the jaw corners: rise toward the ear lobes
    if x < JX[0]: jaw[x] = JY[0] - 1.6 * (JX[0] - x)
    if x > JX[-1]: jaw[x] = JY[-1] - 1.6 * (x - JX[-1])
skin &= (raw > 0.10) & (yy < jaw[None, :])           # the web stops exactly on the jaw line and wraps round its corners
# a regular grid wrapped round the head like lines of latitude and longitude (as in the reference picture):
# columns bunch up toward the sides and rows bend toward the middle (the lowest rows cup under the chin), so the web reads as a curved surface, with a node at every crossing
CY, RX, RY, STEP = NY - 60, 262.0, 345.0, 0.088
us = np.arange(-1.45, 1.451, STEP); vs = np.arange(-1.2, 1.201, STEP)
idx = {}; pts = []
for a, v in enumerate(vs):
    for b, u in enumerate(us):
        x = NX + RX * np.sin(u) * (0.72 + 0.28 * np.cos(v)); y = CY + RY * np.sin(v) - 95 * (1 - np.cos(u)) * np.sin(v) - 10 * (1 - np.cos(u))
        if 0 <= int(x) < W and 0 <= int(y) < H and skin[int(y), int(x)]:
            idx[(a, b)] = len(pts); pts.append((x, y))
P = np.array(pts)
E = set(); T = []          # T: grid cells (as two triangles) = the area the web covers (the scan is clipped to it)
for (a, b), k in idx.items():
    for q in ((a, b + 1), (a + 1, b)):
        if q in idx: E.add((min(k, idx[q]), max(k, idx[q])))
    if (a, b + 1) in idx and (a + 1, b) in idx and (a + 1, b + 1) in idx:
        T.append([k, idx[(a, b + 1)], idx[(a + 1, b + 1)]]); T.append([k, idx[(a + 1, b + 1)], idx[(a + 1, b)]])
# the grid lines themselves, finely sampled with their depth, so they can be drawn as smooth curves that bend with the face
def at(u, v): return NX + RX * np.sin(u) * (0.72 + 0.28 * np.cos(v)), CY + RY * np.sin(v) - 95 * (1 - np.cos(u)) * np.sin(v) - 10 * (1 - np.cos(u))
def runs(samples):
    out, cur = [], []
    for x, y in samples:
        ok = 0 <= int(x) < W and 0 <= int(y) < H and skin[int(y), int(x)]
        if ok: cur.append([round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)])
        else:
            if len(cur) > 2: out.append(cur)
            cur = []
    if len(cur) > 2: out.append(cur)
    return out
FINE = STEP / 5; LINES = []
for v in vs: LINES += runs([at(u, v) for u in np.arange(us[0], us[-1] + 1e-6, FINE)])
for u in us: LINES += runs([at(u, v) for v in np.arange(vs[0], vs[-1] + 1e-6, FINE)])
# the lower edge of the web: one line along the jaw, so the grid closes round the chin and the jaw corners
LINES += runs([(float(x), float(jaw[x]) - 2) for x in range(int(JX[0]) - 30, int(JX[-1]) + 31, 3)])
out_pts = [[round(float(x), 1), round(float(y), 1), round(float(dep[int(y), int(x)]), 3)] for x, y in P]
X0, DX, Y0, DY = 150, 8, 300, 8
rows = [[round(float(dep[y, x]) if raw[y, x] > 0.1 else 0, 3) for x in range(X0, 610, DX)] for y in range(Y0, F["chin"] + 20, DY)]
json.dump({"pts": out_pts, "edges": sorted([list(map(int, e)) for e in E]), "tris": T, "lines": LINES, "prof": {"x0": X0, "dx": DX, "y0": Y0, "dy": DY, "rows": rows}},
          open(R / "src/mesh_front.json", "w"), separators=(",", ":"))
print(len(out_pts), "points", len(E), "edges", len(rows), "profile rows")
