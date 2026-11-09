"""Synthesise the scene's sound effects (no samples needed). Writes public/audio/sfx_*.wav"""
import numpy as np, soundfile as sf
SR = 44100
rng = np.random.default_rng(3)
t_ = lambda d: np.arange(int(SR * d)) / SR

def env(n, a=0.01, r=0.2):
    e = np.ones(n); A = int(SR * a); R = int(SR * r)
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R) ** 2
    return e

def lowpass(x, cutoff):
    # one-pole low-pass with time-varying cutoff (array or scalar)
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y

def bandish(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)

def norm(x, peak=0.8):
    return x / (np.abs(x).max() + 1e-9) * peak

def save(name, x):
    sf.write(f"public/audio/sfx_{name}.wav", np.clip(x, -1, 1).astype(np.float32), SR)

# whoosh: noise sweep up then down
d = 0.7; n = int(SR * d); t = t_(d)
cut = 300 + 3500 * np.sin(np.pi * t / d) ** 2
save("whoosh", norm(lowpass(rng.standard_normal(n), cut) * np.sin(np.pi * t / d) ** 1.5, 0.7))
# reverse whoosh (for the pull back out)
save("whoosh_back", norm(lowpass(rng.standard_normal(n), cut[::-1]) * (np.sin(np.pi * t / d) ** 1.5), 0.6))
# tape rewind blip: fast warbling descending chirp
d = 0.45; t = t_(d)
f = 1800 * np.exp(-t * 4) + 300 + 120 * np.sin(2 * np.pi * 28 * t)
ph = 2 * np.pi * np.cumsum(f) / SR
save("rewind", norm((np.sign(np.sin(ph)) * 0.35 + np.sin(ph)) * env(len(t), 0.005, 0.12), 0.45))
# tap: short click
d = 0.06; t = t_(d)
save("tap", norm(np.sin(2 * np.pi * 900 * t) * np.exp(-t * 90) + 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 200), 0.6))
# send ping: two quick rising tones
d = 0.35; t = t_(d)
p = np.where(t < 0.12, np.sin(2 * np.pi * 880 * t), np.sin(2 * np.pi * 1320 * t)) * np.exp(-((t % 0.12) * 14))
save("ping", norm(p * env(len(t), 0.003, 0.1), 0.4))
# crowd murmur: band-limited noise, slow random swells
d = 5.5; n = int(SR * d); t = t_(d)
m = bandish(rng.standard_normal(n), 250, 1100)
sw = 0.6 + 0.4 * np.interp(t, np.linspace(0, d, 24), rng.random(24))
save("crowd", norm(m * sw * env(n, 0.6, 1.2), 0.35))
# queue tick: soft wooden tick
d = 0.08; t = t_(d)
save("tick", norm(np.sin(2 * np.pi * 1600 * t) * np.exp(-t * 120) + np.sin(2 * np.pi * 520 * t) * np.exp(-t * 60), 0.35))
# stamp thud: low sine drop + noise slap
d = 0.5; t = t_(d)
th = np.sin(2 * np.pi * (110 * np.exp(-t * 6) + 45) * t) * np.exp(-t * 9)
sl = lowpass(rng.standard_normal(len(t)), 1800) * np.exp(-t * 40)
save("stamp", norm(th + 1.4 * sl, 0.9))
# sigh: breathy noise, inhale short + long exhale with falling formant
d = 1.6; n = int(SR * d); t = t_(d)
shape = np.interp(t, [0, 0.25, 0.4, 0.5, 1.4, 1.6], [0, 0.35, 0.2, 0.9, 0.15, 0])
form = np.interp(t, [0, 0.5, 1.6], [1600, 1300, 700])
save("sigh", norm(bandish(rng.standard_normal(n), 300, form) * shape, 0.5))
# station chime: three-note bell (G-E-C)
notes = [784, 659, 523]; out = np.zeros(int(SR * 1.8))
for i, fr in enumerate(notes):
    t = t_(1.2); s = int(SR * 0.28 * i)
    bell = (np.sin(2 * np.pi * fr * t) + 0.35 * np.sin(2 * np.pi * fr * 2.01 * t) + 0.15 * np.sin(2 * np.pi * fr * 3.02 * t)) * np.exp(-t * 3.2)
    out[s:s + len(t)] += bell
save("chime", norm(out, 0.55))
print("ok")
