"""Part 2 v6 sound: the continuous narration + the soft pad (no sound effects). Run after audio/p2v6_timeline.py. Writes v3/public/p2v6/audio.wav (starts at the very beginning of the video; silent during the hook, which carries its own sound)."""
import json, numpy as np, soundfile as sf
SR = 48000; T = json.load(open('video/rf6/timeline.json')); NA = T['NA']; TOTAL = T['TOTAL']
N = int((TOTAL + 1) * SR); out = np.zeros((N, 2))
def place(sig, a, g=1.0, pan=0.0):
    i = int(a * SR); j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def load(f):
    a, sr = sf.read(f); a = a if a.ndim == 1 else a.mean(1)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a)
    return a
voice = np.zeros((N, 2)); vo = out
for n, st in T['START'].items(): place(load(f'voice/p2v6/{n}.wav'), NA + st, 1.0)
voice = out.copy(); out[:] = 0
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
j = 0
while NA + j * 4.0 < TOTAL:
    n = int(5.0 * SR); tt = np.arange(n) / SR
    for k, m in enumerate(CH[j % 5]): f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3; place(tn * np.minimum(1, tt / 1.4) * np.minimum(1, (5.0 - tt) / 1.4).clip(0), NA + j * 4.0, 0.028, (k - 1.5) * 0.4)
    j += 1
pad = out.copy(); mix = voice + pad
f = np.minimum(1, (np.arange(N) / SR - NA + 0.3).clip(0) / 0.6) * np.minimum(1, (TOTAL - np.arange(N) / SR) / 1.2).clip(0)
mix = np.tanh(mix * 1.2) / 1.2; mix *= 0.7 / np.abs(mix).max(); mix *= np.where(np.arange(N) / SR < NA - 0.1, 0.0, 1.0)[:, None]
mix *= np.minimum(1, (TOTAL - np.arange(N) / SR) / 1.2).clip(0)[:, None]
sf.write('v3/public/p2v6/audio.wav', mix[: int(TOTAL * SR)], SR); print('audio ok', round(TOTAL, 2))
