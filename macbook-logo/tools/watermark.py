"""InvisiTech watermark for Shorts (rules 15 + 22): small logo + @TheInvisiTech at the right edge, vertical centre,
plus a faint copy drifting slowly through the middle so it can't be cropped off; both hidden for the last --hide-last seconds.
Rebuilt here to match the AirPods ear Short's watermark (the PC tool tools/watermark/watermark.py isn't in this repo).
  python3 watermark.py in.mp4 out.mp4 --hide-last 5.0 [--scale 2 for 4K]"""
import argparse, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
here = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--hide-last', type=float, default=0); ap.add_argument('--scale', type=float, default=1)
a = ap.parse_args(); k = a.scale
tmp = tempfile.mkdtemp()
woff = os.path.join(here, '..', '..', 'phone-teardown', 'fonts', 'fontsource-sora-5.0.18', 'package', 'files', 'sora-latin-600-normal.woff2')
f = TTFont(woff); f.flavor = None; ttf = os.path.join(tmp, 'sora600.ttf'); f.save(ttf)
font = ImageFont.truetype(ttf, int(26 * k)); text = '@TheInvisiTech'
tw = int(font.getlength(text)); L = int(44 * k); pad = int(8 * k); W, H = L + pad + tw + int(6 * k), L + int(8 * k)
img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
logo = Image.open(os.path.join(here, '..', 'assets', 'invisitech-logo.png')).convert('RGBA').resize((L, L), Image.LANCZOS)
m = Image.new('L', (L, L), 0); ImageDraw.Draw(m).ellipse([0, 0, L - 1, L - 1], fill=255); img.paste(logo, (0, (H - L) // 2), m)
for dx, dy in [(0, 2), (1, 2), (2, 2), (0, 1)]: d.text((L + pad + dx * k, H / 2 + dy * k), text, font=font, fill=(0, 0, 0, 110), anchor='lm')   # soft shadow
d.text((L + pad, H / 2), text, font=font, fill=(255, 255, 255, 235), anchor='lm')
png = os.path.join(tmp, 'wm.png'); img.save(png)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.src]).decode())
end = dur - a.hide_last
fc = (f"[1:v]format=rgba,colorchannelmixer=aa=0.92[w1];[1:v]format=rgba,colorchannelmixer=aa=0.13,scale=iw*0.8:-1[w2];"
      f"[0:v][w1]overlay=x=W-w-{int(24 * k)}:y=(H-h)/2:enable='lt(t,{end:.3f})'[a];"
      f"[a][w2]overlay=x='W*0.12+W*0.5*(0.5+0.5*sin(t*0.21))':y='H*0.27+H*0.33*(0.5+0.5*sin(t*0.13+1.3))':enable='lt(t,{end:.3f})'")
subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.src, '-i', png, '-filter_complex', fc, '-map', '0:a?', '-c:a', 'copy', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17' if k > 1 else '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a.dst])
print('ok', a.dst)
