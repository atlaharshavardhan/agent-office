"""Sound effects for "The Pillar Paradox" (synthesised, original; no music, NO footsteps). 48 kHz stereo, 45 s.
Follows the simulation (audio/simstats.json, exported from the page by tools/stats.cjs): crowd murmur and a low
pressure rumble that rise and fall with how hard the crowd is pressed, a soft tick for each person through the door."""
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
S = json.load(open('simstats.json')); fps = S['fps']; ts = np.arange(len(S['press'])) / fps; T = np.arange(N) / SR
press = np.interp(T, ts, np.array(S['press'])); pinned = np.interp(T, ts, np.array(S['pinned']) / 60.0); on = (T < 43).astype(float)
cuts = S['cuts']; dip = np.ones(N)
for c in cuts: dip *= np.clip(np.abs(T - c) / 0.25, 0, 1) ** 0.5   # sound drops briefly at each cut, like the picture's flash
sfx = np.zeros((N, 2))
# crowd bed: indistinct murmur (two decorrelated channels) + low rumble following the pressure in the crowd
mur = lambda: lp(noise(N), 0.12) * (1 + 0.3 * np.sin(2 * np.pi * 0.9 * T + rng.uniform(0, 6)))
lev = (0.35 + 0.9 * np.clip(press * 1.6, 0, 1)) * on * dip
sfx[:, 0] += mur() * lev * 0.22; sfx[:, 1] += mur() * lev * 0.22
rumble = (lp(noise(N), 0.02) * 3.0 + lp(noise(N), 0.006) * 6.0) * np.clip(pinned, 0, 1) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * T)) * on * dip
sfx[:, 0] += rumble * 0.11; sfx[:, 1] += rumble * 0.11
for t0 in np.arange(1.0, 42.0, 0.55):   # a few raised voices where people are stuck (formant-like noise, no words)
    i = int(t0 * SR)
    if pinned[i] > 0.4 and rng.random() < 0.45:
        L = int(0.35 * SR); f = 450 + rng.random() * 450; v = lp(noise(L), 0.2) * np.sin(2 * np.pi * f * np.arange(L) / SR) * env(L, 0.04, 0.25, 3); place(sfx, v, t0 + rng.random() * 0.3, 0.07, rng.uniform(-0.6, 0.6))
for k, t0 in enumerate(np.arange(0.4, 9.2, 1.1)):   # soft two-tone alarm in the first experiment
    for j, f in enumerate((880, 660)): x = tt(0.22); place(sfx, np.sin(2 * np.pi * f * x) * env(len(x), 0.01, 0.2, 2) * np.minimum(1, (0.22 - x) / 0.03), t0 + j * 0.3, 0.06 if t0 < 3 else 0.035, 0.4)
ex = np.array(S['exits'])
for fi in np.nonzero(ex)[0]:   # each person through the door: a tiny counter tick
    t0 = fi / fps
    for q in range(min(int(ex[fi]), 3)): x = tt(0.03); place(sfx, np.sin(2 * np.pi * 2400 * x) * env(len(x), 0.001, 0.02, 6), t0 + q * 0.008, 0.06, 0.3)
for c in cuts:   # cut to the next experiment: short reset tick, then the pillar rises with a soft concrete thunk
    x = tt(0.04); place(sfx, hp(noise(len(x)), 0.4) * env(len(x), 0.001, 0.03, 5), c, 0.25)
    x = tt(0.6); place(sfx, np.sin(2 * np.pi * 70 * x) * env(len(x), 0.004, 0.45, 3) + lp(noise(len(x)), 0.05) * env(len(x), 0.002, 0.15, 6) * 0.6, c + 0.32, 0.45)
def chime(notes, d=1.4): x = tt(d); return sum(np.sin(2 * np.pi * midi(m) * x) * env(len(x), 0.005, d * 0.7, 3) * (0.9 ** j) for j, m in enumerate(notes)) / len(notes)
if S.get('doneT'): place(sfx, chime([76, 83, 88]), S['doneT'], 0.4, 0.2)   # everyone out (pillar in the right spot)
x = tt(2.4); place(sfx, np.sin(2 * np.pi * 41 * x) * env(len(x), 0.005, 2.0, 2.5) + lp(noise(len(x)), 0.03) * env(len(x), 0.003, 0.6, 4) * 0.8, 38.2, 0.6)   # reveal: deep hit
place(sfx, chime([62, 69, 74, 81], 3.5), 38.3, 0.22)
x = tt(1.8); so = np.sin(2 * np.pi * midi(74) * x) * env(len(x), 0.01, 1.4, 2.2) + 0.8 * np.sin(2 * np.pi * midi(81) * np.maximum(0, x - 0.18)) * env(len(x), 0.01, 1.5, 2.0) * (x > 0.18)
place(sfx, so, 43.05, 0.35)   # sonic logo
sfx /= max(1, np.max(np.abs(sfx)) / 0.9); sf.write('sfx.wav', sfx.astype(np.float32), SR); print('ok')
