"""Narration for the AirPods case Short: Michael (Kokoro am_michael, speed 1.12), one WAV per line.
Then the scene timeline (timeline.json: B = scene boundaries, starts = when each line begins) and captions.json.
usage: python3 make_voice.py <dir with kokoro-v1.0.onnx and voices-v1.0.bin>"""
import sys, json, re, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__)); M = sys.argv[1]; SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.12; FILM, TITLE = (float(sys.argv[3]) if len(sys.argv) > 3 else 43.0), 2.0
k = Kokoro(os.path.join(M, 'kokoro-v1.0.onnx'), os.path.join(M, 'voices-v1.0.bin'))
lines = [l.strip() for l in open(os.path.join(here, 'lines.txt'), encoding='utf-8') if l.strip()]
LEAD, TAIL, END_TAIL = 0.1, 0.2, 0.3     # V2: 43.0 s of film, then a 2.0 s title card = 45.0 s
B, starts, caps, t = [0], [], [], 0.12
for i, line in enumerate(lines):
    wav, sr = k.create(line, voice='am_michael', speed=SPEED, lang='en-us')
    nz = np.where(np.abs(wav) > 0.01)[0]; wav = wav[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.05 * sr)]   # trim silence
    sf.write(os.path.join(here, f'line{i + 1}.wav'), wav, sr); dur = len(wav) / sr
    st = t + LEAD; starts.append(round(st, 2))
    # captions: short chunks, timed by letter count (pauses at punctuation weigh extra)
    words = line.split(); chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 4 or re.search(r'[.,?!]$', w): chunks.append(' '.join(cur)); cur = []
    if cur: chunks.append(' '.join(cur))
    wt = [len(c) + (8 if re.search(r'[.?!]$', c) else 4 if c.endswith(',') else 0) for c in chunks]; tot = sum(wt); a = st
    for c, w in zip(chunks, wt):
        b = a + dur * w / tot; caps.append([round(a, 2), round(b - 0.04, 2), re.sub(r'[.,]$', '', c)]); a = b
    t = st + dur + (END_TAIL if i == len(lines) - 1 else TAIL); B.append(round(t, 2))
    print(i + 1, round(dur, 2), line[:50])
print('film ends', B[-1]); gap = FILM - B[-1]; assert -0.05 < gap < 1.2, gap   # spread the small remainder over the gaps between lines
shift = [gap * i / (len(lines)) for i in range(len(lines) + 1)]
B = [round(b + shift[i], 2) for i, b in enumerate(B)]; B[-1] = FILM; starts = [round(x + shift[i], 2) for i, x in enumerate(starts)]
for c in caps:
    i = max(j for j in range(len(starts)) if starts[j] - shift[j] <= c[0] + 0.01); c[0] = round(c[0] + shift[i], 2); c[1] = round(c[1] + shift[i], 2)
B.append(FILM + TITLE)
json.dump({'B': B, 'starts': starts, 'voice': 'am_michael', 'speed': SPEED}, open(os.path.join(here, 'timeline.json'), 'w'))
json.dump(caps, open(os.path.join(here, 'captions.json'), 'w'), ensure_ascii=False)
print('B', B)
