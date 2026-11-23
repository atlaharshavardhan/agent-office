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
    "n1": "Can a mirror fool Face ID?",
    "n2": "Every time you glance at your iPhone, the TrueDepth camera projects thousands of invisible infrared dots onto your face.",
    "n3": "Watch what happens around the nose and cheeks. The camera reads that dot pattern to build a map of your face in three dimensions.",
    "n4": "It also captures an infrared image. Your iPhone uses both to check whether the face matches the one you enrolled.",
    "n5": "Here's the twist. A mirror can reflect infrared light too. So what happens when the phone sees only my reflection?",
    "n6_guess": "So what do you think? Does my reflection unlock it? Comment your guess.",
    "n6_open": "It unlocked. On my iPhone, the reflection was enough.",
    "n6_locked": "It stayed locked. My reflection alone didn't unlock it in this test.",
}
SPEED = {"n1": 1.3}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="bm_george", speed=SPEED.get(n, 1.18), lang="en-gb")
    sf.write(OUT / f"{n}.wav", a, sr)
    L[n] = round(len(a) / sr, 3)
    print(n, L[n])
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
