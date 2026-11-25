"""Mirror Face ID Short narration: George (Kokoro bm_george, en-gb), channel speed 1.18.
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
    "n1": "Have you ever wondered if your reflection can unlock an iPhone 18 Pro Max?",
    "n2": "First, look at what happens up here when I wake the phone.",
    "n3a": "This tiny projector puts thousands of invisible dots on my face.",
    "n3b": "And the infrared camera picks up that pattern.",
    "n5": "Here's the twist. A mirror can bounce that infrared light back, too.",
    "n3c": "On a flat wall, the dots land in a neat pattern. Your nose bends them one way, and your cheeks bend them another. The phone reads those bends to map the shape of your face.",
    "n3d": "That's why a photo won't work. It's flat, so the dots never bend.",
    "n4": "It also takes an infrared picture. Then it uses both to check if I'm the person who set up Face ID.",
    "n6q": "So, did it work?",
    "n6_open": "It actually unlocked.",
    "n6_locked": "In my test, it stayed locked.",
}
SPEED = {"n1": 1.2, "n3a": 1.25, "n3b": 1.22, "n3c": 1.22}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
ONLY = sys.argv[2:]          # optional: regenerate only these line ids, keep the rest
L = json.load(open(OUT / "lengths.json")) if ONLY else {}
for n, t in LINES.items():
    if ONLY and n not in ONLY: continue
    a, sr = k.create(t, voice="bm_george", speed=SPEED.get(n, 1.18), lang="en-gb")
    sf.write(OUT / f"{n}.wav", a, sr)
    L[n] = round(len(a) / sr, 3)
    print(n, L[n])
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
