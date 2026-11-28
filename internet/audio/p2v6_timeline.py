"""Part 2 v6 master timeline. Times are in seconds, relative to the start of the narration (NA = end of the hook).
Writes v3/src/v4/p2v6-timeline.ts (read by the Remotion composition Part2V6) and the symlinked clips in v3/public/p2v6/."""
import json, os
NA = 11.88; HOOK = 12.0; FADE = 0.12
LEN = {k: v['len'] for k, v in json.load(open('voice/p2v6/timing.json')).items()}; LEN['n9'] = 3.35
START = {'n1': 0.0, 'n2': 10.9, 'n3': 23.13, 'n4': 32.14, 'n5': 44.91, 'n6': 57.3, 'n7': 67.27, 'n8': 77.89, 'n9': 95.15, 'n10': 98.8}
# clip, file (folder, name, first source second in file), src from/to (seconds of the original clip), master at/end
R, R6 = 'rf', 'rf6'
SEG = [
 ('s1',  R, 's1', 0,   0.15, 3.53, 0.0,   2.9),
 ('b2',  R, 'b2', 0,   0.0,  1.97, 2.9,   5.0),
 ('s5',  R, 's5', 0,   0.0,  1.93, 5.0,   7.5),
 ('s6',  R6, 's6', 0,   0.0,  2.37, 7.5,   10.9),
 ('pa',  R, 'pa', 0,   0.0,  8.67, 10.9,  22.0),
 ('tw1', R6, 'tw1', 0,  0.0,  5.1,  22.0,  26.7),
 ('ug',  R6, 'ug', 0.6, 0.6, 8.7,  26.7,  32.14),
 ('rt',  R6, 'rt', 0,  0.0,  11.95, 32.14, 40.0),
 ('sh',  R6, 'sh', 0.8, 0.8, 8.7,  40.0,  44.9),
 ('cb',  R, 'cb', 0,   0.2,  15.0, 44.9,  57.25),
 ('sbb', R6, 'sbb', 3.0, 3.0, 7.2, 57.25, 60.4),
 ('rp',  R, 'rp', 0,   0.0,  7.5,  60.4,  67.25),
 ('gc',  R6, 'gc', 0,  0.0,  10.6, 67.25, 77.85),
 ('tw',  R6, 'tw', 0,   0.0,  4.3,  77.85, 81.4),
 ('nt',  R, 'nt', 0,   0.3,  2.6,  81.4,  83.4),
 ('ar',  R6, 'ar', 0,  0.0,  7.9,  83.4,  92.0),
 ('ar2', R6, 'ar', 0,  7.9,  13.3, 92.0,  98.7),
 ('en',  R, 'en', 0,   0.0,  3.8,  98.6,  102.4),
]
os.makedirs('v3/public/p2v6', exist_ok=True)
segs = []
for i, (cid, folder, name, off, a, b, at, end) in enumerate(SEG):
    link = f'v3/public/p2v6/{name}.mp4'
    if not os.path.lexists(link): os.symlink(os.path.abspath(f'video/{folder}/{name}.mp4'), link)
    segs.append(dict(id=cid, folder=folder, file=f'p2v6/{name}.mp4', off=off, a=a, b=b, at=at, end=end, speed=round((b - a) / (end - at), 4), fade=not cid.endswith('2') or cid == 'en'))
TOTAL = NA + SEG[-1][7]
out = dict(NA=NA, HOOK=HOOK, FADE=FADE, TOTAL=round(TOTAL, 3), START=START, LEN=LEN, SEG=segs)
open('v3/src/v4/p2v6-timeline.ts', 'w').write('export default ' + json.dumps(out, indent=1) + ' as const;\n')
json.dump(out, open('video/rf6/timeline.json', 'w'), indent=1)
for s in segs: print(s['id'], 'speed', s['speed'])
print('total', round(TOTAL, 2), 'narration ends', round(NA + START['n10'] + LEN['n10'], 2))
