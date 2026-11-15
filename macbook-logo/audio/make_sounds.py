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

# ---------- music: calm "tech reveal" bed, 96 bpm: warm pad, bell arpeggio, soft kick + hats from bar 2 ----------
music = np.zeros((N, 2)); beat = 60 / 96; bar = 4 * beat
chords = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64]]   # Dm9-ish, Bb, Gm, A
nb = int(DUR / bar) + 2
for b in range(nb):
    ch = chords[b % 4]; t0 = b * bar
    t = tt(bar + 1.5); sw = np.minimum(1, t / 0.6) * np.minimum(1, (t[-1] - t) / 1.2)
    for k, m in enumerate(ch):   # detuned saw-ish pad, low-passed
        f = midi(m); x = sum(np.sin(2 * np.pi * f * d * t + k) / (h + 1) * (0.5 if h else 1) for h, d in enumerate([1, 1.004, 0.996]))
        place(music, lp(x * sw, 0.08) * 0.05, t0, 1, (k - 2) * 0.25)
    t = tt(bar); place(music, np.sin(2 * np.pi * midi(ch[0] - 12) * t) * env(len(t), 0.02, 2.0, 1.2) * 0.16, t0)   # bass
    for q in range(8):   # bell arpeggio in 8ths
        m = ch[[1, 2, 3, 4, 3, 2, 4, 1][q]] + 12; t = tt(0.9)
        bell = (np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(2 * np.pi * midi(m) * 2.76 * t) * np.exp(-t * 9)) * env(len(t), 0.002, 0.5, 4)
        place(music, bell, t0 + q * beat / 2, 0.045 * (0.7 if q % 2 else 1), 0.4 * np.sin(q))
    if b >= 1:
        for q in range(4):
            bt = t0 + q * beat
            if q in (0, 2): t = tt(0.35); place(music, np.sin(2 * np.pi * (48 + 80 * np.exp(-t * 28)) * t) * env(len(t), 0.002, 0.22, 6), bt, 0.32)
            for h in (0, 0.5): n = int(0.04 * SR); place(music, hp(noise(n), 0.3) * env(n, 0.001, 0.03, 6), bt + h * beat, 0.035, 0.3)
            if q in (1, 3): n = int(0.18 * SR); place(music, lp(noise(n), 0.25) * env(n, 0.001, 0.1, 7), bt, 0.07)
fo = int(2.0 * SR); music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.4
music /= np.max(np.abs(music)) / 0.7

# ---------- sound effects ----------
sfx = np.zeros((N, 2))
def whoosh(d=0.7, bright=0.12, up=True):
    t = tt(d); n = noise(len(t)); sh = np.sin(np.pi * t / d) ** 2; x = lp(n, bright) * sh
    return hp(x, 0.02) * 1.6
def shimmer(d=1.2, base=1800):
    t = tt(d); x = sum(np.sin(2 * np.pi * base * r * t + r) for r in [1, 1.5, 2.01, 2.99, 4.02]) * env(len(t), 0.25, d, 2.5) / 5
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
def tick(f=2600, d=0.06): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), 0.0005, d, 8)
def pop(f=900): t = tt(0.12); return np.sin(2 * np.pi * f * (1 + 0.6 * np.exp(-t * 40)) * t) * env(len(t), 0.001, 0.1, 6)
def click(): n = int(0.03 * SR); return hp(noise(n), 0.4) * env(n, 0.0003, 0.02, 9) + tick(1400, 0.03) * 0.5
def thunk(): t = tt(0.3); return np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * env(len(t), 0.002, 0.25, 7) + lp(noise(len(t)), 0.1) * env(len(t), 0.001, 0.05, 8) * 0.4
def glow_on(d=1.4): # soft rising tone for a light coming on
    t = tt(d); f = 520 * (1 + 0.5 * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, t / 0.5) * np.exp(-t * 1.6) * 0.6
def hum(d=1.0): t = tt(d); return (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t)) * np.minimum(1, t / 0.2) * np.exp(-t * 2.5)

