"""Internet Short narration: Kokoro am_michael, speed 1.12. One WAV per line + lengths.json.
Usage: python make_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent
LINES = {
    "h1": "This blinking torch?",
    "h2": "That's the internet.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us")
    sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n], sr)
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
