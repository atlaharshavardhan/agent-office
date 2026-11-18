"""S1 final hook · layer extraction (free, local: OpenCV + rembg/ISNet + numpy). No paid generation.

Shot 1 (Jensen, existing Kling clip): selects 2.33-3.83 s (strongest hand gesture, eyes open at the cut-in),
  resamples to 30 fps, writes 45 plates + 45 character mattes (RGBA cut-outs) for foreground/background
  separation, so stage graphics can sit BEHIND him and the GPU IN FRONT of him.
Shot 2 (Alice illustration): splits into layers for the 2.5D multiplane:
  skyline (procedural neutral city: the original view is recognisably Hong Kong, so it is replaced, not
  relabelled), interior plate with glass cut out + character inpainted, furniture, window frame,
  window reflection, character, hair-edge band, interior light mask.

Run:  .venv/bin/python -I scripts/s1_final_layers.py
Out:  remotion/public/s1f/...   and review/s1_final/layers/ (copies of masks for review)
"""
import subprocess
import shutil
from pathlib import Path

import sys as _sys
_sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
import cv2
import numpy as np
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC_K = ROOT / "review/s1_25d/hf/shot1_kling.mp4"
SRC_A = ROOT / "review/s1_25d/hf/alice_char.png"
OUT = ROOT / "remotion/public/s1f"
REV = ROOT / "review/s1_final/layers"
W, H = 1080, 1920
START = 2.33
sess = new_session("isnet-general-use")


def matte(bgr, post=True):
    rgba = remove(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), session=sess, post_process_mask=post)
    return np.array(rgba)[..., 3]


def save_rgba(path, bgr, a):
    cv2.imwrite(str(path), np.dstack([bgr, a]))


def shot1():
    d = OUT / "j"; (d / "plate").mkdir(parents=True, exist_ok=True); (d / "fg").mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(START), "-t", "1.5", "-i", str(SRC_K),
                    "-vf", f"fps=30,scale={W}:-1:flags=lanczos,crop={W}:{H}:0:(ih-{H})/2", "-frames:v", "45",
                    "-q:v", "2", str(d / "plate/%04d.jpg")], check=True)
    plates = sorted((d / "plate").glob("*.jpg"))
    prev = None
    for i, p in enumerate(plates):
        img = cv2.imread(str(p))
        a = matte(img).astype(np.float32)
        if prev is not None:                       # temporal smoothing: no edge boil between frames
            a = 0.65 * a + 0.35 * prev
        prev = a
        a8 = cv2.GaussianBlur(a, (0, 0), 1.0).clip(0, 255).astype(np.uint8)
        save_rgba(d / f"fg/{i:04d}.png", img, a8)
        if i in (0, 22, 44):
            cv2.imwrite(str(REV / f"jensen_matte_{i:02d}.png"), a8)
    print("shot1 plates", len(plates))


