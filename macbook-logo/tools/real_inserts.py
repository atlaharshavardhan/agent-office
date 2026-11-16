"""V4 (Harsh, 16 Nov 2026): put the 3 Higgsfield photos (higgsfield/still*.png) into the rendered 3D video, animated in code (0 credits).
- 0.00-1.00 s: opening photo, the logo glows on, slow push-in, "THE GLOW IS BACK." + subtitle, then a short blend into the 3D close-up
- "Brighter in a bright room" / "dimmer in a dark one": café / bedroom photo, slow push-in, the room card copied from the 3D frames, subtitle
Each photo shot carries a small "AI image" note. Reads/writes raw frames through ffmpeg pipes, so the 3D video is not re-rendered.
  python3 real_inserts.py <in.mp4 (silent render)> <out.mp4> [voice dir, default voice/george40]"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
src, dst = sys.argv[1], sys.argv[2]; vdir = sys.argv[3] if len(sys.argv) > 3 else os.path.join(root, 'voice', 'george40')
W, H, FPS = 1080, 1920, 30
caps = json.load(open(os.path.join(vdir, 'captions.json')))
def cap_at(t):
    for a, b, txt in caps:
        if a - 0.05 <= t < b + 0.12: return txt
    return ''
def span(txt):
    c = [c for c in caps if c[2] == txt][0]; return c[0], c[1]

tmp = os.path.join('/tmp', 'ri_fonts'); os.makedirs(tmp, exist_ok=True)
def font(weight, size):
    p = os.path.join(tmp, f'sora{weight}.ttf')
    if not os.path.exists(p):
        f = TTFont(os.path.join(root, '..', 'phone-teardown', 'fonts', 'fontsource-sora-5.0.18', 'package', 'files', f'sora-latin-{weight}-normal.woff2')); f.flavor = None; f.save(p)
    return ImageFont.truetype(p, size)
def plex(size):
    p = os.path.join(tmp, 'plex500.ttf')
    if not os.path.exists(p):
        f = TTFont(os.path.join(root, '..', 'phone-teardown', 'fonts', 'fontsource-ibm-plex-sans-5.0.20', 'package', 'files', 'ibm-plex-sans-latin-500-normal.woff2')); f.flavor = None; f.save(p)
    return ImageFont.truetype(p, size)
F_SUB, F_HOOK, F_NOTE = font(700, 63), font(700, 89), plex(24)

def photo(name):
    im = Image.open(os.path.join(root, 'higgsfield', name)).convert('RGB')
    return im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)   # 752x1344 -> 1080x1930
P_HOOK, P_CAFE, P_BED = photo('still1_hook.png'), photo('still2_cafe.png'), photo('still3_bedroom.png')

# the opening photo with the logo switched off: darken the bright logo and its halo
a = np.asarray(P_HOOK).astype(np.float32); lum = a.mean(2)
m = (lum > 150).astype(np.uint8) * 255; m[:int(H * 0.3)] = 0; m[int(H * 0.75):] = 0   # the logo only (not the blue rim or desk reflection)
mask = Image.fromarray(m).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(28))
k = np.asarray(mask).astype(np.float32)[..., None] / 255
P_HOOK_OFF = Image.fromarray((a * (1 - 0.85 * np.clip(k * 1.6, 0, 1))).astype(np.uint8))

def ken(im, t, t0, t1, z0=1.0, z1=1.07, cy=0.45):   # slow push-in towards (0.5, cy)
    f = min(1, max(0, (t - t0) / max(1e-3, t1 - t0))); z = z0 + (z1 - z0) * (f * f * (3 - 2 * f))
    w, h = W / z, H / z; x0 = (im.width - w) * 0.5; y0 = min(max(0, im.height * cy - h / 2), im.height - h)
    return im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((W, H), Image.LANCZOS)

def text_c(d, xy, txt, f, fill, stroke=0, sc=None):
    d.text(xy, txt, font=f, fill=fill, anchor='mm', stroke_width=stroke, stroke_fill=sc, align='center')
def subtitle(im, txt):
    if not txt: return
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    lines = wrap(txt, F_SUB, 780); y = 1350 - (len(lines) - 1) * 36
    for i, l in enumerate(lines): text_c(ds, (510, y + i * 72 + 4), l, F_SUB, (0, 0, 0, 170))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    d = ImageDraw.Draw(im)
    for i, l in enumerate(lines): text_c(d, (510, y + i * 72), l, F_SUB, (255, 255, 255, 255), 5, (0, 0, 0, 140))
def wrap(txt, f, maxw):
    words, lines, cur = txt.split(), [], ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if f.getlength(t) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w_
    return lines + [cur]
def note(im, txt='AI-generated image · not affiliated with Apple'):
    d = ImageDraw.Draw(im); text_c(d, (510, 1477), txt, F_NOTE, (255, 255, 255, 150))
def hook_title(im, t):
    for i, (line, t0) in enumerate([('THE GLOW', 0.35), ('IS BACK.', 0.55)]):
        v = min(1, max(0, (t - t0) / 0.35)); v = 1 - (1 - v) ** 3
        if v <= 0: continue
        lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay); y = 300 + i * 92 + (1 - v) * 42
        text_c(d, (510, y + 6), line, F_HOOK, (0, 0, 0, int(160 * v))); lay = lay.filter(ImageFilter.GaussianBlur(12)); d = ImageDraw.Draw(lay)
        text_c(d, (510, y), line, F_HOOK, (255, 255, 255, int(255 * v))); im.alpha_composite(lay)

CARD = (124, 237, 896, 434)
card_mask = Image.new('L', (W, H), 0); ImageDraw.Draw(card_mask).rounded_rectangle(CARD, 48, fill=255)
card_shadow = Image.new('L', (W, H), 0); ImageDraw.Draw(card_shadow).rounded_rectangle((CARD[0], CARD[1] + 24, CARD[2], CARD[3] + 24), 48, fill=150); card_shadow = card_shadow.filter(ImageFilter.GaussianBlur(30))
def card_from(im, frame3d):
    im.paste(Image.new('RGBA', (W, H), (0, 0, 0, 255)), (0, 0), card_shadow)
    im.paste(frame3d.convert('RGBA'), (0, 0), card_mask)

HOOK_END, BLEND = 0.96, 0.0   # clean cut between "This logo" and "shouldn't be able to glow" (a blend showed two logos)
CAFE, BED = span('Brighter in a bright room'), span('dimmer in a dark one')
def shot(t, frame3d):
    """Return the replacement frame (RGBA) for time t, or None to keep the 3D frame."""
    if t < HOOK_END + BLEND:
        on = min(1, max(0, (t - 0.08) / 0.47)); on = on * on * (3 - 2 * on)   # same timing as the 3D logo
        im = Image.blend(ken(P_HOOK_OFF, t, 0, HOOK_END + BLEND, 1.0, 1.08, 0.46), ken(P_HOOK, t, 0, HOOK_END + BLEND, 1.0, 1.08, 0.46), on).convert('RGBA')
        hook_title(im, t); subtitle(im, cap_at(t)); note(im)
        if t >= HOOK_END: return None
        return im
    for (a0, a1), P in ((CAFE, P_CAFE), (BED, P_BED)):
        s0, s1 = a0 - 0.05, a1 + 0.06
        if s0 <= t < s1:
            im = ken(P, t, s0, s1, 1.0, 1.06, 0.42).convert('RGBA'); card_from(im, frame3d); subtitle(im, cap_at(t)); note(im)
            e = min(1, (t - s0) / 0.12) if P is P_CAFE else min(1, (s1 - t) / 0.12)   # soft in at the café, soft out after the bedroom; hard cut between them
            return Image.blend(frame3d.convert('RGBA'), im, max(0, min(1, e)))
    return None

dec = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
n, sz = 0, W * H * 3
while True:
    buf = dec.stdout.read(sz)
    if len(buf) < sz: break
    t = n / FPS; fr = Image.frombytes('RGB', (W, H), buf); r = shot(t, fr)
    enc.stdin.write((r.convert('RGB') if r is not None else fr).tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); print('ok', n, 'frames', dst)
