"""Part 2 video, from the phone to the glass cable: mix (free Michael voice + soft sounds), join of the rendered shots with 0.2 s fades, watermark, SRT.
Run from internet/ after v3/render_part2b.sh (shots in video/part2b/) and voice/make_part2b_voice.py. Writes video/internet-part2-phone-to-cable-v1.mp4 and subtitles/part2-phone-to-cable-v1.srt"""
import json, subprocess, numpy as np, soundfile as sf
SR = 48000; D = 'video/part2b'; X = 0.2
SH = [('s1', 160, None), ('s2', 90, None), ('s3', 82, None), ('s4', 90, None), ('s5', 88, None), ('s6', 108, None), ('pa', 120, 96), ('pb', 240, None), ('tw', 190, None), ('ug', 270, None)]
dur = [(n, (cut or fr) / 30) for n, fr, cut in SH]; start = []; t = 0.0
for n, d in dur: start.append(t); t += d - X
TOTAL = start[-1] + dur[-1][1]; S = dict(zip([n for n, _ in dur], start)); print('starts', {k: round(v, 2) for k, v in S.items()}, 'total', round(TOTAL, 2))
V = {'s1': 0.3, 's2': S['s2'] + 0.2, 's3': S['s3'] + 0.2, 's4': S['s4'] + 0.2, 's5': S['s5'] + 0.2, 's6': S['s6'] + 0.2, 'p1': S['pa'] + 0.2, 'p2': S['pb'] + 0.2, 'p3': S['tw'] + 0.2, 'p4': S['tw'] + 3.3, 'p5': S['ug'] + 1.0}
L = json.load(open('voice/p2b/lengths.json'))['lengths']
N = int(TOTAL * SR) + SR; out = np.zeros((N, 2)); rng = np.random.default_rng(5)
def place(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def load(f):
    a, sr = sf.read(f); a = a if a.ndim == 1 else a.mean(1)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a)
    return a
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    n = int(d * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + h * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / a) * np.exp(-sh * t / r)
def tick(): n = int(0.05 * SR); t = np.arange(n) / SR; return (rng.normal(0, 1, n) * np.exp(-90 * t) * 0.5 + np.sin(2 * np.pi * 1500 * t) * np.exp(-60 * t)) * 0.6
for k, at in V.items(): place(load(f'voice/p2b/{k}.wav'), at, 1.0)
# a very soft pad under everything (no repeating notes)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
j = 0
while j * 4.0 < TOTAL:
    n = int(5.0 * SR); tt = np.arange(n) / SR
    for k, m in enumerate(CH[j % 5]): f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3; place(tn * np.minimum(1, tt / 1.4) * np.minimum(1, (5.0 - tt) / 1.4).clip(0), j * 4.0, 0.028, (k - 1.5) * 0.4)
    j += 1
