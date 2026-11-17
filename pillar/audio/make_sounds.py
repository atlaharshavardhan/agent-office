"""Sound effects for "The Deadly Paradox of Running Faster" (synthesised, original; no music, no whoosh). 48 kHz stereo, 45 s.
Concourse sounds follow the simulation itself: audio/simstats.json is exported from the page (window.__simStats) —
walkers, runners, crowd pressure and exits per video frame."""
import json, numpy as np, soundfile as sf
from scipy.signal import lfilter
SR = 48000; DUR = 45.0; N = int(SR * DUR); rng = np.random.default_rng(5)
tt = lambda d: np.arange(int(d * SR)) / SR
def lp(x, a): return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def env(n, a=0.005, r=0.2, sh=4.0): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-sh * t / max(r, 1e-4))
def place(buf, sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * g; buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
midi = lambda m: 440 * 2 ** ((m - 69) / 12); noise = lambda n: rng.standard_normal(n)
def shape(pts): t = np.arange(N) / SR; return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
sfx = np.zeros((N, 2))
# ---- 0–10 s: stadium. Cheering roar → electrical fault → hush → anxious murmur while people move to the aisles
roar = shape([(0, 0.9), (0.9, 1.0), (1.7, 0.7), (2.6, 0.16), (4, 0.14), (8, 0.22), (9.6, 0.18), (10.0, 0), (45, 0)])
cr = (lp(noise(N), 0.25) * 0.6 + lp(noise(N), 0.06)) * roar * (1 + 0.25 * np.sin(2 * np.pi * 1.6 * np.arange(N) / SR))
sfx[:, 0] += cr * 0.35; sfx[:, 1] += (lp(noise(N), 0.25) * 0.6 + lp(noise(N), 0.06)) * roar * 0.35
def crackle(d, dens=180):
    n = int(d * SR); x = np.zeros(n); idx = rng.integers(0, n, int(dens * d)); x[idx] = rng.uniform(-1, 1, len(idx)); return hp(lp(x, 0.7), 0.15)
def buzz(d, f=100): x = tt(d); return np.sign(np.sin(2 * np.pi * f * x)) * 0.3 * np.exp(-x * 1.5) + np.sin(2 * np.pi * 2 * f * x) * 0.2
place(sfx, crackle(0.9) * 1.2, 0.95, 0.9, -0.3); place(sfx, buzz(0.7), 1.0, 0.25, -0.3); place(sfx, crackle(0.5, 90), 1.6, 0.6, -0.2)
x = tt(1.4); place(sfx, lp(noise(len(x)), 0.03) * np.sin(np.pi * x / 1.4) ** 2 * 1.4, 1.5, 0.5)
for k, t0 in enumerate(np.arange(2.3, 9.8, 0.9)):   # stadium alarm: soft two-tone beeps, quieter under the voice
    for j, f in enumerate((880, 660)): x = tt(0.22); place(sfx, np.sin(2 * np.pi * f * x) * env(len(x), 0.01, 0.2, 2) * np.minimum(1, (0.22 - x) / 0.03), t0 + j * 0.3, 0.05 if t0 > 3 else 0.08, 0.5)
for k in range(16):   # murmurs as people react
    t0 = 3.0 + k * 0.42 + rng.uniform(0, 0.3); d = 0.5 + rng.uniform(0, 0.4); x = tt(d); m = lp(noise(len(x)), 0.08) * np.sin(np.pi * x / d) * (1 + 0.5 * np.sin(2 * np.pi * (4 + rng.uniform(0, 3)) * x))
    place(sfx, m, t0, 0.3, rng.uniform(-0.6, 0.6))
r2 = np.random.default_rng(11)
for t0 in np.arange(4.6, 9.9, 1 / 40):   # shuffling feet in the rows and on the steps
    if r2.random() < 0.55 * min(1, (t0 - 4.6) / 1.5):
        L = int(0.06 * SR); place(sfx, hp(r2.standard_normal(L), 0.3) * env(L, 0.002, 0.05, 5), t0 + r2.random() / 40, 0.12 * (0.5 + r2.random()), r2.uniform(-0.7, 0.7))
x = tt(0.9); place(sfx, np.sin(2 * np.pi * 46 * x) * env(len(x), 0.004, 0.7, 3) + lp(noise(len(x)), 0.05) * env(len(x), 0.002, 0.3, 6) * 0.5, 9.95, 0.45)   # cut into the concourse: soft low thud
# ---- 10–43 s: the concourse, driven by the simulation
S = json.load(open('simstats.json')); fps = S['fps']; ts = np.arange(len(S['walk'])) / fps; T = np.arange(N) / SR
walk = np.interp(T, ts, np.array(S['walk']) / 200.0); run = np.interp(T, ts, np.array(S['run']) / 200.0); press = np.interp(T, ts, np.array(S['press']))
lapse = (T >= 29.8) & (T < 38)
steps = np.zeros(N)
for t0 in np.arange(10.0, 43.0, 1 / 120):   # footsteps: soft taps for walkers, harder and denser for runners
    i = int(t0 * SR); pw, pr = walk[i] * 0.9, run[i] * 2.2
    if lapse[i]: pw *= 0.35; pr *= 0.35
    if r2.random() < pw: L = int(0.05 * SR); j = int((t0 + r2.random() / 120) * SR); steps[j:j + L] += hp(r2.standard_normal(L), 0.3)[: N - j] * env(L, 0.001, 0.035, 6)[: N - j] * (0.35 + 0.4 * r2.random())
    if r2.random() < pr: L = int(0.06 * SR); j = int((t0 + r2.random() / 120) * SR); steps[j:j + L] += (hp(r2.standard_normal(L), 0.18) * 0.8 + np.sin(2 * np.pi * 90 * np.arange(L) / SR))[: N - j] * env(L, 0.001, 0.05, 5)[: N - j] * (0.6 + 0.5 * r2.random()) * 0.35
steps = lp(steps, 0.4)
rumble = (lp(noise(N), 0.02) * 3.0 + lp(noise(N), 0.006) * 6.0) * np.clip(press * 1.6, 0, 1) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * T))   # crowd pressure: low groaning rumble that follows the heat map
crowd = lp(noise(N), 0.12) * (walk + run + 0.6 * np.clip(press * 1.5, 0, 1)) * 0.5 * ((T >= 10) & (T < 43))   # indistinct crowd murmur
for t0 in np.arange(12, 19, 0.5):   # a few raised voices inside the jam (formant-like noise bursts, no words)
    i = int(t0 * SR)
    if press[i] > 0.3 and rng.random() < 0.7:
        L = int(0.35 * SR); f = 450 + rng.random() * 450; v = lp(noise(L), 0.2) * np.sin(2 * np.pi * f * np.arange(L) / SR) * env(L, 0.04, 0.25, 3); place(sfx, v, t0 + rng.random() * 0.3, 0.14, rng.uniform(-0.6, 0.6))
