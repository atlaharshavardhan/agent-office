"""V5 (Harsh, 17 Nov 2026): sound effects on the fixed V5 scene grid (absolute seconds). Same synthesised sounds as V4, no whooshes.
Music and sound effects for the MacBook logo Short, synthesised in code (original, no samples).
V4: sound effects only (no whooshes): soft electronic activation tones, soft mechanical clicks, restrained impacts.
Writes music.wav (bed, starts at 0 s: music-first hook) and sfx.wav, 48 kHz stereo, the length of the voice timeline.
Effect times follow the scene page: scenes 2–6 are stretched from their v1 lengths (ORIG) onto this voice's cuts."""
import json, sys, numpy as np, soundfile as sf
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'chris_v5'
TL = json.load(open(f'../voice/{VOICE}/timeline.json')); B = TL['B']
SR = 48000; DUR = B[-1]; N = int(SR * DUR); rng = np.random.default_rng(11)
ORIG = [0, 8.06, 3.26, 6.29, 7.23, 7.52, 0, 0]
def at(i, u):  # scene i, local animation time u → seconds in the video
    return B[i] + (u * (B[i + 1] - B[i]) / ORIG[i] if ORIG[i] else u)
def env(n, a=0.005, r=0.2, shape=4.0):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
def place(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
noise = lambda n: rng.standard_normal(n)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR

# ---------- sound effects (V4) ----------
sfx = np.zeros((N, 2))
def shimmer(d=1.2, base=1800):
    t = tt(d); x = sum(np.sin(2 * np.pi * base * r * t + r) for r in [1, 1.5, 2.01, 2.99, 4.02]) * env(len(t), 0.25, d, 2.5) / 5
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
def tick(f=2600, d=0.06): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), 0.0005, d, 8)
def click(level=1.0):   # soft mechanical click: short filtered noise + a damped body tone
    n = int(0.035 * SR); t = tt(0.035)
    return (lp(hp(noise(n), 0.25), 0.5) * env(n, 0.0003, 0.012, 9) * 0.7 + np.sin(2 * np.pi * 1150 * t) * env(n, 0.0005, 0.02, 9) * 0.35) * level
def key(): c = click(0.55); c[:960] += tick(3100, 0.02) * 0.08; return c
def activate(f0=880, d=0.32):   # subtle electronic activation: soft rising blip with a quiet fifth above
    t = tt(d); f = f0 * (1 + 0.18 * np.minimum(1, t / 0.06)); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.25 * np.sin(1.5 * ph)) * env(len(t), 0.004, d, 5)
def impact(f=55, d=0.9):   # restrained cinematic impact: low sine thump + soft air, no hard transient
    t = tt(d); body = np.sin(2 * np.pi * (f + 30 * np.exp(-t * 18)) * t) * env(len(t), 0.006, d, 4)
    return body + lp(noise(len(t)), 0.04) * env(len(t), 0.01, 0.3, 6) * 0.25
def glow_on(d=1.4):
    t = tt(d); f = 520 * (1 + 0.5 * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, t / 0.5) * np.exp(-t * 1.6) * 0.6
def hum(d=1.0): t = tt(d); return (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t)) * np.minimum(1, t / 0.2) * np.exp(-t * 2.5)
def chime():   # soft sonic logo: two bell notes
    out = np.zeros(int(1.4 * SR))
    for k, m in enumerate([74, 81]):
        t = tt(1.4 - 0.16 * k); b = (np.sin(2 * np.pi * midi(m) * t) + 0.25 * np.sin(2 * np.pi * midi(m) * 2.76 * t) * np.exp(-t * 8)) * env(len(t), 0.003, 1.2, 3)
        i = int(0.16 * k * SR); out[i:i + len(b)] += b
    return out


# V5.1 (Harsh): long pauses removed; the effects were placed on the 40 s grid, so map them onto the 36 s grid (scene by scene, plus the spread/shine phrases)
_O = [0, 2, 5, 8, 12, 17, 20.0, 22.1, 25, 31, 35, 38, 40]; _N = [0, 2, 7.4, 9.4, 13.4, 18.7, 21.2, 23.15, 25.4, 29.5, 32.5, 35.5, 37.5]   # V5.4   # V5.2
M = lambda t: float(np.interp(t, _O, _N))
if VOICE == 'chris_v5b':   # V5.4-B: scenes reordered; map each effect from its scene on the old 40 s grid to that scene's new slot
    _OG = [0, 2, 5, 8, 12, 17, 25, 31, 35, 38, 40]; _TB = TL; _ORD = _TB['order']
    _IN = {5: ([0, 3.0, 5.1, 8.0], [0, 2.5, 4.45, 6.7])}   # light path: spread / shine land on their phrases
    def M(t):
        i = max(j for j in range(10) if _OG[j] <= t) if t < 40 else 9; k = _ORD.index(i); u = t - _OG[i]
        xs, ys = _IN.get(i, ([0, _OG[i + 1] - _OG[i]], [0, B[k + 1] - B[k]]))
        return B[k] + float(np.interp(u, xs, ys))
