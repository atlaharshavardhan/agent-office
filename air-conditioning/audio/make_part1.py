"""Part 1 narration (Kokoro bm_george, free/local) + light sound design, 15.0 s, -14 LUFS.
Writes remotion/public/audio/part1.wav and remotion/src/style/part1_vo.json (line + word timings for captions)."""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT.parent / "nvidia-blender/voice/models"
SR, DUR = 48000, 15.0
N = int(SR * DUR); t = np.arange(N) / SR
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
LINES = [(0.25, "Your room is roasting. You open the window, and even hotter air rushes in.", 4.7),
         (5.2, "You switch on a fan. The breeze feels good, but the room is still just as hot.", 5.6),
         (11.2, "So you put ice in front of the fan. It works…", 3.6)]
voice = np.zeros(N); timing = []
for start, text, maxlen in LINES:
    speed = 1.0
    while True:
        v, vsr = k.create(text, voice="bm_george", speed=speed, lang="en-gb")
        v = np.interp(np.arange(int(len(v) * SR / vsr)) * vsr / SR, np.arange(len(v)), v)
        nz = np.nonzero(np.abs(v) > 0.01)[0]; v = v[nz[0]:nz[-1] + 1]
        if len(v) / SR <= maxlen or speed > 1.35: break
        speed += 0.05
    i = int(start * SR); voice[i:i + len(v)] += v[:N - i]
    timing.append({"from": start, "to": round(start + len(v) / SR, 2), "text": text})
    print(f"{start:5.2f}-{start + len(v) / SR:5.2f}s speed {speed:.2f}  {text}")
rng = np.random.default_rng(3)
def env(n, a, d): x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)
def place(buf, sig, at, g=1.0): i = int(at * SR); j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g
sfx = np.zeros(N)
noise = rng.standard_normal(N)
from scipy.signal import lfilter
hot = lfilter([0.02], [1, -0.98], noise) * np.clip((t - 1.0) / 0.6, 0, 1) * np.clip((5.5 - t) / 0.5, 0, 1)   # hot air rush
fan = lfilter([0.05], [1, -0.95], rng.standard_normal(N)) * np.clip((t - 6.3) / 1.0, 0, 1)                    # fan whoosh bed
n = int(0.35 * SR); place(sfx, lfilter([0.3], [1, -0.7], rng.standard_normal(n)) * env(n, 0.002, 0.08), 1.0, 0.25)   # sash slide
n = int(0.25 * SR); place(sfx, np.sin(2 * np.pi * 90 * np.arange(n) / SR) * env(n, 0.003, 0.06), 6.2, 0.4)          # fan clunk in
n = int(0.6 * SR); place(sfx, lfilter([0.2], [1, -0.8], rng.standard_normal(n)) * env(n, 0.01, 0.15), 11.35, 0.3)    # ice slide
n = int(0.4 * SR); x = np.arange(n) / SR; place(sfx, np.sin(2 * np.pi * 1800 * x) * env(n, 0.001, 0.05) * 0.15, 12.4)  # ice clink
mix = voice + (sfx + hot * 0.6 + fan * 0.35) * 0.6
mix /= np.abs(mix).max() + 1e-9; mix *= 0.9
out = ROOT / "remotion/public/audio/part1.wav"; out.parent.mkdir(parents=True, exist_ok=True)
tmp = str(out) + ".tmp.wav"; sf.write(tmp, np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-t", "15", str(out)], check=True)
Path(tmp).unlink()
json.dump(timing, open(ROOT / "remotion/src/style/part1_vo.json", "w"), indent=1)
print("wrote", out)
