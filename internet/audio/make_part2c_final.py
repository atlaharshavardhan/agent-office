"""Part 2, phone to glass cable, v2 (Harsh: faster, free packet motion, better transitions). Every shot is stretched to fit its voice; transitions are camera-shutter flashes, zoom-throughs and a radial wipe.
Run from internet/ after v3/render_part2c.sh (shots in video/part2c/) and voice/make_part2c_voice.py. Writes video/internet-part2-phone-to-cable-v4.mp4 + subtitles/part2-phone-to-cable-v4.srt"""
import json, subprocess, numpy as np, soundfile as sf
SR = 48000; D = 'video/part2c'; X = 0.15; FPS = 30
L = json.load(open('voice/p2c/lengths.json'))['lengths']; T = json.load(open('voice/p2c/lengths.json'))['text']
# (shot, rendered frames, [voice keys in order])
SH = [('s1', 106, ['s1']), ('s2', 59, ['s2']), ('s4', 59, ['s3']), ('s5', 58, ['s5']), ('s6', 71, ['s6']), ('pa', 270, ['o1', 'p1', 'p2']), ('tw', 190, ['p3', 'p4']), ('ug', 270, ['p5', 'o2'])]
TR = ['fadewhite', 'zoomin', 'radial', 'fadewhite', 'zoomin', 'fadewhite', 'zoomin']
dur = {}; vstart = {}
for n, fr, ks in SH:
    d = 0.2 + sum(L[k] for k in ks) + 0.12 * (len(ks) - 1) + 0.22; dur[n] = max(d, 1.4)
    t = 0.2
    for k in ks: vstart[k] = t; t += L[k] + 0.12
S = {}; t = 0.0
for n, fr, ks in SH: S[n] = t; t += dur[n] - X
TOTAL = t + X; k_ = {n: dur[n] / (fr / FPS) for n, fr, ks in SH}
print('starts', {a: round(b, 2) for a, b in S.items()}, 'stretch', {a: round(b, 2) for a, b in k_.items()}, 'total', round(TOTAL, 2))
at = lambda n, tr: S[n] + tr * k_[n]          # a moment of the rendered shot (seconds in the render) -> final time
N = int(TOTAL * SR) + SR; out = np.zeros((N, 2)); rng = np.random.default_rng(5)
def place(sig, a, g=1.0, pan=0.0):
    i = int(a * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def load(f):
    a, sr = sf.read(f); a = a if a.ndim == 1 else a.mean(1)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a)
    return a
for n, fr, ks in SH:
    for k in ks: place(load(f'voice/p2c/{k}.wav'), S[n] + vstart[k], 1.0)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
j = 0
while j * 4.0 < TOTAL:
    n = int(5.0 * SR); tt = np.arange(n) / SR
    for k, m in enumerate(CH[j % 5]): f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3; place(tn * np.minimum(1, tt / 1.4) * np.minimum(1, (5.0 - tt) / 1.4).clip(0), j * 4.0, 0.028, (k - 1.5) * 0.4)
    j += 1
def bass(): n = int(1.0 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (46 + 40 * np.exp(-14 * t)) * t) * np.exp(-3.4 * t) * 1.1 + rng.normal(0, 1, n) * np.exp(-60 * t) * 0.15
def whoosh(): n = int(0.45 * SR); t = np.arange(n) / SR; env = np.sin(np.pi * np.clip(t / 0.45, 0, 1)) ** 2; return np.convolve(rng.normal(0, 1, n), np.ones(40) / 40, 'same') * env * 1.2
def shutter(): n = int(0.28 * SR); t = np.arange(n) / SR; c1 = rng.normal(0, 1, n) * np.exp(-130 * t) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-110 * t) * 0.4; c2 = np.roll(c1, int(0.07 * SR)) * 0.8; c2[: int(0.07 * SR)] = 0; return c1 + c2
def pop(): n = int(0.18 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-40 * t)) * t) * np.exp(-30 * t) * 0.9
def typing(k=8, gap=0.06):
    o = np.zeros(int((k * gap + 0.1) * SR)); m = int(0.03 * SR); tt = np.arange(m) / SR
    for i in range(k): a0 = int(i * gap * SR); o[a0: a0 + m] += rng.normal(0, 1, m) * np.exp(-150 * tt) * 0.5 + np.sin(2 * np.pi * (1100 + 120 * (i % 3)) * tt) * np.exp(-120 * tt) * 0.5
    return o
def riser(d=1.0): n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(300 + 1500 * (t / d) ** 2) / SR; return (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.2 * ph)) * (t / d) ** 1.5 * np.minimum(1, (d - t) / 0.05) * 0.45
place(bass(), S['s1'] + 0.05, 0.55); place(pop(), at('s1', 0.8), 0.4); place(whoosh(), at('s1', 1.3), 0.25)
for n in [x[0] for x in SH][1:]: place(shutter(), S[n] - 0.05, 0.3)
place(bass(), at('s5', 0.75), 0.5); place(pop(), at('s6', 1.1), 0.45)
place(riser(0.8), S['pa'] - 0.6, 0.35); place(pop(), at('pa', 0.6), 0.4)
place(riser(0.7), at('pa', 3.9), 0.3); place(pop(), at('pa', 5.0), 0.45); place(typing(8), at('pa', 5.9), 0.3); place(typing(8), at('pa', 6.6), 0.3); place(typing(8), at('pa', 7.3), 0.3)
place(pop(), S['tw'] + 0.2, 0.4); place(whoosh(), at('tw', 2.0), 0.22)
place(riser(1.0), S['ug'] - 0.5, 0.3); place(load('video/part2hook12/cable-one-soft.wav'), S['ug'] + 0.6, 0.8)
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.0 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.7 / np.abs(out).max(); sf.write(f'{D}/mix.wav', out[: int(TOTAL * SR)], SR)
ins = []; fc = ''
for i, (n, fr, ks) in enumerate(SH):
    ins += ['-i', f'{D}/{n}.mp4']; fc += f'[{i}:v]setpts=PTS*{k_[n]:.4f},fps={FPS},format=yuv420p[a{i}];'
prev = '[a0]'
for i in range(1, len(SH)):
    o = f'[x{i}]'; fc += f'{prev}[a{i}]xfade=transition={TR[i - 1]}:duration={X}:offset={S[SH[i][0]]:.3f}{o};'; prev = o
fc = f'[{len(SH)}:v]format=rgba,colorchannelmixer=aa=0.3[wm];' + fc + f'{prev}[wm]overlay=24:926[v]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-loop', '1', '-framerate', '30', '-t', f'{TOTAL:.2f}', '-i', 'video/part2v1/mark.png', '-i', f'{D}/mix.wav', '-filter_complex', fc, '-map', '[v]', '-map', f'{len(SH) + 1}:a', '-t', f'{TOTAL:.2f}', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-phone-to-cable-v4.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('final', r.returncode, r.stderr[-300:])
def ts(s): return '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), round((s % 1) * 1000))
rows = [(S[n] + vstart[k], L[k], T[k]) for n, fr, ks in SH for k in ks]
open('subtitles/part2-phone-to-cable-v4.srt', 'w').write('\n'.join(f'{i + 1}\n{ts(a)} --> {ts(a + d)}\n{x}\n' for i, (a, d, x) in enumerate(rows)))
