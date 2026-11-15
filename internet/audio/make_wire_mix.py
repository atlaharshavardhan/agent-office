"""Wire scene audio (7.4 s, follows the 15.6 s hook): music bed continues, voice p5, p6, p6b, and code-made effects.
Writes v3/public/full-mix.wav = hook-mix + wire part."""
import numpy as np, soundfile as sf
SR = 48000; N = int(22.4 * SR); rng = np.random.default_rng(7)   # wire scene 7.4 s + step 2 15 s
bed, _ = sf.read('audio/bed.wav'); out = bed[int(15.6 * SR):int(15.6 * SR) + N] * 0.56
def put(sig, at, g=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if sig.ndim == 1: sig = np.stack([sig, sig], 1)
    out[i:i + n] += sig[:n] * g
def voice(name, at):
    a, sr = sf.read(f'voice/{name}.wav'); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a); put(a, at, 0.9)
    i = int(at * SR); bedpart = bed[int(15.6 * SR) + i:int(15.6 * SR) + i + len(a)] * 0.56; out[i:i + len(bedpart)] -= bedpart[:max(0, N - i)] * 0.45   # duck the music under the voice
def t(d): return np.arange(int(d * SR)) / SR
def env(x, a=0.004, r=4.0): n = len(x); e = np.minimum(1, np.arange(n) / (a * SR)) * np.exp(-r * np.arange(n) / n); return x * e
voice('p5', 0.2); voice('p6', 2.3); voice('p6b', 4.95)
# launcher: thump + air burst, then the line whizzing out
x = t(0.25); put(env(np.sin(2 * np.pi * (140 * np.exp(-x * 18) + 45) * x), r=6) * 0.9 + env(rng.standard_normal(len(x)), r=9) * 0.35, 0.75)
x = t(0.65); w = rng.standard_normal(len(x)); w = np.convolve(w, np.ones(24) / 24, 'same'); put(w * np.sin(np.pi * x / 0.65) ** 2 * 0.5 + np.sin(2 * np.pi * (900 + 1400 * x) * x) * np.sin(np.pi * x / 0.65) ** 2 * 0.05, 0.78)
# the anchor bites the railing: metal clink
x = t(0.5); put(env(np.sin(2 * np.pi * 2100 * x) + 0.6 * np.sin(2 * np.pi * 3170 * x) + 0.4 * np.sin(2 * np.pi * 4630 * x), r=9) * 0.22 + env(np.sin(2 * np.pi * 90 * x), r=14) * 0.5, 1.4)
# the wire goes live: rising hum + sparkle
x = t(0.7); put(np.sin(2 * np.pi * (180 + 500 * x ** 2) * x) * np.sin(np.pi * x / 0.7) * 0.16, 2.3)
for i in range(22): x = t(0.05); put(env(np.sin(2 * np.pi * (1800 + rng.uniform(0, 2600)) * x), r=5) * 0.05, 2.5 + i * 0.09)
# HELLO sent: quick data chirp, then a soft ding
for i in range(12): x = t(0.035); put(env(np.sin(2 * np.pi * (1200 + 260 * (i % 5)) * x), r=4) * 0.09, 4.95 + i * 0.04)
x = t(0.9); put(env(np.sin(2 * np.pi * 1318 * x) + 0.5 * np.sin(2 * np.pi * 1976 * x), r=6) * 0.2, 5.48)
# ---- step 2 (starts 7.4 s into this part): hostel, second wire, router, door numbers ----
M = 7.4
for n, at in [('m1', 0.2), ('m2', 3.1), ('m3', 4.9), ('m4', 7.3), ('m5', 8.3), ('m6', 11.15), ('m7', 12.8)]: voice(n, M + at)
for i in range(9): x = t(0.06); put(env(np.sin(2 * np.pi * (90 + 20 * (i % 2)) * x) + 0.3 * rng.standard_normal(len(x)), r=7) * 0.16, M + 1.0 + i * 0.19)          # her footsteps
x = t(0.5); put(np.sin(2 * np.pi * (520 - 380 * x / 0.5) * x) * np.sin(np.pi * x / 0.5) * 0.1, M + 0.7)                                                  # old wire goes dead
x = t(0.25); put(env(np.sin(2 * np.pi * (140 * np.exp(-x * 18) + 45) * x), r=6) * 0.9 + env(rng.standard_normal(len(x)), r=9) * 0.35, M + 3.75)           # second shot
x = t(0.55); w = rng.standard_normal(len(x)); w = np.convolve(w, np.ones(24) / 24, 'same'); put(w * np.sin(np.pi * x / 0.55) ** 2 * 0.5, M + 3.78)
x = t(0.5); put(env(np.sin(2 * np.pi * 2100 * x) + 0.6 * np.sin(2 * np.pi * 3170 * x) + 0.4 * np.sin(2 * np.pi * 4630 * x), r=9) * 0.22 + env(np.sin(2 * np.pi * 90 * x), r=14) * 0.5, M + 4.35)
x = t(0.8); put(np.sin(2 * np.pi * (140 + 420 * x ** 2) * x) * np.sin(np.pi * x / 0.8) * 0.18, M + 5.5)                                                  # router rises
for i in range(9): x = t(0.09); put(env(np.sin(2 * np.pi * (700 + 90 * i) * x), r=5) * 0.07, M + 6.1 + i * 0.07)                                         # wires plug in
x = t(0.6); put(env(np.sin(2 * np.pi * 880 * x) + 0.5 * np.sin(2 * np.pi * 1320 * x), r=6) * 0.14, M + 7.3)
for i in range(9): x = t(0.07); put(env(np.sin(2 * np.pi * (1500 + 120 * (i % 4)) * x), r=5) * 0.07, M + 8.4 + i * 0.12)                                 # number plates pop
for i in range(9): x = t(0.05); put(env(np.sin(2 * np.pi * 2000 * x), r=5) * 0.04, M + 11.15 + i * 0.03)
for i in range(14): x = t(0.035); put(env(np.sin(2 * np.pi * (1200 + 260 * (i % 5)) * x), r=4) * 0.08, M + 12.85 + i * 0.045)                            # envelope through the router
x = t(0.9); put(env(np.sin(2 * np.pi * 1318 * x) + 0.5 * np.sin(2 * np.pi * 1976 * x), r=6) * 0.2, M + 13.5)
out[-int(0.35 * SR):] *= np.linspace(1, 0, int(0.35 * SR))[:, None]
hook, _ = sf.read('v3/public/hook-mix.wav')
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)   # soft limiter
full = np.concatenate([hook, out])
sf.write('v3/public/full-mix.wav', full.astype(np.float32), SR); print(len(full) / SR, np.abs(full).max(), np.abs(out).max())
