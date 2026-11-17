"""Stadium crowd Short narration: George (free Kokoro bm_george, en-gb, 1.18). Each line starts at its scene's time
(scenes are fixed by the brief), so the voice is timed to the picture. Writes voice.wav (45 s), captions.json, ../stadium-crowd.en.srt.
  python make_voice.py <kokoro models dir>"""
import json, sys, numpy as np, soundfile as sf
from pathlib import Path
from kokoro_onnx import Kokoro
M = Path(sys.argv[1]); HERE = Path(__file__).parent; SR = 24000; TOTAL = 45.0
LINES = [  # (earliest start s, sentence with caption chunks split by |). Lines marked * were added by Claude to keep the narration continuous (rule 18).
    (0.35, "What happens when thousands of people | panic at the same time?"),
    (3.86, "Some people | react immediately."),
    (5.97, "Others wait, | watching everyone around them."),
    (8.9, "When information is unclear, | people often look to others for clues."),
    (12.9, "One person's reaction | can influence the people nearby."),
    (16.3, "And that reaction | can ripple through the crowd."),          # *
    (20.3, "Uncertainty. | No one knows what is happening."),          # * (concept 1)
    (23.6, "Social influence. | We copy the people around us."),        # * (concept 2)
    (26.7, "And stress. | So almost everyone | heads for the one exit they know."),   # * changed for the simulation (familiar-exit effect)
    (30.4, "Fix one: | a slanted barrier | in front of the door."),        # * obstacle effect (reference reel)
    (33.5, "In simulations, | it splits the push, | and the door stops clogging."),   # * (Helbing et al. 2000: simulated, not proven for real stadiums)
    (36.6, "Fix two: | clear announcements | send people to every exit."),   # * communication (the brief's message)
    (40.0, "Smarter exits, | calmer crowds."),                            # *
    (43.15, "Follow InvisiTech | for more."),
]
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
v = np.zeros(int(TOTAL * SR)); caps = []; srt = []; prev_end = 0
def trim(a, thr=0.012):
    i = np.where(np.abs(a) > thr)[0]; return a[max(0, i[0] - 240): min(len(a), i[-1] + 480)]
for t0, text in LINES:
    a, sr = k.create(text.replace(" | ", " "), voice="bm_george", speed=1.18, lang="en-gb"); a = trim(a); d = len(a) / SR
    t0 = max(t0, prev_end + 0.15)   # a line never starts before the previous one ends
    i = int(t0 * SR); v[i:i + len(a)] += a[: len(v) - i]; prev_end = t0 + d
    chunks = [c.strip() for c in text.split("|")]; n = sum(len(c) for c in chunks); c0 = t0
    for c in chunks: c1 = c0 + d * len(c) / n; caps.append([round(c0, 2), round(c1, 2), c.rstrip(".,")]); c0 = c1
    srt.append((t0, t0 + d, text.replace(" | ", " "))); print(f"{t0:5.2f}-{t0 + d:5.2f}  {text}")
sf.write(HERE / "voice.wav", v, SR); json.dump(caps, open(HERE / "captions.json", "w"))
json.dump([[round(a, 2), round(b, 2), t] for a, b, t in srt], open(HERE / "lines.json", "w"))
ts = lambda x: f"00:00:{int(x):02d},{int(round((x - int(x)) * 1000)):03d}"
open(HERE.parent / "stadium-crowd.en.srt", "w").write("".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(srt, 1)))