def city(w, h, seed=7):
    """Neutral, non-identifiable night city: generic rectangular towers, lit windows, a waterline. Wider than
    the frame for parallax. Purely procedural (no landmark shapes)."""
    rng = np.random.default_rng(seed)
    img = np.zeros((h, w, 3), np.float32)
    sky = np.linspace(0, 1, h)[:, None]
    img[:] = (np.array([0.10, 0.07, 0.05]) * (1 - sky) + np.array([0.06, 0.05, 0.04]) * sky)[..., None, :].reshape(h, 1, 3)
    horizon = int(h * 0.60)
    for layer, (n, hmin, hmax, dark, lit) in enumerate(((60, 0.08, 0.22, 0.07, 0.25), (40, 0.12, 0.34, 0.05, 0.5), (22, 0.18, 0.46, 0.035, 0.75))):
        for _ in range(n):
            bw = int(rng.uniform(40, 120) * (1 + layer * 0.4)); x0 = int(rng.uniform(-60, w))
            bh = int(h * rng.uniform(hmin, hmax)); y0 = horizon - bh
            col = np.array([dark * 1.1, dark * 1.0, dark * 0.95]) * rng.uniform(0.8, 1.2)
            img[max(0, y0):horizon, max(0, x0):min(w, x0 + bw)] = col
            win_w, win_h = 3 + layer, 5 + layer
            warm = rng.random() < 0.7
            floor_bias = np.clip(np.sin(np.arange(h) / rng.uniform(25, 60) + rng.uniform(0, 6)) + 0.3, 0, 1)
            wc = np.array([0.55, 0.78, 1.0]) if warm else np.array([1.0, 0.92, 0.75])   # BGR
            for yy in range(y0 + 8, horizon - 6, win_h + 6):
                for xx in range(x0 + 6, x0 + bw - 6, win_w + 5):
                    if 0 <= xx < w - win_w and 0 <= yy < h and rng.random() < lit * 0.22 * (0.4 + floor_bias[min(h - 1, yy)]):
                        img[yy:yy + win_h, xx:xx + win_w] = wc * rng.uniform(0.35, 1.0)
    # water with stretched reflections
    water = img[horizon - (h - horizon):horizon][::-1].copy()
    water = cv2.resize(water, (w, h - horizon))
    water = cv2.GaussianBlur(water, (1, 0), sigmaX=2, sigmaY=14) * 0.45 + np.array([0.06, 0.04, 0.03])
    img[horizon:] = water
    img[horizon - 3:horizon] = np.array([0.35, 0.55, 0.75])       # promenade lights line
    glow = np.exp(-((np.arange(h) - horizon) / 90.0) ** 2)[:, None, None] * np.array([0.10, 0.11, 0.12])
    img += glow                                                   # city haze glow above the horizon
    return (np.clip(img, 0, 1) * 255).astype(np.uint8), horizon


