"""Music + sound effects for the Internet Short hook (all synthesised here, no samples, no copyrighted music).
Writes bed.wav (music), sfx.wav (torch clicks, whooshes, crickets, reveal hit) at 48 kHz stereo.
Times match hook.html (HOOK_A / HOOK_B blinks, camera moves, voice at 3.4 s and 4.85 s)."""
import numpy as np, soundfile as sf
SR = 48000; DUR = 50.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def env(n, a=0.005, r=0.2, shape=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def hp(x, a): return x - lp(x, a)

# ---------------- music bed: night, curious, 96 bpm ----------------
bed = np.zeros((N, 2))
beat = 60 / 96
# warm pad (A minor add9 -> F maj7), slow attack
CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for at, chord in [(0.0, CH[0]), (2.5, CH[1]), (5.0, CH[2]), (7.4, CH[3])] + [(9.9 + 2.5 * j, CH[(j + 4) % 6]) for j in range(15)]:
    L = int(2.8 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(chord):
        f = midi(m)
        tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        e = np.minimum(1, tt / 0.6) * np.minimum(1, (2.8 - tt) / 0.5).clip(0)
        place(bed, tone * e, at, 0.045, (k - 1.5) * 0.4)
# pluck motif (like blinking lights): eighth notes
motif = [69, 76, 72, 76, 69, 76, 74, 76, 65, 72, 69, 72, 65, 72, 71, 72]
for i, m in enumerate(motif * 14):
    at = i * beat / 2
    if at > 47.4: break
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(m + 12)
    tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5)
    place(bed, tone, at, 0.05, 0.35 if i % 2 else -0.35)
# soft kick + sub on the beat, starts at bar 2
for q in range(100):
    at = q * beat
    if at < beat * 4 - 0.01 or at > 47.4: continue
    L = int(0.4 * SR); tt = np.arange(L) / SR
    place(bed, np.sin(2 * np.pi * (42 + 70 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 6), at, 0.32)
# the pause before the voice: music dips 3.05-3.4 then comes back quieter
t = np.arange(N) / SR
gain = np.ones(N)
gain[(t > 3.05) & (t < 3.4)] = 0.12
ramp = (t >= 3.4) & (t < 3.7); gain[ramp] = 0.12 + (t[ramp] - 3.4) / 0.3 * 0.88
bed *= gain[:, None]
# fade in / out
bed *= np.minimum(1, t / 0.25)[:, None] * np.clip((DUR - t) / 0.3, 0, 1)[:, None]

# ---------------- sound effects ----------------
sfx = np.zeros((N, 2))
# crickets (night ambience)
for k in range(80):
    at = rng.uniform(0, 34.0); L = int(0.18 * SR); tt = np.arange(L) / SR
    chirp = np.sin(2 * np.pi * 4600 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * tt))) * env(L, 0.01, 0.18, 2)
    place(sfx, chirp, at, 0.012, rng.uniform(-0.8, 0.8))
# torch clicks: phone torch on (tick) and off (softer)
A = []  # the girl has no torch
B = [[1.15, 1.45], [2.0, 2.95], [3.75, 8.2], [8.95, 9.5]]  # only the boy blinks
BIT0, BITD, HB = 10.55, 0.14, [0, 1, 0, 0, 1, 0, 0, 0]
B += [[BIT0 + b * BITD, BIT0 + b * BITD + 0.1] for b in range(8) if HB[b]]
# fast flicker for "hello" (same rule as hook.html: sin(2*pi*4.5*t) > 0.2 between 12.45 and 15.3)
FLICK = []  # the fast hello flicker was removed
_unused = []; tt_ = np.arange(int(12.45 * 1000), int(15.3 * 1000)) / 1000; on_ = np.sin(tt_ * 2 * np.pi * 4.5) > 0.2
edges = np.flatnonzero(np.diff(on_.astype(int))); st = None
for e in edges:
    if on_[e + 1]: st = tt_[e + 1]
    elif st is not None: _unused.append([st, tt_[e]]); st = None
