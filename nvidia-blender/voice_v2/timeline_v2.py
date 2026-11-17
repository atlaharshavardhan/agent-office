"""v2 timeline: reuses the verified v1 narration (voice_v1/s_XX.wav), same sentence placement,
plus v2-only beats (cut into the data center, network) and on-screen text. Writes
remotion/src/v2/timeline_v2.json and exports/nvidia-market-collapse-v2.en.srt. 45.000 s / 1350 frames."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
v1 = json.load(open(ROOT / "remotion/src/timeline.json"))
S = v1["sentences"]
b = dict(v1["beats"])
b["dc"] = round(S[4]["t0"] - 0.1, 3)        # "NVIDIA makes about 8 in 10 AI chips" -> through the chip
b["network"] = round(S[6]["t0"] - 0.1, 3)   # "NVIDIA sits at the center"
tl = {"fps": 30, "frames": 1350, "end": 45.0, "scenes": v1["scenes"], "beats": b,
      "headline": ["$2 TRILLION", "GONE"],
      "compare": {"loss": 2.0, "value": 1.59, "name": "Meta"},
      "capex": {"big": "$700B+", "sub": "Big Tech’s planned AI spending this year (est.)"},
      "reason1": {"sub": "Local voters push back on new AI data centers", "stat": "40 of 41", "label": "local votes backed limits"},
      "reason3": {"sub": "Amid a board investigation", "kicker": "NOV 12 · REPORTED BY MULTIPLE OUTLETS",
                  "headline": "Jensen Huang steps down as NVIDIA CEO"},
      "sales": "Latest quarter: $96.2B revenue, +106%",
      "sentences": S}
json.dump(tl, open(ROOT / "remotion/src/v2/timeline_v2.json", "w"), indent=1)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s_, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s_:02d},{ms:03d}"
with open(ROOT / "exports/nvidia-market-collapse-v2.en.srt", "w") as f:
    for n, s in enumerate(S, 1):
        f.write(f"{n}\n{ts(s['t0'])} --> {ts(s['t1'])}\n{s['cap'].replace('**', '')}\n\n")
print(tl["scenes"], b)
