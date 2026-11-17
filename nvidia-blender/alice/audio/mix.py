"""Alice Short audio: narration (placed per sentence) + dark investigative bed + restrained SFX, ducked, -14 LUFS.
Writes remotion/public/audio/alice_mix.wav and alice/audio/alice_mix_nomusic.wav."""
import json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
SR = 48000
ROOT = Path(__file__).resolve().parents[2]
TL = json.load(open(ROOT / "remotion/src/alice/timeline.json"))
N = int(TL["end"] * SR) + SR
rng = np.random.default_rng(3)
def env(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e
def lp(x, a=0.02):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def place(buf, sig, at, g=1.0):
    i = int(at * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i] * g
t = np.arange(N) / SR
# bed: low D minor drone + slow pulse, darker in the middle, lifts at the question
bed = sum(np.sin(2 * np.pi * f * t + p) * a for f, a, p in ((36.7, .5, 0), (73.4, .35, 1), (87.3, .2, 2), (110, .12, .5), (146.8, .06, 1.3)))
bed *= 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4.0))
pulse = np.zeros(N)
for k in np.arange(0.0, TL["end"] - 2.0, 60 / 92):                 # 92 bpm heartbeat tick
    n = int(0.12 * SR); place(pulse, np.sin(2 * np.pi * 55 * np.arange(n) / SR) * np.exp(-np.arange(n) / (0.03 * SR)), k, 0.5)
music = (bed * 0.18 + pulse * 0.35)
out_t = TL["scenes"][9]
music *= np.clip((TL["end"] - t) / 0.6, 0, 1)                         # fade at the very end
# sfx: bass hit at 0 and at the resignation, scan sweeps on the hook, soft ticks at cuts
sfx = np.zeros(N)
def boom(d=1.6, f0=42):
    n = int(d * SR); x = np.arange(n) / SR; fr = f0 * (1 + 1.5 * np.exp(-x * 9))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 2.6)
def sweep(d=0.8):
    n = int(d * SR); x = rng.standard_normal(n); x = x - lp(x, 0.08); return x * env(n, d * 0.8, d * 0.2) * 0.25
def tick():
    n = int(0.03 * SR); x = rng.standard_normal(n); return (x - lp(x, 0.3)) * np.exp(-np.arange(n) / (0.004 * SR)) * 0.6
place(sfx, boom(), 0.0, 0.9); place(sfx, sweep(), 0.3, 1.0); place(sfx, sweep(0.7), 1.9, 0.8)
res = TL["scenes"][6]; place(sfx, boom(2.0, 36), res, 1.0)
for c in TL["scenes"][1:]: place(sfx, tick(), c, 0.5)
place(sfx, boom(1.2, 60), out_t, 0.5)
# voice
voice = np.zeros(N)
for k, s in enumerate(TL["sentences"]):
    a, sr = sf.read(ROOT / f"alice/voice/s_{k:02d}.wav")
    if a.ndim > 1: a = a.mean(1)
    if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    place(voice, a, s["t0"])
# ducking: music -14 dB under voice
ve = lp(np.abs(voice), 0.0008); duck = 1 - 0.8 * np.clip(ve / (ve.max() * 0.25 + 1e-9), 0, 1)
mix = voice * 1.0 + music * duck + sfx * 0.6
nomus = voice + sfx * 0.6
def write(x, path):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    tmp = str(path) + ".tmp.wav"; sf.write(tmp, np.stack([x, x], 1), SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", str(path)], check=True)
    Path(tmp).unlink()
(ROOT / "remotion/public/audio").mkdir(parents=True, exist_ok=True)
write(mix[:int(TL["end"] * SR)], ROOT / "remotion/public/audio/alice_mix.wav")
write(nomus[:int(TL["end"] * SR)], ROOT / "alice/audio/alice_mix_nomusic.wav")
print("ok", TL["end"])
