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
WHOOSH = 0.0   # Harsh (V3): no whoosh sounds at all; set to 1.0 to bring them back
def whoosh(d=0.45, lo=500, hi=3500): n = int(d * SR); t = tt(n) / d; return WHOOSH * hp(lp(noise(n), lo + (hi - lo) * 0.6), lo) * np.sin(np.pi * t) ** 2
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
# ---- V3 sound design: minimal, object-specific, no whooshes; soft highs; levels set in dBFS ----
def lvl(x, db): m = np.max(np.abs(x)); return x / m * 10 ** (db / 20) if m > 0 else x
def soft(x, fc=5200): return lp(x, fc)                                   # tame harsh highs
def bass():   n = int(1.5 * SR); t = tt(n); return np.sin(2 * np.pi * (46 + 14 * np.exp(-t * 9)) * t) * np.exp(-t * 3.2) * np.minimum(1, t / 0.02)
def hinge():  n = int(0.12 * SR); t = tt(n); c = lambda t0, f: np.where(t >= t0, np.sin(2 * np.pi * f * (t - t0)) * np.exp(-(t - t0) * 140), 0); return soft(c(0, 1500) + 0.7 * c(0.018, 2300) + 0.5 * c(0.0, 320) + 0.15 * hp(noise(n), 1200) * np.exp(-t * 200), 4200)
def msnap():  n = int(0.16 * SR); t = tt(n); return soft(1.0 * np.sin(2 * np.pi * (150 + 90 * np.exp(-t * 80)) * t) * np.exp(-t * 48) + 0.5 * np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 170) + 0.12 * hp(noise(n), 1500) * np.exp(-t * 260), 4800)
def micro():  n = int(0.06 * SR); t = tt(n); return soft((np.sin(2 * np.pi * 2600 * t) + 0.5 * np.sin(2 * np.pi * 3900 * t)) * np.exp(-t * 150), 6000)
def glass(d=1.2): n = int(d * SR); t = tt(n); x = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (1.6 + 0.4 * i)) for i, f in enumerate([1245, 1661, 2093, 2794])); return soft(x * np.minimum(1, t / 0.3), 4500)
def attract(d): n = int(d * SR); t = tt(n) / d; f = 82 + 46 * t ** 2; return lp(sine(f, n) + 0.3 * sine(f * 2, n), 500) * np.sin(np.pi * np.minimum(1, t)) ** 1.5 * (0.8 + 0.2 * np.sin(2 * np.pi * (3 + 5 * t) * t * d))
def blip(f=520): n = int(0.14 * SR); t = tt(n); return np.sin(2 * np.pi * f * t) * np.sin(np.pi * np.minimum(1, t / 0.14)) ** 2 * np.exp(-t * 9)
def humlow(d): n = int(d * SR); t = tt(n) / d; return lp(sine(60, n) + 0.5 * sine(120, n) + 0.2 * sine(180, n), 300) * np.sin(np.pi * t) ** 0.6
def tone(notes, gap=0.13, d=0.5, dec=7):
    n = int((gap * len(notes) + d) * SR); out = np.zeros(n)
    for i, m in enumerate(notes): L = int(d * SR); t = tt(L); x = (np.sin(2 * np.pi * midi(m) * t) + 0.18 * np.sin(4 * np.pi * midi(m) * t)) * np.exp(-t * dec) * np.minimum(1, t / 0.008); j = int(i * gap * SR); out[j:j + L] += x
    return out
def signature():   # two notes (A4 → E5) over a soft sub-bass resonance
    n = int(1.6 * SR); t = tt(n); x = np.zeros(n)
    for i, (m, t0) in enumerate([(69, 0.0), (76, 0.2)]): tt0 = np.maximum(0, t - t0); x += np.where(t >= t0, (np.sin(2 * np.pi * midi(m) * tt0) + 0.25 * np.sin(4 * np.pi * midi(m) * tt0) + 0.1 * np.sin(6 * np.pi * midi(m) * tt0)) * np.exp(-tt0 * 2.6) * np.minimum(1, tt0 / 0.01), 0)
    return x + 0.9 * np.sin(2 * np.pi * 55 * t) * np.exp(-t * 2.2) * np.minimum(1, t / 0.03)
