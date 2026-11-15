"""Music and sound effects for the MacBook logo Short, synthesised in code (original, no samples).
Writes music.wav (bed, starts at 0 s: music-first hook) and sfx.wav, 48 kHz stereo, the length of the voice timeline.
Effect times follow the scene page: scenes 2–6 are stretched from their v1 lengths (ORIG) onto this voice's cuts."""
import json, sys, numpy as np, soundfile as sf
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'george'
TL = json.load(open(f'../voice/{VOICE}/timeline.json')); B = TL['B']
SR = 48000; DUR = B[-1]; N = int(SR * DUR); rng = np.random.default_rng(11)
ORIG = [0, 8.06, 3.26, 6.29, 7.23, 7.52, 0]
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

# ---------- music (v3): minimal — a soft pad with a few sparse bell notes, no drums; fades out before the 2-second outro ----------
music = np.zeros((N, 2)); beat = 60 / 84; bar = 4 * beat
chords = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64]]
for b in range(int(DUR / bar) + 2):
    ch = chords[b % 4]; t0 = b * bar
    t = tt(bar + 1.5); sw = np.minimum(1, t / 0.8) * np.minimum(1, (t[-1] - t) / 1.4)
    for k, m in enumerate(ch):
        f = midi(m); x = sum(np.sin(2 * np.pi * f * d * t + k) for d in [1, 1.003, 0.997]) / 3
        place(music, lp(x * sw, 0.05) * 0.05, t0, 1, (k - 2) * 0.25)
    t = tt(bar); place(music, np.sin(2 * np.pi * midi(ch[0] - 12) * t) * env(len(t), 0.05, 2.2, 1.0) * 0.1, t0)
    for q in (0, 3, 6):   # three soft bell notes per bar
        m = ch[[2, 4, 3][q // 3]] + 12; t = tt(1.2)
        place(music, np.sin(2 * np.pi * midi(m) * t) * env(len(t), 0.004, 0.9, 3) , t0 + q * beat / 2, 0.022, 0.3 * np.sin(q + b))
end = B[-2]; fo = int(1.4 * SR); i1 = int(end * SR); music[i1 - fo:i1] *= np.linspace(1, 0, fo)[:, None] ** 1.3; music[i1:] = 0
music /= np.max(np.abs(music)) / 0.6

# ---------- sound effects (v3): subtle clicks, soft activations, gentle mechanics, one restrained impact. No whooshes. ----------
sfx = np.zeros((N, 2))
def click(f=1600, d=0.025, bright=0.4): n = int(d * SR); return hp(noise(n), bright) * env(n, 0.0003, d * 0.6, 9) * 0.6 + np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.0003, d, 9) * 0.4
def tink(f=2600): t = tt(0.5); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t)) * env(len(t), 0.001, 0.35, 5)
def hum(d=0.9, f0=60): t = tt(d); return (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * 2 * f0 * t) + 0.25 * np.sin(2 * np.pi * 3 * f0 * t)) * np.minimum(1, t / 0.15) * np.exp(-t * 3.2)
def crackle(d=0.35, dens=90): n = int(d * SR); x = np.zeros(n); idx = rng.integers(0, n, int(dens * d)); x[idx] = rng.uniform(-1, 1, len(idx)); return hp(lp(x, 0.6), 0.1) * np.linspace(1, 0.2, n)
def swell(d=1.2, f=440): t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)) * np.sin(np.pi * t / d) ** 2 * 0.5
def slide(d=0.35): n = int(d * SR); return lp(noise(n), 0.04) * np.sin(np.pi * np.arange(n) / n) * 1.2
def thud(): t = tt(0.4); return np.sin(2 * np.pi * (55 + 40 * np.exp(-t * 25)) * t) * env(len(t), 0.003, 0.3, 6) + lp(noise(len(t)), 0.08) * env(len(t), 0.001, 0.04, 9) * 0.3
def shimmer(d=1.2, base=1800):
    t = tt(d); x = sum(np.sin(2 * np.pi * base * r * t + r) for r in [1, 1.5, 2.01, 2.99]) * env(len(t), 0.3, d, 2.5) / 4; return x * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * t))
def powerdown(d=0.6): t = tt(d); f = 520 * np.exp(-t * 2.2); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * 0.6

# 1 hook: electrical activation as the logo lights (0.08–0.55 s)
place(sfx, click(1200, 0.02), 0.06, 0.35); place(sfx, crackle(0.3), 0.08, 0.12); place(sfx, hum(1.1), 0.08, 0.22); place(sfx, swell(1.4, 392), 0.12, 0.16); place(sfx, shimmer(1.4, 2100), 0.3, 0.06)
# 2 glass x-ray; pixels switch on (tiny ticks)
place(sfx, shimmer(1.0, 1500), at(1, 2.9), 0.09)
for k in range(14): place(sfx, click(3000 + 400 * (k % 4), 0.012, 0.6), at(1, 3.5 + k * 0.1), 0.06, (k % 5 - 2) * 0.3)
place(sfx, thud() * 0.5, at(1, 6.0), 0.15)
# 3 the lid opens into layers: gentle mechanical slides
for k in range(3): place(sfx, slide(0.32), at(2, 0.75 + k * 0.45), 0.22, (k - 1) * 0.4); place(sfx, click(900, 0.02, 0.3), at(2, 1.05 + k * 0.45), 0.18)
# 4 main reveal: tape peels, each LED switches on with a satisfying tink
place(sfx, crackle(0.6, 160) * 0.6, at(3, 0.25), 0.18)
for i in range(4): t0 = at(3, 1.0 + i * 0.42); place(sfx, click(1800, 0.02), t0, 0.3, [-0.5, -0.15, 0.15, 0.5][i]); place(sfx, tink(2300 + 220 * i), t0 + 0.005, 0.2, [-0.5, -0.15, 0.15, 0.5][i])
# 5 light path: soft shimmer, the even glow swells in, layers close with one restrained impact
place(sfx, shimmer(2.0, 1700), at(4, 0.2), 0.07); place(sfx, swell(1.6, 523), at(4, 2.3), 0.12); place(sfx, thud(), at(4, 6.45), 0.4)
# 6 Terminal: typing, Return, the logo powers down
n_keys = 26
for k in range(n_keys): place(sfx, click(1400 + 300 * (k % 3), 0.018, 0.5), at(5, 5.6 + k * (0.65 / n_keys)) + rng.uniform(0, 0.01), 0.16, 0.2 * np.sin(k))
place(sfx, click(1000, 0.03, 0.35), at(5, 6.32), 0.32); place(sfx, powerdown(), at(5, 6.42), 0.18)
# 8 outro: soft sonic logo (two warm notes + air)
t = tt(1.9); so = (np.sin(2 * np.pi * midi(74) * t) * env(len(t), 0.01, 1.4, 2.2) + 0.8 * np.sin(2 * np.pi * midi(81) * np.maximum(0, t - 0.18)) * env(len(t), 0.01, 1.5, 2.0) * (t > 0.18)
      + 0.25 * np.sin(2 * np.pi * midi(62) * t) * np.sin(np.pi * t / 1.9) ** 2)
place(sfx, so, B[-2] + 0.08, 0.32)
sfx /= max(1, np.max(np.abs(sfx)) / 0.9)
sf.write('music.wav', music.astype(np.float32), SR); sf.write('sfx.wav', sfx.astype(np.float32), SR)
print('ok', DUR)
