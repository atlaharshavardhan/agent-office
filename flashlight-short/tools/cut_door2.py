"""Split the flattened door art into layers for the tug.  Needs public/art/mask.png (tools/cut_door.py).
   door-base.png  the original art, with a thin band along the upper body's outline repaired so a small move reveals clean wall
   door-upper.png hoodie torso + head + both arms (everything above the hem line), RGBA, moves
   door-hand.png  the gripping hand exactly as drawn, fixed on top, RGBA
   Legs, trousers and both shoes are never touched: they stay in the base."""
import cv2, numpy as np
from scipy.ndimage import binary_fill_holes
from PIL import Image
img = cv2.cvtColor(np.array(Image.open('public/art/door-shot.png').convert('RGB')), cv2.COLOR_RGB2BGR)
H, W = img.shape[:2]
m = (cv2.imread('public/art/mask.png', 0) > 127).astype(np.uint8)
rgb = img[:, :, ::-1].astype(int); R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
yy, xx = np.mgrid[0:H, 0:W]
# leftover table leg beside the back arm and behind the back hand (dull brown, not ink and not skin)
leg = (xx >= 624) & (yy > 760) & (yy < 1030)
brown = (R > 70) & (R < 150) & (G < 95) & (B < 60)
m[leg & (xx >= 627)] = 0
m[(yy > 900) & (yy < 1030) & (xx > 560) & (xx < 640) & brown] = 0
m[:172, :486] = 0
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)))
m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
m = binary_fill_holes(cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))).astype(np.uint8)   # no holes inside the figure
# upper = above the hem's lower edge, plus the back arm; trousers excluded by colour
hem = 867 + (xx - 312) * (912 - 867) / (502 - 312)
pants = ((R < 60) & (G < 60) & (B > 38) & (B < 115)).astype(np.uint8)
pants = cv2.morphologyEx(pants, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
upper = ((yy < hem + 17) | ((xx >= 520) & (xx <= 640) & (yy >= 780) & (yy <= 1030))) & (m == 1) & (pants == 0)
upper = upper.astype(np.uint8)
# the gripping hand stays where it is: it is NOT part of the moving layer
HAND_X = 207
upper[:, :HAND_X] = 0
upper[(yy > 520) & (yy < 660) & (xx < 262) & (xx >= HAND_X)] |= m[(yy > 520) & (yy < 660) & (xx < 262) & (xx >= HAND_X)]
n, lab, st, _ = cv2.connectedComponentsWithStats(upper)
upper = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
def save_rgba(path, mask, soft=0.9):
    a = np.clip(cv2.GaussianBlur(cv2.erode(mask, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), soft) * 1.15, 0, 1)
    Image.fromarray(np.dstack([img[:, :, ::-1], (a * 255).astype(np.uint8)]), 'RGBA').save(path)
save_rgba('public/art/door-upper.png', upper)
# hand layer: the original pixels around the fist, cut in the wrist just before the cuff; soft only on the cut side
hand = np.zeros((H, W), np.uint8); hand[500:680, 90:HAND_X + 1] = 1
a = hand.astype(np.float32); a[:, HAND_X - 5:HAND_X + 1] *= np.linspace(1, 0, 6)[None, :]
Image.fromarray(np.dstack([img[:, :, ::-1], (a * 255).astype(np.uint8)]), 'RGBA').save('public/art/door-hand.png')
# base: repair only a 16 px band inside the upper body's outline (never the legs, never the hand)
near = cv2.dilate(upper, np.ones((17, 17), np.uint8)) == 1                      # a few px beyond the outline too: stray hair/outline pixels
ring = near & (cv2.erode(m, np.ones((33, 33), np.uint8)) == 0) & (yy < hem - 4) & ~((xx < HAND_X + 3) & (yy > 500) & (yy < 680))
ring |= (upper == 1) & (cv2.erode(m, np.ones((33, 33), np.uint8)) == 0) & ((xx >= 520) & (yy >= 780) & (yy <= 1030))
big = cv2.dilate(upper | hand, np.ones((9, 9), np.uint8))
fix = cv2.inpaint(img, big * 255, 7, cv2.INPAINT_TELEA)
base = img.copy(); base[ring] = fix[ring]
Image.fromarray(base[:, :, ::-1]).save('public/art/door-base.png')
prev = base.copy(); prev[upper == 1] = (0.55 * prev[upper == 1] + 0.45 * np.array([255, 0, 255])).astype(np.uint8)
cv2.imwrite('public/art/layers-preview.png', prev)
print('upper px', int(upper.sum()), 'ring px', int(ring.sum()))

# ---- wrist: if the sleeve slides back a few px, the gap should read as wrist skin, not a doubled cuff
skin = np.median(img[585:615, 192:204].reshape(-1, 3), axis=0).astype(np.uint8)
base2 = cv2.cvtColor(np.array(Image.open('public/art/door-base.png').convert('RGB')), cv2.COLOR_RGB2BGR)
quad = np.array([[204, 566], [250, 570], [248, 640], [208, 636]], np.int32)
cv2.fillPoly(base2, [quad], tuple(int(c) for c in skin))
cv2.line(base2, (204, 565), (250, 569), (14, 20, 36), 3); cv2.line(base2, (207, 636), (248, 641), (14, 20, 36), 3)
Image.fromarray(base2[:, :, ::-1]).save('public/art/door-base.png')
print('wrist skin', skin)
