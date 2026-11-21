"""Extra narration for Part 1 version 3 (21 Nov 2026): stronger hook, LAN cable line. Kokoro am_michael, speed 1.12.
Usage: python make_v3_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent / "v3"; OUT.mkdir(exist_ok=True)
LINES = {
    "g1": "You can build the internet with a torch. Seriously.",
    "h1b": "Flash it at your friend across the street,",
    "p5b": "So we use a wire: a LAN cable.",
    "p5c": "So we use a LAN cable.",
    "z2": "Next: how a photo crosses an ocean.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n])
json.dump({"lengths": L, "text": LINES}, open(OUT / "lines.json", "w"), indent=1)
