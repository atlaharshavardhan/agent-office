"""Part 2, routers + shore. FREE voice (Kokoro am_michael). Usage: python make_part2d_voice.py <models dir> [speed]"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.25; OUT = Path(__file__).parent / "p2d"; OUT.mkdir(exist_ok=True)
LINES = {"q1": "Three kilometres down, in the Arabian Sea, the photo is only light.", "q2": "Light in glass travels about 200,000 kilometres every second.", "q3": "As it fades, a repeater, every 60 to 100 kilometres, boosts it.", "r1": "At the next stop, a router reads the label. Each router only knows the next step.", "r2": "If a road is busy, it sends it another way.", "r3": "Then the land ends. The cable goes into the sea.", "r4": "From here, it all travels as light, under the sea."}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=SPEED, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3)
print(L, "total", round(sum(L.values()), 2)); json.dump({"lengths": L, "text": LINES, "speed": SPEED}, open(OUT / "lengths.json", "w"), indent=1)
