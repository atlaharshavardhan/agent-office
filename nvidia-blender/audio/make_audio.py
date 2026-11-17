"""Original music bed + sound effects + voice track for the NVIDIA Short (all synthesised, no samples).
Writes voice.wav, bed.wav, sfx.wav (48 kHz stereo) timed from video/timeline.json.
Usage: .venv/bin/python audio/make_audio.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent
TL = json.load(open(ROOT / "video/timeline.json"))
SR = 48000
DUR = TL["end"] + 0.3
N = int(DUR * SR)
rng = np.random.default_rng(11)
SC = TL["scenes"]


def env(n, a=0.005, r=0.3, shape=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan))
    buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))


def lp(x, cutoff):
    """FFT low-pass (fast)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def hp(x, cutoff):
    return x - lp(x, cutoff)


def noise(n):
    return rng.standard_normal(n)


midi = lambda m: 440 * 2 ** ((m - 69) / 12)


def tone(f, dur, harm=(1, .5, .25), a=0.01, r=1.0, shape=2.0, detune=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(h * np.sin(2 * np.pi * f * (k + 1) * (1 + detune * (k % 2)) * t) for k, h in enumerate(harm))
    return s * env(n, a, r, shape)


# ---------------------------------------------------------------- sound effects
def impact(dur=1.6, f0=55):
    n = int(dur * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (f0 + 90 * np.exp(-t * 18)) * t) * env(n, 0.002, dur, 3.0)
    crack = lp(noise(n), 3500) * env(n, 0.001, 0.12, 6)
    return body * 0.9 + crack * 0.35


def whoosh(dur=0.5, up=True):
    n = int(dur * SR); x = noise(n)
    t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * t) ** 2
    # sweeping band: crossfade between dark and bright noise
    dark, bright = lp(x, 600), hp(lp(x, 6000), 1500)
    mix = (dark * (1 - t) + bright * t) if up else (dark * t + bright * (1 - t))
    return mix * shape


def crack_sfx(dur=0.5):
    n = int(dur * SR); out = np.zeros(n)
    for k in range(9):
        i = int(rng.uniform(0, 0.35) * SR); L = int(0.03 * SR)
        out[i:i + L] += hp(noise(L), 2500)[: n - i] * env(L, 0.0005, 0.02, 5)[: n - i] * rng.uniform(.4, 1)
    return out


def tink(f=None):
    f = f or rng.uniform(2400, 5200)
    return tone(f, 0.35, (1, .3, .1), 0.001, 0.25, 5) * 0.5


def tick():
    L = int(0.03 * SR)
    return hp(noise(L), 3000) * env(L, 0.0005, 0.01, 6)


def riser(dur=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 200 + 900 * (t / dur) ** 2
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / dur) ** 1.5 * 0.4 + hp(noise(n), 3000) * (t / dur) ** 2 * 0.15


def fall(dur=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 700 * np.exp(-t * 2.2) + 60
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, dur, 1.5) * 0.5


def pop(f=900):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 600 * np.exp(-t * 60)) * t) * env(n, 0.001, 0.1, 5)


def stamp():
    return impact(0.5, 90) * 0.8 + lp(noise(int(0.5 * SR)), 900) * env(int(0.5 * SR), 0.001, 0.08, 5) * 0.4


def paper():
    n = int(0.45 * SR); return hp(lp(noise(n), 5000), 800) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.5


