"""Audio for the 13 s cities scene ("hop by hop"), rebuilt 26 Nov 2026 with no movement sounds at all:
the night theme, the four narration lines, and only small taps and dings (typing, send, arrival, reply).
Writes v3/public/city-mix.wav. Run from internet/. (The old baked file is kept as city-mix-with-whoosh.wav.)"""
import numpy as np, soundfile as sf
SR = 48000; DUR = 13.0; N = int(DUR * SR); out = np.zeros((N, 2))
midi = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 96
def env(n, a=0.005, r=0.2, shape=4.0): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for j in range(int(DUR / 2.5) + 1):
    L = int(2.8 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j % 6]):
        f = midi(m); tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tone * np.minimum(1, tt / 0.6) * np.minimum(1, (2.8 - tt) / 0.5).clip(0), j * 2.5, 0.045, (k - 1.5) * 0.4)
motif = [69, 76, 72, 76, 69, 76, 74, 76, 65, 72, 69, 72, 65, 72, 71, 72]
for i in range(int(DUR / (beat / 2))):
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(motif[i % 16] + 12); place((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5), i * beat / 2, 0.0, 0.35 if i % 2 else -0.35)
for q in range(int(DUR / beat)):
    L = int(0.4 * SR); tt = np.arange(L) / SR; place(np.sin(2 * np.pi * (42 + 70 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 6), q * beat, 0.32)
out *= 0.5
for name, at in [("liam/c1", 0.2), ("liam/c2", 3.3), ("liam/c3", 5.3), ("liam/c4", 8.0)]:
    a, sr = sf.read(f"voice/{name}.wav"); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    i = int(at * SR); n = min(len(a), N - i); pad = int(0.12 * SR); lo, hi = max(0, i - pad), min(N, i + n + pad)
    duck = np.full(hi - lo, 0.5); k = min(pad, (hi - lo) // 2); duck[:k] = np.linspace(1, 0.5, k); duck[-k:] = np.linspace(0.5, 1, k); out[lo:hi] *= duck[:, None]
    out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.92
def blip(at, f0, g=0.07, d=0.05): L = int(d * SR); x = np.arange(L) / SR; place(np.sin(2 * np.pi * f0 * x) * np.minimum(1, x / 0.004) * np.exp(-5 * x / d), at, g * np.sqrt(2))
def ding(at, f0=1318, g=0.18): L = int(0.9 * SR); x = np.arange(L) / SR; place((np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x)) * np.minimum(1, x / 0.004) * np.exp(-6 * x / 0.9), at, g * np.sqrt(2))
for i in range(5): blip(7.9 + i * 0.12, 1900, 0.035, 0.03)   # he types Hello
blip(8.68, 1500, 0.1, 0.07)                                   # he taps send
ding(11.9, 1568, 0.14); ding(12.45, 2093, 0.1)                # it arrives; she replies
out[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/city-mix.wav', out.astype(np.float32), SR); print("length", DUR, "peak", round(float(np.abs(out).max()), 3), "rms", round(float(out.std()), 4))
