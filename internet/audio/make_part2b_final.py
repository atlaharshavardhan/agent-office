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
place(tick(), S['s1'] + 1.3, 0.5)                                                    # the tap on send
place(tone(220, 0.5, 0.004, 0.5, 6, 0.3) * 0.8, S['s5'] + 1.3, 0.22)                 # the lock closing: one soft low knock
place(tone(1318, 0.9, 0.003, 0.5, 5, 0.25), S['pa'] + 0.3, 0.08)                      # packets arrive
place(tone(660, 1.2, 0.01, 0.9, 4, 0.2), S['tw'] + 0.2, 0.09)                          # radio waves: one soft tone
place(load('video/part2hook12/cable-one-soft.wav'), S['ug'] + 1.0, 0.9)                # the light enters the cable
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
