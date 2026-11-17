"""Stadium crowd Short narration: George (free Kokoro bm_george, en-gb, 1.18). Each line starts at its scene's time
(scenes are fixed by the brief), so the voice is timed to the picture. Writes voice.wav (45 s), captions.json, ../stadium-crowd.en.srt.
  python make_voice.py <kokoro models dir>"""
import json, sys, numpy as np, soundfile as sf
from pathlib import Path
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); HERE = Path(__file__).parent; SR = 24000; TOTAL = 45.0
LINES = [  # (earliest start s, sentence with caption chunks split by |) — "The Deadly Paradox of Running Faster", text from Harsh's brief
    (0.3, "Imagine 50,000 people | trying to escape a stadium. | Running faster | could actually slow everyone down.", 1.42),
    (5.6, "Everyone wants to get out first. | So they rush | toward the same exit."),
    (10.3, "But when too many people | compete for the same space, | a bottleneck forms."),
    (14.6, "The harder they try to move, | the less room everyone has."),
    (19.5, "Now watch what happens | when the same crowd | moves more steadily."),
    (29.9, "Under these conditions, | the crowd moving more steadily | can actually get out faster."),
    (38.3, "Scientists call this | the faster-is-slower effect."),
    (43.15, "Follow InvisiTech | for more."),
]
SPEED = 1.22
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
v = np.zeros(int(TOTAL * SR)); caps = []; srt = []; prev_end = 0
def trim(a, thr=0.012):
    i = np.where(np.abs(a) > thr)[0]; return a[max(0, i[0] - 240): min(len(a), i[-1] + 480)]
for t0, text, *sp in LINES:
    a, sr = k.create(text.replace(" | ", " ").replace("50,000", "fifty thousand"), voice="bm_george", speed=sp[0] if sp else SPEED, lang="en-gb"); a = trim(a); d = len(a) / SR
    t0 = max(t0, prev_end + 0.15)   # a line never starts before the previous one ends
    i = int(t0 * SR); v[i:i + len(a)] += a[: len(v) - i]; prev_end = t0 + d
    chunks = [c.strip() for c in text.split("|")]; n = sum(len(c) for c in chunks); c0 = t0
    for c in chunks: c1 = c0 + d * len(c) / n; caps.append([round(c0, 2), round(c1, 2), c.rstrip(".,")]); c0 = c1
    srt.append((t0, t0 + d, text.replace(" | ", " "))); print(f"{t0:5.2f}-{t0 + d:5.2f}  {text}")
sf.write(HERE / "voice.wav", v, SR); json.dump(caps, open(HERE / "captions.json", "w"))
json.dump([[round(a, 2), round(b, 2), t] for a, b, t in srt], open(HERE / "lines.json", "w"))
ts = lambda x: f"00:00:{int(x):02d},{int(round((x - int(x)) * 1000)):03d}"
open(HERE.parent / "stadium-crowd.en.srt", "w").write("".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(srt, 1)))
