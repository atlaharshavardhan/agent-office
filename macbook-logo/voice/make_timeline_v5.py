"""V5 (Harsh, 17 Nov 2026): fixed scene grid from the brief, each Chris line placed at a set time inside its scene.
Writes chris_v5/voice.wav, timeline.json (B = scene cuts), captions.json and ../macbook-logo-glow-v5.en.srt."""
import json, numpy as np, soundfile as sf
from pathlib import Path
ROOT = Path(__file__).parent; HERE = ROOT / 'chris_v5'; SR = 24000
B = [0, 2, 5, 7, 11, 16.3, 23, 28, 31, 34, 36]        # V5.1 (Harsh): long pauses removed, 36 s; 1 hook · 2 no backlight · 3 into the lid · 4 teardown · 5 LEDs · 6 bounce/spread/shine · 7 reassembly · 8 auto brightness · 9 switch off + loop · 10 brand
AT = {'l1_1': 0.15, 'l2_1': 1.75, 'l2_2': 3.5, 'l3_1': 5.1, 'l4_1': 6.95, 'l5_1': 11.2, 'l5_2': 14.5,
      'l6_1': 16.5, 'l6_2': 18.8, 'l6_3': 20.8, 'l7_1': 23.2, 'l8_1': 28.05, 'l9_1': 31.05}
S = json.load(open(HERE / 'sentences.json'))
def trim(a, thr=0.012):
    i = np.where(np.abs(a) > thr)[0]; return a[max(0, i[0] - 240): min(len(a), i[-1] + 480)]
out = np.zeros(int(B[-1] * SR)); caps, sents, end = [], [], 0
for s in S:
    a, sr = sf.read(HERE / s['file']); assert sr == SR; a = trim(a); t = AT[s['file'][:-4]]; assert t >= end - 1e-6, (s['file'], t, end)
    n0 = int(round(t * SR)); out[n0:n0 + len(a)] += a; d = len(a) / SR; end = t + d
    ch = [c.strip() for c in s['text'].split('|')]; n = sum(len(c) for c in ch); c0 = t
    for c in ch: c1 = c0 + d * len(c) / n; caps.append([round(c0, 2), round(c1, 2), c.rstrip('.,')]); c0 = c1
    sents.append([round(t, 2), round(end, 2), s['text'].replace(' | ', ' ')]); print(s['file'], round(t, 2), '->', round(end, 2))
sf.write(HERE / 'voice.wav', out, SR)
json.dump({'B': B, 'total': B[-1], 'outro': 2.0, 'voice': 'chris_v5'}, open(HERE / 'timeline.json', 'w'))
json.dump(caps, open(HERE / 'captions.json', 'w'))
def ts(x): m, s = int(x // 60), x % 60; return f"00:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
open(ROOT.parent / 'macbook-logo-glow-v5.en.srt', 'w').write(''.join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(sents, 1)))
