"""Build video/timeline.json (scene + voice + caption timing) and the sentence-level SRT
from the real voice lengths in voice/lengths.json. Usage: python3 video/timeline.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V = json.load(open(ROOT / "voice/lengths.json"))
LEN = V["trimmed"]
LEAD, GAP, TAIL = 0.55, 0.16, 0.95
# caption sentences per line (display spelling); **x** = highlighted words
CAP = [
    ["In five weeks, NVIDIA’s value fell by **$1.8 trillion.**"],
    ["That’s almost half of India’s yearly economy, **wiped off its share price.**", "How?"],
    ["NVIDIA makes the chips **AI runs on.**", "ChatGPT needs **thousands** of them."],
    ["Every tech giant wanted them, so in October NVIDIA hit a record **$5.8 trillion.**"],
    ["Then, within weeks, **three shocks.**"],
    ["One: US voters passed local rules that could **slow new AI data centres.**"],
    ["Two: NVIDIA invests in AI start-ups, who then buy its chips.", "**Is that real demand?**"],
    ["Three: its CEO, Jensen Huang, **stepped down** amid a board investigation."],
    ["Bubble?", "Sales still **doubled** in a year.", "Investors just fear it won’t last."],
    ["A share price is a bet on the future.", "**The bet flipped, not the business.**"],
    ["Follow InvisiTech for more."],
]
starts, t = [], LEAD
for d in LEN:
    starts.append(round(t, 3))
    t += d + GAP
end = round(starts[-1] + LEN[-1] + TAIL, 3)
scenes = []
for i in range(11):
    s0 = 0.0 if i == 0 else starts[i] - (0.35 if i == 10 else 0.12)
    scenes.append(round(s0, 3))
caps = []
for i, sents in enumerate(CAP):
    w = [len(s.replace("*", "")) + 6 for s in sents]
    a = starts[i]
    for s, wi in zip(sents, w):
        d = LEN[i] * wi / sum(w)
        caps.append({"t0": round(a, 3), "t1": round(a + d, 3), "text": s})
        a += d
json.dump({"voice": starts, "len": LEN, "scenes": scenes, "end": end, "captions": caps},
          open(ROOT / "video/timeline.json", "w"), indent=1)

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
with open(ROOT / "exports/nvidia-2-trillion-short.en.srt", "w") as f:
    for n, c in enumerate(caps, 1):
        f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('**', '')}\n\n")
print("end", end, "scenes", scenes)
