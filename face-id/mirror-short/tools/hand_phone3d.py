"""public/hook_last3d.png: the hook's last frame with the photographed phone replaced by the 3D iPhone Pro Max model.
tools/phone3d_lock.png is the model alone (npx remotion still PhoneStill tools/phone3d_lock.png --image-format=png).
His fingers are cut from the original frame by skin colour and laid back over the new phone, so he still holds it."""
import numpy as np
from PIL import Image, ImageFilter
base = Image.open('public/hook_last.png').convert('RGB'); a = np.asarray(base).astype(np.int32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:1920, 0:1080]
skin = (r > 95) & (b < 0.56 * r) & (g < 0.76 * r) & (yy > 1010) & (xx > 300)          # fingers and hand (the screen glow is above 1010)
m = Image.fromarray((skin * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.6))
# the old phone's bottom edge shows below the new one: paint that strip with the wall just under it
out = np.asarray(base).copy()
for y in range(1650, 1716):
    out[y, 180:340] = out[1722, 180:340]
    out[y, 340:900] = (44, 26, 17)          # under the phone, between his fingers: the shadow of his palm
out = Image.fromarray(out)
strip = out.crop((180, 1640, 900, 1722)).filter(ImageFilter.GaussianBlur(5)); out.paste(strip, (180, 1640))
ph = Image.open('tools/phone3d_lock.png').convert('RGBA')
out.paste(ph, (0, 0), ph)
out.paste(base, (0, 0), m)
out.save('public/hook_last3d.png'); print('ok')
