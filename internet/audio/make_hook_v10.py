"""Part 2 hook v8 (Harsh, 28 Nov 2026): the v5-free scenes are NOT redesigned. Only the camera (zoom and pan over the existing rendered shots), the transition timing and the narration change.
One uninterrupted camera journey: push-in to his phone -> accelerate through the window break -> pull out to Earth -> glance at the satellite -> whip to the ocean -> forward tracking along the cable -> glide to London -> push-in on her notification.
Narration = Michael (free voice), three sentences; every camera move is timed to its words. The existing sounds (tap, glass, soft cable tone, buzz and ding, notification chime) are kept.
Writes video/part2hook8/*.  Run from internet/ after voice/make_hook_v8_voice.py."""
import json, subprocess, os, numpy as np, soundfile as sf
from PIL import Image
W, H, FPS = 1080, 1920, 30; SRC = 'video/part2hook12k'; D = 'video/part2hook10'; os.makedirs(D, exist_ok=True); SR = 48000
# ---- timeline: Harsh's 6-line table (voice/p2v9) ----
Ld = json.load(open('voice/p2v9/lengths.json'))['lengths']
V = {'w1': 0.10, 'w2': 1.60, 'w3': 4.70, 'w5': 6.20, 'w4': 8.00, 'w6': 9.70}   # light in the cable now comes before the globe (Harsh)
T_HYD = 1.70                           # his room ends as the window breaks; then London
T_LON = 2.60                           # her room glide ends, the phone notification begins
T_GS = 6.90                            # the short cable shot ends, the globe starts
T_CAB = 12.0
e1 = T_HYD
print('timeline', V, dict(T_HYD=T_HYD, T_LON=T_LON, T_GS=T_GS))
sm = lambda x: x * x * (3 - 2 * x); cl = lambda x: max(0.0, min(1.0, x)); acc = lambda x: x ** 2.6
def kf(keys, t):  # keys: [(t, z, fx, fy, ease)] -> (z, fx, fy) with the ease of the segment's end key
    if t <= keys[0][0]: return keys[0][1:4]
    for a, b in zip(keys, keys[1:]):
        if t <= b[0]:
            u = (t - a[0]) / max(1e-6, b[0] - a[0]); u = {'s': sm(u), 'a': acc(u), 'l': u}[b[4]]
            return tuple(a[i] + (b[i] - a[i]) * u for i in (1, 2, 3))
    return keys[-1][1:4]
# camera: z = zoom, (fx, fy) = the point in the 1080x1920 picture the camera looks at
CAM = {
 'hyd': [(0, 1.0, 540, 960, 's'), (0.8, 1.14, 560, 1250, 's'), (1.2, 1.2, 620, 900, 's'), (T_HYD, 2.4, 741, 330, 'a')],
 'lon': [(0, 1.6, 780, 520, 's'), (0.25, 1.0, 560, 900, 's'), (T_LON - T_HYD, 1.12, 620, 1250, 's')],
 'nt':  [(0, 1.12, 560, 1180, 's'), (1.0, 1.28, 540, 1130, 's'), (2.1, 1.42, 540, 1110, 's')],
 'cab': [(0, 2.2, 540, 1000, 's'), (0.45, 1.0, 540, 960, 's'), (T_GS - 4.5, 1.25, 600, 900, 'a')],
 'gs':  [(0, 2.2, 900, 1100, 's'), (1.3, 1.0, 540, 960, 's'), (12 - 6.7, 1.1, 540, 900, 's')],
}
SHOTS = [('hyd', 0.0, T_HYD, 'hyd.mp4', 90, 8), ('lon', T_HYD - 0.2, T_LON, 'lon.mp4', 30, 0), ('nt', T_LON - 0.15, 4.7, 'nt.mp4', 60, 0), ('cab', 4.5, T_GS, 'sl.mp4', 120, 0), ('gs', 6.7, 12.0, 'gs.mp4', 135, 0)]
class Src:
    def __init__(s, f, n): s.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f'{SRC}/{f}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE); s.n = n; s.i = -1; s.cur = None
    def get(s, idx):
        idx = max(0, min(s.n - 1, idx))
        while s.i < idx:
            b = s.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            s.cur = Image.frombytes('RGB', (W, H), b); s.i += 1
        return s.cur
def view(img, z, fx, fy):
    cw, ch = W / z, H / z; x0 = min(max(0, fx - cw / 2), W - cw); y0 = min(max(0, fy - ch / 2), H - ch)
    return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', f'{D}/camera.mp4'], stdin=subprocess.PIPE)
srcs = {n: Src(f, k) for n, a, b, f, k, h in SHOTS}
NOM = {'hyd': 0.0, 'lon': T_HYD, 'nt': T_LON, 'gs': 6.7, 'cab': 4.5}          # where each shot nominally starts (the camera keys are relative to this); the crossfade starts 0.2 s earlier
def frame_of(name, t):
    n, a, b, f, k, hold = next(s for s in SHOTS if s[0] == name); loc = t - NOM[name]
    if name == 'hyd': idx = int(round(max(0, loc * FPS - hold)))                                  # real time, after a short hold on the first frame (the push-in towards his phone)
    elif name in ('gs', 'cab'): idx = int(round(max(0.0, loc) / (b - NOM[name]) * (k - 1)))      # the shot is stretched a little to fill its words
    else: idx = int(round(max(0, loc * FPS)))
    z, fx, fy = kf(CAM[name], loc); return view(srcs[name].get(idx), z, fx, fy)
for i in range(360):
    t = i / FPS; vis = [s for s in SHOTS if s[1] - 1e-6 <= t <= s[2] + 1e-6] or [SHOTS[-1]]
    if len(vis) == 1: out = np.asarray(frame_of(vis[0][0], t))
    else:
        o, n = vis[0], vis[1]; u = sm(cl((t - n[1]) / max(1e-6, o[2] - n[1])))
        out = (np.asarray(frame_of(o[0], t)).astype(np.float32) * (1 - u) + np.asarray(frame_of(n[0], t)).astype(np.float32) * u).astype(np.uint8)
    enc.stdin.write(out.tobytes())
enc.stdin.close(); enc.wait(); print('camera ok')
json.dump({'V': V, 'T_HYD': T_HYD, 'T_LON': T_LON, 'T_GS': T_GS}, open(f'{D}/timeline.json', 'w'))
