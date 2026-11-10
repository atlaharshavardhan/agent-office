"""iPhone Duo Short narration: George (Kokoro bm_george, en-gb), speed 1.18 as in the OTP video.
One WAV per line + lengths.json. Run with the invisitech-yt Kokoro venv:
  ../../../invisitech-yt/tools/voice/.venv/bin/python vo_lines.py
"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

M = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "invisitech/invisitech-yt/tools/voice/models"
OUT = Path(__file__).parent.parent / "public" / "vo"; OUT.mkdir(parents=True, exist_ok=True)
LINES = {
    "l1": "This three lakh rupee iPhone folds in half.",
    "l2": "But glass cracks when you bend it. So how?",
    "l3": "Let's open it up. It's just five point two millimetres thin.",
    "l4": "Trick one: the screen isn't one sheet. It's about ten thin layers. Like a stack of paper, they slide past each other when it bends, so nothing snaps.",
    "l5": "Trick two: the hinge. Over a hundred parts, gears and springs, under a three D printed titanium cover. When it closes, the screen doesn't fold flat. It curls into a teardrop shape.",
    "l6": "But bend the same spot again and again, and it never goes perfectly flat. That's the crease you can feel.",
    "l7": "So it doesn't fold like paper. It rolls like a poster.",
    "l7a": "So it doesn't fold like paper.",  # l7 split around the close sound
    "l7b": "It rolls like a poster.",
    "l8": "Follow InvisiTech for more tech, explained.",
    "l8s": "Follow InvisiTech for more. Like, and subscribe.",  # v4 ending
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
L = {}
SPEED = {"l1": 1.35, "l2": 1.25}  # quicker hook; the rest at the channel's usual 1.18
for n, t in LINES.items():
    a, sr = k.create(t, voice="bm_george", speed=SPEED.get(n, 1.18), lang="en-gb")
    sf.write(OUT / f"{n}.wav", a, sr)
    L[n] = round(len(a) / sr, 3)
    print(n, L[n])
json.dump(L, open(OUT / "lengths.json", "w"), indent=1)
