"""Part 2: routers + shore (v1). Same recipe as make_part2c_final.py. Run from internet/ after v3/render_part2d.sh and voice/make_part2d_voice.py. Writes video/internet-part2-landing-end-v1.mp4 + subtitles/part2-landing-end-v1.srt"""
import json, subprocess, numpy as np, soundfile as sf
SR = 48000; D = 'video/part2p'; X = 0.15; FPS = 30
L = json.load(open('voice/p2d/lengths.json'))['lengths']; T = json.load(open('voice/p2d/lengths.json'))['text']
SH = [('tw', 190, ['h1']), ('nt', 90, ['h2']), ('ar', 420, ['a1', 'a2', 'm1', 'a3', 'a4']), ('en', 165, ['e1', 'e2', 'e3'])]; MINK = 1.0; TR = []; VATS = {'ar': {'a1': 0.5, 'a2': 2.7, 'm1': 5.1, 'a3': 7.9, 'a4': 10.4}, 'en': {'e1': 0.3, 'e2': 2.3, 'e3': 4.6}}; CBK = 1.0
dur = {}; vstart = {}
for n, fr, ks in SH:
    t = 0.2
    for k in ks: vstart[k] = t; t += L[k] + 0.12
    dur[n] = max(t - 0.12 + 0.22, MINK * fr / FPS)
    if n in VATS:
        dur[n] = fr / FPS
        for k in ks: vstart[k] = VATS[n][k]
S = {}; t = 0.0
for n, fr, ks in SH: S[n] = t; t += dur[n] - X
TOTAL = t + X; k_ = {n: dur[n] / (fr / FPS) for n, fr, ks in SH}; print('starts', S, 'stretch', {a: round(b, 2) for a, b in k_.items()}, 'total', round(TOTAL, 2))
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
def shutter(): n = int(0.28 * SR); t = np.arange(n) / SR; c1 = rng.normal(0, 1, n) * np.exp(-130 * t) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-110 * t) * 0.4; c2 = np.roll(c1, int(0.07 * SR)) * 0.8; c2[: int(0.07 * SR)] = 0; return c1 + c2
def pop(): n = int(0.18 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-40 * t)) * t) * np.exp(-30 * t) * 0.9
def riser(d=1.0): n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(300 + 1500 * (t / d) ** 2) / SR; return (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.2 * ph)) * (t / d) ** 1.5 * np.minimum(1, (d - t) / 0.05) * 0.45
def whoosh(): n = int(0.45 * SR); t = np.arange(n) / SR; env = np.sin(np.pi * np.clip(t / 0.45, 0, 1)) ** 2; return np.convolve(rng.normal(0, 1, n), np.ones(40) / 40, 'same') * env * 1.2
for n in ('nt', 'ar', 'en'): place(shutter(), S[n] - 0.05, 0.3)
place(pop(), S['tw'] + 0.4, 0.4); place(whoosh(), at('tw', 2.0), 0.2)                                  # her tower
def buzz():
    o = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); tt = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * tt) + 0.5 * np.sin(4 * np.pi * 150 * tt)) * np.minimum(1, tt / 0.01) * np.minimum(1, (0.22 - tt) / 0.03); o[int(k * 0.3 * SR): int(k * 0.3 * SR) + L] += s * 0.5
    return o
def ding(): return tone(1318, 0.9, 0.003, 0.5, 5, 0.25) + 0.7 * tone(1760, 0.9, 0.003, 0.5, 5, 0.2)
place(buzz(), S['nt'] + 0.3, 0.22); place(ding(), S['nt'] + 0.6, 0.16)                                  # her phone: buzz and ding (kept from the hook)
[place(pop(), at('ar', 6.6 + k * 0.2), 0.35) for k in range(3)]; place(pop(), at('ar', 7.9), 0.45); place(pop(), at('ar', 10.5), 0.5)   # arrival
place(pop(), at('en', 0.3), 0.4); place(pop(), at('en', 2.3), 0.4); place(ding(), at('en', 4.7), 0.22)  # the bell ding on the follow
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.0 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.7 / np.abs(out).max(); sf.write(f'{D}/mix.wav', out[: int(TOTAL * SR)], SR)
ins = []; fc = ''
for i, (n, fr, ks) in enumerate(SH): ins += ['-i', f'{D}/{n}.mp4']; fc += f'[{i}:v]setpts=PTS*{k_[n]:.4f},fps={FPS},format=yuv420p[a{i}];'
prev = '[a0]'
fc = f'[{len(SH)}:v]format=rgba,colorchannelmixer=aa=0.3[wm];' + fc + f'{prev}[wm]overlay=24:926[v]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-loop', '1', '-framerate', '30', '-t', f'{TOTAL:.2f}', '-i', 'video/part2v1/mark.png', '-i', f'{D}/mix.wav', '-filter_complex', fc, '-map', '[v]', '-map', f'{len(SH) + 1}:a', '-t', f'{TOTAL:.2f}', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-landing-end-v1.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('final', r.returncode, r.stderr[-300:])
def ts(s): return '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), round((s % 1) * 1000))
rows = [(S[n] + vstart[k], L[k], T[k]) for n, fr, ks in SH for k in ks]
(lambda *a: None)('\n'.join(f'{i + 1}\n{ts(a)} --> {ts(a + d)}\n{x}\n' for i, (a, d, x) in enumerate(rows)))
