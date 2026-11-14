"""Music + sound effects for the Internet Short hook (all synthesised here, no samples, no copyrighted music).
Writes bed.wav (music), sfx.wav (torch clicks, whooshes, crickets, reveal hit) at 48 kHz stereo.
Times match hook.html (HOOK_A / HOOK_B blinks, camera moves, voice at 3.4 s and 4.85 s)."""
import numpy as np, soundfile as sf
SR = 48000; DUR = 8.4; N = int(SR * DUR)
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
for at, chord in [(0.0, [57, 64, 67, 71]), (2.5, [53, 60, 64, 69]), (5.0, [57, 64, 67, 72]), (7.4, [53, 60, 64, 69])]:
    L = int(2.8 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(chord):
        f = midi(m)
        tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        e = np.minimum(1, tt / 0.6) * np.minimum(1, (2.8 - tt) / 0.5).clip(0)
        place(bed, tone * e, at, 0.045, (k - 1.5) * 0.4)
# pluck motif (like blinking lights): eighth notes
motif = [69, 76, 72, 76, 69, 76, 74, 76, 65, 72, 69, 72, 65, 72, 71, 72]
for i, m in enumerate(motif * 2):
    at = i * beat / 2
    if at > 8.2: break
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(m + 12)
    tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5)
    place(bed, tone, at, 0.05, 0.35 if i % 2 else -0.35)
# soft kick + sub on the beat, starts at bar 2
for q in range(30):
    at = q * beat
    if at < beat * 4 - 0.01 or at > 8.2: continue
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
for k in range(26):
    at = rng.uniform(0, 6.2); L = int(0.18 * SR); tt = np.arange(L) / SR
    chirp = np.sin(2 * np.pi * 4600 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * tt))) * env(L, 0.01, 0.18, 2)
    place(sfx, chirp, at, 0.012, rng.uniform(-0.8, 0.8))
# torch clicks: phone torch on (tick) and off (softer)
A = []  # the girl has no torch
B = [[1.15, 1.35], [1.5, 1.7], [2.05, 2.95], [3.7, 3.9], [4.05, 4.25], [4.45, 8.2]]  # only the boy blinks
def click(gain):
    L = int(0.03 * SR); n = hp(rng.standard_normal(L), 0.3) * env(L, 0.0005, 0.012, 3)
    tt = np.arange(L) / SR; tick = np.sin(2 * np.pi * 2400 * tt) * env(L, 0.0005, 0.01, 4)
    return (n * 0.6 + tick) * gain
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
for at, d, up in [(0.55, 0.5, True), (1.75, 0.45, True), (2.9, 0.45, False), (3.45, 0.5, True), (4.45, 0.6, True), (5.65, 0.7, False)]:
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

sf.write('bed.wav', bed.astype(np.float32), SR)
sf.write('sfx.wav', sfx.astype(np.float32), SR)
print('ok', DUR, 's')
