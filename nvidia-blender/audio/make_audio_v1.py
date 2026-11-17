"""Original soundtrack for "NVIDIA market collapse" v1 (all synthesised: no samples, no licensed music).
Financial-thriller bed (deep bass pulse, low percussion, tension), impacts synced to the reveals,
semiconductor zaps, data-centre ambience. Also places the narration and mixes:
  audio/v1/voice.wav, bed.wav, sfx.wav, mix_v1.wav (voice ducks the bed 14 dB) and mix_v1_nomusic.wav.
Usage: .venv/bin/python audio/make_audio_v1.py
"""
import json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "audio/v1"; OUT.mkdir(parents=True, exist_ok=True)
TL = json.load(open(ROOT / "remotion/src/timeline.json"))
SR, DUR = 48000, TL["end"]
N = int(DUR * SR)
SC, B = TL["scenes"], TL["beats"]
rng = np.random.default_rng(21)


def env(n, a=0.005, r=0.3, shape=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(sig)); s = sig[: j - i] * gain
    buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))


def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))


def hp(x, fc): return x - lp(x, fc)
def noise(n): return rng.standard_normal(n)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)


def tone(f, dur, harm=(1, .5, .25), a=0.01, r=1.0, shape=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, r, shape)


def boom(dur=2.4, f0=38, punch=1.0):
    """Cinematic low-frequency impact: pitched sub drop + body + transient."""
    n = int(dur * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(f0 + 70 * np.exp(-t * 9)) / SR) * env(n, 0.002, dur, 2.2)
    body = lp(noise(n), 220) * env(n, 0.002, 0.5, 4) * 0.6
    click = hp(noise(n), 2000) * env(n, 0.0005, 0.02, 6) * 0.4 * punch
    return np.tanh(1.4 * (sub + body + click))


def hit(dur=0.7, f0=70):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 120 * np.exp(-t * 30)) * t) * env(n, 0.001, dur, 4) + lp(noise(n), 1500) * env(n, 0.001, 0.06, 6) * 0.3


def zap(dur=0.12, f=900):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f * (1 + 0.5 * np.sin(2 * np.pi * 37 * t)) * t)) * 0.3 + hp(noise(n), 5000) * 0.25
    return lp(s, 7000) * env(n, 0.001, dur, 3)


def crack(dur=0.6):
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(10):
        i = int(rng.uniform(0, 0.4) * SR); L = int(0.025 * SR)
        out[i:i + L] += hp(noise(L), 2600)[: n - i] * env(L, 0.0005, 0.02, 5)[: n - i] * rng.uniform(.4, 1)
    return out


def tink(): return tone(rng.uniform(2600, 5200), 0.4, (1, .3), 0.001, 0.3, 5) * 0.5
def tick(f=3200): L = int(0.02 * SR); return hp(noise(L), f) * env(L, 0.0004, 0.008, 6)


def riser(dur=1.5, f1=120, f2=700):
    n = int(dur * SR); t = np.arange(n) / SR; x = t / dur
    f = f1 + (f2 - f1) * x ** 2
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + hp(noise(n), 2500) * 0.12) * x ** 1.6


def fall(dur=1.2, f1=600, f2=50):
    n = int(dur * SR); t = np.arange(n) / SR; x = t / dur
    f = f2 + (f1 - f2) * (1 - x) ** 2
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, dur, 1.2) * 0.5


def shimmer(dur=1.0):
    n = int(dur * SR)
    return sum(tone(midi(m), dur, (1, .15), 0.02, dur, 1.5) for m in (84, 88, 91, 96)) * 0.15 * np.sin(np.linspace(0, np.pi, n))


def hum(dur, f=60):
    n = int(dur * SR); t = np.arange(n) / SR
    fan = lp(noise(n), 400) * 0.5 + np.sin(2 * np.pi * f * t) * 0.25 + np.sin(2 * np.pi * 2 * f * t) * 0.1
    return fan * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)