def shot2():
    d = OUT / "a"; d.mkdir(parents=True, exist_ok=True)
    src = cv2.imread(str(SRC_A))
    s = W / src.shape[1]
    img = cv2.resize(src, (W, int(src.shape[0] * s)), interpolation=cv2.INTER_LANCZOS4)[:H]
    h, w = img.shape[:2]
    X = lambda v: int(v * s)                         # source px (752 wide) -> output px
    # 1 character + hair edges
    a = matte(img).astype(np.uint8)
    a = cv2.GaussianBlur(a, (0, 0), 0.8)
    save_rgba(d / "character.png", img, a)
    band = cv2.subtract(cv2.dilate(a, np.ones((9, 9), np.uint8)), cv2.erode(a, np.ones((25, 25), np.uint8)))
    hair = np.zeros_like(a); hair[:X(450)] = 255
    hair[:, :X(95)] = 0
    hair_a = cv2.GaussianBlur(cv2.min(cv2.min(band, hair), a), (0, 0), 1.2)
    save_rgba(d / "hair_edge.png", img, hair_a)
    # 2 glass panes (window region) -> transparent in the interior plate
    poly = lambda m, pts: cv2.fillPoly(m, [np.array([(X(x), X(y)) for x, y in pts], np.int32)], 255)
    glass = np.zeros((h, w), np.uint8)                # source-px polygons (the sill rail runs diagonally)
    poly(glass, [(222, 0), (512, 0), (512, 1109), (222, 995)])            # left pane
    poly(glass, [(556, 0), (760, 0), (760, 1206), (556, 1128)])           # right pane
    poly(glass, [(556, 1216), (760, 1312), (760, 1400), (556, 1400)])     # lower pane, below the rail
    glass = cv2.GaussianBlur(glass, (0, 0), 1.5)
    frame_mask = np.zeros((h, w), np.uint8)          # window frame / mullions / rail (their own layer)
    frame_mask[:, X(196):X(224)] = 255; frame_mask[:, X(510):X(558)] = 255
    poly(frame_mask, [(556, 1128), (760, 1206), (760, 1312), (556, 1216)])
    # 3 interior plate: inpaint the character so parallax reveals plausible wall/glass edges, then cut glass
    hole = cv2.dilate((a > 20).astype(np.uint8) * 255, np.ones((15, 15), np.uint8))
    small = cv2.resize(img, (w // 2, h // 2)); hs = cv2.resize(hole, (w // 2, h // 2))
    rec = cv2.resize(cv2.inpaint(small, hs, 9, cv2.INPAINT_TELEA), (w, h))
    rec = np.where(hole[..., None] > 0, rec, img)
    rec = cv2.GaussianBlur(rec, (0, 0), 0.6)
    interior_a = cv2.subtract(np.full((h, w), 255, np.uint8), glass)
    interior_a = cv2.max(interior_a, frame_mask)
    save_rgba(d / "interior.png", rec, interior_a)
    save_rgba(d / "window_frame.png", rec, cv2.GaussianBlur(frame_mask, (0, 0), 1.0))
    # 4 furniture: lamp, bonsai, marble counter (left edge) -> nearer multiplane layer
    fur = np.zeros((h, w), np.uint8)
    fur[X(415):X(660), 0:X(58)] = 255                # lamp shade
    fur[X(700):X(1110), 0:X(100)] = 255              # bonsai + pot
    fur[X(1070):, 0:X(150)] = 255                    # counter
    fur = cv2.min(fur, cv2.subtract(np.full((h, w), 255, np.uint8), hole))
    save_rgba(d / "furniture.png", rec, cv2.GaussianBlur(fur, (0, 0), 6))
    # 5 interior light mask (lamp glow) for animated warmth
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    lamp = np.zeros((h, w), np.float32); lamp[X(380):X(700), 0:X(140)] = 1
    glow = cv2.GaussianBlur(np.clip((lum - 120) / 120, 0, 1) * lamp, (0, 0), 40)
    cv2.imwrite(str(d / "lamp_glow.png"), (glow / max(glow.max(), 1e-6) * 255).astype(np.uint8))
    # 6 neutral skyline (replaces the recognisable Hong Kong view), wider for parallax
    from s1_city import make_city
    import json
    sky, near, meta = make_city(w + 260, h)
    cv2.imwrite(str(d / "skyline.jpg"), sky, [cv2.IMWRITE_JPEG_QUALITY, 93])
    cv2.imwrite(str(d / "skyline_near.png"), near)
    json.dump(meta, open(ROOT / "remotion/src/s1/s1f_city.json", "w"))
    horizon = meta["horizon"]
    # 7 window reflection: faint mirrored interior (lamp) + mirrored character head, for the glass layer
    refl = cv2.flip(rec, 1).astype(np.float32) * 0.5
    head = np.zeros((h, w), np.uint8); head[:X(470)] = a[:X(470)]
    hflip = cv2.flip(head, 1); iflip = cv2.flip(img, 1)
    ra = cv2.GaussianBlur(np.maximum(hflip.astype(np.float32) * 0.5, glow[:, ::-1] * 120), (0, 0), 3)
    rgb = np.where(hflip[..., None] > 0, iflip.astype(np.float32), refl)
    ra = cv2.min(ra.astype(np.uint8), glass)
    save_rgba(d / "reflection.png", cv2.GaussianBlur(rgb, (0, 0), 2).astype(np.uint8), ra)
    for n, m in (("alice_character_matte", a), ("alice_hair_edge", hair_a), ("alice_glass", glass), ("alice_frame", frame_mask),
                 ("alice_furniture", fur), ("alice_inpaint_hole", hole)):
        cv2.imwrite(str(REV / f"{n}.png"), m)
    cv2.imwrite(str(REV / "alice_interior_inpainted.jpg"), rec)
    print("shot2 layers ok", w, h, "horizon", horizon)


if __name__ == "__main__":
    REV.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
    import sys
    shot2()
    if "--alice-only" not in sys.argv:
        shot1()
    shutil.copy(OUT / "a/skyline.jpg", REV / "alice_skyline_neutral.jpg")