# ---- sounds follow Harsh's list (For this -> use this): Hooks=Bass Impact, Zoom In=Quick Whoosh, Transitions=Camera Shutter, Text popping up=Soft Pop, Captions=Keyboard Typing, Reveals=Metallic Riser, CTA=Bell Ding (not in this part) ----
def bass(): n = int(1.2 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (46 + 40 * np.exp(-14 * t)) * t) * np.exp(-3.2 * t) * 1.1 + rng.normal(0, 1, n) * np.exp(-60 * t) * 0.15
def whoosh(): n = int(0.55 * SR); t = np.arange(n) / SR; x = rng.normal(0, 1, n); k = np.hanning(int(0.0009 * SR) * 2 + 1) if False else None; env = np.sin(np.pi * np.clip(t / 0.55, 0, 1)) ** 2; lp = np.cumsum(x) ; y = np.convolve(x, np.ones(40) / 40, 'same') * env; return y * 1.2
def shutter(): n = int(0.28 * SR); t = np.arange(n) / SR; c1 = rng.normal(0, 1, n) * np.exp(-130 * t) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-110 * t) * 0.4; c2 = np.roll(c1, int(0.07 * SR)) * 0.8; c2[: int(0.07 * SR)] = 0; return c1 + c2
def pop(): n = int(0.18 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-40 * t)) * t) * np.exp(-30 * t) * 0.9
def typing(k=8, gap=0.075): o = np.zeros(int((k * gap + 0.1) * SR)); [o.__setitem__(slice(int(i * gap * SR), int(i * gap * SR) + int(0.03 * SR)), o[int(i * gap * SR): int(i * gap * SR) + int(0.03 * SR)] + (rng.normal(0, 1, int(0.03 * SR)) * np.exp(-150 * np.arange(int(0.03 * SR)) / SR) * 0.5 + np.sin(2 * np.pi * (1100 + 120 * (i % 3)) * np.arange(int(0.03 * SR)) / SR) * np.exp(-120 * np.arange(int(0.03 * SR)) / SR) * 0.5)) for i in range(k)]; return o
def riser(d=1.3): n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(300 + 1500 * (t / d) ** 2) / SR; return (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.2 * ph)) * (t / d) ** 1.5 * np.minimum(1, (d - t) / 0.05) * 0.45
place(bass(), S['s1'] + 0.05, 0.55)                                                    # HOOK: bass impact as the story starts
place(whoosh(), S['s1'] + 2.0, 0.25)                                                   # ZOOM IN to the phone: quick whoosh
place(pop(), S['s1'] + 1.3, 0.4)                                                       # the tap on send: soft pop
for n in ('s2', 's3', 's4', 's5', 's6', 'pa', 'pb', 'tw', 'ug'): place(shutter(), S[n] - 0.1, 0.3)   # TRANSITIONS: camera shutter on each cut
place(bass(), S['s5'] + 1.1, 0.5)                                                      # the lock closes: bass impact
place(pop(), S['s6'] + 1.7, 0.45)                                                      # "NOTHING TO SEE" pops up
place(riser(), S['pa'] - 0.9, 0.35); place(pop(), S['pa'] + 0.6, 0.4)                  # REVEAL: the 2,000 packets (riser, then the number pops)
place(typing(10), S['pb'] + 1.8, 0.35); place(typing(10), S['pb'] + 2.4, 0.3)          # the address types in (From, To)
place(pop(), S['pb'] + 1.4, 0.45); place(riser(1.0), S['pb'] + 3.3, 0.3); place(pop(), S['pb'] + 4.4, 0.4)   # #1204 pops, riser into the label card
place(whoosh(), S['tw'] + 3.0, 0.22)                                                   # camera rises to the antennas
place(pop(), S['tw'] + 0.3, 0.4)                                                       # "Mobile tower" label pops
place(riser(1.2), S['ug'] - 0.7, 0.3)                                                  # REVEAL: the light enters the cable
place(load('video/part2hook12/cable-one-soft.wav'), S['ug'] + 1.0, 0.8)
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.0 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.7 / np.abs(out).max(); sf.write(f'{D}/mix.wav', out[: int(TOTAL * SR)], SR)
# join the shots with 0.2 s fades
ins = []
for n, fr, cut in SH: ins += ['-i', f'{D}/{n}.mp4']
fc = ''; prev = '[0:v]'; off = 0.0
for i in range(1, len(SH)):
    off = start[i] ; o = f'[x{i}]'; fc += f'{prev}[{i}:v]xfade=transition=fade:duration={X}:offset={off - X:.3f}{o};'; prev = o
fc += f'{prev}[{len(SH)}:v]overlay=24:926[v]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins[:] + ['-loop', '1', '-framerate', '30', '-t', f'{TOTAL:.2f}', '-i', 'video/part2v1/mark.png', '-i', f'{D}/mix.wav']
# the watermark must be 30% see-through: prepare it as input before the chain
fc = fc.replace(f'[{len(SH)}:v]overlay', f'[wm]overlay'); fc = f'[{len(SH)}:v]format=rgba,colorchannelmixer=aa=0.3[wm];' + fc
cmd += ['-filter_complex', fc, '-map', '[v]', '-map', f'{len(SH) + 1}:a', '-t', f'{TOTAL:.2f}', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-phone-to-cable-v1.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('final', r.returncode, r.stderr[-300:])
def ts(s): return '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), round((s % 1) * 1000))
T = json.load(open('voice/p2b/lengths.json'))['text']
open('subtitles/part2-phone-to-cable-v1.srt', 'w').write('\n'.join(f'{i + 1}\n{ts(V[k])} --> {ts(V[k] + L[k])}\n{T[k]}\n' for i, k in enumerate(V)))
