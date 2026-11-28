"""Part 2, segment B (packets -> label -> tower -> glass cable). FREE voice (Kokoro am_michael). Usage: python make_part2b_voice.py <models dir> [speed]"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.1; OUT = Path(__file__).parent / "p2b"; OUT.mkdir(exist_ok=True)
LINES = {"s1": "Let's start where the photo starts: your phone, in Hyderabad. You tap send.", "s2": "First, the photo breaks into tiny pieces.", "s3": "Each piece is just ones and zeros.", "s4": "Your whole photo, only ones and zeros.", "s5": "Then your phone locks it. It is encrypted.", "s6": "If anyone tries to look, they find nothing. Only noise.", "o1": "But where do all these pieces go?", "o2": "And then, it has to cross an entire ocean.", "p1": "Now it is cut into about 2,000 packets.", "p2": "Every packet gets a label: where it is going, where it came from, and its number, so the pieces can be put back in order.", "p3": "Then radio waves carry them to a mobile tower.", "p4": "Its antennas catch the signal.", "p5": "A box at the bottom turns it into light, and sends it down a glass cable, under the street."}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=SPEED, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3)
print(L, "total", round(sum(L.values()), 2)); json.dump({"lengths": L, "text": LINES, "speed": SPEED}, open(OUT / "lengths.json", "w"), indent=1)
