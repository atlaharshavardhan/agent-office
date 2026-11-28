"""Sound effects for the Part 2 hook plan B (Harsh, 28 Nov 2026): light cable shortened to 1.5 s, satellite question on the globe. Made in code, free. Preview mix with the already recorded lines (no new ElevenLabs).
Timeline: 0-2.2 Hyderabad | 2.2-3.4 globe, pins pop | 3.4-4.9 light cable | 4.9-6.9 globe + satellite + cross + cables | 6.9-9.2 London | 9.2-12 notification."""
import numpy as np, soundfile as sf, subprocess, os
SR = 48000; DUR = 12.0; N = int(DUR * SR); out = np.zeros((N, 2)); rng = np.random.default_rng(5); os.makedirs('video/part2hook12', exist_ok=True)
def put(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    L = int(d * SR); t = np.arange(L) / SR; return (np.sin(2 * np.pi * f * t) + h * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / a) * np.exp(-sh * t / r)
tick = lambda: (lambda L, t: (rng.normal(0, 1, L) * np.exp(-90 * t) * 0.5 + np.sin(2 * np.pi * 1500 * t) * np.exp(-60 * t)) * 0.6)(int(0.05 * SR), np.arange(int(0.05 * SR)) / SR)
def buzz():
    o = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); t = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * t) + 0.5 * np.sin(2 * np.pi * 300 * t) + 0.25 * np.sign(np.sin(2 * np.pi * 150 * t))) * np.minimum(1, t / 0.01) * np.minimum(1, (0.22 - t) / 0.03); o[int(k * 0.3 * SR): int(k * 0.3 * SR) + L] += s * 0.5
    return o
def bloop(f0):    # a pin pops in: a quick rising pitch, soft
    L = int(0.22 * SR); t = np.arange(L) / SR; f = f0 * (1 + 0.9 * (1 - np.exp(-t * 28))); ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.minimum(1, t / 0.004) * np.exp(-t * 14)
def shimmer(d):   # light racing along the cable: a glassy tone that rises, with fast tiny sparkles. A soft tone, not a whoosh.
    L = int(d * SR); t = np.arange(L) / SR; f = 520 * (1 + 1.6 * (t / d) ** 1.4); ph = 2 * np.pi * np.cumsum(f) / SR
    base = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 0.2).clip(0)
    sp = np.zeros(L)
    for k in range(26): at = int(rng.uniform(0, d - 0.1) * SR); tt = np.arange(int(0.06 * SR)) / SR; sp[at: at + len(tt)] += np.sin(2 * np.pi * rng.uniform(3000, 6500) * tt) * np.exp(-tt * 60) * 0.25
    return base * 0.35 + sp
def radar():      # the satellite: a soft sonar ping with an echo
    a = tone(1100, 0.7, 0.004, 0.5, 5); b = np.concatenate([np.zeros(int(0.18 * SR)), tone(1100, 0.5, 0.004, 0.4, 5)]); o = np.zeros(max(len(a), len(b))); o[:len(a)] += a; o[:len(b)] += 0.5 * b; return o
def thud():       # the red cross: a low, short "no"
    t = np.arange(int(0.4 * SR)) / SR; return np.sin(2 * np.pi * 95 * t * (1 - 0.3 * t)) * np.exp(-t * 11) * 1.0
log = []
for n, at in [('s1', 0.2), ('g1', 2.3), ('g2', 3.5), ('g3', 7.0), ('s4', 10.35)]:      # only lines already recorded
    dst = f'video/part2hook12/voice/{n}.wav'; a, _ = sf.read(dst); a = a if a.ndim == 1 else a.mean(1); put(a, at, 1.0); log.append((n, at))
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
for j in range(5):
    L = int(4.4 * SR); t = np.arange(L) / SR
    for k, m in enumerate(CH[j]):
        f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * t) for d in (-0.003, 0, 0.003)) / 3; put(tn * np.minimum(1, t / 1.2) * np.minimum(1, (4.4 - t) / 1.2).clip(0), j * 3.0, 0.03, (k - 1.5) * 0.4)
put(tick(), 0.95, 0.5); g, _ = sf.read('audio/sfx-glass.wav'); put(g.mean(1) if g.ndim > 1 else g, 1.9, 0.8)
put(bloop(520), 2.55, 0.28, -0.4); put(bloop(700), 2.95, 0.28, 0.4)                    # the two pins pop in
put(shimmer(1.5), 3.4, 1.0, 0.0)                                                          # the light travels the cable (1.5 s)
put(radar(), 5.15, 0.2, 0.3); put(thud(), 5.95, 0.4, 0.0); put(tone(1046, 0.5, 0.004, 0.3, 5), 6.2, 0.06)   # satellite ping, the red cross, cables light up
put(tone(988, 1.0, 0.004, 0.5, 5, 0.2), 6.75, 0.09)                                       # it lands in London
put(buzz(), 7.7, 0.22, -0.2); put(tone(1318, 0.9, 0.003, 0.5, 5, 0.25), 7.7, 0.16, 0.2)   # her phone
put(tone(880, 1.1, 0.004, 0.6, 5, 0.2), 9.45, 0.12); put(tone(1318, 1.1, 0.004, 0.7, 5, 0.2), 9.6, 0.09)
f = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.8 * SR)); out *= f[:, None]; out = np.tanh(out * 1.2) / 1.2; out *= 0.76 / np.abs(out).max()
sf.write('video/part2hook12/sounds-b.wav', out, SR); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video/part2hook12/sounds-b.wav', '-c:a', 'libmp3lame', '-b:a', '192k', 'video/part2hook12/hook-sounds-b.mp3'], check=True); print('ok', round(float(np.abs(out).max()), 2))
