"""Mirror Face ID Short narration: Kokoro voice set by VOICE below.
One WAV per line + public/vo/lengths.json.  Usage: python tools/vo_lines.py <kokoro models dir>
The two result lines (n6_open / n6_locked) are generated but NOT placed on the timeline
until the real mirror-test footage is in and the matching line is chosen in src/script.ts.
"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

M = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "public" / "vo"; OUT.mkdir(parents=True, exist_ok=True)
LINES = {
    "n1": "Have you ever wondered if you can open your iPhone with your mirror reflection?",
    "n2": "When the phone is awake, these cameras fire thirty thousand dots",
    "n3a": "straight onto the face, and the infrared camera picks up the pattern.",
    "n5": "But here's the twist: a mirror bounces that light straight back onto my face.",
    "n3c": "So what's the phone really reading? My nose bends the dots one way, my cheeks another, and from those bends, it maps my face.",
    "n3d": "That's why a flat photo fails. Nothing bends.",
    "n4": "It also grabs an infrared picture, then checks both against the face I set up.",
    "n6q": "So, did it work?",
    "n6r": "It unlocked for me! Did yours? Tell me in the comments.",
    "n6_open": "It actually unlocked.",
    "n6_locked": "In my test, it stayed locked.",
}
VOICE, LANG, RATE = "am_michael", "en-us", 1.28      # narrator (was bm_george, en-gb, 1.18)
SPEED = {}        # one speed for every line, so the pace never jumps between lines
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
ONLY = sys.argv[2:]          # optional: regenerate only these line ids, keep the rest
L = json.load(open(OUT / "lengths.json")) if ONLY else {}
for n, t in LINES.items():
    if ONLY and n not in ONLY: continue
    a, sr = k.create(t, voice=VOICE, speed=SPEED.get(n, RATE), lang=LANG)
    sf.write(OUT / f"{n}.wav", a, sr)
    L[n] = round(len(a) / sr, 3)
    print(n, L[n])
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
