"""Part 2 hook captions, Harsh's style (28 Nov 2026, reference "but nothing changes"): a soft cream rounded pill, dark bold text, the word being spoken in a rounded coloured box with white text.
The colour changes with each scene, and each caption sits in FREE SPACE of its shot (wall or sky at the left, away from the phone, hands, globe, cable and the speed readout); the notification shot uses the empty part of the phone screen.
Draws the captions with Pillow at 30 fps into video/part2hook12e/caps.mov (transparent). Run from internet/ after make_hook12e_audio.py."""
import json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 1080, 1920, 30; D = 'video/part2hook12e'; FONT = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
logs = json.load(open(f'{D}/voicelog.json'))
TEXT = {'f1': 'Imagine sending a photo to your girlfriend in London.', 'f2': "You'd think it travels through a satellite,", 'f3': 'but it actually crosses the ocean through a cable as light,', 'f4': 'in a fraction of a second.', 'f5': 'But how?'}
# shots: (start, end, left x, top y, max pill width, highlight colour)
# (start, end, x, y, max width, pill colour, highlight colour, highlight text colour): the colours come from each scene's own palette
PLUM = (42, 22, 48); NIGHT = (16, 20, 48); BROWN = (58, 28, 30)
PLUM = (42, 22, 48); NIGHT = (16, 20, 48); BROWN = (58, 28, 30)   # the pill colours come from each scene's own palette
# (start, end, x, y, max width, pill colour, highlight colour, highlight text colour). x < 100 = left edge; x > 100 = centred on the phone screen
SHOTS = [(0, 3, 40, 690, 700, PLUM, (255, 180, 84), (42, 22, 48)), (3, 5, 40, 335, 600, NIGHT, (255, 211, 138), (16, 20, 48)), (5, 9, 40, 335, 620, NIGHT, (255, 190, 90), (16, 20, 48)), (9, 10, 40, 655, 600, BROWN, (255, 122, 89), (42, 22, 28)), (10, 12, 190, 1240, 700, PLUM, (255, 180, 84), (42, 22, 48))]
def shot(t): return next(s for s in SHOTS if s[0] <= t < s[1]) if t < 12 else SHOTS[-1]
fnt = ImageFont.truetype(FONT, 46); CREAM = (246, 241, 228); NAVY = (24, 30, 58)
def layout(words, maxw):
    lines = [[]]; 
    for w in words:
        cand = lines[-1] + [w]; tw = sum(fnt.getlength(x) for x in cand) + 16 * (len(cand) - 1)
        if tw > maxw - 60 and lines[-1]: lines.append([w])
        else: lines[-1] = cand
    return lines
def draw(t):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for n, a, b in logs:
        if not (a - 0.05 <= t <= b + 0.12): continue
        words = TEXT[n].split(' '); sx, sy, sl, st, mw, pillc, col, hit = shot(t)
        lines = layout(words, mw); lh = 66; ph = int(len(lines) * lh + 36); pw = int(max(sum(fnt.getlength(x) for x in ln) + 16 * (len(ln) - 1) for ln in lines) + 60)
        x0 = sl; y0 = st
        if sl > 100: x0 = int((W - pw) / 2)
        rr = 40
        shade = Image.new('RGBA', (pw + 20, ph + 20), (0, 0, 0, 0)); ImageDraw.Draw(shade).rounded_rectangle((8, 12, pw + 8, ph + 12), rr, fill=(0, 0, 0, 70)); im.alpha_composite(shade, (x0 - 8, y0 - 8))
        d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), rr, fill=pillc + (238,))
        span = max(0.3, b - a); wl = np.array([max(2, len(w)) for w in words], float); cum = np.cumsum(wl) / wl.sum() * span; cur = int(np.searchsorted(cum, min(max(0, t - a), span - 1e-6), side='right')); cur = min(cur, len(words) - 1) if t >= a else -1
        k = 0
        for li, ln in enumerate(lines):
            tw = sum(fnt.getlength(x) for x in ln) + 16 * (len(ln) - 1); x = x0 + (pw - tw) / 2; y = y0 + 18 + li * lh
            for w in ln:
                ww = fnt.getlength(w)
                if k == cur: d.rounded_rectangle((x - 12, y + 2, x + ww + 12, y + lh - 6), 16, fill=col + (255,)); d.text((x, y + 4), w, font=fnt, fill=hit + (255,))
                else: d.text((x, y + 4), w, font=fnt, fill=(255, 241, 220, 255))
                x += ww + 16; k += 1
    return im
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', f'{D}/caps.mov'], stdin=subprocess.PIPE)
for i in range(360): p.stdin.write(draw(i / FPS).tobytes())
p.stdin.close(); p.wait(); print('caps ok')
