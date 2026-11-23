"""Pre-computes the face assets used by scenes 3-4 (run once; outputs go to public/ and src/).

* public/rot/face_XX.jpg and public/rot/depth_XX.jpg: a small 2.5D yaw of the 3/4 face, made by
  shifting each pixel sideways in proportion to its depth (nose moves most, background not at all).
  XX = 00..40 maps to yaw t = -1..+1.
* src/dots.json: the infrared dot pattern (pseudo-random jittered grid), each dot stores its
  position on the source image and the depth under it, so the dots stay anchored to the face.
Source images are 752 x 1344; the composition shows them scaled to 1080 x 1930.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

R = Path(__file__).resolve().parent.parent
P = R / "public"
A = 26.0          # max sideways shift in source px at depth 1 (yaw amount)
STEPS = 41

face = np.asarray(Image.open(P / "face_34.png").convert("RGB")).astype(np.float32)
dep_img = Image.open(P / "face_depth.png").convert("L")
dep = np.asarray(dep_img).astype(np.float32) / 255
H, W = dep.shape
yy = np.arange(H)[:, None]
mask = (dep > 0.08) & (yy < 880)                       # head only (no sweater / neck)
D = dep * mask
Ds = np.asarray(Image.fromarray((D * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))).astype(np.float32) / 255
dep_rgb = np.asarray(dep_img.convert("RGB")).astype(np.float32)

(P / "rot").mkdir(exist_ok=True)
xs = np.arange(W)[None, :].repeat(H, 0).astype(np.float32)
for i, t in enumerate(np.linspace(-1, 1, STEPS)):
    sx = xs - A * t * Ds
    x0 = np.clip(np.floor(sx).astype(int), 0, W - 2); fr = (sx - x0)[..., None]
    for name, img in (("face", face), ("depth", dep_rgb)):
        rows = np.arange(H)[:, None]
        out = img[rows, x0] * (1 - fr) + img[rows, x0 + 1] * fr
        Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(P / "rot" / f"{name}_{i:02d}.jpg", quality=90)

# infrared dot pattern
rng = np.random.default_rng(7)
S = 10.5
dots = []
for gy in np.arange(250, 890, S):
    for gx in np.arange(150, 680, S):
        x = gx + rng.uniform(-0.42, 0.42) * S
        y = gy + rng.uniform(-0.42, 0.42) * S
        xi, yi = int(x), int(y)
        if 0 <= xi < W and 0 <= yi < H and mask[yi, xi] and dep[yi, xi] > 0.12:
            dots.append([round(float(x), 1), round(float(y), 1), round(float(Ds[yi, xi]), 3), round(float(rng.uniform()), 3)])
json.dump({"w": W, "h": H, "A": A, "steps": STEPS, "dots": dots}, open(R / "src" / "dots.json", "w"), separators=(",", ":"))
print(len(dots), "dots")
