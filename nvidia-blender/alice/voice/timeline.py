"""Alice Short timeline: place sentences, derive scene cuts, write remotion/src/alice/timeline.json + SRT."""
import json
from pathlib import Path
HERE = Path(__file__).parent; ROOT = HERE.parent.parent
S = json.load(open(HERE / "sentences.json"))
t, prev = 0.15, None
for s in S:
    if prev is not None:
        t += 0.18 if s["scene"] == prev else 0.32
    s["t0"] = round(t, 3); t += s["dur"]; s["t1"] = round(t, 3); prev = s["scene"]
first = {}
for s in S: first.setdefault(s["scene"], s["t0"])
cuts = [0.0] + [round(first[k] - 0.12, 3) for k in range(2, 11)]
outro = cuts[-1]
end = round(outro + 2.0, 3)
tl = {"fps": 30, "end": end, "frames": int(round(end * 30)), "scenes": cuts,
      "sentences": [{k: s[k] for k in ("scene", "say", "t0", "t1")} for s in S]}
json.dump(tl, open(ROOT / "remotion/src/alice/timeline.json", "w"), indent=1)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s_, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s_:02d},{ms:03d}"
rep = {"A.I.": "AI", "C.E.O.": "CEO", "four point six billion dollars": "$4.6 billion", "Nvidia": "NVIDIA", "twelfth": "12", "Invisi Tech": "InvisiTech"}
with open(ROOT / "alice/alice-huang-nvidia.en.srt", "w") as f:
    for n, s in enumerate(S, 1):
        txt = s["say"]
        for a, b in rep.items(): txt = txt.replace(a, b)
        f.write(f"{n}\n{ts(s['t0'])} --> {ts(s['t1'])}\n{txt}\n\n")
print("end", end, "frames", tl["frames"]); print("cuts", cuts)
