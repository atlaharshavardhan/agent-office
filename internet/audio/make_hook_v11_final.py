"""Hook v10, step 2: the mix (Michael's three sentences + the existing sounds), the captions in the approved style, and the final join with the camera pass. Writes video/internet-part2-hook-v11.mp4.
Existing sounds kept: the tap, the glass break, the one soft cable tone, the phone buzz and ding, the notification chime. Run from internet/ after make_hook_v8.py."""
import json, subprocess, numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
D = 'video/part2hook11'; SR = 48000; W, H, FPS = 1080, 1920, 30; TL = json.load(open(f'{D}/timeline.json')); N = 12 * SR; out = np.zeros((N, 2)); rng = np.random.default_rng(7)
def place(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    L = int(d * SR); t = np.arange(L) / SR; return (np.sin(2 * np.pi * f * t) + h * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / a) * np.exp(-sh * t / r)
def tick(): L = int(0.05 * SR); t = np.arange(L) / SR; return (rng.normal(0, 1, L) * np.exp(-90 * t) * 0.5 + np.sin(2 * np.pi * 1500 * t) * np.exp(-60 * t)) * 0.6
def buzz():
    o = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); t = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * t) + 0.5 * np.sin(2 * np.pi * 300 * t) + 0.25 * np.sign(np.sin(2 * np.pi * 150 * t))) * np.minimum(1, t / 0.01) * np.minimum(1, (0.22 - t) / 0.03); o[int(k * 0.3 * SR): int(k * 0.3 * SR) + L] += s * 0.5
    return o
def load(f):
    a, sr = sf.read(f); a = a if a.ndim == 1 else a.mean(1)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a)
    return a
for n, at in TL['V'].items(): place(load(f'voice/p2v9/{n}.wav'), at, 1.0)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
for j in range(5):
    L = int(4.4 * SR); t = np.arange(L) / SR
    for k, m in enumerate(CH[j]): f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * t) for d in (-0.003, 0, 0.003)) / 3; place(tn * np.minimum(1, t / 1.2) * np.minimum(1, (4.4 - t) / 1.2).clip(0), j * 3.0, 0.03, (k - 1.5) * 0.4)
place(tick(), 0.67, 0.5); g = load('audio/sfx-glass.wav')[: int(0.7 * SR)].copy(); g *= np.minimum(1, (0.7 * SR - np.arange(len(g))) / (0.25 * SR)).clip(0); place(g, 1.27, 0.8)   # Harsh: the glass sound was too long, now 0.7 s                         # his tap, then the window breaks
pass                           # the one soft tone for the light in the cable
ring = TL['T_HYD'] + 0.1; place(buzz(), ring, 0.22, -0.2); place(tone(1318, 0.9, 0.003, 0.5, 5, 0.25) + 0.7 * tone(1760, 0.9, 0.003, 0.5, 5, 0.2), ring, 0.16, 0.2)    # her phone
place(tone(880, 1.1, 0.004, 0.6, 5, 0.2), TL['T_LON'] + 0.35, 0.12); place(tone(1318, 1.1, 0.004, 0.7, 5, 0.2), TL['T_LON'] + 0.5, 0.09)                           # the notification chime
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.8 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.7 / np.abs(out).max(); sf.write(f'{D}/mix.wav', out, SR)
# ---- captions: the approved pill style, in the free space of each shot ----
fnt = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', 50)
PLUM = (42, 22, 48); NIGHT = (16, 20, 48); BROWN = (58, 28, 30)
# only the key moments get a caption (Harsh); the whole narration is in internet/subtitles/part2-hook-v10.srt
CAP = [('across an entire ocean,', 6.2, 7.85, None, 1290, 700, NIGHT, (255, 190, 90), NIGHT), ('in the blink of an eye?', 9.7, 12.0, None, 1290, 700, PLUM, (255, 180, 84), PLUM)]
e3 = 12.0
# CENTRED captions (Harsh): the free wall strip above the desk in the first second, otherwise the bottom band (y 1290), on the objects when there is no free space
def lay(words, maxw):
    lines = [[]]
    for w in words:
        c = lines[-1] + [w]
        if sum(fnt.getlength(x) for x in c) + 16 * (len(c) - 1) > maxw - 60 and lines[-1]: lines.append([w])
        else: lines[-1] = c
    return lines
def cap_frame(t):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for text, a, b, x, y, mw, pc, hc, ht in CAP:
        if not (a - 0.04 <= t <= b + 0.06): continue
        
        words = text.split(' '); lines = lay(words, mw); lh = 68; ph = int(len(lines) * lh + 36); pw = int(max(sum(fnt.getlength(q) for q in ln) + 16 * (len(ln) - 1) for ln in lines) + 60); x0 = x if x is not None else int((W - pw) / 2)
        x0 = min(x0, 940 - pw)                                                                                              # stay inside the Shorts and Reels safe margin on the right
        sh = Image.new('RGBA', (pw + 24, ph + 24), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((8, 12, pw + 8, ph + 12), 40, fill=(0, 0, 0, 90)); im.alpha_composite(sh, (x0 - 8, y - 8))
        d.rounded_rectangle((x0, y, x0 + pw, y + ph), 40, fill=pc + (246,), outline=(255, 241, 220, 60), width=2)
        span = max(0.3, b - a); wl = np.array([max(2, len(w)) for w in words], float); cum = np.cumsum(wl) / wl.sum() * span; cur = min(len(words) - 1, int(np.searchsorted(cum, min(max(0, t - a), span - 1e-6), side='right'))) if t >= a else -1; k = 0
        for li, ln in enumerate(lines):
            tw = sum(fnt.getlength(q) for q in ln) + 16 * (len(ln) - 1); xx = x0 + (pw - tw) / 2; yy = y + 18 + li * lh
            for w in ln:
                ww = fnt.getlength(w)
                if k == cur: d.rounded_rectangle((xx - 12, yy + 2, xx + ww + 12, yy + lh - 6), 16, fill=hc + (255,)); d.text((xx, yy + 4), w, font=fnt, fill=ht + (255,))
                else: d.text((xx, yy + 4), w, font=fnt, fill=(255, 244, 226, 255), stroke_width=0)
                xx += ww + 16; k += 1
    return im
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', f'{D}/caps.mov'], stdin=subprocess.PIPE)
for i in range(360): p.stdin.write(cap_frame(i / FPS).tobytes())
p.stdin.close(); p.wait()
r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/camera.mp4', '-i', f'{D}/caps.mov', '-loop', '1', '-framerate', '30', '-t', '12', '-i', 'video/part2v1/mark.png', '-i', f'{D}/mix.wav',
    '-filter_complex', '[2:v]format=rgba,colorchannelmixer=aa=0.3[m];[0:v][m]overlay=x=24:y=926[a];[a][1:v]overlay=0:0[v]', '-map', '[v]', '-map', '3:a', '-t', '12', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-hook-v11.mp4'], capture_output=True, text=True)
print('final', r.returncode, r.stderr[-200:])
