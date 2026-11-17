"""Music + sound effects for the stadium crowd Short (synthesised, original). 48 kHz stereo, 45 s.
music.wav: minimal tension bed that resolves to a calm pad at 30 s, sonic logo at 43 s. sfx.wav: crowd, fault, hush, PA chime, steward whistle."""
import numpy as np, soundfile as sf
from scipy.signal import lfilter
SR = 48000; DUR = 45.0; N = int(SR * DUR); rng = np.random.default_rng(5)
tt = lambda d: np.arange(int(d * SR)) / SR
def lp(x, a): return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def env(n, a=0.005, r=0.2, sh=4.0): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-sh * t / max(r, 1e-4))
def place(buf, sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * g; buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
midi = lambda m: 440 * 2 ** ((m - 69) / 12); noise = lambda n: rng.standard_normal(n)
def shape(n, pts):   # piecewise-linear envelope over the whole track: [(t, v), ...]
    t = np.arange(n) / SR; return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
music = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# ---- music: low tension drone (0–30 s) → warm calm pad (30–43 s)
t = tt(DUR)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + 0.3) + 0.25 * np.sin(2 * np.pi * 110 * 1.006 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.18 * t))
drone = lp(drone, 0.05) * shape(N, [(0, 0), (1.6, 0), (3, 0.9), (20, 1.0), (30, 0.9), (32.5, 0), (45, 0)])
pulse = np.zeros(N)
for b in np.arange(3.0, 30.0, 0.62):   # soft heartbeat-like pulse, faster and stronger in the stress beat
    L = int(0.25 * SR); x = np.sin(2 * np.pi * 48 * np.arange(L) / SR) * env(L, 0.005, 0.18, 5); i = int(b * SR); pulse[i:i + L] += x * (1.6 if 26.6 < b < 30 else 0.7)
for b in np.arange(26.9, 30.0, 0.62): i = int((b + 0.31) * SR); L = int(0.25 * SR); pulse[i:i + L] += np.sin(2 * np.pi * 48 * np.arange(L) / SR) * env(L, 0.005, 0.18, 5) * 1.2
calm = np.zeros(N); chords = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]
for k, ch in enumerate(chords * 2):
    t0 = 30.2 + k * 2.6
    if t0 > 42: break
    L = int(3.6 * SR); x = np.arange(L) / SR; sw = np.minimum(1, x / 0.9) * np.minimum(1, (x[-1] - x) / 1.2)
    i = int(t0 * SR); seg = sum(np.sin(2 * np.pi * midi(m) * x + j) for j, m in enumerate(ch)) / 4 * sw; calm[i:i + L] += lp(seg, 0.12)[: N - i]
calm *= shape(N, [(0, 0), (30, 0), (31.5, 1), (41.5, 1), (42.9, 0), (45, 0)])
mono = drone * 0.5 + pulse * 0.28 + calm * 0.45; music[:, 0] = mono; music[:, 1] = mono
# ---- sfx
crowd = lp(noise(N), 0.25) * 0.6 + lp(noise(N), 0.06)   # stadium roar: filtered noise, swelling chants
roar = shape(N, [(0, 0.9), (0.9, 1.0), (1.7, 0.75), (2.6, 0.18), (3.5, 0.12), (10, 0.14), (20, 0.1), (30, 0.12), (36, 0.06), (43, 0.04), (45, 0)])
crowd *= roar * (1 + 0.25 * np.sin(2 * np.pi * 1.6 * np.arange(N) / SR)); sfx[:, 0] += crowd * 0.35; sfx[:, 1] += lp(noise(N), 0.25) * 0.6 * roar * 0.35
def crackle(d, dens=180):
    n = int(d * SR); x = np.zeros(n); idx = rng.integers(0, n, int(dens * d)); x[idx] = rng.uniform(-1, 1, len(idx)); return hp(lp(x, 0.7), 0.15)
def buzz(d, f=100): x = tt(d); return np.sign(np.sin(2 * np.pi * f * x)) * 0.3 * np.exp(-x * 1.5) + np.sin(2 * np.pi * 2 * f * x) * 0.2
place(sfx, crackle(0.9) * 1.2, 0.95, 0.9, -0.3); place(sfx, buzz(0.7), 1.0, 0.25, -0.3); place(sfx, crackle(0.5, 90), 1.6, 0.6, -0.2)   # the electrical fault at the scoreboard
t = tt(1.4); place(sfx, lp(noise(len(t)), 0.03) * np.sin(np.pi * t / 1.4) ** 2 * 1.4, 1.5, 0.5)   # low rumble as the lights change
for k in range(10):   # murmurs as people react
    t0 = 3.4 + k * 0.62 + rng.uniform(0, 0.3); d = 0.5 + rng.uniform(0, 0.4); x = tt(d); m = lp(noise(len(x)), 0.08) * np.sin(np.pi * x / d) * (1 + 0.5 * np.sin(2 * np.pi * (4 + rng.uniform(0, 3)) * x))
    place(sfx, m, t0, 0.35, rng.uniform(-0.6, 0.6))
def chime(f0): x = tt(1.4); return sum(np.sin(2 * np.pi * f0 * r * x) * env(len(x), 0.005, 1.0, 3) / (j + 1) for j, r in enumerate([1, 2, 3.01]))
place(sfx, chime(midi(76)), 36.7, 0.35); place(sfx, chime(midi(72)), 37.05, 0.35)   # PA announcement chime (fix two)
x = tt(0.6); place(sfx, (np.sin(2 * np.pi * 62 * x) * np.exp(-x * 9) + lp(np.random.default_rng(3).standard_normal(len(x)), 0.08) * np.exp(-x * 14) * 0.6), 30.55, 0.5)   # barrier rising into place (fix one): low thud
x = tt(0.35); place(sfx, np.sin(2 * np.pi * 2900 * x * (1 + 0.02 * np.sin(2 * np.pi * 30 * x))) * env(len(x), 0.01, 0.3, 3), 37.7, 0.12, 0.4)   # steward whistle (short, soft)
x = tt(1.8); so = np.sin(2 * np.pi * midi(74) * x) * env(len(x), 0.01, 1.4, 2.2) + 0.8 * np.sin(2 * np.pi * midi(81) * np.maximum(0, x - 0.18)) * env(len(x), 0.01, 1.5, 2.0) * (x > 0.18)
place(sfx, so, 43.05, 0.35)   # sonic logo
for b in (music, sfx): b /= max(1, np.max(np.abs(b)) / 0.9)
sf.write('music.wav', music.astype(np.float32), SR); sf.write('sfx.wav', sfx.astype(np.float32), SR); print('ok')
