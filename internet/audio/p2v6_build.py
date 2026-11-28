"""Part 2 v6: assemble the video with ffmpeg from the same timeline the Remotion preview uses (no Remotion video decoding, so no rolled frames).
Usage: python audio/p2v6_build.py <out.mp4> [scale 0-1, default 1] [crf, default 17]"""
import json, subprocess, sys, os
out = sys.argv[1]; SC = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0; CRF = sys.argv[3] if len(sys.argv) > 3 else '17'
T = json.load(open('video/rf6/timeline.json')); NA, FADE, FPS = T['NA'], T['FADE'], 30
W, H = int(round(1080 * SC / 2) * 2), int(round(1920 * SC / 2) * 2)
tmp = 'video/rf6/seg'; os.makedirs(tmp, exist_ok=True)
# 1. merge the two 'ar' pieces (speed change inside one scene, no dissolve between them)
segs = []; i = 0; S = T['SEG']
while i < len(S):
    s = S[i]
    if s['id'] == 'ar': segs.append(dict(id='ar', parts=[S[i], S[i + 1]], at=s['at'], end=S[i + 1]['end'], fade=True)); i += 2
    else: segs.append(dict(id=s['id'], parts=[s], at=s['at'], end=s['end'], fade=s['fade'])); i += 1
# 2. cut each scene to its exact length (sped up or slowed down) as its own small file
files = []
for k, g in enumerate(segs):
    nxt = segs[k + 1]['at'] if k + 1 < len(segs) else g['end']
    dur = nxt - g['at'] + (FADE if k + 1 < len(segs) else 0); nfr = round(dur * FPS)
    ins = []; fc = ''; labels = ''
    for q, p in enumerate(g['parts']):
        ins += ['-i', f"video/{p['folder']}/{os.path.basename(p['file'])}"]
        fc += f"[{q}:v]trim=start={p['a'] - p['off']:.4f}:end={p['b'] - p['off'] + 0.5:.4f},setpts=(PTS-STARTPTS)/{p['speed']:.5f},fps={FPS},"
        pd = (p['end'] - p['at'])
        fc += f"trim=end={pd:.4f}[v{q}];" if len(g['parts']) > 1 else f"tpad=stop_mode=clone:stop_duration=2,trim=end={dur:.4f},setpts=PTS-STARTPTS[v{q}];"
        labels += f'[v{q}]'
    if len(g['parts']) > 1: fc += f"{labels}concat=n={len(g['parts'])}:v=1:a=0,tpad=stop_mode=clone:stop_duration=2,trim=end={dur:.4f},setpts=PTS-STARTPTS[o];"
    else: fc = fc.replace('[v0]', '[o]')
    fc += f'[o]scale={W}:{H},format=yuv420p[z]'
    f = f"{tmp}/{k:02d}-{g['id']}.mp4"
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc, '-map', '[z]', '-frames:v', str(nfr), '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-r', str(FPS), f], capture_output=True, text=True)
    if r.returncode: print('FAIL', g['id'], r.stderr[-400:]); sys.exit(1)
    files.append((f, g))
# 3. hook + scenes, 0.12 s dissolves, watermark, sound
ins = ['-i', 'video/internet-part2-hook-v11.mp4'] + sum([['-i', f] for f, g in files], []) + ['-i', 'video/part2v1/mark.png', '-i', 'v3/public/p2v6/audio.wav']
n = len(files); fc = f'[0:v]scale={W}:{H},format=yuv420p[h];'; prev = '[h]'
for k, (f, g) in enumerate(files):
    fc += f"{prev}[{k + 1}:v]xfade=transition=fade:duration={FADE}:offset={NA + g['at']:.3f}[x{k}];"; prev = f'[x{k}]'
fc += f"[{n + 1}:v]format=rgba,colorchannelmixer=aa=0.3,scale={int(420 * SC)}:-1[wm];{prev}[wm]overlay={int(24 * SC)}:{int(926 * SC)}:enable='gte(t,{NA})'[v];"
fc += f"[0:a]apad[ha];[ha][{n + 2}:a]amix=inputs=2:normalize=0:duration=longest[a]"
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f"{T['TOTAL']:.3f}", '-c:v', 'libx264', '-crf', CRF, '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]
r = subprocess.run(cmd, capture_output=True, text=True); print('final', r.returncode, r.stderr[-500:])