d = [B[i + 1] - B[i] for i in range(8)]
# 1. hook: soft bass impact, hinge clicks, magnetic snaps as the buds land, gentle charging tone
place(sfx, lvl(bass(), -16), 0.0)
place(sfx, lvl(hinge(), -21), 0.52, 1, -0.3); place(sfx, lvl(hinge(), -23), 0.57, 1, 0.3)
place(sfx, lvl(msnap(), -18), 1.95, 1, 0.25); place(sfx, lvl(msnap(), -20), 2.04, 1, 0.35)
place(sfx, lvl(tone([76, 83], 0.11, 0.6), -24), 2.22)
# 2. lid closes softly, glass shimmer as the shell turns transparent, lid opens (the orbit and exploded view stay silent)
place(sfx, lvl(hinge(), -24), at(1, 0.15), 1, 0.2); place(sfx, lvl(glass(1.3), -24), at(1, 0.1)); place(sfx, lvl(hinge(), -23), at(1, 0.8), 1, 0.2)
# 3. magnetic alignment: gentle attraction swell, then the snap as the magnet takes hold
place(sfx, lvl(attract(d[2] * 0.56), -22), at(2, 0.24)); place(sfx, lvl(msnap(), -19), at(2, 0.8), 1, 0.15)
# 4. electrical contact: precise metallic micro-clicks, then two soft pulses running into the earbud
place(sfx, lvl(micro(), -19), at(3, 0.3), 1, 0.1); place(sfx, lvl(micro(), -22), at(3, 0.3) + 0.035, 1, 0.2)
place(sfx, lvl(blip(620), -24), at(3, 0.66)); place(sfx, lvl(blip(780), -25), at(3, 0.82), 1, 0.15)
# 5. electricity flow: low hum under soft rhythmic pulses that follow the energy
place(sfx, lvl(humlow(d[4] * 0.9), -27), at(4, 0.05))
for j in range(7): place(sfx, lvl(blip(440 + 40 * j), -24 - (j % 2)), at(4, 0.13 + j * 0.07), 1, -0.3 + 0.1 * j)
place(sfx, lvl(tone([72, 79], 0.12, 0.8), -25), at(4, 0.68))
# 6. the catch: lid closes, minimal notification tone when the warning appears (the camera moves stay silent)
place(sfx, lvl(hinge(), -24), at(5, 0.13), 1, 0.1); place(sfx, lvl(tone([81, 76], 0.13, 0.35, 10), -20), at(5, 0.36))
# 7. comparison: snaps as each pair lands, then a clean positive / negative confirmation tone
place(sfx, lvl(hinge(), -24), at(6, 0.06), 1, 0.3)
place(sfx, lvl(msnap(), -19), at(6, 0.24), 1, -0.3); place(sfx, lvl(msnap(), -21), at(6, 0.24) + 0.09, 1, -0.35); place(sfx, lvl(tone([72, 79], 0.1, 0.5), -21), at(6, 0.24) + 0.32, 1, -0.2)
place(sfx, lvl(msnap(), -19), at(6, 0.58), 1, 0.3); place(sfx, lvl(msnap(), -21), at(6, 0.58) + 0.09, 1, 0.35); place(sfx, lvl(tone([58, 53], 0.14, 0.5, 6), -20), at(6, 0.58) + 0.32, 1, 0.2)
# 8. the answer: snaps as the buds land, gentle charging tone, shimmer + hum for the last look inside, magnetic closing clicks
t0 = at(7, 0.12); place(sfx, lvl(msnap(), -18), t0 + 0.9, 1, 0.25); place(sfx, lvl(msnap(), -20), t0 + 0.99, 1, 0.35); place(sfx, lvl(tone([76, 83], 0.11, 0.6), -24), t0 + 1.17)
place(sfx, lvl(glass(0.9), -26), at(7, 0.36)); place(sfx, lvl(humlow(d[7] * 0.26), -27), at(7, 0.4))
place(sfx, lvl(msnap(), -17), at(7, 0.8), 1, -0.25); place(sfx, lvl(msnap(), -19), at(7, 0.8) + 0.05, 1, 0.25)
# 9. InvisiTech: two-note sonic signature with a soft bass resonance, as the logo appears
place(sfx, lvl(signature(), -14), B[8] + 0.42)
sf.write(os.path.join(here, 'sfx.wav'), sfx.astype(np.float32), SR)
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
        place(bed, pluck(m), tq, 0.05, [-0.3, 0.3][q % 2])
        pass   # V3: no drums, the bed stays subtle
        
g = np.ones(N); fi = int(0.25 * SR); g[:fi] = np.linspace(0.3, 1, fi); fo = int(0.9 * SR); g[-fo:] *= np.linspace(1, 0.3, fo)   # loop-friendly: no hard start or stop
bed *= g[:, None]; sf.write(os.path.join(here, 'bed.wav'), (bed / np.max(np.abs(bed)) * 10 ** (-24 / 20)).astype(np.float32), SR)   # music peaks about -24 dBFS
# ---- voice track ----
voice = np.zeros((N, 2))
for i, st in enumerate(starts):
    w, sr = sf.read(os.path.join(V, f'line{i + 1}.wav')); idx = np.linspace(0, len(w) - 1, int(len(w) * SR / sr)); w = np.interp(idx, np.arange(len(w)), w); place(voice, w, st, 1.4)
voice = voice / np.max(np.abs(voice)) * 10 ** (-4 / 20)   # narration peaks about -4 dBFS
sf.write(os.path.join(here, 'voice.wav'), voice.astype(np.float32), SR)
print('ok', round(DUR, 2), 's')
