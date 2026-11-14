"""Internet Short narration: Kokoro am_michael, speed 1.12. One WAV per line + lengths.json.
Usage: python make_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent
LINES = {
    "h1": "Flash a torch at your friend across the street,",
    "h2": "and you've basically built the internet.",
    "p1": "On is one. Off is zero.",
    "p2": "Eight blinks make one letter.",
    "p3": "But hello takes forty blinks.",
    "p4": "Too slow.",
    "p5": "So we use a wire.",
    "p6": "Now it's a billion blinks, every second.",
    "p7": "Now the whole building wants in.",
    "p8": "Every device connects to one box: the router.",
    "p9": "Each phone gets a number, like a flat number.",
    "p10": "That's its IP address.",
    "p11": "Big videos get chopped into small packets,",
    "p12": "each carrying that address.",
    "p13": "Friend in London? Routers link up, under the sea,",
    "p14": "through glass cables carrying light.",
    "p15": "Ninety-nine percent of data between continents goes this way.",
    "p16": "Anchors cut them, so we lay hundreds. Packets reroute.",
    "p17": "That's how this video reached you.",
    "p18": "Follow InvisiTech for more.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us")
    sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n], sr)
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
