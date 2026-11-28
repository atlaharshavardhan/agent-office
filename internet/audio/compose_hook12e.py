"""Joins the six hook shots (video/part2hook12), burns word-by-word captions, adds the watermark and the mix: video/internet-part2-hook-v5-free.mp4 (12 s, 9:16).
Voice lines: s1, g1, g2, g3, s4 (ElevenLabs, allowed by Harsh for the hook only). Run after audio/make_hook12_audio.py."""
import json, subprocess, numpy as np
H = 'video/part2hook12e'; P = 'video/part2v1'; FPS = 30
SEG = [('hyd', 90), ('gs', 60), ('sl', 120), ('lon', 30), ('nt', 60)]; TOTAL = sum(f for _, f in SEG) / FPS
logs = [(n, a, b) for n, a, b in json.load(open(f'{H}/voicelog.json'))]
TEXT = {'f1': 'Imagine sending a *photo* to your *girlfriend* in London.', 'f2': "You'd think it travels through a *satellite,*", 'f3': 'but it actually crosses the *ocean* through a cable as *light,*', 'f4': 'in a *fraction* of a second.', 'f5': 'But *how?*'}
rows = [(TEXT[n], a, b) for n, a, b in logs]
cs = lambda x: int(round(x * 100))
def tstr(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
def srt_t(x): m = int(x // 60); s = x % 60; return f'00:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}'
def split(words):
    n = max(1, -(-len(' '.join(words)) // 24))
    if n == 1: return [words]
    out = []; rest = list(words)
    for k in range(n, 0, -1):
        tgt = len(' '.join(rest)) / k; cur = []
        while rest and (not cur or len(' '.join(cur + [rest[0]])) <= tgt + 4 or k == 1): cur.append(rest.pop(0))
        out.append(cur)
    return out
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', '', '[V4+ Styles]', 'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
       'Style: Cap,DejaVu Sans,50,&H00FFFFFF,&H00B9A3A0,&H00220A07,&H96000000,-1,0,0,0,100,100,0,0,1,5,2,2,110,150,470,1', '', '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']; srt = []
for i, (text, a, b) in enumerate(rows):
    words = []; acc = False
    for w in text.split(' '):
        if w.startswith('*'): acc = True
        words.append((w.strip('*'), acc))
        if w.endswith('*'): acc = False
    wl = np.array([max(2, len(w)) for w, _ in words], float); wt = (b - a) * wl / wl.sum(); k = 0; parts = []
    for r in split([w for w, _ in words]):
        sp = []
        for _ in r: w, ac = words[k]; sp.append('{\\k%d%s}%s' % (cs(wt[k]), '\\1c&H54B4FF&' if ac else '\\1c&HFFFFFF&', w)); k += 1
        parts.append(' '.join(sp))
    ass.append(f'Dialogue: 0,{tstr(a - 0.05)},{tstr(b + 0.02)},Cap,,0,0,0,,' + '\\N'.join(parts)); srt.append(f'{i + 1}\n{srt_t(a)} --> {srt_t(b + 0.2)}\n' + ' '.join(w for w, _ in words) + '\n')
open(f'{H}/captions.ass', 'w').write('\n'.join(ass)); open(f'{H}/captions.srt', 'w').write('\n'.join(srt))
cmd = ['ffmpeg', '-v', 'error', '-y']
for n, fr in SEG: cmd += ['-i', f'{H}/{n}.mp4']
cmd += ['-loop', '1', '-framerate', '30', '-t', str(TOTAL), '-i', f'{P}/mark.png', '-i', f'{H}/mix.wav']
parts = [f'[{i}:v]trim=end_frame={fr},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,setsar=1,format=yuv420p[v{i}]' for i, (n, fr) in enumerate(SEG)]
parts += [''.join(f'[v{i}]' for i in range(len(SEG))) + f'concat=n={len(SEG)}:v=1:a=0[cat]', f'[cat]subtitles={H}/captions.ass[cap]', f'[{len(SEG)}:v]format=rgba,colorchannelmixer=aa=0.3[m]', '[cap][m]overlay=x=24:y=926[v]']
cmd += ['-filter_complex', ';'.join(parts), '-map', '[v]', '-map', f'{len(SEG) + 1}:a', '-t', str(TOTAL), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-hook-v5-free.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('total', round(TOTAL, 2), 's; ffmpeg', r.returncode, r.stderr[-300:])
