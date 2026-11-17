"""Exit paradox Short narration: George (free Kokoro bm_george, en-gb). Every number is read from the simulation
results (assets/runs-summary.json), so the voice always matches the counters on screen.
Writes voice.wav (45 s), captions.json, lines.json and ../pillar.en.srt.   python make_voice.py <kokoro models dir>"""
import json, sys, numpy as np, soundfile as sf
from pathlib import Path
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); HERE = Path(__file__).parent; SR = 24000; TOTAL = 45.0
R = json.load(open(HERE.parent / "assets" / "runs-summary.json"))["runs"]
n60 = {k: sum(1 for t in r["exitT"] if t < 60) for k, r in R.items()}
def spoken(sec):   # 158.5 -> "two minutes thirty-eight"
    W = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
    T = {2: "twenty", 3: "thirty", 4: "forty", 5: "fifty"}; m, s = int(sec // 60), int(sec % 60)
    ss = W[s] if s < 20 else T[s // 10] + ("" if s % 10 == 0 else "-" + W[s % 10])
    return f"{W[m]} minute{'s' if m != 1 else ''} {ss}"
LINES = [  # (earliest start s, sentence with caption chunks split by |, optional speed) — each line says what changed and why the crowd reacts
    (0.3, "Can blocking an exit | get more people out?", 1.25),
    (3.7, f"In a panic, | the crowd locks into an arch | at the door. | Only {n60['none']} get out."),
    (8.8, f"Add a V-shaped splitter. | It cuts the crowd into two streams, | and {n60['best']} get out. | Nearly double."),
    (14.8, f"Too close, | and the gap pinches shut. | The splitter becomes the bottleneck. | Just {n60['close']}."),
    (20.3, "Too far back, | and the streams merge again | before the door. | It barely helps."),
    (25.8, "Make it flat, | and the crowd hits it head-on. | No better than nothing."),
    (31.3, f"Angle it at forty-five degrees, | one metre from the door, | and everyone is out in {spoken(R['best']['total'])}, | instead of {spoken(R['none']['total'])}."),
    (38.3, "This is the exit paradox. | The right obstacle | speeds up the exit."),
    (43.15, "Follow InvisiTech | for more."),
]
SPEED = 1.22
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
v = np.zeros(int(TOTAL * SR)); caps = []; srt = []; prev_end = 0
def trim(a, thr=0.012):
    i = np.where(np.abs(a) > thr)[0]; return a[max(0, i[0] - 240): min(len(a), i[-1] + 480)]
for t0, text, *sp in LINES:
    a, sr = k.create(text.replace(" | ", " "), voice="bm_george", speed=sp[0] if sp else SPEED, lang="en-gb"); a = trim(a); d = len(a) / SR
    t0 = max(t0, prev_end + 0.15)   # a line never starts before the previous one ends
    i = int(t0 * SR); v[i:i + len(a)] += a[: len(v) - i]; prev_end = t0 + d
    chunks = [c.strip() for c in text.split("|")]; n = sum(len(c) for c in chunks); c0 = t0
    for c in chunks: c1 = c0 + d * len(c) / n; caps.append([round(c0, 2), round(c1, 2), c.rstrip(".,")]); c0 = c1
    srt.append((t0, t0 + d, text.replace(" | ", " "))); print(f"{t0:5.2f}-{t0 + d:5.2f}  {text}")
sf.write(HERE / "voice.wav", v, SR); json.dump(caps, open(HERE / "captions.json", "w"))
json.dump([[round(a, 2), round(b, 2), t] for a, b, t in srt], open(HERE / "lines.json", "w"))
ts = lambda x: f"00:00:{int(x):02d},{int(round((x - int(x)) * 1000)):03d}"
open(HERE.parent / "pillar.en.srt", "w").write("".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(srt, 1)))