def clunk(): return hit(0.9, 55) * 0.9 + lp(noise(int(0.9 * SR)), 900) * env(int(0.9 * SR), 0.001, 0.05, 6) * 0.4


sfx = np.zeros((N, 2))
# 1 · shock: music hit at 0, electric pulses, red transition, counter ticks, GONE slam
place(sfx, boom(2.6, 34), 0.0, 1.0)
for k in range(7): place(sfx, zap(0.1, rng.uniform(700, 1400)), 0.3 + k * 0.2, 0.22, rng.uniform(-.6, .6))
place(sfx, riser(1.2, 90, 500), 0.6, 0.45)
place(sfx, boom(1.8, 46), 1.8, 0.8); place(sfx, crack(), 1.85, 0.8, -0.2); place(sfx, crack(), 2.15, 0.6, 0.3)
for k in range(12): place(sfx, tink(), 2.0 + rng.uniform(0, 1.3), rng.uniform(.12, .3), rng.uniform(-.8, .8))
for k in range(26): place(sfx, tick(2600 + k * 40), 1.8 + k * 0.045, 0.35, 0.2)       # valuation counter
place(sfx, boom(2.8, 30, 1.4), 3.05, 1.0)                                              # $2 TRILLION GONE
# 2 · columns: rise, slide, dissolve to "paper"
s2 = SC[1]
place(sfx, riser(0.8, 80, 300), s2 + 0.05, 0.35); place(sfx, hit(0.5, 90), s2 + 0.9, 0.4); place(sfx, fall(0.8, 400, 80), s2 + 1.0, 0.35)
place(sfx, shimmer(1.0), B["cash"], 0.5)
# 3 · data centre: fans + data pulses
s3, e3 = SC[2], SC[3]
place(sfx, hum(e3 - s3), s3, 0.45)
for k in range(14): place(sfx, zap(0.05, 1800 + (k % 4) * 300), s3 + 0.4 + k * 0.38, 0.1, rng.uniform(-.8, .8))
place(sfx, hit(0.6, 80), s3 + 4.0, 0.3)                                                # cut to the tray macro
# 4 · gold rush: rising tension, flowing shimmer, counter
s4, e4 = SC[3], SC[4]
place(sfx, riser(e4 - s4 - 0.3, 70, 420), s4, 0.35)
for k in range(8): place(sfx, shimmer(0.6), s4 + 0.4 + k * 0.7, 0.18, (-1) ** k * 0.4)
for k in range(40): place(sfx, tick(3000), s4 + 1.2 + k * 0.065, 0.2)
# 5 · three shocks: each its own sound
s5 = SC[4]; r1, r2, r3 = B["reasons"]
place(sfx, boom(1.6, 44), s5, 0.7)
for k in range(3): place(sfx, hit(0.4, 100 - k * 10), s5 + 0.25 + k * 0.15, 0.4)
place(sfx, fall(1.6, 300, 40), r1, 0.5); place(sfx, hum(1.4, 50) * np.linspace(1, 0, int(1.4 * SR)), r1, 0.4)   # power-down
for k in range(8): place(sfx, tick(1800), r2 + 0.2 + k * 0.33, 0.35)                                            # loop ticking
place(sfx, hit(0.6, 120), r2 + 1.9, 0.5)
place(sfx, clunk(), r3, 0.8); place(sfx, boom(1.4, 50, 0.6), r3 + 0.6, 0.45)                                   # boardroom
# 6 · collapse: descending line, impact on -35%
s6, e6 = SC[5], SC[6]
place(sfx, fall(e6 - s6 - 2.2, 520, 60), s6 + 0.2, 0.45)
place(sfx, boom(2.6, 30, 1.2), B["down35"], 1.0)
# 7 · final question: tension hold, hit on the question
s7 = SC[6]
place(sfx, riser(B["question"] - s7, 50, 160), s7, 0.3)
place(sfx, hit(0.8, 60), B["question"], 0.6)
# 8 · brand
place(sfx, shimmer(1.4), SC[7], 0.5); place(sfx, hit(0.4, 140), SC[7] + 0.05, 0.25)
sfx /= np.max(np.abs(sfx)) * 1.05

