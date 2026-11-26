# one album image of every still: python3 tools/album.py  ->  out/flashlight-album.png (+ out/flashlight-album.zip)
import glob, os, zipfile
from PIL import Image, ImageDraw, ImageFont
W, PAD, BG = 2400, 40, (24, 24, 30)
def font(s, bold=False):
    try: return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), s)
    except Exception: return ImageFont.load_default()
F1, F2, F3 = font(54, True), font(34, True), font(24)
blocks = []  # (kind, payload)
blocks.append(('title', 'InvisiTech · How You\'d Invent a Flashlight · Album'))
blocks.append(('h', 'Review pass'))
blocks.append(('row', [('out/review/1-student-character-sheet.png', 'Student character sheet')]))
blocks.append(('row', [('out/review/2-foil-build-keyframe.png', 'Foil-build keyframe'), ('out/review/3-exterior-keyframe.png', 'Exterior keyframe'), ('public/ref/InvisiTech Student with an Unlit Bulb.png', 'Reference')]))
blocks.append(('h', 'Storyboard (scene order)'))
sb = sorted(f for f in glob.glob('out/storyboard/[0-9]*.png'))
for i in range(0, len(sb), 7): blocks.append(('row', [(f, os.path.basename(f)[:-4]) for f in sb[i:i + 7]]))
# lay out
def row_dims(items):
    ims = [Image.open(p) for p, _ in items]
    gap = 24; avail = W - 2 * PAD - gap * (len(ims) - 1)
    # same height for all, filling the width
    ratios = [im.width / im.height for im in ims]; h = int(avail / sum(ratios))
    if len(items) == 1: h = int(avail / ratios[0])
    return ims, h, gap
H = PAD
for k, p in blocks:
    H += 90 if k == 'title' else 70 if k == 'h' else row_dims(p)[1] + 60
H += PAD
album = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(album); y = PAD
for k, p in blocks:
    if k == 'title': d.text((PAD, y), p, font=F1, fill=(245, 240, 230)); y += 90; continue
    if k == 'h': d.text((PAD, y + 10), p, font=F2, fill=(255, 196, 74)); y += 70; continue
    ims, h, gap = row_dims(p); x = PAD
    for im, (path, label) in zip(ims, p):
        w = int(im.width * h / im.height); album.paste(im.convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
        d.text((x, y + h + 12), label, font=F3, fill=(210, 205, 195)); x += w + gap
    y += h + 60
album.save('out/flashlight-album.png', optimize=True)
with zipfile.ZipFile('out/flashlight-album.zip', 'w', zipfile.ZIP_STORED) as z:
    for f in ['out/review/1-student-character-sheet.png', 'out/review/2-foil-build-keyframe.png', 'out/review/3-exterior-keyframe.png'] + sb:
        z.write(f, os.path.join('flashlight-album', os.path.basename(os.path.dirname(f)), os.path.basename(f)))
print(album.size, os.path.getsize('out/flashlight-album.png') // 1024, 'KB')
