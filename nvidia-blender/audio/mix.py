"""Mix voice + music bed (ducked 14 dB under the voice) + sfx, then loudness-normalise to -14 LUFS.
Writes mix.wav and mix_nomusic.wav (voice + sfx, for Instagram auto-translate)."""
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf

D = Path(__file__).resolve().parent
v, sr = sf.read(D / "voice.wav"); b, _ = sf.read(D / "bed.wav"); f, _ = sf.read(D / "sfx.wav")
# voice activity envelope (20 ms windows), smoothed with attack/release
w = int(0.02 * sr); e = np.sqrt(np.convolve((v ** 2).mean(1), np.ones(w) / w, "same"))
act = (e > 0.01).astype(float)
k = int(0.25 * sr); act = np.convolve(act, np.ones(k) / k, "same")          # ~250 ms release / lookahead
act = np.clip(act * 3, 0, 1)
duck = 10 ** ((-14 * act) / 20)
bed = b * duck[:, None] * 0.55
sfxg = f * 0.32
def write(x, name):
    tmp = D / f"_{name}.wav"; sf.write(tmp, np.clip(x, -1, 1).astype(np.float32), sr)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
                    "-c:a", "pcm_s16le", str(D / f"{name}.wav")], check=True); tmp.unlink()
r = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
sp = act > 0.9
print("under speech: voice", round(r(v[sp]), 1), "music", round(r(bed[sp]), 1), "sfx", round(r(sfxg[sp]), 1))
print("between lines: music", round(r(bed[act < 0.05]), 1))
write(v + bed + sfxg, "mix"); write(v + sfxg, "mix_nomusic")
