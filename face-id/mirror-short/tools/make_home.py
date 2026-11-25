"""Home screen for the reveal: the hook's own last frame (public/hook_last.png, the phone in his hand) with its lock
screen replaced by a home screen of generic app icons. Fingers stay in front.  -> public/hook_home.png"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage
R = Path(__file__).resolve().parent.parent
im = Image.open(R / "public/hook_last.png").convert("RGB"); a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
X0, Y0, X1, Y1 = 235, 231, 843, 1596                                 # the screen in this frame
box = np.zeros(a.shape[:2], bool); box[Y0:Y1, X0:X1] = True
m = (b > 85) & (b > 0.55 * r) & (r > 95) & (g < 0.88 * r) & box
m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=6)) & box      # clock and date are holes: fill them
m = ndimage.binary_opening(m, iterations=2)
# wallpaper without the clock: the screen, heavily blurred
wall = im.filter(ImageFilter.GaussianBlur(46))
home = wall.copy(); d = ImageDraw.Draw(home, "RGBA")
W = X1 - X0; S = 104; GAPX = (W - 4 * S) / 5
COLS = ["#34c759", "#0a84ff", "#ff9f0a", "#ff375f", "#5e5ce6", "#30b0c7", "#ffd60a", "#8e8e93", "#ff6b3d", "#64d2ff", "#bf5af2", "#32d74b",
        "#ff453a", "#0a84ff", "#ac8e68", "#5ac8fa", "#ffcc00", "#af52de", "#34c759", "#ff9500"]
def icon(x, y, col, k):
    d.rounded_rectangle([x, y, x + S, y + S], 25, fill=col)
    d.rounded_rectangle([x, y, x + S, y + S // 2], 25, fill=(255, 255, 255, 34))
    cx, cy = x + S / 2, y + S / 2                                   # a plain white glyph (no real app logos)
    if k % 4 == 0: d.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], outline="white", width=8)
    elif k % 4 == 1: d.rounded_rectangle([cx - 26, cy - 18, cx + 26, cy + 18], 8, outline="white", width=8)
    elif k % 4 == 2: d.polygon([(cx - 20, cy - 26), (cx + 26, cy), (cx - 20, cy + 26)], fill="white")
    else:
        for o in (-18, 0, 18): d.rounded_rectangle([cx - 26, cy + o - 4, cx + 26, cy + o + 4], 4, fill="white")
k = 0
for row in range(5):
    for col in range(4):
        icon(X0 + GAPX + col * (S + GAPX), Y0 + 190 + row * (S + 62), COLS[k % len(COLS)], k); k += 1
d.rounded_rectangle([X0 + 26, Y1 - 190, X1 - 26, Y1 - 40], 46, fill=(255, 255, 255, 60))        # dock
for col in range(4): icon(X0 + GAPX + col * (S + GAPX), Y1 - 167, COLS[(k + col * 3) % len(COLS)], k + col)
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
d.text((X0 + 62, Y0 + 44), "9:41", fill="white", font=f)
d.rounded_rectangle([540 - 92, 282 - 27, 540 + 92, 282 + 27], 27, fill="#04050a")              # Dynamic Island
soft = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
out = Image.composite(home, im, soft); out.save(R / "public/hook_home.png"); print("wrote public/hook_home.png", int(m.sum()))