def click(gain):
    L = int(0.03 * SR); n = hp(rng.standard_normal(L), 0.3) * env(L, 0.0005, 0.012, 3)
    tt = np.arange(L) / SR; tick = np.sin(2 * np.pi * 2400 * tt) * env(L, 0.0005, 0.01, 4)
    return (n * 0.6 + tick) * gain
for on, off in FLICK:
    place(sfx, click(0.22), on, 1, -0.2)
for lst, pan in ((A, 0.35), (B, -0.35)):
    for on, off in lst:
        place(sfx, click(0.55), on, 1, pan)
        place(sfx, click(0.3), off, 1, pan)
        # a faint light "shimmer" while the torch is on
        L = int((off - on) * SR); tt = np.arange(L) / SR
        sh = sum(np.sin(2 * np.pi * f * tt) for f in (2093, 2637, 3136)) / 3 * np.minimum(1, tt / 0.03) * np.minimum(1, (off - on - tt) / 0.05).clip(0)
        place(sfx, sh, on, 0.02, pan)
# whooshes on camera moves
def whoosh(dur, up=True):
    L = int(dur * SR); tt = np.arange(L) / SR; n = rng.standard_normal(L)
    sweep = np.linspace(0.02, 0.25, L) if up else np.linspace(0.25, 0.02, L)
    y = np.empty(L); acc = 0.0
    for i in range(L): acc += sweep[i] * (n[i] - acc); y[i] = acc
    return y * np.sin(np.pi * tt / dur) ** 2
for at, d, up in [(0.55, 0.5, True), (1.75, 0.45, True), (2.9, 0.45, False), (3.45, 0.5, True), (4.45, 0.6, True), (5.65, 0.7, False),
                  (8.4, 0.55, True), (10.35, 0.6, False), (14.15, 0.45, True), (15.35, 0.55, False), (17.0, 0.6, True), (19.0, 0.7, False),
                  (20.4, 0.8, False), (22.6, 0.7, True), (25.1, 0.7, True), (28.5, 0.8, False), (30.4, 0.8, True),
                  (33.9, 0.8, False), (36.9, 0.6, True), (38.9, 0.7, False), (42.7, 0.5, True), (45.85, 0.6, True)]:
    place(sfx, whoosh(d, up), at, 0.5, 0)
# reveal: soft riser into "That's the internet." and a warm hit + sparkle as the title lands
L = int(0.6 * SR); tt = np.arange(L) / SR
place(sfx, np.sin(2 * np.pi * (300 + 900 * tt / 0.6) * tt) * (tt / 0.6) ** 2 * 0.5, 6.35, 0.05)
L = int(1.6 * SR); tt = np.arange(L) / SR
hit = (np.sin(2 * np.pi * 55 * tt) * 0.8 + np.sin(2 * np.pi * 110 * tt) * 0.3) * env(L, 0.003, 1.0, 3)
place(sfx, hit, 7.0, 0.45)
for k, m in enumerate([81, 84, 88, 93]):
    L = int(0.9 * SR); tt = np.arange(L) / SR
    place(sfx, np.sin(2 * np.pi * midi(m) * tt) * env(L, 0.003, 0.7, 4), 7.1 + k * 0.06, 0.06, (k - 1.5) * 0.4)

# ---------------- part 2 effects ----------------
def blip(f, d=0.12):
    L = int(d * SR); tt = np.arange(L) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, d, 4)
place(sfx, blip(1320, 0.25), 8.97, 0.22)      # "one"
place(sfx, blip(520, 0.25), 9.52, 0.22)       # "zero"
for b in range(8):                            # the 8 bits of H: high blip = 1, low blip = 0
    place(sfx, blip(1320 if HB[b] else 660), BIT0 + b * BITD, 0.16, -0.3)
