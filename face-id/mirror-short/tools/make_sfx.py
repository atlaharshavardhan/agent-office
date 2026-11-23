"""Minimal procedural SFX for the mirror Face ID Short (48 kHz mono WAV, quiet by design)."""
from pathlib import Path
import numpy as np, soundfile as sf
SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"; OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(3)

def lp(x, a):  # one-pole low-pass, a may be an array
    y = np.zeros_like(x); s = 0.0
    a = np.broadcast_to(a, x.shape)
    for i, v in enumerate(x): s += a[i] * (v - s); y[i] = s
    return y

def norm(x, peak):
    return x / (np.abs(x).max() + 1e-9) * peak

# whoosh: noise through a rising low-pass, swelled envelope
n = int(0.45 * SR); t = np.linspace(0, 1, n)
w = lp(rng.normal(size=n), 0.02 + 0.25 * t ** 2) * np.sin(np.pi * t) ** 1.5
sf.write(OUT / "whoosh.wav", norm(w, 0.5), SR)

# dots: a soft shimmer of tiny high ticks spread over 1.2 s
n = int(1.3 * SR); d = np.zeros(n)
for _ in range(90):
    p = int(rng.uniform(0, 1.15) * SR); L = int(0.012 * SR); tt = np.arange(L) / SR
    d[p:p + L] += np.sin(2 * np.pi * rng.uniform(3500, 6500) * tt) * np.exp(-tt * 380) * rng.uniform(0.3, 1)
d *= np.linspace(1, 0.4, n)
sf.write(OUT / "dots.wav", norm(d, 0.22), SR)

# thump: low sine drop for the cut to the real test
n = int(0.5 * SR); tt = np.arange(n) / SR
th = np.sin(2 * np.pi * (70 * tt - 25 * tt ** 2)) * np.exp(-tt * 9)
sf.write(OUT / "thump.wav", norm(th, 0.55), SR)
print("ok")
