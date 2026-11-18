"""Neutral night-city view from a high floor (S1 final, Shot 2 window). Procedural, landmark-free.

Painter's algorithm, far -> near. Each tower has real floor bands and window columns (not random dots),
per-building tint (warm offices / cool LED / dark residential), occasional lit crowns and edge strips,
atmospheric haze toward the horizon, lit streets between blocks, and near rooftops that fill the lower window
(we look DOWN onto the city, so there is no empty water). Depth-of-field blur grows toward the camera.

Returns far plate (BGR uint8), near layer (BGRA uint8) and metadata (streets / beacons / twinkle boxes) so
Remotion can animate traffic, aircraft beacons and window flicker exactly on the generated geometry.
"""
import cv2
import numpy as np

TINTS = [np.array(c, np.float32) for c in ((0.55, 0.80, 1.00), (0.62, 0.86, 1.00), (1.00, 0.95, 0.85), (0.80, 0.90, 1.00), (0.45, 0.70, 0.95))]  # BGR


def tower(img, rng, x0, top, base, bw, depth, meta):
    """Draw one tower; depth 0 (far) .. 1 (near). Returns nothing, draws into img (float BGR, 0..1)."""
    h, w = img.shape[:2]
    x1 = min(w, x0 + bw); x0c = max(0, x0)
    if x1 <= x0c or base <= 0 or top >= h:
        return
    haze = 1 - depth
    body = np.array([0.050, 0.042, 0.036]) * (0.6 + 0.8 * rng.random()) * (0.55 + 0.45 * depth) + np.array([0.06, 0.05, 0.045]) * haze * 0.6
    t0, b0 = max(0, top), min(h, base)
    img[t0:b0, x0c:x1] = body
    # subtle side shading (one face slightly darker) for volume
    side = int(bw * rng.uniform(0.18, 0.32))
    img[t0:b0, max(0, x1 - side):x1] *= 0.72
    floor_h = int(np.interp(depth, [0, 1], [5, 16])); win_w = int(np.interp(depth, [0, 1], [2, 7])); gap = int(np.interp(depth, [0, 1], [2, 6]))
    kind = rng.random()
    tint = TINTS[rng.integers(len(TINTS))]
    lit_p = 0.10 if kind < 0.25 else (0.55 if kind < 0.75 else 0.85)       # residential / mixed / office
    rows = np.arange(top + floor_h, base - 2, floor_h)
    band = rng.random(len(rows)) < (0.35 if kind < 0.25 else 0.9)          # whole floors on/off (real buildings do this)
    for r, on in zip(rows, band):
        if not on or r < 0 or r >= h:
            continue
        if kind >= 0.75 and rng.random() < 0.6:                            # office: continuous lit ribbon window
            yy = slice(r, min(h, r + max(1, floor_h // 2)))
            img[yy, x0c + 2:max(x0c + 2, x1 - side - 2)] = tint * rng.uniform(0.25, 0.55) * (0.9 - 0.45 * depth)
            continue
        for xx in range(x0 + 2, x1 - 2, win_w + gap):
            if 0 <= xx < w and rng.random() < lit_p:
                img[r:min(h, r + max(1, floor_h // 2)), xx:min(w, xx + win_w)] = tint * rng.uniform(0.25, 0.95) * (0.9 - 0.3 * depth)
    if rng.random() < 0.25:                                                # lit crown band (generic)
        img[max(0, top):max(0, top) + max(2, floor_h // 2), x0c:x1] = tint * 0.9
    if rng.random() < 0.15:                                                # vertical LED edge strip
        img[t0:b0, max(0, x0):max(0, x0) + 2] = np.array([0.55, 0.75, 0.45]) * 0.8
    if depth > 0.55 and rng.random() < 0.5:                                # roof beacon (animated in Remotion)
        meta["beacons"].append([int(x0 + bw / 2), int(top - 3)])
    if lit_p > 0.5 and len(meta["twinkle"]) < 160:
        meta["twinkle"].append([int(x0c), int(t0), int(x1 - x0c), int(b0 - t0)])


def make_city(w, h, seed=11):
    rng = np.random.default_rng(seed)
    meta = {"streets": [], "beacons": [], "twinkle": []}
    y = np.linspace(0, 1, h)[:, None]
    hz = 0.40                                                              # horizon (fraction of height)
    sky = np.zeros((h, w, 3), np.float32)
    top_c, low_c = np.array([0.095, 0.055, 0.035]), np.array([0.16, 0.15, 0.17])   # deep blue -> city-glow
    sky[:] = (top_c * (1 - np.clip(y / hz, 0, 1)) + low_c * np.clip(y / hz, 0, 1))[:, :, None].transpose(0, 2, 1)
    far = sky.copy()
    H0 = int(h * hz)
    # far skyline band (dense, small, hazy)
    for _ in range(140):
        bw = int(rng.uniform(14, 46)); x0 = int(rng.uniform(-20, w)); bh = int(rng.uniform(20, 150))
        tower(far, rng, x0, H0 - bh, H0 + 30, bw, 0.05, meta)
    haze = np.exp(-((np.arange(h) - H0) / 70.0) ** 2)[:, None, None] * np.array([0.11, 0.12, 0.14])
    far += haze
    # mid layers: bases step DOWN the frame (we look down), towers get bigger
    for li, (n, base_y, hmin, hmax, wmin, wmax, dep) in enumerate((
            (40, 0.47, 60, 240, 26, 70, 0.25), (24, 0.57, 120, 400, 40, 110, 0.4), (14, 0.70, 200, 560, 70, 160, 0.55))):
        by = int(h * base_y)
        far[by - 5:by + 4] = np.maximum(far[by - 5:by + 4], np.array([0.25, 0.55, 0.95]) * 0.55)   # sodium street glow
        meta["streets"].append([by, li])
        xs = np.sort(rng.uniform(-60, w, n))
        for x0 in xs:
            bw = int(rng.uniform(wmin, wmax)); bh = int(rng.uniform(hmin, hmax))
            tower(far, rng, int(x0), by - bh, by + int(h * 0.15), bw, dep, meta)
        far[:] = far + np.exp(-((np.arange(h) - by) / 40.0) ** 2)[:, None, None] * np.array([0.035, 0.05, 0.07])
    bright = np.clip(far - 0.35, 0, 1)
    far = far + cv2.GaussianBlur(bright, (0, 0), 9) * 1.4                  # window bloom / light spill
    far = cv2.GaussianBlur(far, (0, 0), 3.0)                               # DOF: city far behind her
    # near layer: big towers rising from below the frame edge (separate plane for parallax), more blur
    near = np.zeros((h, w, 3), np.float32); na = np.zeros((h, w), np.float32)
    by = int(h * 0.86)
    meta["streets"].append([by, 3])
    for x0 in np.sort(rng.uniform(-100, w, 8)):
        bw = int(rng.uniform(150, 300)); top = int(h * rng.uniform(0.62, 0.80))
        tmp = np.zeros_like(near); tower(tmp, rng, int(x0), top, h, bw, 0.9, meta); tmp *= 0.62
        m = (tmp.sum(2) > 0).astype(np.float32)
        near = near * (1 - m[..., None]) + tmp; na = np.maximum(na, m)
    near = near * 0.75 + cv2.GaussianBlur(np.clip(near - 0.3, 0, 1), (0, 0), 10)
    near = cv2.GaussianBlur(near, (0, 0), 6.0); na = cv2.GaussianBlur(na, (0, 0), 6.0)
    meta["horizon"] = H0
    to8 = lambda a: (np.clip(a, 0, 1) * 255).astype(np.uint8)
    return to8(far), np.dstack([to8(near), to8(na)]), meta
