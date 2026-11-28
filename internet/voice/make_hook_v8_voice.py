"""Hook v8 narration, FREE voice (Kokoro am_michael), Harsh's text of 28 Nov 2026, three sentences so each camera move can be timed to its words.
Usage: python make_hook_v8_voice.py <models dir> [speed]"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.1; OUT = Path(__file__).parent / "p2v8"; OUT.mkdir(exist_ok=True)
LINES = {"v1": "You send a photo to your girlfriend in London.", "v2": "You'd think it travels through space, but it actually races across the ocean as light, through an underwater cable.", "v3": "But how?"}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=SPEED, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3)
print(L, "total", round(sum(L.values()), 2)); json.dump({"lengths": L, "text": LINES, "speed": SPEED}, open(OUT / "lengths.json", "w"), indent=1)
