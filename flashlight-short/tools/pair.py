import sys
from PIL import Image
# side-by-side review pair: pair.py out.png a.png b.png ...
out, *ins = sys.argv[1:]
ims = [Image.open(p).convert('RGB').resize((540, 960)) for p in ins]
sheet = Image.new('RGB', (550 * len(ims), 960), (20, 20, 20))
for i, im in enumerate(ims): sheet.paste(im, (i * 550, 0))
sheet.save(out)
