"""Narration for Part 1's photo lesson: Kokoro am_michael, speed 1.12. Usage: python make_part1_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent / "part1"; OUT.mkdir(exist_ok=True)
LINES = {
    "a1": "A text is tiny. But what about a photo?",
    "b1": "Send it as one big block, and it holds the whole line.",
    "b2": "Everyone else has to wait.",
    "b3": "One glitch, and it starts all over again.",
    "c1": "So the internet never sends it whole.",
    "d1": "It cuts the photo into about two thousand small packets,",
    "d2": "each with her address and a number.",
    "d3": "They share the lines with everyone else.",
    "d4": "Busy road? Some go another way.",
    "d5": "One lost? Only that one is sent again.",
    "d6": "And her phone puts them back in order.",
    "z1": "So how does a photo cross an ocean? That's part two.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n])
json.dump({"lengths": L, "text": LINES}, open(OUT / "lines.json", "w"), indent=1)
