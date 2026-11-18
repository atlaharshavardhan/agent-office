"""S1 audio: narration (Kokoro am_michael, free/local) + restrained sound design, exactly 5.0 s, -14 LUFS.
Bass impact 0.0 s · metallic movement 0.15 s · mechanical GPU click 1.3 s · electronic pulse 1.6 s ·
connection pulses 3.3/3.7 s · rising transition tone 4.3-5.0 s. No whooshes."""
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[3]
SR, DUR = 48000, 5.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(11)
k = Kokoro(str(ROOT / "voice/models/kokoro-v1.0.onnx"), str(ROOT / "voice/models/voices-v1.0.bin"))
v, vsr = k.create("Who is Alice Huang, and why did her Nvidia connection draw scrutiny?", voice="am_michael", speed=1.0, lang="en-us")
v = np.interp(np.arange(int(len(v) * SR / vsr)) * vsr / SR, np.arange(len(v)), v)
nz = np.nonzero(np.abs(v) > 0.01)[0]; v = v[nz[0]:nz[-1] + 1]          # trim silence
voice = np.zeros(N); st = int(0.12 * SR); voice[st:st + min(len(v), N - st)] = v[:N - st]
print("voice ends at", round((st + len(v)) / SR, 2), "s")
def place(buf, sig, at, g):
    i = int(at * SR); j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g
def env(n, a, d):
    x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
sfx = np.zeros(N)
n = int(1.4 * SR); x = np.arange(n) / SR
place(sfx, np.sin(2 * np.pi * np.cumsum(42 * (1 + 0.8 * np.exp(-x * 10))) / SR) * env(n, 0.004, 0.45), 0.0, 0.9)   # bass impact
n = int(0.5 * SR); m = rng.standard_normal(n); m = m - lp(m, 0.2)
place(sfx, m * env(n, 0.05, 0.12) * 0.12 + np.sin(2 * np.pi * 2300 * np.arange(n) / SR) * env(n, 0.002, 0.06) * 0.05, 0.15, 1.0)  # metallic
n = int(0.08 * SR); c = rng.standard_normal(n); c = c - lp(c, 0.35)
place(sfx, c * env(n, 0.0005, 0.012) * 0.5, 1.30, 1.0); place(sfx, c * env(n, 0.0005, 0.01) * 0.35, 1.38, 1.0)   # mechanical click
for at, f0 in ((1.6, 220), (3.3, 330), (3.7, 440)):                                                        # electronic pulses
    n = int(0.35 * SR); place(sfx, np.sin(2 * np.pi * f0 * np.arange(n) / SR) * env(n, 0.01, 0.09) * 0.18, at, 1.0)
n = int(0.7 * SR); x = np.arange(n) / SR                                                                    # rising transition tone
place(sfx, np.sin(2 * np.pi * np.cumsum(180 + 420 * (x / 0.7) ** 2) / SR) * np.minimum(1, x / 0.6) * 0.12, 4.3, 1.0)
bed = (np.sin(2 * np.pi * 55 * t) * 0.5 + np.sin(2 * np.pi * 82.4 * t) * 0.3) * np.minimum(1, t / 0.8) * 0.06   # low tension bed
ve = lp(np.abs(voice), 0.0008); duck = 1 - 0.75 * np.clip(ve / (ve.max() * 0.25 + 1e-9), 0, 1)
mix = voice + (sfx * 0.7 + bed) * duck
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
out = ROOT / "remotion/public/s1audio/s1_mix.wav"; tmp = str(out) + ".tmp.wav"
sf.write(tmp, np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-t", "5.0", str(out)], check=True)
Path(tmp).unlink(); print("wrote", out)