def zap(dur=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    buzz = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + hp(noise(n), 4000) * 0.3
    return lp(buzz, 5000) * env(n, 0.002, dur, 3)


def chime():
    return sum(tone(midi(m), 1.6, (1, .2), 0.005, 1.4, 2.5) for m in (76, 83, 88)) * 0.25


def clunk():
    return impact(0.8, 70) * 0.6 + lp(noise(int(0.8 * SR)), 1200) * env(int(0.8 * SR), 0.001, 0.05, 6) * 0.4


sfx = np.zeros((N, 2))
# 1 · hook: music hits at 0 with an impact, electric hum + pulses, collapse at about 2.0 s
place(sfx, impact(2.2, 42), 0.0, 1.0)
for k in range(6):
    place(sfx, zap(0.18), 0.35 + k * 0.22, 0.25, rng.uniform(-.5, .5))
place(sfx, whoosh(0.7, False), 0.55, 0.6)                    # fast pull-back
place(sfx, riser(0.9), 1.05, 0.5)                            # tension
place(sfx, impact(1.8, 48), 2.0, 1.0)                        # red pulse
place(sfx, crack_sfx(0.6), 2.05, 0.9, -0.2)
place(sfx, crack_sfx(0.6), 2.3, 0.7, 0.3)
for k in range(10):
    place(sfx, tink(), 2.2 + rng.uniform(0, 1.2), rng.uniform(.15, .35), rng.uniform(-.8, .8))
place(sfx, stamp(), 2.05 + 0.35, 0.6)                        # title slam
place(sfx, whoosh(0.6, True), 3.45, 0.5)                     # push-in
# scene changes
for i in range(1, 10):
    place(sfx, whoosh(0.45, i % 2 == 0), SC[i] - 0.2, 0.35, (-1) ** i * 0.3)
# 2 · bars grow
place(sfx, riser(0.9), SC[1] + 0.25, 0.35); place(sfx, fall(0.9), SC[1] + 0.9, 0.5); place(sfx, stamp(), SC[1] + 1.8, 0.35)
# 3 · data centre hum
n = int((SC[3] - SC[2]) * SR); t = np.arange(n) / SR
hum = (np.sin(2 * np.pi * 60 * t) * 0.3 + lp(noise(n), 300) * 0.4) * np.minimum(1, t / 0.4) * np.minimum(1, (n / SR - t) / 0.3)
place(sfx, hum, SC[2], 0.35)
for k in range(8):
    place(sfx, tick(), SC[2] + 0.3 + k * 0.5, 0.15, rng.uniform(-.7, .7))
# 4 · graph climbs
place(sfx, riser((SC[4] - SC[3]) * 0.7), SC[3] + 0.3, 0.45); place(sfx, chime(), SC[3] + 0.3 + (SC[4] - SC[3]) * 0.68, 0.5)
# 5 · graph falls, 3 markers
d5 = SC[5] - SC[4]
place(sfx, fall(d5 * 0.6), SC[4] + 0.15, 0.6)
for k, f in enumerate((0.45, 0.6, 0.75)):
    place(sfx, impact(0.6, 60), SC[4] + d5 * f, 0.55); place(sfx, pop(700 - k * 120), SC[4] + d5 * f, 0.3)
# 6 · ballot drops, tick, −9% stamp
place(sfx, paper(), SC[5] + 0.2, 0.7); place(sfx, tick(), SC[5] + 0.9, 0.6); place(sfx, stamp(), SC[5] + 1.6, 0.8); place(sfx, fall(0.6), SC[5] + 1.6, 0.3)
# 7 · loop nodes and arrows, then the "?"
for k in range(3):
    place(sfx, pop(800 + k * 150), SC[6] + 0.1 + k * 0.7, 0.35); place(sfx, whoosh(0.6, True), SC[6] + 0.3 + k * 0.7, 0.2)
place(sfx, impact(0.6, 80), SC[6] + (SC[7] - SC[6]) * 0.62, 0.5)
# 8 · spotlight clunk + flicker
place(sfx, clunk(), SC[7] + 0.2, 0.8)
for k in range(4):
    place(sfx, zap(0.06), SC[7] + 0.25 + k * 0.16, 0.12)
place(sfx, fall(0.8), SC[7] + (SC[8] - SC[7]) * 0.55, 0.4)
# 9 · bars up, line down
place(sfx, riser(0.9), SC[8] + 0.6, 0.35); place(sfx, pop(1100), SC[8] + 1.6, 0.3); place(sfx, fall(1.4), SC[8] + 2.0, 0.45)
# 10 · low drone hit
place(sfx, impact(2.0, 40), SC[9], 0.6)
# 11 · end card
place(sfx, chime(), SC[10], 0.6); place(sfx, pop(1300), SC[10] + 0.6, 0.35)

# ---------------------------------------------------------------- music bed (dark cinematic pulse, 100 bpm, D minor)
bed = np.zeros((N, 2))
beat = 60 / 100
prog = [(50, [62, 65, 69]), (46, [62, 65, 70]), (43, [62, 67, 70]), (45, [61, 64, 69])]   # Dm Bb Gm A
bar = 4 * beat
nb = int(DUR / bar) + 1
for b in range(nb):
    root, ch = prog[b % 4]
    at = b * bar
    late = at > SC[8] - 0.5                                    # calmer from "bubble?"
    # pad
    for k, m in enumerate(ch):
        p = tone(midi(m), bar + 0.4, (1, .35, .12), 0.4, bar, 0.9, 0.003)
        place(bed, lp(p, 2200), at, 0.05, (k - 1) * 0.5)
    # pulsing bass 8ths
    for q in range(8):
        L = int(beat / 2 * SR); tt = np.arange(L) / SR
        bs = np.tanh(2.2 * np.sin(2 * np.pi * midi(root - 12) * tt)) * env(L, 0.004, beat / 2, 3)
        place(bed, lp(bs, 900), at + q * beat / 2, 0.14 if not late else 0.08)
    # kick on beats, hats on offbeats (from 0.0 s: music-first hook)
    for q in range(4):
        bt = at + q * beat
        L = int(0.4 * SR); tt = np.arange(L) / SR
        place(bed, np.sin(2 * np.pi * (48 + 110 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 5), bt, 0.32 if not late else 0.18)
        L = int(0.05 * SR)
        place(bed, hp(noise(L), 6000) * env(L, 0.001, 0.03, 6), bt + beat / 2, 0.05, 0.3)
    # arpeggio sparkle (green phase) / tension ostinato (red phase)
    for q in range(8):
        m = ch[q % 3] + 12
        place(bed, tone(midi(m), 0.3, (1, .2), 0.003, 0.25, 4), at + q * beat / 2, 0.035, (q % 2 - .5) * 0.6)
fade = int(1.2 * SR)
bed[-fade:] *= np.linspace(1, 0, fade)[:, None]
bed /= np.max(np.abs(bed)) * 1.25

# ---------------------------------------------------------------- voice track
voice = np.zeros((N, 2))
for i, st in enumerate(TL["voice"]):
    a, sr = sf.read(ROOT / f"voice/line{i + 1:02d}.wav")
    if a.ndim > 1:
        a = a.mean(1)
    a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    place(voice, a, st, 1.0)

sfx /= np.max(np.abs(sfx)) * 1.05
for name, x in (("voice", voice), ("bed", bed), ("sfx", sfx)):
    sf.write(OUT / f"{name}.wav", np.clip(x, -1, 1).astype(np.float32), SR)
    print(name, round(len(x) / SR, 2), "s peak", round(float(np.max(np.abs(x))), 2))
