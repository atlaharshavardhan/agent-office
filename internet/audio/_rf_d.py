"""Part 2: routers + shore (v1). Same recipe as make_part2c_final.py. Run from internet/ after v3/render_part2d.sh and voice/make_part2d_voice.py. Writes video/internet-part2-routers-to-cable-v2.mp4 + subtitles/part2-routers-to-cable-v2.srt"""
import json, subprocess, numpy as np, soundfile as sf
SR = 48000; D = 'video/rf-d'; X = 0.12; FPS = 30
L = json.load(open('voice/p2d/lengths.json'))['lengths']; T = json.load(open('voice/p2d/lengths.json'))['text']
SH = [('rt', 360, ['r1', 'r2']), ('sh', 285, ['r3', 'r4']), ('sb', 294, ['q1', 'q2']), ('rp', 225, ['q3']), ('cb', 450, ['c1', 'c2', 'c3', 'c4'])]; MINK = 0.55; TR = ['fade', 'fade', 'fade', 'fade']; VAT = {'c1': 0.1, 'c2': 3.0, 'c3': 6.5, 'c4': 8.8}; CBK = 0.77  # quick cable-layers clip (Harsh)
dur = {}; vstart = {}
for n, fr, ks in SH:
    t = 0.08
    for k in ks: vstart[k] = t; t += L[k] + 0.12
    dur[n] = max(t - 0.12 + 0.08, MINK * fr / FPS)
    if n == 'cb':
        dur[n] = CBK * fr / FPS
        for k in ks: vstart[k] = VAT[k] * CBK
S = {}; t = 0.0
for n, fr, ks in SH: S[n] = t; t += dur[n] - X
TOTAL = t + X; TRIM = {'cb': 0.2}      # the first frames of the cable-layers shot are a flat blue wash: cut them
k_ = {n: dur[n] / (fr / FPS - TRIM.get(n, 0)) for n, fr, ks in SH}; print('starts', S, 'stretch', {a: round(b, 2) for a, b in k_.items()}, 'total', round(TOTAL, 2))
at = lambda n, tr: S[n] + tr * k_[n]
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
    for k in ks: place(load(f'voice/p2d/{k}.wav'), S[n] + vstart[k], 1.0)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
j = 0
while j * 4.0 < TOTAL:
    n = int(5.0 * SR); tt = np.arange(n) / SR
    for k, m in enumerate(CH[j % 5]): f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3; place(tn * np.minimum(1, tt / 1.4) * np.minimum(1, (5.0 - tt) / 1.4).clip(0), j * 4.0, 0.028, (k - 1.5) * 0.4)
    j += 1
place = lambda *a, **k: None   # Harsh: no sound effects yet
def shutter(): n = int(0.28 * SR); t = np.arange(n) / SR; c1 = rng.normal(0, 1, n) * np.exp(-130 * t) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-110 * t) * 0.4; c2 = np.roll(c1, int(0.07 * SR)) * 0.8; c2[: int(0.07 * SR)] = 0; return c1 + c2
def pop(): n = int(0.18 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-40 * t)) * t) * np.exp(-30 * t) * 0.9
def riser(d=1.0): n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(300 + 1500 * (t / d) ** 2) / SR; return (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.2 * ph)) * (t / d) ** 1.5 * np.minimum(1, (d - t) / 0.05) * 0.45
def whoosh(): n = int(0.45 * SR); t = np.arange(n) / SR; env = np.sin(np.pi * np.clip(t / 0.45, 0, 1)) ** 2; return np.convolve(rng.normal(0, 1, n), np.ones(40) / 40, 'same') * env * 1.2
place(shutter(), S['rt'] + 0.05, 0.3); place(pop(), at('rt', 0.4), 0.4); place(pop(), at('rt', 2.4), 0.4); place(pop(), at('rt', 5.8), 0.4); place(whoosh(), at('rt', 5.0), 0.2)   # router label, destination, hero tag, busy
place(shutter(), S['sh'] - 0.05, 0.3); pass; place(pop(), at('sh', 0.6), 0.4)
place(shutter(), S['sb'] - 0.05, 0.3); place(pop(), at('sb', 0.6), 0.4); pass; place(pop(), at('sb', 3.3), 0.45)
place(shutter(), S['cb'] - 0.05, 0.3); [place(pop(), at('cb', tt), 0.35) for tt in (0.6, 4.8, 7.2, 11.6)]; pass
place(shutter(), S['rp'] - 0.05, 0.3); place(pop(), at('rp', 1.3), 0.4); pass
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.0 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.7 / np.abs(out).max(); sf.write(f'{D}/mix.wav', out[: int(TOTAL * SR)], SR)
ins = []; fc = ''
for i, (n, fr, ks) in enumerate(SH): ins += (['-ss', str(TRIM[n])] if n in TRIM else []) + ['-i', f'{D}/{n}.mp4']; fc += f'[{i}:v]setpts=PTS*{k_[n]:.4f},fps={FPS},tpad=stop_mode=clone:stop_duration=0.2,format=yuv420p[a{i}];'
prev = '[a0]'
for i in range(1, len(SH)):
    o = f'[x{i}]'; fc += f'{prev}[a{i}]xfade=transition={TR[i - 1]}:duration={X}:offset={S[SH[i][0]]:.3f}{o};'; prev = o
fc = f'[{len(SH)}:v]format=rgba,colorchannelmixer=aa=0.3[wm];' + fc + f'{prev}[wm]overlay=24:926[v]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-loop', '1', '-framerate', '30', '-t', f'{TOTAL:.2f}', '-i', 'video/part2v1/mark.png', '-i', f'{D}/mix.wav', '-filter_complex', fc, '-map', '[v]', '-map', f'{len(SH) + 1}:a', '-t', f'{TOTAL:.2f}', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/rf-out/d.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('final', r.returncode, r.stderr[-300:])
def ts(s): return '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), round((s % 1) * 1000))
rows = [(S[n] + vstart[k], L[k], T[k]) for n, fr, ks in SH for k in ks]
pass   # Harsh: no srt until he says
