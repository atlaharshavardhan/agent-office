"""v1 timeline: places each narration sentence, derives scene cuts (8 scenes, exactly 45.000 s,
1350 frames @ 30 fps), sentence-level captions and the SRT. Writes remotion/src/timeline.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S = json.load(open(ROOT / "voice_v1/sentences.json"))
FPS, TOTAL = 30, 45.0
LEAD, GAP_IN, GAP_LINE = 0.35, 0.18, 0.32
EXTRA = {5: 1.3, 7: 0.25, 13: 0.9}   # breath before "This year" (lets the data-centre shot play), after "three shocks", after "Down 35%"
t, prev = LEAD, None
for i, s in enumerate(S):
    if prev is not None:
        t += GAP_IN if s["line"] == prev else GAP_LINE
    t += EXTRA.get(i, 0)
    if s["line"] == 8:
        t = 43.25                  # branding line inside the 2 s outro
    s["t0"], s["t1"] = round(t, 3), round(t + s["dur"], 3)
    t = s["t1"]; prev = s["line"]
first = {}
for s in S:
    first.setdefault(s["line"], s["t0"])
scenes = [0.0] + [round(first[l] - 0.15, 3) for l in range(2, 8)] + [43.0]
assert all(a < b for a, b in zip(scenes, scenes[1:])), scenes
assert S[-2]["t1"] < 43.0, "story narration must end before the outro"
# sub-beats inside scene 5 (the three reasons) and scene 2/7
beats = {"reasons": [round(S[i]["t0"] - 0.1, 3) for i in (8, 9, 10)], "cash": S[2]["t0"], "question": S[14]["t0"],
         "down35": S[12]["t0"]}
tl = {"fps": FPS, "frames": int(TOTAL * FPS), "end": TOTAL, "scenes": scenes, "beats": beats,
      "sentences": [{k: s[k] for k in ("line", "cap", "t0", "t1")} for s in S]}
json.dump(tl, open(ROOT / "remotion/src/timeline.json", "w"), indent=1)

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s_, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s_:02d},{ms:03d}"
with open(ROOT / "exports/nvidia-market-collapse-v1.en.srt", "w") as f:
    for n, s in enumerate(S, 1):
        f.write(f"{n}\n{ts(s['t0'])} --> {ts(s['t1'])}\n{s['cap'].replace('**', '')}\n\n")
print("scenes", scenes); print("beats", beats); print("last story line ends", S[-2]["t1"])
