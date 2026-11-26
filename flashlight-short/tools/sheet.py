# contact sheet of the storyboard stills, in scene order: python3 tools/sheet.py
import glob, os
from PIL import Image, ImageDraw, ImageFont
fs = sorted(glob.glob('out/storyboard/[0-9]*.png'))
w, h, cols = 300, 533, 7
rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 12) + 12, rows * (h + 46) + 12), (18, 18, 22))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except Exception: font = ImageFont.load_default()
for i, f in enumerate(fs):
    x, y = 12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 46)
    sheet.paste(Image.open(f).convert('RGB').resize((w, h)), (x, y))
    d.text((x, y + h + 8), os.path.basename(f)[:-4], fill=(220, 220, 220), font=font)
sheet.save('out/storyboard/contact-sheet.png')
print(len(fs), 'stills')
