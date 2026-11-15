"""MacBook logo Short narration. Default: George (Kokoro bm_george, en-gb, speed 1.18, the free voice of the OTP / Duo videos) into voice/george/.
Michael (am_michael, en-us, 1.12) was v1: python make_voice.py <models> michael
One WAV per sentence, so the caption chunks can be timed inside each sentence.
  python make_voice.py <kokoro models dir> [george|michael]
"""
import json, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

M = Path(sys.argv[1])
WHO = sys.argv[2] if len(sys.argv) > 2 else "george"
VOICE, LANG, SPEED = {"george": ("bm_george", "en-gb", 1.18), "michael": ("am_michael", "en-us", 1.12)}[WHO]
HERE = Path(__file__).parent / WHO if WHO != "michael" else Path(__file__).parent
HERE.mkdir(exist_ok=True)
# each line = list of sentences; each sentence = caption chunks joined by " | "
LINES = [
    ["This logo | shouldn't be able to glow."],
    ["After ten years, | Apple brought it back | on the new MacBook Pro.", "But its OLED screen | only makes light | from the front.", "There's no light | behind it."],
    ["So where's the glow | coming from?", "Let's open the lid."],
    ["Hidden behind the screen | are four tiny LEDs.", "Apple says | it built this light source | just for the logo."],
    ["A mirror-like layer | bounces their light,", "a frosted sheet | spreads it out evenly,", "and it shines | through the logo.", "No bright spots."],
    ["It glows | whenever your Mac is awake.", "Brighter in a bright room, | dimmer in a dark one.", "Don't like it?", "Apple lets you | switch it off."],
    ["Follow InvisiTech | for more."],
]
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
out = []
for i, line in enumerate(LINES, 1):
    for j, s in enumerate(line, 1):
        a, sr = k.create(s.replace(" | ", " "), voice=VOICE, speed=SPEED, lang=LANG)
        f = HERE / f"l{i}_{j}.wav"; sf.write(f, a, sr)
        out.append({"line": i, "file": f.name, "text": s, "dur": round(len(a) / sr, 3)})
        print(f.name, out[-1]["dur"], s)
json.dump(out, open(HERE / "sentences.json", "w"), indent=1)
