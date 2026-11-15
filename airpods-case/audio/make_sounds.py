"""Music and sound effects for the AirPods case Short. Everything is synthesised here (no samples, no third-party audio).
Writes voice.wav (lines placed on the timeline), bed.wav (music) and sfx.wav, 48 kHz stereo."""
import json, os, numpy as np, soundfile as sf
here = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(here, '..', 'voice')
T = json.load(open(os.path.join(V, 'timeline.json'))); B, starts = T['B'], T['starts']
SR = 48000; DUR = B[-1]; N = int(SR * DUR); rng = np.random.default_rng(11)
at = lambda i, k: B[i] + k * (B[i + 1] - B[i])   # shot i (0-based), fraction k of the shot → seconds
tt = lambda n: np.arange(n) / SR
def env(n, a=0.005, r=0.2, shape=4.0): t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
def place(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def lp(x, fc):   # low-pass by exponential-kernel convolution
    a = 1 - np.exp(-2 * np.pi * fc / SR); n = int(min(len(x), 6 / a)); k = a * (1 - a) ** np.arange(n); return np.convolve(x, k)[: len(x)]
hp = lambda x, fc: x - lp(x, fc)
noise = lambda n: rng.standard_normal(n)
def sine(f, n, ph=0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR + ph)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
# ---- sound effects ----
def whoosh(d=0.45, lo=500, hi=3500): n = int(d * SR); t = tt(n) / d; return hp(lp(noise(n), lo + (hi - lo) * 0.6), lo) * np.sin(np.pi * t) ** 2
def click(f=2400): n = int(0.09 * SR); t = tt(n); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + 0.6 * hp(noise(n), 3000) * np.exp(-t * 220) + 0.9 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60))
def snap(): n = int(0.16 * SR); t = tt(n); return hp(noise(n), 1500) * np.exp(-t * 120) + 1.2 * np.sin(2 * np.pi * (140 + 200 * np.exp(-t * 60)) * t) * np.exp(-t * 35)
def hit(): n = int(0.9 * SR); t = tt(n); return np.sin(2 * np.pi * (48 + 60 * np.exp(-t * 18)) * t) * np.exp(-t * 4.5) + 0.25 * lp(noise(n), 400) * np.exp(-t * 9)
def shimmer(d=1.3): n = int(d * SR); t = tt(n); s = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * (1.5 + i * 0.3)) for i, f in enumerate([1760, 2217, 2637, 3520, 4186, 5274])); return s / 6 * np.minimum(1, t / 0.25)
def tick(f=3600): n = int(0.07 * SR); t = tt(n); return np.sin(2 * np.pi * f * t) * np.exp(-t * 70) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 110)
def ping(notes, gap=0.11, d=0.6):
    n = int((gap * len(notes) + d) * SR); out = np.zeros(n)
    for i, m in enumerate(notes): L = int(d * SR); t = tt(L); s = (np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(4 * np.pi * midi(m) * t)) * np.exp(-t * 6) * np.minimum(1, t / 0.004); j = int(i * gap * SR); out[j:j + L] += s
    return out
