"""S1 final hook audio (free/local): Kokoro am_michael narration + numpy sound design, exactly 5.0 s, -14 LUFS.

Q1 "Was NVIDIA's CEO targeted?"            0.06 s  (Shot 1 into the Alice cut)
Q2 "What did he know about the chips?"     ~2.45 s (lands into Shot 3 at 3.2 s)
SFX: bass impact @0 · stage ambience bed (crowd room tone + low hum) · restrained suspense pulse (72 bpm) ·
     soft electronic shimmer into Alice @1.5 s · rising electronic tension 3.2-5.0 s · no whooshes.
Writes remotion/public/s1f/s1f_mix.wav and remotion/src/s1/s1f_vo.json (word timings for captions).
"""
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[3]
SR, DUR = 48000, 5.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(5)
k = Kokoro(str(ROOT / "voice/models/kokoro-v1.0.onnx"), str(ROOT / "voice/models/voices-v1.0.bin"))


def say(text, speed):
    v, vsr = k.create(text, voice="am_michael", speed=speed, lang="en-us")
    v = np.interp(np.arange(int(len(v) * SR / vsr)) * vsr / SR, np.arange(len(v)), v)
    nz = np.nonzero(np.abs(v) > 0.01)[0]
    return v[nz[0]:nz[-1] + 1]


def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, -(1 - a)], x)


def env(n, a, d):
    x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def place(buf, sig, at, g=1.0):
    i = int(at * SR); j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g


q1 = say("Was NVIDIA's CEO targeted?", 1.12)
q2 = say("What did he know about the chips?", 1.0)
T1 = 0.06; T2 = round(max(2.35, T1 + len(q1) / SR + 0.4), 2)
voice = np.zeros(N); place(voice, q1, T1); place(voice, q2, T2)
e1, e2 = T1 + len(q1) / SR, T2 + len(q2) / SR
print(f"Q1 {T1:.2f}-{e1:.2f}s  Q2 {T2:.2f}-{e2:.2f}s")
assert e1 < 2.0 and e2 < 4.85, "narration does not fit"

# slight 'investigative' colour: gentle low-mid warmth + short room reflection
voice = voice + 0.12 * np.concatenate([np.zeros(int(0.023 * SR)), voice[:-int(0.023 * SR)]])

sfx = np.zeros(N)
n = int(1.6 * SR); x = np.arange(n) / SR                                     # bass impact (frame 0)
place(sfx, np.sin(2 * np.pi * np.cumsum(46 * (1 + 1.2 * np.exp(-x * 9))) / SR) * env(n, 0.002, 0.55) * 1.0, 0.0)
nn = rng.standard_normal(int(0.25 * SR)); place(sfx, lp(nn, 0.05) * env(len(nn), 0.001, 0.05) * 0.8, 0.0)
crowd = lp(rng.standard_normal(N), 0.02) * 0.5 + lp(rng.standard_normal(N), 0.2) * 0.04   # stage ambience (0-1.6 s)
crowd *= np.clip(1 - (t - 1.35) / 0.4, 0, 1)
hum = (np.sin(2 * np.pi * 60 * t) * 0.3 + np.sin(2 * np.pi * 120 * t) * 0.1) * 0.05 * np.clip(1 - (t - 1.4) / 0.3, 0, 1)
for b in np.arange(0.83, 5.0, 60 / 72):                                       # suspense pulse, 72 bpm
    m = int(0.32 * SR); xx = np.arange(m) / SR
    place(sfx, np.sin(2 * np.pi * 55 * xx) * env(m, 0.006, 0.11) * 0.45, b)
m = int(0.9 * SR); xx = np.arange(m) / SR                                     # soft electronic shimmer into Alice
sh = sum(np.sin(2 * np.pi * f * xx + rng.uniform(0, 6)) for f in (880, 1320, 1760)) / 3
place(sfx, sh * np.minimum(1, xx / 0.25) * np.exp(-xx / 0.35) * 0.06, 1.42)
place(sfx, np.sin(2 * np.pi * 220 * xx) * env(m, 0.01, 0.25) * 0.10, 1.48)
for at in (2.05, 2.55, 2.95):                                                 # connection line ticks (subtle)
    m = int(0.05 * SR); c = rng.standard_normal(m); place(sfx, (c - lp(c, 0.3)) * env(m, 0.0005, 0.008) * 0.25, at)
m = int(1.8 * SR); xx = np.arange(m) / SR                                     # rising electronic tension (GPU)
rise = np.sin(2 * np.pi * np.cumsum(110 + 260 * (xx / 1.8) ** 2) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(165 + 390 * (xx / 1.8) ** 2) / SR)
place(sfx, rise * (xx / 1.8) ** 1.6 * 0.16, 3.2)
place(sfx, lp(rng.standard_normal(m), 0.08) * (xx / 1.8) ** 2 * 0.10, 3.2)
m = int(0.6 * SR); xx = np.arange(m) / SR                                     # GPU reveal low thump
place(sfx, np.sin(2 * np.pi * 52 * xx) * env(m, 0.004, 0.25) * 0.55, 3.2)
bed = (np.sin(2 * np.pi * 41.2 * t) * 0.5 + np.sin(2 * np.pi * 61.7 * t) * 0.25) * np.minimum(1, t / 0.5) * 0.05

ve = lp(np.abs(voice), 0.002); duck = 1 - 0.6 * np.clip(ve / (ve.max() * 0.3 + 1e-9), 0, 1)
mix = voice * 1.0 + (sfx * 0.55 + crowd * 0.06 + hum + bed) * duck
fade = np.ones(N); fade[-int(0.03 * SR):] = np.linspace(1, 0.6, int(0.03 * SR))   # hand-off into S2, no hard click
mix = mix * fade
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
out = ROOT / "remotion/public/s1f/s1f_mix.wav"; tmp = str(out) + ".tmp.wav"
sf.write(tmp, np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000",
                "-t", "5.0", str(out)], check=True)
Path(tmp).unlink()


def words(text, t0, t1):
    ws = text.split(); L = [len(w) + 2 for w in ws]; tot = sum(L); acc = t0; o = []
    for w, l in zip(ws, L):
        d = (t1 - t0) * l / tot; o.append({"w": w, "s": round(acc, 3), "e": round(acc + d, 3)}); acc += d
    return o


json.dump({"q1": words("Was NVIDIA's CEO targeted?", T1, e1), "q2": words("What did he know about the chips?", T2, e2)},
          open(ROOT / "remotion/src/s1/s1f_vo.json", "w"), indent=1)
print("wrote", out)
