"""NVIDIA Short narration (script v3): Michael (Kokoro am_michael, en-us), speed 1.2 (hook 1.3) to fit 45 s.
One WAV per line + lengths.json. Usage: .venv/bin/python voice/vo_lines.py
Models (Apache-2.0): github.com/thewh1teagle/kokoro-onnx releases model-files-v1.0 -> voice/models/
"""
import json
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
LINES = [
    "In five weeks, Nvidia's value fell by one point eight trillion dollars.",
    "That's almost half of India's yearly economy, wiped off its share price. How?",
    "Nvidia makes the chips A.I. runs on. Chat G P T needs thousands of them.",
    "Every tech giant wanted them, so in October, Nvidia hit a record five point eight trillion.",
    "Then, within weeks, three shocks.",
    "One: US voters passed local rules that could slow new A.I. data centres.",
    "Two: Nvidia invests in A.I. start-ups, who then buy its chips. Is that real demand?",
    "Three: its CEO, Jensen Huang, stepped down amid a board investigation.",
    "Bubble? Sales still doubled in a year. Investors just fear it won't last.",
    "A share price is a bet on the future. The bet flipped, not the business.",
    "Follow Invisi Tech for more.",
]
SPEED = {0: 1.3}   # quicker hook line
k = Kokoro(str(HERE / "models/kokoro-v1.0.onnx"), str(HERE / "models/voices-v1.0.bin"))
L = []
for i, t in enumerate(LINES):
    a, sr = k.create(t, voice="am_michael", speed=SPEED.get(i, 1.2), lang="en-us")
    sf.write(HERE / f"line{i + 1:02d}.wav", a, sr)
    L.append(round(len(a) / sr, 3))
    print(i + 1, L[-1], t)
json.dump({"sr": sr, "lengths": L, "lines": LINES}, open(HERE / "lengths.json", "w"), indent=1)
print("total", round(sum(L), 2))
