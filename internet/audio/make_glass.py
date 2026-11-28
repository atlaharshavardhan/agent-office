"""Glass-breaking sound for the Part 2 hook (Harsh, 28 Nov 2026), made in code: a sharp crack, a burst of bright noise, then 40 small glass pieces tinkling and falling.
Writes audio/sfx-glass.wav (48 kHz stereo). It plays at the hit (HYD_TIMES.hit = 1.9 s in HydRoom.tsx). Not a whoosh."""
import numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(11); N = int(2.2 * SR); out = np.zeros((N, 2))
def put(sig, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def hp(x, a=0.93):
    y = np.zeros_like(x); p = 0.0; q = 0.0
    for k in range(len(x)): y[k] = a * (y[k - 1] + x[k] - p) if k else x[k]; p = x[k]
    return y
t = np.arange(int(0.5 * SR)) / SR
put(np.sin(2 * np.pi * 180 * t) * np.exp(-60 * t) * 0.9, 0.0, 0.8)                         # the thump of the hit
put(hp(rng.normal(0, 1, len(t))) * np.exp(-14 * t), 0.0, 0.7)                              # the crack: bright noise burst
for i in range(40):                                                                         # the pieces: short high rings, spread over 1.6 s, quieter and sparser over time
    at = 0.02 + (rng.random() ** 1.7) * 1.6; f = rng.uniform(2400, 7800); d = rng.uniform(0.04, 0.14); tt = np.arange(int(d * SR)) / SR
    ring = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.3 * tt)) * np.exp(-tt * rng.uniform(25, 60)); put(ring, at, 0.35 * (1 - at / 2.2), rng.uniform(-0.8, 0.8))
out = np.tanh(out * 1.3) / 1.3; out *= 0.85 / np.abs(out).max(); sf.write('audio/sfx-glass.wav', out, SR)
print('peak', float(np.abs(out).max()), 'length', round(N / SR, 2))
