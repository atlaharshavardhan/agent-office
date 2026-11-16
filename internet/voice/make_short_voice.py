"""Narration for the new 3D part of the Short (flight to her phone): Kokoro am_michael, speed 1.12. Usage: python make_short_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent / "short"; OUT.mkdir(exist_ok=True)
LINES = {
    "f1": "Then she moves to London.",
    "f2": "Seven thousand kilometres away.",
    "f3": "Her flight takes nine hours.",
    "f4": "His video has to do it in under a second.",
    "l1": "A new city.",
    "l2": "A new street, far from his balcony.",
    "l3": "And she is waiting for his video.",
    "p1": "He hits send.",
    "p2": "The video is chopped into fifteen hundred small packets,",
    "p3": "each stamped with her address.",
    "p4": "Radio waves carry them to the nearest cell tower.",
    "u1": "From the tower, they dive under the street,",
    "u2": "into a glass cable, as flashes of light.",
    "r1": "Every router reads the address,",
    "r2": "and passes the packet one step closer.",
    "r3": "If one road is jammed, it picks another.",
    "s1": "Then the land runs out.",
    "s2": "So the cable keeps going, straight into the sea.",
    "b1": "Three kilometres down, in the dark,",
    "b2": "the light races along the sea floor,",
    "b3": "at two hundred thousand kilometres a second.",
    "e1": "The light fades on the way,",
    "e2": "so a repeater boosts it, every sixty to a hundred kilometres.",
    "c1": "And the cable? About as thick as a garden hose.",
    "c2": "Steel, plastic and copper, layer on layer,",
    "c3": "all to protect a few glass fibres,",
    "c4": "each as thin as a human hair.",
    "g1": "Our packet crosses the Arabian Sea, the Red Sea, the Mediterranean, and reaches London.",
    "g2": "More than ninety-five percent of data between continents travels this way.",
    "n1": "All fifteen hundred packets reach her phone in a blink.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=1.12, lang="en-us")
    sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n])
json.dump({"lengths": L, "text": LINES}, open(OUT / "lines.json", "w"), indent=1)
