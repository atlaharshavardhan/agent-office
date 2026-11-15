"""Music and sound effects for the MacBook logo Short, synthesised in code (original, no samples).
V4: sound effects only (no whooshes): soft electronic activation tones, soft mechanical clicks, restrained impacts.
Writes music.wav (bed, starts at 0 s: music-first hook) and sfx.wav, 48 kHz stereo, the length of the voice timeline.
Effect times follow the scene page: scenes 2–6 are stretched from their v1 lengths (ORIG) onto this voice's cuts."""
import json, sys, numpy as np, soundfile as sf
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'george40'
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

# 1 hook: the Mac wakes (click + hum), the logo lights with one restrained impact
place(sfx, click(0.9), 0.12, 0.5); place(sfx, hum(1.2), 0.15, 0.2); place(sfx, impact(52, 1.1), 0.36, 0.5); place(sfx, glow_on(1.6), 0.38, 0.35); place(sfx, shimmer(1.6, 2100), 0.5, 0.12)
# 2 glass x-ray; pixels light; tags
place(sfx, shimmer(1.2, 1500), at(1, 2.9), 0.16); place(sfx, glow_on(1.0), at(1, 3.6), 0.2)
place(sfx, click(), at(1, 4.6), 0.35, 0.4); place(sfx, click(), at(1, 6.0), 0.35, -0.4)
# 3 lid opens into layers: soft clicks as each layer separates and each label arrives
place(sfx, impact(70, 0.6), at(2, 0.7), 0.25)
for i in range(6): place(sfx, click(), at(2, 1.25 + i * 0.3), 0.32, (-0.4 if i < 3 else 0.4))
# 4 four LEDs: an electronic activation tone on each one, in time with the picture
place(sfx, impact(60, 0.8), at(3, 0.05), 0.3)
for i in range(4): place(sfx, activate(784 * 2 ** (i * 2 / 12)), at(3, 1.0 + i * 0.42), 0.32, [-0.5, -0.17, 0.17, 0.5][i]); place(sfx, shimmer(0.45, 2600 + 200 * i), at(3, 1.0 + i * 0.42), 0.05)
place(sfx, click(), at(3, 2.9), 0.32, -0.4); place(sfx, click(), at(3, 3.6), 0.32, 0.4)
# 5 bounce → spread → shine; layers close with a soft click
place(sfx, shimmer(1.0, 1700), at(4, 0.1), 0.14, -0.3); place(sfx, click(), at(4, 0.7), 0.3, -0.4); place(sfx, click(), at(4, 1.0), 0.28, 0.4)
place(sfx, shimmer(1.6, 1300), at(4, 2.2), 0.16); place(sfx, click(), at(4, 2.6), 0.3, 0.4); place(sfx, glow_on(1.5), at(4, 3.0), 0.32)
place(sfx, activate(1175, 0.4), at(4, 4.0), 0.22, 0.4); place(sfx, click(1.2), at(4, 6.5), 0.45); place(sfx, impact(62, 0.6), at(4, 6.5), 0.2)
# 6 room light up, down; the glow switches off
place(sfx, glow_on(0.9), at(5, 2.4), 0.18); place(sfx, glow_on(0.9), at(5, 3.9), 0.1)
place(sfx, click(1.0), at(5, 6.85), 0.45); place(sfx, impact(48, 0.7), at(5, 6.95), 0.25)   # V4: the glow switches off
# 7 the MacBook's lock screen, then the InvisiTech card with a soft sonic logo
place(sfx, glow_on(1.2), B[6] + 0.25, 0.18); place(sfx, shimmer(1.0, 1600), B[6] + 0.3, 0.08)
place(sfx, impact(55, 1.0), B[7] - 0.4, 0.28); place(sfx, chime(), B[7] + 0.05, 0.3)
for k in range(3): place(sfx, click(0.8), B[7] - 0.45 + 0.9 + k * 0.12, 0.28, (k - 1) * 0.4)   # V4: Like / Comment / Follow pop in
place(sfx, click(1.1), B[7] - 0.45 + 1.3, 0.35); place(sfx, activate(988, 0.3), B[7] - 0.45 + 1.32, 0.12)   # Subscribe
sfx /= max(1, np.max(np.abs(sfx)) / 0.9)
sf.write('sfx_v4.wav', sfx.astype(np.float32), SR)
print('ok', DUR, 'peak', np.max(np.abs(sfx)))
