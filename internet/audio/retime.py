"""Tighten the pauses between narration lines (27 Nov 2026, Harsh: "there are pauses, people will not stay that long").
Reads the speech timing logs written by the mix scripts, keeps every spoken stretch at the global speed (1.06),
and plays each pause faster (a 1.3 s pause becomes about 0.65 s, a 3.3 s pause about 1.35 s). Picture and sound are cut at the same
frame boundaries, so they stay in sync. Usage: python retime.py <input 1x video> <output video>"""
import json, subprocess, sys
SRC, DST = sys.argv[1], sys.argv[2]; G = 1.06; FR = 30; TOTAL = 85.7
iv = []
for n in ['hook', 'wire', 'city', 'part1']: iv += json.load(open(f'audio/voicelog-{n}.json'))
iv.sort(); sp = []
for a, b in iv:
    a, b = max(0, a - 0.05), min(TOTAL, b + 0.10)
    if sp and a <= sp[-1][1] + 0.02: sp[-1][1] = max(sp[-1][1], b)
    else: sp.append([a, b])
snap = lambda x: round(x * FR) / FR
segs = []; t = 0.0
for a, b in sp:
    a, b = snap(a), snap(b)
    if a > t + 1e-6:
        g = a - t; keep = g if g <= 0.30 else 0.30 + 0.35 * (g - 0.30); segs.append((t, a, G * g / keep, 'gap'))
    if b > a: segs.append((a, b, G, 'speech'))
    t = b
if TOTAL > t + 1e-6: segs.append((t, TOTAL, G, 'end'))
out_len = sum((b - a) / s for a, b, s, _ in segs); print(len(segs), 'segments; output', round(out_len, 2), 's; gaps sped up:', round(sum(b - a for a, b, s, k in segs if k == 'gap'), 1), 's of pause')
def atempo(s):
    f = []
    while s > 2.0: f.append('atempo=2.0'); s /= 2.0
    while s < 0.5: f.append('atempo=0.5'); s /= 0.5
    f.append(f'atempo={s:.5f}'); return ','.join(f)
parts = []; cat = ''
for i, (a, b, s, k) in enumerate(segs):
    parts.append(f"[0:v]trim=start={a:.4f}:end={b:.4f},setpts=(PTS-STARTPTS)/{s:.5f}[v{i}]")
    parts.append(f"[0:a]atrim=start={a:.4f}:end={b:.4f},asetpts=PTS-STARTPTS,{atempo(s)}[a{i}]"); cat += f'[v{i}][a{i}]'
parts.append(f"{cat}concat=n={len(segs)}:v=1:a=1[vo][ao];[vo]fps={FR}[v]")
open('/tmp/claude-0/-home-user-agent-office/ad993508-6fe0-5847-85fd-460f40c2742c/scratchpad/retime.txt', 'w').write(';\n'.join(parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-filter_complex_script', '/tmp/claude-0/-home-user-agent-office/ad993508-6fe0-5847-85fd-460f40c2742c/scratchpad/retime.txt', '-map', '[v]', '-map', '[ao]', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', DST], check=True)
print('ok')
