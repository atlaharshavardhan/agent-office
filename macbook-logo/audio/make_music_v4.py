"""V4: the same music bed at the ~40 s length (fade-out lands on the new end). Generated from make_sounds_v2.py.
Music and sound effects for the MacBook logo Short, synthesised in code (original, no samples).
Writes music.wav (bed, starts at 0 s: music-first hook) and sfx.wav, 48 kHz stereo, the length of the voice timeline.
Effect times follow the scene page: scenes 2–6 are stretched from their v1 lengths (ORIG) onto this voice's cuts."""
import json, sys, numpy as np, soundfile as sf
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'george40'
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


sf.write('music_v4.wav' if VOICE == 'george40' else f'music_{VOICE}.wav', music.astype(np.float32), SR); print('ok', DUR)
