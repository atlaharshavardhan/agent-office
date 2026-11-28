"""Joins the Part 2 picture pieces, burns the captions, adds the watermark (horizontal, 30% see-through, middle left, not on the end card) and the mix. Run from internet/ after make_part2_final.py."""
import subprocess
V = 'video/part2v1'
segs = [('hyd', f'{V}/hyd.mp4', None), ('lon', f'{V}/lon.mp4', None), ('hook', f'{V}/hook.mp4', None), ('pk', f'{V}/pk.mp4', None), ('ug', 'part2/clips/03-UndergroundV.mp4', 4.0), ('rt', f'{V}/rt.mp4', None), ('sh', 'part2/clips/05-ShoreV.mp4', 3.2),
        ('sb', f'{V}/sb.mp4', None), ('rp', f'{V}/rp.mp4', None), ('pl', f'{V}/pl.mp4', None), ('nt', f'{V}/nt.mp4', None), ('ec', f'{V}/ec.mp4', None)]
frames = {'hyd': 114, 'lon': 132, 'hook': 72, 'pk': 150, 'ug': 120, 'rt': 120, 'sh': 96, 'sb': 90, 'rp': 72, 'pl': 132, 'nt': 90, 'ec': 108}
TOTAL = sum(frames.values()) / 30
cmd = ['ffmpeg', '-v', 'error', '-y']
for n, f, t in segs: cmd += (['-t', str(t)] if t else []) + ['-i', f]
cmd += ['-loop', '1', '-framerate', '30', '-t', str(TOTAL), '-i', f'{V}/mark.png', '-i', f'{V}/mix.wav']
parts = [f'[{i}:v]trim=end_frame={frames[n]},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,setsar=1,format=yuv420p[v{i}]' for i, (n, f, t) in enumerate(segs)]
parts += [''.join(f'[v{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[cat]', f'[cat]subtitles={V}/captions.ass[cap]', f'[{len(segs)}:v]format=rgba,colorchannelmixer=aa=0.3[m]', f"[cap][m]overlay=x=24:y=926:enable='lt(t,{TOTAL - 3.6})'[v]"]
cmd += ['-filter_complex', ';'.join(parts), '-map', '[v]', '-map', f'{len(segs) + 1}:a', '-t', str(TOTAL), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-v1.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print(r.returncode, r.stderr[-400:])
