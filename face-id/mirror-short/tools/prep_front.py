"""Assets for the infrared scan on the straight-on face (run once after the three stills exist):
  public/face_front.png, face_front_ir.png, face_front_depth.png  (same aligned 752 x 1344 image)
-> public/relief_front.png : R = smoothed depth for the 3D relief, G = figure mask, B = sharp depth (depth-map look)
-> src/front.json          : dot pattern on the visible skin (x, y, depth, random) + nose tip and cheek points
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

R = Path(__file__).resolve().parent.parent; P = R / "public"
ZS = 250.0
dep_img = Image.open(P / "face_front_depth.png").convert("L")
dep = np.asarray(dep_img).astype(np.float32) / 255
H, W = dep.shape
mask = dep > 0.07
shape = np.where(dep > 0.6, 0.6 + (dep - 0.6) * 0.5, dep)          # keep the nose in real proportion
sm = np.asarray(Image.fromarray((shape * mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
m8 = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)))
Image.fromarray(np.dstack([(sm * 255).astype(np.uint8), m8, (dep * 255).astype(np.uint8)])).save(P / "relief_front.png")

Ds = np.asarray(Image.fromarray((dep * mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(8))).astype(np.float32) / 255
ir = np.asarray(Image.open(P / "face_front_ir.png").convert("L").filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
# nose tip = nearest point in the middle of the face
sub = sm[480:820, 300:452]; ny, nx = np.unravel_index(sub.argmax(), sub.shape); ny += 480; nx += 300
chin = max(y for y in range(ny, H) if ir[y, nx] > 0.40 and y < ny + 260)
yy = np.arange(H)[:, None]
skin = mask & (ir > 0.40) & (yy < chin + 70) & (dep > 0.12)
rng = np.random.default_rng(11); S = 5.7; dots = []
for gy in np.arange(180, H - 300, S):
    for gx in np.arange(100, W - 100, S):
        x = gx + rng.uniform(-0.46, 0.46) * S; y = gy + rng.uniform(-0.46, 0.46) * S
        if skin[int(y), int(x)]:
            dots.append([round(float(x), 1), round(float(y), 1), round(float(Ds[int(y), int(x)]), 3), round(float(rng.uniform()), 3)])
pt = lambda x, y: [int(x), int(y), round(float(Ds[int(y), int(x)]), 3)]
json.dump({"zs": ZS, "w": W, "h": H, "nose": pt(nx, ny), "cheek": pt(nx + 112, ny - 8), "chin": int(chin), "dots": dots},
          open(R / "src/front.json", "w"), separators=(",", ":"))
print(len(dots), "dots; nose", pt(nx, ny), "cheek", pt(nx + 112, ny - 8), "chin", chin)
