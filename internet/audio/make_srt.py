"""English subtitles (SRT) for the final Part 1 video. 27-28 Nov 2026.
Speech times come from the mix logs (normal-speed timeline). The video was then retimed (pauses played faster), so each
time is mapped onto the delivered file by matching small copies of every frame of the normal-speed video to the delivered one.
Usage: python make_srt.py <normal-speed video> <delivered video> <out.srt>"""
import json, re, subprocess, sys, numpy as np
SRC, DEL, OUT = sys.argv[1:4]; FR = 30; W, H = 24, 42
def frames(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={FR},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    n = len(raw) // (W * H); return np.frombuffer(raw, dtype=np.uint8)[:n * W * H].reshape(n, W * H).astype(np.float32)
A, B = frames(SRC), frames(DEL); print('frames', len(A), len(B))
# expected position of each delivered frame in the source, from the retime plan
rm = json.load(open('audio/retime-map.json'))['segments']
def exp_src(tout):
    for a, b, o, s in rm:
        if tout < o + (b - a) / s: return a + max(0.0, tout - o) * s
    return rm[-1][1]
f = np.zeros(len(B))
for j in range(len(B)):
    e = int(round(exp_src(j / FR) * FR)); lo, hi = max(0, e - 60), min(len(A), e + 61)
    d = ((A[lo:hi] - B[j]) ** 2).mean(axis=1); f[j] = (lo + int(d.argmin())) / FR
f = np.maximum.accumulate(f)                       # picture only moves forward
k = 5; f = np.convolve(np.pad(f, (k, k), mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='valid')
def to_out(tsrc): return float(np.interp(tsrc, f, np.arange(len(B)) / FR))
# the lines
src = open('voice/make_liam_voice.py').read(); i0 = src.index('L = [') + 4; i1 = src.index('\ndef say'); L = eval(src[i0:i1])
TXT = {n: t for n, t, _ in L}; TXT['liam/hookA'] = None
ent = []
for nme in ['hook', 'wire', 'city', 'part1']: ent += json.load(open(f'audio/voicelog-{nme}.json'))
ent.sort(); cues = []
for a, b, nm in ent:
    key = nm.split('/')[-1]
    if nm == 'liam/hookA': parts = [("Flash a torch at your friend, and you've just built the internet.", 0.58), ("That's all it is: light, blinking on and off.", 0.42)]
    elif key == 'c1p' or nm == 'liam/c1p': parts = [(TXT['c1p'], 1.0)]
    else: parts = [(TXT[key], 1.0)]
    t = a
    for txt, share in parts: cues.append([t, t + (b - a) * share, txt]); t += (b - a) * share
def wrap(txt):
    if len(txt) <= 42: return txt
    mid = len(txt) // 2; sp = [i for i, c in enumerate(txt) if c == ' ']; i = min(sp, key=lambda x: abs(x - mid)); return txt[:i] + '\n' + txt[i + 1:]
ts = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)):03d}".replace(',1000', ',999')
out = []; prev_end = 0.0
for i, (a, b, txt) in enumerate(cues):
    s, e = to_out(a), to_out(b) + 0.12
    if i + 1 < len(cues): e = min(e, to_out(cues[i + 1][0]) - 0.04)
    s = max(s, prev_end + 0.02); e = max(e, s + 0.7); prev_end = e
    out.append(f"{i + 1}\n{ts(s)} --> {ts(e)}\n{wrap(txt)}\n")
open(OUT, 'w').write('\n'.join(out)); print(len(cues), 'cues; last ends', ts(prev_end))