for k, m in enumerate([76, 81, 85, 88]):      # H lands: little chime
    L = int(0.8 * SR); tt = np.arange(L) / SR
    place(sfx, np.sin(2 * np.pi * midi(m) * tt) * env(L, 0.003, 0.6, 4), 11.55 + 0.6 + k * 0.05, 0.07, 0.3)
for j in range(40):                           # counter ticks up to 40 blinks
    place(sfx, blip(2400, 0.03), 12.45 + j * 1.5 / 40, 0.05, 0)
L = int(1.0 * SR); tt = np.arange(L) / SR      # sleepy "hmm" (soft low-passed breath) for "Too slow."
place(sfx, lp(rng.standard_normal(L), 0.04) * np.sin(np.pi * tt / 1.0) ** 2 * 3, 14.4, 0.25, 0.3)
L = int(0.9 * SR); tt = np.arange(L) / SR      # wire stretches across: rising zip, then a clip snap
zip_ = np.sign(np.sin(2 * np.pi * (80 + 500 * tt / 0.9) * tt)) * env(L, 0.05, 0.9, 1.2)
place(sfx, lp(zip_, 0.2), 15.75, 0.08)
place(sfx, click(0.8), 16.65, 1, 0.3)
L = int((19.8 - 17.1) * SR); tt = np.arange(L) / SR   # electric hum + crackle as the pulses race
hum = (np.sin(2 * np.pi * 100 * tt) + 0.5 * np.sin(2 * np.pi * 200 * tt) + 0.2 * np.sin(2 * np.pi * 300 * tt)) * np.minimum(1, tt / 0.3)
place(sfx, hum * np.clip((19.8 - 17.1 - tt) / 0.4, 0, 1), 17.1, 0.035)
for j in range(14):
    place(sfx, whoosh(0.18, True), 17.2 + j * 0.17, 0.12, rng.uniform(-0.5, 0.5))
for j in range(30):                           # billion counter ticks
    place(sfx, blip(2600, 0.025), 17.4 + j * 1.2 / 30, 0.04, 0)
place(sfx, blip(1760, 0.5), 18.62, 0.12)      # counter lands
# ---------------- part 3 effects: router, IP address, packets ----------------
for j in range(8):                            # devices pop in each flat
    place(sfx, blip(880 + 110 * j, 0.09), 19.9 + 0.3 + j * 0.16, 0.12, (j % 2) * 0.6 - 0.3)
L = int(0.5 * SR); tt = np.arange(L) / SR      # router lands: soft thunk + rising beep
place(sfx, np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 20)) * tt) * env(L, 0.002, 0.35, 5), 22.25, 0.5)
place(sfx, blip(1046, 0.12), 22.6, 0.12); place(sfx, blip(1568, 0.18), 22.72, 0.12)
for j in range(8):                            # cables zip to the router
    place(sfx, whoosh(0.22, True), 22.85 + j * 0.12, 0.18, (j % 2) * 0.8 - 0.4)
place(sfx, click(0.7), 26.3, 1, 0.2)          # FLAT 7 plate
place(sfx, blip(1975, 0.3), 28.0, 0.14)       # her IP tag
for j in range(7):                            # the other tags
    place(sfx, blip(1568 + 60 * j, 0.08), 29.3 + j * 0.08, 0.07, rng.uniform(-0.5, 0.5))
L = int(0.6 * SR); tt = np.arange(L) / SR      # video breaks into packets
place(sfx, hp(rng.standard_normal(L), 0.5) * env(L, 0.003, 0.35, 5), 30.05, 0.25)
for k, m in enumerate([72, 76, 79, 84]):
    place(sfx, blip(midi(m), 0.12), 30.1 + k * 0.05, 0.08)
for j in range(10):                           # packets tick through the router
    place(sfx, blip(1320, 0.05), 30.25 + j * 0.32, 0.08, -0.3)
    place(sfx, blip(1760, 0.05), 30.25 + j * 0.32 + 1.1, 0.08, 0.3)
