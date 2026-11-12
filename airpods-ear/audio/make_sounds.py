"""Synthesise the music and sound effects for the AirPods ear-detection Short (all original, no samples).
Writes song.wav (the track in the player), bed.wav (quiet music under the voice) and sfx.wav, 48 kHz stereo, 50 s."""
import numpy as np, soundfile as sf
SR = 48000; DUR = 50.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR
def env(n, a=0.005, r=0.2, shape=4.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4)); return e
def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def lp(x, a):  # one-pole low-pass, a in (0,1): higher = brighter
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def noise(n): return rng.standard_normal(n)
def sine(f, n, ph=0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR + ph)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- the song in the player: warm lo-fi loop, 88 bpm ----------
def song(seconds):
    n = int(seconds * SR); out = np.zeros((n, 2)); beat = 60 / 88
    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]   # Am7 Fmaj7 Cmaj7 G7
    bar = 4 * beat
    for b in range(int(seconds / bar) + 1):
        ch = chords[b % 4]; at = b * bar
        for k, m in enumerate(ch):    # electric-piano chord
            L = int(bar * SR); f = midi(m); tt = np.arange(L) / SR
            tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 3)) * env(L, 0.01, 1.6, 2.2)
            place(out, tone, at + k * 0.012, 0.07, (k - 1.5) * 0.3)
        L = int(bar * SR); tt = np.arange(L) / SR; bass = np.sin(2 * np.pi * midi(ch[0] - 12) * tt) * env(L, 0.01, 1.2, 1.5)
        place(out, bass, at, 0.22)
        for q in range(4):            # drums: kick on 1 and 3, snare on 2 and 4, hats on 8ths
            bt = at + q * beat
            if q in (0, 2): L = int(0.35 * SR); tt = np.arange(L) / SR; place(out, np.sin(2 * np.pi * (45 + 90 * np.exp(-tt * 30)) * tt) * env(L, 0.002, 0.25, 6), bt, 0.5)
            else: L = int(0.2 * SR); place(out, lp(noise(L), 0.35) * env(L, 0.001, 0.12, 7), bt, 0.22)
            for h in (0, 0.5): L = int(0.05 * SR); place(out, (noise(L) - lp(noise(L), 0.2)) * env(L, 0.001, 0.03, 6), bt + h * beat, 0.06, 0.3)
    m = np.max(np.abs(out)); return out / m * 0.6
S = song(12.0)
song_track = np.zeros((N, 2))
cut = int(1.30 * SR); fade = int(0.03 * SR)
a = S[:cut].copy(); a[-fade:] *= np.linspace(1, 0, fade)[:, None]; song_track[:cut] += a          # plays, then stops when the bud comes out
res = int(46.70 * SR); b = S[int(1.30 * SR): int(1.30 * SR) + (N - res)].copy()                   # resumes where it left off
b[:fade] *= np.linspace(0, 1, fade)[:, None]; song_track[res:] += b
song_track[-int(0.4 * SR):] *= np.linspace(1, 0.55, int(0.4 * SR))[:, None]                       # ease into the loop point
sf.write('song.wav', song_track.astype(np.float32), SR)

# ---------- quiet bed under the narration: soft pad + slow pulse ----------
bed = np.zeros((N, 2))
pads = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]]
seg = 5.5
for i in range(int(DUR / seg) + 1):
    at = 1.6 + i * seg
    if at > 46.2: break
    L = int((seg + 2.0) * SR); tt = np.arange(L) / SR
    sw = np.minimum(1, tt / 1.8) * np.minimum(1, (L / SR - tt) / 1.8)
    for k, m in enumerate(pads[i % 4]):
        f = midi(m); v = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt + 1) + 0.2 * np.sin(4 * np.pi * f * tt)) * sw
        place(bed, v, at, 0.035, (k - 1.5) * 0.35)
beat = 60 / 88
for k in range(int(44 / beat)):   # soft heartbeat pulse
    at = 2.2 + k * beat
    if at > 45.6: break
    L = int(0.3 * SR); tt = np.arange(L) / SR; place(bed, np.sin(2 * np.pi * (50 + 40 * np.exp(-tt * 25)) * tt) * env(L, 0.003, 0.2, 6), at, 0.12)
fi = int(0.8 * SR); s0 = int(1.6 * SR); bed[s0:s0 + fi] *= np.linspace(0, 1, fi)[:, None]
e0 = int(45.4 * SR); bed[e0:e0 + int(1.2 * SR)] *= np.linspace(1, 0, int(1.2 * SR))[:, None]; bed[e0 + int(1.2 * SR):] = 0
sf.write('bed.wav', bed.astype(np.float32), SR)

# ---------- sound effects ----------
fx = np.zeros((N, 2))
def whoosh(d, up=True, bright=0.25):
    L = int(d * SR); x = noise(L); e = np.sin(np.pi * np.arange(L) / L) ** 2
    cut = np.linspace(0.04, bright, L) if up else np.linspace(bright, 0.04, L)
    y = np.empty(L); acc = 0
    for i in range(L): acc += cut[i] * (x[i] - acc); y[i] = acc
    return y * e * 3
def click(f=2200, d=0.04): L = int(d * SR); tt = np.arange(L) / SR; return np.sin(2 * np.pi * f * tt) * env(L, 0.0005, 0.02, 5)
def blip(f=1200, d=0.09, f2=None):
    L = int(d * SR); tt = np.arange(L) / SR; ff = np.full(L, f) if f2 is None else np.linspace(f, f2, L)
    return sine(ff, L) * env(L, 0.002, d * 0.6, 4)
