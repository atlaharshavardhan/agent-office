"""Join the sentence WAVs into voice.wav with short breaths, and write the scene cuts (timeline.json),
caption chunks (captions.json) and a sentence-level English SRT.
Chunks are timed inside each sentence by their share of letters (after trimming the silence)."""
import json, numpy as np, soundfile as sf
from pathlib import Path
import sys
ROOT = Path(__file__).parent
WHO = sys.argv[1] if len(sys.argv) > 1 else "george"
HERE = ROOT / WHO if WHO != "michael" else ROOT   # sentence WAVs + outputs for this voice
S = json.load(open(HERE / "sentences.json"))
SR = 24000
START, IN_LINE, BETWEEN, TAIL, OUTRO = 0.6, 0.12, 0.38, 1.5, 2.0
if WHO in ('george40', 'chris40'): START, IN_LINE, BETWEEN, TAIL = 0.45, 0.08, 0.26, 0.73   # V4 (Harsh): ~40 s; lines 2% faster (atempo, same pitch), tighter breaths, shorter zoom-out   # TAIL: hold after the last line; OUTRO: the 2-second branding card   # voice starts over the music; breath inside a line; gap at a scene cut; end-card hold
if WHO == 'chris40': START, IN_LINE, BETWEEN = 0.6, 0.24, 0.5   # Chris (ElevenLabs, speed 0.9) speaks faster than George: wider breaths, TAIL fills the main part to 38.00 s (40.00 with the card)
def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]; s, e = max(0, idx[0] - 240), min(len(a), idx[-1] + 480); return a[s:e]
t, parts, caps, sents, starts, B = START, [np.zeros(int(START * SR))], [], [], [], [0.0]
prev = None
for s in S:
    a, sr = sf.read(HERE / s["file"]); assert sr == SR; a = trim(a)
    if prev is not None:
        gap = IN_LINE if s["line"] == prev else BETWEEN
        if s["line"] != prev: B.append(round(t + gap / 2, 2))
        parts.append(np.zeros(int(gap * SR))); t += gap
    if s["line"] != prev: starts.append(round(t, 2))
    d = len(a) / SR; chunks = [c.strip() for c in s["text"].split("|")]; n = sum(len(c) for c in chunks); c0 = t
    for c in chunks:
        c1 = c0 + d * len(c) / n; caps.append([round(c0, 2), round(c1, 2), c.rstrip(".,")]); c0 = c1
    sents.append([round(t, 2), round(t + d, 2), s["text"].replace(" | ", " ")])
    parts.append(a); t += d; prev = s["line"]
if WHO == 'chris40': TAIL = round(38.0 - t, 3)
main = round(t + TAIL, 2); total = round(main + OUTRO, 2); B += [main, total]
v = np.concatenate(parts + [np.zeros(int((TAIL + OUTRO) * SR))])
sf.write(HERE / "voice.wav", v, SR)
json.dump({"B": B, "starts": starts, "total": total, "outro": OUTRO, "voice": WHO}, open(HERE / "timeline.json", "w"))
json.dump(caps, open(HERE / "captions.json", "w"))
def ts(x): h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60; return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
srt = "".join(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n" for i, (a, b, txt) in enumerate(sents, 1))
open(ROOT.parent / "macbook-logo-glow.en.srt", "w").write(srt)
print("B", B); print("starts", starts); print("total", total, "voice ends", round(t, 2))