# ---------------- part 4: under the sea, the cut, this video, end card ----------------
# final chord + fade under the end card
L = int(3.0 * SR); tt = np.arange(L) / SR
for k, m in enumerate([57, 64, 69, 72, 76]):
    tone = sum(np.sin(2 * np.pi * midi(m) * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
    place(bed, tone * np.minimum(1, tt / 0.4) * np.clip((3.0 - tt) / 1.2, 0, 1), 47.5, 0.05, (k - 2) * 0.35)
L = int(11.5 * SR); tt = np.arange(L) / SR       # underwater ambience
amb = lp(rng.standard_normal(L), 0.01) * 6 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tt))
place(sfx, amb * np.minimum(1, tt / 0.6) * np.clip((11.5 - tt) / 0.8, 0, 1), 34.3, 0.12)
for k in range(10):                               # light zinging through the glass fibre
    place(sfx, blip(2093 * (1 + 0.06 * (k % 4)), 0.12), 37.0 + k * 0.16, 0.05, (k % 2) * 0.6 - 0.3)
for j in range(6):                                # cables light up
    place(sfx, blip(midi(76 + j * 2), 0.3), 39.2 + j * 0.15, 0.05, (j - 2.5) * 0.3)
L = int(1.2 * SR); tt = np.arange(L) / SR         # sonar ping
place(sfx, np.sin(2 * np.pi * 1200 * tt) * env(L, 0.005, 1.1, 3), 39.6, 0.06)
L = int(0.8 * SR); tt = np.arange(L) / SR         # anchor splash
place(sfx, lp(rng.standard_normal(L), 0.25) * env(L, 0.005, 0.6, 4), 42.35, 0.5)
for k in range(14):                               # chain rattle
    place(sfx, hp(rng.standard_normal(int(0.03 * SR)), 0.5) * env(int(0.03 * SR), 0.001, 0.02, 3), 42.45 + k * 0.05, 0.25, -0.2)
L = int(0.25 * SR); tt = np.arange(L) / SR         # the cut: crack + electric fizz
place(sfx, hp(rng.standard_normal(L), 0.6) * env(L, 0.001, 0.15, 5), 43.55, 0.6)
L = int(0.9 * SR); tt = np.arange(L) / SR
place(sfx, np.sign(np.sin(2 * np.pi * 90 * tt)) * hp(rng.standard_normal(L), 0.4) * env(L, 0.01, 0.8, 3), 43.6, 0.12)
for j in range(6):                                # hundreds of cables hum on
    place(sfx, blip(midi(64 + j), 0.25), 44.0 + j * 0.08, 0.04)
for j in range(6):                                # packets reroute
    place(sfx, blip(1568, 0.06), 45.0 + j * 0.12, 0.07, 0.2)
place(sfx, blip(midi(88), 0.6), 46.5, 0.1); place(sfx, blip(midi(93), 0.6), 46.62, 0.08)   # phone lights up
L = int(1.2 * SR); tt = np.arange(L) / SR         # end card swell + Subscribe bell
place(sfx, np.sin(2 * np.pi * (200 + 300 * tt / 1.2) * tt) * (tt / 1.2) ** 2 * np.clip((1.2 - tt) / 0.2, 0, 1), 47.0, 0.04)
for k, m in enumerate([84, 91]):
    L2 = int(1.4 * SR); t2 = np.arange(L2) / SR
    place(sfx, (np.sin(2 * np.pi * midi(m) * t2) + 0.4 * np.sin(2 * np.pi * midi(m) * 2.76 * t2)) * env(L2, 0.002, 1.2, 3), 48.6 + k * 0.12, 0.06)
sf.write('bed.wav', bed.astype(np.float32), SR)
sf.write('sfx.wav', sfx.astype(np.float32), SR)
print('ok', DUR, 's')
