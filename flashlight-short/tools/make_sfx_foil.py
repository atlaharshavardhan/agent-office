"""Quiet foil-build sounds, synthesized (no samples) -> public/sfx/   Usage: python3 tools/make_sfx_foil.py
flap: a light cardboard lift (soft thump + paper scrape) · rustle_pull / rustle_press: crinkly foil · tear: one crisp tear"""
import numpy as np, wave, pathlib
SR = 44100; OUT = pathlib.Path(__file__).resolve().parent.parent / "public/sfx"; OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(11)
def t(d): return np.arange(int(SR * d)) / SR
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def save(name, x, peak):
    x = x / max(1e-9, np.abs(x).max()) * peak
    with wave.open(str(OUT / name), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def crinkle(d, density, seed):
    r = np.random.default_rng(seed); x = np.zeros(int(SR * d))
    n = int(density * d)
    for _ in range(n):
        i = r.integers(0, len(x) - 400); L = r.integers(60, 380)
        x[i:i + L] += r.normal(0, 1, L) * np.exp(-np.arange(L) / (L * 0.25)) * r.uniform(0.2, 1)
    return bp(x, 1800, 11000)
# flap: soft thump and a short scrape
x = t(0.4); thump = np.sin(2 * np.pi * 120 * x) * np.exp(-x * 30)
scrape = bp(rng.normal(0, 1, len(x)), 600, 4000) * np.exp(-((x - 0.08) / 0.06) ** 2)
save("flap.wav", thump * 0.8 + scrape * 0.6, 0.5)
# rustles: crinkle bursts under a slow swell
for name, d, dens, seed in [("rustle_pull.wav", 1.4, 260, 3), ("rustle_press.wav", 1.1, 320, 5)]:
    env = np.sin(np.linspace(0, np.pi, int(SR * d))) ** 0.6
    save(name, (crinkle(d, dens, seed) + bp(np.random.default_rng(seed).normal(0, 0.15, int(SR * d)), 3000, 9000)) * env, 0.45)
# tear: dense crackles, accelerating, then a clean release
d = 0.42; x = t(d); dens = np.zeros_like(x); r = np.random.default_rng(7)
k = 0.0
while k < d - 0.01:
    i = int(k * SR); L = r.integers(40, 160)
    dens[i:i + L] += r.normal(0, 1, min(L, len(x) - i)) * np.exp(-np.arange(min(L, len(x) - i)) / 30)
    k += 0.0045 * (1 - 0.6 * k / d) + r.uniform(0, 0.002)
tear = bp(dens, 2200, 14000) * np.minimum(1, x / 0.02) * np.exp(-np.maximum(0, x - 0.32) * 30)
save("tear.wav", tear, 0.7)
print("ok")