def chime(notes, d=0.9):
    L = int(d * SR); tt = np.arange(L) / SR; y = np.zeros(L)
    for k, m in enumerate(notes):
        o = int(k * 0.07 * SR); f = midi(m); y[o:] += (np.sin(2 * np.pi * f * tt[: L - o]) + 0.3 * np.sin(6 * np.pi * f * tt[: L - o])) * env(L - o, 0.003, 0.6, 3)
    return y
def buzz(d=0.35):
    L = int(d * SR); tt = np.arange(L) / SR; sq = np.sign(np.sin(2 * np.pi * 110 * tt)) + np.sign(np.sin(2 * np.pi * 116.5 * tt))
    return lp(sq, 0.18) * env(L, 0.003, d, 2.5)
def hum(d, f=160):
    L = int(d * SR); tt = np.arange(L) / SR; e = np.minimum(1, tt / 0.4) * np.minimum(1, (d - tt) / 0.5)
    return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt) + 0.15 * np.sin(2 * np.pi * f * 3 * tt)) * e * (0.8 + 0.2 * np.sin(2 * np.pi * 6 * tt))
def shimmer(d):
    L = int(d * SR); tt = np.arange(L) / SR; y = np.zeros(L)
    for k in range(10):
        f = 1800 + 400 * k + rng.uniform(-50, 50); y += np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 9) * tt))
    return y / 10 * np.sin(np.pi * tt / d) ** 1.5
def zap(d=0.45, f0=1400, f1=600):
    L = int(d * SR); tt = np.arange(L) / SR; return (sine(np.linspace(f0, f1, L), L) * 0.6 + lp(noise(L), 0.3) * 0.3) * env(L, 0.004, d, 3)
def thump(): L = int(0.4 * SR); tt = np.arange(L) / SR; return np.sin(2 * np.pi * (40 + 70 * np.exp(-tt * 18)) * tt) * env(L, 0.002, 0.3, 5)

# hook
place(fx, whoosh(0.7, True, 0.3), 0.75, 0.5, 0.3)          # bud pulled out
place(fx, click(1600, 0.05), 1.30, 0.55); place(fx, click(900, 0.06), 1.33, 0.4)   # pause tap
place(fx, blip(880, 0.12, 1320), 2.25, 0.25)             # "How did it know?"
# cuts
for c in (4.0, 15.0, 25.0, 35.0, 45.0): place(fx, whoosh(0.5, False, 0.2), c - 0.25, 0.35)
# x-ray
place(fx, shimmer(2.2), 4.8, 0.22)                        # shell turns to glass
place(fx, hum(7.6, 150), 7.2, 0.10)                      # sensor glows
for k, at in enumerate((6.6, 6.7, 6.8)): place(fx, blip(1000 + 200 * k, 0.07), at, 0.16, (k - 1) * 0.4)   # part labels
place(fx, blip(1300, 0.08), 7.4, 0.2)
place(fx, whoosh(3.0, True, 0.12), 9.6, 0.3)             # fly in
place(fx, blip(1500, 0.09), 12.4, 0.2, -0.3); place(fx, blip(1700, 0.09), 13.0, 0.2, 0.3)
# skin
place(fx, zap(0.5, 1200, 700), 15.8, 0.2); place(fx, hum(8.6, 180), 15.9, 0.06)
for k in range(5): place(fx, blip(900 - 60 * k, 0.06), 19.0 + k * 0.28, 0.12, 0.3)   # light coming back
place(fx, chime([72, 76, 79]), 21.5, 0.22)                # Skin ✓
# table
place(fx, zap(0.5, 1200, 700), 25.6, 0.2); place(fx, hum(8.6, 180), 25.7, 0.05)
for k in range(3): place(fx, blip(700 - 80 * k, 0.06), 27.7 + k * 0.33, 0.1, -0.3)
place(fx, blip(1100, 0.1, 1500), 28.4, 0.2)                # reflection-check card
L = int(1.8 * SR); tt = np.arange(L) / SR; place(fx, np.sin(2 * np.pi * np.cumsum(np.linspace(500, 900, L)) / SR) * np.minimum(1, tt / 0.1) * np.minimum(1, (1.8 - tt) / 0.2) * 0.5, 28.6, 0.08)   # line draws
place(fx, buzz(0.38), 30.4, 0.28); place(fx, thump(), 30.4, 0.4)   # NOT SKIN
# (no player on the table shot)
# signal
for k in range(12): place(fx, blip(700 + 70 * k, 0.05), 36.0 + k * 0.22, 0.12)   # signal runs along the flex
place(fx, chime([79, 84], 0.6), 38.5, 0.16)              # H2 lights up
for k in range(4): place(fx, blip(2400, 0.12, 1800), 39.0 + k * 0.55, 0.1, 0.2)  # radio pings
place(fx, click(1600, 0.05), 41.0, 0.45); place(fx, click(900, 0.06), 41.03, 0.35)   # pause
# payoff
place(fx, whoosh(0.9, False, 0.25), 45.2, 0.45)          # back in
place(fx, thump(), 46.25, 0.3)
place(fx, click(1600, 0.05), 46.68, 0.5); place(fx, click(1100, 0.06), 46.71, 0.4)  # play tap
place(fx, chime([76, 79, 84]), 47.4, 0.16)
sf.write('sfx.wav', fx.astype(np.float32), SR)
print('song', np.abs(song_track).max(), 'bed', np.abs(bed).max(), 'sfx', np.abs(fx).max())
