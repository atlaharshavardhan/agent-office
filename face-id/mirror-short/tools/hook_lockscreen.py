"""Puts the lock screen of the close-up phone (public/hook_closeup.png: Dynamic Island, date, 9:41, home bar) onto the
phone seen in the mirror in the hook footage, so the hook shows the same phone as the rest of the Short.
The reflected screen is tracked frame by frame (it is the only large mauve / warm-glow area), the footage's round camera
cut-out is painted out, and the lock-screen elements are laid over the screen; fingers stay in front.
  public/mirror_clip.mp4 -> public/mirror_clip_lock.mp4        usage: python tools/hook_lockscreen.py <work dir>
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

R = Path(__file__).resolve().parent.parent; W = Path(sys.argv[1]); (W / "in").mkdir(parents=True, exist_ok=True); (W / "out").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(R / "public/mirror_clip.mp4"), str(W / "in/%04d.png")], check=True)
files = sorted((W / "in").glob("*.png")); FIRST = 22            # the rear angle starts at frame 22 (0.875 s at 24 fps)

def screen_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (b > 85) & (b > 0.55 * r) & (r > 95) & (g < 0.88 * r)

def bbox(mm, aspect=None):
    ys, xs = np.where(mm); y0 = ys.min(); top = mm[y0:y0 + max(4, int((ys.max() - y0) * 0.3))]
    cols = np.where(top.any(0))[0]; x0, x1 = cols.min(), cols.max()
    lc = mm[:, x0:x0 + max(2, (x1 - x0) // 6)]; yb = np.where(lc.any(1))[0].max()
    return [x0, y0, x1, y0 + aspect * (x1 - x0) if aspect else yb]

# ---- the lock-screen layer, cut from the close-up still ----
still = np.asarray(Image.open(R / "public/hook_closeup.png").convert("RGB"))
sx0, sy0, sx1, sy1 = 190, 152, 566, 978            # its screen (the top of the wallpaper is too dark to find automatically)
scr = still[sy0:sy1, sx0:sx1].astype(float); H, Wd = scr.shape[:2]; yy = np.arange(H)[:, None] / H
mn, mx = scr.min(2), scr.max(2)
white = np.clip((mn - 185) / 50, 0, 1) * ((yy < 0.42) | (yy > 0.93))            # date, time, home bar
black = np.clip((70 - mx) / 40, 0, 1) * (yy < 0.1)                                # Dynamic Island
layer = np.zeros((H, Wd, 4), np.uint8); layer[..., :3] = (255 * (white > black))[..., None]; layer[..., 3] = (255 * np.maximum(white, black)).astype(np.uint8)
LAYER = Image.fromarray(layer, "RGBA")

# ---- track the reflected screen ----
boxes, masks = {}, {}; c = np.array([518.0, 400.0])
for i in range(FIRST, len(files) + 1):
    a = np.asarray(Image.open(files[i - 1]).convert("RGB")); m = ndimage.binary_opening(screen_mask(a)); lab, n = ndimage.label(m)
    cen = np.array(ndimage.center_of_mass(m, lab, range(1, n + 1)))[:, ::-1]; size = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmin(np.hypot(*(cen - c).T) - 0.02 * size)); mm = lab == k + 1; c = cen[k]; masks[i] = mm; boxes[i] = bbox(mm)
late = [boxes[i] for i in range(len(files) - 15, len(files) + 1)]; ASPECT = float(np.median([(b[3] - b[1]) / (b[2] - b[0]) for b in late]))
B = np.array([bbox(masks[i], ASPECT) for i in range(FIRST, len(files) + 1)], float)
B = ndimage.gaussian_filter1d(ndimage.median_filter(B, size=(3, 1)), 0.8, axis=0, mode="nearest")
print("screen in the still", (sx0, sy0, sx1, sy1), "aspect", round(ASPECT, 3), "first", B[0].round(), "last", B[-1].round())

for i, f in enumerate(files, 1):
    im = Image.open(f).convert("RGB")
    if i >= FIRST:
        x0, y0, x1, y1 = B[i - FIRST]; w, h = max(2, int(round(x1 - x0))), max(2, int(round(y1 - y0)))
        a = np.asarray(im).copy(); X0, Y0 = int(round(x0)), int(round(y0))
        # paint out the round camera cut-out: dark pixels in the top of the screen take the colour of their row
        t0, t1 = Y0 + int(0.02 * h), Y0 + int(0.16 * h); reg = a[t0:t1, X0 + int(0.2 * w):X0 + int(0.8 * w)]
        if reg.size:
            dark = ndimage.binary_dilation(reg.max(2) < 95, iterations=max(1, w // 120)); rowc = np.array([np.median(r[~d], 0) if (~d).any() else r.mean(0) for r, d in zip(reg, dark)])
            reg[dark] = np.repeat(rowc[:, None, :], reg.shape[1], 1)[dark]
        im = Image.fromarray(a)
        lay = LAYER.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5 if w > 150 else 0.25))
        # fingers stay in front: the layer only shows where the footage is screen-coloured (island area always)
        keep = ndimage.binary_dilation(masks[i], iterations=2)[Y0:Y0 + h, X0:X0 + w]
        al = np.asarray(lay).copy(); kh, kw = min(h, keep.shape[0]), min(w, keep.shape[1])
        vis = np.zeros((h, w), bool); vis[:kh, :kw] = keep[:kh, :kw]; vis[:int(0.12 * h)] = True
        al[..., 3] = (al[..., 3] * vis * 0.94).astype(np.uint8)
        im.paste(Image.fromarray(al, "RGBA"), (X0, Y0), Image.fromarray(al[..., 3]))
    im.save(W / "out" / f.name)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-i", str(W / "out/%04d.png"), "-c:v", "libx264", "-crf", "14", "-preset", "slow",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(R / "public/mirror_clip_lock.mp4")], check=True)
print("wrote public/mirror_clip_lock.mp4")
