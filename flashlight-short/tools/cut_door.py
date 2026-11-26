"""Cut the character out of the flattened door-shot art and build a clean background plate.
   python3 tools/cut_door.py  ->  public/art/door-char.png (RGBA), public/art/door-plate.png (RGB), public/art/mask-preview.png"""
import cv2, numpy as np
from PIL import Image
img = cv2.cvtColor(np.array(Image.open('public/art/door-shot.png').convert('RGB')), cv2.COLOR_RGB2BGR)
H, W = img.shape[:2]
rgb = img[:, :, ::-1].astype(int); R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
mask = np.full((H, W), cv2.GC_BGD, np.uint8)
rect = (170, 130, 560, 1420)                                  # x, y, w, h around the figure
x, y, w, h = rect
mask[y:y + h, x:x + w] = cv2.GC_PR_BGD
# probable foreground: a rough body envelope
env = np.zeros((H, W), np.uint8)
pts = np.array([[430,180],[560,150],[700,230],[720,420],[700,540],[640,600],[640,870],[600,900],[640,1380],[650,1440],[560,1470],[420,1500],[200,1510],[190,1480],[300,1450],[270,1100],[320,880],[330,820],[420,640],[250,580],[200,560],[110,560],[100,640],[210,640],[250,690],[420,690],[470,520],[440,330]], np.int32)
cv2.fillPoly(env, [pts], 1)
mask[(env == 1)] = cv2.GC_PR_FGD
# sure foreground by colour (hoodie yellow, navy trousers, near-black hair/shoes inside the envelope)
hood = (R > 215) & (G > 130) & (G < 200) & (B < 40)
pants = (R < 60) & (G < 60) & (B > 45) & (B < 110)
inside = cv2.erode(env, np.ones((15, 15), np.uint8)) == 1
mask[hood & inside] = cv2.GC_FGD
mask[pants & inside] = cv2.GC_FGD
bgd = np.zeros((H, W), np.float64); fgd = np.zeros((H, W), np.float64)
cv2.grabCut(img, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 8, cv2.GC_INIT_WITH_MASK)
m = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = (lab == big).astype(np.uint8)
cv2.imwrite('public/art/mask.png', m * 255)
ov = img.copy(); ov[m == 1] = (0.5 * ov[m == 1] + 0.5 * np.array([255, 0, 255])).astype(np.uint8)
cv2.imwrite('public/art/mask-preview.png', ov)
print('mask area', int(m.sum()))

# ---- clean the leaks: the spur above the hair and the table leg behind the back arm
m[:172, :486] = 0
m[760:962, 633:] = 0
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
cv2.imwrite('public/art/mask.png', m * 255)

# ---- character layer: slightly eroded and feathered so no old-background halo rides along
core = cv2.erode(m, np.ones((3, 3), np.uint8))
alpha = cv2.GaussianBlur(core.astype(np.float32), (0, 0), 0.9)
alpha = np.clip(alpha * 1.15, 0, 1)
rgba = np.dstack([img[:, :, ::-1], (alpha * 255).astype(np.uint8)])
Image.fromarray(rgba, 'RGBA').save('public/art/door-char.png')

# ---- clean plate: the room without him (only the band his movement can uncover has to look right)
grow = cv2.dilate(m, np.ones((9, 9), np.uint8))
plate = cv2.inpaint(img, grow * 255, 9, cv2.INPAINT_TELEA)
Image.fromarray(plate[:, :, ::-1]).save('public/art/door-plate.png')
print('char + plate written')
