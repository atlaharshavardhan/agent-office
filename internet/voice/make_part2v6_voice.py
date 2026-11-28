"""Part 2 v6: one continuous narration (Harsh's script of 28 Nov 2026). FREE voice (Kokoro am_michael). Each scene is ONE synth call so the sentences flow together.
Usage: python make_part2v6_voice.py <models dir> [speed]   -> voice/p2v6/<scene>.wav + lengths.json"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.12; OUT = Path(__file__).parent / "p2v6"; OUT.mkdir(exist_ok=True)
S = {
 "n1": "First, your phone converts the photo into digital data. Millions of ones and zeros. Then, it encrypts that data, so if anyone intercepts it, all they see is scrambled data.",
 "n2": "Next, the data is split into thousands of tiny packets. Each packet carries information about where it's going, where it came from, and how it fits into the original data. And now, they're ready to travel.",
 "n3": "Radio waves carry them to a nearby mobile tower. From there, the data travels as pulses of light through a fibre-optic cable beneath the street.",
 "n4": "Along the way, routers read the addresses and decide where to send each packet next. If one route is congested, they can take another. But eventually, the land ends, and the cable disappears beneath the ocean.",
 "n5": "Deep underwater, the cable can be as thin as a garden hose. Layers of steel and plastic protect it, while copper carries electrical power. And at its core are glass fibres, thinner than a human hair.",
 "n6": "Down here, your photo is nothing but pulses of light. Every 60 to 100 kilometres, a repeater amplifies the signal, keeping it strong across the ocean.",
 "n7": "Almost all intercontinental internet traffic travels through cables like these. But what happens if a ship's anchor cuts one? The network can reroute the data through another cable.",
 "n8": "Once the data reaches London, it travels to a mobile tower, which sends it to her phone as radio waves. The packets may arrive out of order, but they're put back into the correct sequence. If any are missing, they're requested again. Finally, her phone decrypts the data, and the photo appears.",
 "n9": "All of this can happen in the blink of an eye.",
 "n10": "Follow for more.",
}
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin")); L = {}; words = 0
for n, t in S.items():
    a, sr = k.create(t, voice="am_michael", speed=SPEED, lang="en-us"); sf.write(OUT / f"{n}.wav", a, sr); L[n] = round(len(a) / sr, 3); w = len(t.split()); words += w if n != "n10" else 0
    print(n, w, "words", L[n], "s", round(w / L[n] * 60), "wpm")
tw = sum(len(t.split()) for t in S.values()); tl = sum(L.values()); print("total", tw, "words", round(tl, 2), "s", round(tw / tl * 60), "wpm")
json.dump({"lengths": L, "text": S, "speed": SPEED}, open(OUT / "lengths.json", "w"), indent=1)