# ---------------------------------------------------------------- music bed: dark thriller pulse, 92 bpm, C minor
bed = np.zeros((N, 2)); beat = 60 / 92
prog = [(48, [60, 63, 67]), (44, [60, 63, 68]), (41, [60, 65, 68]), (43, [59, 62, 67])]   # Cm Ab Fm G
intensity = lambda t: 0.55 if t < SC[3] else 0.8 if t < SC[4] else 1.0 if t < SC[6] else 0.6
for b in range(int(DUR / (4 * beat)) + 1):
    root, ch = prog[b % 4]; at = b * 4 * beat; I = intensity(at)
    for k, m in enumerate(ch):
        place(bed, lp(tone(midi(m - 12), 4 * beat + 0.5, (1, .4, .15), 0.5, 4 * beat, 0.8), 1500), at, 0.05, (k - 1) * 0.5)
    for q in range(8):                                                   # pulsing sub bass (8ths)
        L = int(beat / 2 * SR); tt = np.arange(L) / SR
        place(bed, lp(np.tanh(2.5 * np.sin(2 * np.pi * midi(root - 24) * tt)), 300) * env(L, 0.004, beat / 2, 2.5), at + q * beat / 2, 0.22 * I)
    for q in range(4):                                                   # low toms on 1 and 3, closed ticks on offbeats
        bt = at + q * beat
        if q in (0, 2) and at > 0.5:
            place(bed, hit(0.45, 52), bt, 0.25 * I)
        L = int(0.04 * SR); place(bed, hp(noise(L), 7000) * env(L, 0.001, 0.02, 6), bt + beat / 2, 0.04 * I, 0.3)
    if I >= 0.8:                                                         # tension ostinato
        for q in range(8):
            place(bed, tone(midi(ch[q % 3] + 12), 0.25, (1, .2), 0.003, 0.2, 4), at + q * beat / 2, 0.03, (q % 2 - .5) * 0.6)
fade = int(1.0 * SR); bed[-fade:] *= np.linspace(1, 0, fade)[:, None]
bed /= np.max(np.abs(bed)) * 1.25

# ---------------------------------------------------------------- narration
voice = np.zeros((N, 2))
S = json.load(open(ROOT / "voice_v1/sentences.json"))
for i, s in enumerate(TL["sentences"]):
    a, sr = sf.read(ROOT / f"voice_v1/s_{i:02d}.wav")
    a = a.mean(1) if a.ndim > 1 else a
    a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    place(voice, a, s["t0"], 1.0)

# ---------------------------------------------------------------- mix
w = int(0.02 * SR); e = np.sqrt(np.convolve((voice ** 2).mean(1), np.ones(w) / w, "same"))
act = np.clip(np.convolve((e > 0.01).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same") * 3, 0, 1)
duck = 10 ** ((-14 * act) / 20)
bedm, sfxm = bed * duck[:, None] * 0.6, sfx * (0.45 - 0.31 * act)[:, None]
r = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
sp = act > 0.9
print("under speech dB: voice", round(r(voice[sp]), 1), "music", round(r(bedm[sp]), 1), "sfx", round(r(sfxm[sp]), 1))


def write(x, name, norm=True):
    p = OUT / f"{name}.wav"
    if not norm:
        sf.write(p, np.clip(x, -1, 1).astype(np.float32), SR); return
    tmp = OUT / f"_{name}.wav"; sf.write(tmp, np.clip(x, -1, 1).astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
                    "-t", str(DUR), "-c:a", "pcm_s16le", str(p)], check=True); tmp.unlink()


for nm, x in (("voice", voice), ("bed", bed), ("sfx", sfx)):
    write(x, nm, norm=False)
write(voice + bedm + sfxm, "mix_v1")
write(voice + sfxm, "mix_v1_nomusic")
print("done", DUR, "s")
