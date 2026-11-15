"""Narration for the second half (packets to end card): Kokoro am_michael, speed 1.12. Usage: python make_tail_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent
LINES = {
    "t1": "Big videos get chopped into small packets,",
    "t2": "each carrying that address.",
    "t3": "Then she flies to London.",
    "t4": "Now the routers link up under the sea,",
    "t5": "through glass cables carrying light.",
    "t6": "Almost all data between continents travels this way.",
    "t7a": "Anchors cut them,",
    "t7b": "so we lay hundreds.",
    "t7c": "Packets reroute.",
    "t8": "And her reply still lands in a blink.",
    "t9": "That's how this video reached you.",
    "t10": "Follow InvisiTech for more.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us")
    sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n], sr)
json.dump(L, open(OUT / "tail_lengths.json", "w"), indent=1)