def P(buf, sig, t0, *a, **k): place(buf, sig, M(t0), *a, **k)
# 1 hook (0–2): the logo is already lit on frame 1 – subtle activation + one restrained impact
P(sfx, activate(988, 0.4), 0.0, 0.22); P(sfx, impact(52, 1.1), 0.02, 0.45); P(sfx, shimmer(1.4, 2100), 0.05, 0.1)
# 2 LCD vs OLED (2–7.4, V5.2): layers part, the backlight hums on and its light travels out; it switches off, OLED pixels light; the lid closes on the question
S2 = B[TL.get('order', list(range(10))).index(1)]   # the comparison's own start (2.0 s in V5.4, 7.4 s in V5.4-B)
place(sfx, click(0.8), S2 + 0.25, 0.28, -0.3); place(sfx, hum(1.4), S2 + 0.75, 0.13); place(sfx, glow_on(1.0), S2 + 0.80, 0.16); place(sfx, shimmer(1.2, 1500), S2 + 0.95, 0.1); place(sfx, click(0.9), S2 + 2.30, 0.35, 0.3); place(sfx, impact(60, 0.6), S2 + 2.50, 0.2); place(sfx, shimmer(1.0, 2200), S2 + 2.60, 0.1); place(sfx, click(0.8), S2 + 4.60, 0.3, -0.2)
# 3 into the lid (5–8): the aluminium turns to glass, the layers start to part
P(sfx, shimmer(1.4, 1300), 6.0, 0.13); P(sfx, impact(70, 0.6), 6.7, 0.22)
# 4 teardown (8–12): a soft click as each label arrives
for i in range(4): P(sfx, click(), 8.9 + i * 0.55, 0.3, (-0.4 if i < 2 else 0.4))
# 5 four LEDs (12–17): impact into the macro, tape lifts, one electronic click/tone per LED in sync
P(sfx, impact(58, 0.8), 12.0, 0.3); P(sfx, click(0.8), 12.2, 0.28)
for i in range(4): t0 = 12.55 + i * 0.4; P(sfx, click(0.9), t0, 0.3, [-0.5, -0.17, 0.17, 0.5][i]); P(sfx, activate(784 * 2 ** (i * 2 / 12), 0.3), t0 + 0.01, 0.26, [-0.5, -0.17, 0.17, 0.5][i]); P(sfx, shimmer(0.4, 2600 + 200 * i), t0, 0.04)
P(sfx, click(), 15.3, 0.3, -0.4)
# 6 bounce → spread → shine (17–25)
P(sfx, shimmer(1.0, 1700), 17.1, 0.14, -0.3); P(sfx, glow_on(1.2), 17.15, 0.1); P(sfx, click(), 17.5, 0.28, -0.4); P(sfx, click(), 18.4, 0.25, 0.4)
P(sfx, shimmer(1.6, 1300), 20.0, 0.15); P(sfx, activate(1319, 0.5), 20.15, 0.13); P(sfx, shimmer(1.4, 2400), 20.3, 0.1); P(sfx, click(), 20.1, 0.28, 0.4)
P(sfx, glow_on(1.5), 22.1, 0.3); P(sfx, shimmer(1.6, 2800), 22.95, 0.12); P(sfx, impact(60, 0.8), 22.95, 0.16); P(sfx, activate(1175, 0.4), 23.55, 0.2, 0.4)
# 7 reassembly (25–31): soft mechanical clicks as the layers seat, then the sonic payoff on the finished logo
for i, t0 in enumerate([25.7, 26.3, 26.9, 27.4]): P(sfx, click(0.9 + 0.1 * i), t0, 0.32, (-0.3, 0.3)[i % 2])
P(sfx, glow_on(1.4), 27.9, 0.22); P(sfx, shimmer(1.4, 2200), 28.0, 0.08)   # V5.4: no impact/chime here (it sounded like the end)
if VOICE == 'chris_v5b': P(sfx, impact(55, 1.1), 27.9, 0.35); P(sfx, chime(), 27.95, 0.16)   # V5.4-B: here it IS the ending
# 8 auto brightness (31–35): room dims, logo dims; room brightens, logo follows
P(sfx, click(0.8), 31.1, 0.28, -0.3); P(sfx, glow_on(0.9), 32.7, 0.18)
# 9 switch off + loop (35–38): keystrokes, the glow goes out, then it is back for the loop
for k in range(9): P(sfx, key(), 35.12 + k * 0.08, 0.3, 0.2 * np.sin(k))
P(sfx, click(1.0), 36.05, 0.42); P(sfx, impact(48, 0.7), 36.1, 0.22); P(sfx, glow_on(1.0), 37.3, 0.2)
# 10 brand (38–40): soft sonic logo
P(sfx, impact(55, 1.0), 37.95, 0.26); P(sfx, chime(), 38.1, 0.3)
sfx /= max(1, np.max(np.abs(sfx)) / 0.9)
sf.write(f'sfx_{VOICE}.wav', sfx.astype(np.float32), SR)
print('ok', DUR, 'peak', np.max(np.abs(sfx)))
