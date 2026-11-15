"""Second-half audio (34.2 s): music bed, the tail narration, and code-made effects. Writes v3/public/tail-mix.wav. Run from internet/."""
import numpy as np, soundfile as sf
SR = 48000; DUR = 34.2; N = int(DUR * SR); rng = np.random.default_rng(11)
bed, _ = sf.read('audio/bed.wav'); B0 = 4.0
out = bed[int(B0 * SR):int(B0 * SR) + N].copy() * 0.5
# hand over to the bed's own closing bars for the end card
E = 30.4; tailbars = bed[int(46.4 * SR):] * 0.6; i = int(E * SR); n = min(len(tailbars), N - i); xf = int(0.5 * SR)
out[i:i + xf] *= np.linspace(1, 0, xf)[:, None]; out[i + xf:] = 0; ramp = np.minimum(1, np.arange(n) / xf)[:, None]; out[i:i + n] += tailbars[:n] * ramp
def put(sig, at, g=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n <= 0: return
    if sig.ndim == 1: sig = np.stack([sig, sig], 1)
    out[i:i + n] += sig[:n] * g
def voice(name, at):
    a, sr = sf.read(f'voice/{name}.wav'); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    i = int(at * SR); n = min(len(a), N - i); pad = int(0.12 * SR); lo, hi = max(0, i - pad), min(N, i + n + pad)
    duck = np.ones(hi - lo); duck[:] = 0.5; k = min(pad, (hi - lo) // 2); duck[:k] = np.linspace(1, 0.5, k); duck[-k:] = np.linspace(0.5, 1, k); out[lo:hi] *= duck[:, None]
    put(a, at, 0.92)
def t(d): return np.arange(int(d * SR)) / SR
def env(x, a=0.004, r=4.0): n = len(x); return x * np.minimum(1, np.arange(n) / (a * SR)) * np.exp(-r * np.arange(n) / n)
def noise(d, k=24): w = rng.standard_normal(int(d * SR)); return np.convolve(w, np.ones(k) / k, 'same')
def whoosh(at, d=0.5, g=0.4, k=24): x = t(d); put(noise(d, k)[:len(x)] * np.sin(np.pi * x / d) ** 2, at, g)
def ding(at, f0=1318, g=0.18): x = t(0.9); put(env(np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x), r=6), at, g)
def blip(at, f0, g=0.07, d=0.05): x = t(d); put(env(np.sin(2 * np.pi * f0 * x), r=5), at, g)
for n_, at in [('t1', 0.3), ('t2', 3.0), ('t3', 5.6), ('t4', 9.5), ('t5', 12.5), ('t6', 14.9), ('t7a', 18.7), ('t7b', 20.5), ('t7c', 22.1), ('t8', 23.8), ('t9', 27.8), ('t10', 31.1)]: voice(n_, at)
# packets: send tap, the chop, twelve pieces leaving and landing, done
blip(0.38, 1500, 0.1, 0.07); whoosh(0.6, 0.5, 0.25)
for i in range(12): blip(1.1 + i * 0.03, 2400 + 90 * i, 0.05, 0.03)
for i in range(12): blip(2.0 + i * 0.09, 1100 + 140 * (i % 5), 0.07)
for i in range(12): blip(3.05 + i * 0.115, 1700 + 120 * (i % 4), 0.06)
ding(4.5)
# flight: engine swell, pass-by
x = t(2.2); put(noise(2.2, 90)[:len(x)] * np.sin(np.pi * x / 2.2) ** 1.5 * (1 + 0.3 * np.sin(2 * np.pi * 38 * x)), 5.1, 0.55); whoosh(6.75, 0.6, 0.35)
for i in range(3): blip(8.6 + i * 0.12, 880 + 220 * i, 0.06, 0.08)
# cable drawn across the globe: rising shimmer, then the dive
x = t(2.0); put(np.sin(2 * np.pi * (220 + 380 * (x / 2.0) ** 2) * x) * np.sin(np.pi * x / 2.0) * 0.1, 9.45)
for i in range(20): blip(9.5 + i * 0.1, 1800 + rng.uniform(0, 2400), 0.035)
whoosh(11.55, 0.9, 0.5, 60)
# under water: low rumble, bubbles, lens opening
x = t(3.6); put(noise(3.6, 400)[:len(x)] * np.minimum(1, x / 0.3) * np.clip((3.6 - x) / 0.5, 0, 1), 12.2, 1.6)
for i in range(16): x = t(0.08); put(env(np.sin(2 * np.pi * (500 + rng.uniform(0, 900) + 2500 * x) * x), r=5), 12.3 + rng.uniform(0, 3.0), 0.05)
x = t(0.5); put(np.sin(2 * np.pi * (300 + 700 * x) * x) * np.sin(np.pi * x / 0.5) * 0.09, 13.25)
# the planet's cables
whoosh(15.55, 0.7, 0.4, 40)
for i in range(30): blip(16.3 + i * 0.045, 1500 + 110 * (i % 7), 0.03, 0.04)
# anchor: chain rattle, drag, the snap
x = t(1.9); put(noise(1.9, 400)[:len(x)] * np.minimum(1, x / 0.2), 18.6, 1.3)
for i in range(11): x = t(0.06); put(env(np.sin(2 * np.pi * (2100 + rng.uniform(-300, 900)) * x) + 0.4 * rng.standard_normal(len(x)), r=6), 18.65 + i * 0.075, 0.07)
x = t(0.3); put(np.sin(2 * np.pi * (120 + 260 * x / 0.3) * x) * np.sin(np.pi * x / 0.3) * 0.2, 19.3)
x = t(0.5); put(env(rng.standard_normal(len(x)), a=0.001, r=14) * 0.6 + env(np.sin(2 * np.pi * (70 * np.exp(-x * 9) + 40) * x), r=5) * 0.9, 19.6)
x = t(0.7); put(np.sin(2 * np.pi * (700 - 560 * x / 0.7) * x) * np.sin(np.pi * x / 0.7) * 0.12, 19.65)
# hundreds, then the reroute
whoosh(20.35, 0.5, 0.35)
for i in range(18): blip(20.6 + i * 0.05, 900 + 60 * i, 0.035, 0.04)
for i in range(16): blip(21.9 + i * 0.09, 1200 + 260 * (i % 5), 0.06)
# London: message in, typing, reply out; then his phone
whoosh(23.35, 0.5, 0.3); ding(24.2, 1175, 0.16)
for i in range(7): blip(24.8 + i * 0.11, 2600 + 200 * (i % 3), 0.04, 0.025)
whoosh(25.8, 0.4, 0.25); ding(25.85, 1568, 0.14)
whoosh(27.35, 0.5, 0.3); ding(28.25, 1318, 0.2); ding(28.4, 1976, 0.12)
whoosh(30.5, 0.6, 0.35)
out[:int(0.25 * SR)] *= np.linspace(0, 1, int(0.25 * SR))[:, None]; out[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/tail-mix.wav', out.astype(np.float32), SR); print(len(out) / SR, np.abs(out).max())
