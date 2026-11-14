"""Phone screen UI texture (1179x2556) for Test 1: receiving the cricket video from Mumbai."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, os
W, H = 1179, 2556
F = '/usr/share/fonts/opentype/inter/'
def font(w, s): return ImageFont.truetype(F + {'b': 'Inter-Bold.otf', 's': 'Inter-SemiBold.otf', 'm': 'Inter-Medium.otf', 'x': 'Inter-ExtraBold.otf'}[w], s)
im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
for y in range(H):   # deep navy -> indigo wallpaper
    t = y / H; d.line([(0, y), (W, y)], fill=(int(8 + 18 * t), int(14 + 8 * t), int(38 + 40 * t)))
glow = Image.new('L', (W, H)); gd = ImageDraw.Draw(glow); gd.ellipse([-300, 1500, 900, 2700], fill=120); gd.ellipse([500, -200, 1500, 800], fill=90)
glow = glow.filter(ImageFilter.GaussianBlur(220)); im = Image.composite(Image.new('RGB', (W, H), (40, 90, 200)), im, glow); d = ImageDraw.Draw(im)
d.text((90, 70), '9:41', font=font('s', 52), fill=(255, 255, 255))
for i, h in enumerate([16, 24, 32, 40]): d.rounded_rectangle([900 + i * 26, 118 - h, 916 + i * 26, 118], 4, fill=(255, 255, 255))
d.rounded_rectangle([1020, 82, 1100, 118], 10, outline=(255, 255, 255), width=4); d.rounded_rectangle([1026, 88, 1080, 112], 6, fill=(255, 255, 255))
d.text((90, 300), 'Messages', font=font('s', 44), fill=(160, 175, 210))
d.text((90, 360), 'Raju (Mumbai)', font=font('x', 86), fill=(255, 255, 255))
# video card
cx0, cy0, cx1, cy1 = 90, 560, W - 90, 1200
card = Image.new('RGB', (cx1 - cx0, cy1 - cy0)); cd = ImageDraw.Draw(card); cw, ch = card.size
for y in range(ch):
    t = y / ch
    col = (int(40 + 90 * t), int(110 + 80 * t), int(210 - 40 * t)) if t < .48 else (int(30 + 20 * t), int(120 + 40 * (1 - t)), int(50 + 10 * t))
    cd.line([(0, y), (cw, y)], fill=col)
for i in range(60):  # stadium lights + crowd
    x = random.Random(i).randint(0, cw); cd.ellipse([x - 6, 40 + (i % 5) * 8, x + 6, 52 + (i % 5) * 8], fill=(255, 245, 210))
cd.polygon([(cw * .44, ch * .48), (cw * .56, ch * .48), (cw * .66, ch), (cw * .34, ch)], fill=(214, 194, 140))
for x in (.48, .5, .52): cd.rectangle([cw * x - 3, ch * .5, cw * x + 3, ch * .62], fill=(255, 255, 255))
cd.ellipse([cw * .47, ch * .66, cw * .53, ch * .76], fill=(30, 30, 30)); cd.rectangle([cw * .485, ch * .74, cw * .515, ch * .92], fill=(240, 240, 240))
mask = Image.new('L', card.size); ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], 56, fill=255); im.paste(card, (cx0, cy0), mask)
d = ImageDraw.Draw(im)
d.ellipse([W / 2 - 90, (cy0 + cy1) / 2 - 90, W / 2 + 90, (cy0 + cy1) / 2 + 90], fill=(0, 0, 0, 120))
d.polygon([(W / 2 - 28, (cy0 + cy1) / 2 - 46), (W / 2 - 28, (cy0 + cy1) / 2 + 46), (W / 2 + 50, (cy0 + cy1) / 2)], fill=(255, 255, 255))
d.text((90, 1250), 'cricket_final_over.mp4', font=font('b', 58), fill=(255, 255, 255))
d.text((90, 1330), 'Receiving · 5 of 8 packets', font=font('m', 46), fill=(140, 200, 255))
for i in range(8):
    x = 90 + i * 128; on = i < 5
    d.rounded_rectangle([x, 1420, x + 104, 1524], 22, fill=(255, 196, 64) if on else (60, 70, 110))
d.text((90, 1580), 'via 192.168.1.7  →  sea cable  →  London', font=font('m', 38), fill=(150, 160, 200))
d.rounded_rectangle([90, 2300, W - 90, 2420], 60, fill=(30, 40, 80)); d.text((150, 2330), 'Message', font=font('m', 46), fill=(120, 130, 170))
d.rounded_rectangle([W / 2 - 200, H - 40, W / 2 + 200, H - 28], 6, fill=(255, 255, 255))
os.makedirs(os.path.dirname(os.path.abspath(__file__)) + '/tex', exist_ok=True)
im.save(os.path.dirname(os.path.abspath(__file__)) + '/tex/phone_ui.png'); print('ui ok')
