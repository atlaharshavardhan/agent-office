"""3D assets for the scan scene (run once).
* public/relief.png : R = smoothed depth (mesh displacement), G = figure mask, B = sharp depth (depth-map look)
* src/dots3d.json   : dot targets on the face surface in scene units (x right, y up, z toward the viewer),
                      plus the nose / eye anchor points.  Scene units = pixels of face_34.png; z = depth * ZS.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

R = Path(__file__).resolve().parent.parent
ZS = 330.0
dep_img = Image.open(R / "public/face_depth.png").convert("L")
dep = np.asarray(dep_img).astype(np.float32) / 255
H, W = dep.shape
mask = dep > 0.07
sm = np.asarray(Image.fromarray((dep * mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
m8 = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)))
Image.fromarray(np.dstack([(sm * 255).astype(np.uint8), m8, (dep * 255).astype(np.uint8)])).save(R / "public/relief.png")

P = lambda x, y: [round(x - W / 2, 1), round(H / 2 - y, 1), round(float(sm[int(y), int(x)]) * ZS, 1)]
rng = np.random.default_rng(5)
S = 6.3
dots = []
for gy in np.arange(245, 895, S):
    for gx in np.arange(140, 690, S):
        x = gx + rng.uniform(-0.45, 0.45) * S; y = gy + rng.uniform(-0.45, 0.45) * S
        xi, yi = int(x), int(y)
        if 0 <= xi < W and mask[yi, xi] and dep[yi, xi] > 0.12 and sm[yi, xi] > 0.1:
            dots.append(P(x, y) + [round(float(rng.uniform()), 3)])
json.dump({"zs": ZS, "w": W, "h": H, "nose": P(221, 648), "eye": P(325, 552), "dots": dots}, open(R / "src/dots3d.json", "w"), separators=(",", ":"))
print(len(dots), "dots")