# 1 hook: the Mac wakes (hum + click), the logo glows up
place(sfx, click(), 0.12, 0.5); place(sfx, hum(1.2), 0.15, 0.25); place(sfx, glow_on(1.6), 0.38, 0.45); place(sfx, shimmer(1.6, 2100), 0.5, 0.18)
# 2 orbit; glass x-ray; tags
place(sfx, whoosh(1.1, 0.08), at(1, 0.0) - 0.2, 0.35, -0.3); place(sfx, shimmer(1.2, 1500), at(1, 2.9), 0.22)
place(sfx, glow_on(1.0), at(1, 3.6), 0.25); place(sfx, pop(1100), at(1, 4.4), 0.25, 0.4); place(sfx, pop(700), at(1, 6.0), 0.3, -0.4)
# 3 lid opens into layers
place(sfx, whoosh(0.6, 0.15), at(2, 0.0) - 0.15, 0.3, 0.3)
for k in range(3): place(sfx, whoosh(0.45, 0.2), at(2, 0.9 + k * 0.42), 0.28, (k - 1) * 0.5); place(sfx, click(), at(2, 1.1 + k * 0.42), 0.3)
for k in range(4): place(sfx, pop(900 + 80 * k), at(2, 1.9 + k * 0.05), 0.12, (k - 1.5) * 0.4)
# 4 four LEDs: one tick + spark each
place(sfx, whoosh(0.6, 0.12), at(3, 0.0) - 0.15, 0.25)
for i in range(4): place(sfx, tick(2400 + 300 * i, 0.08), at(3, 0.8 + i * 0.35), 0.4, [-0.6, 0.6, -0.3, 0.3][i]); place(sfx, shimmer(0.5, 2600 + 200 * i), at(3, 0.8 + i * 0.35), 0.08)
place(sfx, pop(1200), at(3, 2.2), 0.2, -0.4); place(sfx, pop(1000), at(3, 3.4), 0.2, 0.4)
# 5 bounce → spread → shine; layers close
place(sfx, shimmer(1.0, 1700), at(4, 0.1), 0.2, -0.3); place(sfx, shimmer(1.0, 2000), at(4, 0.8), 0.2, 0.3)
place(sfx, shimmer(1.6, 1300), at(4, 2.2), 0.22); place(sfx, glow_on(1.5), at(4, 3.0), 0.4)
place(sfx, pop(1300), at(4, 4.0), 0.22, 0.4); place(sfx, whoosh(1.0, 0.1), at(4, 5.3), 0.3); place(sfx, thunk(), at(4, 6.5), 0.5)
# 6 room light up, down; the switch
place(sfx, whoosh(0.8, 0.06), at(5, 2.2), 0.25, 0.3); place(sfx, glow_on(0.9), at(5, 2.4), 0.2)
place(sfx, whoosh(0.8, 0.04), at(5, 3.8), 0.25, -0.3)
place(sfx, pop(800), at(5, 5.4), 0.2); place(sfx, click(), at(5, 6.3), 0.7); place(sfx, thunk(), at(5, 6.35), 0.25)
# 7 zoom out onto the MacBook screen, the card pops, Subscribe
place(sfx, whoosh(1.8, 0.07), B[6] + 0.05, 0.45); place(sfx, shimmer(1.0, 1600), B[6] + 1.1, 0.15)
for k, b in enumerate([0.0, 0.12, 0.22, 0.35, 0.43, 0.51]): place(sfx, pop(700 + 90 * k), B[6] + 1.5 + 1.5 * b, 0.16, (k % 3 - 1) * 0.4)
place(sfx, tick(1800, 0.25) + tick(2700, 0.25) * 0.6, B[6] + 1.5 + 1.5 * 0.62, 0.35); place(sfx, pop(950), B[6] + 1.5 + 1.5 * 0.75, 0.22)
sfx /= max(1, np.max(np.abs(sfx)) / 0.9)
sf.write('music.wav', music.astype(np.float32), SR); sf.write('sfx.wav', sfx.astype(np.float32), SR)
print('ok', DUR)