def hum(d): n = int(d * SR); t = tt(n) / d; f = 70 + 90 * t ** 1.5; s = sine(f, n) + 0.4 * sine(f * 2, n) + 0.2 * sine(f * 3.01, n); return lp(s, 900) * np.sin(np.pi * np.minimum(1, t * 1.02)) ** 0.7 * (0.75 + 0.25 * np.sin(2 * np.pi * 9 * t * d))
def rise(d): n = int(d * SR); t = tt(n) / d; return (sine(midi(64) * 2 ** (t * 7 / 12), n) + 0.3 * sine(midi(76) * 2 ** (t * 7 / 12), n)) * np.minimum(1, t / 0.1) * (1 - t) ** 0.3 * 0.6
def buzz(d=0.32): n = int(d * SR); t = tt(n); return lp(np.sign(np.sin(2 * np.pi * 92 * t)) + 0.5 * np.sign(np.sin(2 * np.pi * 138 * t)), 1400) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05)
def crack(): n = int(0.25 * SR); t = tt(n); return hp(noise(n), 2500) * np.exp(-t * 40) * (1 + 0.8 * (rng.random(n) > 0.995))
def pop(f): n = int(0.14 * SR); t = tt(n); return np.sin(2 * np.pi * f * (1 + 0.5 * np.exp(-t * 60)) * t) * np.exp(-t * 28)
sfx = np.zeros((N, 2))
def hinge(): n = int(0.22 * SR); t = tt(n); return (hp(noise(n), 2200) * np.exp(-t * 60) * 0.6 + np.sin(2 * np.pi * (300 - 500 * t) * t) * np.exp(-t * 22) * 0.5)
def zap(d=0.5): n = int(d * SR); t = tt(n) / d; return (sine(900 + 1500 * t, n) * 0.35 + hp(noise(n), 5000) * 0.25) * np.sin(np.pi * t) ** 2
d = [B[i + 1] - B[i] for i in range(8)]
# 1. hook: deep impact, fast pull-back, hinges, buds fly, magnetic snaps, LED, push-in
place(sfx, hit(), 0.0, 0.9); place(sfx, whoosh(0.9, 300, 2200), 0.05, 0.45)
place(sfx, hinge(), 0.52, 0.6, -0.4); place(sfx, hinge(), 0.56, 0.5, 0.4)
place(sfx, whoosh(0.8, 400, 2600), 1.05, 0.5, -0.2); place(sfx, whoosh(0.8, 500, 3000), 1.14, 0.4, 0.2)
place(sfx, click(), 1.95, 0.85, 0.3); place(sfx, click(2700), 2.04, 0.75, 0.4); place(sfx, hit(), 1.96, 0.45)
place(sfx, ping([76, 83]), 2.2, 0.24); place(sfx, whoosh(1.8, 250, 1500), at(0, 0.6), 0.3)
# 2. glass reveal, orbit, exploded view out and back, push to the socket
place(sfx, shimmer(1.3), at(1, 0.08), 0.32); place(sfx, whoosh(2.0, 250, 1300), at(1, 0.1), 0.18)
place(sfx, whoosh(0.5, 600, 3200), at(1, 0.4), 0.3); [place(sfx, pop(700 + j * 90), at(1, 0.44 + j * 0.04), 0.2, j * 0.4 - 0.4) for j in range(3)]
place(sfx, whoosh(0.5, 500, 2600), at(1, 0.7), 0.26); place(sfx, click(1500), at(1, 0.84), 0.4); place(sfx, whoosh(0.8, 400, 2400), at(1, 0.8), 0.3)
# 3. magnetic alignment: lift, field hum, glide down
place(sfx, whoosh(0.6, 500, 2600), at(2, 0.02), 0.2); place(sfx, hum(d[2] * 0.5), at(2, 0.22), 0.2); place(sfx, shimmer(0.9), at(2, 0.22), 0.14)
place(sfx, whoosh(1.4, 300, 1600), at(2, 0.42), 0.2); place(sfx, click(1700), at(2, 0.8), 0.45, 0.2)
# 4. electrical contact: snap, metallic clicks, activation, pulse up the stem
place(sfx, click(), at(3, 0.3), 0.9, 0.2); place(sfx, tick(), at(3, 0.305), 0.5, 0.25); place(sfx, tick(4000), at(3, 0.32), 0.4, 0.3)
place(sfx, zap(0.45), at(3, 0.34), 0.4); place(sfx, ping([84], 0.1, 0.5), at(3, 0.36), 0.14); place(sfx, zap(0.3), at(3, 0.64), 0.22); place(sfx, whoosh(1.2, 300, 1800), at(3, 0.62), 0.22)
# 5. the journey: energy pulses, pull-back, charging chime
place(sfx, hit(), at(4, 0.04), 0.35); place(sfx, hum(d[4] * 0.5), at(4, 0.12), 0.42)
for j in range(5): place(sfx, zap(0.22), at(4, 0.16 + j * 0.09), 0.16, j * 0.2 - 0.4)
place(sfx, whoosh(1.4, 250, 1500), at(4, 0.58), 0.26); place(sfx, rise(d[4] * 0.36), at(4, 0.6), 0.1); place(sfx, ping([72, 79], 0.1, 0.9), at(4, 0.94), 0.2)
# 6. the catch: tension, bass impact, phone, link breaks, warning tone
place(sfx, buzz(0.5), at(5, 0.02), 0.1); place(sfx, hit(), at(5, 0.08), 0.75); place(sfx, whoosh(0.9, 350, 2200), at(5, 0.08), 0.4, 0.5)
place(sfx, crack(), at(5, 0.35), 0.4); place(sfx, ping([70, 66], 0.14, 0.5), at(5, 0.37), 0.3); place(sfx, whoosh(1.4, 250, 1500), at(5, 0.44), 0.24); place(sfx, whoosh(0.8, 300, 1800), at(5, 0.84), 0.2)
# 7. comparison
place(sfx, whoosh(0.8, 400, 2600), at(6, 0.0), 0.4, -0.5)
place(sfx, click(), at(6, 0.24), 0.8, -0.3); place(sfx, click(2700), at(6, 0.24) + 0.09, 0.7, -0.4); place(sfx, ping([72, 76, 79], 0.09), at(6, 0.24) + 0.3, 0.24)
place(sfx, whoosh(0.9, 400, 2400), at(6, 0.42), 0.34, 0.4)
place(sfx, click(), at(6, 0.58), 0.8, 0.3); place(sfx, click(2700), at(6, 0.58) + 0.09, 0.7, 0.4); place(sfx, buzz(0.42), at(6, 0.58) + 0.3, 0.26); place(sfx, whoosh(1.0, 300, 2000), at(6, 0.8), 0.28)
# 8. the answer: buds cross, snap, LED, power path reveal, lids shut, push to the opening frame
t0 = at(7, 0.12); place(sfx, whoosh(0.8, 400, 2600), t0, 0.45, -0.2); place(sfx, click(), t0 + 0.9, 0.85, 0.3); place(sfx, click(2700), t0 + 0.99, 0.75, 0.4); place(sfx, ping([76, 83]), t0 + 1.15, 0.24)
place(sfx, shimmer(1.0), at(7, 0.36), 0.26); place(sfx, hum(d[7] * 0.2), at(7, 0.4), 0.25); place(sfx, shimmer(0.7), at(7, 0.6), 0.16)
place(sfx, snap(), at(7, 0.82), 1.0, -0.3); place(sfx, snap(), at(7, 0.82) + 0.05, 0.8, 0.3); place(sfx, hit(), at(7, 0.82), 0.6); place(sfx, whoosh(1.6, 250, 1500), at(7, 0.72), 0.3)
# 9. title
place(sfx, hit(), B[8] + 0.05, 0.7); place(sfx, shimmer(1.4), B[8] + 0.15, 0.3); place(sfx, ping([69, 76, 81], 0.1, 1.2), B[8] + 0.25, 0.2)
sf.write(os.path.join(here, 'sfx.wav'), (sfx * 0.9).astype(np.float32), SR)
# ---- music: dark, minimal electronic bed, 96 bpm, A minor ----
bed = np.zeros((N, 2)); beat = 60 / 96; bar = 4 * beat
prog = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]]   # Am F C G
def pluck(m, d=0.5): n = int(d * SR); t = tt(n); return lp(np.sign(np.sin(2 * np.pi * midi(m) * t)) * 0.5 + np.sin(2 * np.pi * midi(m) * t), 1800) * np.exp(-t * 9) * np.minimum(1, t / 0.003)
def pad(ch, d): n = int(d * SR); t = tt(n); s = sum(np.sin(2 * np.pi * midi(m) * t * (1 + 0.002 * k)) for k, m in enumerate(ch[1:])); return lp(s, 1200) / 3 * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
def kick(): n = int(0.3 * SR); t = tt(n); return np.sin(2 * np.pi * (42 + 80 * np.exp(-t * 35)) * t) * np.exp(-t * 11)
nb = int(DUR / bar) + 1
for b in range(nb):
    ch = prog[b % 4]; t0 = b * bar; intro = False; outro = False
    place(bed, pad(ch, bar + 1.2), t0, 0.16)
    L = int(bar * SR); t = tt(L); place(bed, lp(np.sin(2 * np.pi * midi(ch[0] - 12) * t) * (0.6 + 0.4 * np.sin(2 * np.pi * t / beat * 0.5) ** 2), 200), t0, 0.26)
    for q in range(8):
        tq = t0 + q * beat / 2; m = ch[1 + [0, 1, 2, 1, 0, 2, 1, 2][q]] + 12
        place(bed, pluck(m), tq, 0.075 if not intro else 0.11, [-0.4, 0.4][q % 2])
        if q % 2 == 0 and not outro: place(bed, kick(), tq, 0.22 if q in (0, 4) else 0.0)
        n = int(0.04 * SR); place(bed, hp(noise(n), 6000) * env(n, 0.001, 0.02, 5), tq + beat / 4, 0.02, 0.3)
g = np.ones(N); fi = int(0.25 * SR); g[:fi] = np.linspace(0.3, 1, fi); fo = int(0.9 * SR); g[-fo:] *= np.linspace(1, 0.3, fo)   # loop-friendly: no hard start or stop
bed *= g[:, None]; sf.write(os.path.join(here, 'bed.wav'), (bed / np.max(np.abs(bed)) * 0.7).astype(np.float32), SR)
# ---- voice track ----
voice = np.zeros((N, 2))
for i, st in enumerate(starts):
    w, sr = sf.read(os.path.join(V, f'line{i + 1}.wav')); idx = np.linspace(0, len(w) - 1, int(len(w) * SR / sr)); w = np.interp(idx, np.arange(len(w)), w); place(voice, w, st, 1.4)
sf.write(os.path.join(here, 'voice.wav'), voice.astype(np.float32), SR)
print('ok', round(DUR, 2), 's')