ex = np.array(S['exits'])
for fi in np.nonzero(ex)[0]:   # each person through the door: a tiny counter tick (softer in the time-lapse)
    t0 = fi / fps
    for q in range(min(int(ex[fi]), 3)): x = tt(0.03); place(sfx, np.sin(2 * np.pi * 2400 * x) * env(len(x), 0.001, 0.02, 6), t0 + q * 0.008, 0.05 if 29.8 <= t0 < 38 else 0.09, 0.3)
def beep(f, d=0.12): x = tt(d); return np.sin(2 * np.pi * f * x) * env(len(x), 0.004, d, 2.5)
place(sfx, beep(midi(79)), 10.25, 0.14); place(sfx, beep(midi(84)), 10.4, 0.14)   # experiment A starts
place(sfx, beep(midi(79)), 19.55, 0.14); place(sfx, beep(midi(84)), 19.7, 0.14)   # experiment B starts
for k in range(14):   # rewind: a quick run of descending clock ticks
    t0 = 29.0 + 0.8 * (1 - (1 - k / 14) ** 1.6); x = tt(0.025); place(sfx, hp(noise(len(x)), 0.4) * env(len(x), 0.001, 0.02, 5), t0, 0.22, 0.2)
def chime(notes, d=1.4): x = tt(d); return sum(np.sin(2 * np.pi * midi(m) * x) * env(len(x), 0.005, d * 0.7, 3) * (0.9 ** j) for j, m in enumerate(notes)) / len(notes)
place(sfx, chime([76, 83, 88]), 29.8 + S['doneB'] / 27, 0.4, 0.35)   # room B empty: bright chime
place(sfx, chime([64, 71]), 29.8 + S['doneA'] / 27, 0.4, -0.35)   # room A empty: lower chime
x = tt(2.4); place(sfx, np.sin(2 * np.pi * 41 * x) * env(len(x), 0.005, 2.0, 2.5) + lp(noise(len(x)), 0.03) * env(len(x), 0.003, 0.6, 4) * 0.8, 38.2, 0.6)   # reveal: deep hit
place(sfx, chime([62, 69, 74, 81], 3.5), 38.3, 0.22)
x = tt(1.8); so = np.sin(2 * np.pi * midi(74) * x) * env(len(x), 0.01, 1.4, 2.2) + 0.8 * np.sin(2 * np.pi * midi(81) * np.maximum(0, x - 0.18)) * env(len(x), 0.01, 1.5, 2.0) * (x > 0.18)
place(sfx, so, 43.05, 0.35)   # sonic logo
import sys
if len(sys.argv) > 1:
    sl = slice(int(11 * SR), int(14 * SR)); db = lambda a: 20 * np.log10(np.sqrt(np.mean(a[sl] ** 2)) + 1e-9); print("steps", db(steps * 0.8), "rumble", db(rumble * 0.14), "crowd", db(crowd * 0.5), "other", db(sfx[:, 0]))
sfx[:, 0] += steps * 0.34 + rumble * 0.16 + crowd * 0.32; sfx[:, 1] += steps * 0.34 + rumble * 0.16 + lp(noise(N), 0.12) * (walk + run) * 0.16
sfx /= max(1, np.max(np.abs(sfx)) / 0.9); sf.write('sfx.wav', sfx.astype(np.float32), SR); print('ok')
