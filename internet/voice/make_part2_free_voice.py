"""Part 2 hook narration in the FREE voice (Kokoro am_michael, speed 1.12): Harsh's approved script (28 Nov 2026). No ElevenLabs.
Usage: python make_part2_free_voice.py <models dir with kokoro-v1.0.onnx and voices-v1.0.bin>.  Output: voice/p2free/*.wav and lengths.json"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent / "p2free"; OUT.mkdir(exist_ok=True)
LINES = {"f1": "Imagine sending a photo to your girlfriend in London.", "f2": "You'd think it travels through a satellite,", "f3": "but it actually crosses the ocean through a cable as light,", "f4": "in a fraction of a second.", "f5": "But how?"}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n], t)
json.dump({"lengths": L, "text": LINES}, open(OUT / "lengths.json", "w"), indent=1)
