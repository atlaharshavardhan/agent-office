"""Hook v7 narration in the FREE voice (Kokoro am_michael): Harsh's new text (28 Nov 2026). No ElevenLabs. Usage: python make_part2_hook_v7_voice.py <models dir>"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); OUT = Path(__file__).parent / "p2v7"; OUT.mkdir(exist_ok=True); SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.2
LINES = {"m1": "You send a photo to your girlfriend in London.", "m2": "But instead of flying through space, it races across the ocean as light, through a cable beneath the sea.", "m3": "Seconds later, her phone buzzes.", "m4": "But how?"}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}
for n, t in LINES.items():
    a, sr = k.create(t, voice="am_michael", speed=SPEED, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); print(n, L[n], t[:50])
print("total", round(sum(L.values()), 2)); json.dump({"lengths": L, "text": LINES, "speed": SPEED}, open(OUT / "lengths.json", "w"), indent=1)
